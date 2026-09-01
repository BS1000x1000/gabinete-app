import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import {
  CategoriaDocumento,
  EstadoFirmaDocumento,
  OrigenDocumento,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentosService } from '../documentos/documentos.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import {
  ContratosPdfService,
  Faltante,
} from '../contratos/contratos-pdf.service';
import { CONTRATO_PDF_INCLUDE } from '../contratos/contratos.include';
import { buildContratoHtml } from '../contratos/templates/contrato.template';
import { ConsentimientosService } from '../consentimientos/consentimientos.service';
import { FirmaExpedienteDto } from '../consentimientos/dto/consentimiento.dto';
import * as PlantillaContrato from '../contratos/templates/contrato.template';
import * as PlantillaInformado from './templates/consentimiento-informado.template';
import * as PlantillaDatos from './templates/consentimiento-datos.template';

type UsuarioPeticion = { userId: string; rol: string };

/** Los tres papeles que la familia firma al empezar. */
export const DOCUMENTOS_EXPEDIENTE = [
  {
    categoria: CategoriaDocumento.CONTRATO,
    nombre: 'Contrato de prestación de servicios pedagógicos',
    fichero: 'contrato-servicios-pedagogicos.pdf',
    version: PlantillaContrato.PLANTILLA_VERSION,
    validada: PlantillaContrato.PLANTILLA_VALIDADA,
    motivoNoValidada: null as string | null,
  },
  {
    categoria: CategoriaDocumento.CONSENTIMIENTO_INFORMADO,
    nombre: 'Consentimiento informado para la intervención pedagógica',
    fichero: 'consentimiento-informado.pdf',
    version: PlantillaInformado.PLANTILLA_VERSION,
    validada: PlantillaInformado.PLANTILLA_VALIDADA,
    motivoNoValidada: null as string | null,
  },
  {
    categoria: CategoriaDocumento.CONSENTIMIENTO_DATOS,
    nombre: 'Consentimiento para el tratamiento de datos personales',
    fichero: 'consentimiento-proteccion-datos.pdf',
    version: PlantillaDatos.PLANTILLA_VERSION,
    validada: PlantillaDatos.PLANTILLA_VALIDADA,
    motivoNoValidada: PlantillaDatos.MOTIVO_NO_VALIDADA as string | null,
  },
] as const;

export const CATEGORIAS_EXPEDIENTE: CategoriaDocumento[] =
  DOCUMENTOS_EXPEDIENTE.map(d => d.categoria);

@Injectable()
export class ExpedienteService {
  private readonly logger = new Logger(ExpedienteService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly documentos: DocumentosService,
    private readonly pdf: PdfGeneratorService,
    private readonly contratosPdf: ContratosPdfService,
    private readonly consentimientos: ConsentimientosService,
  ) {}

  // ============================================================
  // GENERAR
  // ============================================================

