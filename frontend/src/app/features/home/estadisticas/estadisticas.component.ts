import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { startOfWeek, startOfMonth, endOfDay, subMonths } from 'date-fns';

import { formatMinutosHoras } from '../../../shared/utils/date';
import { DashboardService } from '../../../services/dashboard.service';
import { TrabajadorService } from '../../../services/trabajadores.service';
import { AuthService } from '../../../services/auth.service';
import { EstadisticasAvanzadas } from '../../../interface/dashboard.interface';
import {
  HorasTrabajadasResponse,
  TIPO_EVENTO_CONFIG,
} from '../../../interface/evento-agenda.interface';
import { tipoColor, tipoLabel } from '../../../interface/contrato.interface';
import { EstadoErrorComponent } from '../../../shared/components/estado-vista/estado-vista.component';
import {
  CHART_COLORS,
  donutCenterPlugin,
  ejeCategorias,
  ejeNumerico,
  leyenda,
  tooltipBase,
} from '../../../shared/charts/chart-theme';

type Rango = 'semana' | 'mes' | '3meses';

// El color y la etiqueta de cada tipo de terapia salen de `contrato.interface`,
// y la paleta y las piezas de Chart.js de `shared/charts/chart-theme`. Aquí
// había copias de las dos cosas: una tabla de colores por terapia con LOGOPEDIA
// y NEUROPSICOLOGIA intercambiadas respecto a la agenda, y un tema entero
// (fuente, paleta, tooltip, plugin del donut) paralelo al compartido.

/**
 * Configuración de cada actividad de la jornada.
 *
 * `SESION_CLINICA` no es un `TipoEvento` —no es un evento de agenda, es la
 * sesión misma—, y por eso esto se copió entero en su día. Se añade a la fuente
 * en lugar de reescribirla: las etiquetas de la copia ya se habían separado de
 * las de la agenda ("Coordinación equipo" frente a "Coordinación de equipo").
 */
const CONFIG_JORNADA: Record<string, { label: string; color: string; icon: string }> = {
  SESION_CLINICA: {
    label: 'Sesiones clínicas',
    color: CHART_COLORS.primary,
    icon: 'bi-heart-pulse',
  },
  ...TIPO_EVENTO_CONFIG,
};

const CONFIG_JORNADA_FALLBACK = { color: CHART_COLORS.muted, icon: 'bi-circle' };

// ── Opciones estáticas (no cambian, se definen una vez) ─────────────────────

const LINE_OPTS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend:  { display: false },
    tooltip: tooltipBase(),
  },
  scales: {
    x: ejeCategorias(),
    y: { display: false, min: 0 },
  },
  elements: {
    line:  { tension: 0.4, borderWidth: 2.5 },
    point: {
      radius: 4,
      hoverRadius: 6,
      backgroundColor: CHART_COLORS.primary,
      borderColor: CHART_COLORS.surface,
      borderWidth: 2,
    },
  },
};

const DONUT_OPTS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend:  leyenda('bottom'),
    tooltip: tooltipBase(),
  },
};

// La leyenda compartida no separa las etiquetas arriba; estas barras sí lo
// necesitan porque llevan tres series.
const LEYENDA_BARRAS = leyenda('top');

const BAR_OPTS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend:  { ...LEYENDA_BARRAS, labels: { ...LEYENDA_BARRAS.labels, padding: 16 } },
    tooltip: tooltipBase(),
  },
  scales: {
    x: { ...ejeCategorias(), stacked: true },
    y: { ...ejeNumerico(), stacked: true },
  },
};

