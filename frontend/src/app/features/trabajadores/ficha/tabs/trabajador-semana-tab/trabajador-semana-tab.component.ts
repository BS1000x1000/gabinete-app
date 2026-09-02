import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, finalize } from 'rxjs';
import { AuthService } from '../../../../../services/auth.service';
import { HorariosAdminService } from '../../../../../services/horarios-admin.service';
import { HorariosLaboralesService } from '../../../../../services/horarios-laborales.service';
import { ContratosService } from '../../../../../services/contratos.service';
import {
  HorarioAdmin,
  DIA_SEMANA_LABELS,
} from '../../../../../interface/horario-admin.interface';
import { HorarioLaboral } from '../../../../../interface/horario-laboral.interface';
import {
  CargaSemanalDia,
  CargaSemanalSlot,
  tipoBg,
  tipoColor,
  tipoLabel,
} from '../../../../../interface/contrato.interface';
import {
  Tramo,
  aTramo,
  formatoHoras,
  restar,
  totalMinutos,
  unir,
} from '../../../../../shared/utils/semana.utils';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';

/** Una cita o un bloque de administración, en la línea de tiempo del día. */
type EventoDia =
  | { clase: 'cliente'; horaInicio: string; horaFin: string; slot: CargaSemanalSlot; fuera: boolean }
  | { clase: 'admin';   horaInicio: string; horaFin: string; regla: HorarioAdmin };

/** Qué formulario de alta está abierto: en qué día y de qué tipo. */
type Alta = { dia: number; tipo: 'disponibilidad' | 'admin' };

/**
 * "Mi semana": la disponibilidad del terapeuta, los clientes que ya la ocupan y
 * el tiempo de administración, en una sola rejilla de siete días.
 *
 * La pregunta que responde es **"¿dónde meto al cliente que entra?"**, y esa
 * pregunta necesita las tres cosas juntas: de cuándo a cuándo acepto, qué hay
 * ya puesto y qué hueco queda. Antes había que reconstruirlo mirando la agenda
 * semana a semana.
 *
 * Aquí no hay jornada laboral. Los terapeutas son AUTÓNOMOS: nadie tiene un
 * horario contratado, y lo que sí se declara es cuándo se puede ofrecer hueco.
 * El modelo de datos conserva el nombre `HorarioLaboral` por historia — el
 * porqué está en su doc-comment en `schema.prisma`.
 *
 * Los clientes salen de los contratos vigentes (`ContratoSlot`), que son el
 * patrón estable, y no de las sesiones de una semana concreta, que varían con
 * cancelaciones, festivos y vacaciones. Lo realmente trabajado se cuenta en
 * Estadísticas → Registro de jornada: esto es el plan, aquello el contador.
 */
@Component({
  selector: 'app-trabajador-semana-tab',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent],
  templateUrl: './trabajador-semana-tab.component.html',
})
export default class TrabajadorSemanaTabComponent implements OnInit {
  private readonly route       = inject(ActivatedRoute);
  private readonly auth        = inject(AuthService);
  private readonly horariosSvc = inject(HorariosAdminService);
  private readonly dispSvc     = inject(HorariosLaboralesService);
  private readonly contratos   = inject(ContratosService);
  private readonly destroyRef  = inject(DestroyRef);

  readonly DIA_SEMANA_LABELS = DIA_SEMANA_LABELS;
  readonly diasSemana = [1, 2, 3, 4, 5, 6, 7];

  // Vocabulario compartido de contratos: color y etiqueta por tipo de terapia.
  // No se redefinen aquí; ya hubo una copia divergente en la agenda.
  readonly tipoColor = tipoColor;
  readonly tipoLabel = tipoLabel;
  readonly tipoBg    = tipoBg;
  readonly formatoHoras = formatoHoras;

  private readonly trabajadorId = this.route.parent?.snapshot.paramMap.get('id') ?? '';

  readonly puedeEditar = computed(() =>
    this.auth.currentTrabajadorId() === this.trabajadorId,
  );

  // ══ Datos ═════════════════════════════════════════════════

