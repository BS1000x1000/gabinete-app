import { Module } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';
import { BonosModule } from '../bonos/bonos.module';

@Module({
  imports: [BonosModule],
  providers: [SesionesService],
  controllers: [SesionesController]
})
export class SesionesModule {}
