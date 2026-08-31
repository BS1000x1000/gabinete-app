import { Injectable, Logger } from '@nestjs/common';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { PrismaService } from '../prisma/prisma.service';
import { AmbitoFestivo } from '@prisma/client';
import {
  buildContratoHtml,
  ContratoTemplateData,
} from './templates/contrato.template';
import { Profesional } from '../common/documentos/documento-base';
import {
  CalendarioContratoService,
  CursoEscolar,
} from '../expediente/calendario-contrato.service';
import { toNum } from '../facturas/facturas.utils';

/**
 * Traduce un contrato guardado en la base a los datos que espera la plantilla.
 *
 * Es tambien el sitio donde se decide de donde sale cada hueco del documento,
 * asi que lo reutiliza el expediente para los dos consentimientos: los tres
 * papeles nombran a las mismas personas y no pueden discrepar.
 */

type ContratoConRelaciones = {
  cuotaMensual: number | { toNumber: () => number };
  fechaInicio: Date;
  fechaFirma: Date;
  notas: string | null;
  slots: Array<{
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
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
    numeroColegiado: string | null;
    colegioProfesional: string | null;
    numeroPoliza: string | null;
    direccionProfesional: string | null;
  };
  cliente: {
    nombre: string;
    apellidos: string;
    dni: string | null;
    fechaNacimiento: Date | null;
    ciudad: string;
    provincia: string;
    contactosFamiliares: Array<{
      nombre: string;
      apellidos: string;
      dni: string | null;
      esTutorLegal: boolean;
      esContactoPrincipal: boolean;
      esResponsablePago: boolean;
    }>;
  };
};

export interface TutorContrato {
  nombreCompleto: string;
  nif: string | null;
}

/** Lo que le falta al contrato para salir completo, en lenguaje llano. */
export type Faltante = string;

@Injectable()
export class ContratosPdfService {
  private readonly logger = new Logger(ContratosPdfService.name);

  constructor(
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly prisma: PrismaService,
    private readonly calendario: CalendarioContratoService,
  ) {}

  // ── Datos compartidos por los tres documentos ──────────────

  profesionalDe(t: ContratoConRelaciones['trabajador']): Profesional {
    return {
      nombreCompleto: t.nombreFiscal ?? `${t.nombre} ${t.apellidos}`,
      nif: t.nifFiscal,
      numeroColegiado: t.numeroColegiado,
      colegioProfesional: t.colegioProfesional,
      direccionProfesional: t.direccionProfesional ?? this.direccionFiscal(t),
      email: t.emailFacturacion ?? t.email,
      numeroPoliza: t.numeroPoliza,
    };
  }

  private direccionFiscal(t: ContratoConRelaciones['trabajador']): string | null {
    const partes = [t.direccionFiscal, t.codigoPostalFiscal, t.ciudadFiscal]
      .filter(Boolean)
      .join(', ');
    return partes.length > 0 ? partes : null;
  }

  /**
   * Los dos que firman.
   *
   * Se prefieren los marcados como tutor legal. Si nadie lo esta —clientes
   * dados de alta antes de que existiera el campo— se cae a los dos primeros
   * contactos, priorizando al principal y al responsable de pago, y el
   * expediente avisa de que hay que revisarlo.
   */
  tutoresDe(cliente: ContratoConRelaciones['cliente']): TutorContrato[] {
    const todos = cliente.contactosFamiliares ?? [];
    const marcados = todos.filter(c => c.esTutorLegal);

    const elegidos =
      marcados.length > 0
        ? marcados
        : [...todos].sort((a, b) => {
            const peso = (c: typeof a) =>
              (c.esContactoPrincipal ? 2 : 0) + (c.esResponsablePago ? 1 : 0);
            return peso(b) - peso(a);
          });

    return elegidos.slice(0, 2).map(c => ({
      nombreCompleto: `${c.nombre} ${c.apellidos}`.trim(),
      nif: c.dni,
    }));
  }

