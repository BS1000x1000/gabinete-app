import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateDatosPagadorDto } from './update-datos-pagador.dto';

async function errores(payload: Record<string, unknown>): Promise<string[]> {
  const dto = plainToInstance(UpdateDatosPagadorDto, payload);
  const res = await validate(dto);
  return res.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('UpdateDatosPagadorDto', () => {
  /**
   * El formulario del perfil manda los seis campos siempre, con cadena vacía los
   * que no se han rellenado. `@IsOptional()` solo salta con `null`/`undefined`,
   * así que sin `@ValidateIf` guardar el pagador sin email devolvía un 400.
   */
  it('acepta guardar el pagador sin email', async () => {
    expect(
      await errores({
        nifTutorPagador: '87654321B',
        nombreTutorPagador: 'Ana Martínez',
        direccionFiscalTutor: '',
        codigoPostalTutor: '',
        ciudadTutor: '',
        emailFacturacion: '',
      }),
    ).toEqual([]);
  });

  it('acepta la ficha del pagador entera en blanco', async () => {
    expect(
      await errores({
        nifTutorPagador: '',
        nombreTutorPagador: '',
        emailFacturacion: '',
      }),
    ).toEqual([]);
  });

  it('sigue rechazando un email mal escrito', async () => {
    expect(await errores({ emailFacturacion: 'no-es-un-email' })).not.toEqual([]);
  });

  /** Estos valores se imprimen en la factura y viajan al libro de la gestoría. */
  it('recorta los espacios y pone el NIF en mayúsculas', () => {
    const dto = plainToInstance(UpdateDatosPagadorDto, {
      nifTutorPagador: ' 87654321b ',
      nombreTutorPagador: '  Ana Martínez  ',
      codigoPostalTutor: ' 28942 ',
      ciudadTutor: ' Fuenlabrada ',
      emailFacturacion: '  ana@ejemplo.es  ',
    });

    expect(dto.nifTutorPagador).toBe('87654321B');
    expect(dto.nombreTutorPagador).toBe('Ana Martínez');
    expect(dto.codigoPostalTutor).toBe('28942');
    expect(dto.ciudadTutor).toBe('Fuenlabrada');
    expect(dto.emailFacturacion).toBe('ana@ejemplo.es');
  });
});
