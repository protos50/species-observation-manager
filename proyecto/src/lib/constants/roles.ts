/**
 * Constantes para los roles del sistema.
 *
 * Los IDs corresponden a la columna `role_id` de la tabla `Rol` en la base de
 * datos. El backend valida los mismos roles por nombre (ADMIN / USER /
 * RESEARCHER) mediante el enum `Role` y el `RolesGuard`:
 *
 *   role_id 1 -> ADMIN       (Administrador)
 *   role_id 2 -> USER        (Consulta, solo lectura)
 *   role_id 3 -> RESEARCHER  (Colaborador: carga y edita datos cientificos)
 *
 * IMPORTANTE: ocultar un item del menu es solo una mejora de interfaz.
 * La autorizacion real la aplica el backend; filtrar aca no alcanza.
 */
export const ROLE_IDS = {
  ADMIN: 1,
  USER: 2,
  RESEARCHER: 3,
} as const;

export const ROLE_NAMES = {
  [ROLE_IDS.ADMIN]: "Administrador",
  [ROLE_IDS.USER]: "Consulta",
  [ROLE_IDS.RESEARCHER]: "Colaborador",
} as const;

/** Roles que pueden crear, editar o dar de baja datos cientificos. */
export const WRITE_ROLE_IDS = [ROLE_IDS.ADMIN, ROLE_IDS.RESEARCHER];

/** Roles con acceso a la administracion: usuarios, servicios y contacto. */
export const ADMIN_ROLE_IDS = [ROLE_IDS.ADMIN];

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];
export type RoleName = (typeof ROLE_NAMES)[RoleId];
