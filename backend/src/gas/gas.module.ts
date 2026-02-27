import { Module } from '@nestjs/common';
import { GasController } from './gas.controller';
import { GasService } from './gas.service';
@Module({
  controllers: [GasController],
  providers: [GasService],
  exports: [GasService], // Exportado para que InformesService pueda usarlo si lo necesita
})
export class GasModule {}