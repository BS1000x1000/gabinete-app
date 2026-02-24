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

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param fechaNacimiento - Puede ser Date o string ISO
 * @returns Edad en años
 */
export function calcularEdad(fechaNacimiento: Date | string): number {
  const fecha = typeof fechaNacimiento === 'string' 
    ? new Date(fechaNacimiento) 
    : fechaNacimiento;
  
  const hoy = new Date();
  let edad = hoy.getFullYear() - fecha.getFullYear();
  const mes = hoy.getMonth() - fecha.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
    edad--;
  }
  
  return edad;
}

/**
 * Formatea una fecha a formato legible en español
 * @param fecha - Date o string ISO
 * @returns Fecha formateada: "15 de febrero de 2026"
 */
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formatea una fecha a formato corto
 * @param fecha - Date o string ISO
 * @returns Fecha formateada: "15/02/2026"
 */
export function formatearFechaCorta(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Convierte string ISO a Date
 * @param isoString - String en formato ISO
 * @returns Date object
 */
export function isoStringToDate(isoString: string): Date {
  return new Date(isoString);
}

/**
 * Verifica si una fecha es válida
 * @param fecha - Date o string
 * @returns true si es válida
 */
export function esFechaValida(fecha: Date | string): boolean {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return date instanceof Date && !isNaN(date.getTime());
}
