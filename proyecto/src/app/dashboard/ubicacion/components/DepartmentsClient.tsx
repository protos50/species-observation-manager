"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Building2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { CreateDepartmentDialog } from "./CreateDepartmentDialog";
import { getDepartmentColumns, getDeletedDepartmentColumns } from "./Columns";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { locationApi } from "@/lib/api/location";
import Link from "next/link";
import { CanWrite } from "@/components/CanWrite";

interface Department {
  id_department: number;
  id_province: number;
  department_name: string;
  Locality?: Array<{ id_locality: number }>;
  deleted_at?: string | null;
}

interface Province {
  id_province: number;
  province_name: string;
  id_country: number;
}

interface DepartmentsClientProps {
  provinceId: number;
  initialDepartments: Department[];
  province: Province;
}

export function DepartmentsClient({
  provinceId,
  initialDepartments,
  province,
}: DepartmentsClientProps) {
  const [activeDepartments, setActiveDepartments] = useState<Department[]>(initialDepartments);
  const [deletedDepartments, setDeletedDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [showInUseDialog, setShowInUseDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const loadDeletedDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationApi.departments.getDeleted();
      setDeletedDepartments(
        data
          .filter((d: Department) => d.id_province === provinceId)
          .map((department: any) => ({
            ...department,
            deleted_at: department.deleted_at ? new Date(department.deleted_at) : null,
          }))
      );
    } catch {
      toast.error("Error al cargar departamentos dados de baja");
    } finally {
      setLoading(false);
    }
  }, [provinceId]);

  const loadActiveDepartments = useCallback(async () => {
    try {
      const [departmentsData, localitiesData] = await Promise.all([
        locationApi.departments.getByProvince(String(provinceId)),
        locationApi.localities.getAll(),
      ]);

      const departmentsWithCount = departmentsData.map((department: Department) => ({
        ...department,
        Locality: localitiesData.filter(
          (l: any) => l.id_department === department.id_department
        ),
      }));

      setActiveDepartments(departmentsWithCount);
    } catch {
      toast.error("Error al recargar departamentos activos");
    }
  }, [provinceId]);

  const handleDepartmentAction = useCallback(
    async (
      departmentId: number,
      departmentName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          await locationApi.departments.delete(String(departmentId));
          const departmentToDelete = activeDepartments.find(
            (d) => d.id_department === departmentId
          );
          if (departmentToDelete) {
            setActiveDepartments((prev) =>
              prev.filter((d) => d.id_department !== departmentId)
            );
            setDeletedDepartments((prev) => [
              ...prev,
              { ...departmentToDelete, deleted_at: new Date() },
            ]);
          }
        } else {
          await locationApi.departments.restore(String(departmentId));
          const departmentToRestore = deletedDepartments.find(
            (d) => d.id_department === departmentId
          );
          if (departmentToRestore) {
            setDeletedDepartments((prev) =>
              prev.filter((d) => d.id_department !== departmentId)
            );
            setActiveDepartments((prev) => [
              ...prev,
              { ...departmentToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(`Error al ${action === "delete" ? "eliminar" : "restaurar"} departamento:`, error);
        await Promise.all([loadActiveDepartments(), loadDeletedDepartments()]);
        throw error;
      }
    },
    [activeDepartments, deletedDepartments, loadActiveDepartments, loadDeletedDepartments]
  );

  const handleDeleteWithCheck = useCallback(
    async (department: Department) => {
      try {
        const inUseData = await locationApi.departments.checkIfInUse(
          String(department.id_department)
        );

        if (inUseData.inUse && inUseData.count > 0) {
          setInUseInfo(inUseData);
          setPendingDeleteId(department.id_department);
          setShowInUseDialog(true);
          return;
        }

        await handleDepartmentAction(
          department.id_department,
          department.department_name,
          "delete"
        );
        toast.success(`El departamento "${department.department_name}" fue dado de baja exitosamente`);
      } catch (error) {
        toast.error("Error al dar de baja el departamento");
      }
    },
    [handleDepartmentAction]
  );

  const handleForceDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    const department = activeDepartments.find((d) => d.id_department === pendingDeleteId);
    if (!department) return;

    try {
      await handleDepartmentAction(department.id_department, department.department_name, "delete");
      toast.success(`El departamento "${department.department_name}" fue eliminado exitosamente`);
      setShowInUseDialog(false);
      setPendingDeleteId(null);
      setInUseInfo(null);
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  }, [pendingDeleteId, activeDepartments, handleDepartmentAction]);

  const handleEdit = useCallback((department: Department) => {
    setEditingDepartment(department);
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setEditingDepartment(null);
  }, []);

  const columns = useMemo<ColumnDef<Department>[]>(
    () => getDepartmentColumns(handleEdit, handleDeleteWithCheck),
    [handleEdit, handleDeleteWithCheck]
  );

  const deletedColumns = useMemo<ColumnDef<Department>[]>(
    () => getDeletedDepartmentColumns((department) =>
      handleDepartmentAction(department.id_department, department.department_name, "restore")
        .then(() => toast.success(`El departamento "${department.department_name}" fue restaurado exitosamente`))
        .catch(() => toast.error("Error al restaurar el departamento"))
    ),
    [handleDepartmentAction]
  );

  const activosCount = activeDepartments.length;
  const bajaCount = deletedDepartments.length;

  useEffect(() => {
    loadDeletedDepartments();
  }, [loadDeletedDepartments]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/ubicacion/countries/${province.id_country}/provinces`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                Departamentos de {province.province_name}
              </h2>
            </div>
          </div>
        </div>
        <CanWrite>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        </CanWrite>
      </div>

      <CreateDepartmentDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={() => {
          loadActiveDepartments();
          handleCloseDialog();
        }}
        provinceId={provinceId}
        editingDepartment={editingDepartment}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Departamentos activos
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
            Departamentos dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeDepartments} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando departamentos dados de baja...</p>
            </div>
          ) : deletedDepartments.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay departamentos dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedDepartments}
            />
          )}
        </TabsContent>
      </Tabs>

      <InUseAlertDialog
        open={showInUseDialog}
        onOpenChange={setShowInUseDialog}
        inUseInfo={inUseInfo}
        onConfirm={handleForceDelete}
        title="Departamento en Uso"
        description={`Este departamento está siendo utilizado por ${
          inUseInfo?.count || 0
        } localidad(es). Puedes eliminarlo de todas formas, pero las localidades quedarán sin departamento asociado.`}
        itemName={
          activeDepartments.find((d) => d.id_department === pendingDeleteId)
            ?.department_name
        }
      />
    </div>
  );
}

