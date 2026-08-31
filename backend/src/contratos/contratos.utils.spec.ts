import { generarFechasRecurrentes, esFestivo, enVacaciones } from './contratos.utils';

/**
 * La convención de `diaSemana` es ISO (1=Lun..7=Dom) en todo el módulo de
 * contratos. Estos tests la fijan: hasta 2026-08 convivían dos convenciones
 * (ISO aquí, JS 0-6 en las disponibilidades) sobre un campo con el mismo nombre,
 * y nada impedía que alguien cruzara las tablas y generase las sesiones un día
 * corrido. Al retirar los otros generadores, ésta quedó como la única.
 */
describe('generarFechasRecurrentes()', () => {
  // Marzo 2026: el día 2 es lunes.
  const marzo = (dia: number) => new Date(2026, 2, dia, 12, 0, 0, 0);

  it('ISO 1 cae en lunes', () => {
    const fechas = generarFechasRecurrentes(marzo(1), marzo(31), 1);
    expect(fechas.every((f) => f.getDay() === 1)).toBe(true);
    expect(fechas[0].getDate()).toBe(2);
  });

  it('ISO 7 cae en domingo, no en sábado ni en lunes', () => {
    const fechas = generarFechasRecurrentes(marzo(1), marzo(31), 7);
    expect(fechas.every((f) => f.getDay() === 0)).toBe(true);
    expect(fechas[0].getDate()).toBe(1);
  });

  it('ISO 5 cae en viernes', () => {
    const fechas = generarFechasRecurrentes(marzo(1), marzo(31), 5);
    expect(fechas.every((f) => f.getDay() === 5)).toBe(true);
    expect(fechas[0].getDate()).toBe(6);
  });

  it('avanza de siete en siete y no se sale del rango', () => {
    const fechas = generarFechasRecurrentes(marzo(1), marzo(31), 3);
    expect(fechas.map((f) => f.getDate())).toEqual([4, 11, 18, 25]);
  });

  it('devuelve vacío si el rango no contiene ese día', () => {
    // 3 y 4 de marzo de 2026: martes y miércoles. No hay ningún domingo.
    expect(generarFechasRecurrentes(marzo(3), marzo(4), 7)).toEqual([]);
  });

  it('incluye el propio día de inicio si ya coincide', () => {
    const fechas = generarFechasRecurrentes(marzo(2), marzo(9), 1);
    expect(fechas.map((f) => f.getDate())).toEqual([2, 9]);
  });
});

describe('esFestivo()', () => {
  it('detecta la fecha aunque las horas difieran', () => {
    const festivos = [{ fecha: new Date(2026, 2, 19, 0, 0, 0) }] as any[];
    expect(esFestivo(new Date(2026, 2, 19, 17, 30), festivos)).toBe(true);
    expect(esFestivo(new Date(2026, 2, 20, 17, 30), festivos)).toBe(false);
  });
});

describe('enVacaciones()', () => {
  // Tal y como las guarda vacaciones.service.ts: mediodia UTC del dia elegido.
  const periodos = [
    {
      fechaInicio: new Date('2026-08-01T12:00:00.000Z'),
      fechaFin:    new Date('2026-08-15T12:00:00.000Z'),
    },
  ] as any[];

  // Antes fallaba: fechaFin se guarda a las 12:00 UTC, asi que una sesion de la
  // tarde del ultimo dia quedaba fuera del periodo y se generaba igualmente.
  it('cubre el dia entero en ambos extremos, tarde incluida', () => {
    expect(enVacaciones(new Date(2026, 7, 1, 9, 0), periodos)).toBe(true);
    expect(enVacaciones(new Date(2026, 7, 1, 20, 0), periodos)).toBe(true);
    expect(enVacaciones(new Date(2026, 7, 15, 9, 0), periodos)).toBe(true);
    expect(enVacaciones(new Date(2026, 7, 15, 20, 0), periodos)).toBe(true);
  });

  it('excluye lo que queda fuera', () => {
    expect(enVacaciones(new Date(2026, 6, 31, 10, 0), periodos)).toBe(false);
    expect(enVacaciones(new Date(2026, 7, 16, 10, 0), periodos)).toBe(false);
  });
});
