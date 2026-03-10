import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/dashboard`;

const wrap = <T>(data: T) => ({ success: true, data, timestamp: new Date().toISOString() });

const mockEstadisticasGenerales = () => ({
  clientes: { total: 50, activos: 45, inactivos: 5 },
  trabajadores: { total: 5, activos: 5, inactivos: 0 },
  sesiones: { hoy: 3, estaSemana: 15 },
  registros: { ultimaSemana: 10 },
  objetivos: { totalObjetivosGenerales: 20, totalAreas: 5 },
});

const mockEstadisticasTrabajador = () => ({
  clientesAsignados: 10,
  sesiones: { hoy: 2, esteMes: 30, porEstado: { completadas: 25, programadas: 3, canceladasConAviso: 1, canceladasSinAviso: 1 } },
  registros: { esteMes: 20 },
});

const mockResumenCompleto = () => ({
  estadisticas: mockEstadisticasTrabajador(),
  clientesMasActivos: [],
  objetivosMasTrabajados: [],
  actividadReciente: [],
  distribucionSesiones: [],
});

const mockMiDia = () => ({
  saludo: 'Buenos días, Laura',
  fecha: '2026-03-10',
  contadores: { sesionesHoy: 3, registrosHoy: 2, notificacionesUrgentes: 1, bonosCriticos: 0 },
  sesionesHoy: [],
  alertasUrgentes: [],
  accionesPendientes: { informesEnBorrador: [], bonosSinCobrar: [], objetivosSinEvaluar: [] },
  resumenMes: {
    clientesAsignados: 10,
    sesiones: { esteMes: 30, porEstado: { completadas: 25, programadas: 3, canceladasConAviso: 1, canceladasSinAviso: 1 } },
    registros: { esteMes: 20 },
  },
});

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ── getEstadisticasGenerales ──────────────────────────────────────────────
  describe('getEstadisticasGenerales()', () => {
    it('hace GET a /dashboard/estadisticas-generales', () => {
      const data = mockEstadisticasGenerales();
      service.getEstadisticasGenerales().subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/estadisticas-generales`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });

    it('actualiza el signal estadisticas', () => {
      const data = mockEstadisticasGenerales();
      service.getEstadisticasGenerales().subscribe();

      httpMock.expectOne(`${API}/estadisticas-generales`).flush(wrap(data));

      expect(service.estadisticas()).toEqual(data);
    });

    it('desactiva isLoading al completar', () => {
      service.getEstadisticasGenerales().subscribe();
      httpMock.expectOne(`${API}/estadisticas-generales`).flush(wrap(mockEstadisticasGenerales()));
      expect(service.isLoading()).toBe(false);
    });
  });

  // ── getMisEstadisticas ────────────────────────────────────────────────────
  describe('getMisEstadisticas()', () => {
    it('hace GET a /dashboard/mis-estadisticas', () => {
      const data = mockEstadisticasTrabajador();
      service.getMisEstadisticas().subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/mis-estadisticas`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });

    it('actualiza el signal estadisticas con datos del trabajador', () => {
      const data = mockEstadisticasTrabajador();
      service.getMisEstadisticas().subscribe();

      httpMock.expectOne(`${API}/mis-estadisticas`).flush(wrap(data));

      expect(service.estadisticas()).toEqual(data);
    });
  });

  // ── getClientesMasActivos ─────────────────────────────────────────────────
  describe('getClientesMasActivos()', () => {
    it('incluye el parámetro limite en la query', () => {
      service.getClientesMasActivos(5).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${API}/clientes-mas-activos` && r.params.get('limite') === '5',
      );
      expect(req.request.method).toBe('GET');
      req.flush(wrap([]));
    });

    it('usa limite=10 por defecto', () => {
      service.getClientesMasActivos().subscribe();

      const req = httpMock.expectOne((r) => r.params.get('limite') === '10');
      req.flush(wrap([]));
    });
  });

  // ── getObjetivosMasTrabajados ─────────────────────────────────────────────
  describe('getObjetivosMasTrabajados()', () => {
    it('hace GET a /dashboard/objetivos-mas-trabajados con limite', () => {
      service.getObjetivosMasTrabajados(3).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${API}/objetivos-mas-trabajados` && r.params.get('limite') === '3',
      );
      req.flush(wrap([]));
    });
  });

  // ── getActividadReciente ──────────────────────────────────────────────────
  describe('getActividadReciente()', () => {
    it('hace GET a /dashboard/actividad-reciente con limite', () => {
      service.getActividadReciente(5).subscribe();

      const req = httpMock.expectOne((r) =>
        r.url === `${API}/actividad-reciente` && r.params.get('limite') === '5',
      );
      req.flush(wrap([]));
    });
  });

  // ── getDistribucionSesiones ───────────────────────────────────────────────
  describe('getDistribucionSesiones()', () => {
    it('hace GET a /dashboard/distribucion-sesiones', () => {
      const data = [{ tipo: 'PEDAGOGIA', cantidad: 80 }];
      service.getDistribucionSesiones().subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/distribucion-sesiones`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });
  });

  // ── getResumenCompleto ────────────────────────────────────────────────────
  describe('getResumenCompleto()', () => {
    it('hace GET a /dashboard/resumen', () => {
      const data = mockResumenCompleto();
      service.getResumenCompleto().subscribe((res) => expect(res).toEqual(data));

      const req = httpMock.expectOne(`${API}/resumen`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));
    });

    it('actualiza signals resumenCompleto y estadisticas', () => {
      const data = mockResumenCompleto();
      service.getResumenCompleto().subscribe();

      httpMock.expectOne(`${API}/resumen`).flush(wrap(data));

      expect(service.resumenCompleto()).toEqual(data);
      expect(service.estadisticas()).toEqual(data.estadisticas);
    });
  });

  // ── getMiDia ──────────────────────────────────────────────────────────────
  describe('getMiDia()', () => {
    it('hace GET a /dashboard/mi-dia y actualiza signal miDia', () => {
      const data = mockMiDia();
      service.getMiDia().subscribe();

      const req = httpMock.expectOne(`${API}/mi-dia`);
      expect(req.request.method).toBe('GET');
      req.flush(wrap(data));

      expect(service.miDia()?.saludo).toBe('Buenos días, Laura');
    });
  });

  // ── clearState ────────────────────────────────────────────────────────────
  describe('clearState()', () => {
    it('limpia todos los signals', () => {
      service.estadisticas.set(mockEstadisticasGenerales());
      service.resumenCompleto.set(mockResumenCompleto());
      service.isLoading.set(true);

      service.clearState();

      expect(service.estadisticas()).toBeNull();
      expect(service.resumenCompleto()).toBeNull();
      expect(service.isLoading()).toBe(false);
    });
  });
});
