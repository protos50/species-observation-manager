"use client";

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

declare module "@tanstack/table-core" {
  interface ColumnMeta<TData extends unknown, TValue> {
    align?: "left" | "center" | "right";
  }
}

interface SimpleDataCardsProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  showFieldLabels?: boolean;
  cardClassName?: string;
  renderActions?: (row: TData) => React.ReactNode;
  compact?: boolean;
}

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

export function SimpleDataCards<TData, TValue>({
  columns,
  data,
  showFieldLabels = true,
  cardClassName,
  renderActions,
  compact = true,
}: SimpleDataCardsProps<TData, TValue>) {
  // Configuración mínima de la tabla - solo core model, sin paginación ni filtros
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const visibleColumns = columns.filter(
    (c) => (c as any)?.meta?.hidden !== true
  );

  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-10">
        No se encontraron resultados.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {table.getRowModel().rows.map((row, rowIndex) => {
        const rowData = row.original;
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
    </div>
  );
}

export default SimpleDataCards;

