import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restringe un endpoint (o un controlador completo) a los roles indicados.
 *
 * Se usa con el enum `Role` para evitar errores de tipeo y de mayusculas:
 *   @Roles(Role.ADMIN)
 *   @Roles(...WRITE_ROLES)
 *
 * Si un endpoint no lleva este decorador, queda accesible para cualquier
 * usuario autenticado (el JwtAuthGuard global sigue exigiendo token valido).
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
