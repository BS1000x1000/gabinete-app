import { BadRequestException } from '@nestjs/common';
import { diaDesdeIso, normalizarDia } from './dia.utils';

/**
 * Estos tests fijan un fallo real: los registros diarios salian "hechos a las
 * 02:00 am". No era la hora de nada; era la medianoche UTC del dia elegido,
 * renderizada en Europe/Madrid. La fecha de un registro es un DIA, y un dia se
 * guarda a las 12:00 UTC para que se lea igual corra el proceso en UTC o en
 * Madrid.
 */
describe('dia.utils', () => {

  describe('normalizarDia()', () => {
    it('lleva cualquier hora del dia al mediodia UTC', () => {
      const a = normalizarDia(new Date(2026, 8, 2, 0, 0, 0));
      const b = normalizarDia(new Date(2026, 8, 2, 23, 59, 59));
      expect(a.toISOString()).toBe('2026-09-02T12:00:00.000Z');
      expect(a.getTime()).toBe(b.getTime());
    });
  });

  describe('diaDesdeIso()', () => {
    it('parsea "YYYY-MM-DD" al mediodia UTC de ESE dia', () => {
      expect(diaDesdeIso('2026-09-02').toISOString()).toBe('2026-09-02T12:00:00.000Z');
    });

    it('no se desplaza al dia anterior, que es el bug que cierra', () => {
      // `new Date("2026-09-02")` da 00:00Z, que en Madrid son las 02:00 del dia
      // 2 (verano) y en cualquier zona al oeste de Greenwich seria el dia 1.
      const d = diaDesdeIso('2026-09-02');
      expect(d.getUTCDate()).toBe(2);
      expect(d.getUTCHours()).toBe(12);
    });

    it('acepta un ISO completo y se queda con el dia', () => {
      expect(diaDesdeIso('2026-09-02T00:00:00.000Z').toISOString())
        .toBe('2026-09-02T12:00:00.000Z');
      expect(diaDesdeIso('2026-09-02T22:30:00.000Z').toISOString())
        .toBe('2026-09-02T12:00:00.000Z');
    });

    it('el mediodia UTC cae en el mismo dia natural en UTC y en Madrid', () => {
      // 12:00Z son las 14:00 en Madrid en verano y las 13:00 en invierno:
      // el dia local nunca cambia. Con 00:00Z si cambiaria.
      const verano = diaDesdeIso('2026-07-15');
      const invierno = diaDesdeIso('2026-01-15');
      expect(verano.getUTCHours()).toBe(12);
      expect(invierno.getUTCHours()).toBe(12);
    });

    it('rechaza una fecha invalida en vez de inventarse un dia', () => {
      expect(() => diaDesdeIso('no-es-una-fecha')).toThrow(BadRequestException);
      expect(() => diaDesdeIso('')).toThrow(BadRequestException);
    });
  });
});
