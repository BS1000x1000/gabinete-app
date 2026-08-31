import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AmbitoFestivo, EstadoContrato, EstadoSesion, ModalidadSesion } from '@prisma/client';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { ContratosPdfService } from './contratos-pdf.service';
import { StorageService } from '../common/storage/storage.service';
import { randomUUID } from 'crypto';
import {
  addMonths,
  añosCubiertos,
  combinarFechaHora,
  esFestivo,
  enVacaciones,
  generarFechasRecurrentes,
} from './contratos.utils';

const CONTRATO_INCLUDE = {
  cliente:    { select: { id: true, nombre: true, apellidos: true } },
  trabajador: { select: { id: true, nombre: true, apellidos: true, especialidad: true } },
  slots:      { orderBy: { diaSemana: 'asc' as const } },
  _count:     { select: { sesiones: true } },
} as const;

const CONTRATO_PDF_INCLUDE = {
  slots: { orderBy: { diaSemana: 'asc' as const } },
  trabajador: {
    select: {
      nombre: true, apellidos: true,
      nombreFiscal: true, nifFiscal: true,
      direccionFiscal: true, codigoPostalFiscal: true,
      ciudadFiscal: true, provinciaFiscal: true,
      emailFacturacion: true, email: true,
    },
  },
  cliente: {
    select: {
      nombre: true, apellidos: true,
      nombreTutorPagador: true, nifTutorPagador: true,
      direccionFiscalTutor: true, codigoPostalTutor: true,
      ciudadTutor: true,
    },
  },
} as const;

/** 10 MB: un contrato escaneado cabe de sobra; corta subidas accidentales. */
export const TAMANO_MAX_CONTRATO = 10 * 1024 * 1024;

/** Fichero en memoria de multer. Tipado local para no depender de @types/multer. */
export interface FicheroContrato {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class ContratosService {
  private readonly logger = new Logger(ContratosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: ContratosPdfService,
    private readonly storage: StorageService,
  ) {}

  async create(dto: CreateContratoDto, user: { userId: string; rol: string }) {
    const trabajadorId = user.rol === 'ADMIN' && dto.trabajadorId
      ? dto.trabajadorId
      : user.userId;

    const existente = await this.prisma.contratoServicio.findFirst({
      where: {
        clienteId: dto.clienteId,
        trabajadorId,
        tipoSesion: dto.tipoSesion,
        estado: { in: [EstadoContrato.ACTIVO, EstadoContrato.BORRADOR] },
      },
    });
    if (existente) {
      throw new BadRequestException(
        `Ya existe un contrato activo para esta pareja cliente-terapeuta con tipo ${dto.tipoSesion}`,
      );
    }

    const contrato = await this.prisma.contratoServicio.create({
      data: {
        clienteId: dto.clienteId,
        trabajadorId,
        tipoSesion: dto.tipoSesion,
        cuotaMensual: dto.cuotaMensual,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        notas: dto.notas,
        estado: EstadoContrato.ACTIVO,
        slots: {
          create: dto.slots.map(s => ({
            diaSemana:       s.diaSemana,
            horaInicio:      s.horaInicio,
            horaFin:         s.horaFin,
            duracionMinutos: s.duracionMinutos,
            modalidad:       s.modalidad ?? ModalidadSesion.PRESENCIAL,
          })),
        },
      },
      include: CONTRATO_INCLUDE,
    });

    this.generarSesionesContrato(contrato.id).catch(err =>
      console.error(`Error generando sesiones para contrato ${contrato.id}:`, err),
    );

    return contrato;
  }

