import { Module } from '@nestjs/common';
import { ContratosController } from './contratos.controller';
import { ContratosService } from './contratos.service';
import { ContratosPdfService } from './contratos-pdf.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';

@Module({
  imports: [PrismaModule, PdfModule],
  controllers: [ContratosController],
  providers: [ContratosService, ContratosPdfService, StorageService],
  exports: [ContratosService],
})
export class ContratosModule {}
