import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoSesion, TipoSesion } from '@prisma/client';
import { GenerarSesionesDto } from './dto/generar-sesiones.dto';
import { CompletarSesionDto } from './dto/completar-sesion.dto';
import { SesionWithRelations, sesionInclude } from './sesiones.types';
import {
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  format,
  parseISO,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { BonosService } from 'src/bonos/bonos.service';

@Injectable()
export class SesionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bonosService: BonosService,
  ) {}

  /**
   * Generar sesiones automáticamente desde la disponibilidad del cliente
   */
  async generarSesiones(dto: GenerarSesionesDto) {
    // 1. Verificar que la asignación cliente-trabajador existe y está activa
    const asignacion = await this.prisma.clienteTrabajador.findFirst({
      where: {
        clienteId: dto.clienteId,
        trabajadorId: dto.trabajadorId,
        activo: true,
      },
      include: {
        cliente: true,
        trabajador: true,
        horarios: true, // DisponibilidadClienteTrabajador
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `No existe una asignación activa entre el cliente y el trabajador`,
      );
    }

    if (asignacion.horarios.length === 0) {
      throw new BadRequestException(
        'La asignación no tiene horarios configurados. Añade horarios al terapeuta desde la ficha del cliente.',
      );
    }

    // 2. Comprobar duplicados: sesiones ya existentes en ese rango
    const sesionesExistentes = await this.prisma.sesion.count({
      where: {
        clienteId: dto.clienteId,
        trabajadorId: dto.trabajadorId,
        fechaHoraInicio: {
          gte: new Date(dto.fechaInicio),
          lte: new Date(dto.fechaFin + 'T23:59:59'),
        },
      },
    });

    if (sesionesExistentes > 0) {
      throw new BadRequestException(
        `Ya existen ${sesionesExistentes} sesiones en ese rango de fechas para esta asignación. Elige otro rango o elimina las existentes.`,
      );
    }

    // 3. Generar sesiones iterando día a día
    const sesionesACrear: any[] = [];
    const fechaActual = new Date(dto.fechaInicio + 'T12:00:00'); // Mediodía para evitar cambios de día por DST
    const fechaFin = new Date(dto.fechaFin + 'T23:59:59');

    while (fechaActual <= fechaFin) {
      const diaSemana = fechaActual.getDay(); // 0=Dom, 1=Lun...
      const horarioDelDia = asignacion.horarios.find(
        (h) => h.diaSemana === diaSemana,
      );

      if (horarioDelDia) {
        const [hInicio, mInicio] = horarioDelDia.horaInicio
          .split(':')
          .map(Number);
        const [hFin, mFin] = horarioDelDia.horaFin.split(':').map(Number);

        const fechaHoraInicio = new Date(fechaActual);
        fechaHoraInicio.setHours(hInicio, mInicio, 0, 0);

        const fechaHoraFin = new Date(fechaActual);
        fechaHoraFin.setHours(hFin, mFin, 0, 0);

        sesionesACrear.push({
          fechaHoraInicio,
          fechaHoraFin,
          estado: EstadoSesion.PROGRAMADA,
          tipoSesion: dto.tipoSesion || TipoSesion.PEDAGOGIA,
          clienteId: dto.clienteId,
          trabajadorId: dto.trabajadorId,
        });
      }

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    if (sesionesACrear.length === 0) {
      throw new BadRequestException(
        'No se generaron sesiones. Verifica que los días de los horarios coincidan con el rango de fechas seleccionado.',
      );
    }

    // 4. Crear sesiones + actualizar fechaInicio del cliente en transacción
    await this.prisma.$transaction(async (tx) => {
      await tx.sesion.createMany({ data: sesionesACrear });

      // Actualizar fechaInicio del cliente si no la tiene todavía
      if (!asignacion.cliente.fechaInicio) {
        await tx.cliente.update({
          where: { id: dto.clienteId },
          data: { fechaInicio: new Date(dto.fechaInicio) },
        });
      }
    });

    return {
      message: `Se generaron ${sesionesACrear.length} sesiones correctamente`,
      sesionesCreadas: sesionesACrear.length,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      cliente: `${asignacion.cliente.nombre} ${asignacion.cliente.apellidos}`,
      trabajador: `${asignacion.trabajador.nombre} ${asignacion.trabajador.apellidos}`,
      tipoTerapia: asignacion.tipoTerapia,
    };
  }

  /**
   * Obtener sesiones de un trabajador en un rango de fechas
   */
  async findByTrabajadorYFecha(
    trabajadorId: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<SesionWithRelations[]> {
    const where: any = {
      trabajadorId,
      // ✅ Solo sesiones de clientes que estén asignados a este trabajador
      cliente: {
        trabajadoresAsignados: {
          some: {
            trabajadorId,
            activo: true,
          },
        },
      },
    };

    if (fechaInicio || fechaFin) {
      where.fechaHoraInicio = {};
      if (fechaInicio) where.fechaHoraInicio.gte = new Date(fechaInicio);
      if (fechaFin)
        where.fechaHoraInicio.lte = new Date(fechaFin + 'T23:59:59');
    }

    return await this.prisma.sesion.findMany({
      where,
      include: sesionInclude,
      orderBy: { fechaHoraInicio: 'asc' },
    });
  }

  /**
   * Obtener sesiones de un cliente
   */
  async findByCliente(clienteId: string, limit = 500): Promise<SesionWithRelations[]> {
    return await this.prisma.sesion.findMany({
      where: { clienteId },
      include: sesionInclude,
      orderBy: { fechaHoraInicio: 'desc' },
      take: limit,
    });
  }

  /**
   * Obtener una sesión por ID
   */
  async findOne(id: string, user?: { userId: string; rol: string }): Promise<SesionWithRelations | null> {
    const soloAsignados = user && !['ADMIN', 'RECEP'].includes(user.rol);
    if (soloAsignados) {
      return await this.prisma.sesion.findFirst({
        where: {
          id,
          cliente: {
            trabajadoresAsignados: { some: { trabajadorId: user.userId, activo: true } },
          },
        },
        include: sesionInclude,
      });
    }
    return await this.prisma.sesion.findUnique({
      where: { id },
      include: sesionInclude,
    });
  }

  /**
   * Completar una sesión (y opcionalmente crear registro diario)
   */
  async completarSesion(id: string, dto: CompletarSesionDto) {
    // ── 1. Validaciones previas ──────────────────────────────────────────
    const sesion = await this.prisma.sesion.findUnique({ where: { id } });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }
    if (sesion.estado === EstadoSesion.COMPLETADA) {
      throw new BadRequestException('La sesión ya está completada');
    }

    // ── 2. Transacción atómica: sesión + bono ────────────────────────────
    const { sesionActualizada, bono } = await this.prisma.$transaction(
      async (tx) => {
        const sesionActualizada = await tx.sesion.update({
          where: { id },
          data: {
            estado: EstadoSesion.COMPLETADA,
            notas: dto.notas,
            objetivosTrabajados: dto.objetivosTrabajados,
          },
          include: sesionInclude,
        });

        const bono = await this.bonosService.descontarSesion(
          sesion.clienteId,
          sesion.tipoSesion,
          id,
          tx,
        );

        return { sesionActualizada, bono };
      },
    );

    // ── 3. Respuesta ─────────────────────────────────────────────────────
    return {
      sesion: sesionActualizada,
      bono: bono ?? null,
      sinBonoActivo: !bono,
      message: bono
        ? `Sesión completada · Bono: ${bono.sesionesConsumidas}/${bono.totalSesiones}${bono.estado === 'CONSUMIDO' ? ' · ⚠️ Bono agotado' : ''}`
        : 'Sesión completada · Sin bono activo',
    };
  }

  /**
   * Cancelar una sesión
   */
  async cancelarSesion(id: string, conAviso: boolean = true) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    const nuevoEstado = conAviso
      ? EstadoSesion.CANCELADA_CON_AVISO
      : EstadoSesion.CANCELADA_SIN_AVISO;

    return await this.prisma.sesion.update({
      where: { id },
      data: { estado: nuevoEstado },
      include: sesionInclude,
    });
  }

  /**
   * Actualizar una sesión
   */
  async update(
    id: string,
    data: Partial<{
      fechaHoraInicio: Date;
      fechaHoraFin: Date;
      tipoSesion: TipoSesion;
      notas: string;
    }>,
  ) {
    return await this.prisma.sesion.update({
      where: { id },
      data,
      include: sesionInclude,
    });
  }

  /**
   * Eliminar una sesión
   */
  async remove(id: string) {
    await this.prisma.sesion.delete({
      where: { id },
    });
    return { message: 'Sesión eliminada correctamente' };
  }

  /**
   * Obtener calendario semanal del trabajador
   * Agrupa sesiones por día de la semana
   */
  async getCalendarioSemanal(trabajadorId: string, fechaReferencia?: Date) {
    try {
      const fecha = fechaReferencia ? new Date(fechaReferencia) : new Date();

      // Calcular inicio y fin de semana (lunes a domingo)
      const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 }); // 1 = Lunes
      const finSemana = endOfWeek(fecha, { weekStartsOn: 1 });

      // Obtener sesiones de la semana
      const sesiones = await this.prisma.sesion.findMany({
        where: {
          trabajadorId,
          cliente: {
            trabajadoresAsignados: {
              some: {
                trabajadorId,
                activo: true,
              },
            },
          },
          fechaHoraInicio: { gte: inicioSemana, lte: finSemana },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              curso: true,
            },
          },
          trabajador: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
        orderBy: {
          fechaHoraInicio: 'asc',
        },
      });

      // Agrupar sesiones por día
      const diasSemana: any = [];
      for (let i = 0; i < 7; i++) {
        const dia = addDays(inicioSemana, i);
        const inicioDia = new Date(
          dia.getFullYear(),
          dia.getMonth(),
          dia.getDate(),
          0,
          0,
          0,
          0,
        );
        const finDia = new Date(
          dia.getFullYear(),
          dia.getMonth(),
          dia.getDate(),
          23,
          59,
          59,
          999,
        );

        const sesionesDia = sesiones.filter(
          (sesion) =>
            sesion.fechaHoraInicio >= inicioDia &&
            sesion.fechaHoraInicio <= finDia,
        );

        diasSemana.push({
          fecha: format(dia, 'yyyy-MM-dd'),
          diaSemana: format(dia, 'EEEE', { locale: es }), // "lunes", "martes", etc.
          dia: format(dia, 'd'),
          mes: format(dia, 'MMMM', { locale: es }),
          esHoy: format(dia, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
          totalSesiones: sesionesDia.length,
          sesiones: sesionesDia.map((sesion) => ({
            id: sesion.id,
            horaInicio: format(sesion.fechaHoraInicio, 'HH:mm'),
            horaFin: format(sesion.fechaHoraFin, 'HH:mm'),
            duracion: this.calcularDuracionMinutos(
              sesion.fechaHoraInicio,
              sesion.fechaHoraFin,
            ),
            estado: sesion.estado,
            tipoSesion: sesion.tipoSesion,
            cliente: {
              id: sesion.cliente.id,
              nombreCompleto: `${sesion.cliente.nombre} ${sesion.cliente.apellidos}`,
              curso: sesion.cliente.curso,
            },
            notas: sesion.notas,
          })),
        });
      }

      // Resumen de la semana
      const resumen = {
        totalSesiones: sesiones.length,
        completadas: sesiones.filter(
          (s) => s.estado === EstadoSesion.COMPLETADA,
        ).length,
        programadas: sesiones.filter(
          (s) => s.estado === EstadoSesion.PROGRAMADA,
        ).length,
        canceladas: sesiones.filter(
          (s) =>
            s.estado === EstadoSesion.CANCELADA_CON_AVISO ||
            s.estado === EstadoSesion.CANCELADA_SIN_AVISO,
        ).length,
        clientesUnicos: new Set(sesiones.map((s) => s.clienteId)).size,
      };

      return {
        trabajador: {
          id: trabajadorId,
        },
        rangoSemana: {
          inicio: format(inicioSemana, 'yyyy-MM-dd'),
          fin: format(finSemana, 'yyyy-MM-dd'),
          inicioFormateado: format(inicioSemana, "d 'de' MMMM", { locale: es }),
          finFormateado: format(finSemana, "d 'de' MMMM 'de' yyyy", {
            locale: es,
          }),
        },
        dias: diasSemana,
        resumen,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error al obtener calendario: ${err.message}`,
      );
    }
  }

  async getCalendarioDiario(trabajadorId: string, fechaReferencia?: Date) {
    try {
      const fecha = fechaReferencia ? new Date(fechaReferencia) : new Date();
      const inicioDia = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        0,
        0,
        0,
        0,
      );
      const finDia = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        23,
        59,
        59,
        999,
      );

      const sesiones = await this.prisma.sesion.findMany({
        where: {
          trabajadorId,
          cliente: {
            trabajadoresAsignados: {
              some: {
                trabajadorId,
                activo: true,
              },
            },
          },
          fechaHoraInicio: { gte: inicioDia, lte: finDia },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              curso: true,
            },
          },
        },
        orderBy: {
          fechaHoraInicio: 'asc',
        },
      });

      const ahora = new Date();

      // Estadísticas
      const estadisticas = {
        completadas: sesiones.filter(
          (s) => s.estado === EstadoSesion.COMPLETADA,
        ).length,
        programadas: sesiones.filter(
          (s) => s.estado === EstadoSesion.PROGRAMADA,
        ).length,
        canceladas: sesiones.filter(
          (s) =>
            s.estado === EstadoSesion.CANCELADA_CON_AVISO ||
            s.estado === EstadoSesion.CANCELADA_SIN_AVISO,
        ).length,
      };

      return {
        fecha: format(fecha, 'yyyy-MM-dd'),
        fechaFormateada: format(fecha, "EEEE d 'de' MMMM 'de' yyyy", {
          locale: es,
        }),
        diaSemana: format(fecha, 'EEEE', { locale: es }),
        esHoy: format(fecha, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
        totalSesiones: sesiones.length,
        estadisticas,
        sesiones: sesiones.map((sesion) => {
          const esPasada = sesion.fechaHoraFin < ahora;
          const esActual =
            sesion.fechaHoraInicio <= ahora && sesion.fechaHoraFin >= ahora;
          const esFutura = sesion.fechaHoraInicio > ahora;

          return {
            id: sesion.id,
            horaInicio: format(sesion.fechaHoraInicio, 'HH:mm'),
            horaFin: format(sesion.fechaHoraFin, 'HH:mm'),
            duracion: this.calcularDuracionMinutos(
              sesion.fechaHoraInicio,
              sesion.fechaHoraFin,
            ),
            estado: sesion.estado,
            tipoSesion: sesion.tipoSesion,
            cliente: {
              id: sesion.cliente.id,
              nombre: sesion.cliente.nombre,
              apellidos: sesion.cliente.apellidos,
              nombreCompleto: `${sesion.cliente.nombre} ${sesion.cliente.apellidos}`,
              curso: sesion.cliente.curso,
            },
            notas: sesion.notas,
            temporal: {
              esPasada,
              esActual,
              esFutura,
            },
          };
        }),
      };
    } catch (err) {
      throw new BadRequestException(
        `Error al obtener calendario diario: ${err.message}`,
      );
    }
  }

  /**
   * Obtener calendario mensual del trabajador
   */
  async getCalendarioMensual(trabajadorId: string, fechaReferencia?: Date) {
    try {
      const fecha = fechaReferencia ? new Date(fechaReferencia) : new Date();

      // Primer y último día del mes
      const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
      const ultimoDiaMes = new Date(
        fecha.getFullYear(),
        fecha.getMonth() + 1,
        0,
      );

      const sesiones = await this.prisma.sesion.findMany({
        where: {
          trabajadorId,
          fechaHoraInicio: {
            gte: primerDiaMes,
            lte: endOfDay(ultimoDiaMes),
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
        },
        orderBy: {
          fechaHoraInicio: 'asc',
        },
      });

      // Agrupar por día
      const diasConSesiones = sesiones.reduce(
        (acc, sesion) => {
          const fecha = format(sesion.fechaHoraInicio, 'yyyy-MM-dd');
          if (!acc[fecha]) {
            acc[fecha] = [];
          }
          acc[fecha].push({
            id: sesion.id,
            hora: format(sesion.fechaHoraInicio, 'HH:mm'),
            cliente: `${sesion.cliente.nombre} ${sesion.cliente.apellidos}`,
            estado: sesion.estado,
            tipoSesion: sesion.tipoSesion,
          });
          return acc;
        },
        {} as Record<string, any[]>,
      );

      return {
        mes: format(fecha, 'MMMM yyyy', { locale: es }),
        anio: fecha.getFullYear(),
        mesNumero: fecha.getMonth() + 1,
        totalSesiones: sesiones.length,
        dias: diasConSesiones,
      };
    } catch (err) {
      throw new BadRequestException(
        `Error al obtener calendario mensual: ${err.message}`,
      );
    }
  }

  /**
   * Obtener sesiones de hoy del trabajador
   */
  async getSesionesHoy(trabajadorId: string) {
    try {
      const hoy = new Date();
      const inicioHoy = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        0,
        0,
        0,
        0,
      );
      const finHoy = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        23,
        59,
        59,
        999,
      );

      const sesiones = await this.prisma.sesion.findMany({
        where: {
          trabajadorId,
          fechaHoraInicio: {
            gte: inicioHoy,
            lte: finHoy,
          },
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              curso: true,
            },
          },
        },
        orderBy: {
          fechaHoraInicio: 'asc',
        },
      });

      const ahora = new Date();

      return {
        fecha: format(hoy, 'yyyy-MM-dd'),
        fechaFormateada: format(hoy, "EEEE d 'de' MMMM 'de' yyyy", {
          locale: es,
        }),
        totalSesiones: sesiones.length,
        sesiones: sesiones.map((sesion) => {
          const esPasada = sesion.fechaHoraFin < ahora;
          const esActual =
            sesion.fechaHoraInicio <= ahora && sesion.fechaHoraFin >= ahora;
          const esFutura = sesion.fechaHoraInicio > ahora;

          return {
            id: sesion.id,
            horaInicio: format(sesion.fechaHoraInicio, 'HH:mm'),
            horaFin: format(sesion.fechaHoraFin, 'HH:mm'),
            estado: sesion.estado,
            tipoSesion: sesion.tipoSesion,
            cliente: {
              id: sesion.cliente.id,
              nombreCompleto: `${sesion.cliente.nombre} ${sesion.cliente.apellidos}`,
              curso: sesion.cliente.curso,
            },
            temporal: {
              esPasada,
              esActual,
              esFutura,
            },
          };
        }),
      };
    } catch (err) {
      throw new BadRequestException(
        `Error al obtener sesiones de hoy: ${err.message}`,
      );
    }
  }

  /**
   * Calcular duración en minutos entre dos fechas
   */
  private calcularDuracionMinutos(inicio: Date, fin: Date): number {
    return Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60));
  }
}
