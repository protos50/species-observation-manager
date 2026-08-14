// components/taxons/columns.tsx
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ChevronRight, Eye, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Taxon } from "@/lib/api/taxonomy";
import { formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";

type TaxonRow = Taxon & {
  children_count?: number;
  depth?: number;
  has_children?: boolean;
};

// Función para obtener el color del badge según el nivel taxonómico
const getLevelColor = (levelName: string) => {
  const colors: Record<string, string> = {
    Kingdom: "bg-purple-100 text-purple-800 border-purple-200",
    Phylum: "bg-blue-100 text-blue-800 border-blue-200",
    Class: "bg-green-100 text-green-800 border-green-200",
    Order: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Family: "bg-orange-100 text-orange-800 border-orange-200",
    Genus: "bg-red-100 text-red-800 border-red-200",
    Species: "bg-gray-100 text-gray-800 border-gray-200",
  };
  return colors[levelName] || "bg-gray-100 text-gray-800 border-gray-200";
};

export function getTaxonColumns(
  onOpenDetails: (t: Taxon) => void
): ColumnDef<TaxonRow, any>[] {
  return [
    {
      accessorKey: "name",
      header: "Nombre",
      meta: { align: "left" },
      cell: ({ row }) => {
        const t = row.original;
        const depth = t.depth ?? 0;
        const isRoot = !t.parent_id;

        return (
          <div className="flex items-center gap-2">
            {/* Indicador de jerarquía simple */}
            {depth > 0 && (
              <div className="flex items-center">
                {Array.from({ length: depth }, (_, i) => (
                  <div key={i} className="w-px h-4 bg-gray-300 mx-1" />
                ))}
                <ChevronRight className="h-3 w-3 text-gray-400 ml-1" />
              </div>
            )}

            {/* Nombre del taxón */}
            <div className="flex flex-col">
              <div
                className="font-medium text-gray-900 truncate"
                title={t.name}
              >
                {t.name}
              </div>
              {t.children_count && t.children_count > 0 && (
                <div className="text-xs text-gray-500">
                  {t.children_count} sub-taxón
                  {t.children_count !== 1 ? "es" : ""}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.taxonomic_level?.name ?? "-",
      id: "level",
      header: "Nivel",

      cell: ({ getValue, row }) => {
        const levelName = getValue() as string;
        const t = row.original;

        if (levelName === "-") {
          return (
            <div className="text-center">
              <Badge
                variant="outline"
                className="text-gray-500 border-gray-300"
              >
                No especificado
              </Badge>
            </div>
          );
        }

        return (
          <div className="">
            <Badge className={`${getLevelColor(levelName)} font-medium`}>
              {levelName}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorFn: (row) => row.parent?.name ?? "-",
      id: "parent",
      header: "Padre",
      meta: { align: "left" },
      cell: ({ getValue, row }) => {
        const parentName = getValue() as string;
        const t = row.original;

        if (parentName === "-") {
          return (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-gray-500 italic text-sm">Taxón raíz</span>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="flex flex-col">
              <div
                className="font-medium text-gray-900 truncate max-w-[200px]"
                title={parentName}
              >
                {parentName}
              </div>
              {t.parent?.taxonomic_level?.name && (
                <div className="text-xs text-gray-500">
                  {t.parent.taxonomic_level.name}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: "author",
      header: "Autor",
      meta: { align: "left" },
      cell: ({ row }) => {
        const t = row.original;
        
        if (!t.author && !t.description_year) {
          return <span className="text-gray-400 text-sm italic">-</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <BookOpen className="h-3 w-3 text-indigo-500" />
            <div className="flex flex-col">
              {t.author?.author_name && (
                <span className="font-medium text-gray-900 text-sm">
                  {t.author.author_name}
                </span>
              )}
              {t.description_year && (
                <span className="text-xs text-gray-500">
                  ({t.description_year})
                </span>
              )}
            </div>
          </div>
        );
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

      cell: ({ row }) => {
        const taxon = row.original;
        return (
          <div className=" ">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => onOpenDetails(taxon)}
              className="hover:bg-gray-100 cursor-pointer"
              aria-label={`Ver detalles de ${taxon.name}`}
            >
              <Eye className="h-4 w-4 " />
            </Button>
          </div>
        );
      },
    },
  ];
}
