import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { FestivosService } from '../../../../services/festivos.service';
import {
  AmbitoFestivo,
  CreateFestivoPayload,
  Festivo,
  FestivoPrevisto,
  ResultadoImportacion,
} from '../../../../interface/festivo.interface';

type FormFestivo = {
  fecha: string;
  descripcion: string;
  ambito: AmbitoFestivo;
  ccaa: string;
  municipio: string;
};

const EMPTY_FORM = (): FormFestivo => ({
  fecha: '',
  descripcion: '',
  ambito: 'NACIONAL',
  ccaa: '',
  municipio: '',
});

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Calendario del centro.
 *
 * La pantalla existía como una lista plana de festivos con dos campos de texto
 * libre (comunidad y provincia) que se cruzaban contra la provincia del cliente.
 * Un festivo que no casaba desaparecía sin decir nada y el contrato salía con
 * una sesión de más. Ahora el calendario es del centro, se elige una vez, y la
 * pantalla avisa en cuanto sabe que le falta algo en vez de dar por bueno un
 * calendario incompleto.
 */
@Component({
  standalone: true,
  selector: 'app-festivos-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './festivos.component.html',
})
export default class FestivosAdminComponent implements OnInit {
  private readonly festivosSvc = inject(FestivosService);

  anioActivo        = signal(new Date().getFullYear());
  mostrarFormulario = signal(false);
  guardando         = signal(false);
  errorForm         = signal<string | null>(null);
  confirmEliminarId = signal<string | null>(null);
  editandoId        = signal<string | null>(null);
  cargando          = signal(false);
  eliminandoId      = signal<string | null>(null);

  form = signal<FormFestivo>(EMPTY_FORM());

  readonly festivos     = this.festivosSvc.festivos;
  readonly catalogo     = this.festivosSvc.catalogo;
  readonly configuracion = this.festivosSvc.configuracion;

  // ── Estado del calendario del centro ───────────────────────

  guardandoConfig = signal(false);
  errorConfig     = signal<string | null>(null);

  /** El municipio elegido está en el catálogo pero aún sin festivos cargados. */
  readonly municipioSinDatos = computed(() => {
    const cfg = this.configuracion();
    if (!cfg?.municipio) return false;
    return this.catalogo()?.municipios.find(m => m.nombre === cfg.municipio)?.sinDatos ?? false;
  });

  readonly sinMunicipio = computed(() => !this.configuracion()?.municipio);

  readonly etiquetaCalendario = computed(() => {
    const cfg = this.configuracion();
    if (!cfg) return '—';
    const ccaa = this.catalogo()?.ccaa.find(c => c.codigo === cfg.ccaaCodigo)?.nombre ?? cfg.ccaaCodigo;
    return cfg.municipio ? `${ccaa} · ${cfg.municipio}` : ccaa;
  });

  /** Municipios que puede elegir el centro, acotados a su comunidad. */
  readonly municipiosDeLaCcaa = computed(() => {
    const cfg = this.configuracion();
    return (this.catalogo()?.municipios ?? []).filter(m => m.ccaa === cfg?.ccaaCodigo);
  });

  // ── Importación ────────────────────────────────────────────

  previsualizacion = signal<FestivoPrevisto[] | null>(null);
  importando       = signal(false);
  resultadoImport  = signal<ResultadoImportacion | null>(null);

