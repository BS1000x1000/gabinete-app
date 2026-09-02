import { motivoSinDatosFiscales, toNum } from './facturas.utils';

describe('toNum', () => {
  it('acepta Decimal, número y nulo', () => {
    expect(toNum({ toNumber: () => 12.5 })).toBe(12.5);
    expect(toNum(7)).toBe(7);
    expect(toNum(null)).toBe(0);
    expect(toNum(undefined, 3)).toBe(3);
  });
});

describe('motivoSinDatosFiscales', () => {
  it('deja pasar al cliente con nombre y NIF del tutor pagador', () => {
    expect(
      motivoSinDatosFiscales({
        nombreTutorPagador: 'Ana Martínez',
        nifTutorPagador: '87654321B',
      }),
    ).toBeNull();
  });

  it('distingue qué falta', () => {
    expect(
      motivoSinDatosFiscales({
        nombreTutorPagador: 'Ana',
        nifTutorPagador: null,
      }),
    ).toContain('NIF');
    expect(
      motivoSinDatosFiscales({
        nombreTutorPagador: null,
        nifTutorPagador: '87654321B',
      }),
    ).toContain('nombre');
    expect(
      motivoSinDatosFiscales({
        nombreTutorPagador: null,
        nifTutorPagador: null,
      }),
    ).toContain('el nombre y el NIF');
  });

  /**
   * Un campo a espacios es un campo vacio: el formulario de datos fiscales manda
   * cadena, no null, cuando se borra el contenido de un input.
   */
  it('trata los espacios en blanco como ausencia', () => {
    expect(
      motivoSinDatosFiscales({
        nombreTutorPagador: '   ',
        nifTutorPagador: '   ',
      }),
    ).toContain('el nombre y el NIF');
  });
});
