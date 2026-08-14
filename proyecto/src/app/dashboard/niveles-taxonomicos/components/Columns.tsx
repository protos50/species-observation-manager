"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

type TaxonomicLevel = {
  id_taxonomic_level: number;
  name: string;
  deleted_at?: Date | string | null;
};

type HandleLevelAction = (
  levelId: number,
  levelName: string,
  action: "delete" | "restore"
) => Promise<void>;

type HandleLevelEdit = (level: TaxonomicLevel) => void;

export function getColumns(
  handleLevelAction: HandleLevelAction,
  onEdit?: HandleLevelEdit
): ColumnDef<TaxonomicLevel>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre de nivel taxonómico",
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
        const level = row.original;

        const handleDelete = async () => {
          try {
            await handleLevelAction(
              level.id_taxonomic_level,
              level.name,
              "delete"
            );
            toast.success(
              `El nivel "${level.name}" fue dado de baja exitosamente`
            );
          } catch {
            toast.error("Error al dar de baja el nivel");
          }
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(level)}
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
  handleLevelAction: HandleLevelAction
): ColumnDef<TaxonomicLevel>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre de nivel taxonómico",
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
        const level = row.original;

        const handleRestore = async () => {
          try {
            await handleLevelAction(
              level.id_taxonomic_level,
              level.name,
              "restore"
            );
            toast.success(
              `El nivel "${level.name}" fue restaurado exitosamente`
            );
          } catch {
            toast.error("Error al restaurar el nivel");
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
