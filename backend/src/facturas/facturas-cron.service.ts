import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FacturasService } from './facturas.service';
import { AuditService } from '../auth/audit.service';
import { FacturasGestoriaService } from './facturas-gestoria.service';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/**
 * Que periodo toca facturar el dia 1 del mes en que se ejecuta el cron, o `null`
 * si ese dia no se emite nada.
 *
 * Casi siempre es el mes en curso, por adelantado, como manda la clausula 3
 * ("factura emitida por la profesional al inicio de cada mes"). Las dos
 * excepciones salen de esa misma clausula:
 *
 * - **El 1 de julio no se emite julio.** Julio va prorrateado por sesiones
 *   impartidas, y el dia 1 no se ha dado ninguna: saldrian facturas de 0,00 EUR
 *   con su numero de serie ya quemado.
 * - **El 1 de agosto se emite JULIO**, ya cerrado y con sus sesiones contadas.
 *   Agosto no se factura nunca.
 *
 * Exportada para poder probarla sin esperar a que sea agosto.
 */
export function periodoQueTocaFacturar(hoy: Date): {
  anio: number;
  mes: number;
} | null {
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  if (mes === 7) return null;
  if (mes === 8) return { anio, mes: 7 };
  return { anio, mes };
}

/** Por que julio no se emite hoy. Se guarda en el resumen de la ejecucion. */
const MOTIVO_JULIO =
  'julio no se emite el dia 1: se factura el 1 de agosto, ya cerrado y prorrateado';

@Injectable()
export class FacturasCronService {
  private readonly logger = new Logger(FacturasCronService.name);

  constructor(
    private readonly facturasService: FacturasService,
    private readonly audit: AuditService,
    private readonly gestoria: FacturasGestoriaService,
    private readonly tareas: EjecucionTareaService,
  ) {}

  // Día 1 de cada mes a las 02:00 (hora Madrid) — genera facturas del mes
  @Cron('0 2 1 * *', { timeZone: 'Europe/Madrid' })
  async cronGenerarFacturasMes(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.FACTURAS_GENERAR, async () => {
      const objetivo = periodoQueTocaFacturar(new Date());
      // Que hoy no toque emitir tambien se registra: sin fila, "no se genero
      // julio" y "el cron no se disparo en julio" se ven exactamente igual.
      if (!objetivo) return { omitida: true, motivo: MOTIVO_JULIO };

      const { anio, mes } = objetivo;
      const periodo = formatPeriodo(anio, mes);
      this.logger.log(`Cron generación facturas iniciado para ${periodo}`);

      try {
        const resultado = await this.facturasService.generarFacturasMes(
          anio,
          mes,
        );
        return {
          periodo,
          creadas: resultado.creadas,
          omitidas: resultado.omitidas,
          fallidas: resultado.fallidas.length,
        };
      } catch (err) {
        // El fallo total queda en `EjecucionTarea`, pero el rastro de
        // AuditLog se mantiene aparte: `FACTURA_GENERACION` es traza RGPD de
        // quien emitio que, no telemetria de si el cron corrio.
        await this.audit.registrar({
          evento: 'FACTURA_GENERACION',
          recurso: periodo,
          metadata: {
            origen: 'cron',
            error: err instanceof Error ? err.message : String(err),
          },
        });
        throw err;
      }
    });
  }

  /**
   * Envío de las facturas del periodo por email. **Diario**, no solo el día 1.
   *
   * Antes era `0 9 1 * *` y eso abría una carrera con el archivado del PDF: el
   * envío filtra por `urlPdfR2 != null`, así que una factura cuyo PDF falló a
   * las 02:00 no se enviaba a las 09:00, y aunque la reconciliación de las
   * 03:00 le pusiera el PDF al día siguiente, el cron de envío ya no volvía
   * hasta el mes siguiente: esa factura no salía nunca salvo reenvío manual.
   *
   * Ejecutarlo a diario es seguro: `enviarEmailsPendientes` filtra por
   * `emailEnviado: false` y por el periodo que devuelve `periodoQueTocaFacturar`,
   * así que ni reenvía lo ya enviado ni toca facturas de meses cerrados.
   *
   * Las 09:00 y no las 02:30 se conservan a propósito: dan margen a mirar la
   * generación de la madrugada antes de que salga nada hacia las familias.
   */
  @Cron('0 9 * * *', { timeZone: 'Europe/Madrid' })
  async cronEnviarEmailsFacturas(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.FACTURAS_EMAIL, async () => {
      // El mismo periodo que generó el cron del día 1, o no habría nada que
      // enviar: en agosto se mandan las facturas de julio, no las de agosto.
      const objetivo = periodoQueTocaFacturar(new Date());
      if (!objetivo) return { omitida: true, motivo: MOTIVO_JULIO };

      const { anio, mes } = objetivo;
      const periodo = formatPeriodo(anio, mes);

      // Recuperar aquí los PDF que falten evita depender de que ya hayan pasado
      // las 03:00: sin esto, una factura generada esta madrugada sin PDF se
      // quedaría fuera del envío de hoy por unas horas de diferencia.
      const recuperadas =
        await this.facturasService.reconciliarPdfsPendientes();

      const enviados = await this.facturasService.enviarEmailsPendientes(
        anio,
        mes,
      );
      return { periodo, recuperadas, enviados };
    });
  }

  /**
   * Reintenta el archivado de los PDF que se quedaron por el camino.
   *
   * Existe porque `archivarPdfEnR2` es fire-and-forget: si Puppeteer falla, la
   * factura se queda con `urlPdfR2 = null` y, como el envío por email filtra por
   * ese campo, no se manda nunca. Sin este cron el hueco no se cerraba solo.
   * Además es lo que permite que un pack de facturas se arme leyendo de Object
   * Storage en vez de relanzar decenas de Chromium.
   */
  @Cron('0 3 * * *', { timeZone: 'Europe/Madrid' })
  async cronReconciliarPdfs(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.FACTURAS_RECONCILIAR, async () => {
      const recuperadas =
        await this.facturasService.reconciliarPdfsPendientes();
      return { recuperadas };
    });
  }

  /**
   * Dia 5 a las 07:00 — entrega a la gestoria de quien la tenga programada.
   *
   * El dia 5 y no el 1 a proposito: da margen a que la generacion del dia 1 haya
   * terminado, a que el cron de reconciliacion de PDF (03:00) haya archivado lo
   * que faltara, y a que una persona revise antes de que salga nada.
   *
   * Solo actua sobre periodos cerrados y solo con facturas que no hayan salido
   * ya, asi que ejecutarlo de mas no manda nada dos veces.
   */
  @Cron('0 7 5 * *', { timeZone: 'Europe/Madrid' })
  async cronEntregaGestoria(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.FACTURAS_GESTORIA, async () => {
      const entregados = await this.gestoria.entregarPeriodicas();
      return { entregados };
    });
  }
}

function formatPeriodo(anio: number, mes: number): string {
  return `${anio}-${String(mes).padStart(2, '0')}`;
}
