import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { SesionesService } from './sesiones.service';
import {
  SesionData,
  EstadoSesion,
  TipoSesion,
  CreateSesionDto,
} from '../interface/sesion.interface';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/sesiones`;

function makeSesion(overrides: Partial<SesionData> = {}): SesionData {
  return {
    id: 'sesion-1',
    fechaHoraInicio: '2026-03-10T10:00:00.000Z',
    fechaHoraFin: '2026-03-10T11:00:00.000Z',
    estado: EstadoSesion.PROGRAMADA,
    tipoSesion: TipoSesion.PEDAGOGIA,
    clienteId: 'cliente-1',
    trabajadorId: 'trabajador-1',
    cliente: { id: 'cliente-1', nombre: 'Ana', apellidos: 'García' },
    ...overrides,
  };
}

describe('SesionesService', () => {
  let service: SesionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SesionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────

  describe('estado inicial', () => {
    it('sesiones empieza vacío', () => {
      expect(service.sesiones()).toEqual([]);
    });

    it('selectedId empieza vacío', () => {
      expect(service.selectedId()).toBe('');
    });

    it('isLoading empieza en false', () => {
      expect(service.isLoading()).toBeFalse();
    });
  });

  // ── getSesionesByCliente() ──────────────────────────────────────

  describe('getSesionesByCliente()', () => {
    // El endpoint pagina: { success, data: { data, total, page, limit } }
    const URL = `${API}/cliente/cliente-1?limit=500`;
    const wrapPag = (data: any[], total = data.length) => ({
      success: true,
      data: { data, total, page: 1, limit: 500 },
    });

    it('hace GET a la URL correcta pidiendo el maximo permitido', () => {
      service.getSesionesByCliente('cliente-1').subscribe();
      const req = httpMock.expectOne(URL);
      expect(req.request.method).toBe('GET');
      req.flush(wrapPag([]));
    });

    it('establece el signal sesiones con los datos recibidos', () => {
      const sesiones = [makeSesion()];
      service.getSesionesByCliente('cliente-1').subscribe();
      httpMock.expectOne(URL).flush(wrapPag(sesiones));
      expect(service.sesiones()).toEqual(sesiones);
    });

    it('guarda el total del servidor para poder detectar el truncado', () => {
      service.getSesionesByCliente('cliente-1').subscribe();
      httpMock.expectOne(URL).flush(wrapPag([makeSesion()], 743));
      expect(service.totalServidor()).toBe(743);
    });

    it('pone isLoading en false tras respuesta exitosa', () => {
      service.getSesionesByCliente('cliente-1').subscribe();
      httpMock.expectOne(URL).flush(wrapPag([]));
      expect(service.isLoading()).toBeFalse();
    });

    it('pone isLoading en false tras error HTTP', () => {
      service.getSesionesByCliente('cliente-1').subscribe({ error: () => {} });
      httpMock
        .expectOne(URL)
        .flush('Error', { status: 500, statusText: 'Server Error' });
      expect(service.isLoading()).toBeFalse();
    });
  });

  // ── getSesionesByTrabajador() ───────────────────────────────────

  describe('getSesionesByTrabajador()', () => {
    it('hace GET a /trabajador/horario sin params cuando no se pasan fechas', () => {
      service.getSesionesByTrabajador().subscribe();
      const req = httpMock.expectOne(`${API}/trabajador/horario`);
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: [] });
    });

    it('incluye fechaInicio y fechaFin como query params cuando se pasan', () => {
      service.getSesionesByTrabajador('2026-03-01', '2026-03-07').subscribe();
      const req = httpMock.expectOne(
        `${API}/trabajador/horario?fechaInicio=2026-03-01&fechaFin=2026-03-07`,
      );
      expect(req.request.method).toBe('GET');
      req.flush({ success: true, data: [] });
    });
  });

  // ── getSesionById() ─────────────────────────────────────────────

  describe('getSesionById()', () => {
    it('hace GET a /sesiones/:id y devuelve la sesión', () => {
      const sesion = makeSesion();
      service.getSesionById('sesion-1').subscribe((s) => {
        expect(s).toEqual(sesion);
      });
      httpMock.expectOne(`${API}/sesion-1`).flush({ success: true, data: sesion });
    });
  });

  // ── createSesion() ──────────────────────────────────────────────

  describe('createSesion()', () => {
    it('hace POST y añade la nueva sesión al signal', () => {
      const dto: CreateSesionDto = {
        fechaHoraInicio: '2026-03-10T10:00:00.000Z',
        fechaHoraFin: '2026-03-10T11:00:00.000Z',
        tipoSesion: TipoSesion.PEDAGOGIA,
        clienteId: 'cliente-1',
        trabajadorId: 'trabajador-1',
      };
      const nueva = makeSesion({ id: 'sesion-nueva' });

      service.createSesion(dto).subscribe();
      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ success: true, data: nueva });

      expect(service.sesiones()).toContain(nueva);
    });

    it('acumula sesiones cuando ya hay otras en el signal', () => {
      const existente = makeSesion({ id: 'sesion-1' });
      service.sesiones.set([existente]);

      const nueva = makeSesion({ id: 'sesion-2' });
      service.createSesion({} as CreateSesionDto).subscribe();
      httpMock.expectOne(API).flush({ success: true, data: nueva });

      expect(service.sesiones().length).toBe(2);
    });
  });

  // ── completarSesion() ───────────────────────────────────────────

  describe('completarSesion()', () => {
    it('hace PATCH a /:id/completar y actualiza el estado en el signal', () => {
      const sesion = makeSesion({ id: 'sesion-1', estado: EstadoSesion.PROGRAMADA });
      service.sesiones.set([sesion]);

      service.completarSesion('sesion-1', { notas: 'Todo bien' }).subscribe();
      const req = httpMock.expectOne(`${API}/sesion-1/completar`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ success: true, data: {} });

      expect(service.sesiones()[0].estado).toBe(EstadoSesion.COMPLETADA);
    });

    it('solo actualiza la sesión afectada, no las demás', () => {
      const s1 = makeSesion({ id: 's1', estado: EstadoSesion.PROGRAMADA });
      const s2 = makeSesion({ id: 's2', estado: EstadoSesion.PROGRAMADA });
      service.sesiones.set([s1, s2]);

      service.completarSesion('s1', {}).subscribe();
      httpMock.expectOne(`${API}/s1/completar`).flush({ success: true, data: {} });

      expect(service.sesiones()[0].estado).toBe(EstadoSesion.COMPLETADA);
      expect(service.sesiones()[1].estado).toBe(EstadoSesion.PROGRAMADA);
    });
  });

  // ── cancelarSesion() ────────────────────────────────────────────

  describe('cancelarSesion()', () => {
    it('hace PATCH a /:id/cancelar con conAviso=true por defecto', () => {
      const sesion = makeSesion({ id: 'sesion-1' });
      const cancelada = makeSesion({ id: 'sesion-1', estado: EstadoSesion.CANCELADA_CON_AVISO });
      service.sesiones.set([sesion]);

      service.cancelarSesion('sesion-1').subscribe();
      const req = httpMock.expectOne(`${API}/sesion-1/cancelar`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ conAviso: true });
      req.flush({ success: true, data: cancelada });

      expect(service.sesiones()[0].estado).toBe(EstadoSesion.CANCELADA_CON_AVISO);
    });

    it('envía conAviso=false cuando se pasa explícitamente', () => {
      service.sesiones.set([makeSesion({ id: 'sesion-1' })]);
      service.cancelarSesion('sesion-1', false).subscribe();
      const req = httpMock.expectOne(`${API}/sesion-1/cancelar`);
      expect(req.request.body).toEqual({ conAviso: false });
      req.flush({
        success: true,
        data: makeSesion({ id: 'sesion-1', estado: EstadoSesion.CANCELADA_SIN_AVISO }),
      });
    });
  });

  // ── updateSesion() ──────────────────────────────────────────────

  describe('updateSesion()', () => {
    it('hace PATCH a /:id y actualiza la sesión en el signal', () => {
      const sesion = makeSesion({ id: 'sesion-1', notas: 'original' });
      const actualizada = makeSesion({ id: 'sesion-1', notas: 'actualizada' });
      service.sesiones.set([sesion]);

      service.updateSesion('sesion-1', { notas: 'actualizada' }).subscribe();
      const req = httpMock.expectOne(`${API}/sesion-1`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ success: true, data: actualizada });

      expect(service.sesiones()[0].notas).toBe('actualizada');
    });
  });

  // ── deleteSesion() ──────────────────────────────────────────────

  describe('deleteSesion()', () => {
    it('hace DELETE a /:id y elimina la sesión del signal', () => {
      const s1 = makeSesion({ id: 'sesion-1' });
      const s2 = makeSesion({ id: 'sesion-2' });
      service.sesiones.set([s1, s2]);

      service.deleteSesion('sesion-1').subscribe();
      const req = httpMock.expectOne(`${API}/sesion-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true, data: { message: 'deleted' } });

      expect(service.sesiones().length).toBe(1);
      expect(service.sesiones()[0].id).toBe('sesion-2');
    });
  });

  // ── Helpers ─────────────────────────────────────────────────────

  describe('setSelectedId()', () => {
    it('actualiza el signal selectedId', () => {
      service.setSelectedId('sesion-42');
      expect(service.selectedId()).toBe('sesion-42');
    });
  });

  describe('clearState()', () => {
    it('resetea todos los signals de estado', () => {
      service.sesiones.set([makeSesion()]);
      service.selectedId.set('sesion-1');
      service.isLoading.set(true);

      service.clearState();

      expect(service.sesiones()).toEqual([]);
      expect(service.selectedId()).toBe('');
      expect(service.isLoading()).toBeFalse();
    });
  });
});
