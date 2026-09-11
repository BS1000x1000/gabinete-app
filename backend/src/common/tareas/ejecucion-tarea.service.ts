import { Injectable, Logger } from '@nestjs/common';
import { EjecucionTarea, EstadoEjecucion, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Identificadores de las tareas programadas.
 *
 * Constantes y no cadenas sueltas porque `EjecucionTarea.tarea` es lo que agrupa
 * el historial: dos crons que escriban "facturas-email" y "facturas.email"
 * producirian dos historiales distintos de la misma tarea, y el fallo no se veria
 * hasta que alguien buscase por que falta media serie.
 */
export const TAREAS = {
  FACTURAS_GENERAR: 'facturas.generar',
  FACTURAS_EMAIL: 'facturas.email',
  FACTURAS_RECONCILIAR: 'facturas.reconciliar',
  FACTURAS_GESTORIA: 'facturas.gestoria',
  CONTRATOS_VENTANA: 'contratos.ventana',
  TOKENS_PURGAR: 'tokens.purgar',
  INFORMES_RECONCILIAR: 'informes.reconciliar',
} as const;

export type Tarea = (typeof TAREAS)[keyof typeof TAREAS];

/** Recuento de lo que hizo una pasada. Se guarda tal cual en `EjecucionTarea.resumen`. */
export type ResumenTarea = Record<string, unknown>;

/** Una tarea conocida con su ultima pasada, o `null` si no se ha ejecutado nunca. */
export interface ResumenTareaProgramada {
  tarea: Tarea;
  ultima: EjecucionTarea | null;
}

function mensajeDeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Envuelve una tarea programada para que quede constancia en BD de que corrio.
 *
 * El problema que resuelve: hasta ahora el unico rastro de un cron era el log del
 * contenedor. En Serverless los logs no sobreviven al redespliegue, asi que un
 * cron que dejara de dispararse no lo notaria nadie hasta que faltase una
 * factura. Con esto, "?se genero el mes?" se responde con una consulta.
 *
 * Dos decisiones deliberadas:
 *
 * - **No relanza el error.** Un `throw` dentro de un `@Cron` acaba en un rechazo
 *   no capturado; ademas, que falle la pasada de hoy no debe tumbar el proceso.
 *   El fallo queda en la fila y en el log, que es donde sirve.
 * - **La contabilidad nunca rompe la tarea.** Si no se puede escribir en BD se
 *   registra y se sigue: el trabajo real importa mas que su rastro.
 */
@Injectable()
export class EjecucionTareaService {
  private readonly logger = new Logger(EjecucionTareaService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(
    tarea: Tarea,
    fn: () => Promise<ResumenTarea | void>,
  ): Promise<void> {
    const id = await this.abrir(tarea);
    const t0 = Date.now();

    try {
      const resumen = (await fn()) ?? undefined;
      const ms = Date.now() - t0;
      await this.cerrar(id, EstadoEjecucion.OK, resumen, null);
      this.logger.log(
        `Tarea ${tarea} OK en ${ms} ms` +
          (resumen ? ` - ${JSON.stringify(resumen)}` : ''),
      );
    } catch (err) {
      const ms = Date.now() - t0;
      const mensaje = mensajeDeError(err);
      await this.cerrar(id, EstadoEjecucion.ERROR, undefined, mensaje);
      this.logger.error(`Tarea ${tarea} ABORTADA tras ${ms} ms: ${mensaje}`);
    }
  }

  /** Devuelve el id de la fila abierta, o `null` si no se pudo registrar. */
  private async abrir(tarea: Tarea): Promise<string | null> {
    try {
      const fila = await this.prisma.ejecucionTarea.create({
        data: { tarea, estado: EstadoEjecucion.EN_CURSO },
        select: { id: true },
      });
      return fila.id;
    } catch (err) {
      this.logger.error(
        `No se pudo registrar el inicio de ${tarea}: ${mensajeDeError(err)}`,
      );
      return null;
    }
  }

  private async cerrar(
    id: string | null,
    estado: EstadoEjecucion,
    resumen: ResumenTarea | undefined,
    error: string | null,
  ): Promise<void> {
    if (!id) return;
    try {
      await this.prisma.ejecucionTarea.update({
        where: { id },
        data: {
          estado,
          fin: new Date(),
          // `Record<string, unknown>` es el tipo comodo para quien llama;
          // Prisma exige su propio tipo de JSON de entrada.
          resumen:
            resumen === undefined
              ? undefined
              : (resumen as Prisma.InputJsonObject),
          error,
        },
      });
    } catch (err) {
      this.logger.error(
        `No se pudo cerrar la ejecucion ${id}: ${mensajeDeError(err)}`,
      );
    }
  }

  /**
   * Estado de las tareas conocidas, una fila por tarea.
   *
   * Recorre `TAREAS` y NO las filas de la tabla, a proposito: un cron que no se
   * haya disparado nunca no tiene ninguna fila, y si el listado saliera de la
   * tabla ese caso —el peor de todos— seria justo el invisible. Asi sale con
   * `ultima: null` y se ve.
   */
  async resumenPorTarea(): Promise<ResumenTareaProgramada[]> {
    const tareas = Object.values(TAREAS);
    // Siete consultas por indice en vez de un DISTINCT ON: son siete, esto es una
    // pantalla de administracion, y no obliga a mantener SQL crudo.
    const ultimas = await Promise.all(
      tareas.map((tarea) =>
        this.prisma.ejecucionTarea.findFirst({
          where: { tarea },
          orderBy: { inicio: 'desc' },
        }),
      ),
    );
    return tareas.map((tarea, i) => ({ tarea, ultima: ultimas[i] }));
  }

  /** Historial reciente, de todas las tareas o de una sola. */
  async historial(tarea?: Tarea, limite = 50): Promise<EjecucionTarea[]> {
    return this.prisma.ejecucionTarea.findMany({
      where: tarea ? { tarea } : undefined,
      orderBy: { inicio: 'desc' },
      take: Math.min(Math.max(limite, 1), 200),
    });
  }
}
