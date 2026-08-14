"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileSpreadsheet,
  Filter,
  Calendar,
  MapPin,
  Bug,
  Leaf,
  Loader2,
} from "lucide-react";
// import { toast } from "@/hooks/use-toast";

interface ExportFilters {
  taxon_name?: string;
  locality_name?: string;
  environment_name?: string;
  start_date?: string;
  end_date?: string;
}

export function ExportDataCard() {
  const [isExporting, setIsExporting] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({});

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim()) {
          params.append(key, value.trim());
        }
      });

      // Get JWT token from localStorage
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      // Make request to backend (port 4000 for development)
      const baseUrl =
        process.env.NODE_ENV === "development" ? "http://localhost:4000" : "";
      const response = await fetch(
        `${baseUrl}/api/observation/export/csv?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "text/csv",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get("content-disposition");
      let filename = "observaciones_gema.csv";
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("Exportación exitosa:", filename);
    } catch (error) {
      console.error("Export error:", error);
      alert(
        `Error en exportación: ${
          error instanceof Error
            ? error.message
            : "No se pudo exportar los datos"
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  const hasFilters = Object.values(filters).some(
    (value) => value && value.trim()
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Exportar Datos para Análisis R
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Descarga todos los datos de observaciones en formato CSV, compatible
          con R y Excel. Estructura idéntica a los datos originales para
          continuidad en análisis estadísticos.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Filters Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-blue-600" />
            <Label className="text-sm font-medium">Filtros opcionales</Label>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="taxon_name"
                className="text-sm flex items-center gap-1"
              >
                <Bug className="h-3 w-3" />
                Taxón
              </Label>
              <Input
                id="taxon_name"
                placeholder="ej: Solenopsis"
                value={filters.taxon_name || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    taxon_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="locality_name"
                className="text-sm flex items-center gap-1"
              >
                <MapPin className="h-3 w-3" />
                Localidad
              </Label>
              <Input
                id="locality_name"
                placeholder="ej: Corrientes"
                value={filters.locality_name || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    locality_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="environment_name"
                className="text-sm flex items-center gap-1"
              >
                <Leaf className="h-3 w-3" />
                Ambiente
              </Label>
              <Input
                id="environment_name"
                placeholder="ej: Montado"
                value={filters.environment_name || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    environment_name: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Rango de fechas
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Desde"
                  value={filters.start_date || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      start_date: e.target.value,
                    }))
                  }
                />
                <Input
                  type="date"
                  placeholder="Hasta"
                  value={filters.end_date || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      end_date: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Export Section */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">
              Columnas incluidas en la exportación (formato Excel original):
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-muted-foreground">
              <span>• CODIGO</span>
              <span>• identificacion</span>
              <span>• fecha_de_ident</span>
              <span>• reino</span>
              <span>• phylum</span>
              <span>• clase</span>
              <span>• orden</span>
              <span>• familia</span>
              <span>• subfamilia</span>
              <span>• tribu</span>
              <span>• genero</span>
              <span>• especie</span>
              <span>• autor</span>
              <span>• año</span>
              <span>• tipo_de_trampa</span>
              <span>• nro_trampa</span>
              <span>• fecha_de_colecta</span>
              <span>• recolector</span>
              <span>• localidad</span>
              <span>• departamento</span>
              <span>• provincia</span>
              <span>• ambiente</span>
              <span>• latitud</span>
              <span>• longitud</span>
              <span>• altitud</span>
              <span>• obt_gps</span>
              <span>• ihh</span>
              <span>• dist_al_rio</span>
              <span>• abundancia</span>
              <span>• casta</span>
              <span>• biologia</span>
              <span>• observaciones</span>
              <span>• estado_conservacion</span>
              <span>• met_cons</span>
              <span>• t_min</span>
              <span>• t_max</span>
              <span>• t_med</span>
              <span>• hr_min</span>
              <span>• hr_max</span>
              <span>• hr_med</span>
              <span>• pp_14_dias_antes</span>
              <span>• pp_30_dias_antes</span>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full md:w-auto"
            size="lg"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Descargar CSV
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip para R:</strong> Usa{" "}
            <code className="bg-blue-100 px-1 rounded">
              read.csv("observaciones_gema.csv", encoding="UTF-8")
            </code>{" "}
            para cargar los datos con acentos correctos.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
