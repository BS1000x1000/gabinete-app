import { Module } from '@nestjs/common';
import { GasController } from './gas.controller';
import { GasService } from './gas.service';
import { AccesoObjetivoGasGuard } from './guards/acceso-objetivo-gas.guard';
@Module({
  controllers: [GasController],
  providers: [GasService, AccesoObjetivoGasGuard],
  exports: [GasService], // Exportado para que InformesService pueda usarlo si lo necesita
})
export class GasModule {}