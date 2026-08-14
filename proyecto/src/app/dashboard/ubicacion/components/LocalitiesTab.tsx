"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { locationApi } from "@/lib/api/location";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Locality {
  id_locality: number;
  id_department: number;
  locality_name: string;
  _count?: {
    Geolocation: number;
    ClimateData: number;
  };
  deleted_at?: string | null;
}

interface Department {
  id_department: number;
  department_name: string;
}

import { CreateLocalityDialog } from "./CreateLocalityDialog";

interface LocalitiesTabProps {
  departmentId: number;
}

export function LocalitiesTab({ departmentId }: LocalitiesTabProps) {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [deletedLocalities, setDeletedLocalities] = useState<Locality[]>([]);
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [usageDialog, setUsageDialog] = useState<{ open: boolean; locality: Locality | null; usage: any }>(
    { open: false, locality: null, usage: null }
  );

  useEffect(() => {
    loadData();
  }, [departmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [localitiesData, departmentData, deletedData] = await Promise.all([
        locationApi.localities.getByDepartment(String(departmentId)),
        locationApi.departments.getById(String(departmentId)),
        locationApi.localities.getDeleted(),
      ]);

      setLocalities(localitiesData);
      setDepartment(departmentData);
      setDeletedLocalities(
        (deletedData || []).filter((loc: Locality) => loc.id_department === departmentId)
      );
    } catch (error) {
      console.error('Error loading localities:', error);
      toast.error("Error al cargar localidades");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (locality: Locality) => {
    try {
      const usage = await locationApi.localities.checkIfInUse(String(locality.id_locality));

      if (usage.inUse && usage.count > 0) {
        setUsageDialog({ open: true, locality, usage });
        return;
      }

      if (!confirm(`¿Estás seguro de eliminar la localidad "${locality.locality_name}"?`)) {
        return;
      }

      await locationApi.localities.delete(String(locality.id_locality));
      toast.success("Localidad eliminada correctamente");
      await loadData();
    } catch (error) {
      console.error('Error deleting locality:', error);
      toast.error("Error al eliminar localidad");
    }
  };

  const handleRestore = async (locality: Locality) => {
    try {
      await locationApi.localities.restore(String(locality.id_locality));
      toast.success("Localidad restaurada correctamente");
      await loadData();
    } catch (error) {
      console.error('Error restoring locality:', error);
      toast.error("Error al restaurar localidad");
    }
  };

  const filteredLocalities = localities.filter(locality =>
    locality.locality_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeletedLocalities = deletedLocalities.filter(locality =>
    locality.locality_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (locality: Locality) => {
    setEditingLocality(locality);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingLocality(null);
  };

  const handleSuccess = () => {
    loadData();
    handleCloseDialog();
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Localidades de {department?.department_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestiona las localidades del departamento seleccionado
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Localidad
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className="rounded-b-none"
          >
            Activas ({localities.length})
          </Button>
          <Button
            variant={activeTab === 'deleted' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('deleted')}
            className="rounded-b-none"
          >
            Dados de Baja ({deletedLocalities.length})
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar localidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {activeTab === 'active' ? filteredLocalities.length : filteredDeletedLocalities.length} resultados
          </Badge>
        </div>

        {/* Active Tab */}
        {activeTab === 'active' && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre de la Localidad</TableHead>
                  <TableHead>Coordenadas</TableHead>
                  <TableHead>Datos Climáticos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando localidades...
                    </TableCell>
                  </TableRow>
                ) : filteredLocalities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No se encontraron localidades' : 'No hay localidades registradas para este departamento'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLocalities.map((locality) => (
                    <TableRow key={locality.id_locality}>
                      <TableCell className="font-mono text-sm">{locality.id_locality}</TableCell>
                      <TableCell className="font-medium">{locality.locality_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {locality._count?.Geolocation ?? 0} coordenadas
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {locality._count?.ClimateData ?? 0} registros climáticos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(locality)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(locality)}
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Deleted Tab */}
        {activeTab === 'deleted' && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre de la Localidad</TableHead>
                  <TableHead className="w-48">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : filteredDeletedLocalities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No hay localidades eliminadas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeletedLocalities.map((locality) => (
                    <TableRow key={locality.id_locality}>
                      <TableCell className="font-mono text-sm">{locality.id_locality}</TableCell>
                      <TableCell className="font-medium">{locality.locality_name}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(locality)}
                          className="text-green-600 hover:text-green-700 border-green-200 hover:bg-green-50"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restaurar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Usage Dialog */}
      <AlertDialog open={usageDialog.open} onOpenChange={(open) => setUsageDialog({ ...usageDialog, open })}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Localidad en Uso
            </AlertDialogTitle>
            <AlertDialogDescription>
              La localidad "{usageDialog.locality?.locality_name}" está siendo referenciada por {usageDialog.usage?.count} elemento(s).
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 max-h-64 overflow-y-auto">
            {usageDialog.usage?.geolocations?.length ? (
              <div>
                <p className="text-sm font-semibold mb-1">Geolocalizaciones:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {usageDialog.usage.geolocations.map((geo: any) => (
                    <li key={geo.id_geolocation}>• ID {geo.id_geolocation} ({geo.latitude}, {geo.longitude})</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {usageDialog.usage?.climateData?.length ? (
              <div>
                <p className="text-sm font-semibold mb-1">Registros Climáticos:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {usageDialog.usage.climateData.map((cd: any) => (
                    <li key={cd.id_climate_data}>• ID {cd.id_climate_data} - {cd.climate_date}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {usageDialog.usage?.observations?.length ? (
              <div>
                <p className="text-sm font-semibold mb-1">Observaciones:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {usageDialog.usage.observations.map((obs: any) => (
                    <li key={obs.id_observation}>• ID {obs.id_observation}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <AlertDialogCancel>Entendido</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      <CreateLocalityDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
        departmentId={departmentId}
        editingLocality={editingLocality}
      />
    </div>
  );
}
