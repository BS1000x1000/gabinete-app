import { Injectable, Logger } from '@nestjs/common';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import {
  buildFacturaHtml,
  FacturaTemplateData,
} from './templates/factura.template';
import { toNum } from './facturas.utils';

/**
 * Dias naturales que la familia tiene para pagar desde que se expide la factura.
 * Sale de la clausula 3 del contrato: "dentro de los primeros diez dias naturales
 * siguientes a su emision". Se cuenta el propio dia de emision, asi que una
 * factura del 1 vence el 10, como en el modelo de factura del gabinete.
 */
const DIAS_VENCIMIENTO = 9;

const FORMA_PAGO = 'Transferencia bancaria';

/** "2026-09" -> "SEPTIEMBRE 2026". Vuelve al periodo crudo si no encaja. */
function etiquetaPeriodo(periodoFacturado: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec(periodoFacturado);
  if (!m) return periodoFacturado;
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return periodoFacturado;
  const nombre = new Date(anio, mes - 1, 1).toLocaleDateString('es-ES', {
    month: 'long',
  });
  return `${nombre} ${anio}`.toUpperCase();
}

type FacturaConRelaciones = {
  numeroFormateado: string;
  anio: number;
  fechaEmision: Date;
  periodoFacturado: string;
  concepto: string;
  importe: { toNumber: () => number } | number;
  ivaPorcentaje: { toNumber: () => number } | number;
  ivaImporte: { toNumber: () => number } | number;
  retencionPorcentaje: { toNumber: () => number } | number;
  retencionImporte: { toNumber: () => number } | number;
  exencionIvaTexto: string | null;
  total: { toNumber: () => number } | number;
  trabajador: {
    nombreFiscal: string | null;
    nombre: string;
    apellidos: string;
    nifFiscal: string | null;
    direccionFiscal: string | null;
    codigoPostalFiscal: string | null;
    ciudadFiscal: string | null;
    provinciaFiscal: string | null;
    numeroColegiado: string | null;
    iban: string | null;
    swift: string | null;
    emailFacturacion: string | null;
    email: string;
  };
  cliente: {
    nombreTutorPagador: string | null;
    nombre: string;
    apellidos: string;
    nifTutorPagador: string | null;
    direccionFiscalTutor: string | null;
    codigoPostalTutor: string | null;
    ciudadTutor: string | null;
  };
};

@Injectable()
export class FacturasPdfService {
  private readonly logger = new Logger(FacturasPdfService.name);

  constructor(private readonly pdfGenerator: PdfGeneratorService) {}

  async generarPdf(factura: FacturaConRelaciones): Promise<Buffer> {
    const t = factura.trabajador;
    const c = factura.cliente;

    const vencimiento = new Date(factura.fechaEmision);
    vencimiento.setDate(vencimiento.getDate() + DIAS_VENCIMIENTO);

    const data: FacturaTemplateData = {
      nombreFiscal: t.nombreFiscal ?? `${t.nombre} ${t.apellidos}`,
      nifFiscal: t.nifFiscal ?? '',
      direccionFiscal: t.direccionFiscal ?? '',
      codigoPostalFiscal: t.codigoPostalFiscal ?? '',
      ciudadFiscal: t.ciudadFiscal ?? '',
      provinciaFiscal: t.provinciaFiscal ?? '',
      numeroColegiado: t.numeroColegiado ?? '',
      iban: t.iban ?? '',
      swift: t.swift ?? '',
      emailFacturacion: t.emailFacturacion ?? t.email,
      // Sin fallback al nombre del menor: el destinatario de la factura es el
      // tutor pagador. Las facturas nuevas ya no se emiten sin estos datos
      // (`motivoSinDatosFiscales`); las antiguas salen con el bloque vacio, que
      // es visible, en vez de con el nombre del nino, que no lo era.
      nombreTutorPagador: c.nombreTutorPagador ?? '',
      nifTutorPagador: c.nifTutorPagador ?? '',
      direccionFiscalTutor: c.direccionFiscalTutor ?? '',
      codigoPostalTutor: c.codigoPostalTutor ?? '',
      ciudadTutor: c.ciudadTutor ?? '',
      numeroFormateado: factura.numeroFormateado,
      fechaEmision: new Date(factura.fechaEmision).toLocaleDateString('es-ES'),
      periodoFacturado: factura.periodoFacturado,
      periodoEtiqueta: etiquetaPeriodo(factura.periodoFacturado),
      fechaVencimiento: vencimiento.toLocaleDateString('es-ES'),
      formaPago: FORMA_PAGO,
      concepto: factura.concepto,
      importe: toNum(factura.importe),
      ivaPorcentaje: toNum(factura.ivaPorcentaje),
      ivaImporte: toNum(factura.ivaImporte),
      retencionPorcentaje: toNum(factura.retencionPorcentaje),
      retencionImporte: toNum(factura.retencionImporte),
      exencionIvaTexto: factura.exencionIvaTexto,
      total: toNum(factura.total),
    };

    this.logger.log(`Generando PDF factura ${factura.numeroFormateado}`);
    const html = buildFacturaHtml(data);
    return this.pdfGenerator.generatePdf(html);
  }
}
