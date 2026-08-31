import { Module } from '@nestjs/common';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosPdfService } from './contratos-pdf.service';
import { ContratosReplanificacionService } from './contratos-replanificacion.service';
import { ContratosCronService } from './contratos-cron.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';

@Module({
  imports: [PrismaModule, PdfModule],
  controllers: [ContratosController],
  providers: [
    ContratosService,
    ContratosPdfService,
    ContratosReplanificacionService,
    ContratosCronService,
    StorageService,
  ],
  exports: [ContratosService],
})
export class ContratosModule {}
