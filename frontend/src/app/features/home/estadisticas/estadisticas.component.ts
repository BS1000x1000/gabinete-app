import { Component, inject, signal, computed, effect, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions, Plugin } from 'chart.js';
import { forkJoin, map } from 'rxjs';
import { startOfWeek, startOfMonth, endOfDay, subMonths } from 'date-fns';

import { formatMinutosHoras } from '../../../shared/utils/date';
import { DashboardService } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment.development';
import { EstadisticasAvanzadas } from '../../../interface/dashboard.interface';
import { ResumenHoras } from '../../../interface/evento-agenda.interface';

type Rango = 'semana' | 'mes' | '3meses';

const FONT  = 'Plus Jakarta Sans, sans-serif';
const P     = '#2d4a3e';   // primary lila
const S     = '#3a5c74';   // secondary azul
const OK    = '#2f6b43';   // success verde
const WARN  = '#8a6018';   // warning naranja
const ERR   = '#96382e';   // danger rojo
const MUTED = '#798d82';
const TEAL  = '#3a6b63';

const TIPO_CONFIG: Record<string, { label: string; color: string }> = {
  PEDAGOGIA:           { label: 'Pedagogía',       color: P    },
  LOGOPEDIA:           { label: 'Logopedia',        color: S    },
  NEUROPSICOLOGIA:     { label: 'Neuropsicología',  color: OK   },
  TERAPIA_OCUPACIONAL: { label: 'T. Ocupacional',   color: WARN },
  EVALUACION:          { label: 'Evaluación',       color: MUTED },
  REUNION_COLEGIO:     { label: 'Reunión colegio',  color: TEAL },
};

const TIPO_JORNADA_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  SESION_CLINICA:           { label: 'Sesiones clínicas',       color: P,       icon: 'bi-heart-pulse' },
  COORDINACION_EQUIPO:      { label: 'Coordinación equipo',     color: '#6b5a8a', icon: 'bi-people-fill' },
  COORDINACION_COLEGIO:     { label: 'Coordinación colegio',    color: '#3a5c74', icon: 'bi-building' },
  COORDINACION_PROFESIONAL: { label: 'Coordinación profesional',color: TEAL,    icon: 'bi-person-lines-fill' },
  TIEMPO_ADMINISTRACION:    { label: 'Administración',          color: '#556d62', icon: 'bi-clipboard2-check' },
  FORMACION:                { label: 'Formación',               color: WARN,    icon: 'bi-mortarboard' },
  OTRO:                     { label: 'Otro',                    color: MUTED,   icon: 'bi-calendar-event' },
};

