import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, computed } from '@angular/core';
import { of, Subject } from 'rxjs';
import { AgendaComponent } from './agenda.component';
import { SesionesService } from '../../../services/sesiones.service';
import { SesionAccionesService } from '../../../services/sesiones-acciones.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { AuthService } from '../../../services/auth.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCalendarioDiario = () => ({
  fecha: '2026-03-10',
  totalSesiones: 2,
  sesiones: [
    {
      id: 'sesion-1',
      horaInicio: '09:00',
      horaFin: '10:00',
      estado: 'PROGRAMADA',
      tipoSesion: 'PEDAGOGIA',
      cliente: { id: 'cliente-1', nombre: 'Ana', apellidos: 'García' },
      notas: '',
      temporal: false,
    },
  ],
  estadisticas: { completadas: 1, programadas: 1, canceladas: 0 },
});

const mockCalendarioSemanal = () => ({
  rangoSemana: { inicioFormateado: '10 mar', finFormateado: '16 mar' },
  resumen: { totalSesiones: 10, completadas: 5 },
  dias: [],
});

// ─── Mocks de servicio ────────────────────────────────────────────────────────

const makeSesionesMock = () => ({
  getCalendarioDiario: jasmine.createSpy('getCalendarioDiario').and.returnValue(of(mockCalendarioDiario())),
  getCalendarioSemanal: jasmine.createSpy('getCalendarioSemanal').and.returnValue(of(mockCalendarioSemanal())),
});

const makeAccionesMock = () => ({
  abrirCompletar: jasmine.createSpy('abrirCompletar'),
  abrirCancelar: jasmine.createSpy('abrirCancelar'),
  sesionACompletar: signal(null),
  sesionACancelar: signal(null),
  sesionAReprogramar: signal(null),
  sesionDetalle: signal(null),
  guardandoCompletar: signal(false),
  guardandoCancelacion: signal(false),
  guardandoReprogramacion: signal(false),
  guardandoModalidad: signal(false),
  toggleModalidadSesion: jasmine.createSpy('toggleModalidadSesion'),
  cambiarModalidad: jasmine.createSpy('cambiarModalidad'),
  abrirDetalle: jasmine.createSpy('abrirDetalle'),
  completarDesdeDetalle: jasmine.createSpy('completarDesdeDetalle'),
  reprogramarDesdeDetalle: jasmine.createSpy('reprogramarDesdeDetalle'),
  cancelarDesdeDetalle: jasmine.createSpy('cancelarDesdeDetalle'),
  cancelarConAviso: signal(true),
  cerrarCompletar: jasmine.createSpy(),
  cerrarCancelar: jasmine.createSpy(),
  cerrarReprogramar: jasmine.createSpy(),
  cerrarDetalle: jasmine.createSpy(),
  confirmarCompletar: jasmine.createSpy(),
  confirmarCancelacion: jasmine.createSpy(),
  confirmarReprogramacion: jasmine.createSpy(),
  nuevaFecha: signal(''),
  nuevaHoraInicio: signal(''),
  nuevaHoraFin: signal(''),
  getDuracion: jasmine.createSpy().and.returnValue(60),
});

const makeNotifMock = () => {
  const _notifs = signal<any[]>([]);
  return {
    _notificaciones: _notifs,
    noLeidas: computed(() => _notifs().filter((n) => !n.leida && !n.descartada)),
    descartar: jasmine.createSpy('descartar').and.returnValue(of({})),
  };
};

const makeAuthMock = () => ({
  currentTrabajadorId: signal('trabajador-1'),
});

