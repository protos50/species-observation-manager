"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { MapPin } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { CreateLocalityDialog } from "./CreateLocalityDialog";
import { getLocalityColumns, getDeletedLocalityColumns } from "./Columns";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { locationApi } from "@/lib/api/location";
import Link from "next/link";
import { CanWrite } from "@/components/CanWrite";

interface Locality {
  id_locality: number;
  id_department: number;
  locality_name: string;
  _count?: {
    Geolocation: number;
    ClimateData: number;
    Observations?: number;
  };
  deleted_at?: string | null;
}

interface Department {
  id_department: number;
  department_name: string;
  id_province: number;
}

interface LocalitiesClientProps {
  departmentId: number;
  initialLocalities: Locality[];
  department: Department;
}

export function LocalitiesClient({
  departmentId,
  initialLocalities,
  department,
}: LocalitiesClientProps) {
  const [activeLocalities, setActiveLocalities] = useState<Locality[]>(initialLocalities);
  const [deletedLocalities, setDeletedLocalities] = useState<Locality[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [showInUseDialog, setShowInUseDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const loadDeletedLocalities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationApi.localities.getDeleted();
      setDeletedLocalities(
        data
          .filter((l: Locality) => l.id_department === departmentId)
          .map((locality: any) => ({
            ...locality,
            deleted_at: locality.deleted_at ? new Date(locality.deleted_at) : null,
          }))
      );
    } catch {
      toast.error("Error al cargar localidades dadas de baja");
    } finally {
      setLoading(false);
    }
  }, [departmentId]);

  const loadActiveLocalities = useCallback(async () => {
    try {
      const data = await locationApi.localities.getByDepartment(String(departmentId));
      setActiveLocalities(data);
    } catch {
      toast.error("Error al recargar localidades activas");
    }
  }, [departmentId]);

  const handleLocalityAction = useCallback(
    async (
      localityId: number,
      localityName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          await locationApi.localities.delete(String(localityId));
          const localityToDelete = activeLocalities.find(
            (l) => l.id_locality === localityId
          );
          if (localityToDelete) {
            setActiveLocalities((prev) =>
              prev.filter((l) => l.id_locality !== localityId)
            );
            setDeletedLocalities((prev) => [
              ...prev,
              { ...localityToDelete, deleted_at: new Date() },
            ]);
          }
        } else {
          await locationApi.localities.restore(String(localityId));
          const localityToRestore = deletedLocalities.find(
            (l) => l.id_locality === localityId
          );
          if (localityToRestore) {
            setDeletedLocalities((prev) =>
              prev.filter((l) => l.id_locality !== localityId)
            );
            setActiveLocalities((prev) => [
              ...prev,
              { ...localityToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(`Error al ${action === "delete" ? "eliminar" : "restaurar"} localidad:`, error);
        await Promise.all([loadActiveLocalities(), loadDeletedLocalities()]);
        throw error;
      }
    },
    [activeLocalities, deletedLocalities, loadActiveLocalities, loadDeletedLocalities]
  );

  const handleDeleteWithCheck = useCallback(
    async (locality: Locality) => {
      try {
        const inUseData = await locationApi.localities.checkIfInUse(
          String(locality.id_locality)
        );

        if (inUseData.inUse && inUseData.count > 0) {
          setInUseInfo(inUseData);
          setPendingDeleteId(locality.id_locality);
          setShowInUseDialog(true);
          return;
        }

        await handleLocalityAction(
          locality.id_locality,
          locality.locality_name,
          "delete"
        );
        toast.success(`La localidad "${locality.locality_name}" fue dada de baja exitosamente`);
      } catch (error) {
        toast.error("Error al dar de baja la localidad");
      }
    },
    [handleLocalityAction]
  );

  const handleForceDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    const locality = activeLocalities.find((l) => l.id_locality === pendingDeleteId);
    if (!locality) return;

    try {
      await handleLocalityAction(locality.id_locality, locality.locality_name, "delete");
      toast.success(`La localidad "${locality.locality_name}" fue eliminada exitosamente`);
      setShowInUseDialog(false);
      setPendingDeleteId(null);
      setInUseInfo(null);
    } catch (error) {
      console.error("Error deleting locality:", error);
    }
  }, [pendingDeleteId, activeLocalities, handleLocalityAction]);

  const handleEdit = useCallback((locality: Locality) => {
    setEditingLocality(locality);
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setEditingLocality(null);
  }, []);

  const columns = useMemo<ColumnDef<Locality>[]>(
    () => getLocalityColumns(handleEdit, handleDeleteWithCheck),
    [handleEdit, handleDeleteWithCheck]
  );

  const deletedColumns = useMemo<ColumnDef<Locality>[]>(
    () => getDeletedLocalityColumns((locality) =>
      handleLocalityAction(locality.id_locality, locality.locality_name, "restore")
        .then(() => toast.success(`La localidad "${locality.locality_name}" fue restaurada exitosamente`))
        .catch(() => toast.error("Error al restaurar la localidad"))
    ),
    [handleLocalityAction]
  );

  const activosCount = activeLocalities.length;
  const bajaCount = deletedLocalities.length;

  useEffect(() => {
    loadDeletedLocalities();
  }, [loadDeletedLocalities]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/ubicacion/provinces/${department.id_province}/departments`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                Localidades de {department.department_name}
              </h2>
            </div>
          </div>
        </div>
        <CanWrite>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Localidad
          </Button>
        </CanWrite>
      </div>

      <CreateLocalityDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={() => {
          loadActiveLocalities();
          handleCloseDialog();
        }}
        departmentId={departmentId}
        editingLocality={editingLocality}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Localidades activas
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
            >
              {activosCount}
            </Badge>
          </TabsTrigger>

          <TabsTrigger
            value="baja"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Localidades dadas de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeLocalities} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando localidades dadas de baja...</p>
            </div>
          ) : deletedLocalities.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay localidades dadas de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedLocalities}
            />
          )}
        </TabsContent>
      </Tabs>

      <InUseAlertDialog
        open={showInUseDialog}
        onOpenChange={setShowInUseDialog}
        inUseInfo={inUseInfo}
        onConfirm={handleForceDelete}
        title="Localidad en Uso"
        description={`Esta localidad está siendo utilizada por ${
          inUseInfo?.count || 0
        } elemento(s). Puedes eliminarla de todas formas, pero los elementos quedarán sin localidad asociada.`}
        itemName={
          activeLocalities.find((l) => l.id_locality === pendingDeleteId)
            ?.locality_name
        }
      />
    </div>
  );
}

