import { Module } from '@nestjs/common';
import { SesionesService } from './sesiones.service';
import { SesionesController } from './sesiones.controller';

@Module({
  providers: [SesionesService],
  controllers: [SesionesController]
})
export class SesionesModule {}
