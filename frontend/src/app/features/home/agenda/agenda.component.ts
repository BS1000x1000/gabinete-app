import {
  Component,
  computed,
  inject,
  signal,
  viewChild,
  ElementRef,
  HostListener,
  type OnInit,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { startOfWeek } from 'date-fns';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import {
  EstadoSesion,
  TipoSesion,
  SesionData,
  TIPO_SESION_LABELS,
  ESTADO_SESION_LABELS,
} from '../../../interface/sesion.interface';
import { SesionesService } from '../../../services/sesiones.service';
import { SesionAccionesService } from '../../../services/sesiones-acciones.service';
import { NotificacionesService } from '../../../services/notificaciones.service';
import { TrabajadorService, Trabajador } from '../../../services/trabajadores.service';
import {
  CalendarioDiario,
  CalendarioSemanal,
  DiaSemana,
} from '../../../interface/calendario.interface';
import { SesionModalesComponent } from '../../../components/sesiones-modales/sesiones-modales.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { isoToHHMM, formatMinutosHoras } from '../../../shared/utils/date';
import { abrirEnlaceExterno } from '../../../shared/utils/url.utils';
import { EventosAgendaService } from '../../../services/eventos-agenda.service';
import {
  EventoAgenda,
  ModalidadEvento,
  ResumenHoras,
  TIPO_EVENTO_CONFIG,
  CreateEventoDto,
  TipoEvento,
} from '../../../interface/evento-agenda.interface';
import { FestivosService } from '../../../services/festivos.service';
import { Festivo } from '../../../interface/festivo.interface';
import { DashboardService } from '../../../services/dashboard.service';
import { RegistroDrawerService } from '../../../services/registro-drawer.service';
import { NuevaSesionModalService } from '../../../services/nueva-sesion-modal.service';
import { VacacionesService } from '../../../services/vacaciones.service';

const TIPO_COLORES: Record<string, string> = {
  PEDAGOGIA: '#7c6fd6',
  NEUROPSICOLOGIA: '#3b82f6',
  LOGOPEDIA: '#10b981',
  TERAPIA_OCUPACIONAL: '#ef4444',
  EVALUACION: '#f59e0b',
  REUNION_COLEGIO: '#6b7280',
};

export type VistaAgenda = 'dia' | 'semana';

const VISTA_STORAGE_KEY = 'agenda.vista';

/** Chip de la tira de estadisticas de la barra superior. */
export interface StatChip {
  valor: number;
  label: string;
  tono: 'base' | 'success' | 'primary' | 'danger';
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, SesionModalesComponent, ConfirmModalComponent],
  templateUrl: './agenda.component.html',
})
export class AgendaComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private sesionesSvc = inject(SesionesService);
  private accionesSvc = inject(SesionAccionesService);
  private notifSvc = inject(NotificacionesService);
  private trabajadorSvc = inject(TrabajadorService);
  private eventosSvc = inject(EventosAgendaService);
  private festivosSvc = inject(FestivosService);
  private vacacionesSvc = inject(VacacionesService);
  private dashboardSvc = inject(DashboardService);
  private registroDrawerSvc = inject(RegistroDrawerService);
  private nuevaSesionSvc = inject(NuevaSesionModalService);
  private destroyRef = inject(DestroyRef);

  readonly TIPO_SESION_LABELS: any = TIPO_SESION_LABELS;
  readonly ESTADO_SESION_LABELS: any = ESTADO_SESION_LABELS;
  readonly EstadoSesion = EstadoSesion;

  // ── Vista: dia o semana ─────────────────────────────────────
  // Es la unica preferencia de la pantalla; se recuerda entre sesiones igual
  // que los filtros del listado (Hito C).
  readonly vista = signal<VistaAgenda>(this.leerVistaGuardada());

  private leerVistaGuardada(): VistaAgenda {
    try {
      return localStorage.getItem(VISTA_STORAGE_KEY) === 'dia' ? 'dia' : 'semana';
    } catch {
      return 'semana';
    }
  }

  setVista(v: VistaAgenda): void {
    if (this.vista() === v) return;
    this.vista.set(v);
    try {
      localStorage.setItem(VISTA_STORAGE_KEY, v);
    } catch {
      // Modo privado: la vista simplemente no se recuerda.
    }
  }

  // Selector de terapeuta (solo para ADMIN/RECEP)
  readonly canVerTodo = computed(() => this.auth.canVerTodo());
  readonly trabajadores = signal<Trabajador[]>([]);
  readonly trabajadorSeleccionado = signal<Trabajador | null>(null);

  readonly trabajadorIdParam = computed(() => this.trabajadorSeleccionado()?.id);

  seleccionarTerapeuta(t: Trabajador | null): void {
    this.trabajadorSeleccionado.set(t);
    this.loadDia();
    this.loadSemana();
  }

  /** Entrada desde el select de la barra: cadena vacia significa "todos". */
  onCambiarTerapeuta(id: string): void {
    this.seleccionarTerapeuta(this.trabajadores().find((t) => t.id === id) ?? null);
  }

  getTrabajadorIniciales(t: Trabajador): string {
    return `${t.nombre.charAt(0)}${t.apellidos.charAt(0)}`.toUpperCase();
  }

  // Estado principal
  calendarioDiario = signal<CalendarioDiario | null>(null);
  calendarioSemanal = signal<CalendarioSemanal | null>(null);
  isLoadingDia = signal(false);
  isLoadingSemana = signal(false);
  fechaSeleccionada = signal<Date>(new Date());

  /** Menu desplegable "+ Nuevo" de la barra superior. */
  menuNuevoAbierto = signal(false);

  // Festivos y vacaciones en agenda
  private festivosAgenda = signal<Festivo[]>([]);
  private festivosAnioCargado = signal<number | null>(null);

  readonly festivosPorFecha = computed(() => {
    const map = new Map<string, Festivo>();
    for (const f of this.festivosAgenda()) {
      map.set(f.fecha.split('T')[0], f);
    }
    return map;
  });

  readonly mostrarVacaciones = computed(() => {
    if (this.auth.isRecep()) return false;
    const sel = this.trabajadorSeleccionado();
    return sel === null || sel.id === this.auth.currentTrabajadorId();
  });

  esDiaVacaciones(fechaISO: string): boolean {
    return this.vacacionesSvc.misVacaciones().some(v => {
      const inicio = this.isoToLocalDateStr(v.fechaInicio);
      const fin = this.isoToLocalDateStr(v.fechaFin);
      return fechaISO >= inicio && fechaISO <= fin;
    });
  }

  private isoToLocalDateStr(iso: string): string {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private cargarFestivosAnio(anio: number): void {
    if (this.festivosAnioCargado() === anio) return;
    this.festivosSvc.getFestivosParaAgenda(anio)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(festivos => {
        this.festivosAgenda.set(festivos);
        this.festivosAnioCargado.set(anio);
      });
  }

  // Eventos de agenda
  readonly TIPO_EVENTO_CONFIG = TIPO_EVENTO_CONFIG;
  readonly tiposEvento: TipoEvento[] = [
    'COORDINACION_EQUIPO',
    'COORDINACION_COLEGIO',
    'COORDINACION_PROFESIONAL',
    'TIEMPO_ADMINISTRACION',
    'FORMACION',
    'OTRO',
  ];
  eventosAgenda = signal<EventoAgenda[]>([]);
  resumenHoras = signal<ResumenHoras | null>(null);
  mostrarModalEvento = signal(false);
  eventoEditando = signal<EventoAgenda | null>(null);
  modalEventoActual = signal<EventoAgenda | null>(null);
  eventoAEliminar = signal<EventoAgenda | null>(null);

  // Modal evento — form state
  modalEventoForm = signal<{
    titulo: string;
    tipo: TipoEvento;
    modalidad: ModalidadEvento;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    descripcion: string;
    participantesIds: string[];
    horarioAdminId: string | null;
  }>({
    titulo: '',
    tipo: 'OTRO',
    modalidad: 'PRESENCIAL',
    fecha: '',
    horaInicio: '09:00',
    horaFin: '10:00',
    descripcion: '',
    participantesIds: [],
    horarioAdminId: null,
  });
  modalEventoGuardando = signal(false);

  readonly canAddParticipantes = computed(() => this.auth.isAdmin());

  readonly eventosPorFecha = computed(() => {
    const map = new Map<string, EventoAgenda[]>();
    for (const ev of this.eventosAgenda()) {
      const fecha = ev.fechaHoraInicio.split('T')[0];
      if (!map.has(fecha)) map.set(fecha, []);
      map.get(fecha)!.push(ev);
    }
    return map;
  });

  readonly eventosDelDia = computed(() => {
    const fechaISO = this.fechaISO();
    return this.eventosAgenda().filter(ev => ev.fechaHoraInicio.startsWith(fechaISO));
  });

  readonly todoDelDia = computed(() => {
    const sItems = this.sesiones().map(s => ({ kind: 'sesion' as const, id: s.id, sortKey: s.horaInicio, sesion: s }));
    const eItems = this.eventosDelDia().map(e => ({ kind: 'evento' as const, id: e.id, sortKey: isoToHHMM(e.fechaHoraInicio), evento: e }));
    return [...sItems, ...eItems].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  });

  // Alertas urgentes. Viven en el rail, no en un banner que empuja el contenido:
  // la campana del header ya las lista agrupadas por prioridad.
  readonly alertasUrgentes = computed(() =>
    this.notifSvc
      .noLeidas()
      .filter((n) => n.prioridad === 'URGENTE' || n.prioridad === 'ALTA'),
  );

  // ── Pendientes (rescatado del dashboard huerfano) ───────────
  // Tareas que no son urgentes -de eso ya avisan las alertas- pero que conviene
  // no perder de vista: informes a medio escribir y objetivos sin evaluar.
  private readonly miDia = this.dashboardSvc.miDia;

  readonly informesEnBorrador = computed(
    () => this.miDia()?.accionesPendientes?.informesEnBorrador ?? [],
  );
  readonly objetivosSinEvaluar = computed(
    () => this.miDia()?.accionesPendientes?.objetivosSinEvaluar ?? [],
  );
  readonly totalPendientes = computed(
    () => this.informesEnBorrador().length + this.objetivosSinEvaluar().length,
  );
  readonly hayPendientes = computed(() => this.totalPendientes() > 0);

  readonly isRecep = this.auth.isRecep;

  irAlInforme(informe: { cliente: { id: string } }): void {
    this.router.navigate(['/home/listado', informe.cliente.id, 'documentacion']);
  }

  irAlObjetivo(obj: { cliente: { id: string } }): void {
    this.router.navigate(['/home/listado', obj.cliente.id, 'progreso']);
  }

  irANotificacion(alerta: { accionUrl?: string | null }): void {
    if (alerta.accionUrl) this.router.navigateByUrl(alerta.accionUrl);
  }

  // ── Accesos rapidos (menu "+ Nuevo" de la barra) ────────────

  toggleMenuNuevo(event: Event): void {
    event.stopPropagation();
    this.menuNuevoAbierto.update((v) => !v);
  }

  @HostListener('document:click')
  cerrarMenuNuevo(): void {
    if (this.menuNuevoAbierto()) this.menuNuevoAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuNuevoAbierto.set(false);
  }

  abrirRegistro(): void {
    this.menuNuevoAbierto.set(false);
    this.registroDrawerSvc.openVacio();
  }

  abrirNuevaSesion(): void {
    this.menuNuevoAbierto.set(false);
    this.nuevaSesionSvc.open();
  }

  irANuevoCliente(): void {
    this.menuNuevoAbierto.set(false);
    this.router.navigate(['/home/clientes'], { queryParams: { nuevo: true } });
  }

  // Sesiones del dia mapeadas para las acciones
  readonly sesiones = computed(() => {
    const cal = this.calendarioDiario();
    if (!cal) return [];
    return cal.sesiones.map((s) => ({
      id: s.id,
      horaInicio: s.horaInicio,
      horaFin: s.horaFin,
      fechaHoraInicio: this.parseHoraToDate(
        cal.fecha,
        s.horaInicio,
      ).toISOString(),
      fechaHoraFin: this.parseHoraToDate(cal.fecha, s.horaFin).toISOString(),
      estado: s.estado as EstadoSesion,
      tipoSesion: s.tipoSesion as TipoSesion,
      modalidad: s.modalidad,
      cliente: s.cliente,
      clienteId: s.cliente.id,
      trabajadorId: this.auth.currentTrabajadorId() ?? '',
      urlVideollamada: s.urlVideollamada,
      notas: s.notas,
      temporal: s.temporal,
    }));
  });

  // Stats del dia
  readonly totalSesiones = computed(
    () => this.calendarioDiario()?.totalSesiones ?? 0,
  );
  readonly sesionesCompletadas = computed(
    () => this.calendarioDiario()?.estadisticas.completadas ?? 0,
  );
  readonly sesionesProgramadas = computed(
    () => this.calendarioDiario()?.estadisticas.programadas ?? 0,
  );
  readonly sesionesCanceladas = computed(
    () => this.calendarioDiario()?.estadisticas.canceladas ?? 0,
  );

  /** Tira unica de estadisticas: refleja el rango que se esta viendo. */
  readonly statsRango = computed<StatChip[]>(() => {
    if (this.vista() === 'dia') {
      if (this.totalSesiones() === 0) return [];
      const chips: StatChip[] = [
        { valor: this.totalSesiones(), label: 'sesiones', tono: 'base' },
        { valor: this.sesionesCompletadas(), label: 'completadas', tono: 'success' },
        { valor: this.sesionesProgramadas(), label: 'programadas', tono: 'primary' },
      ];
      if (this.sesionesCanceladas() > 0) {
        chips.push({ valor: this.sesionesCanceladas(), label: 'canceladas', tono: 'danger' });
      }
      return chips;
    }
    const r = this.resumenSemana();
    if (!r) return [];
    return [
      { valor: r.totalSesiones, label: 'sesiones', tono: 'base' },
      { valor: r.completadas, label: 'completadas', tono: 'success' },
      { valor: r.programadas, label: 'programadas', tono: 'primary' },
      { valor: r.clientesUnicos, label: 'clientes', tono: 'base' },
    ];
  });

  // Fecha formateada
  readonly fechaFormateada = computed(() =>
    this.fechaSeleccionada().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  );

  /** Cabecera compacta del rail. */
  readonly fechaCorta = computed(() =>
    this.fechaSeleccionada().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
  );

  readonly esHoy = computed(() => {
    const hoy = new Date();
    return hoy.toDateString() === this.fechaSeleccionada().toDateString();
  });
  readonly fechaISO = computed(() => this.formatISO(this.fechaSeleccionada()));

  // Semana
  readonly diasSemana = computed(() => this.calendarioSemanal()?.dias ?? []);
  readonly semanaTitulo = computed(() => {
    const cal = this.calendarioSemanal();
    return cal
      ? `${cal.rangoSemana.inicioFormateado} – ${cal.rangoSemana.finFormateado}`
      : '';
  });
  readonly resumenSemana = computed(() => this.calendarioSemanal()?.resumen);

  /** Titulo del rango en la barra: un solo control para las dos vistas. */
  readonly tituloRango = computed(() =>
    this.vista() === 'semana' ? this.semanaTitulo() : this.fechaFormateada(),
  );

  readonly isLoading = computed(() => this.isLoadingDia() || this.isLoadingSemana());

  // ── Rejilla ──────────────────────────────────────────────────
  // Las columnas son los 7 dias de la semana o solo el seleccionado.
  readonly columnas = computed<DiaSemana[]>(() => {
    const dias = this.diasSemana();
    if (this.vista() === 'semana') return dias;
    const sel = this.fechaISO();
    return dias.filter((d) => d.fecha === sel);
  });

  /**
   * Ventana horaria minima. Sin ella una semana floja dejaria una rejilla de
   * dos horas que "baila" al cambiar de semana.
   */
  private readonly VENTANA_MINIMA_H = 6;

  /**
   * Horas a pintar, deducidas de la actividad ya cargada. Los limites son solo
   * del relleno (una hora de respiro arriba y abajo), nunca de los datos: la
   * ventana envuelve siempre toda la actividad, asi que ninguna sesion puede
   * quedar recortada.
   */
  readonly rangoHoras = computed<{ inicio: number; fin: number }>(() => {
    const marcas: number[] = [];
    const push = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      if (!Number.isNaN(h)) marcas.push(h + (m || 0) / 60);
    };

    for (const dia of this.diasSemana()) {
      for (const s of dia.sesiones) {
        push(s.horaInicio);
        push(s.horaFin);
      }
    }
    for (const ev of this.eventosAgenda()) {
      push(isoToHHMM(ev.fechaHoraInicio));
      push(isoToHHMM(ev.fechaHoraFin));
    }

    if (marcas.length === 0) return { inicio: 9, fin: 19 };

    let inicio = Math.max(0, Math.floor(Math.min(...marcas)) - 1);
    let fin = Math.min(24, Math.ceil(Math.max(...marcas)) + 1);

    while (fin - inicio < this.VENTANA_MINIMA_H && (fin < 24 || inicio > 0)) {
      if (fin < 24) fin++;
      else inicio--;
    }
    return { inicio, fin };
  });

  readonly horasCount = computed(() => this.rangoHoras().fin - this.rangoHoras().inicio);

  readonly horasGrid = computed<string[]>(() =>
    Array.from(
      { length: this.horasCount() + 1 },
      (_, i) => `${String(this.rangoHoras().inicio + i).padStart(2, '0')}:00`,
    ),
  );

  /** Posicion vertical en % del rango visible. Nada se mide en px. */
  calcularTopPct(horaInicio: string): number {
    const [h, m] = horaInicio.split(':').map(Number);
    const pct = ((h + (m || 0) / 60 - this.rangoHoras().inicio) / this.horasCount()) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  calcularAlturaPct(duracionMin: number): number {
    return Math.max(0, (duracionMin / 60 / this.horasCount()) * 100);
  }

  /** Posicion de la i-esima linea horaria del rango. */
  lineaPct(i: number): number {
    return (i / this.horasCount()) * 100;
  }

  getEventoBg(tipo: string): string {
    return this.getTipoColor(tipo) + '1a';
  }

  // Indicador de "ahora": minutos desde medianoche, refrescado cada minuto.
  private readonly ahoraMinutos = signal(this.minutosDelDia(new Date()));

  readonly ahoraPct = computed<number | null>(() => {
    const pct =
      ((this.ahoraMinutos() / 60 - this.rangoHoras().inicio) / this.horasCount()) * 100;
    return pct >= 0 && pct <= 100 ? pct : null;
  });

  private minutosDelDia(d: Date): number {
    return d.getHours() * 60 + d.getMinutes();
  }

  // Contenedor scrollable de la rejilla: solo para situar "ahora" al cargar.
  private readonly gridScroll = viewChild<ElementRef<HTMLDivElement>>('gridScroll');

  ngOnInit() {
    // Alimenta el panel de pendientes. RECEP no tiene informes ni objetivos propios.
    if (!this.auth.isRecep()) {
      this.dashboardSvc.getMiDia()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ error: () => { /* el interceptor global ya avisa */ } });
    }

    if (this.canVerTodo()) {
      this.trabajadorSvc.getTrabajadores()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          const clinicos = this.trabajadorSvc.trabajadores().filter(
            t => t.activo && ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'].includes(t.rol?.codigo ?? '')
          );
          this.trabajadores.set(clinicos);
        });
    }
    if (!this.auth.isRecep()) {
      this.vacacionesSvc.getMisVacaciones()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
    this.loadDia();
    this.loadSemana();
    const timer = setInterval(
      () => this.ahoraMinutos.set(this.minutosDelDia(new Date())),
      60_000,
    );
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  loadDia() {
    this.isLoadingDia.set(true);
    this.sesionesSvc
      .getCalendarioDiario(this.fechaISO(), this.trabajadorIdParam())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cal) => {
          this.calendarioDiario.set(cal);
          this.isLoadingDia.set(false);
        },
        error: () => this.isLoadingDia.set(false),
      });
  }

  loadSemana() {
    this.isLoadingSemana.set(true);
    const fecha = this.fechaISO();
    const trabajadorId = this.trabajadorIdParam();

    const lunes = startOfWeek(new Date(fecha + 'T12:00:00'), { weekStartsOn: 1 });
    this.cargarFestivosAnio(lunes.getFullYear());
    const domingo = new Date(lunes);
    domingo.setDate(domingo.getDate() + 6);
    const desde = this.formatISO(lunes);
    const hasta = this.formatISO(domingo);

    forkJoin([
      this.sesionesSvc.getCalendarioSemanal(fecha, trabajadorId),
      this.eventosSvc.getEventosPeriodo(desde, hasta, trabajadorId),
      this.eventosSvc.getResumenHoras(desde, hasta, trabajadorId),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ([cal, eventos, horas]) => {
          this.calendarioSemanal.set(cal);
          this.eventosAgenda.set(eventos);
          this.resumenHoras.set(horas);
          this.isLoadingSemana.set(false);
          setTimeout(() => this.situarEnAhora());
        },
        error: () => this.isLoadingSemana.set(false),
      });
  }

  /**
   * Con el rango adaptativo la rejilla suele caber entera; solo cuando no cabe
   * hace falta desplazarla, y entonces la hora actual va a un tercio del alto.
   */
  private situarEnAhora(): void {
    const el = this.gridScroll()?.nativeElement;
    if (!el || el.scrollHeight <= el.clientHeight) return;
    const pct = this.ahoraPct();
    if (pct === null) return;
    el.scrollTop = Math.max(0, (pct / 100) * el.scrollHeight - el.clientHeight / 3);
  }

  // ── Navegacion temporal ──────────────────────────────────────
  // Un solo par de flechas: el paso lo marca la vista activa.

  desplazar(delta: number): void {
    const paso = this.vista() === 'semana' ? 7 : 1;
    const f = new Date(this.fechaSeleccionada());
    f.setDate(f.getDate() + delta * paso);
    this.fechaSeleccionada.set(f);
    this.loadDia();
    this.loadSemana();
  }

  irAHoy() {
    this.fechaSeleccionada.set(new Date());
    this.loadDia();
    this.loadSemana();
  }

  /** Clic en cabecera o columna: elige el dia dentro de la semana ya cargada. */
  irADia(fechaISO: string) {
    // Usar mediodia para evitar desplazamiento por zona horaria
    const nueva = new Date(fechaISO + 'T12:00:00');
    this.fechaSeleccionada.set(nueva);
    this.loadDia();
  }

  esDiaSeleccionado(fechaISO: string): boolean {
    return fechaISO === this.fechaISO();
  }

  // ── Acciones sobre sesiones ──────────────────────────────

  abrirCompletar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirCompletar(sesion, event, () => this.loadDia());
  }

  abrirCancelar(sesion: SesionData, event: Event) {
    this.accionesSvc.abrirCancelar(sesion, event, () => this.loadDia());
  }

  verCliente(clienteId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/home/listado', clienteId, 'perfil']);
  }

  refrescar() {
    this.loadDia();
    this.loadSemana();
  }

  // ── Notificaciones ───────────────────────────────────────

  descartarAlerta(id: string, event?: Event) {
    event?.stopPropagation();
    this.notifSvc
      .descartar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  // ── Eventos de agenda — grid ─────────────────────────────

  getEventosDelDia(fechaISO: string): EventoAgenda[] {
    return this.eventosPorFecha().get(fechaISO) ?? [];
  }

  getEventoTopPct(evento: EventoAgenda): number {
    return this.calcularTopPct(this.isoToHHMM(evento.fechaHoraInicio));
  }

  getEventoDuracion(evento: EventoAgenda): number {
    const inicio = new Date(evento.fechaHoraInicio);
    const fin = new Date(evento.fechaHoraFin);
    return (fin.getTime() - inicio.getTime()) / 60000;
  }

  getEventoAlturaPct(evento: EventoAgenda): number {
    return this.calcularAlturaPct(this.getEventoDuracion(evento));
  }

  getEventoColor(evento: EventoAgenda): string {
    return TIPO_EVENTO_CONFIG[evento.tipo]?.color ?? '#94a3b8';
  }

  esEventoCompartido(evento: EventoAgenda): boolean {
    return evento.participantes.length > 1;
  }

  isoToHHMM(iso: string): string { return isoToHHMM(iso); }

  // ── Modal crear/editar evento ────────────────────────────

  abrirModalNuevoEvento(fechaISO?: string, horaISO?: string) {
    this.menuNuevoAbierto.set(false);
    const fecha = fechaISO ?? this.fechaISO();
    const hora = horaISO ? this.isoToHHMM(horaISO) : '09:00';
    const [h, m] = hora.split(':').map(Number);
    const horaFin = `${String(h + 1 < 24 ? h + 1 : h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    this.eventoEditando.set(null);
    this.modalEventoForm.set({
      titulo: '',
      tipo: 'OTRO',
      modalidad: 'PRESENCIAL',
      fecha,
      horaInicio: hora,
      horaFin,
      descripcion: '',
      participantesIds: [],
      horarioAdminId: null,
    });
    this.mostrarModalEvento.set(true);
  }

  abrirModalEvento(evento: EventoAgenda, event: Event) {
    event.stopPropagation();
    const fecha = evento.fechaHoraInicio.split('T')[0];
    this.modalEventoActual.set(evento);
    this.eventoEditando.set(evento.esVirtual ? null : evento);
    this.modalEventoForm.set({
      titulo: evento.titulo,
      tipo: evento.tipo,
      modalidad: evento.modalidad ?? 'PRESENCIAL',
      fecha,
      horaInicio: this.isoToHHMM(evento.fechaHoraInicio),
      horaFin: this.isoToHHMM(evento.fechaHoraFin),
      descripcion: evento.esVirtual ? '' : (evento.descripcion ?? ''),
      participantesIds: evento.esVirtual ? [] : evento.participantes.map((p) => p.trabajador.id),
      horarioAdminId: evento.esVirtual ? (evento.horarioAdminId ?? null) : null,
    });
    this.mostrarModalEvento.set(true);
  }

  cerrarModalEvento() {
    this.mostrarModalEvento.set(false);
    this.eventoEditando.set(null);
    this.modalEventoActual.set(null);
    this.modalEventoGuardando.set(false);
  }

  guardarEvento() {
    const form = this.modalEventoForm();
    if (!form.titulo.trim() || !form.fecha || !form.horaInicio || !form.horaFin) return;

    const dto: CreateEventoDto = {
      titulo: form.titulo,
      tipo: form.tipo,
      modalidad: form.modalidad,
      fechaHoraInicio: `${form.fecha}T${form.horaInicio}:00`,
      fechaHoraFin: `${form.fecha}T${form.horaFin}:00`,
      descripcion: form.descripcion || undefined,
      participantesIds: form.participantesIds.length ? form.participantesIds : undefined,
      horarioAdminId: form.horarioAdminId ?? undefined,
    };

    this.modalEventoGuardando.set(true);
    const editando = this.eventoEditando();
    const op$ = editando ? this.eventosSvc.update(editando.id, dto) : this.eventosSvc.create(dto);

    op$.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.cerrarModalEvento(); this.loadSemana(); },
        error: () => this.modalEventoGuardando.set(false),
      });
  }

  pedirEliminar(evento: EventoAgenda) {
    this.cerrarModalEvento();
    this.eventoAEliminar.set(evento);
  }

  confirmarEliminar() {
    const evento = this.eventoAEliminar();
    if (!evento) return;
    this.eventosSvc.delete(evento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.eventoAEliminar.set(null);
          this.loadSemana();
        },
      });
  }

  cancelarEliminar() {
    this.eventoAEliminar.set(null);
  }

  updateModalForm(patch: Partial<ReturnType<typeof this.modalEventoForm>>) {
    this.modalEventoForm.update((f) => ({ ...f, ...patch }));
  }

  toggleParticipante(id: string) {
    this.modalEventoForm.update((f) => {
      const ids = f.participantesIds.includes(id)
        ? f.participantesIds.filter((i) => i !== id)
        : [...f.participantesIds, id];
      return { ...f, participantesIds: ids };
    });
  }

  formatResumenHoras(): string {
    const r = this.resumenHoras();
    return r ? formatMinutosHoras(r.totalMinutos) : '';
  }

  readonly abrirVideollamada = abrirEnlaceExterno;

  toggleModalidad(sesion: SesionData, event: Event) {
    this.accionesSvc.toggleModalidadSesion(sesion, event, () => this.loadDia());
  }

  // ── Helpers UI ───────────────────────────────────────────

  getTipoColor(tipo: string): string {
    return TIPO_COLORES[tipo] ?? '#9ca3af';
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      PROGRAMADA: 'programada',
      COMPLETADA: 'completada',
      CANCELADA_CON_AVISO: 'cancelada-aviso',
      CANCELADA_SIN_AVISO: 'cancelada-sin',
      VACACIONES: 'vacaciones',
    };
    return map[estado] ?? 'default';
  }

  private parseHoraToDate(fechaISO: string, hora: string): Date {
    const [h, m] = hora.split(':').map(Number);
    const fecha = new Date(fechaISO + 'T00:00:00.000Z');
    fecha.setHours(h, m, 0, 0);
    return fecha;
  }

  private formatISO(fecha: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
  }
}

export default AgendaComponent;
