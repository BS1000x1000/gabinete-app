import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FacturasService } from './facturas.service';
import { AuditService } from '../auth/audit.service';
import { FacturasGestoriaService } from './facturas-gestoria.service';

@Injectable()
export class FacturasCronService {
  private readonly logger = new Logger(FacturasCronService.name);

  constructor(
    private readonly facturasService: FacturasService,
    private readonly audit: AuditService,
    private readonly gestoria: FacturasGestoriaService,
  ) {}

  // Día 1 de cada mes a las 02:00 (hora Madrid) — genera facturas del mes
  @Cron('0 2 1 * *', { timeZone: 'Europe/Madrid' })
  async cronGenerarFacturasMes(): Promise<void> {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
    this.logger.log(`Cron generación facturas iniciado para ${periodo}`);

    // `generarFacturasMes` ya escribe su propio `FACTURA_GENERACION`; aquí solo
    // se captura el fallo total, que antes no dejaba ni rastro: si el contenedor
    // estaba reiniciándose a las 02:00 del día 1, el mes no se generaba y nadie
    // se enteraba hasta que faltaban las facturas.
    try {
      const resultado = await this.facturasService.generarFacturasMes(anio, mes);
      this.logger.log(
        `Cron generación facturas completado: ${resultado.creadas} creadas, ` +
          `${resultado.fallidas.length} fallidas`,
      );
    } catch (err: any) {
      this.logger.error(`Cron generación facturas ABORTADO para ${periodo}: ${err}`);
      await this.audit.registrar({
        evento: 'FACTURA_GENERACION',
        recurso: periodo,
        metadata: { origen: 'cron', error: err?.message ?? String(err) },
      });
    }
  }

  // Día 1 de cada mes a las 09:00 (hora Madrid) — envía emails con PDF adjunto
  // El delay de 7h da margen para detectar fallos del cron de generación antes de enviar
  @Cron('0 9 1 * *', { timeZone: 'Europe/Madrid' })
  async cronEnviarEmailsFacturas(): Promise<void> {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
    this.logger.log(`Cron email facturas iniciado para ${periodo}`);
    try {
      const enviados = await this.facturasService.enviarEmailsPendientes(anio, mes);
      this.logger.log(`Cron email facturas completado: ${enviados} emails enviados`);
    } catch (err: any) {
      this.logger.error(`Cron email facturas ABORTADO para ${periodo}: ${err}`);
    }
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
    try {
      const recuperadas = await this.facturasService.reconciliarPdfsPendientes();
      if (recuperadas > 0) {
        this.logger.log(`Cron reconciliación PDFs: ${recuperadas} recuperadas`);
      }
    } catch (err) {
      this.logger.error(`Cron reconciliación PDFs falló: ${err}`);
    }
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
    try {
      const entregados = await this.gestoria.entregarPeriodicas();
      if (entregados > 0) {
        this.logger.log(`Cron gestoria: ${entregados} entregas enviadas`);
      }
    } catch (err) {
      this.logger.error(`Cron gestoria falló: ${err}`);
    }
  }
}
