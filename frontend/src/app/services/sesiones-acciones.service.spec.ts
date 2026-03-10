import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SesionAccionesService } from './sesiones-acciones.service';
import { SesionesService } from './sesiones.service';

const mockSesion = (overrides: Record<string, any> = {}) => ({
  id: 'sesion-1',
  clienteId: 'cliente-1',
  tipo: 'PEDAGOGIA',
  estado: 'PROGRAMADA',
  fechaHoraInicio: '2026-03-10T09:00:00.000Z',
  fechaHoraFin: '2026-03-10T10:00:00.000Z',
  ...overrides,
});

const makeSesionesMock = () => ({
  completarSesion: jasmine.createSpy('completarSesion').and.returnValue(of({})),
  cancelarSesion: jasmine.createSpy('cancelarSesion').and.returnValue(of({})),
  updateSesion: jasmine.createSpy('updateSesion').and.returnValue(of({})),
});

describe('SesionAccionesService', () => {
  let service: SesionAccionesService;
  let sesionesSvc: ReturnType<typeof makeSesionesMock>;

  beforeEach(() => {
    sesionesSvc = makeSesionesMock();
    TestBed.configureTestingModule({
      providers: [
        SesionAccionesService,
        { provide: SesionesService, useValue: sesionesSvc },
      ],
    });
    service = TestBed.inject(SesionAccionesService);
  });

  // ── Completar ─────────────────────────────────────────────────────────────
  describe('flujo completar', () => {
    it('abrirCompletar establece sesionACompletar', () => {
      const sesion = mockSesion();
      service.abrirCompletar(sesion as any);
      expect(service.sesionACompletar()).toEqual(sesion as any);
    });

    it('cerrarCompletar limpia sesionACompletar', () => {
      service.sesionACompletar.set(mockSesion() as any);
      service.cerrarCompletar();
      expect(service.sesionACompletar()).toBeNull();
    });

    it('confirmarCompletar llama a sesionesSvc.completarSesion', () => {
      service.sesionACompletar.set(mockSesion() as any);
      service.confirmarCompletar();
      expect(sesionesSvc.completarSesion).toHaveBeenCalledWith('sesion-1', {});
    });

    it('confirmarCompletar limpia sesionACompletar al completar', () => {
      service.sesionACompletar.set(mockSesion() as any);
      service.confirmarCompletar();
      expect(service.sesionACompletar()).toBeNull();
      expect(service.guardandoCompletar()).toBe(false);
    });

    it('confirmarCompletar ejecuta el callback onCompletada', () => {
      const callback = jasmine.createSpy('onCompletada');
      service.abrirCompletar(mockSesion() as any, undefined, callback);
      service.confirmarCompletar();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('no hace nada si sesionACompletar es null', () => {
      service.confirmarCompletar();
      expect(sesionesSvc.completarSesion).not.toHaveBeenCalled();
    });

    it('desactiva guardandoCompletar en error', () => {
      sesionesSvc.completarSesion.and.returnValue(throwError(() => new Error('fail')));
      service.sesionACompletar.set(mockSesion() as any);
      service.confirmarCompletar();
      expect(service.guardandoCompletar()).toBe(false);
    });
  });

  // ── Cancelar ──────────────────────────────────────────────────────────────
  describe('flujo cancelar', () => {
    it('abrirCancelar establece sesionACancelar y cancelarConAviso=true', () => {
      service.cancelarConAviso.set(false);
      service.abrirCancelar(mockSesion() as any);
      expect(service.sesionACancelar()).not.toBeNull();
      expect(service.cancelarConAviso()).toBe(true);
    });

    it('cerrarCancelar limpia sesionACancelar', () => {
      service.sesionACancelar.set(mockSesion() as any);
      service.cerrarCancelar();
      expect(service.sesionACancelar()).toBeNull();
    });

    it('confirmarCancelacion llama a sesionesSvc.cancelarSesion con aviso=true', () => {
      service.sesionACancelar.set(mockSesion() as any);
      service.cancelarConAviso.set(true);
      service.confirmarCancelacion();
      expect(sesionesSvc.cancelarSesion).toHaveBeenCalledWith('sesion-1', true);
    });

    it('confirmarCancelacion pasa aviso=false cuando se indica', () => {
      service.sesionACancelar.set(mockSesion() as any);
      service.cancelarConAviso.set(false);
      service.confirmarCancelacion();
      expect(sesionesSvc.cancelarSesion).toHaveBeenCalledWith('sesion-1', false);
    });
  });

  // ── Reprogramar ───────────────────────────────────────────────────────────
  describe('flujo reprogramar', () => {
    it('abrirReprogramar precarga fecha y horas de la sesión', () => {
      service.abrirReprogramar(mockSesion() as any);
      expect(service.nuevaFecha()).toBe('2026-03-10');
      expect(service.nuevaHoraInicio()).toBe('09:00');
      expect(service.nuevaHoraFin()).toBe('10:00');
    });

    it('cerrarReprogramar limpia todos los signals de fecha', () => {
      service.sesionAReprogramar.set(mockSesion() as any);
      service.nuevaFecha.set('2026-03-10');
      service.cerrarReprogramar();
      expect(service.sesionAReprogramar()).toBeNull();
      expect(service.nuevaFecha()).toBe('');
    });

    it('confirmarReprogramacion llama a updateSesion con las fechas correctas', () => {
      service.sesionAReprogramar.set(mockSesion() as any);
      service.nuevaFecha.set('2026-03-15');
      service.nuevaHoraInicio.set('10:00');
      service.nuevaHoraFin.set('11:00');
      service.confirmarReprogramacion();
      expect(sesionesSvc.updateSesion).toHaveBeenCalledWith(
        'sesion-1',
        jasmine.objectContaining({
          fechaHoraInicio: jasmine.any(String),
          fechaHoraFin: jasmine.any(String),
        }),
      );
    });

    it('no reprograma si hora fin <= hora inicio', () => {
      spyOn(window, 'alert');
      service.sesionAReprogramar.set(mockSesion() as any);
      service.nuevaFecha.set('2026-03-15');
      service.nuevaHoraInicio.set('11:00');
      service.nuevaHoraFin.set('10:00');
      service.confirmarReprogramacion();
      expect(sesionesSvc.updateSesion).not.toHaveBeenCalled();
    });

    it('no hace nada si faltan datos de fecha', () => {
      service.sesionAReprogramar.set(mockSesion() as any);
      service.nuevaFecha.set('');
      service.confirmarReprogramacion();
      expect(sesionesSvc.updateSesion).not.toHaveBeenCalled();
    });
  });

  // ── Detalle ───────────────────────────────────────────────────────────────
  describe('flujo detalle', () => {
    it('abrirDetalle establece sesionDetalle', () => {
      service.abrirDetalle(mockSesion() as any);
      expect(service.sesionDetalle()?.id).toBe('sesion-1');
    });

    it('cerrarDetalle limpia sesionDetalle', () => {
      service.sesionDetalle.set(mockSesion() as any);
      service.cerrarDetalle();
      expect(service.sesionDetalle()).toBeNull();
    });

    it('completarDesdeDetalle cierra detalle y abre completar', () => {
      service.sesionDetalle.set(mockSesion() as any);
      service.completarDesdeDetalle();
      expect(service.sesionDetalle()).toBeNull();
      expect(service.sesionACompletar()).not.toBeNull();
    });

    it('cancelarDesdeDetalle cierra detalle y abre cancelar', () => {
      service.sesionDetalle.set(mockSesion() as any);
      service.cancelarDesdeDetalle();
      expect(service.sesionDetalle()).toBeNull();
      expect(service.sesionACancelar()).not.toBeNull();
    });

    it('reprogramarDesdeDetalle cierra detalle y abre reprogramar', () => {
      service.sesionDetalle.set(mockSesion() as any);
      service.reprogramarDesdeDetalle();
      expect(service.sesionDetalle()).toBeNull();
      expect(service.sesionAReprogramar()).not.toBeNull();
    });
  });

  // ── getDuracion ───────────────────────────────────────────────────────────
  describe('getDuracion()', () => {
    it('calcula la duración en minutos', () => {
      const duracion = service.getDuracion(
        '2026-03-10T09:00:00.000Z',
        '2026-03-10T10:30:00.000Z',
      );
      expect(duracion).toBe(90);
    });
  });
});
