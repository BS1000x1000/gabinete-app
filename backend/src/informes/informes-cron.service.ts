import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InformesService } from './informes.service';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/**
 * Cierra el hueco del archivado fire-and-forget de los informes.
 *
 * Al finalizar un informe, el PDF se sube a Object Storage sin esperar
 * (`archivarPdfEnStorage` va con `.catch(log)`), para no hacer esperar a quien
 * pulsa "Finalizar" mientras arranca Chromium. El precio es que un fallo dejaba
 * el informe `FINALIZADO` con `urlDocumentoFinal = null` **para siempre**: nadie
 * lo reintentaba y el agujero solo se descubría al pedir el PDF y comerse un
 * 404, sobre documentación clínica que se da por archivada.
 */
@Injectable()
export class InformesCronService {
  constructor(
    private readonly informes: InformesService,
    private readonly tareas: EjecucionTareaService,
  ) {}

  /**
   * Cada día a las 05:00 (hora Madrid).
   *
   * Lejos de las 03:00 de la reconciliación de facturas y de las 04:00 de la
   * purga de tokens: los tres levantan Chromium o barren tablas, y solaparlos
   * solo sirve para pelearse por el pool de Prisma. También antes de las 07:00
   * del día 5, cuando la entrega a la gestoría espera encontrarlo todo archivado.
   */
  @Cron('0 5 * * *', { timeZone: 'Europe/Madrid' })
  async cronReconciliarArchivados(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.INFORMES_RECONCILIAR, async () => {
      const recuperados = await this.informes.reconciliarArchivadosPendientes();
      return { recuperados };
    });
  }
}
