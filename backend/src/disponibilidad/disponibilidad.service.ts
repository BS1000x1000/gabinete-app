import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisponibilidadDto } from './dto/create-disponibilidad.dto';

@Injectable()
export class DisponibilidadService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear disponibilidad semanal para un cliente
   */
  async create(clienteId: string, dto: CreateDisponibilidadDto) {
    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // Crear las disponibilidades
    const created = await this.prisma.disponibilidadCliente.createMany({
      data: dto.horarios.map(h => ({
        clienteId,
        diaSemana: h.diaSemana,
        horaInicio: h.horaInicio,
        horaFin: h.horaFin,
      })),
    });

    return {
      message: `Se crearon ${created.count} horarios para el cliente`,
      count: created.count,
    };
  }

  /**
   * Obtener disponibilidad de un cliente
   */
  async findByCliente(clienteId: string) {
    const disponibilidades = await this.prisma.disponibilidadCliente.findMany({
      where: { clienteId },
      orderBy: { diaSemana: 'asc' },
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
          },
        },
      },
    });

    return disponibilidades.map(d => ({
      ...d,
      diaNombre: this.getNombreDia(d.diaSemana),
    }));
  }

  /**
   * Actualizar un horario específico
   */
  async update(id: string, horaInicio?: string, horaFin?: string) {
    return await this.prisma.disponibilidadCliente.update({
      where: { id },
      data: {
        ...(horaInicio && { horaInicio }),
        ...(horaFin && { horaFin }),
      },
    });
  }

  /**
   * Eliminar un horario
   */
  async remove(id: string) {
    await this.prisma.disponibilidadCliente.delete({
      where: { id },
    });
    return { message: 'Horario eliminado correctamente' };
  }

  /**
   * Eliminar toda la disponibilidad de un cliente
   */
  async removeAllByCliente(clienteId: string) {
    const deleted = await this.prisma.disponibilidadCliente.deleteMany({
      where: { clienteId },
    });
    return { 
      message: `Se eliminaron ${deleted.count} horarios`,
      count: deleted.count,
    };
  }

  /**
   * Obtener nombre del día en español
   */
  private getNombreDia(dia: number): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia];
  }
}