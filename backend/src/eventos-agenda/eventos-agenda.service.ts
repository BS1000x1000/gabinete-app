import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { startOfISOWeek, endOfISOWeek, getISOWeekYear, getISOWeek } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';

// Inner select shared across top-level and nested includes
const PARTICIPANTE_SELECT = {
  creadoPor: { select: { id: true, nombre: true, apellidos: true } },
  participantes: {
    include: {
      trabajador: { select: { id: true, nombre: true, apellidos: true } },
    },
  },
} as const;

const PARTICIPANTE_INCLUDE = { include: PARTICIPANTE_SELECT } as const;

function diffMin(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / 60000);
}

function buildTotales(minClin: number, minNoClin: number) {
  return {
    horasClinicas: Math.floor(minClin / 60),
    minutosClinicas: minClin % 60,
    horasNoClinicas: Math.floor(minNoClin / 60),
    minutosNoClinicas: minNoClin % 60,
    totalMinutos: minClin + minNoClin,
  };
}

const ROLES_CON_ACCESO_GLOBAL = ['ADMIN', 'RECEP'] as const;

@Injectable()
export class EventosAgendaService {
  constructor(private readonly prisma: PrismaService) {}

  private resolveFilterId(userId: string, rol: string, override?: string): string {
    return (ROLES_CON_ACCESO_GLOBAL as readonly string[]).includes(rol) && override
      ? override
      : userId;
  }

  private async fetchHorasData(filtroId: string, desdeDate: Date, hastaDate: Date) {
    return Promise.all([
      this.prisma.sesion.findMany({
        where: {
          trabajadorId: filtroId,
          estado: 'COMPLETADA',
          fechaHoraInicio: { gte: desdeDate },
          fechaHoraFin: { lte: hastaDate },
        },
        select: { fechaHoraInicio: true, fechaHoraFin: true },
      }),
      this.prisma.eventoParticipante.findMany({
        where: {
          trabajadorId: filtroId,
          evento: {
            fechaHoraInicio: { gte: desdeDate },
            fechaHoraFin: { lte: hastaDate },
          },
        },
        include: {
          evento: { select: { fechaHoraInicio: true, fechaHoraFin: true } },
        },
      }),
    ]);
  }

