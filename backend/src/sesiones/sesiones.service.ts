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

@Injectable()
export class SesionesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generar sesiones automáticamente desde la disponibilidad del cliente
   */
  async generarSesiones(dto: GenerarSesionesDto) {
    // 1. Verificar que cliente y trabajador existen
    const [cliente, trabajador] = await Promise.all([
      this.prisma.cliente.findUnique({ where: { id: dto.clienteId } }),
      this.prisma.trabajador.findUnique({ where: { id: dto.trabajadorId } }),
    ]);

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${dto.clienteId} no encontrado`,
      );
    }
    if (!trabajador) {
      throw new NotFoundException(
        `Trabajador con ID ${dto.trabajadorId} no encontrado`,
      );
    }

    // 2. Obtener disponibilidad del cliente
    const disponibilidades = await this.prisma.disponibilidadCliente.findMany({
      where: { clienteId: dto.clienteId },
    });

    if (disponibilidades.length === 0) {
      throw new BadRequestException(
        'El cliente no tiene disponibilidad configurada',
      );
    }

    // 3. Generar sesiones
    const sesionesACrear: any = [];
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    const fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      const diaSemana = fechaActual.getDay();
      const disponibilidadDelDia = disponibilidades.find(
        (d) => d.diaSemana === diaSemana,
      );

      if (disponibilidadDelDia) {
        const [horaInicio, minInicio] = disponibilidadDelDia.horaInicio
          .split(':')
          .map(Number);
        const [horaFin, minFin] = disponibilidadDelDia.horaFin
          .split(':')
          .map(Number);

        const fechaHoraInicio = new Date(fechaActual);
        fechaHoraInicio.setHours(horaInicio, minInicio, 0, 0);

        const fechaHoraFin = new Date(fechaActual);
        fechaHoraFin.setHours(horaFin, minFin, 0, 0);

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

    // 4. Crear sesiones
    if (sesionesACrear.length > 0) {
      await this.prisma.sesion.createMany({
        data: sesionesACrear,
      });
    }

    return {
      message: `Se generaron ${sesionesACrear.length} sesiones`,
      sesionesCreadas: sesionesACrear.length,
      fechaInicio: dto.fechaInicio,
      fechaFin: dto.fechaFin,
      cliente: `${cliente.nombre} ${cliente.apellidos}`,
      trabajador: `${trabajador.nombre} ${trabajador.apellidos}`,
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
    const where: any = { trabajadorId };

    if (fechaInicio || fechaFin) {
      where.fechaHoraInicio = {};
      if (fechaInicio) where.fechaHoraInicio.gte = new Date(fechaInicio);
      if (fechaFin) where.fechaHoraInicio.lte = new Date(fechaFin);
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
  async findByCliente(clienteId: string): Promise<SesionWithRelations[]> {
    return await this.prisma.sesion.findMany({
      where: { clienteId },
      include: sesionInclude,
      orderBy: { fechaHoraInicio: 'desc' },
    });
  }

  /**
   * Obtener una sesión por ID
   */
  async findOne(id: string): Promise<SesionWithRelations | null> {
    return await this.prisma.sesion.findUnique({
      where: { id },
      include: sesionInclude,
    });
  }

  /**
   * Completar una sesión (y opcionalmente crear registro diario)
   */
  async completarSesion(id: string, dto: CompletarSesionDto) {
    const sesion = await this.prisma.sesion.findUnique({
      where: { id },
    });

    if (!sesion) {
      throw new NotFoundException(`Sesión con ID ${id} no encontrada`);
    }

    if (sesion.estado === EstadoSesion.COMPLETADA) {
      throw new BadRequestException('La sesión ya está completada');
    }

    // Si se proporciona contenido para registro diario, usar transacción
    if (dto.contenidoRegistroDiario) {
      const [sesionActualizada, registroCreado] =
        await this.prisma.$transaction([
          // Actualizar sesión
          this.prisma.sesion.update({
            where: { id },
            data: {
              estado: EstadoSesion.COMPLETADA,
              notas: dto.notas,
              objetivosTrabajados: dto.objetivosTrabajados,
            },
            include: sesionInclude,
          }),
          // Crear registro diario
          this.prisma.registroDiario.create({
            data: {
              contenido: dto.contenidoRegistroDiario,
              clienteId: sesion.clienteId,
              trabajadorId: sesion.trabajadorId,
              fechaRegistro: new Date(),
            },
          }),
        ]);

      return {
        sesion: sesionActualizada,
        registroDiario: registroCreado,
        message: 'Sesión completada y registro diario creado',
      };
    }

    // Solo actualizar sesión
    const sesionActualizada = await this.prisma.sesion.update({
      where: { id },
      data: {
        estado: EstadoSesion.COMPLETADA,
        notas: dto.notas,
        objetivosTrabajados: dto.objetivosTrabajados,
      },
      include: sesionInclude,
    });

    return {
      sesion: sesionActualizada,
      message: 'Sesión completada',
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
          fechaHoraInicio: {
            gte: inicioSemana,
            lte: finSemana,
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
        const inicioDia = startOfDay(dia);
        const finDia = endOfDay(dia);

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
      const inicioDia = startOfDay(fecha);
      const finDia = endOfDay(fecha);

      console.log('📅 Calendario diario solicitado:');
      console.log('   Fecha:', format(fecha, 'yyyy-MM-dd'));
      console.log('   Inicio:', inicioDia);
      console.log('   Fin:', finDia);

      const sesiones = await this.prisma.sesion.findMany({
        where: {
          trabajadorId,
          fechaHoraInicio: {
            gte: inicioDia,
            lte: finDia,
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

      console.log(`   Sesiones encontradas: ${sesiones.length}`);

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
      const inicioHoy = startOfDay(hoy);
      const finHoy = endOfDay(hoy);

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