  async generarSesionesContrato(contratoId: string): Promise<number> {
    const contrato = await this.prisma.contratoServicio.findUniqueOrThrow({
      where: { id: contratoId },
      include: {
        slots:   true,
        cliente: { select: { provincia: true } },
      },
    });

    if (!contrato.slots.length) return 0;

    const fechaInicio = contrato.fechaInicio;
    const fechaFin    = contrato.fechaFin ?? addMonths(fechaInicio, 12);
    const anos        = añosCubiertos(fechaInicio, fechaFin);
    const provincia   = contrato.cliente.provincia;

    const [festivos, vacaciones] = await Promise.all([
      this.prisma.festivo.findMany({
        where: {
          anio: { in: anos },
          OR: [
            { ambito: AmbitoFestivo.NACIONAL },
            { ambito: AmbitoFestivo.AUTONOMICO, ccaa: provincia },
            { ambito: AmbitoFestivo.LOCAL, provincia },
          ],
        },
      }),
      this.prisma.periodoVacaciones.findMany({
        where: { trabajadorId: contrato.trabajadorId },
      }),
    ]);

    const sesiones = contrato.slots.flatMap(slot => {
      const fechasValidas = generarFechasRecurrentes(fechaInicio, fechaFin, slot.diaSemana)
        .filter(f => !esFestivo(f, festivos) && !enVacaciones(f, vacaciones));
      return fechasValidas.map(f => ({
        clienteId:       contrato.clienteId,
        trabajadorId:    contrato.trabajadorId,
        contratoId:      contrato.id,
        tipoSesion:      contrato.tipoSesion,
        modalidad:       slot.modalidad,
        fechaHoraInicio: combinarFechaHora(f, slot.horaInicio),
        fechaHoraFin:    combinarFechaHora(f, slot.horaFin),
        estado:          EstadoSesion.PROGRAMADA,
      }));
    });

    if (!sesiones.length) return 0;

    await this.prisma.sesion.createMany({ data: sesiones, skipDuplicates: true });
    return sesiones.length;
  }

