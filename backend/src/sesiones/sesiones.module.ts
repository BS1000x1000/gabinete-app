import { Module } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { BonosModule } from '../bonos/bonos.module';
import { HorariosLaboralesModule } from '../horarios-laborales/horarios-laborales.module';

@Module({
  imports: [BonosModule, HorariosLaboralesModule],
  providers: [SesionesService],
  controllers: [SesionesController]
})
export class SesionesModule {}
