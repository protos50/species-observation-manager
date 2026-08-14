'use client'

import React from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'

interface TopSpecies {
  species: string
  count: number
}

interface TopLocality {
  rank: number
  locality: string
  department: string
  observations: number
}

interface ProvincePanelProps {
  open: boolean
  onClose: () => void
  provinceName: string | null
  totalObservations: number | null
  totalSpecies: number | null
  totalGenera: number | null
  fieldTrips: number | null
  percentageOfCountry: number | null
  ranking: number | null
  totalProvinces: number | null
  topSpecies: TopSpecies[]
  topLocalities: TopLocality[]
  lastUpdated: string | null
  isLoading: boolean
  topProvinces: Array<{ name: string; count: number }>
}

export function ProvincePanel({
  open,
  onClose,
  provinceName,
  totalObservations,
  totalSpecies,
  totalGenera,
  fieldTrips,
  percentageOfCountry,
  ranking,
  totalProvinces,
  topSpecies,
  topLocalities,
  isLoading,
  topProvinces,
}: ProvincePanelProps) {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat('es-AR'), [])

  const maxCount = topProvinces.length > 0 ? topProvinces[0].count : 1
  const selectedProvinceData = topProvinces.find((p) => p.name === provinceName)
  const metricItems = [
    {
      label: 'Observaciones totales',
      value: totalObservations,
      hasOverflow: totalObservations !== null && totalObservations > 999,
    },
    {
      label: 'Especies únicas',
      value: totalSpecies,
      hasOverflow: false,
    },
    {
      label: 'Géneros únicos',
      value: totalGenera,
      hasOverflow: false,
    },
    {
      label: 'Salidas de campo',
      value: fieldTrips,
      hasOverflow: false,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full max-w-[100vw] sm:w-[420px] md:w-[500px] lg:w-[560px] overflow-y-auto max-h-screen"
      >
        <SheetHeader className="sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg font-semibold truncate">
                {isLoading ? <Skeleton className="h-6 w-32" /> : provinceName || 'Cargando...'}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground ">Detalles de la provincia</SheetDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" aria-label="Cerrar panel">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="p-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <Skeleton key={item} className="h-20 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {metricItems.map((item) => {
                      const displayValue =
                        item.value !== null ? (item.hasOverflow ? '+999' : numberFormatter.format(item.value)) : 'N/A'
                      return (
                        <div key={item.label} className="rounded-md border border-border/60 bg-muted/40 p-3">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
                          <p className="mt-1 text-lg font-semibold">{displayValue}</p>
                          {item.hasOverflow && item.value !== null && (
                            <p className="text-xs text-muted-foreground italic">
                              Exacto: {numberFormatter.format(item.value)}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {percentageOfCountry !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">% del país</span>
                      <span className="text-lg font-semibold">{percentageOfCountry.toFixed(2)}%</span>
                    </div>
                  )}
                  {ranking !== null && totalProvinces !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ranking</span>
                      <span className="text-lg font-semibold">
                        #{ranking}/{totalProvinces}
                      </span>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Barra comparativa */}

          {/* Top localidades */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 5 Localidades</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => i).map((item) => (
                    <Skeleton key={item} className="h-16 w-full" />
                  ))}
                </div>
              ) : topLocalities.length > 0 ? (
                <div className="space-y-2">
                  {topLocalities.map((locality) => (
                    <div
                      key={locality.rank}
                      className="flex items-start justify-between p-3 rounded-md bg-muted/50 border border-border/40"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary">#{locality.rank}</span>
                          <span className="text-sm font-semibold truncate">{locality.locality}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Departamento: {locality.department}</p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-sm font-semibold">{numberFormatter.format(locality.observations)}</span>
                        <span className="text-xs text-muted-foreground">obs.</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay datos de localidades disponibles</p>
              )}
            </CardContent>
          </Card>

          {/* Top especies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Especies más comunes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 10 }, (_, i) => i).map((item) => (
                    <Skeleton key={item} className="h-8 w-full" />
                  ))}
                </div>
              ) : topSpecies.length > 0 ? (
                <div className="space-y-2">
                  {topSpecies.slice(0, 10).map((species, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <span className="text-sm font-medium flex-1 truncate">{species.species}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {numberFormatter.format(species.count)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay datos de especies disponibles</p>
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
