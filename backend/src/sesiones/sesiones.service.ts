import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoSesion, TipoSesion, ModalidadSesion } from '@prisma/client';
import { CompletarSesionDto } from './dto/completar-sesion.dto';
import { CreateSesionDto } from './dto/create-sesion.dto';
import { SesionWithRelations, sesionInclude } from './sesiones.types';
import { PaginationDto } from '../common/dto/pagination.dto';
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
import { HorariosLaboralesService } from '../horarios-laborales/horarios-laborales.service';

@Injectable()
export class SesionesService {
  private readonly logger = new Logger(SesionesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bonosService: BonosService,
    private readonly horariosLaborales: HorariosLaboralesService,
  ) {}

  /**
   * Crea una sesion suelta: evaluacion, sesion extra que se cobra aparte,
   * reunion. Queda con `contratoId` null a proposito, que es lo que la protege
   * de los procesos automaticos del contrato.
   *
   * No valida solapes a proposito: el gabinete a veces necesita meter una sesion
   * a deshora y la app no debe impedirselo. El aviso visual es cosa del frontend.
   */
  async create(dto: CreateSesionDto) {
    const inicio = new Date(dto.fechaHoraInicio);
    const fin = new Date(dto.fechaHoraFin);

    if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) {
      throw new BadRequestException('Fechas no validas');
    }
    if (fin <= inicio) {
      throw new BadRequestException('La hora de fin debe ser posterior a la de inicio');
    }

    const cliente = await this.prisma.cliente.findFirst({
      where: { id: dto.clienteId, deletedAt: null },
      select: { id: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${dto.clienteId} no encontrado`);
    }

    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id: dto.trabajadorId },
      select: { id: true },
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador ${dto.trabajadorId} no encontrado`);
    }

    this.logger.log(
      `Sesion suelta ${dto.tipoSesion} para cliente ${dto.clienteId} el ${dto.fechaHoraInicio}`,
    );

    // Los avisos se calculan pero NO impiden crear: solape, fuera de la
    // disponibilidad o vacaciones se informan y el profesional decide. Se
    // devuelven junto a la sesion para que la UI los enseñe.
    const avisos = await this.horariosLaborales.evaluarAvisos({
      trabajadorId: dto.trabajadorId,
      clienteId:    dto.clienteId,
      inicio,
      fin,
    });

    const sesion = await this.prisma.sesion.create({
      data: {
        clienteId:       dto.clienteId,
        trabajadorId:    dto.trabajadorId,
        fechaHoraInicio: inicio,
        fechaHoraFin:    fin,
        tipoSesion:      dto.tipoSesion,
        ...(dto.modalidad ? { modalidad: dto.modalidad } : {}),
        ...(dto.notas ? { notas: dto.notas } : {}),
      },
      include: {
        cliente:    { select: { id: true, nombre: true, apellidos: true } },
        trabajador: { select: { id: true, nombre: true, apellidos: true } },
      },
    });

    return { ...sesion, avisos };
  }

  /*
   * `generarSesiones()` se retiro (2026-08-31).
   *
   * Generaba sesiones a partir de `ClienteTrabajador.horarios`, en paralelo al
   * generador del contrato, sin que ninguno supiera del otro: dos fuentes de
   * verdad escribiendo en la misma tabla. Ademas no respetaba festivos ni
   * vacaciones y dejaba `contratoId` a null, con lo que las sesiones no eran
   * trazables a facturacion y `finalizar()` de un contrato no podia cancelarlas
   * -eso dejo 46 sesiones zombi en la BD de pruebas-.
   *
   * El horario recurrente lo define ahora el contrato:
   * `ContratosService.generarSesionesContrato()`. Para una sesion suelta
   * (evaluacion, extra) esta `POST /sesiones`.
   */


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
  async findByCliente(clienteId: string, pagination: PaginationDto = {}) {
    // Devuelve `total` a proposito: antes se cortaba en 500 filas en silencio y
    // el frontend no tenia forma de saber que faltaba historial.
    const { page = 1, limit = 100 } = pagination;
    const skip = (page - 1) * limit;
    const where = { clienteId };

    const [data, total] = await Promise.all([
      this.prisma.sesion.findMany({
        where,
        include: sesionInclude,
        orderBy: { fechaHoraInicio: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.sesion.count({ where }),
    ]);

    return { data, total, page, limit };
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
      modalidad: ModalidadSesion;
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
              urlVideollamada: true,
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
            modalidad: sesion.modalidad,
            cliente: {
              id: sesion.cliente.id,
              nombreCompleto: `${sesion.cliente.nombre} ${sesion.cliente.apellidos}`,
              curso: sesion.cliente.curso,
            },
            urlVideollamada: sesion.trabajador?.urlVideollamada,
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
          trabajador: {
            select: { urlVideollamada: true },
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
            modalidad: sesion.modalidad,
            urlVideollamada: sesion.trabajador?.urlVideollamada,
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
