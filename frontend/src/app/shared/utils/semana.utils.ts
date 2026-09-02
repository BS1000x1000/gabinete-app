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

/** "3 h 30 min", "45 min", "2 h". Para las cifras del resumen. */
export function formatoHoras(minutos: number): string {
  if (minutos <= 0) return '0 min';
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
