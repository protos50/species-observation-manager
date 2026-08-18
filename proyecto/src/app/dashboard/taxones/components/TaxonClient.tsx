'use client'

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { ResponsiveDataList } from '@/components/ResponsiveDataList'
import { getTaxonColumns } from './Columns'
import { GitBranch, RotateCcw } from 'lucide-react'
import { TaxonDetailsSheet } from './TaxonDetailsSheet'
import { CreateTaxonDialog } from './CreateTaxonDialog'
import { TaxonFilters, TaxonFilters as TaxonFiltersType } from './TaxonFilters'
import { Taxon, taxonomyApi } from '@/lib/api/taxonomy'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CanWrite, withoutActionsColumn } from '@/components/CanWrite'
import { useRoleAuth } from '@/hooks/use-role-auth'

interface TaxonClientProps {
  taxa: Taxon[]
  taxonomicLevels: Array<{ id_taxonomic_level: number; name: string }>
}

// Helper para formatear el contador con 99+ cuando sea mayor
const formatCount = (count: number): string => {
  return count > 99 ? '99+' : String(count)
}

export function TaxonClient({ taxa: initialTaxa, taxonomicLevels }: TaxonClientProps) {
  const { canWrite } = useRoleAuth();
  const [taxa, setTaxa] = useState<Taxon[]>(initialTaxa)
  const [deletedTaxa, setDeletedTaxa] = useState<Taxon[]>([])
  const [selected, setSelected] = useState<Taxon | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('activos')
  const [filters, setFilters] = useState<TaxonFiltersType>({})
  const [loading, setLoading] = useState(false)

  const onOpenDetails = useCallback((t: Taxon) => {
    setSelected(t)
    setSheetOpen(true)
  }, [])

  const onClose = useCallback(() => {
    setSheetOpen(false)
    const timeoutId = setTimeout(() => setSelected(null), 150)

    // Cleanup para evitar memory leaks
    return () => clearTimeout(timeoutId)
  }, [])

  const loadDeletedTaxa = useCallback(async () => {
    setLoading(true)
    try {
      const data = await taxonomyApi.taxa.getDeleted()
      setDeletedTaxa(
        data.map((taxon: any) => ({
          ...taxon,
          deleted_at: taxon.deleted_at ? new Date(taxon.deleted_at) : null,
        })),
      )
    } catch {
      toast.error('Error al cargar taxones dados de baja')
    } finally {
      setLoading(false)
    }
  }, [])

  const onDelete = useCallback(
    async (id: number) => {
      try {
        await taxonomyApi.taxa.delete(id)
        setTaxa((prev) => prev.filter((x) => x.id_taxon !== id))
        await loadDeletedTaxa()
        toast.success('El taxón fue dado de baja exitosamente')
      } catch {
        toast.error('Error al dar de baja el taxón')
      }
    },
    [loadDeletedTaxa],
  )

  const handleRestore = useCallback(async (taxon: Taxon) => {
    try {
      await taxonomyApi.taxa.restore(taxon.id_taxon)
      setDeletedTaxa((prev) => prev.filter((t) => t.id_taxon !== taxon.id_taxon))
      setTaxa((prev) => [...prev, { ...taxon, deleted_at: undefined }])
      toast.success(`El taxón "${taxon.name}" fue restaurado exitosamente`)
    } catch {
      toast.error('Error al restaurar el taxón')
    }
  }, [])

  const onTaxonCreated = useCallback((newTaxon: Taxon) => {
    setTaxa((prev) => [newTaxon, ...prev])
  }, [])

  const onUpdated = useCallback((updated: Taxon) => {
    setTaxa((prev) => prev.map((t) => (t.id_taxon === updated.id_taxon ? updated : t)))
    setSelected((prev) => (prev && prev.id_taxon === updated.id_taxon ? updated : prev))
  }, [])

  const filteredTaxa = useMemo(() => {
    let result = taxa

    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase()
      result = result.filter((t) => t.name.toLowerCase().includes(term))
    }

    if (filters.taxonomicLevel) {
      result = result.filter((t) => t.taxonomic_level?.name === filters.taxonomicLevel)
    }

    if (filters.parentName) {
      const parentTerm = filters.parentName.toLowerCase()
      result = result.filter((t) => t.parent?.name?.toLowerCase().includes(parentTerm))
    }

    if (filters.authorName) {
      const authorTerm = filters.authorName.toLowerCase()
      result = result.filter((t) => t.author?.author_name?.toLowerCase().includes(authorTerm))
    }

    return result
  }, [taxa, filters])

  const handleClearFilters = useCallback(() => {
    setFilters({})
  }, [])

  const columns = useMemo(() => {
    const cols = getTaxonColumns(onOpenDetails)
    return canWrite() ? cols : withoutActionsColumn(cols)
  }, [onOpenDetails, canWrite])

  useEffect(() => {
    loadDeletedTaxa()
  }, [loadDeletedTaxa])

  const activosCount = filteredTaxa.length
  const bajaCount = deletedTaxa.length

  const deletedColumns = useMemo(
    () => {
      const cols = [
      ...getTaxonColumns(() => {}),
      {
        id: 'restore',
        header: 'Acciones',
        cell: ({ row }: any) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRestore(row.original)}
            className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restaurar
          </Button>
        ),
      },
      ]
      return canWrite() ? cols : withoutActionsColumn(cols)
    },
    [handleRestore, canWrite],
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Taxones</h2>
          </div>
          <CanWrite>
            <CreateTaxonDialog onTaxonCreated={onTaxonCreated} />
          </CanWrite>
        </div>

        <TaxonFilters
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
          taxonomicLevels={taxonomicLevels}
          filteredCount={filteredTaxa.length}
          totalCount={taxa.length}
        />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
            <TabsTrigger value="activos" className="text-sm sm:text-base whitespace-nowrap">
              Taxones activos
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
              >
                {formatCount(activosCount)}
              </Badge>
            </TabsTrigger>

            <TabsTrigger value="baja" className="text-sm sm:text-base whitespace-nowrap">
              Taxones dados de baja
              <Badge
                variant="secondary"
                className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
              >
                {formatCount(bajaCount)}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activos" className="mt-4">
            <ResponsiveDataList columns={columns} data={filteredTaxa} cardsProps={{ showFieldLabels: true }} />
          </TabsContent>

          <TabsContent value="baja" className="mt-4">
            {loading ? (
              <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
                <p>Cargando taxones dados de baja...</p>
              </div>
            ) : deletedTaxa.length === 0 ? (
              <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
                <p>No hay taxones dados de baja</p>
              </div>
            ) : (
              <ResponsiveDataList columns={deletedColumns} data={deletedTaxa} cardsProps={{ showFieldLabels: true }} />
            )}
          </TabsContent>
        </Tabs>
      </div>

      <TaxonDetailsSheet
        open={sheetOpen}
        onClose={onClose}
        taxon={selected}
        onDelete={onDelete}
        onUpdated={onUpdated}
      />
    </>
  )
}
