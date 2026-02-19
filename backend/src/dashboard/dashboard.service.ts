import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

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