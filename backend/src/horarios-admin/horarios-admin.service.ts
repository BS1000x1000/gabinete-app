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

  /**
   * Un ADMIN puede consultar las reglas de otro trabajador pasando `filtroId`,
   * pero sin filtro se devuelven las suyas: antes el `where` quedaba solo en
   * `{ activo: true }` y le llegaban las de todo el equipo mezcladas y sin
   * ningun campo que permitiera distinguirlas.
   *
   * Pedir las de otro sin ser ADMIN es un 403, no un silencio. Antes devolvia
   * las tuyas como si nada, asi que la pantalla ensenaba unos datos afirmando
   * que eran de otra persona. `VacacionesService.resolveTarget` ya rechazaba de
   * forma explicita; esto era la asimetria.
   */
  async findAll(userId: string, rol: string, filtroId?: string) {
    if (filtroId && filtroId !== userId && rol !== 'ADMIN') {
      throw new ForbiddenException('No tienes acceso al horario de otro trabajador');
    }
    const trabajadorId = filtroId ?? userId;
    return this.prisma.horarioAdmin.findMany({
      where: { trabajadorId, activo: true },
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
