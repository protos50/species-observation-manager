"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Leaf } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

import { CreateEnvironmentDialog } from "./CreateEnvironmentDialog";
import { EditEnvironmentDialog } from "./EditEnvironmentDialog";
import { getColumns, getDeletedColumns } from "./Columns";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { locationApi } from "@/lib/api/location";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Environment = {
  id_environment: number;
  environment_name: string;
  _count?: {
    Observation: number;
  };
  deleted_at?: Date | string | null;
};

interface EnvironmentClientProps {
  environments: Environment[];
}

export function EnvironmentClient({
  environments: initialEnvironments,
}: EnvironmentClientProps) {
  const [activeEnvironments, setActiveEnvironments] =
    useState<Environment[]>(initialEnvironments);
  const [deletedEnvironments, setDeletedEnvironments] = useState<Environment[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingEnvironment, setEditingEnvironment] =
    useState<Environment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [environmentToDelete, setEnvironmentToDelete] = useState<Environment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);

  // Cargar ambientes dados de baja al inicio
  const loadDeletedEnvironments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await locationApi.environments.getDeleted();
      setDeletedEnvironments(
        data.map((env: any) => ({
          ...env,
          deleted_at: env.deleted_at ? new Date(env.deleted_at) : null,
        }))
      );
    } catch {
      setError("Error al cargar ambientes dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar ambientes activos
  const loadActiveEnvironments = useCallback(async () => {
    try {
      const data = await locationApi.environments.getAll();
      setActiveEnvironments(data);
    } catch {
      console.error("Error al recargar ambientes activos");
    }
  }, []);

  // Función para manejar acciones de ambiente (eliminar/restaurar)
  const handleDeleteClick = useCallback(
    async (environment: Environment) => {
      setEnvironmentToDelete(environment);
      try {
        const result = await locationApi.environments.checkIfInUse(environment.id_environment.toString());
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
    if (!environmentToDelete) return;
    try {
      await locationApi.environments.delete(environmentToDelete.id_environment.toString());
      setActiveEnvironments((prev) => prev.filter((e) => e.id_environment !== environmentToDelete.id_environment));
      setDeletedEnvironments((prev) => [
        ...prev,
        { ...environmentToDelete, deleted_at: new Date() },
      ]);
      toast.success(`El ambiente "${environmentToDelete.environment_name}" fue dado de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setEnvironmentToDelete(null);
    } catch (error) {
      console.error("Error al eliminar ambiente:", error);
      toast.error("Error al dar de baja el ambiente");
    }
  }, [environmentToDelete]);

  const handleEnvironmentAction = useCallback(
    async (
      environmentId: number,
      environmentName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const environment = activeEnvironments.find((e) => e.id_environment === environmentId);
          if (environment) {
            handleDeleteClick(environment);
          }
          // Remover de ambientes activos y agregar a eliminados
        } else {
          await locationApi.environments.restore(String(environmentId));
          // Remover de ambientes eliminados y agregar a activos
          const environmentToRestore = deletedEnvironments.find(
            (e) => e.id_environment === environmentId
          );
          if (environmentToRestore) {
            setDeletedEnvironments((prev) =>
              prev.filter((e) => e.id_environment !== environmentId)
            );
            setActiveEnvironments((prev) => [
              ...prev,
              { ...environmentToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(
          `Error al ${
            action === "delete" ? "eliminar" : "restaurar"
          } ambiente:`,
          error
        );
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([
          loadActiveEnvironments(),
          loadDeletedEnvironments(),
        ]);
        throw error;
      }
    },
    [
      activeEnvironments,
      deletedEnvironments,
      loadActiveEnvironments,
      loadDeletedEnvironments,
      handleDeleteClick
    ]
  );


  // Método creado
  const handleEnvironmentCreated = useCallback(
    async (newEnvironment: Environment) => {
      setActiveEnvironments((prev) => [...prev, newEnvironment]);
    },
    []
  );

  // Método editado
  const handleEnvironmentUpdated = useCallback(
    async (updatedEnvironment: Environment) => {
      setActiveEnvironments((prev) =>
        prev.map((env) =>
          env.id_environment === updatedEnvironment.id_environment
            ? updatedEnvironment
            : env
        )
      );
    },
    []
  );

  // Editar
  const handleEdit = useCallback((environment: Environment) => {
    setEditingEnvironment(environment);
    setIsEditDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setEditingEnvironment(null);
  }, []);

  const columns = useMemo<ColumnDef<Environment>[]>(
    () => getColumns(handleDeleteClick, handleEdit),
    [handleDeleteClick, handleEdit]
  );

  const deletedColumns = useMemo<ColumnDef<Environment>[]>(
    () => getDeletedColumns(handleEnvironmentAction),
    [handleEnvironmentAction]
  );

  // Calcular estadísticas
  const totalEnvironments = activeEnvironments.length;
  const environmentsInUse = activeEnvironments.filter(
    (env) => (env._count?.Observation || 0) > 0
  ).length;
  const totalObservations = activeEnvironments.reduce(
    (sum, env) => sum + (env._count?.Observation || 0),
    0
  );

  const activosCount = activeEnvironments.length;
  const bajaCount = deletedEnvironments.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedEnvironments();
  }, [loadDeletedEnvironments]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Tipos de Ambiente
          </h2>
        </div>
        <CreateEnvironmentDialog
          onEnvironmentCreated={handleEnvironmentCreated}
        />
      </div>

      {/* Estadísticas con Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Ambientes
            </CardTitle>
            <Leaf className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {totalEnvironments}
            </div>
            <CardDescription className="text-xs mt-1">
              Ambientes registrados en el sistema
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {environmentsInUse}
            </div>
            <CardDescription className="text-xs mt-1">
              Ambientes con observaciones asociadas
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Observaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {totalObservations}
            </div>
            <CardDescription className="text-xs mt-1">
              Observaciones en todos los ambientes
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
            Ambientes activos
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
            Ambientes dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeEnvironments} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando ambientes dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">
              {error}
            </div>
          ) : deletedEnvironments.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay ambientes dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedEnvironments}
            />
          )}
        </TabsContent>
      </Tabs>

      <EditEnvironmentDialog
        open={isEditDialogOpen}
        onOpenChange={handleCloseEditDialog}
        environment={editingEnvironment}
        onEnvironmentUpdated={handleEnvironmentUpdated}
      />

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de ambiente"
        description={`¿Está seguro de que desea dar de baja el ambiente "${environmentToDelete?.environment_name}"?`}
        itemName={environmentToDelete?.environment_name}
      />
    </div>
  );
}
