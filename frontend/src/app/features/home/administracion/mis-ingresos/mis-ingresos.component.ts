import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartData, ChartOptions, Plugin } from 'chart.js';
import { finalize } from 'rxjs';
import { FacturasService } from '../../../../services/facturas.service';
import { Factura } from '../../../../interface/factura.interface';

const FONT  = 'Plus Jakarta Sans, sans-serif';
const P     = '#2d4a3e';
const OK    = '#2f6b43';
const MUTED = '#798d82';

const MESES_LABEL = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const CLIENT_COLORS = [P, '#3a5c74', OK, '#8a6018', '#96382e', '#6b5a8a', '#3a6b63', '#a5622a', '#356b73', '#5f7a2e'];

const TOOLTIP_MONEY = {
  backgroundColor: '#23322b',
  titleFont: { family: FONT, size: 12, weight: 600 as const },
  bodyFont:  { family: FONT, size: 12 },
  padding: 10,
  cornerRadius: 8,
  callbacks: {
    label: (ctx: any) => ` ${ctx.dataset.label ?? ctx.label}: ${(+ctx.raw).toFixed(2).replace('.', ',')} €`,
  },
};

const LINE_OPTS: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', align: 'start', labels: { font: { family: FONT, size: 11 }, boxWidth: 10, boxHeight: 10 } },
    tooltip: TOOLTIP_MONEY,
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: FONT, size: 11 }, color: MUTED } },
    y: { border: { display: false }, grid: { color: '#f5f5f5' }, ticks: { font: { family: FONT, size: 11 }, color: MUTED, callback: v => `${v}€` } },
  },
  elements: {
    line:  { tension: 0.4, borderWidth: 2.5 },
    point: { radius: 4, hoverRadius: 6, borderColor: '#fff', borderWidth: 2 },
  },
};

const DONUT_OPTS: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { position: 'bottom', labels: { font: { family: FONT, size: 11 }, boxWidth: 10, boxHeight: 10, padding: 12 } },
    tooltip: {
      ...TOOLTIP_MONEY,
      callbacks: { label: (ctx: any) => ` ${ctx.label}: ${(+ctx.raw).toFixed(2).replace('.', ',')} €` },
    },
  },
};

const BAR_OPTS: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top', align: 'start', labels: { font: { family: FONT, size: 11 }, boxWidth: 10, boxHeight: 10 } },
    tooltip: TOOLTIP_MONEY,
  },
  scales: {
    x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: FONT, size: 11 }, color: MUTED } },
    y: { border: { display: false }, grid: { color: '#f5f5f5' }, ticks: { font: { family: FONT, size: 11 }, color: MUTED, callback: v => `${v}€` } },
  },
};