  async create(dto: CreateEventoDto, creadorId: string, creadorRol: string) {
    const inicio = new Date(dto.fechaHoraInicio);
    const fin = new Date(dto.fechaHoraFin);
    if (fin <= inicio) {
      throw new BadRequestException('fechaHoraFin debe ser posterior a fechaHoraInicio');
    }

    const extraParticipantes = (dto.participantesIds ?? []).filter(
      (id) => id !== creadorId,
    );
    if (extraParticipantes.length > 0 && creadorRol !== 'ADMIN') {
      throw new ForbiddenException('Solo ADMIN puede crear eventos con participantes adicionales');
    }

    return this.prisma.eventoAgenda.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        fechaHoraInicio: inicio,
        fechaHoraFin: fin,
        tipo: dto.tipo,
        creadoPorId: creadorId,
        participantes: {
          create: [creadorId, ...extraParticipantes].map((id) => ({ trabajadorId: id })),
        },
      },
      ...PARTICIPANTE_INCLUDE,
    });
  }

  async findByPeriodo(
    userId: string,
    rol: string,
    desde: string,
    hasta: string,
    trabajadorIdFiltro?: string,
  ) {
    const filtroId = this.resolveFilterId(userId, rol, trabajadorIdFiltro);

    const registros = await this.prisma.eventoParticipante.findMany({
      where: {
        trabajadorId: filtroId,
        evento: {
          fechaHoraInicio: { gte: new Date(desde) },
          fechaHoraFin: { lte: new Date(hasta) },
        },
      },
      include: {
        evento: { include: PARTICIPANTE_SELECT },
      },
      orderBy: { evento: { fechaHoraInicio: 'asc' } },
    });

    return registros.map((r) => r.evento);
  }

  async findOne(id: string, userId: string, rol: string) {
    const evento = await this.prisma.eventoAgenda.findUnique({
      where: { id },
      ...PARTICIPANTE_INCLUDE,
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');

    const esParticipante = evento.participantes.some(
      (p) => p.trabajador.id === userId,
    );
    if (!esParticipante && rol !== 'ADMIN') {
      throw new ForbiddenException('Sin acceso a este evento');
    }
    return evento;
  }

  async update(id: string, dto: UpdateEventoDto, userId: string, rol: string) {
    const evento = await this.prisma.eventoAgenda.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    if (evento.creadoPorId !== userId && rol !== 'ADMIN') {
      throw new ForbiddenException('Solo el creador puede modificar este evento');
    }

    const data: {
      titulo?: string;
      descripcion?: string;
      tipo?: typeof dto.tipo;
      fechaHoraInicio?: Date;
      fechaHoraFin?: Date;
    } = {};
    if (dto.titulo !== undefined) data.titulo = dto.titulo;
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.tipo !== undefined) data.tipo = dto.tipo;
    if (dto.fechaHoraInicio !== undefined) data.fechaHoraInicio = new Date(dto.fechaHoraInicio);
    if (dto.fechaHoraFin !== undefined) data.fechaHoraFin = new Date(dto.fechaHoraFin);

    const inicio = data.fechaHoraInicio ?? evento.fechaHoraInicio;
    const fin = data.fechaHoraFin ?? evento.fechaHoraFin;
    if (fin <= inicio) {
      throw new BadRequestException('fechaHoraFin debe ser posterior a fechaHoraInicio');
    }

    if (dto.participantesIds !== undefined) {
      const extraParticipantes = dto.participantesIds.filter(
        (pid) => pid !== evento.creadoPorId,
      );
      if (extraParticipantes.length > 0 && rol !== 'ADMIN') {
        throw new ForbiddenException('Solo ADMIN puede modificar participantes adicionales');
      }
      const todosParticipantes = [evento.creadoPorId, ...extraParticipantes];

      return this.prisma.$transaction([
        this.prisma.eventoParticipante.deleteMany({ where: { eventoId: id } }),
        this.prisma.eventoAgenda.update({
          where: { id },
          data: {
            ...data,
            participantes: {
              create: todosParticipantes.map((pid) => ({ trabajadorId: pid })),
            },
          },
          ...PARTICIPANTE_INCLUDE,
        }),
      ]).then(([, updated]) => updated);
    }

    return this.prisma.eventoAgenda.update({
      where: { id },
      data,
      ...PARTICIPANTE_INCLUDE,
    });
  }

  async remove(id: string, userId: string, rol: string) {
    const evento = await this.prisma.eventoAgenda.findUnique({ where: { id } });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    if (evento.creadoPorId !== userId && rol !== 'ADMIN') {
      throw new ForbiddenException('Solo el creador puede eliminar este evento');
    }
    await this.prisma.eventoAgenda.delete({ where: { id } });
  }

  async getHorasTrabajadasHistoricas(
    userId: string,
    rol: string,
    desde: string,
    hasta: string,
    trabajadorIdFiltro?: string,
  ) {
    const filtroId = this.resolveFilterId(userId, rol, trabajadorIdFiltro);
    const [sesiones, eventosParticipante] = await this.fetchHorasData(
      filtroId,
      new Date(desde),
      new Date(hasta),
    );

    const semanaMap = new Map<
      string,
      { minutosClinicas: number; minutosNoClinicas: number; label: string }
    >();

    const getKey = (date: Date): string => {
      const lunes = startOfISOWeek(date);
      return `${getISOWeekYear(lunes)}-W${String(getISOWeek(lunes)).padStart(2, '0')}`;
    };

    const getLabel = (date: Date): string => {
      const lunes = startOfISOWeek(date);
      const domingo = endOfISOWeek(date);
      const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      return `${fmt(lunes)} – ${fmt(domingo)}`;
    };

    for (const s of sesiones) {
      const key = getKey(s.fechaHoraInicio);
      if (!semanaMap.has(key)) semanaMap.set(key, { minutosClinicas: 0, minutosNoClinicas: 0, label: getLabel(s.fechaHoraInicio) });
      semanaMap.get(key)!.minutosClinicas += diffMin(s.fechaHoraInicio, s.fechaHoraFin);
    }

    for (const ep of eventosParticipante) {
      const key = getKey(ep.evento.fechaHoraInicio);
      if (!semanaMap.has(key)) semanaMap.set(key, { minutosClinicas: 0, minutosNoClinicas: 0, label: getLabel(ep.evento.fechaHoraInicio) });
      semanaMap.get(key)!.minutosNoClinicas += diffMin(ep.evento.fechaHoraInicio, ep.evento.fechaHoraFin);
    }

    const semanas = Array.from(semanaMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([semana, data]) => ({ semana, labelSemana: data.label, minutosClinicas: data.minutosClinicas, minutosNoClinicas: data.minutosNoClinicas }));

    const totalClin = semanas.reduce((a, s) => a + s.minutosClinicas, 0);
    const totalNoClin = semanas.reduce((a, s) => a + s.minutosNoClinicas, 0);

    return { semanas, totales: buildTotales(totalClin, totalNoClin) };
  }

  async getResumenHoras(
    userId: string,
    rol: string,
    desde: string,
    hasta: string,
    trabajadorIdFiltro?: string,
  ) {
    const filtroId = this.resolveFilterId(userId, rol, trabajadorIdFiltro);
    const [sesiones, eventosParticipante] = await this.fetchHorasData(
      filtroId,
      new Date(desde),
      new Date(hasta),
    );

    const minClin = sesiones.reduce((a, s) => a + diffMin(s.fechaHoraInicio, s.fechaHoraFin), 0);
    const minNoClin = eventosParticipante.reduce(
      (a, ep) => a + diffMin(ep.evento.fechaHoraInicio, ep.evento.fechaHoraFin),
      0,
    );

    return buildTotales(minClin, minNoClin);
  }
}
