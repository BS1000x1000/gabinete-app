// horarios.service.ts
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import { HorarioData } from './dto/horariodto-interface';
@Injectable()
export class HorariosService {
  /* ---------- CREAR MUCHOS HORARIOS ---------- */
  async createMany(dto: HorarioData[]): Promise<any[]> {
    try {
      const created = await Promise.all(
        dto.map((h) =>
          prisma.horario.create({
            data: {
              fechaHoraInicio: new Date(h.fechaHoraInicio),
              fechaHoraFin: new Date(h.fechaHoraFin),
              tipoSesion: h.tipoSesion,
              estado: h.estado,
              notas: h.notas,
              clienteId: h.clienteId,
              trabajadorId: h.trabajadorId,
            },
          })
        )
      );

      // Mapea Date → string
      return created.map((h) => ({
        ...h,
        fechaHoraInicio: h.fechaHoraInicio.toISOString(),
        fechaHoraFin: h.fechaHoraFin.toISOString(),
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
      }));
    } catch (err) {
      throw new InternalServerErrorException(`Error al crear horarios: ${err.message}`);
    }
  }

  /* ---------- LEER TODOS LOS HORARIOS DE UN CLIENTE ---------- */
  async findByClienteId(clienteId: string): Promise<any[]> {
    try {
      return await prisma.horario.findMany({
        where: { clienteId },
        include: { cliente: true, trabajador: true },
        orderBy: { fechaHoraInicio: 'asc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener horarios: ${err.message}`);
    }
  }

  /* ---------- LEER TODOS LOS HORARIOS DE UN CLIENTE ---------- */
  async findByTrabajadorId(trabajadorId: string): Promise<any[]> {
    try {
      return await prisma.horario.findMany({
        where: { trabajadorId },
        include: { cliente: true, trabajador: true },
        orderBy: { fechaHoraInicio: 'asc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener horarios: ${err.message}`);
    }
  }

  /* ---------- LEER UN HORARIO POR ID ---------- */
  async findOne(id: string): Promise<any> {
    try {
      const horario = await prisma.horario.findUnique({
        where: { id },
        include: { cliente: true, trabajador: true },
      });
      if (!horario) throw new NotFoundException('Horario no encontrado');
      return horario;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener horario: ${err.message}`);
    }
  }

  /* ---------- ACTUALIZAR UN HORARIO ---------- */
  async update(id: string, dto: HorarioData): Promise<any> {
    try {
      const updated = await prisma.horario.update({
        where: { id },
        data: {
          fechaHoraInicio: dto.fechaHoraInicio ? new Date(dto.fechaHoraInicio) : undefined,
          fechaHoraFin: dto.fechaHoraFin ? new Date(dto.fechaHoraFin) : undefined,
          tipoSesion: dto.tipoSesion,
          estado: dto.estado as 'programada' | 'confirmada' | 'cancelada',
          notas: dto.notas ?? undefined,
          clienteId: dto.clienteId,
          trabajadorId: dto.trabajadorId,
        },
        include: { cliente: true, trabajador: true },
      });
      return updated;
    } catch (err) {
      throw new InternalServerErrorException(`Error al actualizar horario: ${err.message}`);
    }
  }

  /* ---------- ELIMINAR UN HORARIO ---------- */
  async remove(id: string): Promise<void> {
    try {
      await prisma.horario.delete({ where: { id } });
    } catch (err) {
      throw new InternalServerErrorException(`Error al eliminar horario: ${err.message}`);
    }
  }
}