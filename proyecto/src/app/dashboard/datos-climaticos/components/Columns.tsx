"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";

type ClimateData = {
  id_climate_data: number;
  id_locality: number;
  climate_date: string;
  t_min?: number;
  t_max?: number;
  t_med?: number;
  hr_min?: number;
  hr_max?: number;
  hr_med?: number;
  pp_14_days_before?: number;
  pp_30_days_before?: number;
  deleted_at?: Date | string | null;
  locality?: {
    locality_name: string;
    department?: {
      department_name: string;
      province?: {
        province_name: string;
        country?: {
          country_name: string;
        };
      };
    };
  };
};

type HandleClimateDataAction = (
  climateDataId: number,
  action: "delete" | "restore"
) => Promise<void>;

type HandleClimateDataEdit = (climateData: ClimateData) => void;


const formatLocation = (data: ClimateData) => {
  if (!data.locality) return "-";

  const parts = [
    data.locality.locality_name,
    data.locality.department?.department_name,
    data.locality.department?.province?.province_name,
    data.locality.department?.province?.country?.country_name,
  ].filter(Boolean);

  return parts.join(", ");
};

export function getColumns(
  handleClimateDataAction: HandleClimateDataAction,
  onEdit?: HandleClimateDataEdit,
  onDeleteWithCheck?: (id: number) => void
): ColumnDef<ClimateData>[] {
  return [
    {
      accessorKey: "locality",
      header: "Ubicación",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const data = row.original;
        const locationText = formatLocation(data);
        const truncatedText =
          locationText.length > 30
            ? locationText.substring(0, 30) + "..."
            : locationText;

        return (
          <div className="flex items-center justify-center max-w-[200px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <span className="text-sm truncate" title={locationText}>
                      {truncatedText}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{locationText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      accessorKey: "climate_date",
      header: "Fecha",
      meta: {
        align: "center",
      },
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <span>{formatDateLocal(date)}</span>;
      },
    },
    {
      id: "temperature",
      header: "Temperatura (°C)",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-sm space-y-1">
            {data.t_min != null && <div>Min: {data.t_min.toFixed(1)}°</div>}
            {data.t_med != null && <div>Med: {data.t_med.toFixed(1)}°</div>}
            {data.t_max != null && <div>Max: {data.t_max.toFixed(1)}°</div>}
            {data.t_min == null && data.t_med == null && data.t_max == null && (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: "humidity",
      header: "Humedad (%)",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-sm space-y-1">
            {data.hr_min != null && <div>Min: {data.hr_min.toFixed(1)}%</div>}
            {data.hr_med != null && <div>Med: {data.hr_med.toFixed(1)}%</div>}
            {data.hr_max != null && <div>Max: {data.hr_max.toFixed(1)}%</div>}
            {data.hr_min == null &&
              data.hr_med == null &&
              data.hr_max == null && (
                <span className="text-muted-foreground">-</span>
              )}
          </div>
        );
      },
    },
    {
      id: "precipitation",
      header: "Precipitaciones (mm)",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const data = row.original;
        return (
          <div className="text-sm space-y-1">
            {data.pp_14_days_before != null && (
              <div>14d: {data.pp_14_days_before.toFixed(1)}mm</div>
            )}
            {data.pp_30_days_before != null && (
              <div>30d: {data.pp_30_days_before.toFixed(1)}mm</div>
            )}
            {data.pp_14_days_before == null &&
              data.pp_30_days_before == null && (
                <span className="text-muted-foreground">-</span>
              )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const climateData = row.original;

        const handleDelete = async () => {
          if (onDeleteWithCheck) {
            onDeleteWithCheck(climateData.id_climate_data);
          } else {
            try {
              await handleClimateDataAction(
                climateData.id_climate_data,
                "delete"
              );
              toast.success("Datos climáticos dados de baja exitosamente");
            } catch {
              toast.error("Error al dar de baja los datos climáticos");
            }
          }
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(climateData)}
                className="h-8 w-8 p-0 cursor-pointer"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];
}

export function getDeletedColumns(
  handleClimateDataAction: HandleClimateDataAction
): ColumnDef<ClimateData>[] {
  return [
    {
      accessorKey: "locality",
      header: "Ubicación",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const data = row.original;
        const locationText = formatLocation(data);
        const truncatedText =
          locationText.length > 30
            ? locationText.substring(0, 30) + "..."
            : locationText;

        return (
          <div className="flex items-center justify-center max-w-[200px]">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 cursor-help">
                    <span className="text-sm truncate" title={locationText}>
                      {truncatedText}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{locationText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    {
      accessorKey: "climate_date",
      header: "Fecha",
      meta: {
        align: "center",
      },
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <span className="text-sm">{formatDateLocal(date)}</span>;
      },
    },
    {
      accessorKey: "deleted_at",
      header: "Fecha de baja",
      meta: {
        align: "center",
      },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as Date | string | null | undefined;
        if (!deletedAt) return "-";
        return (
          <span className="text-sm text-muted-foreground">
            {formatDateTimeLocalFromUtc(String(deletedAt))}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const climateData = row.original;

        const handleRestore = async () => {
          try {
            await handleClimateDataAction(
              climateData.id_climate_data,
              "restore"
            );
            const locationText = formatLocation(climateData);
            const dateText = formatDateLocal(climateData.climate_date);
            toast.success(
              `Datos climáticos de ${locationText} (${dateText}) restaurados exitosamente`
            );
          } catch {
            toast.error("Error al restaurar los datos climáticos");
          }
        };

        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestore}
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only ml-1 text-sm">Restaurar</span>
            </Button>
          </div>
        );
      },
    },
  ];
}
