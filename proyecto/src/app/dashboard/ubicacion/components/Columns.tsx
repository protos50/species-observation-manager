"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, RotateCcw, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDateLocal, formatDateTimeLocalFromUtc } from "@/lib/utils/dateUtils";

// ============ COUNTRIES ============
interface Country {
  id_country: number;
  country_name: string;
  Province?: Array<{ id_province: number }>;
  deleted_at?: string | null;
}

type HandleCountryAction = (country: Country) => Promise<void>;
type HandleCountryRestore = (country: Country) => Promise<void>;
type HandleCountryEdit = (country: Country) => void;

export function getCountryColumns(
  onEdit: HandleCountryEdit,
  onDelete: HandleCountryAction
): ColumnDef<Country>[] {
  return [
    {
      accessorKey: "id_country",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "country_name",
      header: "Nombre del País",
      meta: { align: "center" },
    },
    {
      id: "provinces",
      header: "Provincias",
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = row.original.Province?.length || 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? "provincia" : "provincias"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const country = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              asChild
              className="text-xs sm:text-sm cursor-pointer"
            >
              <Link href={`/dashboard/ubicacion/countries/${country.id_country}/provinces`}>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Ver Provincias</span>
                <span className="sm:hidden">Ver</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(country)}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(country)}
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

export function getDeletedCountryColumns(
  onRestore: HandleCountryRestore
): ColumnDef<Country>[] {
  return [
    {
      accessorKey: "id_country",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "country_name",
      header: "Nombre del País",
      meta: { align: "center" },
    },
    {
      accessorKey: "deleted_at",
      header: "Fecha de baja",
      meta: { align: "center" },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as string | null | undefined;
        if (!deletedAt) return "-";
        return formatDateTimeLocalFromUtc(deletedAt);
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const country = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(country)}
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

// ============ PROVINCES ============
interface Province {
  id_province: number;
  id_country: number;
  province_name: string;
  Department?: Array<{ id_department: number }>;
  deleted_at?: string | null;
}

type HandleProvinceAction = (province: Province) => Promise<void>;
type HandleProvinceRestore = (province: Province) => Promise<void>;
type HandleProvinceEdit = (province: Province) => void;

export function getProvinceColumns(
  onEdit: HandleProvinceEdit,
  onDelete: HandleProvinceAction
): ColumnDef<Province>[] {
  return [
    {
      accessorKey: "id_province",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "province_name",
      header: "Nombre de la Provincia",
      meta: { align: "center" },
    },
    {
      id: "departments",
      header: "Departamentos",
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = row.original.Department?.length || 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? "departamento" : "departamentos"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const province = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              asChild
              className="text-xs sm:text-sm cursor-pointer"
            >
              <Link href={`/dashboard/ubicacion/provinces/${province.id_province}/departments`}>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Ver Departamentos</span>
                <span className="sm:hidden">Ver</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(province)}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(province)}
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

export function getDeletedProvinceColumns(
  onRestore: HandleProvinceRestore
): ColumnDef<Province>[] {
  return [
    {
      accessorKey: "id_province",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "province_name",
      header: "Nombre de la Provincia",
      meta: { align: "center" },
    },
    {
      accessorKey: "deleted_at",
      header: "Fecha de baja",
      meta: { align: "center" },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as string | null | undefined;
        if (!deletedAt) return "-";
        return formatDateTimeLocalFromUtc(deletedAt);
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const province = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(province)}
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

// ============ DEPARTMENTS ============
interface Department {
  id_department: number;
  id_province: number;
  department_name: string;
  Locality?: Array<{ id_locality: number }>;
  deleted_at?: string | null;
}

type HandleDepartmentAction = (department: Department) => Promise<void>;
type HandleDepartmentRestore = (department: Department) => Promise<void>;
type HandleDepartmentEdit = (department: Department) => void;

export function getDepartmentColumns(
  onEdit: HandleDepartmentEdit,
  onDelete: HandleDepartmentAction
): ColumnDef<Department>[] {
  return [
    {
      accessorKey: "id_department",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "department_name",
      header: "Nombre del Departamento",
      meta: { align: "center" },
    },
    {
      id: "localities",
      header: "Localidades",
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = row.original.Locality?.length || 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? "localidad" : "localidades"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="default"
              size="sm"
              asChild
              className="text-xs sm:text-sm cursor-pointer"
            >
              <Link href={`/dashboard/ubicacion/departments/${department.id_department}/localities`}>
                <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Ver Localidades</span>
                <span className="sm:hidden">Ver</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(department)}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(department)}
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

export function getDeletedDepartmentColumns(
  onRestore: HandleDepartmentRestore
): ColumnDef<Department>[] {
  return [
    {
      accessorKey: "id_department",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "department_name",
      header: "Nombre del Departamento",
      meta: { align: "center" },
    },
    {
      accessorKey: "deleted_at",
      header: "Fecha de baja",
      meta: { align: "center" },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as string | null | undefined;
        if (!deletedAt) return "-";
        return formatDateTimeLocalFromUtc(deletedAt);
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const department = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(department)}
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

// ============ LOCALITIES ============
interface Locality {
  id_locality: number;
  id_department: number;
  locality_name: string;
  _count?: {
    Geolocation: number;
    ClimateData: number;
    Observations: number;
  };
  deleted_at?: string | null;
}

type HandleLocalityAction = (locality: Locality) => Promise<void>;
type HandleLocalityRestore = (locality: Locality) => Promise<void>;
type HandleLocalityEdit = (locality: Locality) => void;

export function getLocalityColumns(
  onEdit: HandleLocalityEdit,
  onDelete: HandleLocalityAction
): ColumnDef<Locality>[] {
  return [
    {
      accessorKey: "id_locality",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "locality_name",
      header: "Nombre de la Localidad",
      meta: { align: "center" },
    },
    {
      id: "geolocations",
      header: "Coordenadas",
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = row.original._count?.Geolocation ?? 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? "coordenada" : "coordenadas"}
          </Badge>
        );
      },
    },
    {
      id: "climateData",
      header: "Datos Climáticos",
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = row.original._count?.ClimateData ?? 0;
        return (
          <Badge variant="outline">
            {count} {count === 1 ? "registro" : "registros"}
          </Badge>
        );
      },
    },
    {
      id: "observations",
      header: "Observaciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const count = row.original._count?.Observations ?? 0;
        return (
          <Badge variant={count > 0 ? "default" : "outline"}>
            {count} {count === 1 ? "observación" : "observaciones"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const locality = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(locality)}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(locality)}
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

export function getDeletedLocalityColumns(
  onRestore: HandleLocalityRestore
): ColumnDef<Locality>[] {
  return [
    {
      accessorKey: "id_locality",
      header: "ID",
      meta: { align: "center" },
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue() as number}</span>
      ),
    },
    {
      accessorKey: "locality_name",
      header: "Nombre de la Localidad",
      meta: { align: "center" },
    },
    {
      accessorKey: "deleted_at",
      header: "Fecha de baja",
      meta: { align: "center" },
      cell: ({ getValue }) => {
        const deletedAt = getValue() as string | null | undefined;
        if (!deletedAt) return "-";
        return formatDateTimeLocalFromUtc(deletedAt);
      },
    },
    {
      id: "actions",
      header: "Acciones",
      meta: { align: "center" },
      cell: ({ row }) => {
        const locality = row.original;
        return (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRestore(locality)}
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

