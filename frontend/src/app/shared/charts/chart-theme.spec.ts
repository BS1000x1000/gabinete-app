import { ejeEuros, ejeNumerico, CHART_COLORS } from './chart-theme';

describe('chart-theme', () => {
  describe('ejeNumerico()', () => {
    it('sin sufijo no pone callback: los ticks salen tal cual', () => {
      const eje = ejeNumerico();

      expect(eje.grid.color).toBe(CHART_COLORS.grid);
      expect((eje.ticks as any).callback).toBeUndefined();
    });

    it('con sufijo lo añade al tick', () => {
      const callback = (ejeNumerico('h').ticks as any).callback;

      expect(callback(7)).toBe('7h');
    });
  });

  /**
   * `ejeEuros` ahora delega en `ejeNumerico`. Este test existe para que el
   * refactor no cambie en silencio el aspecto de los gráficos de facturación.
   */
  it('ejeEuros sigue rotulando en euros', () => {
    const callback = (ejeEuros().ticks as any).callback;

    expect(callback(250)).toBe('250€');
  });
});
