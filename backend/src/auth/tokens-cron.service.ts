import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/**
 * Purga de la lista negra de tokens.
 *
 * `TokenRevocado` guarda el `jti` de cada sesion cerrada para que un JWT robado
 * deje de valer antes de caducar. Pasada su `expiresAt` la fila ya no protege de
 * nada —el propio token esta caducado y `JwtStrategy` lo rechaza igual—, pero la
 * tabla no se limpiaba nunca: crecia de forma monotona y se consultaba en CADA
 * peticion autenticada. El indice por `expiresAt` (`schema.prisma`) estaba puesto
 * justo para esto y no lo usaba nadie.
 *
 * No confundir con la retencion de `AuditLog`, que sigue pendiente a proposito:
 * ahi el plazo es una decision juridica (contiene IP y usuario), no de limpieza.
 */
@Injectable()
export class TokensCronService {
  private readonly logger = new Logger(TokensCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tareas: EjecucionTareaService,
  ) {}

  /** Cada dia a las 04:00, fuera de la ventana de los crones de facturacion. */
  @Cron('0 4 * * *', { timeZone: 'Europe/Madrid' })
  async cronPurgarTokens(): Promise<void> {
    await this.tareas.ejecutar(TAREAS.TOKENS_PURGAR, async () => {
      const purgados = await this.purgarTokensCaducados();
      return { purgados };
    });
  }

  /**
   * El trabajo, separado del cron: asi se puede llamar a mano y probarlo sin
   * pasar por la contabilidad de ejecuciones.
   *
   * Ya no se traga sus errores. Antes devolvia 0 tanto si no habia nada que
   * purgar como si la BD estaba caida, dos cosas muy distintas que quedaban
   * iguales; ahora el fallo sube a `EjecucionTareaService`, que lo guarda como
   * `ERROR` y sigue sin tumbar el proceso.
   */
  async purgarTokensCaducados(): Promise<number> {
    const { count } = await this.prisma.tokenRevocado.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    if (count > 0) {
      this.logger.log(`Purgados ${count} tokens revocados ya caducados`);
    }
    return count;
  }
}
