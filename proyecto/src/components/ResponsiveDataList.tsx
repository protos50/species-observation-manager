"use client";

import React, { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/DataTable";
import { DataCards } from "@/components/DataCards";
import { SimpleDataTable } from "@/components/SimpleDataTable";
import { SimpleDataCards } from "@/components/SimpleDataCards";

type ResponsiveDataListProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Tailwind breakpoint min-width. Ej: (min-width: 768px) para md */
  minWidthQuery?: string;
  /** Props específicos para DataCards */
  cardsProps?: {
    showFieldLabels?: boolean;
    cardClassName?: string;
  };
  /** Si true, usa SimpleDataTable (sin búsqueda/paginación interna) en desktop */
  useSimpleTable?: boolean;
  /** Si true, usa SimpleDataCards (sin paginación interna) en móvil */
  useSimpleCards?: boolean;
};

// Hook simple para media query que funciona en Next/CSR
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    listener();
    media.addEventListener?.("change", listener);
    return () => media.removeEventListener?.("change", listener);
  }, [query]);

  return matches;
}

/**
 * ResponsiveDataList:
 * - Móvil: DataCards (o SimpleDataCards si useSimpleCards=true)
 * - Desktop >= minWidthQuery: DataTable (o SimpleDataTable si useSimpleTable=true)
 */
export function ResponsiveDataList<TData, TValue>({
  columns,
  data,
  minWidthQuery = "(min-width: 768px)", // md por defecto
  cardsProps,
  useSimpleTable = false,
  useSimpleCards = false,
}: ResponsiveDataListProps<TData, TValue>) {
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery(minWidthQuery);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mientras detecta el tamaño, mostramos un skeleton simple
  if (!mounted) {
    return <div className="w-full h-32 bg-gray-100 rounded animate-pulse" />;
  }

  if (isDesktop) {
    return useSimpleTable ? (
      <SimpleDataTable columns={columns} data={data} />
    ) : (
      <DataTable columns={columns} data={data} />
    );
  }

  return useSimpleCards ? (
    <SimpleDataCards
      columns={columns}
      data={data}
      showFieldLabels={cardsProps?.showFieldLabels}
      cardClassName={cardsProps?.cardClassName}
    />
  ) : (
    <DataCards
      columns={columns}
      data={data}
      showFieldLabels={cardsProps?.showFieldLabels}
      cardClassName={cardsProps?.cardClassName}
    />
  );
}

export default ResponsiveDataList;
