import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions, Plugin } from 'chart.js';
import { finalize, forkJoin } from 'rxjs';
import { FacturasService } from '../../../../services/facturas.service';
import {
  EstadoFactura,
  Factura,
  ESTADO_FACTURA_LABEL,
  MarcarPagadaPayload,
  PreviewGeneracion,
  ResultadoGeneracion,
  SeleccionPack,
  EnvioGestoria,
  PeriodoPendiente,
  PreviewEnvioGestoria,
  ESTADO_ENVIO_LABEL,
  EstadoEnvioGestoria,
} from '../../../../interface/factura.interface';
import { AuthService } from '../../../../services/auth.service';
import {
  MESES_CORTOS,
  OPCIONES_MES,
  esComputable,
  estaCobrada,
  formatEuros,
  mesDePeriodo,
  periodo,
  periodoDeHoy,
  periodoLabel,
  RangoPeriodo,
  TipoRango,
  enRango,
  etiquetaRango,
  rangoAnio,
  rangoMes,
  rangoTrimestre,
  trimestreActual,
  totalCobrado,
  totalFacturado,
  totalPendiente,
  ultimosAnios,
} from '../../../../shared/utils/facturacion.utils';
import {
  CHART_COLORS,
  colorSerie,
  donutCenterPlugin,
  ejeCategorias,
  ejeEuros,
  leyenda,
  tooltipEuros,
} from '../../../../shared/charts/chart-theme';
import {
  EstadoCargaComponent,
  EstadoErrorComponent,
  EstadoVacioComponent,
} from '../../../../shared/components/estado-vista/estado-vista.component';

type Vista = 'listado' | 'analisis' | 'gestoria';

const LINE_OPTS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: leyenda('top'), tooltip: tooltipEuros() },
  scales: { x: ejeCategorias(), y: ejeEuros() },
  elements: {
    line: { tension: 0.4, borderWidth: 2.5 },
    point: { radius: 4, hoverRadius: 6, borderColor: '#fff', borderWidth: 2 },
  },
};

const DONUT_OPTS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: { legend: leyenda('bottom'), tooltip: tooltipEuros() },
};

const BAR_OPTS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: leyenda('top'), tooltip: tooltipEuros() },
  scales: { x: ejeCategorias(), y: ejeEuros() },
};

const DONUT_CENTER = donutCenterPlugin({
  id: 'donutCenterFacturacion',
  etiqueta: 'Total',
  format: (t) => formatEuros(t, 0),
  tamano: 16,
});

/**
 * Facturación del autónomo: el listado de sus facturas y su lectura en gráficos.
 *
 * Antes eran dos pestañas ("Mis facturas" y "Mis ingresos") que pedían el mismo
 * `GET /facturas?anio=` por separado y calculaban los mismos totales con
 * fórmulas distintas — una medía el mes y la otra el año — así que dos pantallas
 * contiguas enseñaban cifras que no cuadraban. Ahora hay una carga y un único
 * juego de KPIs; lo que cambia entre vistas es cómo se leen.
 */
@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BaseChartDirective,
    EstadoCargaComponent,
    EstadoErrorComponent,
    EstadoVacioComponent,
  ],
  templateUrl: './facturacion.component.html',
})
export default class FacturacionComponent implements OnInit {
  private facturasService = inject(FacturasService);
  private auth = inject(AuthService);

  /** Solo el ADMIN puede generar para todo el gabinete. */
  readonly puedeGenerarGlobal = this.auth.isAdmin;

  vista = signal<Vista>('listado');

  cargando = signal(false);
  error = signal<string | null>(null);
  facturas = signal<Factura[]>([]);

  readonly anioActual = new Date().getFullYear();
  readonly anios = ultimosAnios();
  readonly meses = OPCIONES_MES;

  filtroAnio = signal(this.anioActual);
  filtroEstado = signal<EstadoFactura | ''>('');
  filtroClienteId = signal('');

