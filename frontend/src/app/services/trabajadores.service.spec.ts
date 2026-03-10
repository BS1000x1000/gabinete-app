import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TrabajadorService } from './trabajadores.service';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/trabajadores`;
const ROLES_API = `${environment.apiUrl}/roles`;

const wrap = <T>(data: T) => ({ success: true, data, timestamp: new Date().toISOString() });

const mockTrabajador = (overrides: Record<string, any> = {}) => ({
  id: 'trabajador-1',
  nombre: 'Laura',
  apellidos: 'Martín',
  email: 'laura@test.es',
  username: 'laura_m',
  activo: true,
  rol: { id: 'rol-1', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' },
  ...overrides,
});

describe('TrabajadorService', () => {
  let service: TrabajadorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrabajadorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getTrabajadores ───────────────────────────────────────────────────────
  describe('getTrabajadores()', () => {
    it('hace GET a /trabajadores sin parámetros por defecto', () => {
      service.getTrabajadores().subscribe();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('GET');
      req.flush(wrap([mockTrabajador()]));
    });

    it('incluye ?incluirInactivos=true cuando se solicita', () => {
      service.getTrabajadores(true).subscribe();

      const req = httpMock.expectOne(`${API}?incluirInactivos=true`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap([]));
    });

    it('actualiza el signal trabajadores', () => {
      const lista = [mockTrabajador(), mockTrabajador({ id: 'trab-2' })];
      service.getTrabajadores().subscribe();

      httpMock.expectOne(API).flush(wrap(lista));

      expect(service.trabajadores()).toHaveSize(2);
    });

    it('devuelve array vacío si hay error de red', () => {
      service.getTrabajadores().subscribe((res: any) => {
        expect(res.data).toEqual([]);
      });

      httpMock.expectOne(API).error(new ErrorEvent('Network error'));
    });
  });

  // ── getRoles ──────────────────────────────────────────────────────────────
  describe('getRoles()', () => {
    it('hace GET a /roles', () => {
      const roles = [{ id: 'rol-1', nombreRol: 'Pedagogo', codigo: 'PEDAGOGO' }];
      service.getRoles().subscribe((res: any) => expect(res.data).toEqual(roles));

      const req = httpMock.expectOne(ROLES_API);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(roles));
    });
  });

  // ── createTrabajador ──────────────────────────────────────────────────────
  describe('createTrabajador()', () => {
    it('hace POST a /trabajadores', () => {
      const payload = {
        username: 'nuevo',
        password: 'Pass123!',
        nombre: 'Ana',
        apellidos: 'Gil',
        email: 'ana@test.es',
        rolId: 'rol-1',
      };
      service.createTrabajador(payload).subscribe();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(wrap(mockTrabajador()));
    });
  });

  // ── updateTrabajador ──────────────────────────────────────────────────────
  describe('updateTrabajador()', () => {
    it('hace PATCH a /trabajadores/:id', () => {
      const payload = { nombre: 'Laura M.' };
      service.updateTrabajador('trabajador-1', payload).subscribe();

      const req = httpMock.expectOne(`${API}/trabajador-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(payload);
      req.flush(wrap(mockTrabajador({ nombre: 'Laura M.' })));
    });
  });

  // ── desactivarTrabajador ──────────────────────────────────────────────────
  describe('desactivarTrabajador()', () => {
    it('hace DELETE a /trabajadores/:id', () => {
      service.desactivarTrabajador('trabajador-1').subscribe();

      const req = httpMock.expectOne(`${API}/trabajador-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(wrap({ message: 'Desactivado' }));
    });
  });

  // ── reactivarTrabajador ───────────────────────────────────────────────────
  describe('reactivarTrabajador()', () => {
    it('hace PATCH a /trabajadores/:id/reactivar', () => {
      service.reactivarTrabajador('trabajador-1').subscribe();

      const req = httpMock.expectOne(`${API}/trabajador-1/reactivar`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap(mockTrabajador({ activo: true })));
    });
  });
});
