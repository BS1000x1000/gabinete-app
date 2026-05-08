import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHorarioAdminDto } from './dto/create-horario-admin.dto';
import { UpdateHorarioAdminDto } from './dto/update-horario-admin.dto';

@Injectable()
export class HorariosAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, rol: string, filtroId?: string) {
    const trabajadorId = rol === 'ADMIN' ? filtroId : userId;
    return this.prisma.horarioAdmin.findMany({
      where: { ...(trabajadorId ? { trabajadorId } : {}), activo: true },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async create(dto: CreateHorarioAdminDto, userId: string) {
    if (dto.horaFin <= dto.horaInicio) {
      throw new BadRequestException('horaFin debe ser posterior a horaInicio');
    }
    return this.prisma.horarioAdmin.create({
      data: {
        trabajadorId: userId,
        diaSemana: dto.diaSemana,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        titulo: dto.titulo ?? 'Tiempo de Administración',
      },
    });
  }

  async update(id: string, dto: UpdateHorarioAdminDto, userId: string, rol: string) {
    const regla = await this.prisma.horarioAdmin.findUnique({ where: { id } });
    if (!regla) throw new NotFoundException('Regla no encontrada');
    if (regla.trabajadorId !== userId && rol !== 'ADMIN') {
      throw new ForbiddenException('Sin acceso a esta regla');
    }

    const horaInicio = dto.horaInicio ?? regla.horaInicio;
    const horaFin = dto.horaFin ?? regla.horaFin;
    if (horaFin <= horaInicio) {
      throw new BadRequestException('horaFin debe ser posterior a horaInicio');
    }

    return this.prisma.horarioAdmin.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string, rol: string) {
    const regla = await this.prisma.horarioAdmin.findUnique({ where: { id } });
    if (!regla) throw new NotFoundException('Regla no encontrada');
    if (regla.trabajadorId !== userId && rol !== 'ADMIN') {
      throw new ForbiddenException('Sin acceso a esta regla');
    }
    await this.prisma.horarioAdmin.delete({ where: { id } });
  }
}
