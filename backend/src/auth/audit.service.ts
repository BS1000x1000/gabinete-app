import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type AuditEvento =
  | 'LOGIN_OK'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ACCESO_FICHA'
  /// Otorgado o revocado: la accion concreta va en `metadata.accion`.
  | 'CONSENTIMIENTO_RGPD'
  /// Anulada o marcada como pagada: la accion concreta va en `metadata.accion`.
  /// Una factura es un documento fiscal: quien la toca queda registrado.
  | 'FACTURA'
  /// Generacion de las facturas de un periodo, manual o por cron. Sin esto una
  /// ejecucion perdida del dia 1 no dejaba ni rastro.
  | 'FACTURA_GENERACION'
  /// Entrega de un paquete de facturas a la gestoria. Salen datos personales
  /// hacia un tercero: queda registrado quien, que y cuando.
  | 'FACTURA_ENTREGA_GESTORIA';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registrar(params: {
    evento: AuditEvento;
    userId?: string;
    username?: string;
    ip?: string;
    recurso?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          evento: params.evento,
          userId: params.userId,
          username: params.username,
          ip: params.ip,
          recurso: params.recurso,
          metadata: params.metadata,
        },
      });
    } catch (err) {
      // El audit log nunca debe bloquear la operación principal
      this.logger.error(`Error al escribir audit log [${params.evento}]: ${err.message}`);
    }
  }
}
