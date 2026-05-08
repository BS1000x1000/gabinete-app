import {
  Component,
  computed,
  inject,
  signal,
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
  ModalidadSesion,
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
} from '../../../interface/calendario.interface';
import { SesionModalesComponent } from '../../../components/sesiones-modales/sesiones-modales.component';
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

const TIPO_COLORES: Record<string, string> = {
  PEDAGOGIA: '#7c6fd6',
  NEUROPSICOLOGIA: '#3b82f6',
  LOGOPEDIA: '#10b981',
  TERAPIA_OCUPACIONAL: '#ef4444',
  EVALUACION: '#f59e0b',
  REUNION_COLEGIO: '#6b7280',
};

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, SesionModalesComponent],
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
  private destroyRef = inject(DestroyRef);

  readonly TIPO_SESION_LABELS: any = TIPO_SESION_LABELS;
  readonly ESTADO_SESION_LABELS: any = ESTADO_SESION_LABELS;
  readonly EstadoSesion = EstadoSesion;

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

  getTrabajadorIniciales(t: Trabajador): string {
    return `${t.nombre.charAt(0)}${t.apellidos.charAt(0)}`.toUpperCase();
  }

  // Estado principal
  calendarioDiario = signal<CalendarioDiario | null>(null);
  calendarioSemanal = signal<CalendarioSemanal | null>(null);
  isLoadingDia = signal(false);
  isLoadingSemana = signal(false);
  fechaSeleccionada = signal<Date>(new Date());
  bannerColapsado = signal(false);

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

  // Alertas urgentes para el banner
  readonly alertasUrgentes = computed(() =>
    this.notifSvc
      .noLeidas()
      .filter((n) => n.prioridad === 'URGENTE' || n.prioridad === 'ALTA'),
  );
  readonly hayAlertas = computed(
    () => this.alertasUrgentes().length > 0 && !this.bannerColapsado(),
  );

  // Sesiones del día mapeadas para las acciones
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

  // Stats del día
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

  // Fecha formateada
  readonly fechaFormateada = computed(() =>
    this.fechaSeleccionada().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
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

  // ── Grid semanal tipo Teams ──────────────────────────────────
  readonly HORA_INICIO = 8;
  readonly HORA_FIN = 22;
  readonly PX_POR_HORA = 64;
  readonly alturaGrid = (this.HORA_FIN - this.HORA_INICIO) * this.PX_POR_HORA;
  readonly horasCount = this.HORA_FIN - this.HORA_INICIO;

  readonly horasGrid: string[] = Array.from(
    { length: this.horasCount + 1 },
    (_, i) => `${String(this.HORA_INICIO + i).padStart(2, '0')}:00`,
  );

  minutosActualesEnGrid = signal<number | null>(null);

  calcularTop(horaInicio: string): number {
    const [h, m] = horaInicio.split(':').map(Number);
    return Math.max(0, (this.minutosDesdeInicio(h, m) / 60) * this.PX_POR_HORA);
  }

  calcularAltura(duracion: number): number {
    return Math.max(18, (duracion / 60) * this.PX_POR_HORA);
  }

  getEventoBg(tipo: string): string {
    return this.getTipoColor(tipo) + '1a';
  }

  private minutosDesdeInicio(h: number, m: number): number {
    return h * 60 + m - this.HORA_INICIO * 60;
  }

  private actualizarHoraActual(): void {
    const ahora = new Date();
    const minutos = this.minutosDesdeInicio(ahora.getHours(), ahora.getMinutes());
    const maxMin = this.horasCount * 60;
    this.minutosActualesEnGrid.set(
      minutos >= 0 && minutos <= maxMin ? (minutos / 60) * this.PX_POR_HORA : null,
    );
  }

  ngOnInit() {
    if (this.canVerTodo()) {
      this.trabajadorSvc.getTrabajadores()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          // Solo terapeutas clínicos en el selector
          const clinicos = this.trabajadorSvc.trabajadores().filter(
            t => t.activo && ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'].includes(t.rol?.codigo ?? '')
          );
          this.trabajadores.set(clinicos);
        });
    }
    this.loadDia();
    this.loadSemana();
    this.actualizarHoraActual();
    const timer = setInterval(() => this.actualizarHoraActual(), 60_000);
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
        },
        error: () => this.isLoadingSemana.set(false),
      });
  }

  // ── Navegación por día ───────────────────────────────────

  diaAnterior() {
    const f = new Date(this.fechaSeleccionada());
    f.setDate(f.getDate() - 1);
    this.fechaSeleccionada.set(f);
    this.loadDia();
    this.loadSemana();
  }

  diaSiguiente() {
    const f = new Date(this.fechaSeleccionada());
    f.setDate(f.getDate() + 1);
    this.fechaSeleccionada.set(f);
    this.loadDia();
    this.loadSemana();
  }

  irAHoy() {
    this.fechaSeleccionada.set(new Date());
    this.loadDia();
    this.loadSemana();
  }

  irADia(fechaISO: string) {
    // Usar mediodía para evitar desplazamiento por zona horaria
    const nueva = new Date(fechaISO + 'T12:00:00');
    this.fechaSeleccionada.set(nueva);
    this.loadDia();
  }

  esDiaSeleccionado(fechaISO: string): boolean {
    return fechaISO === this.fechaISO();
  }

  // ── Navegación por semana (panel derecho) ────────────────

  semanaAnterior() {
    const f = new Date(this.fechaSeleccionada());
    f.setDate(f.getDate() - 7);
    this.fechaSeleccionada.set(f);
    this.loadDia();
    this.loadSemana();
  }

  semanaSiguiente() {
    const f = new Date(this.fechaSeleccionada());
    f.setDate(f.getDate() + 7);
    this.fechaSeleccionada.set(f);
    this.loadDia();
    this.loadSemana();
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

  descartarAlerta(id: string) {
    this.notifSvc
      .descartar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  // ── Eventos de agenda — grid ─────────────────────────────

  getEventosDelDia(fechaISO: string): EventoAgenda[] {
    return this.eventosPorFecha().get(fechaISO) ?? [];
  }

  getEventoTop(evento: EventoAgenda): number {
    return this.calcularTop(this.isoToHHMM(evento.fechaHoraInicio));
  }

  getEventoAltura(evento: EventoAgenda): number {
    const inicio = new Date(evento.fechaHoraInicio);
    const fin = new Date(evento.fechaHoraFin);
    const durMin = (fin.getTime() - inicio.getTime()) / 60000;
    return this.calcularAltura(durMin);
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

  eliminarEvento(evento: EventoAgenda, event: Event) {
    event.stopPropagation();
    if (!confirm(`¿Eliminar "${evento.titulo}"?`)) return;
    this.eventosSvc
      .delete(evento.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.loadSemana() });
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
