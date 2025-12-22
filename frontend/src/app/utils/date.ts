// utils/date.ts
import { startOfWeek, addDays, setHours, setMinutes } from 'date-fns';

export const WEEK_START_HOUR = 8;
export const WEEK_END_HOUR = 17;

/* día de la semana (0 = domingo) -> Date real de esta semana */
export function thisWeekDay(
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  h: number,
  m = 0
): Date {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
  return setMinutes(setHours(addDays(monday, day), h), m);
}

export function calcularEdad(fechaNacimiento: Date): number {
  let nacimiento: Date;
  const hoy = new Date();
  if (typeof fechaNacimiento === 'string') {
    nacimiento = new Date(fechaNacimiento);
  } else {
    nacimiento = fechaNacimiento;
  }
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  // Si aún no ha pasado su cumpleaños este año, restamos 1
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  return edad;
}