  disponibilidad = signal<HorarioLaboral[]>([]);
  reglas         = signal<HorarioAdmin[]>([]);
  carga          = signal<CargaSemanalDia[]>([]);

  cargando       = signal(true);
  errorDisp      = signal<string | null>(null);
  errorReglas    = signal<string | null>(null);
  errorCarga     = signal<string | null>(null);
  guardando      = signal(false);

  // ══ Edición ═══════════════════════════════════════════════

  /** Alta inline: un día concreto y un tipo concreto, nunca "varios días". */
  alta = signal<Alta | null>(null);
  formAlta = signal({ horaInicio: '16:00', horaFin: '20:00', titulo: '' });

  tramoEditando   = signal<HorarioLaboral | null>(null);
  formTramoEditar = signal({ horaInicio: '', horaFin: '' });

  reglaEditando = signal<HorarioAdmin | null>(null);
  formEditar    = signal({ horaInicio: '', horaFin: '', titulo: '' });

  pendingDeleteTramo = signal<string | null>(null);
  pendingDeleteId    = signal<string | null>(null);

  // ══ La semana ═════════════════════════════════════════════

  /**
   * Los siete días siempre, incluso los vacíos: el sábado que aún no tiene
   * nada es justo donde puede caer el cliente nuevo, así que tiene que estar
   * ahí para poder declararlo.
   */
  readonly semana = computed(() => {
    const disp   = this.disponibilidad().filter(d => d.activo);
    const admin  = this.reglas().filter(r => r.activo);
    const carga  = this.carga();
    const porHora = (a: { horaInicio: string }, b: { horaInicio: string }) =>
      a.horaInicio.localeCompare(b.horaInicio);

    return this.diasSemana.map(dia => {
      const franjas  = disp.filter(d => d.diaSemana === dia).sort(porHora);
      const bloques  = admin.filter(r => r.diaSemana === dia).sort(porHora);
      const clientes = [...(carga.find(c => c.dia === dia)?.slots ?? [])].sort(porHora);

      const tramosDisp = franjas.map(aTramo);
      const libres = restar(tramosDisp, [...clientes.map(aTramo), ...bloques.map(aTramo)]);

      // Un cliente "fuera" solo tiene sentido si hay disponibilidad declarada:
      // sin ella no está fuera de nada, simplemente no se ha declarado nada.
      const dentroDeAlguna = (x: Tramo) =>
        tramosDisp.some(f => x.inicio >= f.inicio && x.fin <= f.fin);

      const eventos: EventoDia[] = [
        ...clientes.map((slot): EventoDia => ({
          clase: 'cliente',
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin,
          slot,
          fuera: tramosDisp.length > 0 && !dentroDeAlguna(aTramo(slot)),
        })),
        ...bloques.map((regla): EventoDia => ({
          clase: 'admin',
          horaInicio: regla.horaInicio,
          horaFin: regla.horaFin,
          regla,
        })),
      ].sort(porHora);

      return {
        dia,
        label: DIA_SEMANA_LABELS[dia],
        franjas,
        eventos,
        libres,
        minutosDisponible: totalMinutos(unir(tramosDisp)),
        minutosClientes:   totalMinutos(clientes.map(aTramo)),
        minutosAdmin:      totalMinutos(bloques.map(aTramo)),
        minutosLibre:      totalMinutos(libres),
        numClientes:       clientes.length,
        vacio: !franjas.length && !eventos.length,
      };
    });
  });

  // ── Resumen: las cuatro cifras que deciden ────────────────
  //
  // Antes esto era "% de la jornada que no es clínico". Con disponibilidad en
  // vez de jornada ese porcentaje ya no significaba nada: un autónomo sin
  // jornada declarada tenía un 0% que parecía un dato.

  private sumar(campo: 'minutosDisponible' | 'minutosClientes' | 'minutosAdmin' | 'minutosLibre') {
    return this.semana().reduce((n, d) => n + d[campo], 0);
  }

