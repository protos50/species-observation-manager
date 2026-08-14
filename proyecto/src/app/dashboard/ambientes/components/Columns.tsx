"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, RotateCcw, Leaf } from "lucide-react";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

type Environment = {
  id_environment: number;
  environment_name: string;
  _count?: {
    Observation: number;
  };
  deleted_at?: Date | string | null;
};

type HandleEnvironmentAction = (environment: Environment) => Promise<void>;

type HandleEnvironmentActionForDeleted = (
  environmentId: number,
  environmentName: string,
  action: "delete" | "restore"
) => Promise<void>;

type HandleEnvironmentEdit = (environment: Environment) => void;

export function getColumns(
  handleEnvironmentAction: HandleEnvironmentAction,
  onEdit?: HandleEnvironmentEdit
): ColumnDef<Environment>[] {
  return [
    {
      accessorKey: "environment_name",
      header: "Nombre del Ambiente",
      meta: {
        align: "center",
      },
    },
    {
      id: "observations",
      header: "Observaciones",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const obsCount = row.original._count?.Observation || 0;
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200"
          >
            {obsCount} {obsCount === 1 ? "observación" : "observaciones"}
          </Badge>
        );
      },
    },
    {
      id: "status",
      header: "Estado",
      meta: {
        align: "center",
      },
      cell: ({ row }) => {
        const obsCount = row.original._count?.Observation || 0;
        return obsCount > 0 ? (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            En uso
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-50 text-gray-600">
            Sin usar
          </Badge>
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
        const environment = row.original;
        const obsCount = environment._count?.Observation || 0;

        const handleDelete = async () => {
          try {
            await handleEnvironmentAction(environment);
            // El toast se maneja en el componente padre o en el modal
          } catch {
            // Error ya manejado
          }
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(environment)}
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
  handleEnvironmentAction: HandleEnvironmentActionForDeleted
): ColumnDef<Environment>[] {
  return [
    {
      accessorKey: "environment_name",
      header: "Nombre del Ambiente",
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
        const deletedAt = getValue() as Date | string | null | undefined;
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
        const environment = row.original;

        const handleRestore = async () => {
          try {
            await handleEnvironmentAction(
              environment.id_environment,
              environment.environment_name,
              "restore"
            );
            toast.success(
              `El ambiente "${environment.environment_name}" fue restaurado exitosamente`
            );
          } catch {
            toast.error("Error al restaurar el ambiente");
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
