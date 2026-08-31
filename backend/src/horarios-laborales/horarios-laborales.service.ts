import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EstadoSesion } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHorarioLaboralDto, UpdateHorarioLaboralDto } from './dto/horario-laboral.dto';

/** Un aviso nunca impide guardar: solo advierte. */
export interface AvisoSesion {
  tipo: 'FUERA_DE_JORNADA' | 'SOLAPE_TERAPEUTA' | 'SOLAPE_CLIENTE' | 'FESTIVO' | 'VACACIONES';
  mensaje: string;
}

@Injectable()
export class HorariosLaboralesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // CRUD de la jornada
  // ============================================================

  async findByTrabajador(trabajadorId: string) {
    return this.prisma.horarioLaboral.findMany({
      where: { trabajadorId },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });
  }

  async create(trabajadorId: string, dto: CreateHorarioLaboralDto, user: { userId: string; rol: string }) {
    this.assertPropioOAdmin(trabajadorId, user);

    if (dto.horaFin <= dto.horaInicio) {
      throw new BadRequestException('La hora de fin debe ser posterior a la de inicio');
    }

    return this.prisma.horarioLaboral.create({
      data: { trabajadorId, ...dto },
    });
  }

  async update(id: string, dto: UpdateHorarioLaboralDto, user: { userId: string; rol: string }) {
    const actual = await this.prisma.horarioLaboral.findUnique({ where: { id } });
    if (!actual) throw new NotFoundException(`Horario ${id} no encontrado`);
    this.assertPropioOAdmin(actual.trabajadorId, user);

    const inicio = dto.horaInicio ?? actual.horaInicio;
    const fin = dto.horaFin ?? actual.horaFin;
    if (fin <= inicio) {
      throw new BadRequestException('La hora de fin debe ser posterior a la de inicio');
    }

    return this.prisma.horarioLaboral.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: { userId: string; rol: string }) {
    const actual = await this.prisma.horarioLaboral.findUnique({ where: { id } });
    if (!actual) throw new NotFoundException(`Horario ${id} no encontrado`);
    this.assertPropioOAdmin(actual.trabajadorId, user);

    await this.prisma.horarioLaboral.delete({ where: { id } });
    return { id, eliminado: true };
  }

  /**
   * La jornada de un autónomo es suya: solo él (o un ADMIN) la define.
   * Mismo criterio que los bloques de administración.
   */
  private assertPropioOAdmin(trabajadorId: string, user: { userId: string; rol: string }) {
    if (user.rol !== 'ADMIN' && user.userId !== trabajadorId) {
      throw new ForbiddenException('Solo puedes editar tu propia jornada laboral');
    }
  }

  // ============================================================
  // AVISOS
  // ============================================================

  /**
   * Comprueba si una sesión encaja o no, y devuelve avisos.
   *
   * **Nunca lanza excepción por un solape ni por estar fuera de jornada.** El
   * gabinete a veces necesita meter una sesión a deshora —una evaluación un
   * sábado, un hueco de urgencia— y la app no debe impedírselo. Avisar es útil;
   * bloquear sería estorbar.
   */
  async evaluarAvisos(params: {
    trabajadorId: string;
    clienteId: string;
    inicio: Date;
    fin: Date;
    /** Sesión que se está moviendo, para no chocar consigo misma. */
    excluirSesionId?: string;
  }): Promise<AvisoSesion[]> {
    const { trabajadorId, clienteId, inicio, fin, excluirSesionId } = params;
    const avisos: AvisoSesion[] = [];

    // getDay() da 0=domingo; la convención del proyecto es ISO 1=lunes..7=domingo
    const diaISO = inicio.getDay() === 0 ? 7 : inicio.getDay();
    const hhmm = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const [jornada, solapes, vacaciones] = await Promise.all([
      this.prisma.horarioLaboral.findMany({
        where: { trabajadorId, diaSemana: diaISO, activo: true },
      }),
      this.prisma.sesion.findMany({
        where: {
          ...(excluirSesionId ? { id: { not: excluirSesionId } } : {}),
          estado: EstadoSesion.PROGRAMADA,
          fechaHoraInicio: { lt: fin },
          fechaHoraFin: { gt: inicio },
          OR: [{ trabajadorId }, { clienteId }],
        },
        select: {
          id: true,
          trabajadorId: true,
          fechaHoraInicio: true,
          cliente: { select: { nombre: true, apellidos: true } },
        },
      }),
      this.prisma.periodoVacaciones.findMany({ where: { trabajadorId } }),
    ]);

    // Fuera de jornada. Sin jornada declarada no se avisa de nada: sería ruido
    // para quien todavía no la ha configurado.
    if (jornada.length > 0) {
      const dentro = jornada.some(
        (j) => hhmm(inicio) >= j.horaInicio && hhmm(fin) <= j.horaFin,
      );
      if (!dentro) {
        const tramos = jornada.map((j) => `${j.horaInicio}–${j.horaFin}`).join(', ');
        avisos.push({
          tipo: 'FUERA_DE_JORNADA',
          mensaje: `Fuera de la jornada del terapeuta ese día (${tramos}).`,
        });
      }
    }

    for (const s of solapes) {
      avisos.push(
        s.trabajadorId === trabajadorId
          ? {
              tipo: 'SOLAPE_TERAPEUTA',
              mensaje: `El terapeuta ya tiene sesión con ${s.cliente.nombre} ${s.cliente.apellidos} a esa hora.`,
            }
          : {
              tipo: 'SOLAPE_CLIENTE',
              mensaje: 'El cliente ya tiene otra sesión a esa hora.',
            },
      );
    }

    const diaSesion = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()).getTime();
    const enVacaciones = vacaciones.some((v) => {
      const ini = new Date(v.fechaInicio);
      const fin2 = new Date(v.fechaFin);
      const a = new Date(ini.getFullYear(), ini.getMonth(), ini.getDate()).getTime();
      const b = new Date(fin2.getFullYear(), fin2.getMonth(), fin2.getDate()).getTime();
      return diaSesion >= a && diaSesion <= b;
    });
    if (enVacaciones) {
      avisos.push({
        tipo: 'VACACIONES',
        mensaje: 'Ese día el terapeuta está de vacaciones.',
      });
    }

    return avisos;
  }
}
