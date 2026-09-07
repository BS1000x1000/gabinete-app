import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

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

  constructor(private readonly prisma: PrismaService) {}

  /** Cada dia a las 04:00, fuera de la ventana de los crones de facturacion. */
  @Cron('0 4 * * *', { timeZone: 'Europe/Madrid' })
  async purgarTokensCaducados(): Promise<number> {
    try {
      const { count } = await this.prisma.tokenRevocado.deleteMany({
        where: { expiresAt: { lt: new Date() } },
      });
      if (count > 0) {
        this.logger.log(`Purgados ${count} tokens revocados ya caducados`);
      }
      return count;
    } catch (err) {
      // Es mantenimiento: que falle no puede tumbar el proceso.
      this.logger.error(`Error al purgar tokens revocados: ${err?.message}`);
      return 0;
    }
  }
}