// Plugin: texto central en el donut
const DONUT_CENTER_PLUGIN: Plugin<'doughnut'> = {
  id: 'donutCenter',
  beforeDraw(chart) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;
    const total = (data.datasets[0].data as number[]).reduce((a, b) => a + b, 0);
    const cx = chartArea.left + (chartArea.right  - chartArea.left) / 2;
    const cy = chartArea.top  + (chartArea.bottom - chartArea.top)  / 2;
    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 22px ${FONT}`;
    ctx.fillStyle = P;
    ctx.fillText(total.toString(), cx, cy - 10);
    ctx.font = `500 11px ${FONT}`;
    ctx.fillStyle = MUTED;
    ctx.fillText('Total', cx, cy + 10);
    ctx.restore();
  },
};

const TOOLTIP_OPTS = {
  backgroundColor: '#23322b',
  titleFont: { family: FONT, size: 12, weight: 600 as const },
  bodyFont:  { family: FONT, size: 12 },
  padding: 10,
  cornerRadius: 8,
  displayColors: true,
  boxWidth: 10,
  boxHeight: 10,
};

// ── Opciones estáticas (no cambian, se definen una vez) ─────────────────────

const LINE_OPTS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend:  { display: false },
    tooltip: TOOLTIP_OPTS,
  },
  scales: {
    x: {
      grid:   { display: false },
      border: { display: false },
      ticks:  { font: { family: FONT, size: 11 }, color: '#798d82' },
    },
    y: { display: false, min: 0 },
  },
  elements: {
    line:  { tension: 0.4, borderWidth: 2.5 },
    point: { radius: 4, hoverRadius: 6, backgroundColor: P, borderColor: '#fff', borderWidth: 2 },
  },
};

const DONUT_OPTS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: FONT, size: 11 }, boxWidth: 10, boxHeight: 10, padding: 12 },
    },
    tooltip: TOOLTIP_OPTS,
  },
};

const BAR_OPTS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      align:    'start',
      labels: { font: { family: FONT, size: 11 }, boxWidth: 10, boxHeight: 10, padding: 16 },
    },
    tooltip: TOOLTIP_OPTS,
  },
  scales: {
    x: {
      stacked: true,
      grid:    { display: false },
      border:  { display: false },
      ticks:   { font: { family: FONT, size: 11 }, color: '#798d82' },
    },
    y: {
      stacked: true,
      border:  { display: false },
      grid:    { color: '#f5f5f5' },
      ticks:   { font: { family: FONT, size: 11 }, color: '#798d82' },
    },
  },
};

// ────────────────────────────────────────────────────────────────────────────

interface Trabajador { id: string; nombre: string; apellidos: string; }
interface WrappedResponse<T> { data: T; }
interface DesgloseTipoItem { tipo: string; minutos: number; }

interface HorasTrabajadasResponse {
  semanas: Array<{
    semana: string;
    labelSemana: string;
    minutosClinicas: number;
    minutosNoClinicas: number;
  }>;
  totales: ResumenHoras;
  desgloseTipo: DesgloseTipoItem[];
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './estadisticas.component.html',
})
export class EstadisticasComponent implements OnInit {
  private dashboardSvc = inject(DashboardService);
  protected auth       = inject(AuthService);
  private http         = inject(HttpClient);

  // ── State ──────────────────────────────────────────────────────────────
  datos        = signal<EstadisticasAvanzadas | null>(null);
  isLoading    = signal(false);
  rangoActivo  = signal<Rango>('mes');
  trabajadorId = '';
  trabajadores = signal<Trabajador[]>([]);

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
  lineData  = signal<ChartData<'line'>>({ labels: [], datasets: [{ data: [], label: 'Sesiones', borderColor: P, backgroundColor: 'rgba(45,74,62,0.10)', fill: 'origin' }] });
  donutData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [{ data: [], backgroundColor: [] }] });
  barData   = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  // ── Horas trabajadas ─────────────────────────────────────────────────
  horasData      = signal<HorasTrabajadasResponse | null>(null);
  horasBarData   = signal<ChartData<'bar'>>({ labels: [], datasets: [] });
  isLoadingHoras = signal(false);

  readonly desgloseConPorcentaje = computed(() => {
    const h = this.horasData();
    if (!h?.desgloseTipo?.length) return [];
    const total = h.desgloseTipo.reduce((a, d) => a + d.minutos, 0);
    if (total === 0) return [];
    return h.desgloseTipo.map(d => ({
      ...d,
      pct: Math.round((d.minutos / total) * 100),
      config: TIPO_JORNADA_CONFIG[d.tipo] ?? { label: d.tipo, color: MUTED, icon: 'bi-circle' },
    }));
  });

  // ── Exponer opciones y plugins al template ─────────────────────────────
  readonly lineOpts   = LINE_OPTS;
  readonly donutOpts  = DONUT_OPTS;
  readonly barOpts    = BAR_OPTS;
  readonly donutPlugins: Plugin<'doughnut'>[] = [DONUT_CENTER_PLUGIN];

  readonly horasBarOpts: ChartOptions<'bar'> = {
    ...BAR_OPTS,
    scales: {
      ...BAR_OPTS.scales,
      y: {
        stacked: true,
        border:  { display: false },
        grid:    { color: '#f5f5f5' },
        ticks:   {
          font: { family: FONT, size: 11 },
          color: '#798d82',
          callback: (v) => `${v}h`,
        },
      },
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
    if (this.canVerTodos()) {
      this.http
        .get<WrappedResponse<Trabajador[]>>(`${environment.apiUrl}/trabajadores`)
        .pipe(map(r => r.data || (r as unknown as Trabajador[])))
        .subscribe({ next: t => this.trabajadores.set(t) });
    }
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
    this.datos.set(null);
    this.horasData.set(null);

    const hasta = endOfDay(new Date());
    const desde = this.getDesde(this.rangoActivo());
    const tId   = this.trabajadorId || undefined;

    forkJoin([
      this.dashboardSvc.getEstadisticasAvanzadas(desde, hasta, tId),
      this.dashboardSvc.getHorasHistoricas<HorasTrabajadasResponse>(desde, hasta, tId),
    ]).subscribe({
      next: ([d, h]) => {
        this.datos.set(d);
        this.horasData.set(h);
        this.isLoading.set(false);
        this.isLoadingHoras.set(false);
      },
      error: () => {
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
        borderColor:     P,
        backgroundColor: 'rgba(45,74,62,0.10)',
        fill:            'origin',
        tension:         0.4,
        borderWidth:     2.5,
        pointBackgroundColor:  P,
        pointBorderColor:      '#fff',
        pointBorderWidth:      2,
        pointRadius:           4,
        pointHoverRadius:      6,
      }],
    };
  }

  private buildDonut(d: EstadisticasAvanzadas): ChartData<'doughnut'> {
    const sorted = [...d.distribucion].sort((a, b) => b.cantidad - a.cantidad);
    return {
      labels:   sorted.map(i => TIPO_CONFIG[i.tipo]?.label ?? i.tipo),
      datasets: [{
        data:            sorted.map(i => i.cantidad),
        backgroundColor: sorted.map(i => TIPO_CONFIG[i.tipo]?.color ?? MUTED),
        borderColor:     '#fff',
        borderWidth:     3,
        hoverBorderColor: '#fff',
        hoverOffset:     6,
      }],
    };
  }

  private buildBar(d: EstadisticasAvanzadas): ChartData<'bar'> {
    return {
      labels: d.sesionesPorEstado.map(s => s.semana),
      datasets: [
        { label: 'Completadas', data: d.sesionesPorEstado.map(s => s.completadas), backgroundColor: OK,   borderRadius: 3 },
        { label: 'Programadas', data: d.sesionesPorEstado.map(s => s.programadas), backgroundColor: S,    borderRadius: 3 },
        { label: 'Canceladas',  data: d.sesionesPorEstado.map(s => s.canceladas),  backgroundColor: ERR,  borderRadius: 3 },
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
          backgroundColor: P,
          borderRadius: 3,
        },
        {
          label: 'Admin/Coordinación',
          data: h.semanas.map(s => Math.round((s.minutosNoClinicas / 60) * 10) / 10),
          backgroundColor: MUTED,
          borderRadius: 3,
        },
      ],
    };
  }

  readonly formatHoras = formatMinutosHoras;

  formatMinutos(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // ── View helpers ──────────────────────────────────────────────────────
  getInitials(nombre: string, apellidos: string): string {
    return `${nombre.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();
  }

  getBarWidth(total: number): number {
    const max = this.topMaxSesiones();
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }
}
