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
 * Calcula la edad completa en años, meses y días
 */
export function calcularEdadTexto(fechaNacimiento: Date | string): { 
  anios: number; meses: number; dias: number; texto: string 
} {
  console.log(fechaNacimiento);
  const fecha = typeof fechaNacimiento === 'string' 
    ? new Date(fechaNacimiento) 
    : fechaNacimiento;
  const hoy = new Date();
  
  let anios = hoy.getFullYear() - fecha.getFullYear();
  let meses = hoy.getMonth() - fecha.getMonth();
  let dias = hoy.getDate() - fecha.getDate();
  
  if (dias < 0) {
    meses--;
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    dias += ultimoDiaMesAnterior;
  }
  if (meses < 0) {
    anios--;
    meses += 12;
  }
  console.log(anios);
  console.log(meses);
  console.log(dias);
  const partes: string[] = [];
  if (anios > 0) partes.push(anios === 1 ? '1 año' : `${anios} años`);
  if (meses > 0) partes.push(meses === 1 ? '1 mes' : `${meses} meses`);
  if (dias > 0) partes.push(dias === 1 ? '1 día' : `${dias} días`);
  
  return { anios, meses, dias, texto: partes.join(', ') || '0 días' };
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