// ────────────────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, EstadoErrorComponent],
  templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit {
  private dashboardSvc    = inject(DashboardService);
  private trabajadoresSvc = inject(TrabajadorService);
  protected auth          = inject(AuthService);

  // ── State ──────────────────────────────────────────────────────────────
  datos        = signal<EstadisticasAvanzadas | null>(null);
  isLoading    = signal(false);
  error        = signal<string | null>(null);
  rangoActivo  = signal<Rango>('mes');
  trabajadorId = signal('');

  /** El servicio ya cachea la lista en su propio signal. */
  readonly trabajadores = this.trabajadoresSvc.trabajadores;

  protected canVerTodos = computed(() => this.auth.isAdmin() || this.auth.isRecep());

  readonly rangos: { key: Rango; label: string }[] = [
    { key: 'semana',  label: 'Esta semana' },
    { key: 'mes',     label: 'Este mes'    },
    { key: '3meses',  label: '3 meses'    },
  ];

  isEmpty = computed(() => {
    const d = this.datos();
    return !this.isLoading() && d !== null && d.resumen.totalSesiones === 0;
  });

  topMaxSesiones = computed(() => {
    const d = this.datos();
    if (!d || !d.topClientes.length) return 1;
    return Math.max(...d.topClientes.map(c => c.total));
  });

  // ── Chart data (signals → driven by effect) ────────────────────────────
  lineData  = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  donutData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
  barData   = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  // ── Horas trabajadas ─────────────────────────────────────────────────
  horasData      = signal<HorasTrabajadasResponse | null>(null);
  horasBarData   = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  isLoadingHoras = signal(false);

  /** Minutos clínicos del periodo. La plantilla los pedía haciendo la cuenta. */
  readonly minutosClinicos = computed(() => {
    const t = this.horasData()?.totales;
    return t ? t.horasClinicas * 60 + t.minutosClinicas : 0;
  });

  readonly minutosNoClinicos = computed(() => {
    const t = this.horasData()?.totales;
    return t ? t.horasNoClinicas * 60 + t.minutosNoClinicas : 0;
  });

  readonly desgloseConPorcentaje = computed(() => {
    const h = this.horasData();
    if (!h?.desgloseTipo?.length) return [];
    const total = h.desgloseTipo.reduce((a, d) => a + d.minutos, 0);
    if (total === 0) return [];
    return h.desgloseTipo.map(d => ({
      ...d,
      pct: Math.round((d.minutos / total) * 100),
      config: CONFIG_JORNADA[d.tipo] ?? { label: d.tipo, ...CONFIG_JORNADA_FALLBACK },
    }));
  });

  // ── Exponer opciones y plugins al template ─────────────────────────────
  readonly lineOpts   = LINE_OPTS;
  readonly donutOpts  = DONUT_OPTS;
  readonly barOpts    = BAR_OPTS;
  readonly donutPlugins = [donutCenterPlugin({ id: 'donutCenterEstadisticas', tamano: 22 })];

  readonly horasBarOpts: ChartOptions<'bar'> = {
    ...BAR_OPTS,
    scales: {
      ...BAR_OPTS.scales,
      y: { ...ejeNumerico('h'), stacked: true },
    },
  };

  constructor() {
    effect(() => {
      const d = this.datos();
      if (!d || this.isEmpty()) return;
      this.lineData.set(this.buildLine(d));
      this.donutData.set(this.buildDonut(d));
      this.barData.set(this.buildBar(d));
    });
    effect(() => {
      const h = this.horasData();
      if (!h) return;
      this.horasBarData.set(this.buildHorasBar(h));
    });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Solo ADMIN y RECEP pueden mirar los datos de otro: el backend impone su
    // propio userId al resto, así que para ellos el selector no tiene sentido.
    if (this.canVerTodos()) this.trabajadoresSvc.getTrabajadores().subscribe();
    this.cargar();
  }

  // ── Actions ───────────────────────────────────────────────────────────
  setRango(rango: Rango): void {
    this.rangoActivo.set(rango);
    this.cargar();
  }

  onTrabajadorChange(): void { this.cargar(); }

  // ── Data loading ──────────────────────────────────────────────────────
  cargar(): void {
    this.isLoading.set(true);
    this.isLoadingHoras.set(true);
    this.error.set(null);
    this.datos.set(null);
    this.horasData.set(null);

    const hasta = endOfDay(new Date());
    const desde = this.getDesde(this.rangoActivo());
    const tId   = this.trabajadorId() || undefined;

    forkJoin([
      this.dashboardSvc.getEstadisticasAvanzadas(desde, hasta, tId),
      this.dashboardSvc.getHorasHistoricas(desde, hasta, tId),
    ]).subscribe({
      next: ([d, h]) => {
        this.datos.set(d);
        this.horasData.set(h);
        this.isLoading.set(false);
        this.isLoadingHoras.set(false);
      },
      // Sin esto, un fallo de red dejaba `datos()` en null y la pantalla se veía
      // igual que un periodo sin sesiones: el usuario concluía que no había
      // datos cuando lo que había era un error.
      error: (err) => {
        this.error.set(
          err?.error?.message ?? 'No se han podido cargar las estadísticas.',
        );
        this.isLoading.set(false);
        this.isLoadingHoras.set(false);
      },
    });
  }

  private getDesde(rango: Rango): Date {
    const hoy = new Date();
    if (rango === 'semana') return startOfWeek(hoy, { weekStartsOn: 1 });
    if (rango === 'mes')    return startOfMonth(hoy);
    return subMonths(hoy, 3);
  }

  // ── Chart data builders ───────────────────────────────────────────────
  private buildLine(d: EstadisticasAvanzadas): ChartData<'line'> {
    return {
      labels:   d.evolucion.map(e => e.semana),
      datasets: [{
        label:           'Sesiones',
        data:            d.evolucion.map(e => e.total),
        borderColor:     CHART_COLORS.primary,
        backgroundColor: 'rgba(45,74,62,0.10)',
        fill:            'origin',
        tension:         0.4,
        borderWidth:     2.5,
        pointBackgroundColor:  CHART_COLORS.primary,
        pointBorderColor:      CHART_COLORS.surface,
        pointBorderWidth:      2,
        pointRadius:           4,
        pointHoverRadius:      6,
      }],
    };
  }

  private buildDonut(d: EstadisticasAvanzadas): ChartData<'doughnut'> {
    const sorted = [...d.distribucion].sort((a, b) => b.cantidad - a.cantidad);
    return {
      labels:   sorted.map(i => tipoLabel(i.tipo)),
      datasets: [{
        data:            sorted.map(i => i.cantidad),
        backgroundColor: sorted.map(i => tipoColor(i.tipo)),
        borderColor:     CHART_COLORS.surface,
        borderWidth:     3,
        hoverBorderColor: CHART_COLORS.surface,
        hoverOffset:     6,
      }],
    };
  }

  private buildBar(d: EstadisticasAvanzadas): ChartData<'bar'> {
    return {
      labels: d.sesionesPorEstado.map(s => s.semana),
      datasets: [
        { label: 'Completadas', data: d.sesionesPorEstado.map(s => s.completadas), backgroundColor: CHART_COLORS.success,   borderRadius: 3 },
        { label: 'Programadas', data: d.sesionesPorEstado.map(s => s.programadas), backgroundColor: CHART_COLORS.secondary, borderRadius: 3 },
        { label: 'Canceladas',  data: d.sesionesPorEstado.map(s => s.canceladas),  backgroundColor: CHART_COLORS.danger,    borderRadius: 3 },
      ],
    };
  }

  private buildHorasBar(h: HorasTrabajadasResponse): ChartData<'bar'> {
    return {
      labels: h.semanas.map(s => s.labelSemana),
      datasets: [
        {
          label: 'Horas clínicas',
          data: h.semanas.map(s => Math.round((s.minutosClinicas / 60) * 10) / 10),
          backgroundColor: CHART_COLORS.primary,
          borderRadius: 3,
        },
        {
          label: 'Admin/Coordinación',
          data: h.semanas.map(s => Math.round((s.minutosNoClinicas / 60) * 10) / 10),
          backgroundColor: CHART_COLORS.muted,
          borderRadius: 3,
        },
      ],
    };
  }

  /**
   * Un único formateador. Había dos: este, importado, y una copia local que se
   * diferenciaba solo en omitir el "0h" por debajo de la hora — comportamiento
   * que ahora tiene el compartido.
   */
  readonly formatHoras = formatMinutosHoras;

  // ── View helpers ──────────────────────────────────────────────────────
  getInitials(nombre: string, apellidos: string): string {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  }

  getBarWidth(total: number): number {
    const max = this.topMaxSesiones();
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }
}
