import { Module } from '@nestjs/common';
import { VacacionesService } from './vacaciones.service';
import { VacacionesController } from './vacaciones.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VacacionesController],
  providers: [VacacionesService],
  exports: [VacacionesService],
})
export class VacacionesModule {}
