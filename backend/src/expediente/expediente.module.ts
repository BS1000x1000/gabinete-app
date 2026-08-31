import { Module } from '@nestjs/common';
import { ExpedienteController } from './expediente.controller';
import { ExpedienteService } from './expediente.service';
import { CalendarioContratoService } from './calendario-contrato.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../common/pdf/pdf.module';
import { DocumentosModule } from '../documentos/documentos.module';
import { ContratosPdfService } from '../contratos/contratos-pdf.service';

/**
 * Expediente inicial del cliente: contrato y los dos consentimientos.
 *
 * Reutiliza a proposito lo que ya habia: `PdfModule` para el render,
 * `DocumentosModule` para guardar el fichero (con su subida a Object Storage y
 * su limpieza de huerfanos) y `ContratosModule` para saber que datos van en
 * cada hueco. Aqui solo vive el ciclo de vida generado -> enviado -> firmado.
 *
 * `ContratosPdfService` se declara como provider en vez de importar
 * `ContratosModule` para que la dependencia vaya en un solo sentido: contratos
 * dispara la generacion, no al reves. Es el mismo criterio que sigue
 * `StorageService`, que tambien se declara en cada modulo que lo usa.
 */
@Module({
  imports: [PrismaModule, PdfModule, DocumentosModule],
  controllers: [ExpedienteController],
  providers: [ExpedienteService, CalendarioContratoService, ContratosPdfService],
  exports: [ExpedienteService],
})
export class ExpedienteModule {}
