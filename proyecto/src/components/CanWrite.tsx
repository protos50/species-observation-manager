"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useRoleAuth } from "@/hooks/use-role-auth";

/**
 * Muestra su contenido solo a los perfiles que pueden escribir datos
 * cientificos (Administrador y Colaborador). El perfil de consulta (USER)
 * no lo ve.
 *
 * IMPORTANTE: esto es solo interfaz. La autorizacion real la aplica el
 * backend con el RolesGuard y los decoradores @Roles(...WRITE_ROLES), que
 * responden 403 a quien no corresponda. Ocultar el control evita ofrecerle
 * al usuario una accion que va a fallar, pero no reemplaza al guard.
 *
 *   <CanWrite>
 *     <CreateMethodDialog onMethodCreated={handleCreated} />
 *   </CanWrite>
 */
export function CanWrite({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { canWrite, isLoading } = useRoleAuth();

  // Mientras se resuelve la sesion no se muestra nada, para no dejar
  // parpadeando un boton que despues desaparece.
  if (isLoading) return <>{fallback}</>;

  return canWrite() ? <>{children}</> : <>{fallback}</>;
}

const COLUMNAS_DE_ESCRITURA = ["actions", "restore"];

/**
 * Quita la columna de acciones (editar / dar de baja / restaurar) de una
 * definicion de columnas. Se usa en las tablas del dashboard cuando el
 * usuario no tiene permisos de escritura: sin esto la columna "Acciones"
 * queda visible con botones que el backend rechaza con 403.
 *
 *   const columns = useMemo(() => {
 *     const cols = getColumns(handleAction, handleEdit);
 *     return canWrite() ? cols : withoutActionsColumn(cols);
 *   }, [handleAction, handleEdit, canWrite]);
 */
export function withoutActionsColumn<T>(
  columns: ColumnDef<T>[]
): ColumnDef<T>[] {
  return withoutColumns(columns, COLUMNAS_DE_ESCRITURA);
}

/**
 * Variante para tablas donde la columna de acciones mezcla botones de lectura
 * con botones de escritura: por ejemplo geolocalizaciones (ver detalle + dar
 * de baja) o ubicacion (recorrer la cascada pais > provincia > departamento >
 * localidad + editar + dar de baja). Ahi no se puede quitar la columna entera
 * sin dejar al perfil de consulta sin acceso a los datos; se filtran solo las
 * columnas indicadas y los botones de escritura se envuelven en <CanWrite>.
 */
export function withoutColumns<T>(
  columns: ColumnDef<T>[],
  ids: string[]
): ColumnDef<T>[] {
  return columns.filter((column) => !column.id || !ids.includes(column.id));
}
