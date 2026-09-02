import { Module } from '@nestjs/common';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosPdfService } from './contratos-pdf.service';
import { ContratosReplanificacionService } from './contratos-replanificacion.service';
import { ContratosCronService } from './contratos-cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';
import { CalendarioContratoService } from '../expediente/calendario-contrato.service';
import { ExpedienteModule } from '../expediente/expediente.module';
import { FestivosModule } from '../festivos/festivos.module';

@Module({
  imports: [PrismaModule, PdfModule, ExpedienteModule, FestivosModule],
  controllers: [ContratosController],
  providers: [
    ContratosService,
    ContratosPdfService,
    CalendarioContratoService,
    ContratosReplanificacionService,
    ContratosCronService,
    StorageService,
  ],
  exports: [ContratosService, ContratosPdfService, CalendarioContratoService],
})
export class ContratosModule {}
