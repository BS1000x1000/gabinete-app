import { Prisma } from '@prisma/client';

/**
 * Lo que hay que traerse con una factura para poder pintarla, enviarla o
 * empaquetarla: los datos fiscales del emisor y los del tutor pagador.
 *
 * Vive aparte del servicio porque lo comparten `facturas.service` y
 * `facturas-pack.service`, y una segunda copia se habria desincronizado en
 * cuanto uno de los dos necesitara un campo mas.
 */
export const facturaInclude = {
  trabajador: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      nombreFiscal: true,
      nifFiscal: true,
      direccionFiscal: true,
      codigoPostalFiscal: true,
      ciudadFiscal: true,
      provinciaFiscal: true,
      numeroColegiado: true,
      iban: true,
      swift: true,
      emailFacturacion: true,
      email: true,
    },
  },
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      nifTutorPagador: true,
      nombreTutorPagador: true,
      direccionFiscalTutor: true,
      codigoPostalTutor: true,
      ciudadTutor: true,
      emailFacturacion: true,
    },
  },
  contrato: { select: { id: true, tipoSesion: true } },
} satisfies Prisma.FacturaInclude;

export type FacturaCompleta = Prisma.FacturaGetPayload<{
  include: typeof facturaInclude;
}>;
