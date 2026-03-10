import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { NotificacionesService } from './notificaciones.service';
import { Notificacion } from '../interface/notificacion.interface';
import { environment } from '../../environments/environment.development';

const API = `${environment.apiUrl}/notificaciones`;

function makeNotif(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'notif-1',
    tipo: 'BONO_CASI_AGOTADO',
    prioridad: 'MEDIA',
    titulo: 'Bono casi agotado',
    mensaje: 'Al cliente le quedan pocas sesiones',
    leida: false,
    descartada: false,
    fechaCreacion: '2026-03-10T09:00:00.000Z',
    ...overrides,
  };
}

describe('NotificacionesService', () => {
  let service: NotificacionesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NotificacionesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.detenerPolling();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────

  describe('estado inicial', () => {
    it('notificaciones empieza vacío', () => {
      expect(service.notificaciones()).toEqual([]);
    });

    it('contadorNoLeidas empieza en 0', () => {
      expect(service.contadorNoLeidas()).toBe(0);
    });
  });

  // ── Computed signals ────────────────────────────────────────────

  describe('computed signals', () => {
    beforeEach(() => {
      service.cargar().subscribe();
      httpMock.expectOne(API).flush([
        makeNotif({ id: 'n1', leida: false, descartada: false }), // cuenta
        makeNotif({ id: 'n2', leida: true, descartada: false }),  // leída — no cuenta
        makeNotif({ id: 'n3', leida: false, descartada: true }),  // descartada — no cuenta
        makeNotif({ id: 'n4', leida: false, descartada: false }), // cuenta
      ]);
    });

    it('noLeidas filtra correctamente: solo !leida && !descartada', () => {
      const noLeidas = service.noLeidas();
      expect(noLeidas.length).toBe(2);
      expect(noLeidas.every((n) => !n.leida && !n.descartada)).toBeTrue();
    });

    it('contadorNoLeidas devuelve el número correcto', () => {
      expect(service.contadorNoLeidas()).toBe(2);
    });
  });

  // ── cargar() ────────────────────────────────────────────────────

  describe('cargar()', () => {
    it('hace GET a /notificaciones', () => {
      service.cargar().subscribe();
      const req = httpMock.expectOne(API);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('establece el signal notificaciones con array directo', () => {
      const notifs = [makeNotif()];
      service.cargar().subscribe();
      httpMock.expectOne(API).flush(notifs);
      expect(service.notificaciones()).toEqual(notifs);
    });

    it('maneja respuesta envuelta en { data: [...] }', () => {
      const notifs = [makeNotif()];
      service.cargar().subscribe();
      httpMock.expectOne(API).flush({ data: notifs });
      expect(service.notificaciones()).toEqual(notifs);
    });

    it('no lanza error en caso de fallo HTTP (catchError devuelve EMPTY)', () => {
      let completed = false;
      service.cargar().subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(API).flush('Error', { status: 500, statusText: 'Server Error' });
      expect(completed).toBeTrue();
    });
  });

  // ── marcarLeida() ───────────────────────────────────────────────

  describe('marcarLeida()', () => {
    it('hace PATCH a /:id/leer y marca la notificación como leída', () => {
      const notif = makeNotif({ id: 'n1', leida: false });
      service.cargar().subscribe();
      httpMock.expectOne(API).flush([notif]);

      service.marcarLeida('n1').subscribe();
      const req = httpMock.expectOne(`${API}/n1/leer`);
      expect(req.request.method).toBe('PATCH');
      req.flush({ ...notif, leida: true });

      expect(service.notificaciones()[0].leida).toBeTrue();
    });

    it('solo actualiza la notificación afectada', () => {
      service.cargar().subscribe();
      httpMock.expectOne(API).flush([
        makeNotif({ id: 'n1', leida: false }),
        makeNotif({ id: 'n2', leida: false }),
      ]);

      service.marcarLeida('n1').subscribe();
      httpMock.expectOne(`${API}/n1/leer`).flush(makeNotif({ id: 'n1', leida: true }));

      expect(service.notificaciones()[0].leida).toBeTrue();
      expect(service.notificaciones()[1].leida).toBeFalse();
    });
  });

  // ── marcarTodasLeidas() ─────────────────────────────────────────

  describe('marcarTodasLeidas()', () => {
    it('hace PATCH a /leer-todas y marca todas como leídas', () => {
      service.cargar().subscribe();
      httpMock.expectOne(API).flush([
        makeNotif({ id: 'n1', leida: false }),
        makeNotif({ id: 'n2', leida: false }),
      ]);

      service.marcarTodasLeidas().subscribe();
      const req = httpMock.expectOne(`${API}/leer-todas`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});

      expect(service.notificaciones().every((n) => n.leida)).toBeTrue();
    });
  });

  // ── descartar() ─────────────────────────────────────────────────

  describe('descartar()', () => {
    it('hace PATCH a /:id/descartar y elimina la notificación de la lista', () => {
      service.cargar().subscribe();
      httpMock.expectOne(API).flush([
        makeNotif({ id: 'n1' }),
        makeNotif({ id: 'n2' }),
      ]);

      service.descartar('n1').subscribe();
      const req = httpMock.expectOne(`${API}/n1/descartar`);
      expect(req.request.method).toBe('PATCH');
      req.flush({});

      expect(service.notificaciones().length).toBe(1);
      expect(service.notificaciones()[0].id).toBe('n2');
    });
  });

  // ── evaluar() ───────────────────────────────────────────────────

  describe('evaluar()', () => {
    it('hace POST a /notificaciones/evaluar y actualiza la lista', () => {
      const notifs = [makeNotif({ id: 'n-nueva' })];
      service.evaluar().subscribe();
      const req = httpMock.expectOne(`${API}/evaluar`);
      expect(req.request.method).toBe('POST');
      req.flush({ data: notifs });
      expect(service.notificaciones()).toEqual(notifs);
    });

    it('no lanza error en caso de fallo HTTP', () => {
      let completed = false;
      service.evaluar().subscribe({ complete: () => (completed = true) });
      httpMock.expectOne(`${API}/evaluar`).flush('Error', { status: 500, statusText: 'Error' });
      expect(completed).toBeTrue();
    });
  });

  // ── Polling ─────────────────────────────────────────────────────

  describe('iniciarPolling() / detenerPolling()', () => {
    it('no arranca un segundo intervalo si ya está activo', fakeAsync(() => {
      service.iniciarPolling();
      service.iniciarPolling(); // segunda llamada, debe ignorarse

      tick(5 * 60 * 1000);

      // Solo debe haber UN request de /count (no dos)
      const reqs = httpMock.match(`${API}/count`);
      expect(reqs.length).toBe(1);
      reqs[0].flush(0);

      service.detenerPolling();
    }));

    it('detenerPolling evita que se hagan más peticiones', fakeAsync(() => {
      service.iniciarPolling();
      service.detenerPolling();

      tick(10 * 60 * 1000);

      // No debe haber ningún request después de detener
      const reqs = httpMock.match(`${API}/count`);
      expect(reqs.length).toBe(0);
    }));

    it('el polling recarga notificaciones cuando el contador cambia', fakeAsync(() => {
      // Carga inicial con 1 no-leída
      service.cargar().subscribe();
      httpMock.expectOne(API).flush([makeNotif({ id: 'n1', leida: false })]);

      service.iniciarPolling();
      tick(5 * 60 * 1000);

      // El backend reporta 2 no-leídas (diferente al contador actual de 1)
      httpMock.expectOne(`${API}/count`).flush(2);

      // Debe disparar un cargar() automático
      httpMock.expectOne(API).flush([
        makeNotif({ id: 'n1', leida: false }),
        makeNotif({ id: 'n2', leida: false }),
      ]);

      expect(service.contadorNoLeidas()).toBe(2);

      service.detenerPolling();
    }));
  });
});
