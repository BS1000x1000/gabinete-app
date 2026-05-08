import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EstadoSesion } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Estadísticas generales del sistema
   */
  async getEstadisticasGenerales() {
    try {
      const hoy = new Date();
      const inicioHoy = startOfDay(hoy);
      const finHoy = endOfDay(hoy);
      const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
      const finSemana = endOfWeek(hoy, { weekStartsOn: 1 });
      const hace7Dias = subDays(hoy, 7);

      const [
        totalClientes,
        clientesActivos,
        totalTrabajadores,
        trabajadoresActivos,
        sesionesHoy,
        sesionesEstaSemana,
        registrosUltimaSemana,
        totalObjetivosGenerales,
        totalAreas,
      ] = await Promise.all([
        this.prisma.cliente.count(),
        this.prisma.cliente.count({ where: { activo: true } }),
        this.prisma.trabajador.count(),
        this.prisma.trabajador.count({ where: { activo: true } }),
        this.prisma.sesion.count({
          where: {
            fechaHoraInicio: {
              gte: inicioHoy,
              lte: finHoy,
            },
          },
        }),
        this.prisma.sesion.count({
          where: {
            fechaHoraInicio: {
              gte: inicioSemana,
              lte: finSemana,
            },
          },
        }),
        this.prisma.registroDiario.count({
          where: {
            fechaRegistro: {
              gte: hace7Dias,
            },
          },
        }),
        this.prisma.objetivoGeneral.count({ where: { activo: true } }),
        this.prisma.areaDesarrollo.count({ where: { activo: true } }),
      ]);

      return {
        clientes: {
          total: totalClientes,
          activos: clientesActivos,
          inactivos: totalClientes - clientesActivos,
        },
        trabajadores: {
          total: totalTrabajadores,
          activos: trabajadoresActivos,
          inactivos: totalTrabajadores - trabajadoresActivos,
        },
        sesiones: {
          hoy: sesionesHoy,
          estaSemana: sesionesEstaSemana,
        },
        registros: {
          ultimaSemana: registrosUltimaSemana,
        },
        objetivos: {
          totalObjetivosGenerales,
          totalAreas,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener estadísticas generales: ${err.message}`,
      );
    }
  }

  /**
   * Estadísticas del trabajador autenticado
   */
  async getEstadisticasTrabajador(trabajadorId: string) {
    try {
      const hoy = new Date();
      const inicioHoy = startOfDay(hoy);
      const finHoy = endOfDay(hoy);
      const inicioMes = startOfMonth(hoy);
      const finMes = endOfMonth(hoy);

      const [
        clientesAsignados,
        sesionesHoy,
        sesionesEsteMes,
        registrosEsteMes,
        sesionesPorEstado,
      ] = await Promise.all([
        this.prisma.clienteTrabajador.count({
          where: { trabajadorId },
        }),
        this.prisma.sesion.count({
          where: {
            trabajadorId,
            fechaHoraInicio: {
              gte: inicioHoy,
              lte: finHoy,
            },
          },
        }),
        this.prisma.sesion.count({
          where: {
            trabajadorId,
            fechaHoraInicio: {
              gte: inicioMes,
              lte: finMes,
            },
          },
        }),
        this.prisma.registroDiario.count({
          where: {
            trabajadorId,
            fechaRegistro: {
              gte: inicioMes,
              lte: finMes,
            },
          },
        }),
        this.prisma.sesion.groupBy({
          by: ['estado'],
          where: {
            trabajadorId,
            fechaHoraInicio: {
              gte: inicioMes,
              lte: finMes,
            },
          },
          _count: {
            estado: true,
          },
        }),
      ]);

      const estadosSesiones = sesionesPorEstado.reduce((acc, item) => {
        acc[item.estado] = item._count.estado;
        return acc;
      }, {} as Record<string, number>);

      return {
        clientesAsignados,
        sesiones: {
          hoy: sesionesHoy,
          esteMes: sesionesEsteMes,
          porEstado: {
            completadas: estadosSesiones['COMPLETADA'] || 0,
            programadas: estadosSesiones['PROGRAMADA'] || 0,
            canceladasConAviso: estadosSesiones['CANCELADA_CON_AVISO'] || 0,
            canceladasSinAviso: estadosSesiones['CANCELADA_SIN_AVISO'] || 0,
          },
        },
        registros: {
          esteMes: registrosEsteMes,
        },
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener estadísticas del trabajador: ${err.message}`,
      );
    }
  }

  /**
   * Clientes más activos (con más sesiones)
   */
  async getClientesMasActivos(limite: number = 10) {
    try {
      const clientesConSesiones = await this.prisma.sesion.groupBy({
        by: ['clienteId'],
        _count: {
          clienteId: true,
        },
        orderBy: {
          _count: {
            clienteId: 'desc',
          },
        },
        take: limite,
      });

      const clientesConDetalles = await Promise.all(
        clientesConSesiones.map(async (item) => {
          const cliente = await this.prisma.cliente.findUnique({
            where: { id: item.clienteId },
            select: {
              id: true,
              nombre: true,
              apellidos: true,
              curso: true,
              activo: true,
            },
          });

          return {
            cliente,
            totalSesiones: item._count.clienteId,
          };
        })
      );

      return clientesConDetalles.filter(item => item.cliente !== null);
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener clientes más activos: ${err.message}`,
      );
    }
  }

  /**
   * Objetivos más trabajados
   */
  async getObjetivosMasTrabajados(limite: number = 10) {
    try {
      const objetivosTrabajados = await this.prisma.registroDiarioObjetivo.groupBy({
        by: ['objetivoGeneralId'],
        _count: {
          objetivoGeneralId: true,
        },
        orderBy: {
          _count: {
            objetivoGeneralId: 'desc',
          },
        },
        take: limite,
      });

      const objetivosConDetalles = await Promise.all(
        objetivosTrabajados.map(async (item) => {
          const objetivo = await this.prisma.objetivoGeneral.findUnique({
            where: { id: item.objetivoGeneralId },
            include: {
              areaDesarrollo: {
                select: {
                  nombre: true,
                  color: true,
                },
              },
            },
          });

          return {
            objetivo: {
              id: objetivo?.id,
              titulo: objetivo?.titulo,
              area: objetivo?.areaDesarrollo.nombre,
              color: objetivo?.areaDesarrollo.color,
            },
            vecesUtilizado: item._count.objetivoGeneralId,
          };
        })
      );

      return objetivosConDetalles.filter(item => item.objetivo.id !== undefined);
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener objetivos más trabajados: ${err.message}`,
      );
    }
  }

  /**
   * Actividad reciente del sistema
   */
  async getActividadReciente(limite: number = 10) {
    try {
      const registrosRecientes = await this.prisma.registroDiario.findMany({
        take: limite,
        orderBy: {
          fechaRegistro: 'desc',
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          trabajador: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          objetivosGeneralesTrabajados: {
            include: {
              objetivoGeneral: {
                select: {
                  titulo: true,
                  areaDesarrollo: {
                    select: {
                      nombre: true,
                      color: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return registrosRecientes.map((registro) => ({
        id: registro.id,
        fecha: registro.fechaRegistro,
        cliente: `${registro.cliente.nombre} ${registro.cliente.apellidos}`,
        trabajador: `${registro.trabajador.nombre} ${registro.trabajador.apellidos}`,
        resumen: registro.contenido.substring(0, 100) + '...',
        objetivosTrabajados: registro.objetivosGeneralesTrabajados.length,
      }));
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener actividad reciente: ${err.message}`,
      );
    }
  }

  /**
   * Distribución de sesiones por tipo
   */
  async getDistribucionSesionesPorTipo() {
    try {
      const distribucion = await this.prisma.sesion.groupBy({
        by: ['tipoSesion'],
        _count: {
          tipoSesion: true,
        },
      });

      return distribucion.map((item) => ({
        tipo: item.tipoSesion,
        cantidad: item._count.tipoSesion,
      }));
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener distribución de sesiones: ${err.message}`,
      );
    }
  }

  /**
   * Vista operativa del día para el terapeuta autenticado
   */
  async getMiDia(trabajadorId: string, nombreTrabajador: string) {
    try {
      const hoy = new Date();
      const inicioHoy = startOfDay(hoy);
      const finHoy = endOfDay(hoy);
      const inicioMes = startOfMonth(hoy);
      const finMes = endOfMonth(hoy);
      const hace30Dias = subDays(hoy, 30);

      // Saludo según la hora
      const hora = hoy.getHours();
      const saludo =
        hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';

      const [
        sesionesHoyRaw,
        notifUrgenteCount,
        alertasUrgenteRaw,
        informesBorradorRaw,
        bonosSinCobrarRaw,
        objetivosSinEvaluarRaw,
        registrosHoy,
        sesionesEsteMesPorEstado,
        totalSesionesEsteMes,
        clientesAsignados,
        registrosEsteMes,
      ] = await Promise.all([
        // 1. Sesiones de hoy con cliente y su bono activo
        this.prisma.sesion.findMany({
          where: {
            trabajadorId,
            fechaHoraInicio: { gte: inicioHoy, lte: finHoy },
          },
          include: {
            cliente: {
              select: {
                id: true,
                nombre: true,
                apellidos: true,
                bonos: {
                  where: { estado: 'ACTIVO' },
                  select: { id: true, sesionesConsumidas: true, totalSesiones: true },
                  take: 1,
                },
              },
            },
            trabajador: { select: { urlVideollamada: true } },
          },
          orderBy: { fechaHoraInicio: 'asc' },
        }),

        // 2. Conteo notificaciones urgentes no leídas
        this.prisma.notificacion.count({
          where: {
            trabajadorId,
            prioridad: 'URGENTE',
            leida: false,
            descartada: false,
          },
        }),

        // 3. Top 5 alertas (URGENTE + ALTA) no leídas
        this.prisma.notificacion.findMany({
          where: {
            trabajadorId,
            prioridad: { in: ['URGENTE', 'ALTA'] },
            leida: false,
            descartada: false,
          },
          select: {
            id: true,
            tipo: true,
            prioridad: true,
            titulo: true,
            mensaje: true,
            accionUrl: true,
            fechaCreacion: true,
          },
          orderBy: [{ prioridad: 'asc' }, { fechaCreacion: 'desc' }],
          take: 5,
        }),

        // 4. Informes en borrador de este trabajador
        this.prisma.informe.findMany({
          where: { trabajadorId, estado: 'BORRADOR' },
          select: {
            id: true,
            titulo: true,
            tipoInforme: true,
            updatedAt: true,
            cliente: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { updatedAt: 'desc' },
        }),

        // 5. Bonos consumidos sin cobrar de clientes asignados a este trabajador
        this.prisma.bono.findMany({
          where: {
            estado: 'CONSUMIDO',
            pagado: false,
            cliente: {
              trabajadoresAsignados: { some: { trabajadorId } },
            },
          },
          select: {
            id: true,
            totalSesiones: true,
            sesionesConsumidas: true,
            fechaFin: true,
            cliente: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { fechaFin: 'desc' },
        }),

        // 6. Objetivos activos sin evaluar en 30+ días de clientes de este trabajador
        this.prisma.clienteObjetivo.findMany({
          where: {
            activo: true,
            OR: [
              { fechaUltimaEvaluacion: null },
              { fechaUltimaEvaluacion: { lt: hace30Dias } },
            ],
            cliente: {
              trabajadoresAsignados: { some: { trabajadorId } },
            },
          },
          include: {
            objetivoGeneral: { select: { titulo: true } },
            cliente: { select: { id: true, nombre: true, apellidos: true } },
          },
          orderBy: { fechaUltimaEvaluacion: 'asc' },
          take: 5,
        }),

        // 7. Registros creados hoy por este trabajador
        this.prisma.registroDiario.count({
          where: {
            trabajadorId,
            fechaRegistro: { gte: inicioHoy, lte: finHoy },
          },
        }),

        // 8. Sesiones este mes agrupadas por estado
        this.prisma.sesion.groupBy({
          by: ['estado'],
          where: {
            trabajadorId,
            fechaHoraInicio: { gte: inicioMes, lte: finMes },
          },
          _count: { estado: true },
        }),

        // 9. Total sesiones este mes
        this.prisma.sesion.count({
          where: {
            trabajadorId,
            fechaHoraInicio: { gte: inicioMes, lte: finMes },
          },
        }),

        // 10. Clientes asignados
        this.prisma.clienteTrabajador.count({ where: { trabajadorId } }),

        // 11. Registros este mes
        this.prisma.registroDiario.count({
          where: {
            trabajadorId,
            fechaRegistro: { gte: inicioMes, lte: finMes },
          },
        }),
      ]);

      // Formatear sesiones de hoy
      const sesionesHoy = sesionesHoyRaw.map((s) => ({
        id: s.id,
        horaInicio: s.fechaHoraInicio,
        horaFin: s.fechaHoraFin,
        estado: s.estado,
        tipoSesion: s.tipoSesion,
        modalidad: s.modalidad,
        urlVideollamada: s.trabajador.urlVideollamada,
        cliente: {
          id: s.cliente.id,
          nombre: s.cliente.nombre,
          apellidos: s.cliente.apellidos,
        },
        bonoActivo: s.cliente.bonos[0]
          ? {
              id: s.cliente.bonos[0].id,
              sesionesConsumidas: s.cliente.bonos[0].sesionesConsumidas,
              totalSesiones: s.cliente.bonos[0].totalSesiones,
            }
          : null,
      }));

      // Contadores mini-cards
      const bonosCriticosCount = bonosSinCobrarRaw.length;
      const contadores = {
        sesionesHoy: sesionesHoyRaw.length,
        registrosHoy,
        notificacionesUrgentes: notifUrgenteCount,
        bonosCriticos: bonosCriticosCount,
      };

      // Resumen del mes
      const estadoMap = sesionesEsteMesPorEstado.reduce(
        (acc, item) => {
          acc[item.estado] = item._count.estado;
          return acc;
        },
        {} as Record<string, number>,
      );

      const resumenMes = {
        clientesAsignados,
        sesiones: {
          esteMes: totalSesionesEsteMes,
          porEstado: {
            completadas: estadoMap['COMPLETADA'] || 0,
            programadas: estadoMap['PROGRAMADA'] || 0,
            canceladasConAviso: estadoMap['CANCELADA_CON_AVISO'] || 0,
            canceladasSinAviso: estadoMap['CANCELADA_SIN_AVISO'] || 0,
          },
        },
        registros: { esteMes: registrosEsteMes },
      };

      return {
        saludo: `${saludo}, ${nombreTrabajador}`,
        fecha: hoy.toISOString(),
        contadores,
        sesionesHoy,
        alertasUrgentes: alertasUrgenteRaw,
        accionesPendientes: {
          informesEnBorrador: informesBorradorRaw,
          bonosSinCobrar: bonosSinCobrarRaw,
          objetivosSinEvaluar: objetivosSinEvaluarRaw.map((co) => ({
            clienteObjetivoId: co.id,
            fechaUltimaEvaluacion: co.fechaUltimaEvaluacion,
            objetivo: co.objetivoGeneral.titulo,
            cliente: co.cliente,
          })),
        },
        resumenMes,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener la vista del día: ${err.message}`,
      );
    }
  }

  /**
   * Estadísticas avanzadas para la página de análisis
   */
  async getEstadisticasAvanzadas(desde: Date, hasta: Date, trabajadorId?: string) {
    try {
      const trabajadorFilter = trabajadorId ? { trabajadorId } : {};
      const sesionWhere = {
        ...trabajadorFilter,
        fechaHoraInicio: { gte: desde, lte: hasta },
      };

      const [allSessions, totalRegistros, topClientesRaw] = await Promise.all([
        this.prisma.sesion.findMany({
          where: sesionWhere,
          select: { fechaHoraInicio: true, estado: true, tipoSesion: true, clienteId: true },
        }),
        this.prisma.registroDiario.count({
          where: {
            ...trabajadorFilter,
            fechaRegistro: { gte: desde, lte: hasta },
          },
        }),
        this.prisma.sesion.groupBy({
          by: ['clienteId'],
          where: sesionWhere,
          _count: { clienteId: true },
          orderBy: { _count: { clienteId: 'desc' } },
          take: 10,
        }),
      ]);

      const totalSesiones = allSessions.length;
      const sesionesCompletadas = allSessions.filter(
        (s) => s.estado === EstadoSesion.COMPLETADA,
      ).length;
      const clientesActivos = new Set(allSessions.map((s) => s.clienteId)).size;

      // Agrupar por semana en TypeScript (evita N queries)
      const weekMap = new Map<
        string,
        { semana: string; inicioSemana: Date; total: number; completadas: number; programadas: number; canceladas: number }
      >();

      for (const session of allSessions) {
        const inicioSemana = startOfWeek(session.fechaHoraInicio, { weekStartsOn: 1 });
        const key = inicioSemana.toISOString();
        const label = format(inicioSemana, 'dd MMM', { locale: es });

        if (!weekMap.has(key)) {
          weekMap.set(key, { semana: label, inicioSemana, total: 0, completadas: 0, programadas: 0, canceladas: 0 });
        }

        const entry = weekMap.get(key)!;
        entry.total++;
        if (session.estado === EstadoSesion.COMPLETADA) entry.completadas++;
        else if (session.estado === EstadoSesion.PROGRAMADA) entry.programadas++;
        else entry.canceladas++;
      }

      const weeksSorted = [...weekMap.values()].sort(
        (a, b) => a.inicioSemana.getTime() - b.inicioSemana.getTime(),
      );

      const evolucion = weeksSorted.map((w) => ({ semana: w.semana, total: w.total }));
      const sesionesPorEstado = weeksSorted.map((w) => ({
        semana: w.semana,
        completadas: w.completadas,
        programadas: w.programadas,
        canceladas: w.canceladas,
      }));

      // Distribución por tipo
      const tipoMap = new Map<string, number>();
      for (const s of allSessions) {
        tipoMap.set(s.tipoSesion, (tipoMap.get(s.tipoSesion) ?? 0) + 1);
      }
      const distribucion = [...tipoMap.entries()].map(([tipo, cantidad]) => ({ tipo, cantidad }));

      // Top clientes con nombres
      const topClientes = await Promise.all(
        topClientesRaw.map(async (item) => {
          const cliente = await this.prisma.cliente.findUnique({
            where: { id: item.clienteId },
            select: { id: true, nombre: true, apellidos: true },
          });
          return { cliente, total: item._count.clienteId };
        }),
      );

      return {
        resumen: { totalSesiones, sesionesCompletadas, clientesActivos, totalRegistros },
        evolucion,
        distribucion,
        sesionesPorEstado,
        topClientes: topClientes.filter((t) => t.cliente !== null),
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener estadísticas avanzadas: ${err.message}`,
      );
    }
  }

  /**
   * Resumen completo del dashboard
   */
  async getResumenCompleto(trabajadorId?: string) {
    try {
      const [
        estadisticasGenerales,
        clientesMasActivos,
        objetivosMasTrabajados,
        actividadReciente,
        distribucionSesiones,
      ] = await Promise.all([
        trabajadorId 
          ? this.getEstadisticasTrabajador(trabajadorId)
          : this.getEstadisticasGenerales(),
        this.getClientesMasActivos(5),
        this.getObjetivosMasTrabajados(5),
        this.getActividadReciente(5),
        this.getDistribucionSesionesPorTipo(),
      ]);

      return {
        estadisticas: estadisticasGenerales,
        clientesMasActivos,
        objetivosMasTrabajados,
        actividadReciente,
        distribucionSesiones,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener resumen completo: ${err.message}`,
      );
    }
  }
}