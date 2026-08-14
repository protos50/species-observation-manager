"use client";

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SimpleDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function SimpleDataTable<TData, TValue>({
  columns,
  data,
}: SimpleDataTableProps<TData, TValue>) {
  // Configuración mínima de la tabla - solo core model, sin paginación ni filtros
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <Table className="table-auto">
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`${
                    header.column.columnDef.meta?.align === "left"
                      ? "text-left"
                      : header.column.columnDef.meta?.align === "right"
                      ? "text-right"
                      : "text-center"
                  }`}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center gap-1 ${
                        header.column.columnDef.meta?.align === "left"
                          ? "justify-start"
                          : header.column.columnDef.meta?.align === "right"
                          ? "justify-end"
                          : "justify-center"
                      }`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="odd:!bg-white even:!bg-gray-100 hover:!bg-white even:hover:bg-gray-100"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`px-4 py-2 ${
                      cell.column.columnDef.meta?.align === "left"
                        ? "text-left"
                        : cell.column.columnDef.meta?.align === "right"
                        ? "text-right"
                        : "text-center"
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No se encontraron resultados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default SimpleDataTable;
