import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { MotorReglasService } from './motor-reglas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, MotorReglasService],
  exports: [NotificacionesService, MotorReglasService],
})
export class NotificacionesModule {}