  readonly minutosDisponibles = computed(() => this.sumar('minutosDisponible'));
  readonly minutosClientes    = computed(() => this.sumar('minutosClientes'));
  readonly minutosAdmin       = computed(() => this.sumar('minutosAdmin'));
  readonly minutosLibres      = computed(() => this.sumar('minutosLibre'));

  readonly hayAlgoQueResumir = computed(() =>
    this.minutosDisponibles() > 0 || this.minutosClientes() > 0 || this.minutosAdmin() > 0,
  );

  /**
   * Más ocupado que disponible: o falta declarar disponibilidad, o hay clientes
   * fuera de ella. Sustituye al viejo "hay más administración que jornada".
   */
  readonly excedeDisponibilidad = computed(() =>
    this.minutosDisponibles() > 0 &&
    this.minutosClientes() + this.minutosAdmin() > this.minutosDisponibles(),
  );

  /** "16:00–17:00 · 19:00–20:00" — los huecos de un día, en una línea. */
  huecos(libres: Tramo[]): string {
    return libres.map(t => `${this.hhmm(t.inicio)}–${this.hhmm(t.fin)}`).join(' · ');
  }

  private hhmm(minutos: number): string {
    return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
  }

  // ══ Carga de datos ════════════════════════════════════════

  ngOnInit(): void {
    this.cargarDisponibilidad();
    this.cargarReglas();
    this.cargarCarga();
  }

