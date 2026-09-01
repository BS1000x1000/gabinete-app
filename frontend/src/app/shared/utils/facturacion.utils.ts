import { Factura } from '../../interface/factura.interface';

/**
 * Vocabulario compartido del bloque de facturación.
 *
 * Antes cada pantalla reimplementaba lo mismo: tres tablas de meses con tres
 * convenciones distintas (el mismo periodo se leía "Septiembre 2026" en una
 * pestaña y "Sep 2026" en la de al lado), `periodoLabel()` duplicado byte a
 * byte, y una decena de `filter(...).reduce(...)` con predicados escritos a
 * mano que era cuestión de tiempo que divergieran.
 */

/** Índice 1..12 — la posición 0 queda vacía a propósito. */
export const MESES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

/** Misma indexación que `MESES`, para ejes de gráficos y tablas estrechas. */
export const MESES_CORTOS = [
  '', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const;

/** Opciones para los `<select>` de mes. */
export const OPCIONES_MES = MESES.slice(1).map((label, i) => ({ value: i + 1, label }));

/** Los últimos `n` años, del actual hacia atrás. */
export const ultimosAnios = (n = 4, hasta = new Date().getFullYear()): number[] =>
  Array.from({ length: n }, (_, i) => hasta - i);

/** Periodo facturado con el formato de la BD: "2026-09". */
export const periodo = (anio: number, mes: number): string =>
  `${anio}-${String(mes).padStart(2, '0')}`;

/**
 * El periodo del mes en curso. Función y no constante de módulo: calculado una
 * sola vez, una sesión abierta a través de la medianoche del día 1 seguiría
 * mirando al mes anterior.
 */
export const periodoDeHoy = (): string => {
  const hoy = new Date();
  return periodo(hoy.getFullYear(), hoy.getMonth() + 1);
};

/** "2026-09" → "Septiembre 2026". */
export const periodoLabel = (p: string): string => {
  const [y, m] = p.split('-');
  return `${MESES[+m] ?? m} ${y}`;
};

/** "2026-09" → "Sep 2026". */
export const periodoLabelCorto = (p: string): string => {
  const [y, m] = p.split('-');
  return `${MESES_CORTOS[+m] ?? m} ${y}`;
};

/** Mes del periodo como índice 1..12, o `null` si el periodo no es válido. */
export const mesDePeriodo = (p: string): number | null => {
  const m = parseInt(p.split('-')[1], 10);
  return m >= 1 && m <= 12 ? m : null;
};

/**
 * Una factura anulada no existe a efectos de importe: no se ha facturado ni se
 * va a cobrar. Todo lo que suma dinero pasa por aquí.
 */
export const esComputable = (f: Factura): boolean => f.estado !== 'ANULADA';

export const estaCobrada = (f: Factura): boolean => f.estado === 'PAGADA';

export const estaPendiente = (f: Factura): boolean => f.estado === 'PENDIENTE';

/** Suma de totales. Los `Decimal` de Prisma llegan como string por JSON. */
export const sumaTotal = (facturas: Factura[]): number =>
  facturas.reduce((s, f) => s + +f.total, 0);

export const totalFacturado = (facturas: Factura[]): number =>
  sumaTotal(facturas.filter(esComputable));

export const totalCobrado = (facturas: Factura[]): number =>
  sumaTotal(facturas.filter(estaCobrada));

export const totalPendiente = (facturas: Factura[]): number =>
  sumaTotal(facturas.filter(estaPendiente));

/**
 * Importe en euros con la convención española. Para donde no llega el pipe
 * `number` de Angular: tooltips de Chart.js y textos generados en TS.
 */
export const formatEuros = (v: number, decimales = 2): string =>
  `${v.toFixed(decimales).replace('.', ',')} €`;

// ── Rangos de periodo ────────────────────────────────────────────────────────
//
// El autónomo declara por trimestres (modelos 130 y 303), así que el trimestre
// es la unidad natural para entregar a la gestoría; el mes y el año son atajos
// del mismo mecanismo. Todo se expresa como un rango de `periodoFacturado`
// ("2026-07".."2026-09"), que es lo que entiende el backend.

export type TipoRango = 'trimestre' | 'mes' | 'anio' | 'personalizado';

export interface RangoPeriodo {
  desde: string;
  hasta: string;
}

/** 1..4 — el trimestre natural al que pertenece un mes. */
export const trimestreDeMes = (mes: number): number => Math.floor((mes - 1) / 3) + 1;

export const rangoTrimestre = (anio: number, trimestre: number): RangoPeriodo => {
  const primerMes = (trimestre - 1) * 3 + 1;
  return {
    desde: periodo(anio, primerMes),
    hasta: periodo(anio, primerMes + 2),
  };
};

export const rangoMes = (anio: number, mes: number): RangoPeriodo => ({
  desde: periodo(anio, mes),
  hasta: periodo(anio, mes),
});

export const rangoAnio = (anio: number): RangoPeriodo => ({
  desde: periodo(anio, 1),
  hasta: periodo(anio, 12),
});

/** El trimestre en curso. Es el valor por defecto del selector. */
export const trimestreActual = (): { anio: number; trimestre: number } => {
  const hoy = new Date();
  return {
    anio: hoy.getFullYear(),
    trimestre: trimestreDeMes(hoy.getMonth() + 1),
  };
};

/** ¿Cae este periodo facturado dentro del rango? Comparación de cadenas: "2026-07" ordena bien. */
export const enRango = (periodoFacturado: string, rango: RangoPeriodo): boolean =>
  periodoFacturado >= rango.desde && periodoFacturado <= rango.hasta;

/** "3T 2026", "Julio 2026", "2026" o "Jul 2026 – Nov 2026". */
export const etiquetaRango = (rango: RangoPeriodo): string => {
  if (rango.desde === rango.hasta) return periodoLabel(rango.desde);

  const [anioD, mesD] = rango.desde.split('-').map(Number);
  const [anioH, mesH] = rango.hasta.split('-').map(Number);

  if (anioD === anioH) {
    if (mesD === 1 && mesH === 12) return `${anioD}`;
    const t = trimestreDeMes(mesD);
    if (trimestreDeMes(mesH) === t && mesH - mesD === 2) return `${t}T ${anioD}`;
  }
  return `${periodoLabelCorto(rango.desde)} – ${periodoLabelCorto(rango.hasta)}`;
};

/** Un trimestre está cerrado cuando su último mes ya ha terminado. */
export const trimestreCerrado = (anio: number, trimestre: number): boolean =>
  rangoTrimestre(anio, trimestre).hasta < periodoDeHoy();
