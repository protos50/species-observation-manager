"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { PawPrint } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import { CreateTrampDialog } from "./CreateTrampDialog";
import { EditTrapDialog } from "./EditTrapDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { trapsApi } from "@/lib/api/traps";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";
import { CanWrite, withoutActionsColumn } from "@/components/CanWrite";
import { useRoleAuth } from "@/hooks/use-role-auth";

type Trap = {
  id_trap: number;
  trap_name: string;
  deleted_at?: Date | string | null;
};

interface TrapClientProps {
  traps: Trap[];
}

export function TrapClient({ traps: initialTraps }: TrapClientProps) {
  const { canWrite } = useRoleAuth();
  const [activeTraps, setActiveTraps] = useState<Trap[]>(initialTraps);
  const [deletedTraps, setDeletedTraps] = useState<Trap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingTrap, setEditingTrap] = useState<Trap | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [trapToDelete, setTrapToDelete] = useState<Trap | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);

  // Cargar trampas dadas de baja al inicio
  const loadDeletedTraps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await trapsApi.traps.getDeleted();
      setDeletedTraps(
        data.map((trap: any) => ({
          ...trap,
          deleted_at: trap.deleted_at ? new Date(trap.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar trampas dadas de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar trampas activas
  const loadActiveTraps = useCallback(async () => {
    try {
      const data = await trapsApi.traps.getAll();
      setActiveTraps(data);
    } catch {
      console.error("Error al recargar trampas activas");
    }
  }, []);

  // Verificar si una trampa está en uso
  const handleDeleteClick = useCallback(
    async (trap: Trap) => {
      setTrapToDelete(trap);
      try {
        const result = await trapsApi.traps.checkIfInUse(trap.id_trap.toString());
        setInUseInfo(result);
        setIsDeleteDialogOpen(true);
      } catch (error) {
        console.error("Error checking references:", error);
        toast.error("Error al verificar referencias");
      }
    },
    []
  );

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(async () => {
    if (!trapToDelete) return;
    try {
      await trapsApi.traps.delete(trapToDelete.id_trap.toString());
      setActiveTraps((prev) => prev.filter((t) => t.id_trap !== trapToDelete.id_trap));
      setDeletedTraps((prev) => [
        ...prev,
        { ...trapToDelete, deleted_at: new Date() },
      ]);
      toast.success(`La trampa "${trapToDelete.trap_name}" fue dada de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setTrapToDelete(null);
    } catch (error) {
      console.error("Error al eliminar trampa:", error);
      toast.error("Error al dar de baja la trampa");
    }
  }, [trapToDelete]);

  // Función para manejar acciones de trampa (restaurar)
  const handleTrapAction = useCallback(
    async (
      trapId: number,
      trapName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const trap = activeTraps.find((t) => t.id_trap === trapId);
          if (trap) {
            handleDeleteClick(trap);
          }
        } else {
          await trapsApi.traps.restore(trapId.toString());
          // Remover de trampas eliminadas y agregar a activas
          const trapToRestore = deletedTraps.find((t) => t.id_trap === trapId);
          if (trapToRestore) {
            setDeletedTraps((prev) => prev.filter((t) => t.id_trap !== trapId));
            setActiveTraps((prev) => [
              ...prev,
              { ...trapToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} trampa:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveTraps(), loadDeletedTraps()]);
      }
    },
    [activeTraps, deletedTraps, loadActiveTraps, loadDeletedTraps, handleDeleteClick]
  );

  // Método creado
  const handleTrampCreated = useCallback(async (newTrap: Trap) => {
    setActiveTraps((prev) => [...prev, newTrap]);
  }, []);

  // Método editado
  const handleTrapUpdated = useCallback(async (updatedTrap: Trap) => {
    setActiveTraps((prev) =>
      prev.map((trap) =>
        trap.id_trap === updatedTrap.id_trap ? updatedTrap : trap
      )
    );
  }, []);

  // Editar
  const handleEdit = useCallback((trap: Trap) => {
    setEditingTrap(trap);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingTrap(null);
  }, []);

  const columns = useMemo<ColumnDef<Trap>[]>(
    () => {
      const cols = getColumns(handleTrapAction, handleEdit);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleTrapAction, handleEdit, canWrite]
  );

  const deletedColumns = useMemo<ColumnDef<Trap>[]>(
    () => {
      const cols = getDeletedColumns(handleTrapAction);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleTrapAction, canWrite]
  );

  const activosCount = activeTraps.length;
  const bajaCount = deletedTraps.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedTraps();
  }, [loadDeletedTraps]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Tipos de trampas
          </h2>
        </div>
        <CanWrite>
          <CreateTrampDialog onTrampCreated={handleTrampCreated} />
        </CanWrite>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Trampas activas
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
            Trampas dadas de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeTraps} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando trampas dadas de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedTraps.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay trampas dadas de baja</p>
            </div>
          ) : (
            <ResponsiveDataList columns={deletedColumns} data={deletedTraps} />
          )}
        </TabsContent>
      </Tabs>

      <EditTrapDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        trap={editingTrap}
        onTrapUpdated={handleTrapUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de trampa"
        description={`¿Está seguro de que desea dar de baja la trampa "${trapToDelete?.trap_name}"?`}
        itemName={trapToDelete?.trap_name}
      />
    </div>
  );
}
