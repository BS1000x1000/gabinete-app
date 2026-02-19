import { Module } from '@nestjs/common';
import { ObjetivosGeneralesController } from './objetivos-generales.controller';
import { ObjetivosGeneralesService } from './objetivos-generales.service';

@Module({
  controllers: [ObjetivosGeneralesController],
  providers: [ObjetivosGeneralesService],
  exports: [ObjetivosGeneralesService],
})
export class ObjetivosGeneralesModule {}