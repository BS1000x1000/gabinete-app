import { Factura } from '../../interface/factura.interface';
import {
  MESES,
  MESES_CORTOS,
  esComputable,
  estaCobrada,
  estaPendiente,
  formatEuros,
  mesDePeriodo,
  periodo,
  periodoDeHoy,
  periodoLabel,
  periodoLabelCorto,
  totalCobrado,
  totalFacturado,
  totalPendiente,
  ultimosAnios,
  enRango,
  etiquetaRango,
  rangoAnio,
  rangoMes,
  rangoTrimestre,
  trimestreActual,
  trimestreCerrado,
  trimestreDeMes,
} from './facturacion.utils';

const factura = (over: Partial<Factura> = {}): Factura =>
  ({
    id: 'f1',
    total: 100,
    estado: 'PENDIENTE',
    periodoFacturado: '2026-09',
    ...over,
  }) as Factura;

describe('facturacion.utils', () => {

  describe('tablas de meses', () => {
    // Las dos comparten indexación 1..12 a propósito: antes había tres tablas
    // con dos convenciones distintas y el mismo periodo se leía diferente
    // según la pantalla.
    it('MESES y MESES_CORTOS indexan igual, con hueco en 0', () => {
      expect(MESES.length).toBe(13);
      expect(MESES_CORTOS.length).toBe(13);
      expect(MESES[0]).toBe('');
      expect(MESES_CORTOS[0]).toBe('');
      expect(MESES[9]).toBe('Septiembre');
      expect(MESES_CORTOS[9]).toBe('Sep');
    });
  });

  describe('periodo()', () => {
    it('rellena el mes a dos dígitos', () => {
      expect(periodo(2026, 9)).toBe('2026-09');
      expect(periodo(2026, 12)).toBe('2026-12');
    });

    it('periodoDeHoy() devuelve el mes en curso', () => {
      const hoy = new Date();
      expect(periodoDeHoy()).toBe(periodo(hoy.getFullYear(), hoy.getMonth() + 1));
    });
  });

  describe('etiquetas de periodo', () => {
    it('formato largo y corto', () => {
      expect(periodoLabel('2026-09')).toBe('Septiembre 2026');
      expect(periodoLabelCorto('2026-09')).toBe('Sep 2026');
    });

    it('un periodo ilegible se devuelve tal cual en vez de romper', () => {
      expect(periodoLabel('2026-99')).toBe('99 2026');
    });
  });

  describe('mesDePeriodo()', () => {
    it('extrae el mes como 1..12', () => {
      expect(mesDePeriodo('2026-01')).toBe(1);
      expect(mesDePeriodo('2026-12')).toBe(12);
    });

    it('devuelve null si el mes está fuera de rango', () => {
      expect(mesDePeriodo('2026-00')).toBeNull();
      expect(mesDePeriodo('2026-13')).toBeNull();
      expect(mesDePeriodo('basura')).toBeNull();
    });
  });

  describe('predicados de estado', () => {
    it('una factura anulada no computa', () => {
      expect(esComputable(factura({ estado: 'ANULADA' }))).toBeFalse();
      expect(esComputable(factura({ estado: 'PENDIENTE' }))).toBeTrue();
      expect(esComputable(factura({ estado: 'PAGADA' }))).toBeTrue();
    });

    it('cobrada es solo PAGADA; pendiente es solo PENDIENTE', () => {
      expect(estaCobrada(factura({ estado: 'PAGADA' }))).toBeTrue();
      expect(estaCobrada(factura({ estado: 'PENDIENTE' }))).toBeFalse();
      expect(estaPendiente(factura({ estado: 'PENDIENTE' }))).toBeTrue();
      expect(estaPendiente(factura({ estado: 'ANULADA' }))).toBeFalse();
    });
  });

  describe('totales', () => {
    const lista = [
      factura({ id: 'a', total: 100, estado: 'PAGADA' }),
      factura({ id: 'b', total: 50, estado: 'PENDIENTE' }),
      factura({ id: 'c', total: 999, estado: 'ANULADA' }),
    ];

    it('lo anulado no suma en ningún total', () => {
      expect(totalFacturado(lista)).toBe(150);
      expect(totalCobrado(lista)).toBe(100);
      expect(totalPendiente(lista)).toBe(50);
    });

    it('los Decimal que llegan como string se suman como números', () => {
      const conStrings = [
        factura({ id: 'a', total: '120.50' as unknown as number }),
        factura({ id: 'b', total: '9.50' as unknown as number }),
      ];
      expect(totalFacturado(conStrings)).toBe(130);
    });

    it('una lista vacía suma cero', () => {
      expect(totalFacturado([])).toBe(0);
    });
  });

  describe('formatEuros()', () => {
    it('usa coma decimal', () => {
      expect(formatEuros(1234.5)).toBe('1234,50 €');
      expect(formatEuros(1234.5, 0)).toBe('1235 €');
    });
  });

  describe('ultimosAnios()', () => {
    it('devuelve el año dado y los anteriores, en orden descendente', () => {
      expect(ultimosAnios(4, 2026)).toEqual([2026, 2025, 2024, 2023]);
    });
  });

  // ── Rangos de periodo ────────────────────────────────────────────────────

  describe('trimestreDeMes()', () => {
    it('agrupa los meses de tres en tres', () => {
      expect([1, 2, 3].map(trimestreDeMes)).toEqual([1, 1, 1]);
      expect([4, 5, 6].map(trimestreDeMes)).toEqual([2, 2, 2]);
      expect([10, 11, 12].map(trimestreDeMes)).toEqual([4, 4, 4]);
    });
  });

  describe('rangoTrimestre()', () => {
    it('cubre los tres meses del trimestre', () => {
      expect(rangoTrimestre(2026, 1)).toEqual({ desde: '2026-01', hasta: '2026-03' });
      expect(rangoTrimestre(2026, 3)).toEqual({ desde: '2026-07', hasta: '2026-09' });
      expect(rangoTrimestre(2026, 4)).toEqual({ desde: '2026-10', hasta: '2026-12' });
    });
  });

  describe('rangoMes() y rangoAnio()', () => {
    it('un mes es un rango de un solo periodo', () => {
      expect(rangoMes(2026, 9)).toEqual({ desde: '2026-09', hasta: '2026-09' });
    });

    it('un año va de enero a diciembre', () => {
      expect(rangoAnio(2026)).toEqual({ desde: '2026-01', hasta: '2026-12' });
    });
  });

  describe('trimestreActual()', () => {
    it('devuelve el trimestre en el que estamos', () => {
      const hoy = new Date();
      expect(trimestreActual()).toEqual({
        anio: hoy.getFullYear(),
        trimestre: trimestreDeMes(hoy.getMonth() + 1),
      });
    });
  });

  describe('enRango()', () => {
    const tercerTrimestre = rangoTrimestre(2026, 3);

    it('incluye los extremos', () => {
      expect(enRango('2026-07', tercerTrimestre)).toBeTrue();
      expect(enRango('2026-09', tercerTrimestre)).toBeTrue();
    });

    it('deja fuera lo que cae antes o después', () => {
      expect(enRango('2026-06', tercerTrimestre)).toBeFalse();
      expect(enRango('2026-10', tercerTrimestre)).toBeFalse();
    });

    // La comparación es de cadenas: el formato AAAA-MM ordena bien por sí solo.
    it('compara bien a través del cambio de año', () => {
      const rango = { desde: '2025-11', hasta: '2026-02' };
      expect(enRango('2025-12', rango)).toBeTrue();
      expect(enRango('2026-01', rango)).toBeTrue();
      expect(enRango('2026-03', rango)).toBeFalse();
    });
  });

  describe('etiquetaRango()', () => {
    it('un solo mes se lee como el mes', () => {
      expect(etiquetaRango(rangoMes(2026, 9))).toBe('Septiembre 2026');
    });

    it('un trimestre completo se lee como NT', () => {
      expect(etiquetaRango(rangoTrimestre(2026, 3))).toBe('3T 2026');
    });

    it('el año completo se lee como el año', () => {
      expect(etiquetaRango(rangoAnio(2026))).toBe('2026');
    });

    it('un rango cualquiera se lee de mes a mes', () => {
      expect(etiquetaRango({ desde: '2026-07', hasta: '2026-11' })).toBe('Jul 2026 – Nov 2026');
    });

    it('dos meses seguidos no son un trimestre aunque caigan dentro', () => {
      expect(etiquetaRango({ desde: '2026-07', hasta: '2026-08' })).toBe('Jul 2026 – Ago 2026');
    });
  });

  describe('trimestreCerrado()', () => {
    it('un trimestre del año pasado está cerrado', () => {
      expect(trimestreCerrado(new Date().getFullYear() - 1, 4)).toBeTrue();
    });

    it('el trimestre en curso no lo está', () => {
      const { anio, trimestre } = trimestreActual();
      expect(trimestreCerrado(anio, trimestre)).toBeFalse();
    });
  });
});
