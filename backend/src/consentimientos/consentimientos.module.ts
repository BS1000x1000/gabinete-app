import { Module } from '@nestjs/common';
import { ConsentimientosService } from './consentimientos.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

/**
 * Modulo propio y sin controlador: lo consumen `clientes` (que expone los
 * endpoints bajo `/clientes/:id/consentimiento*`) y `expediente` (que lo llama
 * al recibir el consentimiento de datos firmado).
 *
 * Vive aparte de `clientes` justamente para que los dos puedan usarlo sin que
 * aparezca una dependencia circular entre ellos.
 */
@Module({
  imports: [PrismaModule, AuthModule, NotificacionesModule],
  providers: [ConsentimientosService],
  exports: [ConsentimientosService],
})
export class ConsentimientosModule {}
