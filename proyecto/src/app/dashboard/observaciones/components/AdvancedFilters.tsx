'use client'

import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Filter, X, Search, MapPin, Calendar, Users, Tag, TrendingUp, Leaf, Globe } from 'lucide-react'

export interface AdvancedObservationFilters {
  // Búsqueda general
  q?: string
  taxon_name?: string

  // Ubicación
  locality_name?: string
  department_name?: string
  province_name?: string
  country_name?: string

  // Fechas
  start_date?: string
  end_date?: string

  // Geolocalización
  geolocation_tag?: string
  latitude?: string
  longitude?: string
  radius?: string

  // Taxonomía y clasificación
  taxonomic_level?: string
  caste?: string

  // Conservación y observación
  conservation_status?: string

  // Personas
  person_name?: string // Colector
  identifier_name?: string
  confirmer_name?: string

  // Ambiente
  environment_name?: string

  // Abundancia
  min_abundance?: string
  max_abundance?: string
}

interface AdvancedFiltersProps {
  filters: AdvancedObservationFilters
  onChange: (next: AdvancedObservationFilters) => void
  onClear: () => void
  filteredCount: number
  totalCount: number
}

interface FilterChipProps {
  label: string
  value: string
  onRemove: () => void
}

function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <Badge
      variant="secondary"
      className="flex items-center gap-1 px-2 py-1 text-xs font-normal hover:bg-secondary/80 transition-colors"
    >
      <span className="font-medium">{label}:</span>
      <span className="max-w-[100px] truncate">{value}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-background rounded-full p-0.5 transition-colors"
        type="button"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

