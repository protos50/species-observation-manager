'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ResponsiveDataList } from '@/components/ResponsiveDataList'
import { getObservationColumns, Observation } from './Columns'
import { MapPin, PlusCircle } from 'lucide-react'
import { AdvancedFilters, AdvancedObservationFilters } from './AdvancedFilters'
import { observationsApi } from '@/lib/api/observations'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ObservationDetailsSheet } from './ObservationDetailsSheet'
import { CreateObservationDialog } from './CreateObservationDialog'
import { EditObservationDialog } from './EditObservationDialog'
import { toast } from 'sonner'
import { CanWrite, withoutActionsColumn } from '@/components/CanWrite'
import { useRoleAuth } from '@/hooks/use-role-auth'

interface ObservationClientProps {
  observations: Observation[]
}

// Helper para limpiar y filtrar valores válidos
const sanitizeFilterValue = (value: string | undefined): string | undefined => {
  return value?.trim() || undefined
}

// Helper para construir filtros limpios desde el objeto de filtros
const buildCleanFilters = (filters: AdvancedObservationFilters): Record<string, string> => {
  return Object.entries(filters).reduce((acc, [key, value]) => {
    const sanitized = sanitizeFilterValue(value)
    if (sanitized) {
      acc[key] = sanitized
    }
    return acc
  }, {} as Record<string, string>)
}

// Helper para construir URLSearchParams desde filtros
const buildUrlParams = (filters: AdvancedObservationFilters, page: number, limit: number): URLSearchParams => {
  const params = new URLSearchParams()
  const cleanFilters = buildCleanFilters(filters)

  Object.entries(cleanFilters).forEach(([key, value]) => {
    params.set(key, value)
  })

  params.set('page', String(page))
  params.set('limit', String(limit))

  return params
}

// Helper para extraer filtros desde URLSearchParams
const extractFiltersFromUrl = (searchParams: URLSearchParams): AdvancedObservationFilters => {
  const filterKeys: (keyof AdvancedObservationFilters)[] = [
    'q',
    'taxon_name',
    'person_name',
    'locality_name',
    'department_name',
    'province_name',
    'country_name',
    'start_date',
    'end_date',
    'geolocation_tag',
    'latitude',
    'longitude',
    'radius',
    'taxonomic_level',
    'caste',
    'environment_name',
    'conservation_status',
    'identifier_name',
    'confirmer_name',
    'min_abundance',
    'max_abundance',
  ]

  return filterKeys.reduce((acc, key) => {
    const value = searchParams.get(key)
    if (value) {
      acc[key] = value
    }
    return acc
  }, {} as AdvancedObservationFilters)
}

