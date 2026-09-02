import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, concat, finalize } from 'rxjs';
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
  aHhMm,
  aMinutos,
  aTramo,
  anchoPct,
  formatoHoras,
  marcasHorarias,
  pct,
  rangoHorario,
  restar,
  solapan,
  totalMinutos,
  unir,
} from '../../../../../shared/utils/semana.utils';
import { ConfirmModalComponent } from '../../../../../shared/components/confirm-modal/confirm-modal.component';
import { EstadoCargaComponent } from '../../../../../shared/components/estado-vista/estado-vista.component';

/** Una franja de disponibilidad ya situada sobre el eje. */
interface PistaFranja {
  id: string;
  horaInicio: string;
  horaFin: string;
  izq: number;
  ancho: number;
  cabeTexto: boolean;
}

/** Un hueco libre: el trozo de banda que nadie ocupa. Es la respuesta visual. */
interface PistaHueco {
  izq: number;
  ancho: number;
  etiqueta: string;
  /** Regla de densidad honesta: si no cabe el texto, no se pinta recortado. */
  cabeTexto: boolean;
}

/**
 * Lo que ocupa la banda. Unión discriminada a propósito: la plantilla estrecha
 * el tipo con `@if (ev.clase === 'cliente')` y así `slot` y `regla` no necesitan
 * ser opcionales ni llevar aserciones.
 */
type PistaEvento =
  | {
      clase: 'cliente';
      clave: string;
      horaInicio: string;
      horaFin: string;
      izq: number;
      ancho: number;
      cabeTexto: boolean;
      /** Cae fuera de la disponibilidad declarada. Se informa, no se corrige. */
      fuera: boolean;
      slot: CargaSemanalSlot;
    }
  | {
      clase: 'admin';
      clave: string;
      horaInicio: string;
      horaFin: string;
      izq: number;
      ancho: number;
      cabeTexto: boolean;
      regla: HorarioAdmin;
    };

/** Qué formulario de alta está abierto: en qué día y de qué tipo. */
type Alta = { dia: number; tipo: 'disponibilidad' | 'admin' };

/** Ancho mínimo (% del eje) para que quepa una etiqueta sin recortarla. */
const ANCHO_MINIMO_TEXTO = 7;

/**
 * "Mi semana": la disponibilidad del terapeuta, los clientes que ya la ocupan y
 * el tiempo de administración, sobre un eje de horas compartido por los siete
 * días.
 *
 * La pregunta que responde es **"¿dónde meto al cliente que entra?"**, y esa
 * pregunta es espacial: el hueco libre se VE como el trozo de banda que queda
 * vacío, en vez de leerse en una lista. El eje compartido es lo que permite
 * comparar el lunes a las 17:00 con el miércoles a las 17:00, que es justo lo
 * que se hace al colocar un cliente semanal.
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
 *
 * Del vocabulario de la agenda se reutiliza la semántica, no el layout: sólido
 * = cita real, discontinuo = generado, color de categoría desde `TIPO_COLOR`,
 * posiciones en % y rango horario deducido de los datos. El layout es distinto
 * a propósito: `ag-week-grid` necesita la altura de un shell a pantalla
 * completa, y esta pestaña vive en un panel ancho y bajo.
 */
