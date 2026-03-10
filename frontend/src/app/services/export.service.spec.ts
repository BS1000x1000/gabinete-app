import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ExportService } from './export.service';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/export`;

describe('ExportService', () => {
  let service: ExportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ExportService);
    httpMock = TestBed.inject(HttpTestingController);
    // Stub browser APIs used by triggerDownload
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
    spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => httpMock.verify());

  // ── exportSesiones ────────────────────────────────────────────────────────
  describe('exportSesiones()', () => {
    it('hace GET a /export/sesiones/:clienteId con formato=pdf', () => {
      service.exportSesiones('cliente-1', { formato: 'pdf' }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${API}/sesiones/cliente-1` && r.params.get('formato') === 'pdf',
      );
      expect(req.request.method).toBe('GET');
      req.flush(new Blob(['%PDF'], { type: 'application/pdf' }));
    });

    it('hace GET a /export/sesiones/:clienteId con formato=excel', () => {
      service.exportSesiones('cliente-1', { formato: 'excel' }).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${API}/sesiones/cliente-1` && r.params.get('formato') === 'excel',
      );
      expect(req.request.method).toBe('GET');
      req.flush(new Blob([], { type: 'application/vnd.openxmlformats' }));
    });

    it('incluye parámetros desde y hasta cuando se proporcionan', () => {
      service
        .exportSesiones('cliente-1', { formato: 'pdf', desde: '2026-01-01', hasta: '2026-03-31' })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.params.get('desde') === '2026-01-01' && r.params.get('hasta') === '2026-03-31',
      );
      req.flush(new Blob());
    });

    it('completa el observable al recibir el blob (formato pdf)', (done) => {
      service.exportSesiones('cliente-1', { formato: 'pdf' }).subscribe({
        complete: done,
      });
      httpMock.expectOne(() => true).flush(new Blob(['%PDF'], { type: 'application/pdf' }));
    });

    it('completa el observable al recibir el blob (formato excel)', (done) => {
      service.exportSesiones('cliente-1', { formato: 'excel' }).subscribe({
        complete: done,
      });
      httpMock.expectOne(() => true).flush(new Blob([], { type: 'application/vnd.openxmlformats' }));
    });

    it('devuelve void (completa sin valor)', (done) => {
      service.exportSesiones('cliente-1', { formato: 'pdf' }).subscribe({
        next: (val) => expect(val).toBeUndefined(),
        complete: done,
      });
      httpMock.expectOne(() => true).flush(new Blob());
    });
  });

  // ── exportBonos ───────────────────────────────────────────────────────────
  describe('exportBonos()', () => {
    it('usa URL /export/bonos/:clienteId cuando hay clienteId', () => {
      service.exportBonos('cliente-1', { formato: 'pdf' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${API}/bonos/cliente-1`);
      expect(req.request.method).toBe('GET');
      req.flush(new Blob());
    });

    it('usa URL /export/bonos cuando clienteId es null (exportación global)', () => {
      service.exportBonos(null, { formato: 'pdf' }).subscribe();

      const req = httpMock.expectOne((r) => r.url === `${API}/bonos`);
      expect(req.request.method).toBe('GET');
      req.flush(new Blob());
    });

    it('completa el observable para clienteId null con formato pdf', (done) => {
      service.exportBonos(null, { formato: 'pdf' }).subscribe({ complete: done });
      httpMock.expectOne(() => true).flush(new Blob());
    });

    it('completa el observable para clienteId con formato excel', (done) => {
      service.exportBonos('cliente-1', { formato: 'excel' }).subscribe({ complete: done });
      httpMock.expectOne(() => true).flush(new Blob());
    });
  });
});
