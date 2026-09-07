import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrioridadNotif, TipoNotificacion } from '@prisma/client';
import { NotificacionesSseService } from './notificaciones-sse.service';

export interface CreateNotificacionDto {
  tipo: TipoNotificacion;
  prioridad: PrioridadNotif;
  titulo: string;
  mensaje: string;
  accionUrl?: string;
  reglaOrigen: string;
  referenciaId?: string;
  trabajadorId: string;
  clienteId?: string;
}

const PRIORIDAD_ORDEN: Record<PrioridadNotif, number> = {
  URGENTE: 0,
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3,
};

@Injectable()
export class NotificacionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sseSvc: NotificacionesSseService,
  ) {}

  async findByTrabajador(trabajadorId: string) {
    const notificaciones = await this.prisma.notificacion.findMany({
      where: { trabajadorId, descartada: false },
      include: { cliente: { select: { id: true, nombre: true, apellidos: true } } },
      orderBy: { fechaCreacion: 'desc' },
    });

    // Ordenar por prioridad y luego por fecha
    return notificaciones.sort(
      (a, b) => PRIORIDAD_ORDEN[a.prioridad] - PRIORIDAD_ORDEN[b.prioridad],
    );
  }

  async countNoLeidas(trabajadorId: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: { trabajadorId, leida: false, descartada: false },
    });
  }

  /**
   * Marca leida UNA notificacion, y solo si es del propio trabajador.
   *
   * Antes actualizaba por id a secas, asi que cualquier usuario podia marcar o
   * descartar las notificaciones de otro. Se usa `updateMany` porque el filtro
   * (id + trabajadorId) no es una clave unica y `update` no lo admite.
   */
  async marcarLeida(id: string, trabajadorId?: string) {
    const where = trabajadorId ? { id, trabajadorId } : { id };
    const { count } = await this.prisma.notificacion.updateMany({
      where,
      data: { leida: true, fechaLectura: new Date() },
    });
    if (count === 0) {
      throw new NotFoundException(`Notificación ${id} no encontrada`);
    }
    return { id, leida: true };
  }

  async marcarTodasLeidas(trabajadorId: string) {
    return this.prisma.notificacion.updateMany({
      where: { trabajadorId, leida: false },
      data: { leida: true, fechaLectura: new Date() },
    });
  }

  /** Descarta UNA notificacion, y solo si es del propio trabajador. */
  async descartar(id: string, trabajadorId?: string) {
    const where = trabajadorId ? { id, trabajadorId } : { id };
    const { count } = await this.prisma.notificacion.updateMany({
      where,
      data: { descartada: true },
    });
    if (count === 0) {
      throw new NotFoundException(`Notificación ${id} no encontrada`);
    }
    return { id, descartada: true };
  }

  /**
   * Crea la notificación solo si no existe ya una con la misma clave
   * (reglaOrigen + clienteId + referenciaId). Evita duplicados.
   */
  async crearSiNoExiste(dto: CreateNotificacionDto) {
    const existing = await this.prisma.notificacion.findFirst({
      where: {
        reglaOrigen: dto.reglaOrigen,
        clienteId: dto.clienteId ?? null,
        referenciaId: dto.referenciaId ?? null,
        trabajadorId: dto.trabajadorId,
        descartada: false,
      },
    });

    if (existing) return null;

    const notificacion = await this.prisma.notificacion.create({
      data: dto,
      include: { cliente: { select: { id: true, nombre: true, apellidos: true } } },
    });

    this.sseSvc.emit(dto.trabajadorId, notificacion);

    return notificacion;
  }
}
