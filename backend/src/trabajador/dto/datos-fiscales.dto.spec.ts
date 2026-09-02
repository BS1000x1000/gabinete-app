import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { DatosFiscalesDto } from './trabajador.dto';

/**
 * La ficha fiscal se rellena a trozos, asi que el caso normal es guardarla con
 * campos en blanco. El formulario manda cadena vacia, no `undefined`, y
 * `@IsOptional()` solo salta con `null`/`undefined`: sin `@ValidateIf` cada campo
 * con formato (IBAN, SWIFT, los dos emails) devolvia un 400 al guardar la ficha a
 * medias. Estos tests fijan ese comportamiento.
 */
async function errores(payload: Record<string, unknown>): Promise<string[]> {
  const dto = plainToInstance(DatosFiscalesDto, payload);
  const res = await validate(dto);
  return res.flatMap((e) => Object.values(e.constraints ?? {}));
}

describe('DatosFiscalesDto', () => {
  describe('campos vacíos', () => {
    it('acepta la ficha entera en blanco', async () => {
      expect(
        await errores({
          nifFiscal: '',
          nombreFiscal: '',
          direccionFiscal: '',
          codigoPostalFiscal: '',
          ciudadFiscal: '',
          provinciaFiscal: '',
          iban: '',
          swift: '',
          emailFacturacion: '',
          nombreGestoria: '',
          emailGestoria: '',
        }),
      ).toEqual([]);
    });

    it('acepta guardar sin SWIFT ni email de gestoría', async () => {
      expect(
        await errores({
          nifFiscal: '47461696-T',
          iban: 'ES9121000418450200051332',
          swift: '',
          emailGestoria: '',
          emailFacturacion: 'belen@ejemplo.es',
        }),
      ).toEqual([]);
    });

    it('acepta los campos ausentes', async () => {
      expect(await errores({ nifFiscal: '47461696-T' })).toEqual([]);
    });

    it('trata los espacios en blanco como vacío', async () => {
      expect(await errores({ swift: '   ', iban: '  ' })).toEqual([]);
    });
  });

  describe('IBAN', () => {
    it('admite el formato agrupado que la gente copia del banco', async () => {
      expect(await errores({ iban: 'ES76 2100 8222 1302 0035 7005' })).toEqual([]);
    });

    it('admite el formato electrónico sin espacios', async () => {
      expect(await errores({ iban: 'ES9121000418450200051332' })).toEqual([]);
    });

    it('normaliza a mayúsculas y sin espacios sobrantes', () => {
      const dto = plainToInstance(DatosFiscalesDto, { iban: '  es76 2100 8222  ' });
      expect(dto.iban).toBe('ES76 2100 8222');
    });

    it('rechaza un IBAN con forma imposible', async () => {
      expect(await errores({ iban: 'no-es-un-iban' })).toContain(
        'Formato IBAN no válido',
      );
    });
  });

  describe('SWIFT', () => {
    it('admite 8 y 11 caracteres', async () => {
      expect(await errores({ swift: 'CAIXESBB' })).toEqual([]);
      expect(await errores({ swift: 'CAIXESBBXXX' })).toEqual([]);
    });

    it('acepta minúsculas normalizándolas', async () => {
      expect(await errores({ swift: 'caixesbbxxx' })).toEqual([]);
      const dto = plainToInstance(DatosFiscalesDto, { swift: 'caixesbbxxx' });
      expect(dto.swift).toBe('CAIXESBBXXX');
    });

    it('rechaza una longitud que no existe en ISO 9362', async () => {
      expect(await errores({ swift: 'CAIXES' })).toContain(
        'Formato SWIFT/BIC no válido',
      );
    });
  });

  describe('recorte de espacios', () => {
    /**
     * Estos campos van IMPRESOS en la factura y acaban en el libro de la
     * gestoría. En la BD se llegaron a guardar `'12345678Z '` y `'28013 '`: en
     * papel no se ve, pero está ahí.
     */
    it('recorta los campos que se imprimen en la factura', () => {
      const dto = plainToInstance(DatosFiscalesDto, {
        nifFiscal: '  12345678z  ',
        nombreFiscal: '  Belén Palacios  ',
        direccionFiscal: '  Calle Mayor, 14  ',
        codigoPostalFiscal: '  28013 ',
        ciudadFiscal: ' Madrid ',
        provinciaFiscal: ' Madrid ',
      });

      expect(dto.nifFiscal).toBe('12345678Z');
      expect(dto.nombreFiscal).toBe('Belén Palacios');
      expect(dto.direccionFiscal).toBe('Calle Mayor, 14');
      expect(dto.codigoPostalFiscal).toBe('28013');
      expect(dto.ciudadFiscal).toBe('Madrid');
      expect(dto.provinciaFiscal).toBe('Madrid');
    });

    it('el NIF se guarda en mayúsculas', () => {
      const dto = plainToInstance(DatosFiscalesDto, { nifFiscal: '47461696-t' });
      expect(dto.nifFiscal).toBe('47461696-T');
    });
  });

  describe('emails', () => {
    it('rechaza un email mal escrito, pero solo si se ha escrito algo', async () => {
      expect(await errores({ emailGestoria: 'esto-no-es-un-email' })).not.toEqual(
        [],
      );
      expect(await errores({ emailGestoria: '' })).toEqual([]);
    });
  });
});
