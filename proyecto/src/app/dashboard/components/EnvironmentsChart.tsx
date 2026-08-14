'use client'

import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardStats } from '@/lib/api/dashboard.api'

interface EnvironmentsChartProps {
  stats: DashboardStats
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

const chartConfig = {
  count: {
    label: 'Observaciones',
  },
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

function renderLabel({ cx, cy, midAngle, outerRadius, percent, name, isMobile, isTablet }: any) {
  const RADIAN = Math.PI / 180

  // Ajustar radio según el tamaño de pantalla
  const labelRadius = isMobile ? outerRadius + 12 : isTablet ? outerRadius + 15 : outerRadius + 18

  const x = cx + labelRadius * Math.cos(-midAngle * RADIAN)
  const y = cy + labelRadius * Math.sin(-midAngle * RADIAN)

  const textAnchor = x > cx ? 'start' : 'end'
  const displayPercent = `${Math.round(percent * 100)}%`

  // Truncar nombre según tamaño de pantalla
  const maxLength = isMobile ? 10 : isTablet ? 15 : 20
  const truncatedName = name.length > maxLength ? `${name.substring(0, maxLength)}...` : name

  const fontSize = isMobile ? 10 : isTablet ? 11 : 12

  // En móvil, solo mostrar porcentaje para evitar sobrecarga
  if (isMobile) {
    return (
      <text
        x={x}
        y={y}
        fill="var(--foreground)"
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{ fontSize, pointerEvents: 'none' }}
      >
        {displayPercent}
      </text>
    )
  }

  return (
    <text
      x={x}
      y={y}
      fill="var(--foreground)"
      textAnchor={textAnchor}
      dominantBaseline="central"
      style={{ fontSize, pointerEvents: 'none' }}
    >
      {truncatedName} {displayPercent}
    </text>
  )
}

export function EnvironmentsChart({ stats }: EnvironmentsChartProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const environments = stats.environments ?? []
  const chartData = environments.map((item, index) => ({
    name: item.name,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }))

  const totalEnvironments = environments.length
  const totalEnvObservations = environments.reduce((sum, item) => sum + item.count, 0)
  const dominantEnvironment = environments[0]

  const totalObservations = stats.taxonomy?.totalObservations ?? totalEnvObservations
  const totalSpecies = stats.taxonomy?.species ?? 0

  const mainSpecies = stats.commonSpecies?.[0]
  const totalCountries = stats.byCountry?.length ?? 0
  const totalProvinces = stats.byCountry?.reduce((sum, country) => sum + country.provinces.length, 0) ?? 0

  // Ajustar tamaño del pie según pantalla
  const outerRadius = isMobile ? 50 : isTablet ? 60 : 70

  const labelRenderer = (props: any) => renderLabel({ ...props, isMobile, isTablet })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Observaciones por Ambiente</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-4">
          <ChartContainer
            id="environments-chart"
            config={chartConfig}
            className="h-[200px] sm:h-[220px] md:h-[240px] w-full"
          >
            <PieChart>
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium">{payload[0].name}</span>
                        <span className="text-sm font-bold">{payload[0].value}</span>
                      </div>
                    </div>
                  )
                }}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={outerRadius}
                labelLine={
                  !isMobile
                    ? {
                        stroke: 'rgba(0,0,0,0.1)',
                        strokeWidth: isMobile ? 0.5 : 1,
                      }
                    : false
                }
                label={isMobile ? false : labelRenderer}
                paddingAngle={isMobile ? 1 : 2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>

              {/* Leyenda adaptativa */}
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  fontSize: isMobile ? 10 : isTablet ? 11 : 12,
                  color: 'var(--foreground)',
                  paddingTop: isMobile ? '8px' : '12px',
                }}
                formatter={(value: string) => {
                  const maxLength = isMobile ? 12 : isTablet ? 18 : 25
                  return value.length > maxLength ? `${value.substring(0, maxLength)}...` : value
                }}
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm sm:text-base">Resumen de los registros</CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 pb-4">
          {totalEnvironments === 0 && totalObservations === 0 ? (
            <p className="text-sm text-muted-foreground">No hay estadísticas de muestreo disponibles.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-xs sm:text-xs font-medium text-muted-foreground">Observaciones totales</p>
                  <p className="mt-1 text-lg sm:text-xl font-semibold">{totalObservations.toLocaleString('es-ES')}</p>
                </div>
                <div className="rounded-lg bg-muted/40 px-3 py-2">
                  <p className="text-xs sm:text-xs font-medium text-muted-foreground">Especies registradas</p>
                  <p className="mt-1 text-lg sm:text-xl font-semibold">{totalSpecies.toLocaleString('es-ES')}</p>
                </div>
              </div>

              {mainSpecies && (
                <div className="rounded-lg border border-border/60 px-3 py-3 bg-background/60">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Especie más observada</p>
                  <p className="text-sm sm:text-base font-semibold truncate">{mainSpecies.species}</p>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {mainSpecies.count.toLocaleString('es-ES')} observaciones
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Ambientes muestreados</span>
                <span className="text-lg sm:text-xl font-semibold">{totalEnvironments.toLocaleString('es-ES')}</span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Cobertura geográfica</span>
                <span className="text-xs sm:text-sm font-medium text-right">
                  {totalCountries} países · {totalProvinces} provincias
                </span>
              </div>

              {dominantEnvironment && (
                <p className="text-[11px] sm:text-xs text-muted-foreground">
                  La mayor parte de las observaciones proviene de{' '}
                  <span className="font-medium">{dominantEnvironment.name}</span>.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
