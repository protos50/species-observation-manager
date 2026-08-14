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
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Map,
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  ChevronRight,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import { locationApi } from "@/lib/api/location";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Province {
  id_province: number;
  id_country: number;
  province_name: string;
  Department?: any[];
  deleted_at?: string | null;
}

interface Country {
  id_country: number;
  country_name: string;
}
import { CreateProvinceDialog } from "./CreateProvinceDialog";

interface ProvincesTabProps {
  countryId: number;
  onNavigateToDepartments: (level: 'departments', context: { provinceId: number; provinceName: string }) => void;
}

export function ProvincesTab({ countryId, onNavigateToDepartments }: ProvincesTabProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [deletedProvinces, setDeletedProvinces] = useState<Province[]>([]);
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProvince, setEditingProvince] = useState<Province | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [usageDialog, setUsageDialog] = useState<{ open: boolean; province: Province | null; usage: any }>({ open: false, province: null, usage: null });

  useEffect(() => {
    loadData();
  }, [countryId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [provincesData, countryData, departmentsData, deletedData] = await Promise.all([
        locationApi.provinces.getByCountry(String(countryId)),
        locationApi.countries.getById(String(countryId)),
        locationApi.departments.getAll(),
        locationApi.provinces.getDeleted()
      ]);
      
      const provincesWithCount = provincesData.map((province: Province) => ({
        ...province,
        Department: departmentsData.filter((d: any) => d.id_province === province.id_province)
      }));
      
      setProvinces(provincesWithCount);
      setCountry(countryData);
      setDeletedProvinces(deletedData?.filter((p: Province) => p.id_country === countryId) || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
      toast.error("Error al cargar provincias");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (province: Province) => {
    try {
      const usage = await locationApi.provinces.checkIfInUse(String(province.id_province));
      
      if (usage.inUse && usage.count > 0) {
        setUsageDialog({ open: true, province, usage });
        return;
      }

      if (!confirm(`¿Estás seguro de eliminar la provincia "${province.province_name}"?`)) {
        return;
      }

      await locationApi.provinces.delete(String(province.id_province));
      toast.success("Provincia eliminada correctamente");
      await loadData();
    } catch (error) {
      console.error('Error deleting province:', error);
      toast.error("Error al eliminar provincia");
    }
  };

  const handleRestore = async (province: Province) => {
    try {
      await locationApi.provinces.restore(String(province.id_province));
      toast.success("Provincia restaurada correctamente");
      await loadData();
    } catch (error) {
      console.error('Error restoring province:', error);
      toast.error("Error al restaurar provincia");
    }
  };

  const filteredProvinces = provinces.filter(province =>
    province.province_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeletedProvinces = deletedProvinces.filter(province =>
    province.province_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (province: Province) => {
    setEditingProvince(province);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingProvince(null);
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Map className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Provincias de {country?.country_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestiona las provincias del país seleccionado
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Provincia
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className="rounded-b-none"
          >
            Activos ({provinces.length})
          </Button>
          <Button
            variant={activeTab === 'deleted' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('deleted')}
            className="rounded-b-none"
          >
            Dados de Baja ({deletedProvinces.length})
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar provincias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {activeTab === 'active' ? filteredProvinces.length : filteredDeletedProvinces.length} resultados
          </Badge>
        </div>

        {/* Active Tab */}
        {activeTab === 'active' && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre de la Provincia</TableHead>
                  <TableHead>Departamentos</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando provincias...
                    </TableCell>
                  </TableRow>
                ) : filteredProvinces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No se encontraron provincias' : 'No hay provincias registradas para este país'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProvinces.map((province) => (
                    <TableRow key={province.id_province}>
                      <TableCell className="font-mono text-sm">
                        {province.id_province}
                      </TableCell>
                      <TableCell className="font-medium">
                        {province.province_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {province.Department?.length || 0} departamentos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onNavigateToDepartments('departments', {
                              provinceId: province.id_province,
                              provinceName: province.province_name
                            })}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Departamentos
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(province)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(province)}
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
                  <TableHead>Nombre de la Provincia</TableHead>
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
                ) : filteredDeletedProvinces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No hay provincias eliminadas
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeletedProvinces.map((province) => (
                    <TableRow key={province.id_province}>
                      <TableCell className="font-mono text-sm">
                        {province.id_province}
                      </TableCell>
                      <TableCell className="font-medium">
                        {province.province_name}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(province)}
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
              Provincia en Uso
            </AlertDialogTitle>
            <AlertDialogDescription>
              La provincia "{usageDialog.province?.province_name}" está siendo referenciada por {usageDialog.usage?.count} departamento(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {usageDialog.usage?.departments && usageDialog.usage.departments.length > 0 && (
            <div className="my-4 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold mb-2">Departamentos que lo referencian:</p>
              <ul className="space-y-1">
                {usageDialog.usage.departments.map((dept: any) => (
                  <li key={dept.id_department} className="text-sm text-muted-foreground">
                    • {dept.department_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      <CreateProvinceDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
        countryId={countryId}
        editingProvince={editingProvince}
      />
    </div>
  );
}