  /**
   * Produce los tres documentos del contrato y los deja en la documentación
   * del cliente.
   *
   * Sustituye a los que siguen sin firmar y **nunca toca uno ya firmado**: si
   * la familia devolvió el contrato firmado, regenerar no puede hacerlo
   * desaparecer.
   */
  async generar(
    contratoId: string,
    user: UsuarioPeticion,
  ): Promise<{ generados: number; omitidos: number; faltantes: Faltante[] }> {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id: contratoId },
      include: CONTRATO_PDF_INCLUDE,
    });
    if (!contrato) throw new NotFoundException(`Contrato ${contratoId} no encontrado`);

    const datos = await this.contratosPdf.construirDatos(contrato as any);
    const faltantes = this.contratosPdf.faltantes(contrato as any);

    const yaFirmados = await this.prisma.documentoCliente.findMany({
      where: {
        clienteId: contrato.clienteId,
        categoria: { in: [...CATEGORIAS_EXPEDIENTE] },
        estadoFirma: EstadoFirmaDocumento.FIRMADO,
      },
      select: { categoria: true },
    });
    const firmadas = new Set(yaFirmados.map(d => d.categoria));

    let generados = 0;
    let omitidos = 0;

    for (const def of DOCUMENTOS_EXPEDIENTE) {
      if (firmadas.has(def.categoria)) {
        omitidos++;
        continue;
      }

      await this.borrarGeneradoAnterior(contrato.clienteId, def.categoria, user);

      const html = this.htmlDe(def.categoria, datos);
      const buffer = await this.pdf.generatePdf(html);

      await this.documentos.create(
        {
          clienteId: contrato.clienteId,
          categoria: def.categoria,
          nombre: def.nombre,
        },
        {
          originalname: def.fichero,
          mimetype: 'application/pdf',
          size: buffer.length,
          buffer,
        },
        user,
        {
          origen: OrigenDocumento.GENERADO,
          estadoFirma: EstadoFirmaDocumento.GENERADO,
          plantillaVersion: def.version,
          contratoId,
        },
      );
      generados++;
    }

    this.logger.log(
      `Expediente del contrato ${contratoId}: ${generados} generados, ${omitidos} omitidos por estar firmados`,
    );
    return { generados, omitidos, faltantes };
  }

  private htmlDe(categoria: CategoriaDocumento, datos: any): string {
    switch (categoria) {
      case CategoriaDocumento.CONTRATO:
        return buildContratoHtml(datos);

      case CategoriaDocumento.CONSENTIMIENTO_INFORMADO:
        return PlantillaInformado.buildConsentimientoInformadoHtml({
          profesional: datos.profesional,
          menor: datos.menor,
          tutores: datos.tutores,
          ciudadFirma: datos.ciudadFirma,
        });

      case CategoriaDocumento.CONSENTIMIENTO_DATOS:
        return PlantillaDatos.buildConsentimientoDatosHtml({
          profesional: datos.profesional,
          menor: { nombreCompleto: datos.menor.nombreCompleto, dni: datos.menor.dni ?? null },
          tutores: datos.tutores,
          ciudadFirma: datos.ciudadFirma,
        });

      default:
        throw new BadRequestException(`${categoria} no es un documento del expediente`);
    }
  }

  /** Un documento generado se reemplaza; uno subido a mano se respeta. */
  private async borrarGeneradoAnterior(
    clienteId: string,
    categoria: CategoriaDocumento,
    user: UsuarioPeticion,
  ): Promise<void> {
    const previos = await this.prisma.documentoCliente.findMany({
      where: {
        clienteId,
        categoria,
        origen: OrigenDocumento.GENERADO,
        estadoFirma: { in: [EstadoFirmaDocumento.GENERADO, EstadoFirmaDocumento.ENVIADO] },
      },
      select: { id: true },
    });
    for (const p of previos) {
      await this.documentos.remove(p.id, user).catch(e =>
        this.logger.warn(`No se pudo borrar el documento previo ${p.id}: ${e?.message}`),
      );
    }
  }

  /**
   * Genera un documento al vuelo y devuelve el PDF, sin guardarlo en ninguna
   * parte.
   *
   * Sirve para dos cosas: ver como va a quedar antes de generar de verdad, y
   * poder trabajar en local, donde no hay Object Storage configurado. Al no
   * persistir nada, no depende del almacenamiento ni deja rastro.
   */
  async vistaPrevia(
    contratoId: string,
    categoria: CategoriaDocumento,
    user: UsuarioPeticion,
  ): Promise<{ buffer: Buffer; nombreFichero: string }> {
    const def = DOCUMENTOS_EXPEDIENTE.find(d => d.categoria === categoria);
    if (!def) {
      throw new BadRequestException(`${categoria} no es un documento del expediente`);
    }

    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id: contratoId },
      include: CONTRATO_PDF_INCLUDE,
    });
    if (!contrato) throw new NotFoundException(`Contrato ${contratoId} no encontrado`);

    await this.assertAccesoCliente(contrato.clienteId, user);

    const datos = await this.contratosPdf.construirDatos(contrato as any);
    const buffer = await this.pdf.generatePdf(this.htmlDe(categoria, datos));

    return { buffer, nombreFichero: def.fichero };
  }

  /**
   * Mismo criterio de acceso que `documentos`: gestion lo ve todo; un terapeuta,
   * solo los clientes que tiene asignados.
   */
  private async assertAccesoCliente(
    clienteId: string,
    user: UsuarioPeticion,
  ): Promise<void> {
    if (user.rol === 'ADMIN' || user.rol === 'RECEP') return;

    const asignado = await this.prisma.clienteTrabajador.findFirst({
      where: { clienteId, trabajadorId: user.userId, activo: true },
      select: { id: true },
    });
    if (!asignado) {
      throw new ForbiddenException('No tienes acceso a este cliente');
    }
  }

  // ============================================================
  // CONSULTAR
  // ============================================================

  /**
   * Estado del expediente de un cliente: una fila por documento, exista o no,
   * para que la pantalla pueda pintar siempre los tres.
   */
  async estado(clienteId: string, user: UsuarioPeticion) {
    const documentos = await this.documentos.findByCliente(clienteId, user);
    const porCategoria = new Map(
      documentos
        .filter((d: any) => CATEGORIAS_EXPEDIENTE.includes(d.categoria))
        .map((d: any) => [d.categoria, d]),
    );

    const contrato = await this.prisma.contratoServicio.findFirst({
      where: { clienteId, estado: { in: ['ACTIVO', 'BORRADOR'] } },
      include: CONTRATO_PDF_INCLUDE,
      orderBy: { fechaInicio: 'desc' },
    });

    const faltantes = contrato ? this.contratosPdf.faltantes(contrato as any) : [];

    return {
      contratoId: contrato?.id ?? null,
      /** Sin contrato no hay día, hora ni cuota que poner en los documentos. */
      puedeGenerar: contrato !== null,
      faltantes,
      documentos: DOCUMENTOS_EXPEDIENTE.map(def => {
        const doc: any = porCategoria.get(def.categoria) ?? null;
        return {
          categoria: def.categoria,
          nombre: def.nombre,
          plantillaValidada: def.validada,
          motivoNoValidada: def.motivoNoValidada,
          documentoId: doc?.id ?? null,
          estadoFirma: doc?.estadoFirma ?? null,
          origen: doc?.origen ?? null,
          plantillaVersion: doc?.plantillaVersion ?? null,
          fechaEnvio: doc?.fechaEnvio ?? null,
          actualizadoEn: doc?.updatedAt ?? null,
          /** Solo se puede mandar lo que existe y cuya plantilla está validada. */
          puedeEnviar: Boolean(doc) && def.validada && doc?.estadoFirma !== 'FIRMADO',
        };
      }),
    };
  }

  // ============================================================
  // FIRMA
  // ============================================================

  /**
   * Registra la versión firmada que devuelve la familia. El PDF firmado entra
   * como un documento más, enlazado al generado al que sustituye.
   *
   * Para el consentimiento de datos hacen falta además el tutor que firma y las
   * casillas que marcó: sin eso el registro no acredita nada, así que se exigen
   * aquí y no se aceptan por defecto.
   */
  async registrarFirmado(
    documentoGeneradoId: string,
    fichero: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    user: UsuarioPeticion,
    datosFirma: FirmaExpedienteDto = {},
  ) {
    const generado = await this.prisma.documentoCliente.findUnique({
      where: { id: documentoGeneradoId },
      select: { id: true, clienteId: true, categoria: true, contratoId: true, estadoFirma: true },
    });
    if (!generado) throw new NotFoundException('Documento no encontrado');
    if (!CATEGORIAS_EXPEDIENTE.includes(generado.categoria)) {
      throw new BadRequestException('Ese documento no forma parte del expediente inicial');
    }
    if (generado.estadoFirma === EstadoFirmaDocumento.FIRMADO) {
      throw new BadRequestException('Ese documento ya consta como firmado');
    }

    const def = DOCUMENTOS_EXPEDIENTE.find(d => d.categoria === generado.categoria)!;

    // Se comprueba antes de subir nada: si el tutor falta o no lo es, no
    // queremos dejar un PDF huerfano en el bucket y un consentimiento a medias.
    if (generado.categoria === CategoriaDocumento.CONSENTIMIENTO_DATOS) {
      if (!datosFirma.familiarId) {
        throw new BadRequestException(
          'Indica el tutor legal que ha firmado el consentimiento de datos',
        );
      }
      await this.consentimientos.assertTutorLegal(
        generado.clienteId,
        datosFirma.familiarId,
      );
    }

    const firmado = await this.documentos.create(
      {
        clienteId: generado.clienteId,
        categoria: generado.categoria,
        nombre: `${def.nombre} (firmado)`,
      },
      fichero,
      user,
      {
        origen: OrigenDocumento.SUBIDO,
        estadoFirma: EstadoFirmaDocumento.FIRMADO,
        contratoId: generado.contratoId,
        firmadoDeId: generado.id,
      },
    );

    await this.prisma.documentoCliente.update({
      where: { id: generado.id },
      data: { estadoFirma: EstadoFirmaDocumento.FIRMADO },
    });

    // Firmar el consentimiento de datos es lo que de verdad acredita el
    // consentimiento RGPD: aquí es donde nace la fila del histórico, con el PDF
    // firmado como evidencia y la versión de plantilla que la familia leyó.
    if (generado.categoria === CategoriaDocumento.CONSENTIMIENTO_DATOS) {
      await this.consentimientos.registrar(
        generado.clienteId,
        {
          familiarId: datosFirma.familiarId!,
          versionTexto: def.version,
          documentoId: firmado.id,
          fechaFirma: datosFirma.fechaFirma ? new Date(datosFirma.fechaFirma) : null,
          autorizaInformesTerceros: datosFirma.autorizaInformesTerceros ?? false,
          autorizaCoordinacionCentro: datosFirma.autorizaCoordinacionCentro ?? false,
          autorizaImagenes: datosFirma.autorizaImagenes ?? false,
          consentimientoMenor14: datosFirma.consentimientoMenor14 ?? false,
        },
        user,
      );
    }

    this.logger.log(`Documento ${generado.categoria} firmado para cliente ${generado.clienteId}`);
    return firmado;
  }

  /** Deja constancia de que el documento salió hacia la familia. */
  async marcarEnviado(documentoId: string, user: UsuarioPeticion) {
    const doc = await this.prisma.documentoCliente.findUnique({
      where: { id: documentoId },
      select: { id: true, clienteId: true, categoria: true, estadoFirma: true },
    });
    if (!doc) throw new NotFoundException('Documento no encontrado');

    const def = DOCUMENTOS_EXPEDIENTE.find(d => d.categoria === doc.categoria);
    if (!def) throw new BadRequestException('Ese documento no forma parte del expediente inicial');

    // Puerta dura: una plantilla sin validar no sale de aquí ni por error.
    if (!def.validada) {
      throw new ForbiddenException(
        `No se puede enviar "${def.nombre}": ${def.motivoNoValidada ?? 'la plantilla no está validada'}`,
      );
    }
    if (doc.estadoFirma === EstadoFirmaDocumento.FIRMADO) {
      throw new BadRequestException('Ese documento ya está firmado');
    }

    return this.prisma.documentoCliente.update({
      where: { id: documentoId },
      data: { estadoFirma: EstadoFirmaDocumento.ENVIADO, fechaEnvio: new Date() },
      select: { id: true, estadoFirma: true, fechaEnvio: true },
    });
  }
}
