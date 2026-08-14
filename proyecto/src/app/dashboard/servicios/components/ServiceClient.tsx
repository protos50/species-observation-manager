"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Wrench } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import { Service, serviceApi } from "@/lib/api/service";
import { CreateServiceDialog } from "./CreateServiceDialog";
import { EditServiceDialog } from "./EditServiceDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";

interface ServiceClientProps {
  services: Service[];
}

export function ServiceClient({ services: initialServices }: ServiceClientProps) {
  const [activeServices, setActiveServices] = useState<Service[]>(initialServices);
  const [deletedServices, setDeletedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);

  // Cargar servicios dados de baja al inicio
  const loadDeletedServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviceApi.service.getDeleted();
      setDeletedServices(
        data.map((service: any) => ({
          ...service,
          deleted_at: service.deleted_at || null,
        }))
      );
    } catch {
      setError("Error al cargar servicios dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar servicios activos
  const loadActiveServices = useCallback(async () => {
    try {
      const data = await serviceApi.service.getAll();
      setActiveServices(data);
    } catch {
      console.error("Error al recargar servicios activos");
    }
  }, []);

  const handleDeleteClick = useCallback(
    async (service: Service) => {
      setServiceToDelete(service);
      try {
        const result = await serviceApi.service.checkIfInUse(service.id_service.toString());
        setInUseInfo(result);
        setIsDeleteDialogOpen(true);
      } catch (error) {
        console.error("Error checking references:", error);
        toast.error("Error al verificar referencias");
      }
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!serviceToDelete) return;
    try {
      await serviceApi.service.delete(serviceToDelete.id_service.toString());
      setActiveServices((prev) => prev.filter((s) => s.id_service !== serviceToDelete.id_service));
      setDeletedServices((prev) => [
        ...prev,
        { ...serviceToDelete, deleted_at: new Date().toISOString() },
      ]);
      toast.success(`El servicio "${serviceToDelete.service_name}" fue dado de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      console.error("Error al eliminar servicio:", error);
      toast.error("Error al dar de baja el servicio");
    }
  }, [serviceToDelete]);

  // Función para manejar acciones de servicio (eliminar/restaurar)
  const handleServiceAction = useCallback(
    async (
      serviceId: number,
      serviceName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const service = activeServices.find((s) => s.id_service === serviceId);
          if (service) {
            handleDeleteClick(service);
          }
          // Remover de servicios activos y agregar a eliminados
        } else {
          await serviceApi.service.restore(serviceId.toString());
          // Remover de servicios eliminados y agregar a activos
          const serviceToRestore = deletedServices.find(
            (s) => s.id_service === serviceId
          );
          if (serviceToRestore) {
            setDeletedServices((prev) =>
              prev.filter((s) => s.id_service !== serviceId)
            );
            setActiveServices((prev) => [
              ...prev,
              { ...serviceToRestore, deleted_at: null },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} servicio:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveServices(), loadDeletedServices()]);
      }
    },
    [activeServices, deletedServices, loadActiveServices, loadDeletedServices, handleDeleteClick]
  );

  // Método creado
  const handleServiceCreated = useCallback(async (newService: Service) => {
    setActiveServices((prev) => [...prev, newService]);
  }, []);

  // Método editado
  const handleServiceUpdated = useCallback(async (updatedService: Service) => {
    setActiveServices((prev) =>
      prev.map((service) =>
        service.id_service === updatedService.id_service
          ? updatedService
          : service
      )
    );
  }, []);

  // Editar
  const handleEdit = useCallback((service: Service) => {
    setEditingService(service);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingService(null);
  }, []);

  const columns = useMemo<ColumnDef<Service>[]>(
    () => getColumns(handleServiceAction, handleEdit),
    [handleServiceAction, handleEdit]
  );

  const deletedColumns = useMemo<ColumnDef<Service>[]>(
    () => getDeletedColumns(handleServiceAction),
    [handleServiceAction]
  );

  const activosCount = activeServices.length;
  const bajaCount = deletedServices.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedServices();
  }, [loadDeletedServices]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Wrench className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Servicios del sistema
          </h2>
        </div>
        <CreateServiceDialog onServiceCreated={handleServiceCreated} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Servicios activos
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {activosCount}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="baja"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Servicios dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeServices} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando servicios dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedServices.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay servicios dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedServices}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditServiceDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        service={editingService}
        onServiceUpdated={handleServiceUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de servicio"
        description={`¿Está seguro de que desea dar de baja el servicio "${serviceToDelete?.service_name}"?`}
        itemName={serviceToDelete?.service_name}
      />
    </div>
  );
}
