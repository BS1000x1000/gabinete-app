import { Module } from '@nestjs/common';
import { HorariosLaboralesController } from './horarios-laborales.controller';
import { HorariosLaboralesService } from './horarios-laborales.service';

@Module({
  controllers: [HorariosLaboralesController],
  providers: [HorariosLaboralesService],
  exports: [HorariosLaboralesService],
})
export class HorariosLaboralesModule {}
