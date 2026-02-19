import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoSesion, TipoSesion } from '@prisma/client';
import { GenerarSesionesDto } from './dto/generar-sesiones.dto';
import { CompletarSesionDto } from './dto/completar-sesion.dto';
import { SesionWithRelations, sesionInclude } from './sesiones.types';

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generar sesiones automáticamente desde la disponibilidad del cliente
   */
  async generarSesiones(dto: GenerarSesionesDto) {
    // 1. Verificar que cliente y trabajador existen
    const [cliente, trabajador] = await Promise.all([
      this.prisma.cliente.findUnique({ where: { id: dto.clienteId } }),
      this.prisma.trabajador.findUnique({ where: { id: dto.trabajadorId } }),
    ]);

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${dto.clienteId} no encontrado`);
    }
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${dto.trabajadorId} no encontrado`);
    }

    // 2. Obtener disponibilidad del cliente
    const disponibilidades = await this.prisma.disponibilidadCliente.findMany({
      where: { clienteId: dto.clienteId },
    });

    if (disponibilidades.length === 0) {
      throw new BadRequestException('El cliente no tiene disponibilidad configurada');
    }

    // 3. Generar sesiones
    const sesionesACrear: any = [];
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    const fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      const diaSemana = fechaActual.getDay();
      const disponibilidadDelDia = disponibilidades.find(d => d.diaSemana === diaSemana);

      if (disponibilidadDelDia) {
        const [horaInicio, minInicio] = disponibilidadDelDia.horaInicio.split(':').map(Number);
        const [horaFin, minFin] = disponibilidadDelDia.horaFin.split(':').map(Number);

        const fechaHoraInicio = new Date(fechaActual);
        fechaHoraInicio.setHours(horaInicio, minInicio, 0, 0);

        const fechaHoraFin = new Date(fechaActual);
        fechaHoraFin.setHours(horaFin, minFin, 0, 0);

        sesionesACrear.push({
          fechaHoraInicio,
          fechaHoraFin,
          estado: EstadoSesion.PROGRAMADA,
          tipoSesion: dto.tipoSesion || TipoSesion.PEDAGOGIA,
          clienteId: dto.clienteId,
          trabajadorId: dto.trabajadorId,
        });
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    // 4. Crear sesiones
    if (sesionesACrear.length > 0) {
      await this.prisma.sesion.createMany({
        data: sesionesACrear,
      });
    }

    return {
      message: `Se generaron ${sesionesACrear.length} sesiones`,
      sesionesCreadas: sesionesACrear.length,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      cliente: `${cliente.nombre} ${cliente.apellidos}`,
      trabajador: `${trabajador.nombre} ${trabajador.apellidos}`,
    };
  }

  /**
   * Obtener sesiones de un trabajador en un rango de fechas
   */
  async findByTrabajadorYFecha(
    trabajadorId: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<SesionWithRelations[]> {
    const where: any = { trabajadorId };

    if (fechaInicio || fechaFin) {
      where.fechaHoraInicio = {};
      if (fechaInicio) where.fechaHoraInicio.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaHoraInicio.lte = new Date(fechaFin);
    }

    return await this.prisma.sesion.findMany({
      where,
      include: sesionInclude,
      orderBy: { fechaHoraInicio: 'asc' },
    });
  }

  /**
   * Obtener sesiones de un cliente
   */
  async findByCliente(clienteId: string): Promise<SesionWithRelations[]> {
    return await this.prisma.sesion.findMany({
      where: { clienteId },
      include: sesionInclude,
      orderBy: { fechaHoraInicio: 'desc' },
    });
  }

  /**
   * Obtener una sesión por ID
   */
  async findOne(id: string): Promise<SesionWithRelations | null> {
    return await this.prisma.sesion.findUnique({
      where: { id },
      include: sesionInclude,
    });
  }

  /**
   * Completar una sesión (y opcionalmente crear registro diario)
   */
  async completarSesion(id: string, dto: CompletarSesionDto) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    if (sesion.estado === EstadoSesion.COMPLETADA) {
      throw new BadRequestException('La sesión ya está completada');
    }

    // Si se proporciona contenido para registro diario, usar transacción
    if (dto.contenidoRegistroDiario) {
      const [sesionActualizada, registroCreado] = await this.prisma.$transaction([
        // Actualizar sesión
        this.prisma.sesion.update({
          where: { id },
          data: {
            estado: EstadoSesion.COMPLETADA,
            notas: dto.notas,
            objetivosTrabajados: dto.objetivosTrabajados,
          },
          include: sesionInclude,
        }),
        // Crear registro diario
        this.prisma.registroDiario.create({
          data: {
            contenido: dto.contenidoRegistroDiario,
            clienteId: sesion.clienteId,
            trabajadorId: sesion.trabajadorId,
            fechaRegistro: new Date(),
          },
        }),
      ]);

      return {
        sesion: sesionActualizada,
        registroDiario: registroCreado,
        message: 'Sesión completada y registro diario creado',
      };
    }

    // Solo actualizar sesión
    const sesionActualizada = await this.prisma.sesion.update({
      where: { id },
      data: {
        estado: EstadoSesion.COMPLETADA,
        notas: dto.notas,
        objetivosTrabajados: dto.objetivosTrabajados,
      },
      include: sesionInclude,
    });

    return {
      sesion: sesionActualizada,
      message: 'Sesión completada',
    };
  }

  /**
   * Cancelar una sesión
   */
  async cancelarSesion(id: string, conAviso: boolean = true) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    const nuevoEstado = conAviso 
      ? EstadoSesion.CANCELADA_CON_AVISO 
      : EstadoSesion.CANCELADA_SIN_AVISO;

    return await this.prisma.sesion.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: sesionInclude,
    });
  }

  /**
   * Actualizar una sesión
   */
  async update(id: string, data: Partial<{
    fechaHoraInicio: Date;
    fechaHoraFin: Date;
    tipoSesion: TipoSesion;
    notas: string;
  }>) {
    return await this.prisma.sesion.update({
      where: { id },
      data,
      include: sesionInclude,
    });
  }

  /**
   * Eliminar una sesión
   */
  async remove(id: string) {
    await this.prisma.sesion.delete({
      where: { id },
    });
    return { message: 'Sesión eliminada correctamente' };
  }
}