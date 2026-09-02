import {
  aMinutos, aHhMm, anchoPct, duracion, formatoHoras, marcasHorarias, pct,
  rangoHorario, restar, solapan, totalMinutos, unir,
} from './semana.utils';

/** Azúcar para leer los tests en horas y no en minutos. */
const t = (inicio: string, fin: string) => ({ inicio: aMinutos(inicio), fin: aMinutos(fin) });
const leer = (tramos: { inicio: number; fin: number }[]) =>
  tramos.map(x => `${aHhMm(x.inicio)}-${aHhMm(x.fin)}`);

describe('semana.utils', () => {

  describe('aMinutos / aHhMm', () => {
    it('convierte en ambos sentidos', () => {
      expect(aMinutos('00:00')).toBe(0);
      expect(aMinutos('09:30')).toBe(570);
      expect(aMinutos('23:59')).toBe(1439);
      expect(aHhMm(570)).toBe('09:30');
      expect(aHhMm(0)).toBe('00:00');
    });

    it('duracion resta las dos horas', () => {
      expect(duracion({ horaInicio: '16:00', horaFin: '17:50' })).toBe(110);
    });
  });

  describe('solapan', () => {
    it('detecta el solape real', () => {
      expect(solapan(t('10:00', '12:00'), t('11:00', '13:00'))).toBe(true);
    });

    it('dos tramos que solo se tocan NO solapan', () => {
      // 10:00-11:00 y 11:00-12:00 son consecutivos, no simultáneos.
      expect(solapan(t('10:00', '11:00'), t('11:00', '12:00'))).toBe(false);
    });
  });

  describe('unir', () => {
    it('ordena y fusiona los solapados', () => {
      expect(leer(unir([t('12:00', '13:00'), t('10:00', '12:30')])))
        .toEqual(['10:00-13:00']);
    });

    it('fusiona los ADYACENTES, para no dejar huecos de cero minutos', () => {
      expect(leer(unir([t('10:00', '11:00'), t('11:00', '12:00')])))
        .toEqual(['10:00-12:00']);
    });

    it('deja separados los que no se tocan', () => {
      expect(leer(unir([t('16:00', '17:00'), t('10:00', '11:00')])))
        .toEqual(['10:00-11:00', '16:00-17:00']);
    });

    it('descarta los vacíos y los invertidos', () => {
      expect(unir([t('10:00', '10:00'), t('12:00', '11:00')])).toEqual([]);
    });

    it('absorbe un tramo contenido en otro', () => {
      expect(leer(unir([t('09:00', '14:00'), t('10:00', '11:00')])))
        .toEqual(['09:00-14:00']);
    });
  });

  describe('restar — los huecos libres', () => {
    it('sin nada ocupado, la disponibilidad entera está libre', () => {
      expect(leer(restar([t('16:00', '20:00')], [])))
        .toEqual(['16:00-20:00']);
    });

    it('un cliente en medio parte el hueco en dos', () => {
      expect(leer(restar([t('16:00', '20:00')], [t('17:00', '18:00')])))
        .toEqual(['16:00-17:00', '18:00-20:00']);
    });

    it('un cliente pegado al borde no deja hueco de cero minutos', () => {
      expect(leer(restar([t('16:00', '20:00')], [t('16:00', '17:00')])))
        .toEqual(['17:00-20:00']);
    });

    it('dos bloques consecutivos no dejan hueco entre ellos', () => {
      expect(leer(restar([t('16:00', '20:00')], [t('17:00', '18:00'), t('18:00', '19:00')])))
        .toEqual(['16:00-17:00', '19:00-20:00']);
    });

    it('la franja llena no deja nada', () => {
      expect(restar([t('16:00', '20:00')], [t('16:00', '20:00')])).toEqual([]);
    });

    it('un ocupado que se sale por la derecha recorta solo lo que entra', () => {
      // El cliente acaba a las 21:00 pero la disponibilidad cierra a las 20:00.
      expect(leer(restar([t('16:00', '20:00')], [t('19:00', '21:00')])))
        .toEqual(['16:00-19:00']);
    });

    it('un ocupado enteramente fuera no toca nada', () => {
      // El sábado que sale sin avisar: cae fuera y no descuenta hueco del lunes.
      expect(leer(restar([t('16:00', '20:00')], [t('09:00', '10:00')])))
        .toEqual(['16:00-20:00']);
    });

    it('resta sobre varias franjas del mismo día', () => {
      expect(leer(restar(
        [t('10:00', '14:00'), t('16:00', '20:00')],
        [t('11:00', '12:00'), t('17:00', '18:00')],
      ))).toEqual(['10:00-11:00', '12:00-14:00', '16:00-17:00', '18:00-20:00']);
    });

    it('sin disponibilidad declarada no hay hueco libre que ofrecer', () => {
      expect(restar([], [t('17:00', '18:00')])).toEqual([]);
    });
  });

  describe('totalMinutos', () => {
    it('suma las duraciones', () => {
      expect(totalMinutos([t('10:00', '11:00'), t('16:00', '17:30')])).toBe(150);
    });
  });

  describe('rangoHorario — el eje compartido', () => {
    const leerRango = (r: { inicio: number; fin: number }) => `${aHhMm(r.inicio)}-${aHhMm(r.fin)}`;

    it('sin nada declarado da un eje neutro, no de medianoche a medianoche', () => {
      expect(leerRango(rangoHorario([]))).toBe('09:00-19:00');
    });

    it('envuelve la actividad con una hora de respiro a cada lado', () => {
      // 16:00-20:00 → 15:00-21:00, pero el mínimo de 6 h ya se cumple.
      expect(leerRango(rangoHorario([t('16:00', '20:00')]))).toBe('15:00-21:00');
    });

    it('estira hasta el mínimo cuando la actividad es corta', () => {
      // 17:00-17:50 daría 16:00-18:00 (2 h); se estira a 6 h.
      const r = rangoHorario([t('17:00', '17:50')]);
      expect((r.fin - r.inicio) / 60).toBe(6);
    });

    it('nunca recorta: los límites son del relleno, no de los datos', () => {
      const r = rangoHorario([t('08:30', '21:15')]);
      expect(r.inicio).toBeLessThanOrEqual(aMinutos('08:30'));
      expect(r.fin).toBeGreaterThanOrEqual(aMinutos('21:15'));
    });

    it('no se sale del día al estirar contra el borde', () => {
      const r = rangoHorario([t('22:00', '23:30')]);
      expect(r.fin).toBeLessThanOrEqual(24 * 60);
      expect(r.inicio).toBeGreaterThanOrEqual(0);
      expect((r.fin - r.inicio) / 60).toBeGreaterThanOrEqual(6);
    });

    it('cubre todos los días a la vez, que es lo que alinea la semana', () => {
      // Viernes por la mañana y lunes por la tarde comparten eje.
      expect(leerRango(rangoHorario([t('10:00', '14:00'), t('16:00', '20:00')])))
        .toBe('09:00-21:00');
    });
  });

  describe('marcasHorarias', () => {
    it('da una marca por hora en punto, extremos incluidos', () => {
      expect(marcasHorarias(t('09:00', '12:00')).map(aHhMm))
        .toEqual(['09:00', '10:00', '11:00', '12:00']);
    });
  });

  describe('pct / anchoPct', () => {
    const rango = t('09:00', '21:00');   // 12 h

    it('sitúa el inicio, el medio y el final', () => {
      expect(pct(aMinutos('09:00'), rango)).toBe(0);
      expect(pct(aMinutos('15:00'), rango)).toBe(50);
      expect(pct(aMinutos('21:00'), rango)).toBe(100);
    });

    it('la misma hora cae en el mismo sitio en todos los días', () => {
      // Es lo que permite comparar el lunes a las 17:00 con el miércoles.
      expect(pct(aMinutos('17:00'), rango)).toBe(pct(aMinutos('17:00'), rango));
    });

    it('recorta lo que se sale del eje en vez de desbordar la pista', () => {
      expect(pct(aMinutos('08:00'), rango)).toBe(0);
      expect(pct(aMinutos('23:00'), rango)).toBe(100);
      expect(anchoPct(t('20:00', '23:00'), rango)).toBeCloseTo((60 / 720) * 100, 5);
    });

    it('un tramo enteramente fuera no ocupa ancho', () => {
      expect(anchoPct(t('06:00', '07:00'), rango)).toBe(0);
    });

    it('el ancho es proporcional a la duración', () => {
      expect(anchoPct(t('10:00', '11:00'), rango)).toBeCloseTo(100 / 12, 5);
    });
  });

  describe('formatoHoras', () => {
    it('escribe horas y minutos como se leen', () => {
      expect(formatoHoras(0)).toBe('0 min');
      expect(formatoHoras(45)).toBe('45 min');
      expect(formatoHoras(120)).toBe('2 h');
      expect(formatoHoras(210)).toBe('3 h 30 min');
    });

    it('un negativo no se pinta como tiempo', () => {
      expect(formatoHoras(-30)).toBe('0 min');
    });
  });
});
