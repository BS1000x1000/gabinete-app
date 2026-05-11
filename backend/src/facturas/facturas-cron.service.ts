import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { FacturasService } from './facturas.service';

@Injectable()
export class FacturasCronService {
  private readonly logger = new Logger(FacturasCronService.name);

  constructor(private readonly facturasService: FacturasService) {}

  // Día 1 de cada mes a las 02:00 (hora Madrid) — genera facturas del mes
  @Cron('0 2 1 * *', { timeZone: 'Europe/Madrid' })
  async cronGenerarFacturasMes(): Promise<void> {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    this.logger.log(`Cron generación facturas iniciado para ${anio}-${String(mes).padStart(2, '0')}`);
    const creadas = await this.facturasService.generarFacturasMes(anio, mes);
    this.logger.log(`Cron generación facturas completado: ${creadas} facturas creadas`);
  }

  // Día 1 de cada mes a las 09:00 (hora Madrid) — envía emails con PDF adjunto
  // El delay de 7h da margen para detectar fallos del cron de generación antes de enviar
  @Cron('0 9 1 * *', { timeZone: 'Europe/Madrid' })
  async cronEnviarEmailsFacturas(): Promise<void> {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = ahora.getMonth() + 1;
    this.logger.log(`Cron email facturas iniciado para ${anio}-${String(mes).padStart(2, '0')}`);
    const enviados = await this.facturasService.enviarEmailsPendientes(anio, mes);
    this.logger.log(`Cron email facturas completado: ${enviados} emails enviados`);
  }
}
