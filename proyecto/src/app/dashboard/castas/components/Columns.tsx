"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

type Caste = {
  id_caste: number;
  caste_name: string;
  deleted_at?: Date | string | null;
};

type HandleCasteAction = (
  casteId: number,
  casteName: string,
  action: "delete" | "restore"
) => Promise<void>;

type HandleCasteEdit = (caste: Caste) => void;

export function getColumns(
  handleCasteAction: HandleCasteAction,
  onEdit?: HandleCasteEdit
): ColumnDef<Caste>[] {
  return [
    {
      accessorKey: "caste_name",
      header: "Nombre de casta",
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
        const caste = row.original;

        const handleDelete = async () => {
          await handleCasteAction(caste.id_caste, caste.caste_name, "delete");
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(caste)}
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
  handleCasteAction: HandleCasteAction
): ColumnDef<Caste>[] {
  return [
    {
      accessorKey: "caste_name",
      header: "Nombre de casta",
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
        const caste = row.original;

        const handleRestore = async () => {
          try {
            await handleCasteAction(caste.id_caste, caste.caste_name, "restore");
            toast.success(
              `La casta "${caste.caste_name}" fue restaurada exitosamente`
            );
          } catch {
            toast.error("Error al restaurar la casta");
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
