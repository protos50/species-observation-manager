/**
 * Constantes para los roles del sistema
 */
export const ROLE_IDS = {
  ADMIN: 1,
  RECOLECTOR: 2,
} as const;

export const ROLE_NAMES = {
  [ROLE_IDS.ADMIN]: "Administrador",
  [ROLE_IDS.RECOLECTOR]: "Recolector",
} as const;

export type RoleId = (typeof ROLE_IDS)[keyof typeof ROLE_IDS];
export type RoleName = (typeof ROLE_NAMES)[RoleId];
