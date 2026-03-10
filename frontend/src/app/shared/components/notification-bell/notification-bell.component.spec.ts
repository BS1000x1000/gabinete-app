import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { NotificationBellComponent } from './notification-bell.component';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { Notificacion, PrioridadNotif } from '../../../interface/notificacion.interface';

function makeNotif(overrides: Partial<Notificacion> = {}): Notificacion {
  return {
    id: 'n1',
    tipo: 'BONO_CASI_AGOTADO',
    prioridad: 'MEDIA',
    titulo: 'Título',
    mensaje: 'Mensaje',
    leida: false,
    descartada: false,
    fechaCreacion: '2026-03-10T09:00:00.000Z',
    ...overrides,
  };
}

describe('NotificationBellComponent', () => {
  let component: NotificationBellComponent;
  let notifSvc: NotificacionesService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationBellComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(NotificationBellComponent, {
        set: { imports: [CommonModule] },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(NotificationBellComponent);
    component = fixture.componentInstance;
    notifSvc = TestBed.inject(NotificacionesService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  // ── Estado inicial ──────────────────────────────────────────────

  describe('estado inicial', () => {
    it('isOpen empieza en false', () => {
      expect(component.isOpen()).toBeFalse();
    });

    it('prioridades contiene las 4 prioridades en orden', () => {
      expect(component.prioridades).toEqual(['URGENTE', 'ALTA', 'MEDIA', 'BAJA']);
    });
  });

  // ── notificacionesPorPrioridad() ────────────────────────────────

  describe('notificacionesPorPrioridad()', () => {
    beforeEach(() => {
      // Cargamos notificaciones directamente en el servicio
      (notifSvc as any)._notificaciones.set([
        makeNotif({ id: 'n1', prioridad: 'URGENTE', descartada: false }),
        makeNotif({ id: 'n2', prioridad: 'URGENTE', descartada: true }), // descartada → no debe aparecer
        makeNotif({ id: 'n3', prioridad: 'MEDIA', descartada: false }),
        makeNotif({ id: 'n4', prioridad: 'BAJA', descartada: false }),
      ]);
    });

    it('devuelve solo las notificaciones de la prioridad dada', () => {
      const urgentes = component.notificacionesPorPrioridad('URGENTE');
      expect(urgentes.length).toBe(1);
      expect(urgentes[0].id).toBe('n1');
    });

    it('excluye las notificaciones descartadas', () => {
      const urgentes = component.notificacionesPorPrioridad('URGENTE');
      expect(urgentes.every((n) => !n.descartada)).toBeTrue();
    });

    it('devuelve array vacío para prioridades sin notificaciones', () => {
      expect(component.notificacionesPorPrioridad('ALTA')).toEqual([]);
    });
  });

  // ── tieneGrupo() ────────────────────────────────────────────────

  describe('tieneGrupo()', () => {
    it('devuelve true si hay notificaciones para la prioridad', () => {
      (notifSvc as any)._notificaciones.set([
        makeNotif({ prioridad: 'URGENTE', descartada: false }),
      ]);
      expect(component.tieneGrupo('URGENTE')).toBeTrue();
    });

    it('devuelve false si no hay notificaciones para la prioridad', () => {
      (notifSvc as any)._notificaciones.set([]);
      expect(component.tieneGrupo('URGENTE')).toBeFalse();
    });
  });

  // ── togglePanel() ───────────────────────────────────────────────

  describe('togglePanel()', () => {
    it('abre el panel cuando estaba cerrado', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.togglePanel(event);
      expect(component.isOpen()).toBeTrue();
    });

    it('cierra el panel cuando estaba abierto', () => {
      component.isOpen.set(true);
      const event = new MouseEvent('click');
      component.togglePanel(event);
      expect(component.isOpen()).toBeFalse();
    });

    it('detiene la propagación del evento', () => {
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      component.togglePanel(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  // ── cerrarPanel() ───────────────────────────────────────────────

  describe('cerrarPanel()', () => {
    it('cierra el panel', () => {
      component.isOpen.set(true);
      component.cerrarPanel();
      expect(component.isOpen()).toBeFalse();
    });
  });

  // ── onDocumentClick() ───────────────────────────────────────────

  describe('onDocumentClick()', () => {
    it('cierra el panel si está abierto', () => {
      component.isOpen.set(true);
      component.onDocumentClick();
      expect(component.isOpen()).toBeFalse();
    });

    it('no hace nada si el panel ya estaba cerrado', () => {
      component.isOpen.set(false);
      component.onDocumentClick();
      expect(component.isOpen()).toBeFalse();
    });
  });

  // ── onNotifClick() ──────────────────────────────────────────────

  describe('onNotifClick()', () => {
    const event = () => {
      const e = new MouseEvent('click');
      spyOn(e, 'stopPropagation');
      return e;
    };

    it('detiene la propagación del evento', () => {
      const e = event();
      const notif = makeNotif({ leida: true });
      component.onNotifClick(notif, e);
      expect(e.stopPropagation).toHaveBeenCalled();
    });

    it('llama a marcarLeida si la notificación no estaba leída', () => {
      spyOn(notifSvc, 'marcarLeida').and.returnValue(of(makeNotif({ leida: true })));
      const notif = makeNotif({ id: 'n1', leida: false });
      component.onNotifClick(notif, event());
      expect(notifSvc.marcarLeida).toHaveBeenCalledWith('n1');
    });

    it('NO llama a marcarLeida si la notificación ya estaba leída', () => {
      spyOn(notifSvc, 'marcarLeida');
      const notif = makeNotif({ leida: true });
      component.onNotifClick(notif, event());
      expect(notifSvc.marcarLeida).not.toHaveBeenCalled();
    });

    it('navega a accionUrl si existe y cierra el panel', () => {
      spyOn(router, 'navigateByUrl');
      const notif = makeNotif({ leida: true, accionUrl: '/home/listado/123/sesiones' });
      component.isOpen.set(true);
      component.onNotifClick(notif, event());
      expect(router.navigateByUrl).toHaveBeenCalledWith('/home/listado/123/sesiones');
      expect(component.isOpen()).toBeFalse();
    });

    it('no navega si la notificación no tiene accionUrl', () => {
      spyOn(router, 'navigateByUrl');
      const notif = makeNotif({ leida: true, accionUrl: undefined });
      component.onNotifClick(notif, event());
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  // ── onDescartar() ───────────────────────────────────────────────

  describe('onDescartar()', () => {
    it('llama a descartar con el ID correcto', () => {
      spyOn(notifSvc, 'descartar').and.returnValue(of({}));
      const e = new MouseEvent('click');
      component.onDescartar('notif-42', e);
      expect(notifSvc.descartar).toHaveBeenCalledWith('notif-42');
    });

    it('detiene la propagación del evento', () => {
      spyOn(notifSvc, 'descartar').and.returnValue(of({}));
      const e = new MouseEvent('click');
      spyOn(e, 'stopPropagation');
      component.onDescartar('n1', e);
      expect(e.stopPropagation).toHaveBeenCalled();
    });
  });

  // ── onMarcarTodas() ─────────────────────────────────────────────

  describe('onMarcarTodas()', () => {
    it('llama a marcarTodasLeidas', () => {
      spyOn(notifSvc, 'marcarTodasLeidas').and.returnValue(of({}));
      const e = new MouseEvent('click');
      component.onMarcarTodas(e);
      expect(notifSvc.marcarTodasLeidas).toHaveBeenCalled();
    });

    it('detiene la propagación del evento', () => {
      spyOn(notifSvc, 'marcarTodasLeidas').and.returnValue(of({}));
      const e = new MouseEvent('click');
      spyOn(e, 'stopPropagation');
      component.onMarcarTodas(e);
      expect(e.stopPropagation).toHaveBeenCalled();
    });
  });
});
