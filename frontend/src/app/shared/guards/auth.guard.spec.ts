import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth.guard';

/** Genera un JWT falso pero base64-válido con el payload dado. */
function makeJwt(payload: object): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
}

const TOKEN_KEY = 'access_token';
const USER_KEY = 'current_user';

const expiraEn1h = () => Math.floor(Date.now() / 1000) + 3600;
const expiradoHace1h = () => Math.floor(Date.now() / 1000) - 3600;

describe('authGuard', () => {
  let router: Router;

  const runGuard = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => localStorage.clear());

  // ── Sin token ───────────────────────────────────────────────────

  describe('sin token en localStorage', () => {
    it('deniega el acceso (devuelve false)', () => {
      expect(runGuard()).toBeFalse();
    });

    it('navega a /login', () => {
      runGuard();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  // ── Token válido ────────────────────────────────────────────────

  describe('con token válido (no expirado)', () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, makeJwt({ sub: 'user-1', exp: expiraEn1h() }));
    });

    it('permite el acceso (devuelve true)', () => {
      expect(runGuard()).toBeTrue();
    });

    it('no navega a /login', () => {
      runGuard();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('no elimina el token de localStorage', () => {
      runGuard();
      expect(localStorage.getItem(TOKEN_KEY)).not.toBeNull();
    });
  });

  // ── Token expirado ──────────────────────────────────────────────

  describe('con token expirado', () => {
    beforeEach(() => {
      localStorage.setItem(TOKEN_KEY, makeJwt({ sub: 'user-1', exp: expiradoHace1h() }));
      localStorage.setItem(USER_KEY, JSON.stringify({ id: 'user-1' }));
    });

    it('deniega el acceso (devuelve false)', () => {
      expect(runGuard()).toBeFalse();
    });

    it('navega a /login', () => {
      runGuard();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('elimina el access_token de localStorage', () => {
      runGuard();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('elimina el current_user de localStorage', () => {
      runGuard();
      expect(localStorage.getItem(USER_KEY)).toBeNull();
    });
  });

  // ── Token malformado ────────────────────────────────────────────

  describe('con token malformado', () => {
    it('deniega el acceso si el payload no es JSON válido', () => {
      localStorage.setItem(TOKEN_KEY, 'header.not_base64_json.sig');
      expect(runGuard()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('deniega el acceso si solo hay una parte (sin puntos)', () => {
      localStorage.setItem(TOKEN_KEY, 'token_sin_puntos');
      expect(runGuard()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
