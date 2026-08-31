import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, computed, NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { AgendaComponent } from './agenda.component';
import { SesionesService } from '../../../services/sesiones.service';
import { SesionAccionesService } from '../../../services/sesiones-acciones.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { AuthService } from '../../../services/auth.service';
import { TrabajadorService } from '../../../services/trabajadores.service';
import { EventosAgendaService } from '../../../services/eventos-agenda.service';
import { FestivosService } from '../../../services/festivos.service';
import { VacacionesService } from '../../../services/vacaciones.service';
import { DashboardService } from '../../../services/dashboard.service';
import { RegistroDrawerService } from '../../../services/registro-drawer.service';
import { NuevaSesionModalService } from '../../../services/nueva-sesion-modal.service';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCalendarioDiario = () => ({
  fecha: '2026-03-10',
  fechaFormateada: '10 de marzo de 2026',
  diaSemana: 'martes',
  esHoy: false,
  totalSesiones: 2,
  sesiones: [
    {
      id: 'sesion-1',
      horaInicio: '09:00',
      horaFin: '10:00',
      duracion: 60,
      estado: 'PROGRAMADA',
      tipoSesion: 'PEDAGOGIA',
      cliente: { id: 'cliente-1', nombre: 'Ana', apellidos: 'García', nombreCompleto: 'Ana García' },
      notas: '',
      temporal: { esPasada: false, esActual: false, esFutura: true },
    },
  ],
  estadisticas: { completadas: 1, programadas: 1, canceladas: 0 },
});

/** Un día de la semana con las sesiones que se le indiquen. */
const diaCon = (
  fecha: string,
  horas: { horaInicio: string; horaFin: string }[],
  esHoy = false,
) => ({
  fecha,
  diaSemana: 'martes',
  dia: fecha.slice(-2),
  mes: 'marzo',
  esHoy,
  totalSesiones: horas.length,
  sesiones: horas.map((h, i) => ({
    id: `${fecha}-s${i}`,
    horaInicio: h.horaInicio,
    horaFin: h.horaFin,
    duracion: 60,
    estado: 'PROGRAMADA',
    tipoSesion: 'PEDAGOGIA',
    cliente: { id: 'c1', nombre: 'Ana', apellidos: 'García', nombreCompleto: 'Ana García' },
  })),
});

const mockCalendarioSemanal = (dias: any[] = []) => ({
  rangoSemana: {
    inicio: '2026-03-09',
    fin: '2026-03-15',
    inicioFormateado: '9 mar',
    finFormateado: '15 mar',
  },
  resumen: {
    totalSesiones: 10,
    completadas: 5,
    programadas: 4,
    canceladas: 1,
    clientesUnicos: 7,
  },
  dias,
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
  canVerTodo: () => false,
  isRecep: () => false,
  isAdmin: () => false,
});

