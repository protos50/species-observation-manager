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
  Globe,
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

interface Country {
  id_country: number;
  country_name: string;
  Province?: Province[];
  deleted_at?: string | null;
}

interface Province {
  id_province: number;
  id_country: number;
  province_name: string;
}

import { CreateCountryDialog } from "./CreateCountryDialog";

interface CountriesTabProps {
  onNavigateToProvinces: (level: 'provinces', context: { countryId: number; countryName: string }) => void;
}

export function CountriesTab({ onNavigateToProvinces }: CountriesTabProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [deletedCountries, setDeletedCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active');
  const [usageDialog, setUsageDialog] = useState<{ open: boolean; country: Country | null; usage: any }>({ open: false, country: null, usage: null });

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setLoading(true);
      const [countriesData, provincesData, deletedData] = await Promise.all([
        locationApi.countries.getAll(),
        locationApi.provinces.getAll(),
        locationApi.countries.getDeleted()
      ]);
      
      const countriesWithCount = countriesData.map((country: Country) => ({
        ...country,
        Province: provincesData.filter((p: Province) => p.id_country === country.id_country)
      }));
      
      setCountries(countriesWithCount);
      setDeletedCountries(deletedData || []);
    } catch (error) {
      console.error('Error loading countries:', error);
      toast.error("Error al cargar países");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (country: Country) => {
    try {
      const usage = await locationApi.countries.checkIfInUse(String(country.id_country));
      
      if (usage.inUse && usage.count > 0) {
        setUsageDialog({ open: true, country, usage });
        return;
      }

      if (!confirm(`¿Estás seguro de eliminar el país "${country.country_name}"?`)) {
        return;
      }

      await locationApi.countries.delete(String(country.id_country));
      toast.success("País eliminado correctamente");
      await loadCountries();
    } catch (error) {
      console.error('Error deleting country:', error);
      toast.error("Error al eliminar país");
    }
  };

  const handleRestore = async (country: Country) => {
    try {
      await locationApi.countries.restore(String(country.id_country));
      toast.success("País restaurado correctamente");
      await loadCountries();
    } catch (error) {
      console.error('Error restoring country:', error);
      toast.error("Error al restaurar país");
    }
  };

  const filteredCountries = countries.filter(country =>
    country.country_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDeletedCountries = deletedCountries.filter(country =>
    country.country_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingCountry(null);
  };

  const handleSuccess = () => {
    loadCountries();
    handleCloseDialog();
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Países</h2>
              <p className="text-sm text-muted-foreground">
                Gestiona los países del sistema
              </p>
            </div>
          </div>
          
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo País
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === 'active' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('active')}
            className="rounded-b-none"
          >
            Activos ({countries.length})
          </Button>
          <Button
            variant={activeTab === 'deleted' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('deleted')}
            className="rounded-b-none"
          >
            Dados de Baja ({deletedCountries.length})
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar países..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {activeTab === 'active' ? filteredCountries.length : filteredDeletedCountries.length} resultados
          </Badge>
        </div>

        {/* Active Tab */}
        {activeTab === 'active' && (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Nombre del País</TableHead>
                  <TableHead className="w-32">Provincias</TableHead>
                  <TableHead className="w-48">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando países...
                    </TableCell>
                  </TableRow>
                ) : filteredCountries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No se encontraron países' : 'No hay países registrados'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCountries.map((country) => (
                    <TableRow key={country.id_country}>
                      <TableCell className="font-mono text-sm">
                        {country.id_country}
                      </TableCell>
                      <TableCell className="font-medium">
                        {country.country_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {country.Province?.length || 0} provincias
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onNavigateToProvinces('provinces', {
                              countryId: country.id_country,
                              countryName: country.country_name
                            })}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Provincias
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(country)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(country)}
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
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Nombre del País</TableHead>
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
                ) : filteredDeletedCountries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      No hay países eliminados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDeletedCountries.map((country) => (
                    <TableRow key={country.id_country}>
                      <TableCell className="font-mono text-sm">
                        {country.id_country}
                      </TableCell>
                      <TableCell className="font-medium">
                        {country.country_name}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRestore(country)}
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
              País en Uso
            </AlertDialogTitle>
            <AlertDialogDescription>
              El país "{usageDialog.country?.country_name}" está siendo referenciado por {usageDialog.usage?.count} provincia(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {usageDialog.usage?.provinces && usageDialog.usage.provinces.length > 0 && (
            <div className="my-4 max-h-64 overflow-y-auto">
              <p className="text-sm font-semibold mb-2">Provincias que lo referencian:</p>
              <ul className="space-y-1">
                {usageDialog.usage.provinces.map((prov: any) => (
                  <li key={prov.id_province} className="text-sm text-muted-foreground">
                    • {prov.province_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AlertDialogCancel>Cancelar</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>

      <CreateCountryDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
        editingCountry={editingCountry}
      />
    </div>
  );
}