  // ── Periodo ──────────────────────────────────────────────────────────────
  /**
   * El periodo manda dos cosas: qué se ve en la tabla y qué entra en el paquete
   * para la gestoría. Va dentro del año cargado a propósito — si el rango pudiera
   * cruzar años, la lista enseñaría una cosa y el paquete llevaría otra.
   */
  rangoTipo = signal<TipoRango>('trimestre');
  trimestreSel = signal(trimestreActual().trimestre);
  mesSel = signal(new Date().getMonth() + 1);
  mesDesde = signal(1);
  mesHasta = signal(12);

  readonly trimestres = [1, 2, 3, 4];

  readonly rango = computed<RangoPeriodo>(() => {
    const anio = this.filtroAnio();
    switch (this.rangoTipo()) {
      case 'trimestre':
        return rangoTrimestre(anio, this.trimestreSel());
      case 'mes':
        return rangoMes(anio, this.mesSel());
      case 'personalizado':
        return {
          desde: periodo(anio, Math.min(this.mesDesde(), this.mesHasta())),
          hasta: periodo(anio, Math.max(this.mesDesde(), this.mesHasta())),
        };
      default:
        return rangoAnio(anio);
    }
  });

  readonly rangoLabel = computed(() => etiquetaRango(this.rango()));

  // ── Selección múltiple ───────────────────────────────────────────────────
  /** `Set` y no array: son cientos de filas y `includes()` en plantilla es O(n). */
  seleccionadas = signal<Set<string>>(new Set());

  readonly hayCoincidencias = computed(() => this.facturasFiltradas().length > 0);

  readonly todasSeleccionadas = computed(() => {
    const visibles = this.facturasFiltradas();
    const sel = this.seleccionadas();
    return visibles.length > 0 && visibles.every((f) => sel.has(f.id));
  });

  readonly seleccionParcial = computed(
    () => this.seleccionadas().size > 0 && !this.todasSeleccionadas(),
  );

  readonly totalSeleccionado = computed(() => {
    const sel = this.seleccionadas();
    return totalFacturado(this.facturas().filter((f) => sel.has(f.id)));
  });

  // ── Generación ───────────────────────────────────────────────────────────
  modalGenerar = signal(false);
  genAnio = signal(this.anioActual);
  genMes = signal(new Date().getMonth() + 1);
  genSoloMias = signal(true);
  genPreview = signal<PreviewGeneracion | null>(null);
  genResultado = signal<ResultadoGeneracion | null>(null);
  genCargando = signal(false);
  genError = signal<string | null>(null);

  // ── Descarga del paquete ─────────────────────────────────────────────────
  descargandoPack = signal<'zip' | 'excel' | null>(null);
  avisoPack = signal<string | null>(null);

  // ── Gestoría ─────────────────────────────────────────────────────────────
  pendientes = signal<PeriodoPendiente[]>([]);
  historial = signal<EnvioGestoria[]>([]);
  cargandoGestoria = signal(false);

  modalEnviar = signal(false);
  envioPreview = signal<PreviewEnvioGestoria | null>(null);
  enviando = signal(false);
  envioError = signal<string | null>(null);
  envioHecho = signal<EnvioGestoria | null>(null);

  readonly totalPendiente = computed(() =>
    this.pendientes().reduce((s, p) => s + p.total, 0),
  );

  readonly facturasPendientes = computed(() =>
    this.pendientes().reduce((s, p) => s + p.numFacturas, 0),
  );

  /**
   * Signal y no campo de instancia: calculado una sola vez en el constructor,
   * una sesión abierta a través de la medianoche del día 1 seguía enseñando los
   * KPIs del mes anterior.
   */
  private readonly periodoMesActual = signal(periodoDeHoy());

  // ── KPIs — siempre sobre el año traído, nunca sobre lo filtrado ──────────
  private readonly delMesActual = computed(() =>
    this.facturas().filter((f) => f.periodoFacturado === this.periodoMesActual()),
  );