const makeRouterMock = () => ({
  navigate: jasmine.createSpy('navigate'),
  navigateByUrl: jasmine.createSpy('navigateByUrl'),
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
    // La vista se persiste en localStorage: cada test parte de "semana".
    localStorage.removeItem('agenda.vista');

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
        { provide: TrabajadorService, useValue: {
          getTrabajadores: jasmine.createSpy().and.returnValue(of([])),
          trabajadores: signal([]),
        } },
        { provide: EventosAgendaService, useValue: {
          getEventosPeriodo: jasmine.createSpy().and.returnValue(of([])),
          getResumenHoras: jasmine.createSpy().and.returnValue(of({ totalMinutos: 0 })),
          create: jasmine.createSpy().and.returnValue(of({})),
          update: jasmine.createSpy().and.returnValue(of({})),
          delete: jasmine.createSpy().and.returnValue(of(void 0)),
        } },
        { provide: FestivosService, useValue: {
          getFestivosParaAgenda: jasmine.createSpy().and.returnValue(of([])),
        } },
        { provide: VacacionesService, useValue: {
          getMisVacaciones: jasmine.createSpy().and.returnValue(of([])),
          misVacaciones: signal([]),
        } },
        { provide: DashboardService, useValue: {
          getMiDia: jasmine.createSpy().and.returnValue(of(null)),
          miDia: signal(null),
        } },
        { provide: RegistroDrawerService, useValue: { openVacio: jasmine.createSpy() } },
        { provide: NuevaSesionModalService, useValue: { open: jasmine.createSpy() } },
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
      expect(component.calendarioDiario()?.fecha).toBe('2026-03-10');
    });

    it('actualiza el signal calendarioSemanal', () => {
      expect(component.calendarioSemanal()?.resumen.totalSesiones).toBe(10);
    });
  });

  // ── Computed ─────────────────────────────────────────────────────────────
  describe('computed signals', () => {
    it('totalSesiones refleja los datos del calendarioDiario', () => {
      expect(component.totalSesiones()).toBe(2);
    });

    it('semanaTitulo se forma con inicioFormateado y finFormateado', () => {
      expect(component.semanaTitulo()).toBe('9 mar – 15 mar');
    });

    it('sesiones mapea las sesiones del calendarioDiario a SesionData', () => {
      expect(component.sesiones()).toHaveSize(1);
      expect(component.sesiones()[0].id).toBe('sesion-1');
    });

    it('alertasUrgentes esta vacio cuando no hay notificaciones', () => {
      expect(component.alertasUrgentes()).toHaveSize(0);
    });

    it('alertasUrgentes recoge las notificaciones URGENTE y ALTA', () => {
      notifSvc._notificaciones.set([
        { id: 'n1', prioridad: 'URGENTE', leida: false, descartada: false },
        { id: 'n2', prioridad: 'ALTA', leida: false, descartada: false },
        { id: 'n3', prioridad: 'BAJA', leida: false, descartada: false },
      ]);
      expect(component.alertasUrgentes()).toHaveSize(2);
    });

    it('tituloRango usa el rango de la semana en vista semana', () => {
      expect(component.vista()).toBe('semana');
      expect(component.tituloRango()).toBe('9 mar – 15 mar');
    });

    it('tituloRango usa la fecha completa en vista dia', () => {
      component.setVista('dia');
      expect(component.tituloRango()).toBe(component.fechaFormateada());
    });
  });

  // ── Vista ────────────────────────────────────────────────────────────────
  describe('vista', () => {
    it('arranca en semana por defecto', () => {
      expect(component.vista()).toBe('semana');
    });

    it('setVista() persiste la eleccion en localStorage', () => {
      component.setVista('dia');
      expect(localStorage.getItem('agenda.vista')).toBe('dia');
    });

    it('columnas() devuelve los 7 dias en vista semana', () => {
      component.calendarioSemanal.set(mockCalendarioSemanal([
        diaCon('2026-03-09', []), diaCon('2026-03-10', []), diaCon('2026-03-11', []),
        diaCon('2026-03-12', []), diaCon('2026-03-13', []), diaCon('2026-03-14', []),
        diaCon('2026-03-15', []),
      ]) as any);
      expect(component.columnas()).toHaveSize(7);
    });

    it('columnas() devuelve solo el dia seleccionado en vista dia', () => {
      component.calendarioSemanal.set(mockCalendarioSemanal([
        diaCon('2026-03-09', []), diaCon('2026-03-10', []), diaCon('2026-03-11', []),
      ]) as any);
      component.irADia('2026-03-10');
      component.setVista('dia');
      expect(component.columnas()).toHaveSize(1);
      expect(component.columnas()[0].fecha).toBe('2026-03-10');
    });
  });

  // ── Navegación ───────────────────────────────────────────────────────────
  describe('navegación', () => {
    it('desplazar(-1) retrocede 7 dias en vista semana', () => {
      const inicial = component.fechaSeleccionada();
      component.desplazar(-1);
      const esperada = new Date(inicial);
      esperada.setDate(esperada.getDate() - 7);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
    });

    it('desplazar(1) avanza 7 dias en vista semana', () => {
      const inicial = component.fechaSeleccionada();
      component.desplazar(1);
      const esperada = new Date(inicial);
      esperada.setDate(esperada.getDate() + 7);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
    });

    it('desplazar(-1) retrocede solo 1 dia en vista dia', () => {
      component.setVista('dia');
      const inicial = component.fechaSeleccionada();
      component.desplazar(-1);
      const esperada = new Date(inicial);
      esperada.setDate(esperada.getDate() - 1);
      expect(component.fechaSeleccionada().toDateString()).toBe(esperada.toDateString());
    });

    it('desplazar() recarga dia y semana', () => {
      sesionesSvc.getCalendarioDiario.calls.reset();
      sesionesSvc.getCalendarioSemanal.calls.reset();
      component.desplazar(1);
      expect(sesionesSvc.getCalendarioDiario).toHaveBeenCalled();
      expect(sesionesSvc.getCalendarioSemanal).toHaveBeenCalled();
    });

    it('irAHoy() establece la fecha de hoy', () => {
      component.desplazar(-1);
      component.irAHoy();
      expect(component.esHoy()).toBe(true);
    });

    it('irADia() selecciona la fecha especificada', () => {
      component.irADia('2026-06-15');
      expect(component.fechaSeleccionada().getMonth()).toBe(5); // junio = mes 5
      expect(component.fechaSeleccionada().getDate()).toBe(15);
    });

    it('esDiaSeleccionado() devuelve true para la fecha actual', () => {
      expect(component.esDiaSeleccionado(component.fechaISO())).toBe(true);
    });

    it('esDiaSeleccionado() devuelve false para otro día', () => {
      expect(component.esDiaSeleccionado('2020-01-01')).toBe(false);
    });
  });

  // ── Acciones ─────────────────────────────────────────────────────────────
  describe('acciones sobre sesiones', () => {
    const mockSesion: any = {
      id: 'sesion-1',
      estado: 'PROGRAMADA',
      tipoSesion: 'PEDAGOGIA',
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

    it('verCliente() navega a la ficha del cliente', () => {
      component.verCliente('cliente-1', new MouseEvent('click'));
      expect(router.navigate).toHaveBeenCalledWith(['/home/listado', 'cliente-1', 'perfil']);
    });
  });

  // ── Rango horario adaptativo ─────────────────────────────────────────────
  describe('rangoHoras()', () => {
    const cargarSemana = (horas: { horaInicio: string; horaFin: string }[]) => {
      component.calendarioSemanal.set(
        mockCalendarioSemanal([diaCon('2026-03-10', horas)]) as any,
      );
      component.eventosAgenda.set([]);
    };

    it('sin actividad usa una jornada por defecto de 09:00 a 19:00', () => {
      component.calendarioSemanal.set(mockCalendarioSemanal([]) as any);
      component.eventosAgenda.set([]);
      expect(component.rangoHoras()).toEqual({ inicio: 9, fin: 19 });
      expect(component.horasCount()).toBe(10);
    });

    it('se ajusta a una jornada de mañana con una hora de respiro', () => {
      cargarSemana([
        { horaInicio: '09:00', horaFin: '10:00' },
        { horaInicio: '12:00', horaFin: '13:00' },
      ]);
      expect(component.rangoHoras()).toEqual({ inicio: 8, fin: 14 });
      expect(component.horasCount()).toBe(6);
    });

    it('se ajusta a una jornada de tarde: no pinta la mañana vacía', () => {
      cargarSemana([
        { horaInicio: '15:00', horaFin: '16:00' },
        { horaInicio: '19:00', horaFin: '20:00' },
      ]);
      expect(component.rangoHoras()).toEqual({ inicio: 14, fin: 21 });
    });

    it('respeta la ventana mínima de 6 h con una sola sesión', () => {
      cargarSemana([{ horaInicio: '10:00', horaFin: '11:00' }]);
      // 9–12 serían solo 3 h: la ventana se expande hasta 6.
      expect(component.horasCount()).toBeGreaterThanOrEqual(6);
      expect(component.rangoHoras().inicio).toBeLessThanOrEqual(9);
    });

    it('la ventana envuelve la actividad: nada queda recortado', () => {
      cargarSemana([
        { horaInicio: '07:30', horaFin: '08:30' },
        { horaInicio: '20:30', horaFin: '21:30' },
      ]);
      const { inicio, fin } = component.rangoHoras();
      expect(inicio).toBeLessThanOrEqual(7.5);
      expect(fin).toBeGreaterThanOrEqual(21.5);
      expect(component.calcularTopPct('07:30')).toBeGreaterThanOrEqual(0);
      expect(component.calcularTopPct('21:30')).toBeLessThanOrEqual(100);
    });
  });

  // ── Geometría en porcentajes ─────────────────────────────────────────────
  describe('helpers del grid semanal', () => {
    beforeEach(() => {
      // Rango conocido: 09:00–13:00 => inicio 8, fin 14, 6 horas.
      component.calendarioSemanal.set(
        mockCalendarioSemanal([
          diaCon('2026-03-10', [
            { horaInicio: '09:00', horaFin: '10:00' },
            { horaInicio: '12:00', horaFin: '13:00' },
          ]),
        ]) as any,
      );
      component.eventosAgenda.set([]);
    });

    it('calcularTopPct() devuelve 0 en el inicio del rango', () => {
      expect(component.calcularTopPct('08:00')).toBe(0);
    });

    it('calcularTopPct() sitúa una hora después a 1/6 del alto', () => {
      expect(component.calcularTopPct('09:00')).toBeCloseTo(100 / 6, 6);
    });

    it('calcularAlturaPct() da a 60 min una fracción de 1/6', () => {
      expect(component.calcularAlturaPct(60)).toBeCloseTo(100 / 6, 6);
    });

    it('calcularTopPct() queda siempre acotado entre 0 y 100', () => {
      expect(component.calcularTopPct('00:00')).toBe(0);
      expect(component.calcularTopPct('23:59')).toBe(100);
    });

    it('lineaPct() reparte las lineas horarias por el rango', () => {
      expect(component.lineaPct(0)).toBe(0);
      expect(component.lineaPct(6)).toBe(100);
    });

    it('horasGrid() cubre el rango de extremo a extremo', () => {
      expect(component.horasGrid()[0]).toBe('08:00');
      expect(component.horasGrid()[component.horasGrid().length - 1]).toBe('14:00');
    });

    it('getEventoBg() devuelve el color del tipo con transparencia', () => {
      const bg = component.getEventoBg('PEDAGOGIA');
      expect(bg).toContain('#2d4a3e');
      expect(bg).toContain('1a');
    });

    it('getTipoColor() devuelve color conocido para PEDAGOGIA', () => {
      expect(component.getTipoColor('PEDAGOGIA')).toBe('#2d4a3e');
    });

    it('getTipoColor() devuelve color fallback para tipo desconocido', () => {
      expect(component.getTipoColor('DESCONOCIDO')).toBe('#556d62');
    });

    it('getEstadoClass() mapea estados correctamente', () => {
      expect(component.getEstadoClass('PROGRAMADA')).toBe('programada');
      expect(component.getEstadoClass('COMPLETADA')).toBe('completada');
      expect(component.getEstadoClass('CANCELADA_CON_AVISO')).toBe('cancelada-aviso');
      expect(component.getEstadoClass('CANCELADA_SIN_AVISO')).toBe('cancelada-sin');
      expect(component.getEstadoClass('VACACIONES')).toBe('vacaciones');
      expect(component.getEstadoClass('OTRO')).toBe('default');
    });
  });

  // ── Tira de estadísticas ─────────────────────────────────────────────────
  describe('statsRango()', () => {
    it('en vista semana resume la semana', () => {
      const labels = component.statsRango().map((c) => c.label);
      expect(labels).toContain('clientes');
      expect(component.statsRango()[0].valor).toBe(10);
    });

    it('en vista dia resume el dia', () => {
      component.setVista('dia');
      expect(component.statsRango()[0].valor).toBe(2);
      expect(component.statsRango().map((c) => c.label)).not.toContain('clientes');
    });
  });

  // ── Menú «+ Nuevo» ───────────────────────────────────────────────────────
  describe('menú nuevo', () => {
    it('arranca cerrado y alterna al pulsar', () => {
      expect(component.menuNuevoAbierto()).toBe(false);
      component.toggleMenuNuevo(new MouseEvent('click'));
      expect(component.menuNuevoAbierto()).toBe(true);
    });

    it('un clic en el documento lo cierra', () => {
      component.toggleMenuNuevo(new MouseEvent('click'));
      component.cerrarMenuNuevo();
      expect(component.menuNuevoAbierto()).toBe(false);
    });
  });

  // ── Notificaciones ────────────────────────────────────────────────────────
  describe('descartarAlerta()', () => {
    it('llama a notifSvc.descartar con el id', () => {
      component.descartarAlerta('notif-1');
      expect(notifSvc.descartar).toHaveBeenCalledWith('notif-1');
    });
  });
});
