import { Injectable, Logger } from '@nestjs/common';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import {
  buildFacturaHtml,
  FacturaTemplateData,
} from './templates/factura.template';
import { toNum } from './facturas.utils';

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
    iban: string | null;
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

    const data: FacturaTemplateData = {
      nombreFiscal: t.nombreFiscal ?? `${t.nombre} ${t.apellidos}`,
      nifFiscal: t.nifFiscal ?? '',
      direccionFiscal: t.direccionFiscal ?? '',
      codigoPostalFiscal: t.codigoPostalFiscal ?? '',
      ciudadFiscal: t.ciudadFiscal ?? '',
      provinciaFiscal: t.provinciaFiscal ?? '',
      iban: t.iban ?? '',
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
