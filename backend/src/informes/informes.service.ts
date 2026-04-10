import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { TipoInforme, EstadoInforme } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInformeDto, UpdateInformeDto } from './dto/informe.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

// Include completo para devolver el informe con todas sus relaciones
const informeInclude = {
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      fechaNacimiento: true,
      curso: true,
      colegio: { select: { nombre: true } },
    },
  },
  trabajador: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
    },
  },
};

@Injectable()
export class InformesService {
  private readonly logger = new Logger(InformesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CREAR INFORME
  // ============================================================

  async create(dto: CreateInformeDto, trabajadorId: string) {
    this.logger.log(
      `Creando informe ${dto.tipoInforme} para cliente: ${dto.clienteId}`,
    );

    // Validar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${dto.clienteId} no encontrado`,
      );
    }

    // Validar que un informe de SEGUIMIENTO tiene período definido
    if (dto.tipoInforme === TipoInforme.SEGUIMIENTO) {
      if (!dto.periodoDesde || !dto.periodoHasta) {
        throw new BadRequestException(
          'El informe de seguimiento requiere periodoDesde y periodoHasta',
        );
      }
    }

    try {
      // Al crear, generar el snapshot GAS del estado actual del cliente
      const snapshotJson = await this.generarSnapshotGAS(dto.clienteId);

      const informe = await this.prisma.informe.create({
        data: {
          titulo: dto.titulo,
          tipoInforme: dto.tipoInforme,
          estado: EstadoInforme.BORRADOR,
          clienteId: dto.clienteId,
          trabajadorId,
          periodoDesde: dto.periodoDesde ? new Date(dto.periodoDesde) : null,
          periodoHasta: dto.periodoHasta ? new Date(dto.periodoHasta) : null,
          motivoConsulta: dto.motivoConsulta,
          analisisInformacion: dto.analisisInformacion,
          evaluacionInicial: dto.evaluacionInicial,
          objetivosGeneralesTexto: dto.objetivosGeneralesTexto,
          evolucionObservada: dto.evolucionObservada,
          objetivosProximoCurso: dto.objetivosProximoCurso,
          recomendaciones: dto.recomendaciones,
          objetivosSnapshotJson: snapshotJson,
        },
        include: informeInclude,
      });

      return informe;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new InternalServerErrorException(
        `Error al crear el informe: ${err.message}`,
      );
    }
  }

  // ============================================================
  // LISTAR INFORMES
  // ============================================================

  async findAll(pagination: PaginationDto = {}) {
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;

    this.logger.log(`Obteniendo informes (page=${page}, limit=${limit})`);

    const [data, total] = await Promise.all([
      this.prisma.informe.findMany({
        include: informeInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.informe.count(),
    ]);

    return { data, total, page, limit };
  }

  async findByCliente(
    clienteId: string,
    user?: { userId: string; rol: string },
  ) {
    this.logger.log(`Obteniendo informes del cliente: ${clienteId}`);

    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${clienteId} no encontrado`,
      );
    }

    const where: any = { clienteId };

    if (user?.rol === 'RECEP') {
      where.estado = { in: [EstadoInforme.FINALIZADO, EstadoInforme.ENVIADO] };
    } else if (user && user.rol !== 'ADMIN') {
      where.trabajadorId = user.userId;
    }

    return this.prisma.informe.findMany({
      where,
      include: informeInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTrabajador(trabajadorId: string) {
    this.logger.log(`Obteniendo informes del trabajador: ${trabajadorId}`);
    return this.prisma.informe.findMany({
      where: { trabajadorId },
      include: informeInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, user?: { userId: string; rol: string }) {
    this.logger.log(`Buscando informe con ID: ${id}`);

    const where: any = { id };
    if (user?.rol === 'RECEP') {
      where.estado = { in: [EstadoInforme.FINALIZADO, EstadoInforme.ENVIADO] };
    } else if (user && user.rol !== 'ADMIN') {
      where.trabajadorId = user.userId;
    }

    const informe = await this.prisma.informe.findFirst({
      where,
      include: informeInclude,
    });

    if (!informe) {
      throw new NotFoundException(`Informe con ID ${id} no encontrado`);
    }

    return informe;
  }

  // ============================================================
  // ACTUALIZAR INFORME
  // ============================================================

  async update(id: string, dto: UpdateInformeDto) {
    this.logger.log(`Actualizando informe: ${id}`);

    const informe = await this.prisma.informe.findUnique({ where: { id } });
    if (!informe) {
      throw new NotFoundException(`Informe con ID ${id} no encontrado`);
    }

    if (informe.estado === EstadoInforme.FINALIZADO || informe.estado === EstadoInforme.ENVIADO) {
      throw new BadRequestException(
        'No se puede modificar un informe finalizado o ya enviado',
      );
    }

    try {
      return await this.prisma.informe.update({
        where: { id },
        data: {
          ...(dto.titulo && { titulo: dto.titulo }),
          ...(dto.estado && { estado: dto.estado }),
          ...(dto.periodoDesde && { periodoDesde: new Date(dto.periodoDesde) }),
          ...(dto.periodoHasta && { periodoHasta: new Date(dto.periodoHasta) }),
          ...(dto.motivoConsulta !== undefined && {
            motivoConsulta: dto.motivoConsulta,
          }),
          ...(dto.analisisInformacion !== undefined && {
            analisisInformacion: dto.analisisInformacion,
          }),
          ...(dto.evaluacionInicial !== undefined && {
            evaluacionInicial: dto.evaluacionInicial,
          }),
          ...(dto.objetivosGeneralesTexto !== undefined && {
            objetivosGeneralesTexto: dto.objetivosGeneralesTexto,
          }),
          ...(dto.evolucionObservada !== undefined && {
            evolucionObservada: dto.evolucionObservada,
          }),
          ...(dto.objetivosProximoCurso !== undefined && {
            objetivosProximoCurso: dto.objetivosProximoCurso,
          }),
          ...(dto.recomendaciones !== undefined && {
            recomendaciones: dto.recomendaciones,
          }),
          ...(dto.urlDocumentoFinal && {
            urlDocumentoFinal: dto.urlDocumentoFinal,
          }),
          ...(dto.contenido !== undefined && { contenido: dto.contenido }),
        },
        include: informeInclude,
      });
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new InternalServerErrorException(
        `Error al actualizar el informe: ${err.message}`,
      );
    }
  }

  // ============================================================
  // FINALIZAR INFORME (regenera el snapshot GAS antes de cerrar)
  // ============================================================

  async finalizar(id: string) {
    this.logger.log(`Finalizando informe: ${id}`);

    const informe = await this.prisma.informe.findUnique({ where: { id } });
    if (!informe) {
      throw new NotFoundException(`Informe con ID ${id} no encontrado`);
    }

    if (informe.estado === EstadoInforme.FINALIZADO || informe.estado === EstadoInforme.ENVIADO) {
      throw new BadRequestException('El informe ya está finalizado o enviado');
    }

    // Regenerar snapshot GAS justo antes de finalizar
    const snapshotJson = await this.generarSnapshotGAS(informe.clienteId);

    return this.prisma.informe.update({
      where: { id },
      data: {
        estado: EstadoInforme.FINALIZADO,
        objetivosSnapshotJson: snapshotJson,
      },
      include: informeInclude,
    });
  }

  // ============================================================
  // ELIMINAR INFORME
  // ============================================================

  async remove(id: string) {
    this.logger.warn(`Eliminando informe: ${id}`);

    const informe = await this.prisma.informe.findUnique({ where: { id } });
    if (!informe) {
      throw new NotFoundException(`Informe con ID ${id} no encontrado`);
    }

    if (informe.estado === EstadoInforme.FINALIZADO || informe.estado === EstadoInforme.ENVIADO) {
      throw new BadRequestException(
        'No se puede eliminar un informe finalizado o enviado',
      );
    }

    await this.prisma.informe.delete({ where: { id } });

    return { message: 'Informe eliminado correctamente', id };
  }

  // ============================================================
  // HELPER PRIVADO: Generar snapshot JSON del estado GAS
  // Captura el estado actual de todos los objetivos del cliente
  // para que el PDF sea siempre reproducible
  // ============================================================

  private async generarSnapshotGAS(clienteId: string): Promise<string> {
    const objetivos = await this.prisma.clienteObjetivo.findMany({
      where: { clienteId, activo: true },
      include: {
        objetivoGeneral: {
          include: { areaDesarrollo: true },
        },
        descripcionesNiveles: {
          orderBy: { nivel: 'asc' },
        },
        evaluaciones: {
          orderBy: { fecha: 'desc' },
          take: 1, // Solo la más reciente
        },
      },
    });

    const snapshot = objetivos.map((obj) => ({
      clienteObjetivoId: obj.id,
      objetivo: obj.objetivoGeneral.titulo,
      area: obj.objetivoGeneral.areaDesarrollo.nombre,
      nivelActual: obj.nivelGASActual,
      fechaUltimaEvaluacion: obj.fechaUltimaEvaluacion,
      notas: obj.notas,
      niveles: obj.descripcionesNiveles.map((n) => ({
        nivel: n.nivel,
        descripcion: n.descripcion,
      })),
    }));

    return JSON.stringify(snapshot);
  }
}