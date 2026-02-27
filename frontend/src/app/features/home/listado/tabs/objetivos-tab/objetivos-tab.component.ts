import { Component, computed, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClientesService } from '../../../../../services/cliente.service';
import { ObjetivosService } from '../../../../../services/objetivos.service';
import { GasService } from '../../../../../services/gas.service';
import { ObjetivoGeneral, AreaDesarrollo } from '../../../../../interface/objetivo-general.interface';
import {
  ResumenObjetivoGAS,
  SetDescripcionesNivelesDto,
  GAS_LABELS,
  GAS_NIVELES,
} from '../../../../../interface/gas.interface';

@Component({
  standalone: true,
  selector: 'app-objetivos-tab',
  imports: [CommonModule, FormsModule],
  templateUrl: './objetivos-tab.component.html',
})
export class ObjetivosTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientesSvc = inject(ClientesService);
  private objetivosSvc = inject(ObjetivosService);
  private gasSvc = inject(GasService);

  // Constantes para la template
  readonly GAS_LABELS = GAS_LABELS;
  readonly GAS_NIVELES = GAS_NIVELES;

  // Signals del servicio (igual que antes)
  objetivosCliente = this.clientesSvc.objetivos;
  estadisticas = this.clientesSvc.estadisticasObjetivos;
  todasLasAreas = this.objetivosSvc.areas;
  todosLosObjetivos = this.objetivosSvc.objetivosGenerales;

  // Estado local (igual que antes)
  clienteId = signal<string>('');
  cargando = signal(false);
  modoEdicion = signal(false);
  objetivosSeleccionados = signal<string[]>([]);

  // ── NUEVO: Estado del panel GAS ─────────────────────────────
  objetivoGasActivoId = signal<string | null>(null);   // clienteObjetivoId seleccionado
  resumenGas = signal<ResumenObjetivoGAS | null>(null); // datos cargados del backend
  cargandoGas = signal(false);
  modoGas = signal<'ver' | 'definir' | 'evaluar'>('ver');

  // Formulario definir niveles
  formNiveles = signal<Record<number, string>>({ [-2]: '', [-1]: '', [0]: '', [1]: '', [2]: '' });

  // Formulario nueva evaluación
  nuevaEval = signal<{ nivel: number | null; notas: string }>({ nivel: null, notas: '' });
  // ────────────────────────────────────────────────────────────

  // Computed (igual que antes)
  objetivosAgrupados = computed(() => {
    const objetivos = this.objetivosCliente()?.objetivos || [];
    const areas = this.todasLasAreas();
    return areas
      .map((area) => ({
        area: area.nombre,
        color: area.color,
        objetivos: objetivos.filter((obj) => obj.area === area.nombre),
      }))
      .filter((grupo) => grupo.objetivos.length > 0);
  });

  objetivosDisponibles = computed(() => {
    const asignados = this.objetivosCliente()?.objetivos || [];
    const asignadosIds = asignados.map((o) => o.objetivoGeneralId);
    return this.todosLosObjetivos().filter((obj) => !asignadosIds.includes(obj.id));
  });

  // ============================================================
  // CICLO DE VIDA
  // ============================================================

  ngOnInit() {
    this.route.parent?.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.clienteId.set(id);
        this.cargarDatos();
      }
    });
  }

  cargarDatos() {
    this.cargando.set(true);
    this.clientesSvc.getObjetivosCliente(this.clienteId()).subscribe({
      next: () => {},
      error: () => this.cargando.set(false),
    });
    this.clientesSvc.getEstadisticasObjetivos(this.clienteId()).subscribe({
      next: () => this.cargando.set(false),
      error: () => this.cargando.set(false),
    });
    this.objetivosSvc.getAreas().subscribe();
    this.objetivosSvc.getObjetivosGenerales().subscribe();
  }

  // ============================================================
  // GESTIÓN DE OBJETIVOS (igual que antes)
  // ============================================================

  activarModoEdicion() {
    this.modoEdicion.set(true);
    const objetivosActuales = this.objetivosCliente()?.objetivos || [];
    this.objetivosSeleccionados.set(objetivosActuales.map((o) => o.id));
    this.cerrarPanelGas(); // cerrar panel GAS si estaba abierto
  }

  cancelarEdicion() {
    this.modoEdicion.set(false);
    this.objetivosSeleccionados.set([]);
  }

  toggleObjetivo(objetivoId: string) {
    this.objetivosSeleccionados.update((prev) =>
      prev.includes(objetivoId) ? prev.filter((id) => id !== objetivoId) : [...prev, objetivoId],
    );
  }

  esObjetivoSeleccionado(objetivoId: string): boolean {
    return this.objetivosSeleccionados().includes(objetivoId);
  }

  getObjetivosPorArea(areaId: string) {
    return this.todosLosObjetivos().filter((obj) => obj.areaDesarrolloId === areaId);
  }

  guardarCambios() {
    this.cargando.set(true);
    const objetivosActuales = this.objetivosCliente()?.objetivos.map((o) => o.id) || [];
    const objetivosNuevos = this.objetivosSeleccionados();
    const paraAgregar = objetivosNuevos.filter((id) => !objetivosActuales.includes(id));
    const paraQuitar = objetivosActuales.filter((id) => !objetivosNuevos.includes(id));

    if (paraAgregar.length > 0) {
      this.clientesSvc
        .asignarObjetivos(this.clienteId(), { objetivosGeneralesIds: paraAgregar })
        .subscribe({
          next: () => this.procesarQuitarObjetivos(paraQuitar),
          error: () => this.cargando.set(false),
        });
    } else {
      this.procesarQuitarObjetivos(paraQuitar);
    }
  }

  private procesarQuitarObjetivos(paraQuitar: string[]) {
    if (paraQuitar.length === 0) { this.finalizarEdicion(); return; }
    let completados = 0;
    paraQuitar.forEach((objId) => {
      this.clientesSvc.desasignarObjetivo(this.clienteId(), objId).subscribe({
        next: () => { if (++completados === paraQuitar.length) this.finalizarEdicion(); },
        error: () => { if (++completados === paraQuitar.length) this.finalizarEdicion(); },
      });
    });
  }

  private finalizarEdicion() {
    this.cargarDatos();
    this.modoEdicion.set(false);
    this.objetivosSeleccionados.set([]);
  }

  // ============================================================
  // PANEL GAS — integrado dentro de cada objetivo
  // ============================================================

  abrirPanelGas(clienteObjetivoId: string): void {
    // Si ya está abierto el mismo, cerrarlo (toggle)
    if (this.objetivoGasActivoId() === clienteObjetivoId) {
      this.cerrarPanelGas();
      return;
    }

    this.objetivoGasActivoId.set(clienteObjetivoId);
    this.modoGas.set('ver');
    this.cargandoGas.set(true);

    this.gasSvc.getResumenObjetivo(clienteObjetivoId).subscribe({
      next: (resumen) => {
        this.resumenGas.set(resumen);
        this.cargandoGas.set(false);
        // Prerellenar form de niveles si ya están definidos
        if (resumen.nivelesDefinidos) {
          const niveles: Record<number, string> = { [-2]: '', [-1]: '', [0]: '', [1]: '', [2]: '' };
          resumen.niveles.forEach((n: any) => (niveles[n.nivel] = n.descripcion));
          this.formNiveles.set(niveles);
        } else {
          this.formNiveles.set({ [-2]: '', [-1]: '', [0]: '', [1]: '', [2]: '' });
        }
      },
      error: () => this.cargandoGas.set(false),
    });
  }

  cerrarPanelGas(): void {
    this.objetivoGasActivoId.set(null);
    this.resumenGas.set(null);
    this.modoGas.set('ver');
  }

  // Definir niveles
  activarModoDefinir(): void { this.modoGas.set('definir'); }

  setDescripcionNivel(nivel: number, texto: string): void {
    this.formNiveles.update((f) => ({ ...f, [nivel]: texto }));
  }

  guardarNiveles(): void {
    const id = this.objetivoGasActivoId();
    if (!id) return;
    const dto: SetDescripcionesNivelesDto = {
      niveles: GAS_NIVELES.map((n) => ({ nivel: n, descripcion: this.formNiveles()[n] || '' })),
    };
    this.cargandoGas.set(true);
    this.gasSvc.setDescripcionesNiveles(id, dto).subscribe({
      next: () => {
        this.gasSvc.getResumenObjetivo(id).subscribe((r) => {
          this.resumenGas.set(r);
          this.cargandoGas.set(false);
          this.modoGas.set('ver');
        });
      },
      error: () => this.cargandoGas.set(false),
    });
  }

  // Evaluar
  activarModoEvaluar(): void {
    this.nuevaEval.set({ nivel: null, notas: '' });
    this.modoGas.set('evaluar');
  }

  setNivelEval(nivel: number): void {
    this.nuevaEval.update((e) => ({ ...e, nivel }));
  }

  setNotasEval(notas: string): void {
    this.nuevaEval.update((e) => ({ ...e, notas }));
  }

  guardarEvaluacion(): void {
    const id = this.objetivoGasActivoId();
    const ev = this.nuevaEval();
    if (!id || ev.nivel === null) return;

    this.cargandoGas.set(true);
    this.gasSvc.createEvaluacion(id, { nivel: ev.nivel, notas: ev.notas || undefined }).subscribe({
      next: () => {
        this.gasSvc.getResumenObjetivo(id).subscribe((r) => {
          this.resumenGas.set(r);
          this.cargandoGas.set(false);
          this.modoGas.set('ver');
          // Refrescar la lista para que se actualice el badge de nivel
          this.clientesSvc.getObjetivosCliente(this.clienteId()).subscribe();
        });
      },
      error: () => this.cargandoGas.set(false),
    });
  }

  eliminarEvaluacion(evaluacionId: string): void {
    if (!confirm('¿Eliminar esta evaluación del historial?')) return;
    const id = this.objetivoGasActivoId();
    if (!id) return;
    this.gasSvc.deleteEvaluacion(evaluacionId).subscribe({
      next: () => this.gasSvc.getResumenObjetivo(id).subscribe((r) => this.resumenGas.set(r)),
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================

  getNivelShort(nivel: number | null): string {
    if (nivel === null) return '—';
    return ({ [-2]: '-2', [-1]: '-1', [0]: '0', [1]: '+1', [2]: '+2' } as any)[nivel] ?? `${nivel}`;
  }

  getNivelColor(nivel: number | null): string {
    if (nivel === null) return '#6c757d';
    return GAS_LABELS[nivel]?.color ?? '#6c757d';
  }

  getNivelBg(nivel: number | null): string {
    if (nivel === null) return '#f8f9fa';
    return GAS_LABELS[nivel]?.bg ?? '#f8f9fa';
  }

  getDescripcionDeNivel(nivel: number): string {
    return this.resumenGas()?.niveles.find((n) => n.nivel === nivel)?.descripcion ?? '';
  }
}

export default ObjetivosTabComponent;