export function AdvancedFilters({ filters, onChange, onClear, filteredCount, totalCount }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const set = useMemo(
    () => (key: keyof AdvancedObservationFilters) => (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ ...filters, [key]: e.target.value }),
    [filters, onChange],
  )

  const removeFilter = (key: keyof AdvancedObservationFilters) => {
    onChange({ ...filters, [key]: undefined })
  }

  const activeFilters = useMemo(() => {
    const active: Array<{ key: keyof AdvancedObservationFilters; label: string; value: string }> = []

    const filterLabels: Record<string, string> = {
      q: 'Búsqueda',
      taxon_name: 'Taxón',
      person_name: 'Colector',
      locality_name: 'Localidad',
      department_name: 'Departamento',
      province_name: 'Provincia',
      country_name: 'País',
      start_date: 'Desde',
      end_date: 'Hasta',
      geolocation_tag: 'Tag',
      latitude: 'Latitud',
      longitude: 'Longitud',
      radius: 'Radio',
      taxonomic_level: 'Nivel',
      caste: 'Casta',
      environment_name: 'Ambiente',
      conservation_status: 'Conservación',
      identifier_name: 'Identificador',
      confirmer_name: 'Confirmador',
      min_abundance: 'Abund. mín',
      max_abundance: 'Abund. máx',
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.toString().trim()) {
        active.push({
          key: key as keyof AdvancedObservationFilters,
          label: filterLabels[key] || key,
          value: value.toString(),
        })
      }
    })

    return active
  }, [filters])

  const hasFilters = activeFilters.length > 0

  return (
    <div className="w-full space-y-4">
      {/* Búsqueda Rápida */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Búsqueda rápida: taxón, localidad, colector, país..."
                value={filters.q || ''}
                onChange={set('q')}
                className="pl-9 h-11 text-base"
              />
            </div>

            {/* Filtros Activos y Estadísticas */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.length > 0 ? (
                  <>
                    {activeFilters.slice(0, 3).map((filter) => (
                      <FilterChip
                        key={filter.key}
                        label={filter.label}
                        value={filter.value}
                        onRemove={() => removeFilter(filter.key)}
                      />
                    ))}
                    {activeFilters.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{activeFilters.length - 3} más
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Sin filtros aplicados</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs font-medium">
                  {filteredCount.toLocaleString('es-ES')} de {totalCount.toLocaleString('es-ES')}
                </Badge>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1">
                    <X className="h-3 w-3" />
                    Limpiar todo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros Avanzados */}
      <Accordion
        type="single"
        collapsible
        value={isExpanded ? 'filters' : ''}
        onValueChange={(value) => setIsExpanded(value === 'filters')}
      >
        <AccordionItem value="filters" className="">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-primary/5 rounded-xl transition-colors shadow-sm group border border-muted-foreground/10 focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <div className="flex items-center gap-2 ">
              <Filter className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Filtros avanzados</span>
              {hasFilters && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-6 mt-4">
              {/* Taxonomía */}
              <Card className="border-l-4 border-l-chart-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Taxonomía y Colector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxon_name" className="text-xs font-medium">
                        Nombre del taxón
                      </Label>
                      <Input
                        id="taxon_name"
                        placeholder="Ej: Camponotus, Solenopsis"
                        value={filters.taxon_name || ''}
                        onChange={set('taxon_name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="person_name" className="text-xs font-medium">
                        Colector
                      </Label>
                      <Input
                        id="person_name"
                        placeholder="Ej: González, López"
                        value={filters.person_name || ''}
                        onChange={set('person_name')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ubicación Geográfica */}
              <Card className="border-l-4 border-l-chart-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación Geográfica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="locality_name" className="text-xs font-medium">
                        Localidad
                      </Label>
                      <Input
                        id="locality_name"
                        placeholder="Ej: Formosa"
                        value={filters.locality_name || ''}
                        onChange={set('locality_name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department_name" className="text-xs font-medium">
                        Departamento
                      </Label>
                      <Input
                        id="department_name"
                        placeholder="Ej: Pilcomayo"
                        value={filters.department_name || ''}
                        onChange={set('department_name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province_name" className="text-xs font-medium">
                        Provincia
                      </Label>
                      <Input
                        id="province_name"
                        placeholder="Ej: Formosa"
                        value={filters.province_name || ''}
                        onChange={set('province_name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country_name" className="text-xs font-medium">
                        País
                      </Label>
                      <Input
                        id="country_name"
                        placeholder="Ej: Argentina"
                        value={filters.country_name || ''}
                        onChange={set('country_name')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Coordenadas GPS */}
              <Card className="border-l-4 border-l-chart-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Coordenadas GPS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="geolocation_tag" className="text-xs font-medium">
                        Tag de geolocalización
                      </Label>
                      <Input
                        id="geolocation_tag"
                        placeholder="Ej: Sitio A"
                        value={filters.geolocation_tag || ''}
                        onChange={set('geolocation_tag')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-xs font-medium">
                        Latitud
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        placeholder="-27.4488"
                        value={filters.latitude || ''}
                        onChange={set('latitude')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-xs font-medium">
                        Longitud
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        placeholder="-58.8715"
                        value={filters.longitude || ''}
                        onChange={set('longitude')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="radius" className="text-xs font-medium">
                        Radio (metros)
                      </Label>
                      <Input
                        id="radius"
                        type="number"
                        placeholder="50"
                        value={filters.radius || ''}
                        onChange={set('radius')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fechas */}
              <Card className="border-l-4 border-l-chart-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Rango de Fechas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start_date" className="text-xs font-medium">
                        Fecha desde
                      </Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={filters.start_date || ''}
                        onChange={set('start_date')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date" className="text-xs font-medium">
                        Fecha hasta
                      </Label>
                      <Input id="end_date" type="date" value={filters.end_date || ''} onChange={set('end_date')} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ambiente */}
              <Card className="border-l-4 border-l-chart-5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Ambiente y Clasificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="environment_name" className="text-xs font-medium">
                        Ambiente
                      </Label>
                      <Input
                        id="environment_name"
                        placeholder="Ej: Bosque, Pastizal"
                        value={filters.environment_name || ''}
                        onChange={set('environment_name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="caste" className="text-xs font-medium">
                        Casta
                      </Label>
                      <Input
                        id="caste"
                        placeholder="Ej: Obrera, Reina"
                        value={filters.caste || ''}
                        onChange={set('caste')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conservation_status" className="text-xs font-medium">
                        Estado de conservación
                      </Label>
                      <Input
                        id="conservation_status"
                        placeholder="Ej: LC, EN, VU"
                        value={filters.conservation_status || ''}
                        onChange={set('conservation_status')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxonomic_level" className="text-xs font-medium">
                        Nivel taxonómico
                      </Label>
                      <Input
                        id="taxonomic_level"
                        placeholder="Ej: Species, Genus"
                        value={filters.taxonomic_level || ''}
                        onChange={set('taxonomic_level')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personas */}
              <Card className="border-l-4 border-l-chart-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Identificación y Confirmación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier_name" className="text-xs font-medium">
                        Identificador
                      </Label>
                      <Input
                        id="identifier_name"
                        placeholder="Ej: Dr. López"
                        value={filters.identifier_name || ''}
                        onChange={set('identifier_name')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmer_name" className="text-xs font-medium">
                        Confirmador
                      </Label>
                      <Input
                        id="confirmer_name"
                        placeholder="Ej: Dra. Martínez"
                        value={filters.confirmer_name || ''}
                        onChange={set('confirmer_name')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Abundancia */}
              <Card className="border-l-4 border-l-chart-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Abundancia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_abundance" className="text-xs font-medium">
                        Abundancia mínima
                      </Label>
                      <Input
                        id="min_abundance"
                        type="number"
                        placeholder="Ej: 1"
                        value={filters.min_abundance || ''}
                        onChange={set('min_abundance')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_abundance" className="text-xs font-medium">
                        Abundancia máxima
                      </Label>
                      <Input
                        id="max_abundance"
                        type="number"
                        placeholder="Ej: 100"
                        value={filters.max_abundance || ''}
                        onChange={set('max_abundance')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
