import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ContratosService } from '../../../../services/contratos.service';
import {
  ContratoServicio,
  EstadoContrato,
  diaLabel,
  tipoLabel,
  tipoColor,
  tipoBg,
  estadoContratoLabel,
} from '../../../../interface/contrato.interface';
import {
  EstadoCargaComponent,
  EstadoErrorComponent,
  EstadoVacioComponent,
} from '../../../../shared/components/estado-vista/estado-vista.component';

/** Un contrato vigente compromete cuota todos los meses; uno cerrado, no. */
const VIGENTES: EstadoContrato[] = ['ACTIVO', 'BORRADOR'];

@Component({
  selector: 'app-mis-contratos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    EstadoCargaComponent,
    EstadoErrorComponent,
    EstadoVacioComponent,
  ],
  templateUrl: './mis-contratos.component.html',
})
export default class MisContratosComponent implements OnInit {
  private contratosService = inject(ContratosService);

  cargando = signal(false);
  error = signal<string | null>(null);
  contratos = signal<ContratoServicio[]>([]);
  mostrarHistorial = signal(false);
  descargandoId = signal<string | null>(null);

  filtroEstado = signal<EstadoContrato | ''>('');
  filtroClienteId = signal('');
  filtroTipo = signal('');

  readonly activos = computed(() =>
    this.contratos().filter((c) => VIGENTES.includes(c.estado)),
  );
  readonly historico = computed(() =>
    this.contratos().filter((c) => !VIGENTES.includes(c.estado)),
  );

  /**
   * Lo que este autónomo tiene comprometido al mes con sus contratos activos:
   * el número que quiere ver al abrir la pestaña y que antes no aparecía por
   * ninguna parte — había que sumar las tarjetas a ojo.
   */
  readonly cuotaMensualComprometida = computed(() =>
    this.activos()
      .filter((c) => c.estado === 'ACTIVO')
      .reduce((s, c) => s + +c.cuotaMensual, 0),
  );

  readonly sesionesProgramadas = computed(() =>
    this.activos().reduce((s, c) => s + (c._count?.sesiones ?? 0), 0),
  );

  readonly clientesUnicos = computed(() => {
    const seen = new Set<string>();
    const result: { id: string; nombre: string }[] = [];
    for (const c of this.contratos()) {
      if (!seen.has(c.clienteId)) {
        seen.add(c.clienteId);
        result.push({ id: c.clienteId, nombre: `${c.cliente.nombre} ${c.cliente.apellidos}` });
      }
    }
    return result.sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  readonly tiposUnicos = computed(() =>
    [...new Set(this.contratos().map((c) => c.tipoSesion as string))].sort(),
  );

  readonly activosFiltrados = computed(() => {
    const estado = this.filtroEstado();
    const clienteId = this.filtroClienteId();
    const tipo = this.filtroTipo();
    return this.activos().filter(
      (c) =>
        (!estado || c.estado === estado) &&
        (!clienteId || c.clienteId === clienteId) &&
        (!tipo || c.tipoSesion === tipo),
    );
  });

  readonly totalFiltrado = computed(() =>
    this.activosFiltrados().reduce((s, c) => s + +c.cuotaMensual, 0),
  );

  readonly hayFiltros = computed(
    () => !!this.filtroEstado() || !!this.filtroClienteId() || !!this.filtroTipo(),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.contratosService
      .getContratos(true)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (data) => this.contratos.set(data),
        error: () => this.error.set('Error al cargar los contratos.'),
      });
  }

  limpiarFiltros(): void {
    this.filtroEstado.set('');
    this.filtroClienteId.set('');
    this.filtroTipo.set('');
  }

  descargarPdf(id: string): void {
    this.descargandoId.set(id);
    this.contratosService
      .descargarPdf(id)
      .pipe(finalize(() => this.descargandoId.set(null)))
      .subscribe({ error: () => this.error.set('Error al generar el PDF del contrato') });
  }

  /** "Lun 10:00 · Mié 17:30" — el horario semanal en una celda. */
  horarioResumen(c: ContratoServicio): string {
    return (c.slots ?? [])
      .slice()
      .sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio))
      .map((s) => `${diaLabel(s.diaSemana).slice(0, 3)} ${s.horaInicio}`)
      .join(' · ');
  }

  hayOnline(c: ContratoServicio): boolean {
    return (c.slots ?? []).some((s) => s.modalidad === 'ONLINE');
  }

  readonly diaLabel = diaLabel;
  readonly tipoLabel = tipoLabel;
  readonly tipoColor = tipoColor;
  readonly tipoBg = tipoBg;
  readonly estadoLabel = estadoContratoLabel;
}