const makeRouterMock = () => ({
  navigate: jasmine.createSpy('navigate'),
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('AgendaComponent', () => {
  let component: AgendaComponent;
  let fixture: ComponentFixture<AgendaComponent>;
  let sesionesSvc: ReturnType<typeof makeSesionesMock>;
  let accionesSvc: ReturnType<typeof makeAccionesMock>;
  let notifSvc: ReturnType<typeof makeNotifMock>;
  let router: ReturnType<typeof makeRouterMock>;

  beforeEach(async () => {
    sesionesSvc = makeSesionesMock();
    accionesSvc = makeAccionesMock();
    notifSvc = makeNotifMock();
    router = makeRouterMock();

    await TestBed.configureTestingModule({
      imports: [AgendaComponent],
      providers: [
        { provide: SesionesService, useValue: sesionesSvc },
        { provide: SesionAccionesService, useValue: accionesSvc },
        { provide: NotificacionesService, useValue: notifSvc },
        { provide: AuthService, useValue: makeAuthMock() },
        { provide: Router, useValue: router },
      ],
    })
      .overrideComponent(AgendaComponent, { set: { schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(AgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ── Inicialización ───────────────────────────────────────────────────────
  describe('ngOnInit()', () => {
    it('carga el calendario diario al iniciar', () => {
      expect(sesionesSvc.getCalendarioDiario).toHaveBeenCalledTimes(1);
    });

    it('carga el calendario semanal al iniciar', () => {
      expect(sesionesSvc.getCalendarioSemanal).toHaveBeenCalledTimes(1);
    });

    it('actualiza el signal calendarioDiario con los datos recibidos', () => {
      expect(component.calendarioDiario()).not.toBeNull();
      expect(component.calendarioDiario()?.totalSesiones).toBe(2);
    });

    it('actualiza el signal calendarioSemanal', () => {
      expect(component.calendarioSemanal()).not.toBeNull();
    });
  });

  // ── Computed signals ─────────────────────────────────────────────────────
  describe('computed signals', () => {
    it('totalSesiones refleja los datos del calendarioDiario', () => {
      expect(component.totalSesiones()).toBe(2);
    });

    it('semanaTitulo se forma con inicioFormateado y finFormateado', () => {
      expect(component.semanaTitulo()).toBe('10 mar – 16 mar');
    });

    it('sesiones mapea las sesiones del calendarioDiario a SesionData', () => {
      expect(component.sesiones()).toHaveSize(1);
      expect(component.sesiones()[0].id).toBe('sesion-1');
    });

    it('hayAlertas es false cuando no hay notificaciones urgentes', () => {
      expect(component.hayAlertas()).toBe(false);
    });

    it('hayAlertas es true cuando hay notificaciones URGENTE', () => {
      notifSvc._notificaciones.set([
        { id: 'n1', prioridad: 'URGENTE', leida: false, descartada: false },
      ]);
      expect(component.hayAlertas()).toBe(true);
    });
  });

  // ── Navegación por día ───────────────────────────────────────────────────
  describe('navegación', () => {
    it('diaAnterior() retrocede un día y recarga', () => {
      const fechaInicial = component.fechaSeleccionada();
      sesionesSvc.getCalendarioDiario.calls.reset();
      component.diaAnterior();
      const esperada = new Date(fechaInicial);
      esperada.setDate(esperada.getDate() - 1);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
      expect(sesionesSvc.getCalendarioDiario).toHaveBeenCalled();
    });

    it('diaSiguiente() avanza un día y recarga', () => {
      const fechaInicial = component.fechaSeleccionada();
      component.diaSiguiente();
      const esperada = new Date(fechaInicial);
      esperada.setDate(esperada.getDate() + 1);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
    });

    it('irAHoy() establece la fecha de hoy', () => {
      component.diaAnterior();
      component.irAHoy();
      expect(component.esHoy()).toBe(true);
    });

    it('semanaAnterior() retrocede 7 días', () => {
      const fechaInicial = component.fechaSeleccionada();
      component.semanaAnterior();
      const esperada = new Date(fechaInicial);
      esperada.setDate(esperada.getDate() - 7);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
    });

    it('semanaSiguiente() avanza 7 días', () => {
      const fechaInicial = component.fechaSeleccionada();
      component.semanaSiguiente();
      const esperada = new Date(fechaInicial);
      esperada.setDate(esperada.getDate() + 7);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
    });

    it('irADia() selecciona la fecha especificada', () => {
      component.irADia('2026-06-15');
      expect(component.fechaSeleccionada().getMonth()).toBe(5); // junio = mes 5
      expect(component.fechaSeleccionada().getDate()).toBe(15);
    });

    it('esDiaSeleccionado() devuelve true para la fecha actual', () => {
      const iso = component.fechaISO();
      expect(component.esDiaSeleccionado(iso)).toBe(true);
    });

    it('esDiaSeleccionado() devuelve false para otro día', () => {
      expect(component.esDiaSeleccionado('2020-01-01')).toBe(false);
    });
  });

  // ── Acciones ─────────────────────────────────────────────────────────────
  describe('acciones sobre sesiones', () => {
    const mockSesion: any = {
      id: 'sesion-1',
      estado: 'PROGRAMADA' as any,
      tipoSesion: 'PEDAGOGIA' as any,
      fechaHoraInicio: '2026-03-10T09:00:00.000Z',
      fechaHoraFin: '2026-03-10T10:00:00.000Z',
      clienteId: 'cliente-1',
      cliente: { id: 'cliente-1', nombre: 'Ana', apellidos: 'García' },
    };

    it('abrirCompletar() delega en accionesSvc', () => {
      const event = new MouseEvent('click');
      component.abrirCompletar(mockSesion, event);
      expect(accionesSvc.abrirCompletar).toHaveBeenCalledWith(
        mockSesion, event, jasmine.any(Function),
      );
    });

    it('abrirCancelar() delega en accionesSvc', () => {
      const event = new MouseEvent('click');
      component.abrirCancelar(mockSesion, event);
      expect(accionesSvc.abrirCancelar).toHaveBeenCalledWith(
        mockSesion, event, jasmine.any(Function),
      );
    });

    it('verCliente() navega a la ruta del cliente', () => {
      const event = new MouseEvent('click');
      component.verCliente('cliente-1', event);
      expect(router.navigate).toHaveBeenCalledWith(['/home/listado', 'cliente-1', 'cliente']);
    });
  });

  // ── Helpers de grid ───────────────────────────────────────────────────────
  describe('helpers del grid semanal', () => {
    it('calcularTop() devuelve 0 para la hora de inicio del grid (08:00)', () => {
      expect(component.calcularTop('08:00')).toBe(0);
    });

    it('calcularTop() devuelve 64px para 09:00 (1 hora después del inicio)', () => {
      expect(component.calcularTop('09:00')).toBe(64);
    });

    it('calcularAltura() calcula altura proporcional (60 min = 64px)', () => {
      expect(component.calcularAltura(60)).toBe(64);
    });

    it('calcularAltura() devuelve mínimo 18px para duraciones muy cortas', () => {
      expect(component.calcularAltura(5)).toBe(18);
    });

    it('getEventoBg() devuelve el color del tipo con transparencia', () => {
      const bg = component.getEventoBg('PEDAGOGIA');
      expect(bg).toContain('#7c6fd6');
      expect(bg).toContain('1a');
    });

    it('getTipoColor() devuelve color conocido para PEDAGOGIA', () => {
      expect(component.getTipoColor('PEDAGOGIA')).toBe('#7c6fd6');
    });

    it('getTipoColor() devuelve color fallback para tipo desconocido', () => {
      expect(component.getTipoColor('DESCONOCIDO')).toBe('#9ca3af');
    });

    it('getEstadoClass() mapea estados correctamente', () => {
      expect(component.getEstadoClass('PROGRAMADA')).toBe('programada');
      expect(component.getEstadoClass('COMPLETADA')).toBe('completada');
      expect(component.getEstadoClass('CANCELADA_CON_AVISO')).toBe('cancelada-aviso');
      expect(component.getEstadoClass('CANCELADA_SIN_AVISO')).toBe('cancelada-sin');
      expect(component.getEstadoClass('OTRO')).toBe('default');
    });
  });

  // ── Notificaciones ────────────────────────────────────────────────────────
  describe('descartarAlerta()', () => {
    it('llama a notifSvc.descartar con el id', () => {
      component.descartarAlerta('notif-1');
      expect(notifSvc.descartar).toHaveBeenCalledWith('notif-1');
    });
  });

  // ── Banner ────────────────────────────────────────────────────────────────
  describe('bannerColapsado', () => {
    it('bannerColapsado inicia en false', () => {
      expect(component.bannerColapsado()).toBe(false);
    });
  });
});
