/**
 * Domingo de Pascua por el algoritmo de Gauss.
 *
 * Vive aqui y no en `festivos.service.ts` porque lo necesitan dos sitios: el
 * import de festivos nacionales (Viernes Santo) y la tabla de calendario del
 * contrato (Semana Santa). Duplicar un algoritmo con constantes magicas es
 * justo lo que acaba divergiendo.
 */
export function calcularDomingoPascua(anio: number): Date {
  const a = anio % 19;
  const b = anio % 4;
  const c = anio % 7;
  const d = (19 * a + 24) % 30;
  const e = (2 * b + 4 * c + 6 * d + 5) % 7;
  // Mediodia: evita que un cambio de hora mueva el dia al restar/sumar dias.
  return new Date(anio, 2, 22 + d + e, 12, 0, 0, 0);
}

/** Viernes Santo: dos dias antes del Domingo de Pascua. */
export function calcularViernesSanto(anio: number): Date {
  const pascua = calcularDomingoPascua(anio);
  return new Date(anio, pascua.getMonth(), pascua.getDate() - 2, 12, 0, 0, 0);
}