const DONUT_CENTER_PLUGIN: Plugin<'doughnut'> = {
  id: 'donutCenterIngresos',
  beforeDraw(chart) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;
    const total = (data.datasets[0].data as number[]).reduce((a, b) => a + +b, 0);
    const cx = chartArea.left + (chartArea.right - chartArea.left) / 2;
    const cy = chartArea.top  + (chartArea.bottom - chartArea.top)  / 2;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 16px ${FONT}`;
    ctx.fillStyle = P;
    ctx.fillText(`${total.toFixed(0)}€`, cx, cy - 8);
    ctx.font = `500 10px ${FONT}`;
    ctx.fillStyle = MUTED;
    ctx.fillText('Total', cx, cy + 8);
    ctx.restore();
  },
};

@Component({
  selector: 'app-mis-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './mis-ingresos.component.html',
})
export default class MisIngresosComponent implements OnInit {
  private facturasService = inject(FacturasService);

  cargando = signal(false);
  error    = signal<string | null>(null);
  facturas = signal<Factura[]>([]);

  readonly anioActual = new Date().getFullYear();
  anioSeleccionado    = signal(this.anioActual);
  readonly anios      = Array.from({ length: 4 }, (_, i) => this.anioActual - i);

  // ── Chart data signals ────────────────────────────────────────────────────
  lineData  = signal<ChartData<'line'>>({ labels: [], datasets: [] });
  donutData = signal<ChartData<'doughnut'>>({ labels: [], datasets: [] });
  barData   = signal<ChartData<'bar'>>({ labels: [], datasets: [] });

  readonly lineOpts   = LINE_OPTS;
  readonly donutOpts  = DONUT_OPTS;
  readonly barOpts    = BAR_OPTS;
  readonly donutPlugins: Plugin<'doughnut'>[] = [DONUT_CENTER_PLUGIN];

  // ── Summary stats ─────────────────────────────────────────────────────────
  readonly totalFacturado = computed(() =>
    this.facturas().filter(f => f.estado !== 'ANULADA').reduce((s, f) => s + +f.total, 0),
  );
  readonly totalCobrado = computed(() =>
    this.facturas().filter(f => f.estado === 'PAGADA').reduce((s, f) => s + +f.total, 0),
  );
  readonly pendiente  = computed(() => this.totalFacturado() - this.totalCobrado());
  readonly tasaCobro  = computed(() => {
    const t = this.totalFacturado();
    return t > 0 ? Math.round((this.totalCobrado() / t) * 100) : 0;
  });

  constructor() {
    effect(() => {
      const data = this.facturas();
      if (!data.length) {
        this.lineData.set({ labels: [], datasets: [] });
        this.donutData.set({ labels: [], datasets: [] });
        this.barData.set({ labels: [], datasets: [] });
        return;
      }
      const agg = this.aggregateByMonth(data);
      this.lineData.set(this.buildLine(agg));
      this.donutData.set(this.buildDonut(data));
      this.barData.set(this.buildBar(agg));
    });
  }

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.facturasService.getFacturas({ anio: this.anioSeleccionado() })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next:  data => this.facturas.set(data),
        error: ()   => this.error.set('Error al cargar los datos.'),
      });
  }

  onAnioChange(): void { this.cargar(); }

  // ── Chart builders ────────────────────────────────────────────────────────
  private aggregateByMonth(data: Factura[]): { facturado: number[]; cobrado: number[] } {
    const facturado = new Array(12).fill(0);
    const cobrado   = new Array(12).fill(0);
    for (const f of data) {
      if (f.estado === 'ANULADA') continue;
      const idx = parseInt(f.periodoFacturado.split('-')[1], 10) - 1;
      if (idx >= 0 && idx < 12) {
        facturado[idx] += +f.total;
        if (f.estado === 'PAGADA') cobrado[idx] += +f.total;
      }
    }
    return { facturado, cobrado };
  }

  private buildLine({ facturado, cobrado }: { facturado: number[]; cobrado: number[] }): ChartData<'line'> {
    return {
      labels:   MESES_LABEL,
      datasets: [
        { label: 'Facturado', data: facturado, borderColor: P,  backgroundColor: 'rgba(45,74,62,0.10)', fill: 'origin', pointBackgroundColor: P,  pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 },
        { label: 'Cobrado',   data: cobrado,   borderColor: OK, backgroundColor: 'rgba(47,107,67,0.08)',  fill: 'origin', pointBackgroundColor: OK, pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6 },
      ],
    };
  }

  private buildDonut(data: Factura[]): ChartData<'doughnut'> {
    const byClient: Record<string, { nombre: string; total: number }> = {};
    for (const f of data) {
      if (f.estado === 'ANULADA') continue;
      if (!byClient[f.clienteId]) {
        byClient[f.clienteId] = { nombre: `${f.cliente.nombre} ${f.cliente.apellidos}`, total: 0 };
      }
      byClient[f.clienteId].total += +f.total;
    }
    const sorted = Object.values(byClient).sort((a, b) => b.total - a.total);
    return {
      labels:   sorted.map(c => c.nombre),
      datasets: [{
        data:            sorted.map(c => c.total),
        backgroundColor: sorted.map((_, i) => CLIENT_COLORS[i % CLIENT_COLORS.length]),
        borderColor:     '#fff',
        borderWidth:     3,
        hoverOffset:     6,
      }],
    };
  }

  private buildBar({ facturado, cobrado }: { facturado: number[]; cobrado: number[] }): ChartData<'bar'> {
    const mesActual = new Date().getMonth();
    const start     = (mesActual - 5 + 12) % 12;
    const months6   = Array.from({ length: 6 }, (_, i) => (start + i) % 12);
    return {
      labels:   months6.map(i => MESES_LABEL[i]),
      datasets: [
        { label: 'Facturado', data: months6.map(i => facturado[i]), backgroundColor: P,  borderRadius: 4 },
        { label: 'Cobrado',   data: months6.map(i => cobrado[i]),   backgroundColor: OK, borderRadius: 4 },
      ],
    };
  }
}
