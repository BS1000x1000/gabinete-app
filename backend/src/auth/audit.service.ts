import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export type AuditEvento =
  | 'LOGIN_OK'
  | 'LOGIN_FAIL'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'ACCESO_FICHA'
  /// Otorgado o revocado: la accion concreta va en `metadata.accion`.
  | 'CONSENTIMIENTO_RGPD';

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
