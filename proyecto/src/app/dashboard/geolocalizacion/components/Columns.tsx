"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";
import { CanWrite } from "@/components/CanWrite";

export interface Geolocation {
  deleted_at?: Date | string | null;
  id_geolocation: number;
  latitude: number;
  longitude: number;
  altitude: number | null;
  source_type: string;
  tag?: string | null;
  ihh?: number | null;
  distance_to_river?: number | null;
  id_locality: number;
  locality?: {
    id_locality: number;
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
}

export const getGeolocationColumns = (
  onView: (g: Geolocation) => void,
  onDelete?: (g: Geolocation) => void
): ColumnDef<Geolocation>[] => [
  {
    id: "id",
    header: "ID",
    accessorKey: "id_geolocation",
    meta: { align: "center" },
    cell: ({ row }) => (
      <span className="font-mono text-sm">#{row.original.id_geolocation}</span>
    ),
  },
  {
    id: "locality",
    header: "Localidad",
    meta: { align: "left" },
    cell: ({ row }) => {
      const loc = row.original.locality;
      if (!loc) return <span className="text-gray-400">-</span>;
      
      const parts = [
        loc.locality_name,
        loc.department?.department_name,
        loc.department?.province?.province_name,
        loc.department?.province?.country?.country_name
      ].filter(Boolean);

      return (
        <div className="flex flex-col">
          <span className="font-medium">{loc.locality_name}</span>
          <span className="text-xs text-gray-500">
            {parts.slice(1).join(" • ")}
          </span>
        </div>
      );
    },
  },
  {
    id: "tag",
    header: "Tag",
    accessorKey: "tag",
    meta: { align: "left" },
    cell: ({ row }) =>
      row.original.tag ? (
        <span className="text-sm font-medium text-blue-600">{row.original.tag}</span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      ),
  },
  {
    id: "coordinates",
    header: "Coordenadas",
    meta: { align: "left" },
    cell: ({ row }) => (
      <div className="flex flex-col font-mono text-xs">
        <span>Lat: {row.original.latitude.toFixed(6)}</span>
        <span>Lon: {row.original.longitude.toFixed(6)}</span>
      </div>
    ),
  },
  {
    id: "altitude",
    header: "Altitud",
    accessorKey: "altitude",
    meta: { align: "center" },
    cell: ({ row }) =>
      row.original.altitude != null
        ? `${row.original.altitude.toFixed(0)} m`
        : "-",
  },
  {
    id: "ihh",
    header: "IHH",
    accessorKey: "ihh",
    meta: { align: "center" },
    cell: ({ row }) =>
      row.original.ihh != null ? row.original.ihh : "-",
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
    meta: { align: "center" },
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
          className="cursor-pointer h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {onDelete && (
          <CanWrite>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(row.original)}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CanWrite>
        )}
      </div>
    ),
  },
];

export const getDeletedGeolocationColumns = (
  onRestore: (g: Geolocation) => void
): ColumnDef<Geolocation>[] => [
  {
    id: "id",
    header: "ID",
    accessorKey: "id_geolocation",
    meta: { align: "center" },
    cell: ({ row }) => (
      <span className="font-mono text-sm">#{row.original.id_geolocation}</span>
    ),
  },
  {
    id: "locality",
    header: "Localidad",
    meta: { align: "left" },
    cell: ({ row }) => {
      const loc = row.original.locality;
      if (!loc) return <span className="text-gray-400">-</span>;
      
      const parts = [
        loc.locality_name,
        loc.department?.department_name,
        loc.department?.province?.province_name,
        loc.department?.province?.country?.country_name
      ].filter(Boolean);

      return (
        <div className="flex flex-col">
          <span className="font-medium">{loc.locality_name}</span>
          <span className="text-xs text-gray-500">
            {parts.slice(1).join(" • ")}
          </span>
        </div>
      );
    },
  },
  {
    id: "tag",
    header: "Tag",
    accessorKey: "tag",
    meta: { align: "left" },
    cell: ({ row }) =>
      row.original.tag ? (
        <span className="text-sm font-medium text-blue-600">{row.original.tag}</span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      ),
  },
  {
    id: "coordinates",
    header: "Coordenadas",
    meta: { align: "left" },
    cell: ({ row }) => (
      <div className="flex flex-col font-mono text-xs">
        <span>Lat: {row.original.latitude.toFixed(6)}</span>
        <span>Lon: {row.original.longitude.toFixed(6)}</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "Acciones",
    meta: { align: "center" },
    cell: ({ row }) => (
      <CanWrite>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRestore(row.original)}
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only ml-1 text-sm">Restaurar</span>
        </Button>
      </CanWrite>
    ),
  },
];
