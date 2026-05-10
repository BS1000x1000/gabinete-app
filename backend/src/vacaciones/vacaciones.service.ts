import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacacionesDto } from './dto/create-vacaciones.dto';

@Injectable()
export class VacacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async getMisVacaciones(trabajadorId: string) {
    return this.prisma.periodoVacaciones.findMany({
      where: { trabajadorId },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async getAll(user: { userId: string; rol: string }) {
    const where = user.rol === 'ADMIN' ? {} : { trabajadorId: user.userId };
    return this.prisma.periodoVacaciones.findMany({
      where,
      include: { trabajador: { select: { id: true, nombre: true, apellidos: true } } },
      orderBy: { fechaInicio: 'asc' },
    });
  }

  async create(trabajadorId: string, dto: CreateVacacionesDto) {
    const inicio = new Date(dto.fechaInicio + 'T00:00:00');
    const fin = new Date(dto.fechaFin + 'T23:59:59');

    if (fin < inicio) {
      throw new BadRequestException('La fecha de fin debe ser posterior o igual a la de inicio');
    }

    return this.prisma.periodoVacaciones.create({
      data: {
        trabajadorId,
        fechaInicio: inicio,
        fechaFin: fin,
        motivo: dto.motivo ?? null,
      },
    });
  }

  async remove(id: string, user: { userId: string; rol: string }) {
    const periodo = await this.prisma.periodoVacaciones.findUnique({ where: { id } });
    if (!periodo) throw new NotFoundException(`Periodo de vacaciones ${id} no encontrado`);

    if (user.rol !== 'ADMIN' && periodo.trabajadorId !== user.userId) {
      throw new ForbiddenException('No tienes acceso a este periodo de vacaciones');
    }

    await this.prisma.periodoVacaciones.delete({ where: { id } });
  }
}
