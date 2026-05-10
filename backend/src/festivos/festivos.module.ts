import { Module } from '@nestjs/common';
import { FestivosService } from './festivos.service';
import { FestivosController } from './festivos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FestivosController],
  providers: [FestivosService],
  exports: [FestivosService],
})
export class FestivosModule {}
