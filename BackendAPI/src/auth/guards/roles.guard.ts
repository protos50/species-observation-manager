import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Role } from '../enums/role.enum';

/**
 * Guard de autorizacion por rol.
 *
 * Se registra de forma global en main.ts, despues del JwtAuthGuard, por lo que
 * para cuando se ejecuta ya hay un `request.user` con el payload del token.
 *
 * Reglas:
 *  - Endpoint marcado con @Public()  -> pasa sin verificar rol.
 *  - Endpoint sin @Roles(...)        -> pasa con cualquier usuario autenticado.
 *  - Endpoint con @Roles(...)        -> exige que el rol del token este en la lista.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Las rutas publicas no llevan usuario: no hay rol que verificar.
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin restriccion declarada: alcanza con estar autenticado.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userRole: string | undefined = user?.sub?.role;

    if (!userRole) {
      throw new ForbiddenException('El token no contiene un rol valido.');
    }

    // Comparacion normalizada: la base guarda los roles en mayusculas, pero
    // asi el guard tolera tokens viejos o datos cargados en minusculas.
    const normalized = userRole.toUpperCase();
    const allowed = requiredRoles.some(
      (role) => role.toUpperCase() === normalized,
    );

    if (!allowed) {
      throw new ForbiddenException(
        'No tiene permisos suficientes para realizar esta accion.',
      );
    }

    return true;
  }
}
