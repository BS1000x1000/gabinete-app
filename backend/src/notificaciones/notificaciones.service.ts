import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrioridadNotif, TipoNotificacion } from '@prisma/client';

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
  constructor(private readonly prisma: PrismaService) {}

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

  async marcarLeida(id: string) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true, fechaLectura: new Date() },
    });
  }

  async marcarTodasLeidas(trabajadorId: string) {
    return this.prisma.notificacion.updateMany({
      where: { trabajadorId, leida: false },
      data: { leida: true, fechaLectura: new Date() },
    });
  }

  async descartar(id: string) {
    return this.prisma.notificacion.update({
      where: { id },
      data: { descartada: true },
    });
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

    return this.prisma.notificacion.create({ data: dto });
  }
}
