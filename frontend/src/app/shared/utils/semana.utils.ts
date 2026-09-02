/**
 * Aritmética de franjas horarias para "Mi semana".
 *
 * Todo se calcula en MINUTOS DESDE MEDIANOCHE, no con `Date`: las franjas de
 * disponibilidad, los bloques de administración y los slots de contrato son
 * patrones semanales ("los miércoles de 16:00 a 20:00"), no instantes. Meterlos
 * en un `Date` obligaría a elegir un día concreto y arrastraría zona horaria y
 * cambios de hora a un cálculo que no los necesita.
 *
 * La pregunta que responde este módulo es una sola: **qué hueco queda libre**
 * dentro de la disponibilidad declarada, una vez descontados los clientes y el
 * tiempo de administración.
 */

/** Un intervalo del día, en minutos desde medianoche. Fin exclusivo. */
export interface Tramo {
  inicio: number;
  fin: number;
}

/** Cualquier cosa con horas "HH:mm": una franja, un bloque, un slot. */
export interface ConHoras {
  horaInicio: string;
  horaFin: string;
}

/**
 * "HH:mm" → minutos. Las horas vienen de `<input type="time">` y de columnas
 * validadas con regex en el backend, así que no se defiende de basura: un
 * valor inesperado da `NaN` y se ve, en vez de colarse como un 0 silencioso.
 */
export function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Minutos → "HH:mm", con el cero a la izquierda. */
export function aHhMm(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function aTramo(x: ConHoras): Tramo {
  return { inicio: aMinutos(x.horaInicio), fin: aMinutos(x.horaFin) };
}

export function duracion(x: ConHoras): number {
  return aMinutos(x.horaFin) - aMinutos(x.horaInicio);
}

export function totalMinutos(tramos: Tramo[]): number {
  return tramos.reduce((n, t) => n + (t.fin - t.inicio), 0);
}

export function solapan(a: Tramo, b: Tramo): boolean {
  return a.inicio < b.fin && b.inicio < a.fin;
}

/**
 * Ordena y fusiona los tramos que se solapan o se tocan.
 *
 * Fusionar los ADYACENTES (10:00-11:00 y 11:00-12:00 → 10:00-12:00) importa:
 * sin eso, restarlos de la disponibilidad dejaría un hueco libre de cero
 * minutos entre ambos, y la pantalla ofrecería un hueco que no existe.
 *
 * Los tramos vacíos o invertidos se descartan: no representan tiempo ocupado.
 */
export function unir(tramos: Tramo[]): Tramo[] {
  const validos = tramos
    .filter(t => Number.isFinite(t.inicio) && Number.isFinite(t.fin) && t.fin > t.inicio)
    .sort((a, b) => a.inicio - b.inicio);

  const unidos: Tramo[] = [];
  for (const t of validos) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && t.inicio <= ultimo.fin) {
      ultimo.fin = Math.max(ultimo.fin, t.fin);
    } else {
      unidos.push({ ...t });
    }
  }
  return unidos;
}

/**
 * Lo que queda de `base` tras quitarle `ocupados`: los huecos libres.
 *
 * Un ocupado que se sale de la base (un cliente fuera de la disponibilidad
 * declarada, que pasa: el sábado que sale sin avisar) recorta solo la parte que
 * cae dentro; el resto se ignora aquí. Que ese cliente esté fuera de la
 * disponibilidad es información de la rejilla, no de este cálculo.
 */
export function restar(base: Tramo[], ocupados: Tramo[]): Tramo[] {
  const bloques = unir(ocupados);
  const libres: Tramo[] = [];

  for (const b of unir(base)) {
    let cursor = b.inicio;
    for (const o of bloques) {
      if (o.fin <= cursor) continue;      // ya pasado
      if (o.inicio >= b.fin) break;       // fuera por la derecha: ordenados, no habrá más
      if (o.inicio > cursor) libres.push({ inicio: cursor, fin: o.inicio });
      cursor = o.fin;
      if (cursor >= b.fin) break;
    }
    if (cursor < b.fin) libres.push({ inicio: cursor, fin: b.fin });
  }
  return libres;
}

// ── Eje de tiempo ───────────────────────────────────────────
//
// Mismo criterio que la agenda (`agenda.component.ts:452-480`), en minutos y
// sin `Date`: la ventana envuelve toda la actividad, deja una hora de respiro a
// cada lado y nunca baja de un mínimo. Sin ese mínimo, una semana floja daría
// un eje de dos horas que "baila" al declarar la primera franja.

/** Ventana horaria mínima, en horas. */
export const VENTANA_MINIMA_H = 6;

/**
 * Horas a pintar, deducidas de la actividad. Los límites son solo del relleno,
 * nunca de los datos: nada puede quedar recortado.
 *
 * Sin nada declarado devuelve 09:00–19:00, igual que la agenda: un eje neutro
 * es mejor punto de partida que uno de medianoche a medianoche.
 */
export function rangoHorario(tramos: Tramo[], minimoHoras = VENTANA_MINIMA_H): Tramo {
  const validos = unir(tramos);
  if (!validos.length) return { inicio: 9 * 60, fin: 19 * 60 };

  let inicioH = Math.max(0, Math.floor(Math.min(...validos.map(t => t.inicio)) / 60) - 1);
  let finH = Math.min(24, Math.ceil(Math.max(...validos.map(t => t.fin)) / 60) + 1);

  while (finH - inicioH < minimoHoras && (finH < 24 || inicioH > 0)) {
    if (finH < 24) finH++;
    else inicioH--;
  }
  return { inicio: inicioH * 60, fin: finH * 60 };
}

/** Marcas de hora en punto del rango, para la regla y las líneas verticales. */
export function marcasHorarias(rango: Tramo): number[] {
  const marcas: number[] = [];
  for (let m = rango.inicio; m <= rango.fin; m += 60) marcas.push(m);
  return marcas;
}

/** Posición de un minuto dentro del rango, en % del ancho. */
export function pct(minuto: number, rango: Tramo): number {
  const span = rango.fin - rango.inicio;
  if (span <= 0) return 0;
  return Math.min(100, Math.max(0, ((minuto - rango.inicio) / span) * 100));
}

/**
 * Ancho de un tramo en % del rango. Recorta a los bordes: un bloque que se sale
 * del eje se dibuja hasta donde llega, no fuera de la pista.
 */
export function anchoPct(tramo: Tramo, rango: Tramo): number {
  const span = rango.fin - rango.inicio;
  if (span <= 0) return 0;
  const inicio = Math.max(tramo.inicio, rango.inicio);
  const fin = Math.min(tramo.fin, rango.fin);
  return Math.max(0, ((fin - inicio) / span) * 100);
}

/** "3 h 30 min", "45 min", "2 h". Para las cifras del resumen. */
export function formatoHoras(minutos: number): string {
  if (minutos <= 0) return '0 min';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
