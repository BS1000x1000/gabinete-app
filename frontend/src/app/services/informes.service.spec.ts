import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InformesService } from './informes.service';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/informes`;

const wrap = <T>(data: T) => ({ success: true, data, timestamp: new Date().toISOString() });

const mockInforme = (overrides: Record<string, any> = {}) => ({
  id: 'informe-1',
  clienteId: 'cliente-1',
  trabajadorId: 'trab-1',
  tipoInforme: 'INICIAL' as const,
  estado: 'BORRADOR' as const,
  titulo: 'Informe inicial',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('InformesService', () => {
  let service: InformesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InformesService);
    httpMock = TestBed.inject(HttpTestingController);
    // Stub browser APIs used by triggerDownload
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => httpMock.verify());

  // ── getInformesByCliente ──────────────────────────────────────────────────
  describe('getInformesByCliente()', () => {
    it('hace GET a /informes/cliente/:clienteId', () => {
      service.getInformesByCliente('cliente-1').subscribe();

      const req = httpMock.expectOne(`${API}/cliente/cliente-1`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap([]));
    });

    it('actualiza el signal informes', () => {
      const data = [mockInforme(), mockInforme({ id: 'informe-2' })];
      service.getInformesByCliente('cliente-1').subscribe();

      httpMock.expectOne(`${API}/cliente/cliente-1`).flush(wrap(data));

      expect(service.informes()).toHaveSize(2);
    });
  });

  // ── getById ───────────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('hace GET a /informes/:id y actualiza informeActivo', () => {
      const data = mockInforme();
      service.getById('informe-1').subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/informe-1`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));

      expect(service.informeActivo()).toEqual(data);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('hace POST a /informes y prepende al signal', () => {
      const dto = { clienteId: 'cliente-1', tipoInforme: 'INICIAL' as const, titulo: 'Nuevo' };
      const nuevo = mockInforme({ id: 'informe-nuevo' });
      service.informes.set([mockInforme()]);

      service.create(dto).subscribe();

      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      req.flush(wrap(nuevo));

      expect(service.informes()[0].id).toBe('informe-nuevo');
      expect(service.informeActivo()?.id).toBe('informe-nuevo');
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('hace PATCH a /informes/:id y actualiza signal', () => {
      const original = mockInforme({ titulo: 'Viejo' });
      const actualizado = mockInforme({ titulo: 'Nuevo' });
      service.informes.set([original]);

      service.update('informe-1', { titulo: 'Nuevo' } as any).subscribe();

      const req = httpMock.expectOne(`${API}/informe-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap(actualizado));

      expect(service.informes()[0].titulo).toBe('Nuevo');
      expect(service.informeActivo()?.titulo).toBe('Nuevo');
    });
  });

  // ── finalizar ─────────────────────────────────────────────────────────────
  describe('finalizar()', () => {
    it('hace PATCH a /informes/:id/finalizar y actualiza estado a FINALIZADO', () => {
      const finalizado = mockInforme({ estado: 'FINALIZADO' as const });
      service.informes.set([mockInforme()]);

      service.finalizar('informe-1').subscribe();

      const req = httpMock.expectOne(`${API}/informe-1/finalizar`);
      expect(req.request.method).toBe('PATCH');
      req.flush(wrap(finalizado));

      expect(service.informes()[0].estado).toBe('FINALIZADO');
    });
  });

  // ── descargarPdf ──────────────────────────────────────────────────────────
  describe('descargarPdf()', () => {
    it('hace GET a /informes/:id/pdf con responseType blob', () => {
      service.descargarPdf('informe-1', 'Informe Inicial').subscribe();

      const req = httpMock.expectOne(`${API}/informe-1/pdf`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));
    });

    it('completa el observable al recibir el blob', (done) => {
      service.descargarPdf('informe-1', 'Informe Inicial').subscribe({ complete: done });
      httpMock.expectOne(`${API}/informe-1/pdf`).flush(new Blob(['%PDF'], { type: 'application/pdf' }));
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('hace DELETE a /informes/:id y elimina del signal', () => {
      service.informes.set([mockInforme(), mockInforme({ id: 'informe-2' })]);

      service.delete('informe-1').subscribe();

      const req = httpMock.expectOne(`${API}/informe-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(wrap({ message: 'Eliminado' }));

      expect(service.informes()).toHaveSize(1);
      expect(service.informes()[0].id).toBe('informe-2');
    });

    it('limpia informeActivo si era el informe eliminado', () => {
      service.informes.set([mockInforme()]);
      service.informeActivo.set(mockInforme());

      service.delete('informe-1').subscribe();
      httpMock.expectOne(`${API}/informe-1`).flush(wrap({ message: 'Eliminado' }));

      expect(service.informeActivo()).toBeNull();
    });
  });
});
