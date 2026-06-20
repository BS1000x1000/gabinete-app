import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { FacturasCronService } from './facturas-cron.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';
import { EmailService } from '../common/email/email.service';

@Module({
  imports: [PdfModule],
  controllers: [FacturasController],
  providers: [FacturasService, FacturasCronService, FacturasPdfService, StorageService, EmailService],
  exports: [FacturasService],
})
export class FacturasModule {}
