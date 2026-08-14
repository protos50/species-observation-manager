import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 🔓 TEMPORARY: Allow all authenticated users to access admin endpoints
    // TODO: Remove this when proper roles are configured in production
    // Uncomment the code below to enable role-based restrictions
    
    return true; // ← Temporary: treat everyone as admin
    
    /* ORIGINAL CODE - Uncomment to enable role checking:
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.sub || !user.sub.role) {
      return false;
    }
    
    return requiredRoles.some((role) => user.sub.role === role);
    */
  }
}
