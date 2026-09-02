import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';
import { AuthService } from '../../services/auth.service';

/**
 * El guard delega en `AuthService.isAuthenticated()` y no sabe nada de tokens.
 *
 * La version anterior de este spec decodificaba JWTs de `localStorage` y
 * comprobaba su caducidad a mano, porque asi era el guard cuando se escribio.
 * La sesion paso a viajar en una **cookie HttpOnly** —que el navegador manda
 * sola con `withCredentials`— y el guard se simplifico a esta pregunta unica,
 * pero el spec se quedo probando la implementacion vieja: 11 casos en rojo
 * desde entonces. Un JWT en `localStorage` es legible por cualquier script de
 * la pagina; la cookie HttpOnly no, y por eso se cambio.
 */
describe('authGuard', () => {
  let router: Router;
  let autenticado: ReturnType<typeof signal<boolean>>;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    autenticado = signal(false);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: autenticado } },
      ],
    });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  describe('con sesión activa', () => {
    beforeEach(() => autenticado.set(true));

    it('permite el acceso', () => {
      expect(runGuard()).toBe(true);
    });

    it('no redirige', () => {
      runGuard();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('sin sesión', () => {
    beforeEach(() => autenticado.set(false));

    it('deniega el acceso', () => {
      expect(runGuard()).toBe(false);
    });

    it('redirige a /login', () => {
      runGuard();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
