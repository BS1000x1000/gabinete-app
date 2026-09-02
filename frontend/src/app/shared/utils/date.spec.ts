import { formatMinutosHoras } from './date';

describe('formatMinutosHoras', () => {
  it('escribe horas y minutos', () => {
    expect(formatMinutosHoras(150)).toBe('2h 30m');
  });

  it('omite los minutos en una hora justa', () => {
    expect(formatMinutosHoras(120)).toBe('2h');
  });

  /**
   * `estadisticas` tenía una copia local de esta función solo por esto: el
   * desglose de jornada muestra actividades de menos de una hora y "0h 45m" se
   * lee mal.
   */
  it('omite el "0h" por debajo de la hora', () => {
    expect(formatMinutosHoras(45)).toBe('45m');
    expect(formatMinutosHoras(0)).toBe('0m');
  });
});
