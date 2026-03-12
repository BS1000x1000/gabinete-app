import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesSseService } from './notificaciones-sse.service';
import { MotorReglasService } from './motor-reglas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NotificacionesController],
  providers: [NotificacionesService, NotificacionesSseService, MotorReglasService],
  exports: [NotificacionesService, MotorReglasService],
})
export class NotificacionesModule {}