export function ObservationClient({ observations: initial }: ObservationClientProps) {
  const { canWrite } = useRoleAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [filters, setFilters] = useState<AdvancedObservationFilters>({})
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [data, setData] = useState<Observation[]>(initial)
  const [deletedData, setDeletedData] = useState<Observation[]>([])
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState<Observation | null>(null)
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('activos')

  const onOpenDetails = useCallback((o: Observation) => {
    setSelected(o)
    setOpen(true)
  }, [])
  const onClose = useCallback(() => setOpen(false), [])

  // Fetch active observations
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const cleanFilters = buildCleanFilters(filters)
      const hasFilters = Object.keys(cleanFilters).length > 0

      const result = hasFilters
        ? await observationsApi.search({ ...cleanFilters, page, limit })
        : await observationsApi.getAll({ page, limit })

      const list = Array.isArray(result?.data) ? result.data : result
      setData(list)

      const tp = result?.pagination?.totalPages
      const tc = result?.pagination?.totalCount
      setTotalPages(typeof tp === 'number' ? tp : null)
      setTotalCount(typeof tc === 'number' ? tc : 0)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page, limit])

  // Load deleted observations
  const loadDeletedObservations = useCallback(async () => {
    setIsLoading(true)
    try {
      const deleted = await observationsApi.getDeleted()
      setDeletedData(deleted)
    } catch (error) {
      console.error('Error loading deleted observations:', error)
      toast.error('Error al cargar observaciones eliminadas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle delete observation
  const handleObservationDelete = useCallback(
    async (id: number) => {
      try {
        await observationsApi.delete(String(id))
        toast.success('Observación eliminada exitosamente')

        // Remove from active data and refresh deleted
        setData((prev) => prev.filter((o) => o.id_observation !== id))
        await loadDeletedObservations()
        onClose()
      } catch (error) {
        console.error('Error deleting observation:', error)
        toast.error('Error al eliminar la observación')
      }
    },
    [loadDeletedObservations, onClose],
  )

  // Handle restore observation
  const handleObservationRestore = useCallback(
    async (id: number) => {
      try {
        await observationsApi.restore(String(id))
        toast.success('Observación restaurada exitosamente')

        // Remove from deleted data and refresh active
        setDeletedData((prev) => prev.filter((o) => o.id_observation !== id))
        fetchData()
      } catch (error) {
        console.error('Error restoring observation:', error)
        toast.error('Error al restaurar la observación')
      }
    },
    [fetchData],
  )

  const columns = useMemo(
    () => getObservationColumns(onOpenDetails).filter((col) => (col as any).accessorKey !== 'deleted_at'),
    [onOpenDetails],
  )

  const deletedColumns = useMemo(() => getObservationColumns(onOpenDetails), [onOpenDetails])

  const syncFromUrl = useCallback(() => {
    const extractedFilters = extractFiltersFromUrl(searchParams)
    setFilters(extractedFilters)

    const p = parseInt(searchParams.get('page') || '1', 10)
    const l = parseInt(searchParams.get('limit') || '10', 10)

    setPage(Number.isNaN(p) ? 1 : p)
    setLimit(Number.isNaN(l) ? 10 : l)
  }, [searchParams])

  useEffect(() => {
    syncFromUrl()
  }, [searchParams])

  const pushToUrl = useCallback(
    (next: { filters?: AdvancedObservationFilters; page?: number; limit?: number }) => {
      const f = next.filters ?? filters
      const p = next.page ?? page
      const l = next.limit ?? limit

      const params = buildUrlParams(f, p, l)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [filters, page, limit, pathname, router],
  )

  useEffect(() => {
    fetchData()
  }, [page, limit, filters])

  // Load deleted observations on mount
  useEffect(() => {
    loadDeletedObservations()
  }, [loadDeletedObservations])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setPage(1)
    pushToUrl({ filters: {}, page: 1 })
  }, [pushToUrl])

  // Total de observaciones desde el backend
  const totalObservations = totalCount

  const canPrev = page > 1
  const canNext = totalPages ? page < totalPages : true

  const activosCount = data.length
  const deletedCount = deletedData.length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Observaciones</h2>
        </div>

        <div className="flex items-center gap-2">
          <CanWrite>
            <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar Observación
            </Button>
          </CanWrite>
          {activeTab === 'activos' && (
            <select
              value={limit}
              onChange={(e) => {
                const next = Number(e.target.value)
                setLimit(next)
                pushToUrl({ limit: next })
              }}
              className="h-9 rounded-md border px-2 text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit">
          <TabsTrigger value="activos" className="text-sm sm:text-base">
            Observaciones activas
          </TabsTrigger>
          <TabsTrigger value="eliminadas" className="text-sm sm:text-base">
            Observaciones eliminadas
            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-600">
              {deletedCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4 space-y-4">
          <AdvancedFilters
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            filteredCount={data.length}
            totalCount={totalObservations}
          />

          <ResponsiveDataList
            columns={canWrite() ? columns : withoutActionsColumn(columns)}
            data={data}
            cardsProps={{
              showFieldLabels: true,
              cardClassName: 'sm:max-w-none',
            }}
            useSimpleTable={true}
            useSimpleCards={true}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              Página {page}
              {totalPages ? ` de ${totalPages}` : ''}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const next = Math.max(1, page - 1)
                  setPage(next)
                  pushToUrl({ page: next })
                }}
                disabled={!canPrev || isLoading}
                className="cursor-pointer"
              >
                Anterior
              </Button>
              <Button
                onClick={() => {
                  const next = page + 1
                  setPage(next)
                  pushToUrl({ page: next })
                }}
                disabled={!canNext || isLoading}
                className="cursor-pointer"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="eliminadas" className="mt-4">
          {isLoading ? (
            <div className="border rounded-md p-4 text-muted-foreground">
              <p>Cargando observaciones eliminadas...</p>
            </div>
          ) : deletedData.length === 0 ? (
            <div className="border rounded-md p-4 text-muted-foreground">
              <p>No hay observaciones eliminadas</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={canWrite() ? deletedColumns : withoutActionsColumn(deletedColumns)}
              data={deletedData}
              cardsProps={{
                showFieldLabels: true,
                cardClassName: 'sm:max-w-none',
              }}
              useSimpleTable={true}
              useSimpleCards={true}
            />
          )}
        </TabsContent>
      </Tabs>

      <ObservationDetailsSheet
        open={open}
        onClose={onClose}
        observation={selected}
        onDelete={activeTab === 'activos' ? handleObservationDelete : undefined}
        onRestore={activeTab === 'eliminadas' ? handleObservationRestore : undefined}
      />

      <CreateObservationDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => {
          setCreateOpen(false)
          fetchData()
        }}
      />
    </div>
  )
}

export default ObservationClient