  /** Festivos aplicables al cliente durante el curso del contrato. */
  async festivosDelCurso(curso: CursoEscolar, provincia: string) {
    return this.prisma.festivo.findMany({
      where: {
        anio: { in: [curso.anioInicio, curso.anioInicio + 1] },
        OR: [
          { ambito: AmbitoFestivo.NACIONAL },
          { ambito: AmbitoFestivo.AUTONOMICO, ccaa: provincia },
          { ambito: AmbitoFestivo.LOCAL, provincia },
        ],
      },
      select: { fecha: true, descripcion: true },
      orderBy: { fecha: 'asc' },
    });
  }

  /**
   * Repasa el contrato y devuelve, en lenguaje llano, lo que saldria en blanco.
   * Se muestra en el expediente para que la terapeuta lo complete antes de
   * mandar nada a la familia.
   */
  faltantes(contrato: ContratoConRelaciones): Faltante[] {
    const faltan: Faltante[] = [];
    const p = this.profesionalDe(contrato.trabajador);
    const tutores = this.tutoresDe(contrato.cliente);

    if (!p.nif) faltan.push('NIF de la profesional');
    if (!p.numeroColegiado) faltan.push('Número de colegiada');
    if (!p.colegioProfesional) faltan.push('Colegio profesional');
    if (!p.direccionProfesional) faltan.push('Domicilio profesional');
    if (!p.numeroPoliza) faltan.push('Número de póliza del seguro de responsabilidad civil');

    if (tutores.length === 0) faltan.push('Ningún progenitor o tutor legal registrado');
    else if (tutores.length === 1) faltan.push('Solo hay un tutor legal; el contrato prevé dos');

    tutores.forEach((t, i) => {
      if (!t.nombreCompleto) faltan.push(`Nombre del tutor legal ${i + 1}`);
      if (!t.nif) faltan.push(`NIF del tutor legal ${i + 1}`);
    });

    if (!contrato.cliente.contactosFamiliares?.some(c => c.esTutorLegal)) {
      faltan.push('Nadie está marcado como tutor legal (se han tomado los dos primeros contactos)');
    }
    if (!contrato.cliente.fechaNacimiento) faltan.push('Fecha de nacimiento del menor');
    if (contrato.slots.length === 0) faltan.push('Día y hora de la sesión semanal');
    if (toNum(contrato.cuotaMensual) <= 0) faltan.push('Cuota mensual');

    return faltan;
  }

  // ── Generacion ─────────────────────────────────────────────

  async construirDatos(
    contrato: ContratoConRelaciones,
  ): Promise<ContratoTemplateData> {
    const slot = contrato.slots[0] ?? null;
    const curso = this.calendario.cursoDe(contrato.fechaInicio);
    const festivos = await this.festivosDelCurso(curso, contrato.cliente.provincia);

    const calendario = slot
      ? this.calendario.construirTabla(slot.diaSemana, curso, festivos)
      : [];
    const periodos = this.calendario.textoPeriodosSinServicio(curso, festivos);

    const c = contrato.cliente;

    return {
      profesional: this.profesionalDe(contrato.trabajador),
      tutores: this.tutoresDe(c),
      menor: {
        nombreCompleto: `${c.nombre} ${c.apellidos}`.trim(),
        fechaNacimiento: c.fechaNacimiento
          ? new Date(c.fechaNacimiento).toLocaleDateString('es-ES')
          : null,
      },
      diaSemana: slot?.diaSemana ?? null,
      horario: slot ? `${slot.horaInicio} a ${slot.horaFin}` : null,
      cuotaMensual: toNum(contrato.cuotaMensual) || null,
      ciudadFirma: c.ciudad || null,
      calendario,
      cursoEtiqueta: this.calendario.etiquetaCurso(curso),
      periodoNavidad: periodos.navidad,
      periodoSemanaSanta: periodos.semanaSanta,
      notas: contrato.notas,
    };
  }

  async generarPdf(contrato: ContratoConRelaciones): Promise<Buffer> {
    const datos = await this.construirDatos(contrato);
    this.logger.log(
      `Generando PDF de contrato para ${datos.menor.nombreCompleto} (${datos.calendario.length} meses de calendario)`,
    );
    return this.pdfGenerator.generatePdf(buildContratoHtml(datos));
  }
}
