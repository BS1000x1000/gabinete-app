import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RegistrosService } from './registros.service';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/registros`;

const wrap = <T>(data: T) => ({ success: true, data, timestamp: new Date().toISOString() });

const mockRegistro = (overrides: Record<string, any> = {}) => ({
  id: 'reg-1',
  clienteId: 'cliente-1',
  trabajadorId: 'trab-1',
  contenido: 'Contenido del registro',
  fechaRegistro: new Date().toISOString(),
  ...overrides,
});

describe('RegistrosService', () => {
  let service: RegistrosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RegistrosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getRegistrosByCliente ─────────────────────────────────────────────────
  describe('getRegistrosByCliente()', () => {
    it('hace GET a /registros/cliente/:clienteId', () => {
      service.getRegistrosByCliente('cliente-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente/cliente-1`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap([]));
    });

    it('actualiza el signal registros', () => {
      const data = [mockRegistro(), mockRegistro({ id: 'reg-2' })];
      service.getRegistrosByCliente('cliente-1').subscribe();

      httpMock.expectOne(`${API}/cliente/cliente-1`).flush(wrap(data));

      expect(service.registros()).toHaveSize(2);
    });

    it('desactiva isLoading al completar', () => {
      service.getRegistrosByCliente('cliente-1').subscribe();
      httpMock.expectOne(`${API}/cliente/cliente-1`).flush(wrap([]));
      expect(service.isLoading()).toBe(false);
    });
  });

  // ── getMisRegistros ───────────────────────────────────────────────────────
  describe('getMisRegistros()', () => {
    it('hace GET a /registros/mis-registros', () => {
      const data = [mockRegistro()];
      service.getMisRegistros().subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/mis-registros`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });
  });

  // ── getRegistroById ───────────────────────────────────────────────────────
  describe('getRegistroById()', () => {
    it('hace GET a /registros/:id', () => {
      const data = mockRegistro();
      service.getRegistroById('reg-1').subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/reg-1`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });
  });

  // ── createRegistro ────────────────────────────────────────────────────────
  describe('createRegistro()', () => {
    it('hace POST a /registros y agrega al signal', () => {
      const dto = { clienteId: 'cliente-1', contenido: 'Nuevo registro' } as any;
      const nuevo = mockRegistro({ id: 'reg-nuevo' });
      service.registros.set([mockRegistro()]);

      service.createRegistro(dto).subscribe();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      req.flush(wrap(nuevo));

      expect(service.registros()[0].id).toBe('reg-nuevo');
    });
  });

  // ── updateRegistro ────────────────────────────────────────────────────────
  describe('updateRegistro()', () => {
    it('hace PATCH a /registros/:id y actualiza el signal', () => {
      const original = mockRegistro({ contenido: 'Viejo' });
      const actualizado = mockRegistro({ contenido: 'Nuevo' });
      service.registros.set([original]);

      service.updateRegistro('reg-1', { contenido: 'Nuevo' } as any).subscribe();

      const req = httpMock.expectOne(`${API}/reg-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap(actualizado));

      expect(service.registros()[0].contenido).toBe('Nuevo');
    });
  });

  // ── deleteRegistro ────────────────────────────────────────────────────────
  describe('deleteRegistro()', () => {
    it('hace DELETE a /registros/:id y elimina del signal', () => {
      service.registros.set([mockRegistro(), mockRegistro({ id: 'reg-2' })]);

      service.deleteRegistro('reg-1').subscribe();

      const req = httpMock.expectOne(`${API}/reg-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(wrap({ message: 'Eliminado', id: 'reg-1' }));

      expect(service.registros()).toHaveSize(1);
      expect(service.registros()[0].id).toBe('reg-2');
    });
  });

  // ── clearState ────────────────────────────────────────────────────────────
  describe('clearState()', () => {
    it('vacía registros y desactiva isLoading', () => {
      service.registros.set([mockRegistro()]);
      service.isLoading.set(true);

      service.clearState();

      expect(service.registros()).toHaveSize(0);
      expect(service.isLoading()).toBe(false);
    });
  });
});
