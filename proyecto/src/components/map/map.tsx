'use client'

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card'
import { MAP_JSON } from './constants'
import { useIsMobile } from '@/hooks/use-mobile'
import { useSidebar } from '@/components/ui/sidebar'
import { ProvincePanel } from './ProvincePanel'
import { statsApi, TopLocalityResponse } from '@/lib/api/stats.api'

const COLOR_PROVINCIA = '#0d9488'
const COLOR_SIN_DATOS = '#e5e7eb'
const COLOR_HOVER = '#096A63'
const COLOR_HOVER_SIN_DATOS = '#B7BBC2'
const STROKE_COLOR = '#64748b'
const STROKE_WIDTH = 1.2

interface MapProps {
  registrosPorProvincia?: Record<string, number>
}

interface TooltipData {
  provinceName: string
  registros: number
  hasData: boolean
  porcentaje: number
  ranking: number
  totalProvincias: number
  x: number
  y: number
}

type GeographyType = {
  rsmKey: string
  properties?: { NAME?: string }
  [key: string]: unknown
}

export default function Map({ registrosPorProvincia = {} }: MapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [panelData, setPanelData] = useState<{
    totalObservations: number | null
    totalSpecies: number | null
    totalGenera: number | null
    fieldTrips: number | null
    percentageOfCountry: number | null
    ranking: number | null
    totalProvinces: number | null
    topSpecies: Array<{ species: string; count: number }>
    topLocalities: TopLocalityResponse[]
    lastUpdated: string | null
  }>({
    totalObservations: null,
    totalSpecies: null,
    totalGenera: null,
    fieldTrips: null,
    percentageOfCountry: null,
    ranking: null,
    totalProvinces: null,
    topSpecies: [],
    topLocalities: [],
    lastUpdated: null,
  })

  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const pendingCoordsRef = useRef<{ x: number; y: number } | null>(null)

  const numberFormatter = useMemo(() => new Intl.NumberFormat('es-AR'), [])

  const isMobile = useIsMobile()
  const { state } = useSidebar()
  const sidebarCollapsed = state === 'collapsed'

  const { totalRegistros, provinciasOrdenadas } = useMemo(() => {
    const total = Object.values(registrosPorProvincia).reduce((sum, count) => sum + count, 0)
    const ordenadas = Object.entries(registrosPorProvincia)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .filter((p) => p.count > 0)
    return { totalRegistros: total, provinciasOrdenadas: ordenadas }
  }, [registrosPorProvincia])

  const getRegistros = useCallback(
    (provinceName: string) => registrosPorProvincia[provinceName] || 0,
    [registrosPorProvincia],
  )

  const getRanking = useCallback(
    (provinceName: string) => {
      const idx = provinciasOrdenadas.findIndex((p) => p.name === provinceName)
      return idx >= 0 ? idx + 1 : 0
    },
    [provinciasOrdenadas],
  )

  const getPorcentaje = useCallback(
    (count: number) => (totalRegistros === 0 ? 0 : (count / totalRegistros) * 100),
    [totalRegistros],
  )

  const getProvinceColor = useCallback(
    (provinceName: string, isHovered: boolean) => {
      const hasData = getRegistros(provinceName) > 0
      if (!hasData) return isHovered ? COLOR_HOVER_SIN_DATOS : COLOR_SIN_DATOS
      return isHovered ? COLOR_HOVER : COLOR_PROVINCIA
    },
    [getRegistros],
  )

  const flushTooltipCoords = useCallback(() => {
    const coords = pendingCoordsRef.current
    if (!coords) return
    setTooltip((prev) => (prev ? { ...prev, x: coords.x, y: coords.y } : prev))
    pendingCoordsRef.current = null
    rafRef.current = null
  }, [])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGPathElement, MouseEvent>, provinceName: string) => {
      const registros = getRegistros(provinceName)
      const hasData = registros > 0
      setHoveredProvince(provinceName)
      setTooltip({
        provinceName,
        registros,
        hasData,
        porcentaje: Number(getPorcentaje(registros)),
        ranking: getRanking(provinceName),
        totalProvincias: provinciasOrdenadas.length,
        x: e.clientX,
        y: e.clientY,
      })
    },
    [getRegistros, getPorcentaje, getRanking, provinciasOrdenadas.length],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGPathElement, MouseEvent>) => {
      pendingCoordsRef.current = { x: e.clientX, y: e.clientY }
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(flushTooltipCoords)
      }
    },
    [flushTooltipCoords],
  )

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      pendingCoordsRef.current = null
    }
    // Mantener tooltip visible si hay una provincia seleccionada
    if (!selectedProvince) {
      setTooltip(null)
      setHoveredProvince(null)
    }
  }, [selectedProvince])

  const selectProvince = useCallback(
    async (provinceName: string) => {
      setSelectedProvince(provinceName)
      setPanelOpen(true)
      setIsLoading(true)

      // Fijar tooltip para la provincia seleccionada
      const registros = getRegistros(provinceName)
      const hasData = registros > 0
      const ranking = getRanking(provinceName)
      const porcentaje = Number(getPorcentaje(registros))

      // Actualizar tooltip con posición fija (centro del mapa)
      if (mapContainerRef.current) {
        const rect = mapContainerRef.current.getBoundingClientRect()
        setTooltip({
          provinceName,
          registros,
          hasData,
          porcentaje,
          ranking,
          totalProvincias: provinciasOrdenadas.length,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      }

      try {
        const [provinceStats, topLocalities] = await Promise.all([
          statsApi.getStatsByProvince(provinceName),
          statsApi.getTopLocalitiesByProvince(provinceName),
        ])

        const totalObservations = provinceStats?.totalObservations ?? registros
        const percentageOfCountry = totalRegistros === 0 ? null : getPorcentaje(totalObservations)

        setPanelData({
          totalObservations,
          totalSpecies: provinceStats?.totalSpecies ?? null,
          totalGenera: provinceStats?.totalGenera ?? null,
          fieldTrips: provinceStats?.fieldTrips ?? null,
          percentageOfCountry,
          ranking,
          totalProvinces: provinciasOrdenadas.length,
          topSpecies: provinceStats?.topSpecies ?? [],
          topLocalities: topLocalities ?? [],
          lastUpdated: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Error loading province data:', error)
        // Usar datos locales como fallback
        setPanelData({
          totalObservations: registros,
          totalSpecies: null,
          totalGenera: null,
          fieldTrips: null,
          percentageOfCountry: totalRegistros === 0 ? null : getPorcentaje(registros),
          ranking,
          totalProvinces: provinciasOrdenadas.length,
          topSpecies: [],
          topLocalities: [],
          lastUpdated: null,
        })
      } finally {
        setIsLoading(false)
      }

      // Intentar hacer zoom (si react-simple-maps lo soporta, esto requeriría usar ZoomableGroup)
      // Por ahora, solo fijamos la selección
    },
    [getRegistros, getRanking, getPorcentaje, provinciasOrdenadas.length, totalRegistros],
  )

  const handleClosePanel = useCallback(() => {
    setPanelOpen(false)
    setSelectedProvince(null)
    setTooltip(null)
    // Resetear zoom si es necesario
  }, [])

  const handleProvinceClick = useCallback(
    (e: React.MouseEvent<SVGPathElement, MouseEvent>, provinceName: string) => {
      e.stopPropagation()
      selectProvince(provinceName)
    },
    [selectProvince],
  )

  const handleProvinceKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGPathElement>, provinceName: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        selectProvince(provinceName)
      }
    },
    [selectProvince],
  )

  const baseGeographyStyle = useMemo(
    () => ({
      outline: 'none' as const,
      cursor: 'pointer' as const,
      transition: 'fill 0.2s ease',
    }),
    [],
  )

  //logica para el tamaño del mapa
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1366)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const mapScale = useMemo(() => {
    if (isMobile) return 770 // móvil
    if (viewportWidth >= 1920) return 800
    if (viewportWidth >= 1600) return 1000
    return sidebarCollapsed ? 1100 : 1230
  }, [isMobile, sidebarCollapsed, viewportWidth])

  // -----------------------------------------------------

  if (!MAP_JSON?.objects) {
    return <div>Error: No se pudo cargar el mapa</div>
  }

  return (
    <Card className="flex h-full w-full flex-col overflow-hidden">
      <CardHeader className="">
        <CardTitle className="text-sm sm:text-base">Registros por provincia</CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-1  ">
        <div ref={mapContainerRef} className="relative flex h-full w-full flex-1" onMouseLeave={handleMouseLeave}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: mapScale, center: [-63.5, -40.2] }}
            width={800}
            height={600}
            style={{ width: '100%', height: '100%' }}
          >
            <Geographies geography={MAP_JSON}>
              {({ geographies }: { geographies: GeographyType[] }) =>
                geographies.map((geography: GeographyType) => {
                  const provinceName = geography.properties?.NAME ?? 'Sin nombre'
                  const isHovered = hoveredProvince === provinceName
                  const color = getProvinceColor(provinceName, isHovered)
                  const hasData = getRegistros(provinceName) > 0

                  const isSelected = selectedProvince === provinceName
                  const selectedColor = isSelected ? (hasData ? COLOR_HOVER : COLOR_SIN_DATOS) : color

                  return (
                    <Geography
                      key={`${geography.rsmKey}-${provinceName}`}
                      geography={geography}
                      fill={selectedColor}
                      stroke={STROKE_COLOR}
                      strokeWidth={isSelected ? STROKE_WIDTH + 0.5 : STROKE_WIDTH}
                      style={{
                        default: { ...baseGeographyStyle, fill: selectedColor },
                        hover: { ...baseGeographyStyle, fill: selectedColor },
                        pressed: {
                          ...baseGeographyStyle,
                          fill: hasData ? COLOR_HOVER : COLOR_SIN_DATOS,
                        },
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Provincia ${provinceName}. ${
                        hasData ? `${getRegistros(provinceName)} registros` : 'Sin datos registrados'
                      }. Click para ver detalles`}
                      onMouseEnter={(e: React.MouseEvent<SVGPathElement, MouseEvent>) =>
                        handleMouseEnter(e, provinceName)
                      }
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      onClick={(e: React.MouseEvent<SVGPathElement, MouseEvent>) =>
                        handleProvinceClick(e, provinceName)
                      }
                      onKeyDown={(e: React.KeyboardEvent<SVGPathElement>) => handleProvinceKeyDown(e, provinceName)}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </CardContent>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-popover border border-border px-2 py-1 shadow-lg text-xs"
          style={{
            left: tooltip.x + 8,
            top: tooltip.y + 8,
            minWidth: 140,
            maxWidth: 200,
          }}
        >
          <h4 className="font-semibold text-xs text-popover-foreground mb-1">{tooltip.provinceName}</h4>
          {tooltip.hasData ? (
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-popover-foreground">
                  {tooltip.registros > 999 ? '+999' : numberFormatter.format(tooltip.registros)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {tooltip.registros === 1 ? 'registro' : 'registros'}
                </span>
              </div>
              {tooltip.registros > 999 && (
                <p className="text-xs text-muted-foreground italic">
                  Exacto: {numberFormatter.format(tooltip.registros)}
                </p>
              )}
              <div className="pt-1 border-t border-border space-y-0.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Porcentaje:</span>
                  <span className="font-medium text-popover-foreground">{tooltip.porcentaje.toFixed(1)}%</span>
                </div>
                {tooltip.ranking > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Ranking:</span>
                    <span className="font-medium text-popover-foreground">
                      #{tooltip.ranking}/{tooltip.totalProvincias}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Sin datos registrados</p>
          )}
        </div>
      )}

      <ProvincePanel
        open={panelOpen}
        onClose={handleClosePanel}
        provinceName={selectedProvince}
        totalObservations={panelData.totalObservations}
        totalSpecies={panelData.totalSpecies}
        totalGenera={panelData.totalGenera}
        fieldTrips={panelData.fieldTrips}
        percentageOfCountry={panelData.percentageOfCountry}
        ranking={panelData.ranking}
        totalProvinces={panelData.totalProvinces}
        topSpecies={panelData.topSpecies}
        topLocalities={panelData.topLocalities}
        lastUpdated={panelData.lastUpdated}
        isLoading={isLoading}
        topProvinces={provinciasOrdenadas}
      />
    </Card>
  )
}
