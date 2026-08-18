"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { FlaskConical } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import ResponsiveDataList from "@/components/ResponsiveDataList";
import { CreateMethodDialog } from "@/app/dashboard/metodos-preservacion/components/CreateMethodDialog";
import { EditMethodDialog } from "./EditMethodDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import { preservationApi } from "@/lib/api/preservation";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";
import { CanWrite, withoutActionsColumn } from "@/components/CanWrite";
import { useRoleAuth } from "@/hooks/use-role-auth";

type PreservationMethod = {
  id_preservation_method: number;
  method_name: string;
  deleted_at?: Date | string | null;
};

interface MethodClientProps {
  methods: PreservationMethod[];
}

export function MethodClient({ methods: initialMethods }: MethodClientProps) {
  const { canWrite } = useRoleAuth();
  const [activeMethods, setActiveMethods] =
    useState<PreservationMethod[]>(initialMethods);
  const [deletedMethods, setDeletedMethods] = useState<PreservationMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingMethod, setEditingMethod] =
    useState<PreservationMethod | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PreservationMethod | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [isCheckingReferences, setIsCheckingReferences] = useState(false);

  // Cargar métodos dados de baja al inicio
  const loadDeletedMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await preservationApi.preservationMethods.getDeleted();
      setDeletedMethods(
        data.map((method: any) => ({
          ...method,
          deleted_at: method.deleted_at ? new Date(method.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar métodos dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar métodos activos
  const loadActiveMethods = useCallback(async () => {
    try {
      const data = await preservationApi.preservationMethods.getAll();
      setActiveMethods(data);
    } catch {
      console.error("Error al recargar métodos activos");
    }
  }, []);

  // Verificar si un método está en uso
  const handleDeleteClick = useCallback(
    async (method: PreservationMethod) => {
      setMethodToDelete(method);
      setIsCheckingReferences(true);
      try {
        const result = await preservationApi.preservationMethods.checkIfInUse(method.id_preservation_method.toString());
        setInUseInfo(result);
        setIsDeleteDialogOpen(true);
      } catch (error) {
        console.error("Error checking references:", error);
        toast.error("Error al verificar referencias");
      } finally {
        setIsCheckingReferences(false);
      }
    },
    []
  );

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!methodToDelete) return;
    try {
      await preservationApi.preservationMethods.delete(methodToDelete.id_preservation_method.toString());
      setActiveMethods((prev) => prev.filter((m) => m.id_preservation_method !== methodToDelete.id_preservation_method));
      setDeletedMethods((prev) => [
        ...prev,
        { ...methodToDelete, deleted_at: new Date() },
      ]);
      toast.success(`El método "${methodToDelete.method_name}" fue dado de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setMethodToDelete(null);
    } catch (error) {
      console.error("Error al eliminar método:", error);
      toast.error("Error al dar de baja el método");
    }
  }, [methodToDelete]);

  // Función para manejar acciones de método (restaurar)
  const handleMethodAction = useCallback(
    async (
      methodId: number,
      methodName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const method = activeMethods.find((m) => m.id_preservation_method === methodId);
          if (method) {
            handleDeleteClick(method);
          }
        } else {
          await preservationApi.preservationMethods.restore(methodId.toString());
          // Remover de métodos eliminados y agregar a activos
          const methodToRestore = deletedMethods.find(
            (m) => m.id_preservation_method === methodId
          );
          if (methodToRestore) {
            setDeletedMethods((prev) =>
              prev.filter((m) => m.id_preservation_method !== methodId)
            );
            setActiveMethods((prev) => [
              ...prev,
              { ...methodToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} método:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveMethods(), loadDeletedMethods()]);
      }
    },
    [activeMethods, deletedMethods, loadActiveMethods, loadDeletedMethods, handleDeleteClick]
  );

  // Método creado
  const handleMethodCreated = useCallback(
    async (newMethod: PreservationMethod) => {
      setActiveMethods((prev) => [...prev, newMethod]);
    },
    []
  );

  // Método editado
  const handleMethodUpdated = useCallback(
    async (updatedMethod: PreservationMethod) => {
      setActiveMethods((prev) =>
        prev.map((method) =>
          method.id_preservation_method === updatedMethod.id_preservation_method
            ? updatedMethod
            : method
        )
      );
    },
    []
  );

  // Editar
  const handleEdit = useCallback((method: PreservationMethod) => {
    setEditingMethod(method);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingMethod(null);
  }, []);

  const columns = useMemo<ColumnDef<PreservationMethod>[]>(
    () => {
      const cols = getColumns(handleMethodAction, handleEdit);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleMethodAction, handleEdit, canWrite]
  );

  const deletedColumns = useMemo<ColumnDef<PreservationMethod>[]>(
    () => {
      const cols = getDeletedColumns(handleMethodAction);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleMethodAction, canWrite]
  );

  const activosCount = activeMethods.length;
  const bajaCount = deletedMethods.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedMethods();
  }, [loadDeletedMethods]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <FlaskConical className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Métodos de preservación
          </h2>
        </div>
        <CanWrite>
          <CreateMethodDialog onMethodCreated={handleMethodCreated} />
        </CanWrite>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Métodos activos
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
            Métodos dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeMethods} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando métodos dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedMethods.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay métodos dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedMethods}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditMethodDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        method={editingMethod}
        onMethodUpdated={handleMethodUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de método de preservación"
        description={`¿Está seguro de que desea dar de baja el método "${methodToDelete?.method_name}"?`}
        itemName={methodToDelete?.method_name}
      />
    </div>
  );
}
