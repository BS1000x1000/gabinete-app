import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');

  if (!token) {
    console.warn('🔒 No hay token, redirigiendo a /login');
    router.navigate(['/login']);
    return false;
  }

  // Verificar si el token está expirado
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milisegundos
    const now = Date.now();
    
    console.log('🔍 Verificando token:', {
      exp: new Date(exp),
      now: new Date(now),
      diferencia: Math.round((exp - now) / 1000 / 60), // minutos
      expiro: now >= exp
    });
    
    if (now >= exp) {
      console.warn('🔒 Token expirado, redirigiendo a /login');
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      router.navigate(['/login']);
      return false;
    }
  } catch (e) {
    console.error('❌ Error al decodificar token:', e);
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    router.navigate(['/login']);
    return false;
  }

  console.log('✅ Token válido, permitiendo acceso');
  return true;
};