"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Map } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { CreateProvinceDialog } from "./CreateProvinceDialog";
import { getProvinceColumns, getDeletedProvinceColumns } from "./Columns";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { locationApi } from "@/lib/api/location";
import Link from "next/link";
import { CanWrite } from "@/components/CanWrite";

interface Province {
  id_province: number;
  id_country: number;
  province_name: string;
  Department?: Array<{ id_department: number }>;
  deleted_at?: string | null;
}

interface Country {
  id_country: number;
  country_name: string;
}

interface ProvincesClientProps {
  countryId: number;
  initialProvinces: Province[];
  country: Country;
}

export function ProvincesClient({
  countryId,
  initialProvinces,
  country,
}: ProvincesClientProps) {
  const [activeProvinces, setActiveProvinces] = useState<Province[]>(initialProvinces);
  const [deletedProvinces, setDeletedProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);
  const [showInUseDialog, setShowInUseDialog] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const loadDeletedProvinces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationApi.provinces.getDeleted();
      setDeletedProvinces(
        data
          .filter((p: Province) => p.id_country === countryId)
          .map((province: any) => ({
            ...province,
            deleted_at: province.deleted_at ? new Date(province.deleted_at) : null,
          }))
      );
    } catch {
      toast.error("Error al cargar provincias dadas de baja");
    } finally {
      setLoading(false);
    }
  }, [countryId]);

  const loadActiveProvinces = useCallback(async () => {
    try {
      const [provincesData, departmentsData] = await Promise.all([
        locationApi.provinces.getByCountry(String(countryId)),
        locationApi.departments.getAll(),
      ]);

      const provincesWithCount = provincesData.map((province: Province) => ({
        ...province,
        Department: departmentsData.filter(
          (d: any) => d.id_province === province.id_province
        ),
      }));

      setActiveProvinces(provincesWithCount);
    } catch {
      toast.error("Error al recargar provincias activas");
    }
  }, [countryId]);

  const handleProvinceAction = useCallback(
    async (
      provinceId: number,
      provinceName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          await locationApi.provinces.delete(String(provinceId));
          const provinceToDelete = activeProvinces.find(
            (p) => p.id_province === provinceId
          );
          if (provinceToDelete) {
            setActiveProvinces((prev) =>
              prev.filter((p) => p.id_province !== provinceId)
            );
            setDeletedProvinces((prev) => [
              ...prev,
              { ...provinceToDelete, deleted_at: new Date() },
            ]);
          }
        } else {
          await locationApi.provinces.restore(String(provinceId));
          const provinceToRestore = deletedProvinces.find(
            (p) => p.id_province === provinceId
          );
          if (provinceToRestore) {
            setDeletedProvinces((prev) =>
              prev.filter((p) => p.id_province !== provinceId)
            );
            setActiveProvinces((prev) => [
              ...prev,
              { ...provinceToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(`Error al ${action === "delete" ? "eliminar" : "restaurar"} provincia:`, error);
        await Promise.all([loadActiveProvinces(), loadDeletedProvinces()]);
        throw error;
      }
    },
    [activeProvinces, deletedProvinces, loadActiveProvinces, loadDeletedProvinces]
  );

  const handleDeleteWithCheck = useCallback(
    async (province: Province) => {
      try {
        const inUseData = await locationApi.provinces.checkIfInUse(
          String(province.id_province)
        );

        if (inUseData.inUse && inUseData.count > 0) {
          setInUseInfo(inUseData);
          setPendingDeleteId(province.id_province);
          setShowInUseDialog(true);
          return;
        }

        await handleProvinceAction(
          province.id_province,
          province.province_name,
          "delete"
        );
        toast.success(`La provincia "${province.province_name}" fue dada de baja exitosamente`);
      } catch (error) {
        toast.error("Error al dar de baja la provincia");
      }
    },
    [handleProvinceAction]
  );

  const handleForceDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    const province = activeProvinces.find((p) => p.id_province === pendingDeleteId);
    if (!province) return;

    try {
      await handleProvinceAction(province.id_province, province.province_name, "delete");
      toast.success(`La provincia "${province.province_name}" fue eliminada exitosamente`);
      setShowInUseDialog(false);
      setPendingDeleteId(null);
      setInUseInfo(null);
    } catch (error) {
      console.error("Error deleting province:", error);
    }
  }, [pendingDeleteId, activeProvinces, handleProvinceAction]);

  const handleEdit = useCallback((province: Province) => {
    setEditingProvince(province);
    setIsCreateDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setEditingProvince(null);
  }, []);

  const columns = useMemo<ColumnDef<Province>[]>(
    () => getProvinceColumns(handleEdit, handleDeleteWithCheck),
    [handleEdit, handleDeleteWithCheck]
  );

  const deletedColumns = useMemo<ColumnDef<Province>[]>(
    () => getDeletedProvinceColumns((province) =>
      handleProvinceAction(province.id_province, province.province_name, "restore")
        .then(() => toast.success(`La provincia "${province.province_name}" fue restaurada exitosamente`))
        .catch(() => toast.error("Error al restaurar la provincia"))
    ),
    [handleProvinceAction]
  );

  const activosCount = activeProvinces.length;
  const bajaCount = deletedProvinces.length;

  useEffect(() => {
    loadDeletedProvinces();
  }, [loadDeletedProvinces]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/ubicacion">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Map className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                Provincias de {country.country_name}
              </h2>
            </div>
          </div>
        </div>
        <CanWrite>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Provincia
          </Button>
        </CanWrite>
      </div>

      <CreateProvinceDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={() => {
          loadActiveProvinces();
          handleCloseDialog();
        }}
        countryId={countryId}
        editingProvince={editingProvince}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Provincias activas
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
            Provincias dadas de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeProvinces} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando provincias dadas de baja...</p>
            </div>
          ) : deletedProvinces.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay provincias dadas de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedProvinces}
            />
          )}
        </TabsContent>
      </Tabs>

      <InUseAlertDialog
        open={showInUseDialog}
        onOpenChange={setShowInUseDialog}
        inUseInfo={inUseInfo}
        onConfirm={handleForceDelete}
        title="Provincia en Uso"
        description={`Esta provincia está siendo utilizada por ${
          inUseInfo?.count || 0
        } departamento(s). Puedes eliminarla de todas formas, pero los departamentos quedarán sin provincia asociada.`}
        itemName={
          activeProvinces.find((p) => p.id_province === pendingDeleteId)
            ?.province_name
        }
      />
    </div>
  );
}

