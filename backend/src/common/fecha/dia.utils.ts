import { BadRequestException } from '@nestjs/common';

/**
 * Un DIA natural guardado como instante: las 12:00 UTC de ese dia.
 *
 * Es la forma canonica del proyecto para todo campo que representa un dia y no
 * un momento — festivos, vacaciones y la fecha de un registro diario.
 *
 * Dos decisiones que conviene no deshacer:
 *
 * - **`Date.UTC` y no el constructor local**, para que el resultado no dependa
 *   de la zona horaria del contenedor. Nacio en festivos porque convivian dos
 *   formas (la importacion construia el mediodia local y el alta manual
 *   parseaba "2026-05-15" como medianoche UTC): las dos leian el dia correcto,
 *   pero son instantes distintos, asi que el indice unico no las veia como
 *   duplicadas.
 * - **Las 12:00 y no las 00:00**, para que el dia local sea el mismo se ejecute
 *   en UTC o en Europe/Madrid. La medianoche UTC se pinta como las 02:00 en
 *   Madrid (01:00 en invierno), que es de donde salia el "registro hecho a las
 *   02:00": un dia renderizado como si fuera una hora.
 */
export function normalizarDia(fecha: Date): Date {
  return new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 12, 0, 0, 0));
}

/**
 * Igual, pero desde una cadena. Toma los 10 primeros caracteres ("YYYY-MM-DD")
 * **sin pasar por `new Date(iso)`**: ese parseo interpreta una fecha suelta como
 * medianoche UTC y vuelve a meter el desfase que esto viene a quitar.
 *
 * Acepta tambien un ISO completo por compatibilidad con quien todavia mande
 * `...T00:00:00.000Z`, pero el contrato es el dia: si lo que llega es un
 * instante con hora real, la hora se descarta a proposito.
 */
export function diaDesdeIso(iso: string): Date {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) throw new BadRequestException(`Fecha invalida: ${iso}`);
  return new Date(Date.UTC(anio, mes - 1, dia, 12, 0, 0, 0));
}
