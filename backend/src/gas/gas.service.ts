import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { diaDesdeIso } from '../common/fecha/dia.utils';
import {
  SetDescripcionesNivelesDto,
  UpdateDescripcionNivelDto,
  CreateEvaluacionGASDto,
  QueryEvolucionGasDto,
} from './dto/gas.dto';

@Injectable()
export class GasService {
  private readonly logger = new Logger(GasService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // HELPERS PRIVADOS
  // ============================================================

  private async getClienteObjetivo(clienteObjetivoId: string) {
    const co = await this.prisma.clienteObjetivo.findUnique({
      where: { id: clienteObjetivoId },
    });
    if (!co) {
      throw new NotFoundException(
        `Objetivo del cliente con ID ${clienteObjetivoId} no encontrado`,
      );
    }
    return co;
  }

  // ============================================================
  // DESCRIPCIONES DE NIVELES GAS
  // (Define qué significa cada nivel para este objetivo con este alumno)
  // ============================================================

  /**
   * Guarda los 5 niveles de una vez.
   * Usa upsert para que sea idempotente: si ya existen los sobreescribe,
   * si no existen los crea. Perfecto para el flujo del informe inicial.
   */
  async setDescripcionesNiveles(
    clienteObjetivoId: string,
    dto: SetDescripcionesNivelesDto,
  ) {
    this.logger.log(
      `Guardando ${dto.niveles.length} niveles GAS para clienteObjetivo: ${clienteObjetivoId}`,
    );

    await this.getClienteObjetivo(clienteObjetivoId);

    // Validar que vienen los 5 niveles
    const nivelesRecibidos = dto.niveles.map((n) => n.nivel).sort();
    const nivelesEsperados = [-2, -1, 0, 1, 2];
    const validos = nivelesEsperados.every((n) => nivelesRecibidos.includes(n));
    if (!validos || dto.niveles.length !== 5) {
      throw new BadRequestException(
        'Debes enviar exactamente los 5 niveles: -2, -1, 0, 1, 2',
      );
    }

    try {
      // Upsert de cada nivel en una transacción
      const resultados = await this.prisma.$transaction(
        dto.niveles.map((n) =>
          this.prisma.descripcionNivelGAS.upsert({
            where: {
              clienteObjetivoId_nivel: {
                clienteObjetivoId,
                nivel: n.nivel,
              },
            },
            create: {
              clienteObjetivoId,
              nivel: n.nivel,
              descripcion: n.descripcion,
            },
            update: {
              descripcion: n.descripcion,
            },
          }),
        ),
      );

      return {
        message: 'Niveles GAS guardados correctamente',
        clienteObjetivoId,
        niveles: resultados,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al guardar niveles GAS: ${err.message}`,
      );
    }
  }

  /**
   * Actualiza la descripción de un nivel concreto.
   * Útil si el profesional quiere retocar un nivel sin reescribir los 5.
   */
  async updateDescripcionNivel(
    clienteObjetivoId: string,
    nivel: number,
    dto: UpdateDescripcionNivelDto,
  ) {
    this.logger.log(
      `Actualizando nivel ${nivel} para clienteObjetivo: ${clienteObjetivoId}`,
    );

    const descripcion = await this.prisma.descripcionNivelGAS.findUnique({
      where: { clienteObjetivoId_nivel: { clienteObjetivoId, nivel } },
    });

    if (!descripcion) {
      throw new NotFoundException(
        `No existe descripción para el nivel ${nivel} en este objetivo`,
      );
    }

    return this.prisma.descripcionNivelGAS.update({
      where: { clienteObjetivoId_nivel: { clienteObjetivoId, nivel } },
      data: { descripcion: dto.descripcion },
    });
  }

  /**
   * Obtiene todos los niveles definidos para un ClienteObjetivo.
   * Devuelve los 5 niveles ordenados de -2 a +2.
   */
  async getDescripcionesNiveles(clienteObjetivoId: string) {
    await this.getClienteObjetivo(clienteObjetivoId);

    return this.prisma.descripcionNivelGAS.findMany({
      where: { clienteObjetivoId },
      orderBy: { nivel: 'asc' },
    });
  }

  // ============================================================
  // EVALUACIONES GAS
  // (Historial de revisiones — cada vez que se evalúa al alumno)
  // ============================================================

  /**
   * Registra una nueva evaluación GAS.
   * Actualiza automáticamente nivelGASActual y fechaUltimaEvaluacion
   * en ClienteObjetivo para que la UI no necesite hacer JOINs extra.
   */
  async createEvaluacion(
    clienteObjetivoId: string,
    dto: CreateEvaluacionGASDto,
  ) {
    this.logger.log(
      `Registrando evaluación GAS nivel ${dto.nivel} para clienteObjetivo: ${clienteObjetivoId}`,
    );

    await this.getClienteObjetivo(clienteObjetivoId);

    const fechaEvaluacion = dto.fecha ? new Date(dto.fecha) : new Date();

    try {
      // Transacción: crear evaluación + actualizar nivel actual en ClienteObjetivo
      const [evaluacion] = await this.prisma.$transaction([
        this.prisma.evaluacionGAS.create({
          data: {
            clienteObjetivoId,
            nivel: dto.nivel,
            notas: dto.notas,
            fecha: fechaEvaluacion,
          },
        }),
        // Actualizar el campo desnormalizado para acceso rápido en UI
        this.prisma.clienteObjetivo.update({
          where: { id: clienteObjetivoId },
          data: {
            nivelGASActual: dto.nivel,
            fechaUltimaEvaluacion: fechaEvaluacion,
          },
        }),
      ]);

      return evaluacion;
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al registrar la evaluación: ${err.message}`,
      );
    }
  }

  /**
   * Historial completo de evaluaciones de un ClienteObjetivo.
   * Ordenado del más reciente al más antiguo.
   * Esto alimenta la línea de tiempo del informe de seguimiento.
   */
  async getHistorialEvaluaciones(clienteObjetivoId: string) {
    this.logger.log(
      `Obteniendo historial de evaluaciones para: ${clienteObjetivoId}`,
    );

    await this.getClienteObjetivo(clienteObjetivoId);

    return this.prisma.evaluacionGAS.findMany({
      where: { clienteObjetivoId },
      orderBy: { fecha: 'desc' },
    });
  }

  /**
   * Eliminar una evaluación concreta.
   * Solo permitido si no es la única que existe (para no dejar el historial vacío).
   */
  async deleteEvaluacion(evaluacionId: string) {
    this.logger.warn(`Eliminando evaluación GAS: ${evaluacionId}`);

    const evaluacion = await this.prisma.evaluacionGAS.findUnique({
      where: { id: evaluacionId },
    });

    if (!evaluacion) {
      throw new NotFoundException(
        `Evaluación con ID ${evaluacionId} no encontrada`,
      );
    }

    // Contar cuántas evaluaciones quedan para este objetivo
    const total = await this.prisma.evaluacionGAS.count({
      where: { clienteObjetivoId: evaluacion.clienteObjetivoId },
    });

    await this.prisma.evaluacionGAS.delete({ where: { id: evaluacionId } });

    // Si era la última evaluación, limpiar el nivel actual del ClienteObjetivo
    if (total === 1) {
      await this.prisma.clienteObjetivo.update({
        where: { id: evaluacion.clienteObjetivoId },
        data: { nivelGASActual: null, fechaUltimaEvaluacion: null },
      });
    } else {
      // Si quedan más, actualizar con la evaluación más reciente restante
      const ultimaRestante = await this.prisma.evaluacionGAS.findFirst({
        where: { clienteObjetivoId: evaluacion.clienteObjetivoId },
        orderBy: { fecha: 'desc' },
      });
      if (ultimaRestante) {
        await this.prisma.clienteObjetivo.update({
          where: { id: evaluacion.clienteObjetivoId },
          data: {
            nivelGASActual: ultimaRestante.nivel,
            fechaUltimaEvaluacion: ultimaRestante.fecha,
          },
        });
      }
    }

    return { message: 'Evaluación eliminada correctamente', id: evaluacionId };
  }

  // ============================================================
  // VISTA COMPLETA DE UN OBJETIVO (niveles + historial)
  // Este es el endpoint que usa la UI de la ficha del cliente
  // ============================================================

  async getResumenObjetivo(clienteObjetivoId: string) {
    this.logger.log(`Obteniendo resumen GAS completo de: ${clienteObjetivoId}`);

    const clienteObjetivo = await this.prisma.clienteObjetivo.findUnique({
      where: { id: clienteObjetivoId },
      include: {
        objetivoGeneral: {
          include: { areaDesarrollo: true },
        },
        descripcionesNiveles: {
          orderBy: { nivel: 'asc' },
        },
        evaluaciones: {
          orderBy: { fecha: 'desc' },
        },
      },
    });

    if (!clienteObjetivo) {
      throw new NotFoundException(
        `Objetivo del cliente con ID ${clienteObjetivoId} no encontrado`,
      );
    }

    return {
      id: clienteObjetivo.id,
      objetivo: clienteObjetivo.objetivoGeneral.titulo,
      area: clienteObjetivo.objetivoGeneral.areaDesarrollo.nombre,
      areaColor: clienteObjetivo.objetivoGeneral.areaDesarrollo.color,
      nivelActual: clienteObjetivo.nivelGASActual,
      fechaUltimaEvaluacion: clienteObjetivo.fechaUltimaEvaluacion,
      notas: clienteObjetivo.notas,
      progreso: clienteObjetivo.progreso,
      nivelesDefinidos: clienteObjetivo.descripcionesNiveles.length === 5,
      niveles: clienteObjetivo.descripcionesNiveles,
      historial: clienteObjetivo.evaluaciones,
    };
  }

  // ============================================================
  // EVOLUCIÓN DE UN CLIENTE EN UN PERIODO
  // (base de los resúmenes automáticos por periodo)
  // ============================================================

  /**
   * Rango sobre `EvaluacionGAS.fecha`, inclusivo por los dos extremos.
   *
   * Ojo: `fecha` **no** sigue la convencion de dia a las 12:00 UTC del proyecto
   * (`createEvaluacion` guarda `new Date(dto.fecha)`, o la hora exacta si no se
   * manda fecha), asi que aqui no vale comparar mediodias: hay que abrir el dia
   * entero. Se hace en UTC —00:00:00.000 a 23:59:59.999— y no en hora local para
   * que el resultado no dependa de si el contenedor corre en UTC o en
   * Europe/Madrid.
   *
   * El parseo se apoya en `diaDesdeIso`, que recorta a `YYYY-MM-DD` **sin pasar
   * por `new Date(iso)`** (ese lee la medianoche UTC y reintroduce el desfase de
   * un dia) y ya valida el formato; sobre su mediodia se abre el dia completo.
   */
  private buildRangoFechas(desde?: string, hasta?: string) {
    const rango: { gte?: Date; lte?: Date } = {};
    if (desde) {
      const d = diaDesdeIso(desde);
      d.setUTCHours(0, 0, 0, 0);
      rango.gte = d;
    }
    if (hasta) {
      const h = diaDesdeIso(hasta);
      h.setUTCHours(23, 59, 59, 999);
      rango.lte = h;
    }
    if (rango.gte && rango.lte && rango.gte > rango.lte) {
      throw new BadRequestException(
        'El rango de fechas es invalido: "desde" es posterior a "hasta"',
      );
    }
    return Object.keys(rango).length ? rango : null;
  }

  /**
   * Evaluaciones GAS de TODOS los objetivos de un cliente en un periodo.
   *
   * Antes esto exigia N peticiones a `getHistorialEvaluaciones` (una por
   * objetivo) y filtrar el periodo en el navegador, que es justo lo que impedia
   * preguntar "como evoluciono este nino en octubre".
   *
   * Devuelve el objetivo, su area y los descriptores de nivel junto a las
   * evaluaciones porque un nivel GAS suelto no significa nada: "+1" solo se lee
   * contra el texto que define el +1 de ESE objetivo para ESE nino.
   *
   * **El control de acceso no vive aqui**: lo hace `AccesoObjetivoGasGuard`
   * antes de entrar, delegando en `AccesoClienteService.assertAcceso`, que es la
   * unica comprobacion de acceso a un menor del proyecto.
   */
  async getEvolucionCliente(
    clienteId: string,
    query: QueryEvolucionGasDto = {},
  ) {
    const rango = this.buildRangoFechas(query.desde, query.hasta);

    this.logger.log(
      `Evolución GAS de cliente ${clienteId} [${query.desde ?? '—'} … ${query.hasta ?? '—'}]`,
    );

    const objetivos = await this.prisma.clienteObjetivo.findMany({
      where: {
        clienteId,
        ...(query.incluirInactivos ? {} : { activo: true }),
      },
      include: {
        objetivoGeneral: { include: { areaDesarrollo: true } },
        descripcionesNiveles: { orderBy: { nivel: 'asc' } },
        evaluaciones: {
          // El filtro va en el include y no en un `findMany` aparte para que
          // un objetivo sin evaluaciones en el periodo siga saliendo: "no se
          // evaluo" es informacion, no una fila que sobra.
          ...(rango && { where: { fecha: rango } }),
          orderBy: { fecha: 'asc' },
        },
      },
      orderBy: { fechaAsignacion: 'asc' },
    });

    const objetivosSalida = objetivos.map((co) => {
      const evaluaciones = co.evaluaciones;
      const primera = evaluaciones[0] ?? null;
      const ultima = evaluaciones[evaluaciones.length - 1] ?? null;

      return {
        clienteObjetivoId: co.id,
        objetivoGeneralId: co.objetivoGeneralId,
        objetivo: co.objetivoGeneral.titulo,
        descripcionObjetivo: co.objetivoGeneral.descripcion,
        area: co.objetivoGeneral.areaDesarrollo.nombre,
        areaColor: co.objetivoGeneral.areaDesarrollo.color,
        activo: co.activo,
        fechaAsignacion: co.fechaAsignacion,
        // Estado a dia de hoy, fuera del periodo: es el campo desnormalizado.
        nivelActual: co.nivelGASActual,
        fechaUltimaEvaluacion: co.fechaUltimaEvaluacion,
        nivelesDefinidos: co.descripcionesNiveles.length === 5,
        niveles: co.descripcionesNiveles,
        // Movimiento DENTRO del periodo pedido: primera y ultima evaluacion del
        // rango, y la diferencia entre ambas. Es lo que resume "como fue el mes".
        nivelInicioPeriodo: primera?.nivel ?? null,
        nivelFinPeriodo: ultima?.nivel ?? null,
        variacion: primera && ultima ? ultima.nivel - primera.nivel : null,
        totalEvaluaciones: evaluaciones.length,
        evaluaciones,
      };
    });

    return {
      clienteId,
      desde: query.desde ?? null,
      hasta: query.hasta ?? null,
      totalObjetivos: objetivosSalida.length,
      totalEvaluaciones: objetivosSalida.reduce(
        (acc, o) => acc + o.totalEvaluaciones,
        0,
      ),
      objetivos: objetivosSalida,
    };
  }
}