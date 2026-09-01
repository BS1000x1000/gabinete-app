import type { Plugin } from 'chart.js';
import { formatEuros } from '../utils/facturacion.utils';

/**
 * Tema compartido de Chart.js.
 *
 * Antes cada pantalla con gráficos declaraba su propio `FONT`, su propia paleta
 * y su propio objeto de tooltip: `estadisticas` y `mis-ingresos` tenían dos
 * sistemas de diseño paralelos que ya habían empezado a divergir. Aquí viven
 * las piezas; cada pantalla sigue componiendo sus opciones, porque un gráfico de
 * evolución de sesiones y uno de euros facturados no quieren los mismos ejes.
 *
 * Los colores replican los del sistema de diseño SASS (`_variables.scss`). Son
 * literales porque Chart.js pinta sobre canvas y no lee variables CSS.
 */

export const CHART_FONT = 'Plus Jakarta Sans, sans-serif';

export const CHART_COLORS = {
  primary:   '#2d4a3e',
  secondary: '#3a5c74',
  success:   '#2f6b43',
  warning:   '#8a6018',
  danger:    '#96382e',
  teal:      '#3a6b63',
  muted:     '#798d82',
  grid:      '#f5f5f5',
  surface:   '#ffffff',
} as const;

/** Serie categórica: hasta 10 elementos antes de repetir. */
export const CHART_SERIES = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  '#6b5a8a',
  CHART_COLORS.teal,
  '#a5622a',
  '#356b73',
  '#5f7a2e',
] as const;

export const colorSerie = (i: number): string =>
  CHART_SERIES[i % CHART_SERIES.length];

const TOOLTIP_BASE = {
  backgroundColor: '#23322b',
  titleFont: { family: CHART_FONT, size: 12, weight: 600 as const },
  bodyFont:  { family: CHART_FONT, size: 12 },
  padding: 10,
  cornerRadius: 8,
} as const;

export const tooltipBase = () => ({
  ...TOOLTIP_BASE,
  displayColors: true,
  boxWidth: 10,
  boxHeight: 10,
});

/** Tooltip que formatea el valor como importe en euros. */
export const tooltipEuros = () => ({
  ...TOOLTIP_BASE,
  callbacks: {
    label: (ctx: any) => ` ${ctx.dataset?.label ?? ctx.label}: ${formatEuros(+ctx.raw)}`,
  },
});

const ticksBase = { font: { family: CHART_FONT, size: 11 }, color: CHART_COLORS.muted };

/** Eje de categorías: sin rejilla, sin borde. */
export const ejeCategorias = () => ({
  grid:   { display: false },
  border: { display: false },
  ticks:  { ...ticksBase },
});

/** Eje de importes: rejilla tenue y sufijo €. */
export const ejeEuros = () => ({
  border: { display: false },
  grid:   { color: CHART_COLORS.grid },
  ticks:  { ...ticksBase, callback: (v: any) => `${v}€` },
});

export const leyenda = (position: 'top' | 'bottom' = 'top') => ({
  position,
  align: position === 'top' ? ('start' as const) : ('center' as const),
  labels: {
    font: { family: CHART_FONT, size: 11 },
    boxWidth: 10,
    boxHeight: 10,
    padding: position === 'bottom' ? 12 : 0,
  },
});

/**
 * Texto en el centro de un donut. Los dos donuts de la app pintaban lo mismo
 * con dos copias del plugin; cambia el formato del total y el tamaño, no la
 * mecánica.
 */
export const donutCenterPlugin = (opts: {
  id: string;
  etiqueta?: string;
  format?: (total: number) => string;
  tamano?: number;
}): Plugin<'doughnut'> => ({
  id: opts.id,
  beforeDraw(chart) {
    const { ctx, chartArea, data } = chart;
    if (!chartArea) return;
    const total = (data.datasets[0]?.data as number[] ?? []).reduce((a, b) => a + +b, 0);
    const cx = chartArea.left + (chartArea.right - chartArea.left) / 2;
    const cy = chartArea.top + (chartArea.bottom - chartArea.top) / 2;
    const tamano = opts.tamano ?? 18;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${tamano}px ${CHART_FONT}`;
    ctx.fillStyle = CHART_COLORS.primary;
    ctx.fillText(opts.format ? opts.format(total) : String(total), cx, cy - tamano / 2);
    ctx.font = `500 ${Math.round(tamano * 0.5)}px ${CHART_FONT}`;
    ctx.fillStyle = CHART_COLORS.muted;
    ctx.fillText(opts.etiqueta ?? 'Total', cx, cy + tamano / 2);
    ctx.restore();
  },
});
