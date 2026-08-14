"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Service } from "@/lib/api/service";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

type HandleServiceAction = (
  serviceId: number,
  serviceName: string,
  action: "delete" | "restore"
) => Promise<void>;

type HandleServiceEdit = (service: Service) => void;

export function getColumns(
  handleServiceAction: HandleServiceAction,
  onEdit?: HandleServiceEdit
): ColumnDef<Service>[] {
  return [
    {
      accessorKey: "service_name",
      header: "Nombre del servicio",
      meta: {
        align: "center",
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const service = row.original;

        const handleDelete = async () => {
          try {
            await handleServiceAction(service.id_service, service.service_name, "delete");
            toast.success(
              `El servicio "${service.service_name}" fue dado de baja exitosamente`
            );
          } catch {
            toast.error("Error al dar de baja el servicio");
          }
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(service)}
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
  handleServiceAction: HandleServiceAction
): ColumnDef<Service>[] {
  return [
    {
      accessorKey: "service_name",
      header: "Nombre del servicio",
      meta: {
        align: "center",
      },
    },
    {
      accessorKey: "deleted_at",
      header: "Fecha de baja",
      meta: {
        align: "center",
      },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as string | null | undefined;
        if (!deletedAt) return "-";
        return formatDateTimeLocalFromUtc(String(deletedAt));
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const service = row.original;

        const handleRestore = async () => {
          try {
            await handleServiceAction(service.id_service, service.service_name, "restore");
            toast.success(
              `El servicio "${service.service_name}" fue restaurado exitosamente`
            );
          } catch {
            toast.error("Error al restaurar el servicio");
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
