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
  Building2,
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

interface Department {
  id_department: number;
  id_province: number;
  department_name: string;
  Locality?: any[];
  deleted_at?: string | null;
}

interface Province {
  id_province: number;
  province_name: string;
}
import { CreateDepartmentDialog } from "./CreateDepartmentDialog";

interface DepartmentsTabProps {
  provinceId: number;
  onNavigateToLocalities: (level: 'localities', context: { departmentId: number; departmentName: string }) => void;
}

export function DepartmentsTab({ provinceId, onNavigateToLocalities }: DepartmentsTabProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deletedDepartments, setDeletedDepartments] = useState<Department[]>([]);
  const [province, setProvince] = useState<Province | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [usageDialog, setUsageDialog] = useState<{ open: boolean; department: Department | null; usage: any }>({ open: false, department: null, usage: null });

  useEffect(() => {
    loadData();
  }, [provinceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [departmentsData, provinceData, localitiesData, deletedData] = await Promise.all([
        locationApi.departments.getByProvince(String(provinceId)),
        locationApi.provinces.getById(String(provinceId)),
        locationApi.localities.getAll(),
        locationApi.departments.getDeleted()
      ]);
      
      const departmentsWithCount = departmentsData.map((department: Department) => ({
        ...department,
        Locality: localitiesData.filter((l: any) => l.id_department === department.id_department)
      }));
      
      setDepartments(departmentsWithCount);
      setProvince(provinceData);
      setDeletedDepartments(deletedData?.filter((d: Department) => d.id_province === provinceId) || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error("Error al cargar departamentos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (department: Department) => {
    try {
      const usage = await locationApi.departments.checkIfInUse(String(department.id_department));
      
      if (usage.inUse && usage.count > 0) {
        setUsageDialog({ open: true, department, usage });
        return;
      }

      if (!confirm(`¿Estás seguro de eliminar el departamento "${department.department_name}"?`)) {
        return;
      }

      await locationApi.departments.delete(String(department.id_department));
      toast.success("Departamento eliminado correctamente");
      await loadData();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error("Error al eliminar departamento");
    }
  };

  const handleRestore = async (department: Department) => {
    try {
      await locationApi.departments.restore(String(department.id_department));
      toast.success("Departamento restaurado correctamente");
      await loadData();
    } catch (error) {
      console.error('Error restoring department:', error);
      toast.error("Error al restaurar departamento");
    }
  };

  const filteredDepartments = departments.filter(department =>
    department.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeletedDepartments = deletedDepartments.filter(department =>
    department.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingDepartment(null);
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
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building2 className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                Departamentos de {province?.province_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Gestiona los departamentos de la provincia seleccionada
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Departamento
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className="rounded-b-none"
          >
            Activos ({departments.length})
          </Button>
          <Button
            variant={activeTab === 'deleted' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('deleted')}
            className="rounded-b-none"
          >
            Dados de Baja ({deletedDepartments.length})
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar departamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {activeTab === 'active' ? filteredDepartments.length : filteredDeletedDepartments.length} resultados
          </Badge>
        </div>

        {/* Active Tab */}
        {activeTab === 'active' && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre del Departamento</TableHead>
                  <TableHead>Localidades</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando departamentos...
                    </TableCell>
                  </TableRow>
                ) : filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No se encontraron departamentos' : 'No hay departamentos registrados para esta provincia'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((department) => (
                    <TableRow key={department.id_department}>
                      <TableCell className="font-mono text-sm">
                        {department.id_department}
                      </TableCell>
                      <TableCell className="font-medium">
                        {department.department_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {department.Locality?.length || 0} localidades
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onNavigateToLocalities('localities', {
                              departmentId: department.id_department,
                              departmentName: department.department_name
                            })}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Localidades
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(department)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(department)}
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
                  <TableHead>Nombre del Departamento</TableHead>
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
                ) : filteredDeletedDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No hay departamentos eliminados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeletedDepartments.map((department) => (
                    <TableRow key={department.id_department}>
                      <TableCell className="font-mono text-sm">
                        {department.id_department}
                      </TableCell>
                      <TableCell className="font-medium">
                        {department.department_name}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(department)}
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
              Departamento en Uso
            </AlertDialogTitle>
            <AlertDialogDescription>
              El departamento "{usageDialog.department?.department_name}" está siendo referenciado por {usageDialog.usage?.count} localidad(es).
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {usageDialog.usage?.localities && usageDialog.usage.localities.length > 0 && (
            <div className="my-4 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold mb-2">Localidades que lo referencian:</p>
              <ul className="space-y-1">
                {usageDialog.usage.localities.map((loc: any) => (
                  <li key={loc.id_locality} className="text-sm text-muted-foreground">
                    • {loc.locality_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      <CreateDepartmentDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
        provinceId={provinceId}
        editingDepartment={editingDepartment}
      />
    </div>
  );
}
