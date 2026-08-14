import { locationApi } from "@/lib/api/location";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Map, Building2, MapPin } from "lucide-react";
import { CountriesClient } from "./components/CountriesClient";

export default async function UbicacionPage() {
  const [countries, provinces, departments, localities] = await Promise.all([
    locationApi.countries.getAll(),
    locationApi.provinces.getAll(),
    locationApi.departments.getAll(),
    locationApi.localities.getAll(),
  ]);

  const stats = {
    countries: countries.length,
    provinces: provinces.length,
    departments: departments.length,
    localities: localities.length,
  };

  const countriesWithCount = countries.map((country: any) => ({
    ...country,
    Province: provinces.filter((p: any) => p.id_country === country.id_country),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Gestión de Ubicaciones
          </h1>
          <p className="text-muted-foreground mt-2">
            Administra la información geográfica del sistema
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Países</p>
                  <p className="text-xl font-bold">{stats.countries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Map className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Provincias</p>
                  <p className="text-xl font-bold">{stats.provinces}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Building2 className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Departamentos</p>
                  <p className="text-xl font-bold">{stats.departments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localidades</p>
                  <p className="text-xl font-bold">{stats.localities}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Countries Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6 sm:p-8">
              <CountriesClient initialCountries={countriesWithCount} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
