import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const auth = inject(AuthService);

  if (!auth.isAuthenticated()) {
    console.warn('🔒 No hay sesión activa, redirigiendo a /login');
    router.navigate(['/login']);
    return false;
  }

  return true;
};