  readonly kpiFacturadoMes = computed(() => totalFacturado(this.delMesActual()));
  readonly kpiCobradoMes = computed(() => totalCobrado(this.delMesActual()));
  readonly kpiPendienteCobro = computed(() => totalPendiente(this.facturas()));
  readonly kpiFacturadoAnio = computed(() => totalFacturado(this.facturas()));
  readonly kpiCobradoAnio = computed(() => totalCobrado(this.facturas()));

  readonly tasaCobro = computed(() => {
    const t = this.kpiFacturadoAnio();
    return t > 0 ? Math.round((this.kpiCobradoAnio() / t) * 100) : 0;
  });

  readonly clientesUnicos = computed(() => {
    const seen = new Set<string>();
    const result: { id: string; nombre: string }[] = [];
    for (const f of this.facturas()) {
      if (!seen.has(f.clienteId)) {
        seen.add(f.clienteId);
        result.push({ id: f.clienteId, nombre: `${f.cliente.nombre} ${f.cliente.apellidos}` });
      }
    }
    return result.sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  // ── Listado ──────────────────────────────────────────────────────────────
  readonly facturasFiltradas = computed(() => {
    const r = this.rango();
    const estado = this.filtroEstado();
    const clienteId = this.filtroClienteId();
    return this.facturas().filter(
      (f) =>
        enRango(f.periodoFacturado, r) &&
        (!estado || f.estado === estado) &&
        (!clienteId || f.clienteId === clienteId),
    );
  });

  /** Lo que suma el conjunto que se está mirando, no el año entero. */
  readonly totalFiltrado = computed(() => totalFacturado(this.facturasFiltradas()));

  readonly hayFiltros = computed(
    () => this.rangoTipo() !== 'anio' || !!this.filtroEstado() || !!this.filtroClienteId(),
  );

  // ── Análisis ─────────────────────────────────────────────────────────────
  private readonly agregadoMensual = computed(() => {
    const facturado = new Array(12).fill(0);
    const cobrado = new Array(12).fill(0);
    for (const f of this.facturas()) {
      if (!esComputable(f)) continue;
      const mes = mesDePeriodo(f.periodoFacturado);
      if (mes === null) continue;
      facturado[mes - 1] += +f.total;
      if (estaCobrada(f)) cobrado[mes - 1] += +f.total;
    }
    return { facturado, cobrado };
  });

  readonly lineData = computed<ChartData<'line'>>(() => {
    const { facturado, cobrado } = this.agregadoMensual();
    return {
      labels: [...MESES_CORTOS.slice(1)],
      datasets: [
        {
          label: 'Facturado',
          data: facturado,
          borderColor: CHART_COLORS.primary,
          backgroundColor: 'rgba(45,74,62,0.10)',
          fill: 'origin',
          pointBackgroundColor: CHART_COLORS.primary,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'Cobrado',
          data: cobrado,
          borderColor: CHART_COLORS.success,
          backgroundColor: 'rgba(47,107,67,0.08)',
          fill: 'origin',
          pointBackgroundColor: CHART_COLORS.success,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    };
  });

  readonly donutData = computed<ChartData<'doughnut'>>(() => {
    const byClient: Record<string, { nombre: string; total: number }> = {};
    for (const f of this.facturas()) {
      if (!esComputable(f)) continue;
      byClient[f.clienteId] ??= {
        nombre: `${f.cliente.nombre} ${f.cliente.apellidos}`,
        total: 0,
      };
      byClient[f.clienteId].total += +f.total;
    }
    const sorted = Object.values(byClient).sort((a, b) => b.total - a.total);
    return {
      labels: sorted.map((c) => c.nombre),
      datasets: [
        {
          data: sorted.map((c) => c.total),
          backgroundColor: sorted.map((_, i) => colorSerie(i)),
          borderColor: '#fff',
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly barData = computed<ChartData<'bar'>>(() => {
    const { facturado, cobrado } = this.agregadoMensual();
    const mesActual = new Date().getMonth();
    const start = (mesActual - 5 + 12) % 12;
    const months6 = Array.from({ length: 6 }, (_, i) => (start + i) % 12);
    return {
      labels: months6.map((i) => MESES_CORTOS[i + 1]),
      datasets: [
        {
          label: 'Facturado',
          data: months6.map((i) => facturado[i]),
          backgroundColor: CHART_COLORS.primary,
          borderRadius: 4,
        },
        {
          label: 'Cobrado',
          data: months6.map((i) => cobrado[i]),
          backgroundColor: CHART_COLORS.success,
          borderRadius: 4,
        },
      ],
    };
  });

  readonly lineOpts = LINE_OPTS;
  readonly donutOpts = DONUT_OPTS;
  readonly barOpts = BAR_OPTS;
  readonly donutPlugins: Plugin<'doughnut'>[] = [DONUT_CENTER];

  // ── Modal marcar pagada ──────────────────────────────────────────────────
  modalPagadaId = signal<string | null>(null);
  fechaPago = signal('');
  metodoPago = signal('');
  guardandoPagada = signal(false);
  errorPagada = signal<string | null>(null);

  // ── Anular ───────────────────────────────────────────────────────────────
  confirmAnularId = signal<string | null>(null);
  anulando = signal(false);

  // ── Loading por fila ─────────────────────────────────────────────────────
  descargandoId = signal<string | null>(null);
  reenviandoId = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  /**
   * Se trae el año entero y el resto de filtros se aplican en local. Los KPIs
   * necesitan a la vez el año completo y el mes en curso, así que filtrar el mes
   * en el servidor dejaba el KPI anual sumando solo el mes seleccionado. Un año
   * de un autónomo son ~300 filas: no compensa una petición por filtro.
   */
  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.facturasService
      .getFacturas({ anio: this.filtroAnio(), soloMias: true })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (data) => this.facturas.set(data),
        error: () => this.error.set('Error al cargar las facturas.'),
      });
  }

  /** Solo el año obliga a volver al servidor. */
  onAnioChange(): void {
    this.filtroClienteId.set('');
    this.seleccionadas.set(new Set());
    this.cargar();
  }

  limpiarFiltros(): void {
    this.rangoTipo.set('anio');
    this.filtroEstado.set('');
    this.filtroClienteId.set('');
  }

  // ── Periodo ──────────────────────────────────────────────────────────────
  setRango(tipo: TipoRango): void {
    this.rangoTipo.set(tipo);
    this.seleccionadas.set(new Set());
  }

  // ── Selección ────────────────────────────────────────────────────────────
  estaSeleccionada(id: string): boolean {
    return this.seleccionadas().has(id);
  }

  toggleSeleccion(id: string): void {
    this.seleccionadas.update((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  /** Marca o desmarca todo lo que se está viendo, no todo lo cargado. */
  toggleTodas(): void {
    const visibles = this.facturasFiltradas();
    this.seleccionadas.set(
      this.todasSeleccionadas() ? new Set() : new Set(visibles.map((f) => f.id)),
    );
  }

  limpiarSeleccion(): void {
    this.seleccionadas.set(new Set());
  }

  // ── Paquete ──────────────────────────────────────────────────────────────
  /**
   * Lo marcado si hay selección; si no, todo el periodo. Es lo que evita tener
   * dos botones distintos para "descargar lo seleccionado" y "descargar el
   * trimestre".
   */
  private seleccionActual(formato: 'zip' | 'excel'): SeleccionPack {
    const sel = this.seleccionadas();
    if (sel.size) return { ids: [...sel], formato };
    const r = this.rango();
    return { periodoDesde: r.desde, periodoHasta: r.hasta, formato };
  }

  descargarPack(formato: 'zip' | 'excel'): void {
    this.descargandoPack.set(formato);
    this.avisoPack.set(null);
    this.facturasService
      .descargarPack(this.seleccionActual(formato))
      .pipe(finalize(() => this.descargandoPack.set(null)))
      .subscribe({
        next: ({ incidencias }) => {
          if (incidencias > 0) {
            this.avisoPack.set(
              `El paquete se ha descargado, pero ${incidencias} ` +
                `${incidencias === 1 ? 'factura no tenía' : 'facturas no tenían'} ` +
                'su PDF disponible. Se archivan solos cada noche: vuelve a intentarlo mañana.',
            );
          }
        },
        error: (err: any) =>
          this.error.set(err?.error?.message ?? 'No se pudo preparar el paquete.'),
      });
  }

  // ── Gestoría ─────────────────────────────────────────────────────────────
  /** La vista de gestoría se carga la primera vez que se abre, no antes. */
  verGestoria(): void {
    this.vista.set('gestoria');
    if (!this.historial().length && !this.pendientes().length) this.cargarGestoria();
  }

  cargarGestoria(): void {
    this.cargandoGestoria.set(true);
    forkJoin([
      this.facturasService.pendientesGestoria(),
      this.facturasService.historialGestoria(),
    ])
      .pipe(finalize(() => this.cargandoGestoria.set(false)))
      .subscribe({
        next: ([pendientes, historial]) => {
          this.pendientes.set(pendientes);
          this.historial.set(historial);
        },
        error: () => this.error.set('No se pudo cargar la información de la gestoría.'),
      });
  }

  /**
   * Abre la previsualización de lo que se mandaría. Nunca se envía sin pasar por
   * aquí: son datos personales saliendo hacia un tercero.
   */
  abrirEnviar(periodo?: PeriodoPendiente): void {
    this.modalEnviar.set(true);
    this.envioPreview.set(null);
    this.envioError.set(null);
    this.envioHecho.set(null);

    const seleccion: SeleccionPack = periodo
      ? { periodoDesde: periodo.periodo, periodoHasta: periodo.periodo }
      : this.seleccionActual('zip');

    this.enviando.set(true);
    this.facturasService
      .previewGestoria(seleccion)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (p) => this.envioPreview.set(p),
        error: (err: any) =>
          this.envioError.set(err?.error?.message ?? 'No se pudo preparar el envío.'),
      });
  }

  cerrarEnviar(): void {
    this.modalEnviar.set(false);
    if (this.envioHecho()) this.cargarGestoria();
  }

  confirmarEnvio(): void {
    const prev = this.envioPreview();
    if (!prev) return;

    this.enviando.set(true);
    this.envioError.set(null);
    this.facturasService
      .enviarAGestoria({
        periodoDesde: prev.periodoDesde,
        periodoHasta: prev.periodoHasta,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: ({ envio }) => {
          this.envioHecho.set(envio);
          this.envioPreview.set(null);
          if (envio.estado === 'ERROR') {
            this.envioError.set(envio.error ?? 'El envío no llegó a salir.');
          }
        },
        error: (err: any) =>
          this.envioError.set(err?.error?.message ?? 'No se pudo enviar el paquete.'),
      });
  }

  estadoEnvioLabel(e: EstadoEnvioGestoria): string {
    return ESTADO_ENVIO_LABEL[e] ?? e;
  }

  // ── Generación ───────────────────────────────────────────────────────────
  abrirGenerar(): void {
    this.modalGenerar.set(true);
    this.genPreview.set(null);
    this.genResultado.set(null);
    this.genError.set(null);
    this.previsualizarGeneracion();
  }

  cerrarGenerar(): void {
    this.modalGenerar.set(false);
    // Si se generó algo, el listado de fuera está desactualizado.
    if (this.genResultado()) this.cargar();
  }

  previsualizarGeneracion(): void {
    this.genCargando.set(true);
    this.genError.set(null);
    this.genResultado.set(null);
    this.facturasService
      .previsualizarGeneracion(this.genAnio(), this.genMes(), this.genSoloMias())
      .pipe(finalize(() => this.genCargando.set(false)))
      .subscribe({
        next: (p) => this.genPreview.set(p),
        error: (err: any) => {
          this.genPreview.set(null);
          this.genError.set(err?.error?.message ?? 'No se pudo consultar el periodo.');
        },
      });
  }

  confirmarGeneracion(): void {
    this.genCargando.set(true);
    this.genError.set(null);
    this.facturasService
      .generarMes(this.genAnio(), this.genMes(), this.genSoloMias())
      .pipe(finalize(() => this.genCargando.set(false)))
      .subscribe({
        next: (r) => {
          this.genResultado.set(r);
          this.genPreview.set(null);
        },
        error: (err: any) =>
          this.genError.set(err?.error?.message ?? 'No se pudieron generar las facturas.'),
      });
  }

  // ── Acciones ─────────────────────────────────────────────────────────────
  abrirModalPagada(id: string): void {
    this.modalPagadaId.set(id);
    this.fechaPago.set(new Date().toISOString().slice(0, 10));
    this.metodoPago.set('');
    this.errorPagada.set(null);
  }

  cerrarModalPagada(): void {
    this.modalPagadaId.set(null);
  }

  confirmarPagada(): void {
    const id = this.modalPagadaId();
    if (!id || !this.fechaPago()) return;
    const payload: MarcarPagadaPayload = {
      fechaPago: this.fechaPago(),
      ...(this.metodoPago() && { metodoPago: this.metodoPago() }),
    };
    this.guardandoPagada.set(true);
    this.errorPagada.set(null);
    this.facturasService
      .marcarPagada(id, payload)
      .pipe(finalize(() => this.guardandoPagada.set(false)))
      .subscribe({
        next: (updated) => {
          this.reemplazar(updated);
          this.cerrarModalPagada();
        },
        error: (err: any) =>
          this.errorPagada.set(err?.error?.message ?? 'Error al marcar como pagada.'),
      });
  }

  solicitarAnular(id: string): void {
    this.confirmAnularId.set(id);
  }

  cancelarAnular(): void {
    this.confirmAnularId.set(null);
  }

  confirmarAnular(id: string): void {
    this.anulando.set(true);
    this.facturasService
      .anular(id)
      .pipe(
        finalize(() => {
          this.anulando.set(false);
          this.confirmAnularId.set(null);
        }),
      )
      .subscribe({
        next: (updated) => this.reemplazar(updated),
        error: () => this.error.set('Error al anular la factura.'),
      });
  }

  descargarPdf(id: string): void {
    this.descargandoId.set(id);
    this.facturasService
      .descargarPdf(id)
      .pipe(finalize(() => this.descargandoId.set(null)))
      .subscribe({ error: () => this.error.set('Error al generar el PDF de la factura.') });
  }

  /**
   * El reenvío devuelve `{ enviado }`, no la factura, así que hay que refrescar
   * para que se actualice el indicador de email. Es la única acción que no puede
   * parchear la lista en sitio.
   */
  reenviarEmail(id: string): void {
    this.reenviandoId.set(id);
    this.facturasService
      .reenviarEmail(id)
      .pipe(finalize(() => this.reenviandoId.set(null)))
      .subscribe({
        next: () => this.cargar(),
        error: () => this.error.set('Error al reenviar el email.'),
      });
  }

  private reemplazar(actualizada: Factura): void {
    this.facturas.update((list) =>
      list.map((f) => (f.id === actualizada.id ? actualizada : f)),
    );
  }

  // ── Helpers de plantilla ─────────────────────────────────────────────────
  readonly periodoLabel = periodoLabel;

  estadoLabel(e: EstadoFactura): string {
    return ESTADO_FACTURA_LABEL[e] ?? e;
  }
}
