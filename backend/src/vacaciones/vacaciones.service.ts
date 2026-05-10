import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVacacionesDto } from './dto/create-vacaciones.dto';

type ConflictoSesion = { id: string; fecha: string; cliente: string; tipoSesion: string };
type ConflictoEvento = { id: string; fecha: string; titulo: string; tipo: string };

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
    // Noon UTC avoids DST/timezone issues — date is always correct in any timezone
    const inicio = new Date(dto.fechaInicio + 'T12:00:00.000Z');
    const fin = new Date(dto.fechaFin + 'T12:00:00.000Z');

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

  async verificarConflictos(
    trabajadorId: string,
    desde: string,
    hasta: string,
  ): Promise<{ sesiones: ConflictoSesion[]; eventos: ConflictoEvento[] }> {
    const desdeDate = new Date(desde + 'T00:00:00.000Z');
    const hastaDate = new Date(hasta + 'T23:59:59.999Z');

    const [sesiones, eventos] = await Promise.all([
      this.prisma.sesion.findMany({
        where: {
          trabajadorId,
          estado: { in: ['PROGRAMADA', 'COMPLETADA'] },
          fechaHoraInicio: { gte: desdeDate, lte: hastaDate },
        },
        select: {
          id: true,
          fechaHoraInicio: true,
          tipoSesion: true,
          cliente: { select: { nombre: true, apellidos: true } },
        },
      }),
      this.prisma.eventoAgenda.findMany({
        where: {
          tipo: { not: 'TIEMPO_ADMINISTRACION' },
          fechaHoraInicio: { gte: desdeDate, lte: hastaDate },
          participantes: { some: { trabajadorId } },
        },
        select: { id: true, titulo: true, tipo: true, fechaHoraInicio: true },
      }),
    ]);

    return {
      sesiones: sesiones.map(s => ({
        id: s.id,
        fecha: s.fechaHoraInicio.toISOString().split('T')[0],
        cliente: `${s.cliente.nombre} ${s.cliente.apellidos}`,
        tipoSesion: s.tipoSesion,
      })),
      eventos: eventos.map(e => ({
        id: e.id,
        fecha: e.fechaHoraInicio.toISOString().split('T')[0],
        titulo: e.titulo,
        tipo: e.tipo,
      })),
    };
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
