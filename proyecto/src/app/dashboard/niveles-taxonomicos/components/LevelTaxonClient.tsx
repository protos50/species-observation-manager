"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { BoxesIcon } from "lucide-react";

import type { ColumnDef } from "@tanstack/react-table";

import ResponsiveDataList from "@/components/ResponsiveDataList";
import { CreateLevelTaxonDialog } from "./CreateLevelTaxonDialog";
import { EditLevelTaxonDialog } from "./EditLevelTaxonDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import { taxonomyApi } from "@/lib/api/taxonomy";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import { toast } from "sonner";

type TaxonomicLevel = {
  id_taxonomic_level: number;
  name: string;
  deleted_at?: Date | string | null;
};

interface LevelTaxonClientProps {
  levels: TaxonomicLevel[];
}

export function LevelTaxonClient({
  levels: initialLevels,
}: LevelTaxonClientProps) {
  const [activeLevelTaxons, setActiveLevelTaxons] =
    useState<TaxonomicLevel[]>(initialLevels);
  const [deletedLevelTaxons, setDeletedLevelTaxons] = useState<TaxonomicLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingLevel, setEditingLevel] = useState<TaxonomicLevel | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState<TaxonomicLevel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);

  // Cargar niveles dados de baja al inicio
  const loadDeletedLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await taxonomyApi.levels.getDeleted();
      setDeletedLevelTaxons(
        data.map((level: any) => ({
          ...level,
          deleted_at: level.deleted_at ? new Date(level.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar niveles dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar niveles activos
  const loadActiveLevels = useCallback(async () => {
    try {
      const data = await taxonomyApi.levels.getAll();
      setActiveLevelTaxons(data);
    } catch {
      console.error("Error al recargar niveles activos");
    }
  }, []);

  // Función para manejar acciones de nivel (eliminar/restaurar)
  const handleDeleteClick = useCallback(
    async (level: TaxonomicLevel) => {
      setLevelToDelete(level);
      try {
        const result = await taxonomyApi.levels.checkIfInUse(level.id_taxonomic_level.toString());
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
    if (!levelToDelete) return;
    try {
      await taxonomyApi.levels.delete(levelToDelete.id_taxonomic_level);
      setActiveLevelTaxons((prev) => prev.filter((l) => l.id_taxonomic_level !== levelToDelete.id_taxonomic_level));
      setDeletedLevelTaxons((prev) => [
        ...prev,
        { ...levelToDelete, deleted_at: new Date() },
      ]);
      toast.success(`El nivel taxonómico "${levelToDelete.name}" fue dado de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setLevelToDelete(null);
    } catch (error) {
      console.error("Error al eliminar nivel:", error);
      toast.error("Error al dar de baja el nivel taxonómico");
    }
  }, [levelToDelete]);

  const handleLevelAction = useCallback(
    async (
      levelId: number,
      levelName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const level = activeLevelTaxons.find((l) => l.id_taxonomic_level === levelId);
          if (level) {
            handleDeleteClick(level);
          }
          // Remover de niveles activos y agregar a eliminados
        } else {
          await taxonomyApi.levels.restore(levelId);
          // Remover de niveles eliminados y agregar a activos
          const levelToRestore = deletedLevelTaxons.find(
            (l) => l.id_taxonomic_level === levelId
          );
          if (levelToRestore) {
            setDeletedLevelTaxons((prev) =>
              prev.filter((l) => l.id_taxonomic_level !== levelId)
            );
            setActiveLevelTaxons((prev) => [
              ...prev,
              { ...levelToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} nivel:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveLevels(), loadDeletedLevels()]);
      }
    },
    [activeLevelTaxons, deletedLevelTaxons, loadActiveLevels, loadDeletedLevels, handleDeleteClick]
  );

  // Método creado
  const handleLevelTaxonCreated = useCallback(
    async (newLevelTaxon: TaxonomicLevel) => {
      setActiveLevelTaxons((prev) => [...prev, newLevelTaxon]);
    },
    []
  );

  // Método editado
  const handleLevelUpdated = useCallback(async (updatedLevel: TaxonomicLevel) => {
    setActiveLevelTaxons((prev) =>
      prev.map((level) =>
        level.id_taxonomic_level === updatedLevel.id_taxonomic_level
          ? updatedLevel
          : level
      )
    );
  }, []);

  // Editar
  const handleEdit = useCallback((level: TaxonomicLevel) => {
    setEditingLevel(level);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingLevel(null);
  }, []);

  const columns = useMemo<ColumnDef<TaxonomicLevel>[]>(
    () => getColumns(handleLevelAction, handleEdit),
    [handleLevelAction, handleEdit]
  );

  const deletedColumns = useMemo<ColumnDef<TaxonomicLevel>[]>(
    () => getDeletedColumns(handleLevelAction),
    [handleLevelAction]
  );

  const activosCount = activeLevelTaxons.length;
  const bajaCount = deletedLevelTaxons.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedLevels();
  }, [loadDeletedLevels]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <BoxesIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Niveles taxonómicos
          </h2>
        </div>
        <CreateLevelTaxonDialog onLevelTaxonCreated={handleLevelTaxonCreated} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Niveles activos
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
            Niveles dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeLevelTaxons} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando niveles dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedLevelTaxons.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay niveles dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedLevelTaxons}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditLevelTaxonDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        level={editingLevel}
        onLevelUpdated={handleLevelUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de nivel taxonómico"
        description={`¿Está seguro de que desea dar de baja el nivel taxonómico "${levelToDelete?.name}"?`}
        itemName={levelToDelete?.name}
      />
    </div>
  );
}
