import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Factory que protege rutas por rol.
 * Redirige a /home si el usuario no tiene el rol requerido.
 *
 * @example
 * canActivate: [authGuard, roleGuard(['ADMIN'])]
 */
export const roleGuard = (rolesPermitidos: string[]): CanActivateFn => () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (rolesPermitidos.includes(auth.userRoleCodigo())) return true;

  return router.createUrlTree(['/home']);
};
