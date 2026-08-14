"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { Globe } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CreateCountryDialog } from "./CreateCountryDialog";
import { getCountryColumns, getDeletedCountryColumns } from "./Columns";
import { InUseAlertDialog } from "@/components/InUseAlertDialog";
import ResponsiveDataList from "@/components/ResponsiveDataList";
import { locationApi } from "@/lib/api/location";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Country {
  id_country: number;
  country_name: string;
  Province?: Array<{ id_province: number }>;
  deleted_at?: string | null;
}

interface CountriesClientProps {
  initialCountries: Country[];
}

export function CountriesClient({ initialCountries }: CountriesClientProps) {
  const [activeCountries, setActiveCountries] = useState<Country[]>(initialCountries);
  const [deletedCountries, setDeletedCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("activos");
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<any>(null);

  // Cargar países dados de baja
  const loadDeletedCountries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await locationApi.countries.getDeleted();
      setDeletedCountries(
        data.map((country: any) => ({
          ...country,
          deleted_at: country.deleted_at ? new Date(country.deleted_at) : null,
        }))
      );
    } catch {
      toast.error("Error al cargar países dados de baja");
    } finally {
      setLoading(false);
    }
  }, []);

  // Recargar países activos
  const loadActiveCountries = useCallback(async () => {
    try {
      const [countriesData, provincesData] = await Promise.all([
        locationApi.countries.getAll(),
        locationApi.provinces.getAll(),
      ]);

      const countriesWithCount = countriesData.map((country: Country) => ({
        ...country,
        Province: provincesData.filter(
          (p: any) => p.id_country === country.id_country
        ),
      }));

      setActiveCountries(countriesWithCount);
    } catch {
      toast.error("Error al recargar países activos");
    }
  }, []);

  // Función para manejar eliminación con verificación
  const handleDeleteClick = useCallback(
    async (country: Country) => {
      setCountryToDelete(country);
      try {
        const result = await locationApi.countries.checkIfInUse(String(country.id_country));
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
    if (!countryToDelete) return;
    try {
      await locationApi.countries.delete(String(countryToDelete.id_country));
      setActiveCountries((prev) => prev.filter((c) => c.id_country !== countryToDelete.id_country));
      setDeletedCountries((prev) => [
        ...prev,
        { ...countryToDelete, deleted_at: new Date().toISOString() },
      ]);
      toast.success(`El país "${countryToDelete.country_name}" fue dado de baja exitosamente`);
      setIsDeleteDialogOpen(false);
      setCountryToDelete(null);
    } catch (error) {
      console.error("Error al eliminar país:", error);
      toast.error("Error al dar de baja el país");
    }
  }, [countryToDelete]);

  const handleCountryAction = useCallback(
    async (
      countryId: number,
      countryName: string,
      action: "delete" | "restore"
    ) => {
      try {
        if (action === "delete") {
          const country = activeCountries.find((c) => c.id_country === countryId);
          if (country) {
            handleDeleteClick(country);
          }
        } else {
          await locationApi.countries.restore(String(countryId));
          const countryToRestore = deletedCountries.find(
            (c) => c.id_country === countryId
          );
          if (countryToRestore) {
            setDeletedCountries((prev) =>
              prev.filter((c) => c.id_country !== countryId)
            );
            setActiveCountries((prev) => [
              ...prev,
              { ...countryToRestore, deleted_at: undefined },
            ]);
          }
        }
      } catch (error) {
        console.error(`Error al ${action === "delete" ? "eliminar" : "restaurar"} país:`, error);
        await Promise.all([loadActiveCountries(), loadDeletedCountries()]);
        throw error;
      }
    },
    [activeCountries, deletedCountries, loadActiveCountries, loadDeletedCountries, handleDeleteClick]
  );

  // Método creado
  const handleCountryCreated = useCallback(async () => {
    await loadActiveCountries();
  }, [loadActiveCountries]);

  // Método editado
  const handleCountryUpdated = useCallback(async () => {
    await loadActiveCountries();
  }, [loadActiveCountries]);

  // Editar
  const handleEdit = useCallback((country: Country) => {
    setEditingCountry(country);
    setIsCreateDialogOpen(true);
  }, []);

  // Cerrar diálogo
  const handleCloseDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    setEditingCountry(null);
  }, []);

  const columns = useMemo<ColumnDef<Country>[]>(
    () => getCountryColumns(handleEdit, handleDeleteClick),
    [handleEdit, handleDeleteClick]
  );

  const deletedColumns = useMemo<ColumnDef<Country>[]>(
    () => getDeletedCountryColumns((country) =>
      handleCountryAction(country.id_country, country.country_name, "restore")
        .then(() => toast.success(`El país "${country.country_name}" fue restaurado exitosamente`))
        .catch(() => toast.error("Error al restaurar el país"))
    ),
    [handleCountryAction]
  );

  const activosCount = activeCountries.length;
  const bajaCount = deletedCountries.length;

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedCountries();
  }, [loadDeletedCountries]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Países
          </h2>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo País
        </Button>
      </div>

      <CreateCountryDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={() => {
          loadActiveCountries();
          handleCloseDialog();
        }}
        editingCountry={editingCountry}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto">
          <TabsTrigger
            value="activos"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Países activos
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
            Países dados de baja
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs ml-2"
            >
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeCountries} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando países dados de baja...</p>
            </div>
          ) : deletedCountries.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay países dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList
              columns={deletedColumns}
              data={deletedCountries}
            />
          )}
        </TabsContent>
      </Tabs>

      <InUseAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        inUseInfo={inUseInfo}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación de país"
        description={`¿Está seguro de que desea dar de baja el país "${countryToDelete?.country_name}"?`}
        itemName={countryToDelete?.country_name}
      />
    </div>
  );
}