  cargarDisponibilidad(): void {
    this.dispSvc.getByTrabajador(this.trabajadorId)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.cargando.set(false)))
      .subscribe({
        next: d => this.disponibilidad.set(d),
        error: () => this.errorDisp.set('No se pudo cargar la disponibilidad.'),
      });
  }

  cargarReglas(): void {
    this.horariosSvc.getAll(this.trabajadorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: r => this.reglas.set(r),
        error: () => this.errorReglas.set('No se pudieron cargar los bloques de administración.'),
      });
  }

  /** La carga es informativa: si falla, la pantalla sigue sirviendo para editar. */
  cargarCarga(): void {
    this.contratos.getCargaSemanal(this.trabajadorId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: c => this.carga.set(c),
        error: () => this.errorCarga.set('No se pudieron cargar los clientes de la semana.'),
      });
  }

  // ══ Alta: siempre un día, con SUS horas ═══════════════════
  //
  // Antes el alta era un selector de varios días con UNA franja, que se
  // abanicaba en N peticiones idénticas. Poner el lunes de 10:00 a 12:00 y el
  // miércoles de 16:00 a 18:00 obligaba a abrir el formulario dos veces, y el
  // `forkJoin` que lo mandaba no era transaccional: si una fallaba, las otras
  // ya estaban escritas y el error era genérico.

  abrirAlta(dia: number, tipo: Alta['tipo']): void {
    this.cerrarEdiciones();
    this.alta.set({ dia, tipo });
    this.formAlta.set(
      tipo === 'disponibilidad'
        ? { horaInicio: '16:00', horaFin: '20:00', titulo: '' }
        : { horaInicio: '09:00', horaFin: '10:00', titulo: '' },
    );
  }

  cerrarAlta(): void {
    this.alta.set(null);
  }

  estaAbierta(dia: number, tipo: Alta['tipo']): boolean {
    const a = this.alta();
    return !!a && a.dia === dia && a.tipo === tipo;
  }

  setFormAlta(campo: 'horaInicio' | 'horaFin' | 'titulo', valor: string): void {
    this.formAlta.update(f => ({ ...f, [campo]: valor }));
  }

  guardarAlta(): void {
    const a = this.alta();
    if (!a) return;
    const f = this.formAlta();

    const error = a.tipo === 'disponibilidad' ? this.errorDisp : this.errorReglas;
    if (!f.horaInicio || !f.horaFin) {
      error.set('Define la hora de inicio y la de fin.');
      return;
    }
    if (f.horaFin <= f.horaInicio) {
      error.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    error.set(null);
    this.guardando.set(true);

    const peticion: Observable<unknown> = a.tipo === 'disponibilidad'
      ? this.dispSvc.create(this.trabajadorId, {
          diaSemana: a.dia, horaInicio: f.horaInicio, horaFin: f.horaFin,
        })
      : this.horariosSvc.create({
          diaSemana: a.dia, horaInicio: f.horaInicio, horaFin: f.horaFin,
          titulo: f.titulo || undefined,
        });

    peticion
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.alta.set(null);
          if (a.tipo === 'disponibilidad') this.cargarDisponibilidad();
          else this.cargarReglas();
        },
        error: () => error.set('No se pudo guardar. Inténtalo de nuevo.'),
      });
  }

  // ══ Edición de una franja de disponibilidad ═══════════════

  iniciarEdicionTramo(tramo: HorarioLaboral): void {
    this.cerrarEdiciones();
    this.alta.set(null);
    this.tramoEditando.set(tramo);
    this.formTramoEditar.set({ horaInicio: tramo.horaInicio, horaFin: tramo.horaFin });
  }

  cancelarEdicionTramo(): void {
    this.tramoEditando.set(null);
  }

  setFormTramoEditar(campo: 'horaInicio' | 'horaFin', valor: string): void {
    this.formTramoEditar.update(f => ({ ...f, [campo]: valor }));
  }

  guardarEdicionTramo(): void {
    const tramo = this.tramoEditando();
    if (!tramo) return;
    const f = this.formTramoEditar();
    if (f.horaFin <= f.horaInicio) {
      this.errorDisp.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    this.errorDisp.set(null);
    this.guardando.set(true);
    this.dispSvc.update(tramo.id, { horaInicio: f.horaInicio, horaFin: f.horaFin })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => { this.tramoEditando.set(null); this.cargarDisponibilidad(); },
        error: () => this.errorDisp.set('No se pudo actualizar la franja.'),
      });
  }

  eliminarTramo(id: string): void {
    this.pendingDeleteTramo.set(id);
  }

  onConfirmarEliminarTramo(): void {
    const id = this.pendingDeleteTramo();
    if (!id) return;
    this.pendingDeleteTramo.set(null);
    this.dispSvc.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.cargarDisponibilidad(),
        error: () => this.errorDisp.set('No se pudo eliminar la franja.'),
      });
  }

  onCancelarEliminarTramo(): void {
    this.pendingDeleteTramo.set(null);
  }

  // ══ Edición de un bloque de administración ════════════════

  iniciarEdicion(regla: HorarioAdmin): void {
    this.cerrarEdiciones();
    this.alta.set(null);
    this.reglaEditando.set(regla);
    this.formEditar.set({
      horaInicio: regla.horaInicio, horaFin: regla.horaFin, titulo: regla.titulo,
    });
  }

  cancelarEdicion(): void {
    this.reglaEditando.set(null);
  }

  setFormEditar(campo: 'horaInicio' | 'horaFin' | 'titulo', valor: string): void {
    this.formEditar.update(f => ({ ...f, [campo]: valor }));
  }

  guardarEdicion(): void {
    const regla = this.reglaEditando();
    if (!regla) return;
    const f = this.formEditar();
    if (f.horaFin <= f.horaInicio) {
      this.errorReglas.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    this.errorReglas.set(null);
    this.guardando.set(true);
    this.horariosSvc.update(regla.id, {
      horaInicio: f.horaInicio, horaFin: f.horaFin, titulo: f.titulo,
    })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => { this.reglaEditando.set(null); this.cargarReglas(); },
        error: () => this.errorReglas.set('No se pudo actualizar el bloque.'),
      });
  }

  eliminarRegla(id: string): void {
    this.pendingDeleteId.set(id);
  }

  onConfirmarEliminar(): void {
    const id = this.pendingDeleteId();
    if (!id) return;
    this.pendingDeleteId.set(null);
    this.horariosSvc.delete(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.cargarReglas(),
        error: () => this.errorReglas.set('No se pudo eliminar el bloque.'),
      });
  }

  onCancelarEliminar(): void {
    this.pendingDeleteId.set(null);
  }

  private cerrarEdiciones(): void {
    this.tramoEditando.set(null);
    this.reglaEditando.set(null);
  }
}
