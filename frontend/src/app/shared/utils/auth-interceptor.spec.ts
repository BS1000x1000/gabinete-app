import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { authInterceptor } from './auth-interceptor';

/**
 * El JWT viaja en una **cookie HttpOnly**: el navegador la manda solo, siempre
 * que la peticion lleve `withCredentials`. El interceptor no inyecta ninguna
 * cabecera `Authorization`, y eso es deliberado — una cookie HttpOnly no es
 * legible desde JavaScript, que es justo lo que se buscaba al dejar de guardar
 * el token en `localStorage`.
 *
 * La version anterior de este spec afirmaba que se anadia `Bearer <token>`
 * leyendolo de `localStorage`. Llevaba 3 casos en rojo desde la migracion.
 */
describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('credenciales', () => {
    it('manda la petición con withCredentials para que viaje la cookie', () => {
      http.get('/api/algo').subscribe();

      const req = httpMock.expectOne('/api/algo');
      expect(req.request.withCredentials).toBe(true);
      req.flush({});
    });

    it('NO añade cabecera Authorization: el token no está en JavaScript', () => {
      http.get('/api/algo').subscribe();

      const req = httpMock.expectOne('/api/algo');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('respeta las cabeceras que ya traía la petición', () => {
      http.get('/api/algo', { headers: { 'X-Propia': 'valor' } }).subscribe();

      const req = httpMock.expectOne('/api/algo');
      expect(req.request.headers.get('X-Propia')).toBe('valor');
      req.flush({});
    });
  });

  describe('manejo de errores', () => {
    it('ante un 401 limpia el usuario cacheado y manda a /login', () => {
      http.get('/api/algo').subscribe({ error: () => undefined });
      localStorage.setItem('current_user', '{"id":"1"}');

      httpMock
        .expectOne('/api/algo')
        .flush('no autorizado', { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem('current_user')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('no toca la sesión ante otros errores', () => {
      localStorage.setItem('current_user', '{"id":"1"}');
      http.get('/api/algo').subscribe({ error: () => undefined });

      httpMock
        .expectOne('/api/algo')
        .flush('boom', { status: 500, statusText: 'Server Error' });

      expect(localStorage.getItem('current_user')).not.toBeNull();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