  async findAll(user: { userId: string; rol: string }) {
    const where = user.rol === 'ADMIN' ? {} : { trabajadorId: user.userId };
    return this.prisma.contratoServicio.findMany({
      where,
      include: CONTRATO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCliente(clienteId: string, user: { userId: string; rol: string }) {
    const where: any = { clienteId };
    if (user.rol !== 'ADMIN' && user.rol !== 'RECEP') {
      where.trabajadorId = user.userId;
    }
    return this.prisma.contratoServicio.findMany({
      where,
      include: CONTRATO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id },
      include: CONTRATO_INCLUDE,
    });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);
    return contrato;
  }

  async update(id: string, dto: UpdateContratoDto, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (contrato.estado === EstadoContrato.FINALIZADO) {
      throw new BadRequestException('No se puede editar un contrato finalizado');
    }

    return this.prisma.$transaction(async tx => {
      if (dto.slots) {
        await tx.contratoSlot.deleteMany({ where: { contratoId: id } });
        await tx.contratoSlot.createMany({
          data: dto.slots.map(s => ({
            contratoId:      id,
            diaSemana:       s.diaSemana,
            horaInicio:      s.horaInicio,
            horaFin:         s.horaFin,
            duracionMinutos: s.duracionMinutos,
            modalidad:       s.modalidad ?? ModalidadSesion.PRESENCIAL,
          })),
        });
      }

      // Si se tocan los datos con los que se factura y ya hay un PDF firmado,
      // sellamos la fecha para poder avisar de que el papel quedo desfasado.
      const tocaResumen =
        dto.cuotaMensual !== undefined ||
        dto.fechaFin !== undefined ||
        dto.slots !== undefined;

      return tx.contratoServicio.update({
        where: { id },
        data: {
          ...(dto.cuotaMensual !== undefined && { cuotaMensual: dto.cuotaMensual }),
          ...(dto.fechaFin     !== undefined && { fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null }),
          ...(dto.notas        !== undefined && { notas: dto.notas }),
          ...(tocaResumen && contrato.storageKeyFirmado
            ? { resumenModificadoAt: new Date() }
            : {}),
        },
        include: CONTRATO_INCLUDE,
      });
    });
  }

  async finalizar(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (contrato.estado === EstadoContrato.FINALIZADO) {
      throw new BadRequestException('El contrato ya está finalizado');
    }

    const ahora = new Date();

    const [, contratoFinalizado] = await this.prisma.$transaction([
      this.prisma.sesion.updateMany({
        where: {
          contratoId: id,
          fechaHoraInicio: { gt: ahora },
          estado: EstadoSesion.PROGRAMADA,
        },
        data: { estado: EstadoSesion.CANCELADA_CON_AVISO },
      }),
      this.prisma.contratoServicio.update({
        where: { id },
        data: { estado: EstadoContrato.FINALIZADO, fechaFin: ahora },
        include: CONTRATO_INCLUDE,
      }),
    ]);

    return contratoFinalizado;
  }

  // ── PDF FIRMADO ───────────────────────────────────────────

  /**
   * Sube el contrato firmado. Sustituye al PDF generado al vuelo: a partir de
   * aqui, "Ver PDF" sirve este documento.
   */
  async subirDocumentoFirmado(
    id: string,
    fichero: FicheroContrato,
    user: { userId: string; rol: string },
  ) {
    if (!fichero) throw new BadRequestException('No se ha recibido ningun fichero');
    if (fichero.mimetype !== 'application/pdf') {
      throw new BadRequestException('El contrato firmado debe ser un PDF');
    }
    if (fichero.size > TAMANO_MAX_CONTRATO) {
      throw new BadRequestException(
        `El fichero supera el maximo de ${TAMANO_MAX_CONTRATO / (1024 * 1024)} MB`,
      );
    }

    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    // Fallo ruidoso: sin Object Storage el fichero no puede persistir. Nunca a
    // disco local — el contenedor es efimero y el PDF desapareceria al desplegar.
    if (!this.storage.isConfigured) {
      throw new ServiceUnavailableException(
        'El almacenamiento de ficheros no esta configurado (faltan variables SCW_*). ' +
          'No se pueden subir contratos firmados hasta que se configure Object Storage.',
      );
    }

    const anterior = contrato.storageKeyFirmado;
    const storageKey = `contratos/${id}/${randomUUID()}.pdf`;

    await this.storage.upload(storageKey, fichero.buffer, fichero.mimetype);

    let actualizado;
    try {
      actualizado = await this.prisma.contratoServicio.update({
        where: { id },
        data: {
          storageKeyFirmado:  storageKey,
          mimeTypeFirmado:    fichero.mimetype,
          tamanoBytesFirmado: fichero.size,
          fechaSubidaFirmado: new Date(),
          // El PDF recien subido refleja los datos actuales: se limpia el aviso
          resumenModificadoAt: null,
        },
        include: CONTRATO_INCLUDE,
      });
    } catch (error) {
      // El objeto ya esta en el bucket pero la fila no apunta a el: seria
      // inalcanzable, asi que lo borramos para no dejar basura huerfana.
      await this.storage.delete(storageKey).catch(e =>
        this.logger.error(`No se pudo limpiar el objeto huerfano ${storageKey}`, e),
      );
      throw error;
    }

    // Ya sustituido en BD: el PDF anterior no lo alcanza nadie
    if (anterior && anterior !== storageKey) {
      await this.storage.delete(anterior).catch(e =>
        this.logger.error(`No se pudo borrar el PDF anterior ${anterior}`, e),
      );
    }

    this.logger.log(`Contrato ${id}: PDF firmado subido`);
    return actualizado;
  }

  /**
   * URL prefirmada del PDF firmado, o null si este contrato no tiene ninguno
   * (en ese caso el controlador genera el PDF al vuelo, como siempre).
   */
  async getUrlDocumentoFirmado(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (!contrato.storageKeyFirmado) return null;

    if (!this.storage.isConfigured) {
      throw new ServiceUnavailableException(
        'El almacenamiento de ficheros no esta configurado (faltan variables SCW_*).',
      );
    }

    return this.storage.getSignedUrl(contrato.storageKeyFirmado, 300);
  }

  async generarPdf(id: string, user: { userId: string; rol: string }): Promise<Buffer> {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id },
      include: CONTRATO_PDF_INCLUDE,
    });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);
    return this.pdfService.generarPdf(contrato);
  }

  private checkAcceso(
    contrato: { trabajadorId: string },
    user: { userId: string; rol: string },
  ) {
    if (user.rol !== 'ADMIN' && contrato.trabajadorId !== user.userId) {
      throw new ForbiddenException('No tienes acceso a este contrato');
    }
  }
}
