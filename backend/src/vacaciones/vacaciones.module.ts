import { Module } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { VacacionesController } from './vacaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { FestivosModule } from '../festivos/festivos.module';

@Module({
  imports: [PrismaModule, FestivosModule],
  controllers: [VacacionesController],
  providers: [VacacionesService],
  exports: [VacacionesService],
})
export class VacacionesModule {}
