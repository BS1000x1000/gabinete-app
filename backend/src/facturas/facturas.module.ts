import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { FacturasCronService } from './facturas-cron.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { PdfModule } from '../common/pdf/pdf.module';
import { R2Service } from '../common/storage/r2.service';
import { EmailService } from '../common/email/email.service';

@Module({
  imports: [PdfModule],
  controllers: [FacturasController],
  providers: [FacturasService, FacturasCronService, FacturasPdfService, R2Service, EmailService],
  exports: [FacturasService],
})
export class FacturasModule {}
