"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

type Author = {
  id_author: number;
  author_name: string;
  deleted_at?: Date | string | null;
};

type HandleAuthorAction = (
  authorId: number,
  authorName: string,
  action: "delete" | "restore"
) => Promise<void>;

type HandleAuthorEdit = (author: Author) => void;

export function getColumns(
  handleAuthorAction: HandleAuthorAction,
  onEdit?: HandleAuthorEdit
): ColumnDef<Author>[] {
  return [
    {
      accessorKey: "author_name",
      header: "Nombre del autor",
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
        const author = row.original;

        const handleDelete = async () => {
          try {
            await handleAuthorAction(
              author.id_author,
              author.author_name,
              "delete"
            );
            toast.success(
              `El autor "${author.author_name}" fue dado de baja exitosamente`
            );
          } catch {
            toast.error("Error al dar de baja el autor");
          }
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(author)}
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
  handleAuthorAction: HandleAuthorAction
): ColumnDef<Author>[] {
  return [
    {
      accessorKey: "author_name",
      header: "Nombre del autor",
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
        const author = row.original;

        const handleRestore = async () => {
          try {
            await handleAuthorAction(
              author.id_author,
              author.author_name,
              "restore"
            );
            toast.success(
              `El autor "${author.author_name}" fue restaurado exitosamente`
            );
          } catch {
            toast.error("Error al restaurar el autor");
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
