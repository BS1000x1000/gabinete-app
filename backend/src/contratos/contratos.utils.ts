import { addMonths } from 'date-fns';

export function generarFechasRecurrentes(
  fechaInicio: Date,
  fechaFin: Date,
  diaSemanaISO: number, // 1=Lun..7=Dom
): Date[] {
  const jsDia = diaSemanaISO % 7;

  // noon avoids DST edge cases when incrementing by day
  const actual = new Date(fechaInicio);
  actual.setHours(12, 0, 0, 0);

  while (actual.getDay() !== jsDia) {
    actual.setDate(actual.getDate() + 1);
  }

  const fechas: Date[] = [];
  const fin = new Date(fechaFin);
  fin.setHours(23, 59, 59, 0);

  while (actual <= fin) {
    fechas.push(new Date(actual));
    actual.setDate(actual.getDate() + 7);
  }

  return fechas;
}

export function mismoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function esFestivo(
  fecha: Date,
  festivos: Array<{ fecha: Date }>,
): boolean {
  return festivos.some(f => mismoDia(fecha, f.fecha));
}

export function enVacaciones(
  fecha: Date,
  periodos: Array<{ fechaInicio: Date; fechaFin: Date }>,
): boolean {
  return periodos.some(p => fecha >= p.fechaInicio && fecha <= p.fechaFin);
}

export function combinarFechaHora(fecha: Date, hora: string): Date {
  const [h, m] = hora.split(':').map(Number);
  const result = new Date(fecha);
  result.setHours(h, m, 0, 0);
  return result;
}

export function añosCubiertos(inicio: Date, fin: Date): number[] {
  const años: number[] = [];
  for (let a = inicio.getFullYear(); a <= fin.getFullYear(); a++) {
    años.push(a);
  }
  return años;
}

export { addMonths };
