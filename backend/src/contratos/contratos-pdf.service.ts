import { Injectable, Logger } from '@nestjs/common';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { buildContratoHtml, ContratoTemplateData } from './templates/contrato.template';

type ContratoConRelaciones = {
  id: string;
  tipoSesion: string;
  cuotaMensual: { toNumber: () => number } | number;
  fechaInicio: Date;
  fechaFin: Date | null;
  fechaFirma: Date;
  notas: string | null;
  slots: Array<{
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    duracionMinutos: number;
    modalidad: string;
  }>;
  trabajador: {
    nombre: string;
    apellidos: string;
    nombreFiscal: string | null;
    nifFiscal: string | null;
    direccionFiscal: string | null;
    codigoPostalFiscal: string | null;
    ciudadFiscal: string | null;
    provinciaFiscal: string | null;
    emailFacturacion: string | null;
    email: string;
  };
  cliente: {
    nombre: string;
    apellidos: string;
    nombreTutorPagador: string | null;
    nifTutorPagador: string | null;
    direccionFiscalTutor: string | null;
    codigoPostalTutor: string | null;
    ciudadTutor: string | null;
  };
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

@Injectable()
export class ContratosPdfService {
  private readonly logger = new Logger(ContratosPdfService.name);

  constructor(private readonly pdfGenerator: PdfGeneratorService) {}

  async generarPdf(contrato: ContratoConRelaciones): Promise<Buffer> {
    const { trabajador, cliente } = contrato;
    const cuota = typeof contrato.cuotaMensual === 'number'
      ? contrato.cuotaMensual
      : contrato.cuotaMensual.toNumber();

    const data: ContratoTemplateData = {
      nombreFiscal:        trabajador.nombreFiscal ?? `${trabajador.nombre} ${trabajador.apellidos}`,
      nifFiscal:           trabajador.nifFiscal ?? '',
      direccionFiscal:     trabajador.direccionFiscal ?? '',
      codigoPostalFiscal:  trabajador.codigoPostalFiscal ?? '',
      ciudadFiscal:        trabajador.ciudadFiscal ?? '',
      provinciaFiscal:     trabajador.provinciaFiscal ?? '',
      emailPrestador:      trabajador.emailFacturacion ?? trabajador.email,
      nombrePagador:       cliente.nombreTutorPagador ?? `${cliente.nombre} ${cliente.apellidos}`,
      nifPagador:          cliente.nifTutorPagador ?? '',
      direccionPagador:    cliente.direccionFiscalTutor ?? '',
      codigoPostalPagador: cliente.codigoPostalTutor ?? '',
      ciudadPagador:       cliente.ciudadTutor ?? '',
      nombreBeneficiario:  `${cliente.nombre} ${cliente.apellidos}`,
      tipoSesion:          contrato.tipoSesion,
      cuotaMensual:        cuota,
      fechaInicio:         fmtDate(contrato.fechaInicio),
      fechaFin:            contrato.fechaFin ? fmtDate(contrato.fechaFin) : null,
      fechaFirma:          fmtDate(contrato.fechaFirma),
      notas:               contrato.notas,
      slots:               contrato.slots,
      exentoIva:           true,
      retencionPorcentaje: 0,
    };

    this.logger.log(`Generando PDF contrato ${contrato.id}`);
    return this.pdfGenerator.generatePdf(buildContratoHtml(data));
  }
}