@Component({
  selector: 'app-trabajador-semana-tab',
  standalone: true,
  imports: [CommonModule, ConfirmModalComponent, EstadoCargaComponent],
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
  readonly aHhMm = aHhMm;

  private readonly trabajadorId = this.route.parent?.snapshot.paramMap.get('id') ?? '';

  readonly puedeEditar = computed(() =>
    this.auth.currentTrabajadorId() === this.trabajadorId,
  );

  // ══ Datos ═════════════════════════════════════════════════

  disponibilidad = signal<HorarioLaboral[]>([]);
  reglas         = signal<HorarioAdmin[]>([]);
  carga          = signal<CargaSemanalDia[]>([]);

  cargando    = signal(true);
  errorDisp   = signal<string | null>(null);
  errorReglas = signal<string | null>(null);
  errorCarga  = signal<string | null>(null);
  guardando   = signal(false);

  // ══ Edición ═══════════════════════════════════════════════

  /**
   * Alta inline: siempre anclada a UN día, con sus horas.
   *
   * `tambienEn` es el atajo, no el predeterminado. El formulario viejo era al
   * revés: un selector de varios días con UNA franja para todos, así que el
   * caso normal —lunes de 10 a 12 y miércoles de 16 a 18— obligaba a abrirlo
   * dos veces. Aquí el día base manda y copiar a otros es una decisión aparte.
   */
  alta = signal<Alta | null>(null);
  formAlta = signal<{ horaInicio: string; horaFin: string; titulo: string; tambienEn: number[] }>({
    horaInicio: '16:00', horaFin: '20:00', titulo: '', tambienEn: [],
  });

  tramoEditando   = signal<HorarioLaboral | null>(null);
  formTramoEditar = signal({ horaInicio: '', horaFin: '' });

  reglaEditando = signal<HorarioAdmin | null>(null);
  formEditar    = signal({ horaInicio: '', horaFin: '', titulo: '' });

  pendingDeleteTramo = signal<string | null>(null);
  pendingDeleteId    = signal<string | null>(null);

  // ══ El eje ════════════════════════════════════════════════

  /**
   * Un solo rango para los siete días. Es lo que hace que las 17:00 del lunes
   * caigan justo encima de las 17:00 del miércoles; con un eje por día la
   * comparación visual sería mentira.
   */
  readonly rango = computed<Tramo>(() => {
    const tramos: Tramo[] = [
      ...this.disponibilidad().filter(d => d.activo).map(aTramo),
      ...this.reglas().filter(r => r.activo).map(aTramo),
      ...this.carga().flatMap(d => d.slots.map(aTramo)),
    ];
    return rangoHorario(tramos);
  });

  readonly marcas = computed(() =>
    marcasHorarias(this.rango()).map(m => ({
      minuto: m,
      etiqueta: aHhMm(m),
      izq: pct(m, this.rango()),
    })),
  );

  // ══ La semana ═════════════════════════════════════════════

  /**
   * Los siete días siempre, incluso los vacíos: el sábado que aún no tiene nada
   * es justo donde puede caer el cliente nuevo, así que tiene que estar ahí para
   * poder declararlo.
   */
  readonly semana = computed(() => {
    const rango  = this.rango();
    const disp   = this.disponibilidad().filter(d => d.activo);
    const admin  = this.reglas().filter(r => r.activo);
    const carga  = this.carga();
    const porHora = (a: { horaInicio: string }, b: { horaInicio: string }) =>
      a.horaInicio.localeCompare(b.horaInicio);

    const situar = (x: { horaInicio: string; horaFin: string }) => {
      const ancho = anchoPct(aTramo(x), rango);
      return { izq: pct(aMinutos(x.horaInicio), rango), ancho, cabeTexto: ancho >= ANCHO_MINIMO_TEXTO };
    };

    return this.diasSemana.map(dia => {
      const franjasRaw = disp.filter(d => d.diaSemana === dia).sort(porHora);
      const bloques    = admin.filter(r => r.diaSemana === dia).sort(porHora);
      const clientes   = [...(carga.find(c => c.dia === dia)?.slots ?? [])].sort(porHora);

      const tramosDisp = franjasRaw.map(aTramo);
      const libres = restar(tramosDisp, [...clientes.map(aTramo), ...bloques.map(aTramo)]);

      // Un cliente "fuera" solo tiene sentido si hay disponibilidad declarada:
      // sin ella no está fuera de nada, simplemente no se ha declarado nada.
      const dentroDeAlguna = (x: Tramo) =>
        tramosDisp.some(f => x.inicio >= f.inicio && x.fin <= f.fin);

      const franjas: PistaFranja[] = franjasRaw.map(f => ({
        id: f.id, horaInicio: f.horaInicio, horaFin: f.horaFin, ...situar(f),
      }));

      const eventos: PistaEvento[] = [
        ...clientes.map((slot): PistaEvento => ({
          clase: 'cliente',
          clave: `c-${slot.contratoId}-${slot.horaInicio}`,
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin,
          ...situar(slot),
          fuera: tramosDisp.length > 0 && !dentroDeAlguna(aTramo(slot)),
          slot,
        })),
        ...bloques.map((regla): PistaEvento => ({
          clase: 'admin',
          clave: `a-${regla.id}`,
          horaInicio: regla.horaInicio,
          horaFin: regla.horaFin,
          ...situar(regla),
          regla,
        })),
      ].sort(porHora);

      const huecos: PistaHueco[] = libres.map(h => {
        const ancho = anchoPct(h, rango);
        return {
          izq: pct(h.inicio, rango),
          ancho,
          etiqueta: `${aHhMm(h.inicio)}–${aHhMm(h.fin)}`,
          // La agenda hace lo mismo con el tipo de sesión por debajo de 45 min:
          // antes que un texto recortado, ninguno.
          cabeTexto: ancho >= ANCHO_MINIMO_TEXTO,
        };
      });

      const label = DIA_SEMANA_LABELS[dia];

      return {
        dia,
        label,
        franjas,
        eventos,
        huecos,
        minutosDisponible: totalMinutos(unir(tramosDisp)),
        minutosClientes:   totalMinutos(clientes.map(aTramo)),
        minutosAdmin:      totalMinutos(bloques.map(aTramo)),
        minutosLibre:      totalMinutos(libres),
        numClientes:       clientes.length,
        vacio: !franjas.length && !eventos.length,
        resumen: this.resumenAccesible(label, franjas, eventos, huecos),
      };
    });
  });

  /**
   * Una línea de tiempo es puro píxel para un lector de pantalla. Cada fila
   * lleva su equivalente en texto, oculto a la vista.
   */
  private resumenAccesible(
    label: string, franjas: PistaFranja[], eventos: PistaEvento[], huecos: PistaHueco[],
  ): string {
    const partes = [`${label}.`];
    partes.push(
      franjas.length
        ? `Disponible ${franjas.map(f => `de ${f.horaInicio} a ${f.horaFin}`).join(' y ')}.`
        : 'Sin disponibilidad declarada.',
    );
    for (const ev of eventos) {
      partes.push(
        ev.clase === 'cliente'
          ? `Ocupado de ${ev.horaInicio} a ${ev.horaFin}: ${ev.slot.clienteNombre}, ${tipoLabel(ev.slot.tipoSesion)}.`
          : `Administración de ${ev.horaInicio} a ${ev.horaFin}: ${ev.regla.titulo}.`,
      );
    }
    if (huecos.length) {
      partes.push(`Libre ${huecos.map(h => h.etiqueta.replace('–', ' a ')).join(' y ')}.`);
    }
    return partes.join(' ');
  }

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

  /** Nada declarado y nada asignado: la pantalla necesita explicarse. */
  readonly semanaEnBlanco = computed(() =>
    this.minutosDisponibles() === 0 && this.minutosClientes() === 0 && this.minutosAdmin() === 0,
  );

  /**
   * Más ocupado que disponible: o falta declarar disponibilidad, o hay clientes
   * fuera de ella. Sustituye al viejo "hay más administración que jornada".
   */
  readonly excedeDisponibilidad = computed(() =>
    this.minutosDisponibles() > 0 &&
    this.minutosClientes() + this.minutosAdmin() > this.minutosDisponibles(),
  );

  /**
   * Aviso de solape al declarar. **Avisa, no bloquea**: es la filosofía que el
   * módulo ya declara para los avisos de sesión, y a veces el solape es
   * deliberado.
   */
  readonly avisoAlta = computed<string | null>(() => {
    const a = this.alta();
    if (!a) return null;
    const f = this.formAlta();
    if (!f.horaInicio || !f.horaFin || f.horaFin <= f.horaInicio) return null;

    const nuevo: Tramo = { inicio: aMinutos(f.horaInicio), fin: aMinutos(f.horaFin) };
    const dia = this.semana().find(d => d.dia === a.dia);
    if (!dia) return null;

    if (a.tipo === 'disponibilidad') {
      return dia.franjas.some(x => solapan(nuevo, aTramo(x)))
        ? 'Se solapa con otra franja de ese día. Puedes guardarla igual: al calcular los huecos se unen.'
        : null;
    }

    const choque = dia.eventos.find(ev => solapan(nuevo, aTramo(ev)));
    if (!choque) return null;
    return choque.clase === 'cliente'
      ? `A esa hora ya tienes a ${choque.slot.clienteNombre}. Puedes guardarlo igual.`
      : `Se solapa con "${choque.regla.titulo}". Puedes guardarlo igual.`;
  });

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
        ? { horaInicio: '16:00', horaFin: '20:00', titulo: '', tambienEn: [] }
        : { horaInicio: '09:00', horaFin: '10:00', titulo: '', tambienEn: [] },
    );
  }

  cerrarAlta(): void {
    this.alta.set(null);
  }

  /** Días distintos del base, para ofrecer la copia. */
  otrosDias(dia: number): number[] {
    return this.diasSemana.filter(d => d !== dia);
  }

  alternarTambienEn(dia: number): void {
    this.formAlta.update(f => ({
      ...f,
      tambienEn: f.tambienEn.includes(dia)
        ? f.tambienEn.filter(d => d !== dia)
        : [...f.tambienEn, dia].sort((a, b) => a - b),
    }));
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

    const dias = [a.dia, ...f.tambienEn];
    const crear = (dia: number): Observable<unknown> =>
      a.tipo === 'disponibilidad'
        ? this.dispSvc.create(this.trabajadorId, {
            diaSemana: dia, horaInicio: f.horaInicio, horaFin: f.horaFin,
          })
        : this.horariosSvc.create({
            diaSemana: dia, horaInicio: f.horaInicio, horaFin: f.horaFin,
            titulo: f.titulo || undefined,
          });

    // En serie, no en paralelo: si una falla, las siguientes no llegan a
    // enviarse y el mensaje puede decir la verdad sobre lo que quedó escrito.
    // El `forkJoin` de antes las mandaba todas a la vez y el error era mudo.
    //
    // La recarga va en `finalize`, que corre tanto al completar como al fallar:
    // si se guardó a medias, la pantalla tiene que enseñar lo que hay de verdad.
    concat(...dias.map(crear))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.guardando.set(false);
          if (a.tipo === 'disponibilidad') this.cargarDisponibilidad();
          else this.cargarReglas();
        }),
      )
      .subscribe({
        complete: () => this.alta.set(null),
        error: () => error.set(
          dias.length > 1
            ? 'No se pudieron guardar todos los días. Revisa la semana: puede que alguno sí se haya creado.'
            : 'No se pudo guardar. Inténtalo de nuevo.',
        ),
      });
  }

  // ══ Edición de una franja de disponibilidad ═══════════════

  iniciarEdicionTramo(franja: PistaFranja): void {
    const tramo = this.disponibilidad().find(d => d.id === franja.id);
    if (!tramo) return;
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
    this.tramoEditando.set(null);
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
    this.reglaEditando.set(null);
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
