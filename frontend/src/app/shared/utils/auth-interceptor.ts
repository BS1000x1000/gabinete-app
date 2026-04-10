import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // El JWT viaja como cookie HttpOnly — el browser la envía automáticamente
  // con withCredentials: true. No se inyecta el header Authorization.
  const cloned = req.clone({ withCredentials: true });

  return next(cloned).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.warn('🔒 Token inválido o expirado (401)');
        localStorage.removeItem('current_user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
