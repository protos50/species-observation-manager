/**
 * Roles del sistema.
 *
 * Los valores DEBEN coincidir exactamente con la columna `name` de la tabla `Rol`
 * en la base de datos (se guardan en mayusculas):
 *   role_id 1 -> ADMIN
 *   role_id 2 -> USER
 *   role_id 3 -> RESEARCHER
 *
 * El token JWT transporta este valor en `payload.sub.role` (ver auth.service.ts).
 */
export enum Role {
  /** Administrador: acceso total, incluida la gestion de usuarios y servicios. */
  ADMIN = 'ADMIN',

  /** Colaborador: registra y edita datos cientificos. No gestiona usuarios ni servicios. */
  RESEARCHER = 'RESEARCHER',

  /** Usuario de consulta: solo lectura sobre los datos del laboratorio. */
  USER = 'USER',
}

/** Roles habilitados para crear, modificar o eliminar datos cientificos. */
export const WRITE_ROLES = [Role.ADMIN, Role.RESEARCHER];

/** Roles habilitados para leer datos internos del laboratorio. */
export const READ_ROLES = [Role.ADMIN, Role.RESEARCHER, Role.USER];
