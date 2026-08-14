"use client";

import React, { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type TaxonFilters = {
  searchTerm?: string;
  taxonomicLevel?: string;
  parentName?: string;
  authorName?: string;
};

interface TaxonFiltersProps {
  filters: TaxonFilters;
  onChange: (next: TaxonFilters) => void;
  onClear: () => void;
  taxonomicLevels: Array<{ id_taxonomic_level: number; name: string }>;
  filteredCount: number;
  totalCount: number;
}

export function TaxonFilters({
  filters,
  onChange,
  onClear,
  taxonomicLevels,
  filteredCount,
  totalCount,
}: TaxonFiltersProps) {
  const set = useMemo(
    () =>
      (key: keyof TaxonFilters) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange({ ...filters, [key]: e.target.value }),
    [filters, onChange]
  );

  const setLevel = (value: string) => {
    onChange({ ...filters, taxonomicLevel: value === "all" ? undefined : value });
  };

  const hasFilters = Object.values(filters).some((v) => v);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filtros de búsqueda</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {filteredCount} de {totalCount} taxones
          </Badge>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={onClear}>
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="searchTerm" className="text-xs text-muted-foreground">
            Buscar por nombre
          </Label>
          <Input
            id="searchTerm"
            placeholder="Ej: Solenopsis"
            value={filters.searchTerm || ""}
            onChange={set("searchTerm")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxonomicLevel" className="text-xs text-muted-foreground">
            Nivel taxonómico
          </Label>
          <Select
            value={filters.taxonomicLevel || "all"}
            onValueChange={setLevel}
          >
            <SelectTrigger id="taxonomicLevel">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los niveles</SelectItem>
              {taxonomicLevels.map((level) => (
                <SelectItem key={level.id_taxonomic_level} value={level.name}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentName" className="text-xs text-muted-foreground">
            Nombre del padre
          </Label>
          <Input
            id="parentName"
            placeholder="Ej: Formicidae"
            value={filters.parentName || ""}
            onChange={set("parentName")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authorName" className="text-xs text-muted-foreground">
            Autor
          </Label>
          <Input
            id="authorName"
            placeholder="Ej: Linnaeus"
            value={filters.authorName || ""}
            onChange={set("authorName")}
          />
        </div>
      </div>
    </div>
  );
}
