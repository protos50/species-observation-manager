"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { toast } from "sonner";

type Person = {
  id_person: number;
  person_name: string;
  person_lastname: string;

  deleted_at?: Date | string | null;
};

type HandlePersonAction = (
  personId: number,
  personName: string,
  action: "delete" | "restore"
) => Promise<void>;

type HandlePersonEdit = (person: Person) => void;

export function getColumns(
  handlePersonAction: HandlePersonAction,
  onEdit?: HandlePersonEdit
): ColumnDef<Person>[] {
  return [
    {
      accessorKey: "person_name",
      header: "Nombre",
      meta: {
        align: "center",
      },
    },
    {
      accessorKey: "person_lastname",
      header: "Apellido",
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
        const person = row.original;

        const handleDelete = async () => {
          const personName = `${person.person_name} ${person.person_lastname}`;
          await handlePersonAction(person.id_person, personName, "delete");
        };

        return (
          <div className="flex items-center justify-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(person)}
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
  handlePersonAction: HandlePersonAction
): ColumnDef<Person>[] {
  return [
    {
      accessorKey: "person_name",
      header: "Nombre",
      meta: {
        align: "center",
      },
    },
    {
      accessorKey: "person_lastname",
      header: "Apellido",
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
        const person = row.original;

        const handleRestore = async () => {
          try {
            const personName = `${person.person_name} ${person.person_lastname}`;
            await handlePersonAction(person.id_person, personName, "restore");
            toast.success(
              `La persona "${personName}" fue restaurada exitosamente`
            );
          } catch {
            toast.error("Error al restaurar la persona");
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
