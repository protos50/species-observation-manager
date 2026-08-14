'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { ResponsiveDataList } from '@/components/ResponsiveDataList'
import { getGeolocationColumns, getDeletedGeolocationColumns, Geolocation } from './Columns'
import { MapPin, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CreateGeolocationDialog } from './CreateGeolocationDialog'
import { EditGeolocationDialog } from './EditGeolocationDialog'
import { GeolocationDetailsSheet } from './GeolocationDetailsSheet'
import { InUseAlertDialog } from '@/components/InUseAlertDialog'
import { geolocationApi } from '@/lib/api/geolocation'

interface GeolocationClientProps {
  geolocations: Geolocation[]
}

// Helper para formatear el contador con 99+ cuando sea mayor
const formatCount = (count: number): string => {
  return count > 99 ? '99+' : String(count)
}

export function GeolocationClient({ geolocations: initialGeolocations }: GeolocationClientProps) {
  const [activeGeolocations, setActiveGeolocations] = useState<Geolocation[]>(initialGeolocations)
  const [deletedGeolocations, setDeletedGeolocations] = useState<Geolocation[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('activos')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedGeo, setSelectedGeo] = useState<Geolocation | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [inUseInfo, setInUseInfo] = useState<any>(null)
  const [showInUseDialog, setShowInUseDialog] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const handleView = (geo: Geolocation) => {
    setSelectedGeo(geo)
    setSheetOpen(true)
  }

  const handleEdit = (geo: Geolocation) => {
    setSelectedGeo(geo)
    setSheetOpen(false)
    setEditOpen(true)
  }

  const loadDeletedGeolocations = useCallback(async () => {
    setLoading(true)
    try {
      const data = await geolocationApi.getDeleted()
      setDeletedGeolocations(
        data.map((item: any) => ({
          ...item,
          deleted_at: item.deleted_at ? new Date(item.deleted_at) : null,
        })),
      )
    } catch {
      toast.error('Error al cargar geolocalizaciones dadas de baja')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadActiveGeolocations = useCallback(async () => {
    try {
      const data = await geolocationApi.getAll()
      setActiveGeolocations(data)
    } catch {
      toast.error('Error al recargar geolocalizaciones activas')
    }
  }, [])

  const handleDelete = useCallback(
    async (geo: Geolocation) => {
      try {
        const inUseData = await geolocationApi.checkIfInUse(String(geo.id_geolocation))

        if (inUseData.inUse && inUseData.count > 0) {
          setInUseInfo(inUseData)
          setPendingDeleteId(geo.id_geolocation)
          setShowInUseDialog(true)
          return
        }

        await geolocationApi.delete(String(geo.id_geolocation))
        const geoToDelete = activeGeolocations.find((g) => g.id_geolocation === geo.id_geolocation)
        if (geoToDelete) {
          setActiveGeolocations((prev) => prev.filter((g) => g.id_geolocation !== geo.id_geolocation))
          setDeletedGeolocations((prev) => [...prev, { ...geoToDelete, deleted_at: new Date() }])
        }
        toast.success('Geolocalización eliminada exitosamente')
      } catch (error) {
        toast.error('Error al eliminar la geolocalización')
      }
    },
    [activeGeolocations],
  )

  const handleForceDelete = useCallback(async () => {
    if (!pendingDeleteId) return

    const geo = activeGeolocations.find((g) => g.id_geolocation === pendingDeleteId)
    if (!geo) return

    try {
      await geolocationApi.delete(String(pendingDeleteId))
      const geoToDelete = activeGeolocations.find((g) => g.id_geolocation === pendingDeleteId)
      if (geoToDelete) {
        setActiveGeolocations((prev) => prev.filter((g) => g.id_geolocation !== pendingDeleteId))
        setDeletedGeolocations((prev) => [...prev, { ...geoToDelete, deleted_at: new Date() }])
      }
      toast.success('Geolocalización eliminada exitosamente')
      setShowInUseDialog(false)
      setPendingDeleteId(null)
      setInUseInfo(null)
    } catch (error) {
      toast.error('Error al eliminar la geolocalización')
    }
  }, [pendingDeleteId, activeGeolocations])

  const handleRestore = useCallback(
    async (geo: Geolocation) => {
      try {
        await geolocationApi.restore(String(geo.id_geolocation))

        // Remover de la lista de eliminados
        setDeletedGeolocations((prev) => prev.filter((g) => g.id_geolocation !== geo.id_geolocation))

        // Recargar la lista de activos para obtener la versión completa del backend
        await loadActiveGeolocations()

        toast.success('Geolocalización restaurada exitosamente')
      } catch {
        toast.error('Error al restaurar la geolocalización')
      }
    },
    [loadActiveGeolocations],
  )

  const handleCreateSuccess = (newGeo: Geolocation) => {
    setActiveGeolocations((prev) => [...prev, newGeo])
    setCreateOpen(false)
  }

  const handleEditSuccess = (updatedGeo: Geolocation) => {
    setActiveGeolocations((prev) =>
      prev.map((geo) => (geo.id_geolocation === updatedGeo.id_geolocation ? updatedGeo : geo)),
    )
    setEditOpen(false)
    setSheetOpen(false)
  }

  useEffect(() => {
    loadDeletedGeolocations()
  }, [loadDeletedGeolocations])

  const columns = getGeolocationColumns(handleView, handleDelete)
  const deletedColumns = getDeletedGeolocationColumns(handleRestore)

  const activosCount = activeGeolocations.length
  const bajaCount = deletedGeolocations.length

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Geolocalizaciones</h2>
        </div>

        <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar Geolocalización
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit">
          <TabsTrigger value="activos" className="text-sm sm:text-base">
            Geolocalizaciones activas
            <Badge variant="secondary" className="bg-green-100 text-green-600 rounded-full px-2 py-0.5 text-xs ml-2">
              {formatCount(activosCount)}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="baja" className="text-sm sm:text-base">
            Dadas de baja
            <Badge variant="secondary" className="bg-red-100 text-red-600 rounded-full px-2 py-0.5 text-xs ml-2">
              {formatCount(bajaCount)}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeGeolocations} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-4 text-muted-foreground">
              <p>Cargando geolocalizaciones dadas de baja...</p>
            </div>
          ) : deletedGeolocations.length === 0 ? (
            <div className="border rounded-md p-4 text-muted-foreground">
              <p>No hay geolocalizaciones dadas de baja</p>
            </div>
          ) : (
            <ResponsiveDataList columns={deletedColumns} data={deletedGeolocations} />
          )}
        </TabsContent>
      </Tabs>

      <CreateGeolocationDialog open={createOpen} onClose={() => setCreateOpen(false)} onSuccess={handleCreateSuccess} />

      <GeolocationDetailsSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        geolocation={selectedGeo}
        onEdit={handleEdit}
      />

      <EditGeolocationDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={handleEditSuccess}
        geolocation={selectedGeo}
      />

      <InUseAlertDialog
        open={showInUseDialog}
        onOpenChange={setShowInUseDialog}
        inUseInfo={inUseInfo}
        onConfirm={handleForceDelete}
        title="Geolocalización en Uso"
        description={`Esta geolocalización está siendo utilizada por ${
          inUseInfo?.count || 0
        } observación(es). Puedes eliminarla de todas formas, pero las observaciones quedarán sin geolocalización asociada.`}
        itemName={
          activeGeolocations.find((g) => g.id_geolocation === pendingDeleteId)
            ? `Geolocalización #${pendingDeleteId}`
            : undefined
        }
      />
    </div>
  )
}

export default GeolocationClient