  ngOnInit(): void {
    this.cargando.set(true);
    forkJoin({
      catalogo: this.festivosSvc.getCatalogo(),
      config:   this.festivosSvc.getConfiguracion(),
      festivos: this.festivosSvc.getFestivos(this.anioActivo()),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({ error: () => this.errorConfig.set('No se pudo cargar el calendario.') });
  }

  // ── Calendario del centro ──────────────────────────────────

  cambiarCcaa(codigo: string): void {
    // Cambiar de comunidad invalida el municipio: no es suyo.
    this.guardarConfig(codigo, '');
  }

  cambiarMunicipio(municipio: string): void {
    this.guardarConfig(this.configuracion()?.ccaaCodigo ?? '', municipio);
  }

  private guardarConfig(ccaaCodigo: string, municipio: string): void {
    this.guardandoConfig.set(true);
    this.errorConfig.set(null);
    this.previsualizacion.set(null);
    this.resultadoImport.set(null);

    this.festivosSvc.setConfiguracion({ ccaaCodigo, municipio })
      .pipe(finalize(() => this.guardandoConfig.set(false)))
      .subscribe({
        error: (e: any) => this.errorConfig.set(e?.error?.message ?? 'No se pudo guardar el calendario.'),
      });
  }

  // ── Año ────────────────────────────────────────────────────

  cargarFestivos(): void {
    this.cargando.set(true);
    this.festivosSvc.getFestivos(this.anioActivo())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe();
  }

  cambiarAnio(delta: number): void {
    this.anioActivo.update(a => a + delta);
    this.confirmEliminarId.set(null);
    this.editandoId.set(null);
    this.previsualizacion.set(null);
    this.resultadoImport.set(null);
    this.cargarFestivos();
  }

  // ── Importación ────────────────────────────────────────────

  /**
   * Previsualizar antes de escribir. Importar es idempotente (hay índice único
   * en la tabla), pero ver qué entra antes de que entre es lo que permite
   * cotejarlo con el boletín, que es de donde tiene que salir la verdad.
   */
  previsualizar(): void {
    this.importando.set(true);
    this.resultadoImport.set(null);
    this.festivosSvc.previsualizar(this.anioActivo())
      .pipe(finalize(() => this.importando.set(false)))
      .subscribe({
        next: p => this.previsualizacion.set(p),
        error: () => this.errorConfig.set('No se pudo calcular la previsualización.'),
      });
  }

  confirmarImportacion(): void {
    this.importando.set(true);
    this.festivosSvc.importarCalendario(this.anioActivo())
      .pipe(finalize(() => this.importando.set(false)))
      .subscribe({
        next: res => {
          this.resultadoImport.set(res);
          this.previsualizacion.set(null);
        },
        error: (e: any) => this.errorConfig.set(e?.error?.message ?? 'No se pudo importar el calendario.'),
      });
  }

  cancelarImportacion(): void {
    this.previsualizacion.set(null);
  }

  /** Cuántos de la previsualización ya están, para no prometer de más. */
  readonly previstoNuevo = computed(() => {
    const p = this.previsualizacion();
    if (!p) return 0;
    const yaEstan = new Set(this.festivos().map(f => this.claveDia(f.fecha) + '|' + f.ambito));
    return p.filter(x => !yaEstan.has(this.claveDia(x.fecha) + '|' + x.ambito)).length;
  });

  private claveDia(iso: string): string {
    return iso.slice(0, 10);
  }

  // ── Alta y edición ─────────────────────────────────────────

  toggleFormulario(): void {
    this.mostrarFormulario.update(v => !v);
    this.editandoId.set(null);
    this.errorForm.set(null);
    this.form.set(EMPTY_FORM());
  }

  editar(f: Festivo): void {
    this.editandoId.set(f.id);
    this.mostrarFormulario.set(true);
    this.errorForm.set(null);
    this.form.set({
      fecha: f.fecha.slice(0, 10),
      descripcion: f.descripcion,
      ambito: f.ambito,
      ccaa: f.ccaa,
      municipio: f.municipio,
    });
  }

  patchForm<K extends keyof FormFestivo>(k: K, v: FormFestivo[K]): void {
    this.form.update(f => {
      const next = { ...f, [k]: v };
      if (k === 'ambito') { next.ccaa = ''; next.municipio = ''; }
      // La comunidad de un festivo local la fija su municipio; no se teclea.
      if (k === 'municipio') {
        next.ccaa = this.catalogo()?.municipios.find(m => m.nombre === v)?.ccaa ?? '';
      }
      return next;
    });
  }

  guardarFestivo(): void {
    const f = this.form();
    if (!f.fecha || !f.descripcion.trim()) {
      this.errorForm.set('Fecha y descripción son obligatorias.');
      return;
    }
    if (f.ambito === 'AUTONOMICO' && !f.ccaa) {
      this.errorForm.set('Un festivo autonómico necesita comunidad autónoma.');
      return;
    }
    if (f.ambito === 'LOCAL' && !f.municipio) {
      this.errorForm.set('Un festivo local necesita municipio.');
      return;
    }

    const payload: CreateFestivoPayload = {
      fecha: f.fecha,
      descripcion: f.descripcion.trim(),
      ambito: f.ambito,
    };
    if (f.ambito !== 'NACIONAL') payload.ccaa = f.ccaa;
    if (f.ambito === 'LOCAL')    payload.municipio = f.municipio;

    this.guardando.set(true);
    this.errorForm.set(null);

    const id = this.editandoId();
    const op = id
      ? this.festivosSvc.actualizar(id, payload)
      : this.festivosSvc.crear(payload);

    op.pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.mostrarFormulario.set(false);
          this.editandoId.set(null);
          this.form.set(EMPTY_FORM());
        },
        error: (err: any) => {
          this.errorForm.set(err?.error?.message ?? 'No se pudo guardar el festivo.');
        },
      });
  }

  // ── Borrado ────────────────────────────────────────────────

  pedirConfirmar(id: string): void {
    this.confirmEliminarId.set(id);
  }

  cancelarConfirmar(): void {
    this.confirmEliminarId.set(null);
  }

  eliminar(id: string): void {
    this.eliminandoId.set(id);
    this.confirmEliminarId.set(null);
    this.festivosSvc.eliminar(id)
      .pipe(finalize(() => this.eliminandoId.set(null)))
      .subscribe();
  }

  // ── Presentación ───────────────────────────────────────────

  readonly AMBITO_LABEL: Record<AmbitoFestivo, string> = {
    NACIONAL: 'Nacional',
    AUTONOMICO: 'Autonómico',
    LOCAL: 'Local',
  };

  /**
   * El día de la semana es la columna que de verdad se consulta: determina qué
   * familias pierden sesión ese mes y, por tanto, si el contrato cuadra.
   */
  diaSemana(iso: string): string {
    return DIAS[new Date(iso).getDay()];
  }

  esFinDeSemana(iso: string): boolean {
    const d = new Date(iso).getDay();
    return d === 0 || d === 6;
  }

  /** A quién aplica el festivo, en lenguaje llano. */
  aplicaA(f: Festivo): string {
    if (f.ambito === 'NACIONAL') return 'Todo el país';
    if (f.ambito === 'LOCAL') return f.municipio;
    return this.catalogo()?.ccaa.find(c => c.codigo === f.ccaa)?.nombre ?? f.ccaa;
  }

  /** Un festivo cargado que ya no corresponde al calendario vigente del centro. */
  fueraDelCalendario(f: Festivo): boolean {
    const cfg = this.configuracion();
    if (!cfg) return false;
    if (f.ambito === 'NACIONAL') return false;
    if (f.ambito === 'AUTONOMICO') return f.ccaa !== cfg.ccaaCodigo;
    return f.municipio !== cfg.municipio;
  }
}
