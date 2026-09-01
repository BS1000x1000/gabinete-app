import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller';
import { FacturasService } from './facturas.service';
import { FacturasCronService } from './facturas-cron.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { FacturasPackService } from './facturas-pack.service';
import { FacturasGestoriaService } from './facturas-gestoria.service';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';
import { EmailService } from '../common/email/email.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PdfModule, AuthModule],
  controllers: [FacturasController],
  providers: [
    FacturasService,
    FacturasCronService,
    FacturasPdfService,
    FacturasPackService,
    FacturasGestoriaService,
    StorageService,
    EmailService,
  ],
  exports: [FacturasService],
})
export class FacturasModule {}
