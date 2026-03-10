import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth-interceptor';

const TOKEN_KEY = 'access_token';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  // ── Inyección del token ─────────────────────────────────────────

  describe('cabecera Authorization', () => {
    it('añade "Bearer <token>" cuando hay token en localStorage', () => {
      localStorage.setItem(TOKEN_KEY, 'mi-jwt-token');
      http.get('/api/test').subscribe();
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe('Bearer mi-jwt-token');
      req.flush({});
    });

    it('NO añade Authorization cuando no hay token', () => {
      http.get('/api/test').subscribe();
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBeNull();
      req.flush({});
    });

    it('no modifica otros headers ya existentes en la petición', () => {
      localStorage.setItem(TOKEN_KEY, 'tok');
      http.get('/api/test', { headers: { 'X-Custom': 'valor' } }).subscribe();
      const req = httpMock.expectOne('/api/test');
      expect(req.request.headers.get('X-Custom')).toBe('valor');
      expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
      req.flush({});
    });
  });

  // ── Error 401 ───────────────────────────────────────────────────

  describe('manejo de errores 401', () => {
    it('elimina el token de localStorage al recibir 401', () => {
      localStorage.setItem(TOKEN_KEY, 'expired-token');
      http.get('/api/protected').subscribe({ error: () => {} });
      httpMock
        .expectOne('/api/protected')
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });

    it('navega a /login al recibir 401', () => {
      spyOn(router, 'navigate');
      localStorage.setItem(TOKEN_KEY, 'expired-token');
      http.get('/api/protected').subscribe({ error: () => {} });
      httpMock
        .expectOne('/api/protected')
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('propaga el error para que el subscriber lo reciba', () => {
      let errorCapturado: any;
      http.get('/api/test').subscribe({ error: (e) => (errorCapturado = e) });
      httpMock
        .expectOne('/api/test')
        .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      expect(errorCapturado).toBeTruthy();
      expect(errorCapturado.status).toBe(401);
    });
  });

  // ── Otros errores ───────────────────────────────────────────────

  describe('otros errores HTTP', () => {
    it('NO navega a /login en error 500', () => {
      spyOn(router, 'navigate');
      http.get('/api/test').subscribe({ error: () => {} });
      httpMock
        .expectOne('/api/test')
        .flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('NO navega a /login en error 403', () => {
      spyOn(router, 'navigate');
      http.get('/api/test').subscribe({ error: () => {} });
      httpMock
        .expectOne('/api/test')
        .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('propaga el error en casos distintos a 401', () => {
      let errorCapturado: any;
      http.get('/api/test').subscribe({ error: (e) => (errorCapturado = e) });
      httpMock
        .expectOne('/api/test')
        .flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errorCapturado.status).toBe(500);
    });
  });
});
