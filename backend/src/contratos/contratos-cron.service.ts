import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { EstadoContrato } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ContratosService } from './contratos.service';
import { LOCK_VENTANA_MOVIL } from './contratos.constants';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/** Lo que devuelve una pasada de la ventana móvil. */
export interface ResultadoVentana {
  procesados: number;
  creadas: number;
  fallidos: string[];
  /** `true` cuando otra instancia tenía el advisory lock y esta no hizo nada. */
  omitida?: boolean;
}

/** Por qué una pasada no hizo nada. Se guarda en el resumen de la ejecución. */
const MOTIVO_LOCK = 'otra instancia tenía el advisory lock';

/**
 * Empuja la ventana móvil de generación de sesiones.
 *
 * Las sesiones de un contrato no se crean todas de golpe: se genera una ventana
 * de unos meses y este cron la va extendiendo. Así un cambio de horario afecta a
 * una decena de sesiones en vez de a medio centenar.
 */
@Injectable()
export class ContratosCronService implements OnModuleInit {
  private readonly logger = new Logger(ContratosCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly contratosService: ContratosService,
    private readonly tareas: EjecucionTareaService,
  ) {}

  /**
   * Al arrancar, recupera lo que se hubiera perdido si el contenedor estuvo
   * caído el día 1. La generación es idempotente (índice único + skipDuplicates),
   * así que ejecutarla de más no cuesta nada; ejecutarla de menos deja a las
   * familias sin agenda. Los 30 s dan margen a que terminen las migraciones.
   */
  onModuleInit(): void {
    if (process.env.NODE_ENV === 'test') return;

    setTimeout(() => {
      this.extenderVentana('arranque').catch((err) =>
        this.logger.error('Fallo la extension de ventana al arrancar', err),
      );
    }, 30_000).unref();
  }

  /**
   * Día 1 a las 03:00. Una hora después del cron de facturas para no competir
   * por el pool de Prisma, y bastante antes del envío de emails de las 09:00.
   */
  @Cron('0 3 1 * *', { timeZone: 'Europe/Madrid' })
  async cronExtenderVentana(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.CONTRATOS_VENTANA, async () => {
      const r = await this.extenderVentana('cron mensual');
      // `fallidos` se cuenta, no se copia: son ids de contrato y el resumen es
      // un recuento, no un volcado. El detalle ya está en el log.
      return {
        procesados: r.procesados,
        creadas: r.creadas,
        fallidos: r.fallidos.length,
        ...(r.omitida ? { omitida: true, motivo: MOTIVO_LOCK } : {}),
      };
    });
  }

  /**
   * Extiende la ventana de todos los contratos activos.
   *
   * Un contrato con datos raros no puede impedir que los demás generen, así que
   * cada uno va en su propio try/catch.
   */
  async extenderVentana(origen: string): Promise<ResultadoVentana> {
    const lock = await this.tomarLock();
    if (!lock) {
      this.logger.log(`Extension de ventana (${origen}) omitida: otra instancia la esta ejecutando`);
      return { procesados: 0, creadas: 0, fallidos: [], omitida: true };
    }

    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const contratos = await this.prisma.contratoServicio.findMany({
        where: {
          estado: EstadoContrato.ACTIVO,
          OR: [{ fechaFin: null }, { fechaFin: { gte: hoy } }],
        },
        select: { id: true },
      });

      let creadas = 0;
      const fallidos: string[] = [];

      for (const contrato of contratos) {
        try {
          creadas += await this.contratosService.generarSesionesContrato(contrato.id);
        } catch (err) {
          fallidos.push(contrato.id);
          this.logger.error(`Contrato ${contrato.id}: fallo al extender la ventana`, err);
        }
      }

      this.logger.log(
        `Extension de ventana (${origen}): ${contratos.length} contratos, ` +
          `${creadas} sesiones creadas, ${fallidos.length} fallidos`,
      );
      return { procesados: contratos.length, creadas, fallidos };
    } finally {
      await this.soltarLock();
    }
  }

  // ── Advisory lock: serializa réplicas sin tabla de bloqueos ──

  private async tomarLock(): Promise<boolean> {
    const [{ locked }] = await this.prisma.$queryRaw<{ locked: boolean }[]>`
      SELECT pg_try_advisory_lock(hashtext(${LOCK_VENTANA_MOVIL})) AS locked
    `;
    return locked;
  }

  private async soltarLock(): Promise<void> {
    await this.prisma.$queryRaw`
      SELECT pg_advisory_unlock(hashtext(${LOCK_VENTANA_MOVIL}))
    `;
  }
}
