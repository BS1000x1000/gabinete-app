import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * `/home/cuenta` era una pantalla entera para un unico campo: la contrasena.
 * Con eso, el espacio personal de un terapeuta quedaba repartido en tres
 * sitios -contrasena aqui, datos fiscales en Administracion y perfil en la
 * ficha- y ninguno se llamaba como los otros.
 *
 * Ahora la contrasena vive en la pestana Acceso de la propia ficha, y esta ruta
 * redirige alli. Hace falta un guard y no un `redirectTo` porque el destino
 * depende del usuario en sesion.
 */
export const miFichaGuard = (tab: string): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const id = auth.currentTrabajadorId();
  return router.createUrlTree(id ? ['/home/trabajadores', id, tab] : ['/home/agenda']);
};
