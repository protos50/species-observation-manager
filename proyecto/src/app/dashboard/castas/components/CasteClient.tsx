"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Bug } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import { CreateCasteDialog } from "./CreateCasteDialog";
import { EditCasteDialog } from "./EditCasteDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { castesApi } from "@/lib/api/castes";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";
import { CanWrite, withoutActionsColumn } from "@/components/CanWrite";
import { useRoleAuth } from "@/hooks/use-role-auth";

type Caste = {
  id_caste: number;
  caste_name: string;
  deleted_at?: Date | string | null;
};

interface CasteClientProps {
  castes: Caste[];
}

export function CasteClient({ castes: initialCastes }: CasteClientProps) {
  const { canWrite } = useRoleAuth();
  const [activeCastes, setActiveCastes] = useState<Caste[]>(initialCastes);
  const [deletedCastes, setDeletedCastes] = useState<Caste[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingCaste, setEditingCaste] = useState<Caste | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [casteToDelete, setCasteToDelete] = useState<Caste | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [isCheckingReferences, setIsCheckingReferences] = useState(false);

  // Cargar castas dadas de baja al inicio
  const loadDeletedCastes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await castesApi.castes.getDeleted();
      setDeletedCastes(
        data.map((caste: any) => ({
          ...caste,
          deleted_at: caste.deleted_at ? new Date(caste.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar castas dadas de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar castas activas
  const loadActiveCastes = useCallback(async () => {
    try {
      const data = await castesApi.castes.getAll();
      setActiveCastes(data);
    } catch {
      console.error("Error al recargar castas activas");
    }
  }, []);

  // Verificar si una casta está en uso
  const handleDeleteClick = useCallback(
    async (caste: Caste) => {
      setCasteToDelete(caste);
      setIsCheckingReferences(true);
      try {
        const result = await castesApi.castes.checkIfInUse(caste.id_caste.toString());
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
    if (!casteToDelete) return;
    try {
      await castesApi.castes.delete(casteToDelete.id_caste.toString());
      setActiveCastes((prev) => prev.filter((c) => c.id_caste !== casteToDelete.id_caste));
      setDeletedCastes((prev) => [
        ...prev,
        { ...casteToDelete, deleted_at: new Date() },
      ]);
      toast.success(`La casta "${casteToDelete.caste_name}" fue dada de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setCasteToDelete(null);
    } catch (error) {
      console.error("Error al eliminar casta:", error);
      toast.error("Error al dar de baja la casta");
    }
  }, [casteToDelete]);

  // Función para manejar acciones de casta (restaurar)
  const handleCasteAction = useCallback(
    async (
      casteId: number,
      casteName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const caste = activeCastes.find((c) => c.id_caste === casteId);
          if (caste) {
            handleDeleteClick(caste);
          }
        } else {
          await castesApi.castes.restore(casteId.toString());
          const casteToRestore = deletedCastes.find((c) => c.id_caste === casteId);
          if (casteToRestore) {
            setDeletedCastes((prev) => prev.filter((c) => c.id_caste !== casteId));
            setActiveCastes((prev) => [
              ...prev,
              { ...casteToRestore, deleted_at: undefined },
            ]);
          }
          toast.success(`La casta "${casteName}" fue restaurada exitosamente`);
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} casta:`,
          error
        );
        await Promise.all([loadActiveCastes(), loadDeletedCastes()]);
      }
    },
    [activeCastes, deletedCastes, loadActiveCastes, loadDeletedCastes, handleDeleteClick]
  );

  // Método creado
  const handleCasteCreated = useCallback(async (newCaste: Caste) => {
    setActiveCastes((prev) => [...prev, newCaste]);
  }, []);

  // Método editado
  const handleCasteUpdated = useCallback(async (updatedCaste: Caste) => {
    setActiveCastes((prev) =>
      prev.map((caste) =>
        caste.id_caste === updatedCaste.id_caste ? updatedCaste : caste
      )
    );
  }, []);

  // Editar
  const handleEdit = useCallback((caste: Caste) => {
    setEditingCaste(caste);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingCaste(null);
  }, []);

  const columns = useMemo<ColumnDef<Caste>[]>(
    () => {
      const cols = getColumns(handleCasteAction, handleEdit);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleCasteAction, handleEdit, canWrite]
  );

  const deletedColumns = useMemo<ColumnDef<Caste>[]>(
    () => {
      const cols = getDeletedColumns(handleCasteAction);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleCasteAction, canWrite]
  );

  const activosCount = activeCastes.length;
  const bajaCount = deletedCastes.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedCastes();
  }, [loadDeletedCastes]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Bug className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Castas de Hormigas
          </h2>
        </div>
        <CanWrite>
          <CreateCasteDialog onCasteCreated={handleCasteCreated} />
        </CanWrite>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Castas activas
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
            Castas dadas de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeCastes} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando castas dadas de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedCastes.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay castas dadas de baja</p>
            </div>
          ) : (
            <ResponsiveDataList columns={deletedColumns} data={deletedCastes} />
          )}
        </TabsContent>
      </Tabs>

      <EditCasteDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        caste={editingCaste}
        onCasteUpdated={handleCasteUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de casta"
        description={`¿Está seguro de que desea dar de baja la casta "${casteToDelete?.caste_name}"?`}
        itemName={casteToDelete?.caste_name}
      />
    </div>
  );
}
