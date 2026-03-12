import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Declara qué roles pueden acceder al endpoint.
 * Si no se aplica el decorador, RolesGuard deja pasar a cualquier usuario autenticado.
 *
 * @example
 * @Roles('ADMIN')
 * @Roles('ADMIN', 'RECEP')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
