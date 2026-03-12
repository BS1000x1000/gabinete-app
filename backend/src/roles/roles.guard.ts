import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guard de autorización por rol.
 *
 * Comportamiento:
 * - Si el endpoint NO tiene @Roles() → permite el paso (cualquier usuario autenticado).
 * - Si el endpoint tiene @Roles('X', 'Y') → solo pasan usuarios cuyo rol esté en la lista.
 *
 * Debe usarse DESPUÉS de JwtAuthGuard para que req.user esté disponible.
 * @UseGuards(JwtAuthGuard, RolesGuard)
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    return requiredRoles.includes(user.rol);
  }
}
