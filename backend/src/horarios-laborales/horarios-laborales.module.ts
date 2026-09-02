import { Module } from '@nestjs/common';
import { HorariosLaboralesController } from './horarios-laborales.controller';
import { HorariosLaboralesService } from './horarios-laborales.service';
import { FestivosModule } from '../festivos/festivos.module';

@Module({
  imports: [FestivosModule],
  controllers: [HorariosLaboralesController],
  providers: [HorariosLaboralesService],
  exports: [HorariosLaboralesService],
})
export class HorariosLaboralesModule {}
