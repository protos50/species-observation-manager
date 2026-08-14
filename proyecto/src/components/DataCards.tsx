"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type DataCardsProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showFieldLabels?: boolean;
  cardClassName?: string;
  renderActions?: (row: TData) => React.ReactNode;
  loading?: boolean;
  compact?: boolean;
  /** Habilitar paginación (por defecto true) */
  enablePagination?: boolean;
  /** Tamaño de página por defecto */
  initialPageSize?: number;
};

function getValueFromColumn<TData>(
  row: TData,
  col: ColumnDef<TData, any>,
  colIndex: number
) {
  if (typeof (col as any).accessorFn === "function") {
    try {
      return (col as any).accessorFn(row, colIndex);
    } catch {
      return undefined;
    }
  }
  if (typeof (col as any).accessorKey === "string") {
    const key = (col as any).accessorKey as keyof TData;
    return (row as any)?.[key];
  }
  return undefined;
}

export function DataCards<TData, TValue>({
  columns,
  data,
  showFieldLabels = true,
  cardClassName,
  renderActions,
  loading = false,
  compact = true,
  enablePagination = true,
  initialPageSize = 5,
}: DataCardsProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    state: {
      pagination: { pageIndex, pageSize },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
  });

  const visibleColumns = columns.filter(
    (c) => (c as any)?.meta?.hidden !== true
  );

  if (loading) {
    return (
      <div className="w-full space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card shadow-sm p-4 md:p-5 animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-1/3 mb-3" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  const currentRows = enablePagination
    ? table.getRowModel().rows
    : data.map((d, i) => ({ id: i, original: d }));

  if (currentRows.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-10">
        No se encontraron resultados.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {currentRows.map((row, rowIndex) => {
        const rowData = enablePagination ? row.original : (row as any).original;
        const titleCol = visibleColumns[0];
        const otherCols = visibleColumns.slice(1);

        const titleValue = titleCol
          ? getValueFromColumn(rowData, titleCol, 0)
          : undefined;

        return (
          <div
            key={(rowData as any).id ?? rowIndex}
            role="group"
            aria-label="Registro"
            className={`rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-5 transition-colors ${
              cardClassName ?? ""
            }`}
          >
            {/* Header de la card */}
            <div className="flex items-start justify-between gap-3 mb-3 md:mb-4">
              <div className="min-w-0">
                <div className="text-base md:text-lg font-semibold leading-6 break-words">
                  {titleCol
                    ? titleCol.cell
                      ? flexRender(titleCol.cell, {
                          table: {} as any,
                          row: { original: rowData } as any,
                          column: { columnDef: titleCol } as any,
                          cell: {} as any,
                          getValue: () => titleValue,
                          compact,
                        } as any)
                      : titleValue ?? ""
                    : null}
                </div>
              </div>
              {renderActions && (
                <div className="shrink-0 -mt-1">{renderActions(rowData)}</div>
              )}
            </div>

            {/* Contenido de la card */}
            {otherCols.length > 0 && (
              <div
                className={`grid ${
                  compact
                    ? "grid-cols-1 gap-y-2"
                    : "grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3"
                }`}
              >
                {otherCols.map((col, colIndex) => {
                  const headerContent = flexRender(col.header, {
                    table: {} as any,
                    header: {} as any,
                    column: { columnDef: col } as any,
                    getContext: () => ({} as any),
                  } as any);

                  const cellValue = getValueFromColumn(
                    rowData,
                    col,
                    colIndex + 1
                  );

                  const cellContent = col.cell
                    ? flexRender(col.cell, {
                        table: {} as any,
                        row: { original: rowData } as any,
                        column: { columnDef: col } as any,
                        cell: {} as any,
                        getValue: () => cellValue,
                        compact,
                      } as any)
                    : cellValue;

                  return (
                    <div key={colIndex} className="min-w-0 flex flex-col gap-1">
                      {showFieldLabels && (
                        <div className="text-[11px] md:text-xs font-medium text-muted-foreground">
                          {typeof headerContent === "string" ||
                          typeof headerContent === "number"
                            ? headerContent
                            : (col as any).header ?? ""}
                        </div>
                      )}
                      <div className="text-sm md:text-[15px] leading-6 break-words">
                        {cellContent ?? (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Paginación */}
      {enablePagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
            Mostrando{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            a{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            de {table.getFilteredRowModel().rows.length} resultados
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="h-7 w-7"
            >
              <ChevronsLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="text-sm font-medium px-2">
              Página <span className="font-bold">{pageIndex + 1}</span> de{" "}
              <span className="font-bold">{table.getPageCount()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-7 w-7"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="h-7 w-7"
            >
              <ChevronsRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataCards;
