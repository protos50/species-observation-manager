"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { CloudSun, Plus } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { CreateClimateDataDialog } from "./CreateClimateDataDialog";
import { EditClimateDataDialog } from "./EditClimateDataDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { locationApi } from "@/lib/api/location";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CanWrite, withoutActionsColumn } from "@/components/CanWrite";
import { useRoleAuth } from "@/hooks/use-role-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ClimateData = {
  id_climate_data: number;
  id_locality: number;
  climate_date: string;
  t_min?: number;
  t_max?: number;
  t_med?: number;
  hr_min?: number;
  hr_max?: number;
  hr_med?: number;
  pp_14_days_before?: number;
  pp_30_days_before?: number;
  deleted_at?: Date | string | null;
  locality?: {
    locality_name: string;
    department?: {
      department_name: string;
      province?: {
        province_name: string;
        country?: {
          country_name: string;
        };
      };
    };
  };
};

interface ClimateDataClientProps {
  climateData: ClimateData[];
}

export function ClimateDataClient({
  climateData: initialClimateData,
}: ClimateDataClientProps) {
  const { canWrite } = useRoleAuth();
  const [activeClimateData, setActiveClimateData] = useState<ClimateData[]>(initialClimateData);
  const [deletedClimateData, setDeletedClimateData] = useState<ClimateData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingClimateData, setEditingClimateData] = useState<ClimateData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [showInUseDialog, setShowInUseDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Cargar datos climáticos dados de baja al inicio
  const loadDeletedClimateData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationApi.climateData.getDeleted();
      setDeletedClimateData(
        data.map((item: any) => ({
          ...item,
          deleted_at: item.deleted_at ? new Date(item.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar datos climáticos dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar datos climáticos activos
  const loadActiveClimateData = useCallback(async () => {
    try {
      const data = await locationApi.climateData.getAll();
      setActiveClimateData(data);
    } catch {
      console.error("Error al recargar datos climáticos activos");
    }
  }, []);

  // Función para manejar acciones de datos climáticos (eliminar/restaurar)
  const handleClimateDataAction = useCallback(
    async (
      climateDataId: number,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          await locationApi.climateData.delete(String(climateDataId));
          // Remover de datos activos y agregar a eliminados
          const dataToDelete = activeClimateData.find(
            (d) => d.id_climate_data === climateDataId
          );
          if (dataToDelete) {
            setActiveClimateData((prev) =>
              prev.filter((d) => d.id_climate_data !== climateDataId)
            );
            setDeletedClimateData((prev) => [
              ...prev,
              { ...dataToDelete, deleted_at: new Date() },
            ]);
          }
        } else {
          await locationApi.climateData.restore(String(climateDataId));
          // Recargar ambas listas para asegurar consistencia
          await Promise.all([loadActiveClimateData(), loadDeletedClimateData()]);
          toast.success("Datos climáticos restaurados exitosamente");
        }
      } catch (error) {
        console.error(
          `Error al ${action === "delete" ? "eliminar" : "restaurar"} datos climáticos:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveClimateData(), loadDeletedClimateData()]);
        throw error;
      }
    },
    [
      activeClimateData,
      loadActiveClimateData,
      loadDeletedClimateData,
    ]
  );

  // Función para manejar eliminación con verificación
  const handleDeleteWithCheck = useCallback(async (id: number) => {
    try {
      // Primero verificar si está en uso
      const inUseData = await locationApi.climateData.checkIfInUse(id.toString());
      
      if (inUseData.inUse) {
        setInUseInfo(inUseData);
        setPendingDeleteId(id);
        setShowInUseDialog(true);
        return;
      }

      // Si no está en uso, proceder con eliminación
      const dataToDelete = activeClimateData.find(
        (d) => d.id_climate_data === id
      );
      await handleClimateDataAction(id, "delete");
      
      if (dataToDelete) {
        const locationText = dataToDelete.locality
          ? [
              dataToDelete.locality.locality_name,
              dataToDelete.locality.department?.department_name,
            ]
            .filter(Boolean)
            .join(", ")
          : "registro";
        toast.success(
          `Datos climáticos de ${locationText} eliminados exitosamente`
        );
      }
    } catch (error) {
      console.error("Error checking if in use:", error);
      toast.error("Error al verificar el uso del registro");
    }
  }, [activeClimateData, handleClimateDataAction]);

  // Función para forzar eliminación después del aviso
  const handleForceDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    try {
      const dataToDelete = activeClimateData.find(
        (d) => d.id_climate_data === pendingDeleteId
      );
      await handleClimateDataAction(pendingDeleteId, "delete");
      
      if (dataToDelete) {
        const locationText = dataToDelete.locality
          ? [
              dataToDelete.locality.locality_name,
              dataToDelete.locality.department?.department_name,
            ]
            .filter(Boolean)
            .join(", ")
          : "registro";
        toast.success(
          `Datos climáticos de ${locationText} eliminados exitosamente`
        );
      }
      
      setShowInUseDialog(false);
      setPendingDeleteId(null);
      setInUseInfo(null);
    } catch (error) {
      console.error("Error deleting climate data:", error);
      toast.error("Error al eliminar los datos climáticos");
    }
  }, [pendingDeleteId, activeClimateData, handleClimateDataAction]);

  // Método creado
  const handleClimateDataCreated = useCallback(
    async (newClimateData: ClimateData) => {
      setActiveClimateData((prev) => [...prev, newClimateData]);
    },
    []
  );

  // Método editado
  const handleClimateDataUpdated = useCallback(
    async (updatedClimateData: ClimateData) => {
      setActiveClimateData((prev) =>
        prev.map((data) =>
          data.id_climate_data === updatedClimateData.id_climate_data
            ? updatedClimateData
            : data
        )
      );
    },
    []
  );

  // Editar
  const handleEdit = useCallback((climateData: ClimateData) => {
    setEditingClimateData(climateData);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingClimateData(null);
  }, []);

  const columns = useMemo<ColumnDef<ClimateData>[]>(
    () => {
      const cols = getColumns(handleClimateDataAction, handleEdit, handleDeleteWithCheck);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleClimateDataAction, handleEdit, handleDeleteWithCheck, canWrite]
  );

  const deletedColumns = useMemo<ColumnDef<ClimateData>[]>(
    () => {
      const cols = getDeletedColumns(handleClimateDataAction);
      return canWrite() ? cols : withoutActionsColumn(cols);
    },
    [handleClimateDataAction, canWrite]
  );

  // Calcular estadísticas
  const totalRecords = activeClimateData.length;
  const uniqueLocalities = new Set(activeClimateData.map((d) => d.id_locality)).size;
  const uniqueDates = new Set(
    activeClimateData.map((d) => new Date(d.climate_date).toISOString().split("T")[0])
  ).size;

  const activosCount = activeClimateData.length;
  const bajaCount = deletedClimateData.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedClimateData();
  }, [loadDeletedClimateData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <CloudSun className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Datos Climáticos
          </h2>
        </div>
        <CanWrite>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Registro
          </Button>
        </CanWrite>
      </div>

      {/* Estadísticas con Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
            <CloudSun className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">{totalRecords}</div>
            <CardDescription className="text-xs mt-1">
              Registros de datos climáticos
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Localidades Únicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{uniqueLocalities}</div>
            <CardDescription className="text-xs mt-1">
              Localidades con datos climáticos
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechas Únicas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{uniqueDates}</div>
            <CardDescription className="text-xs mt-1">
              Fechas diferentes registradas
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Registros activos
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
            Registros dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeClimateData} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando registros dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedClimateData.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay registros dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList columns={deletedColumns} data={deletedClimateData} />
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de aviso cuando hay observaciones asociadas */}
      <InUseAlertDialog
        open={showInUseDialog}
        onOpenChange={setShowInUseDialog}
        inUseInfo={inUseInfo}
        onConfirm={handleForceDelete}
        title="Datos Climáticos en Uso"
        description={`Este registro de datos climáticos está siendo utilizado por ${inUseInfo?.count || 0} observación(es). Puedes eliminarlo de todas formas, pero las observaciones quedarán sin datos climáticos.`}
      />

      <CreateClimateDataDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={(data) => {
          handleClimateDataCreated(data);
          setIsCreateDialogOpen(false);
        }}
      />

      <EditClimateDataDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        climateData={editingClimateData}
        onClimateDataUpdated={handleClimateDataUpdated}
      />
    </div>
  );
}

