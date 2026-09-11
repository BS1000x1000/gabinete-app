import { Module } from '@nestjs/common';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';
import { InformesCronService } from './informes-cron.service';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PdfModule, AuthModule],
  controllers: [InformesController],
  providers: [
    InformesService,
    InformesPdfService,
    InformesCronService,
    StorageService,
  ],
  exports: [InformesService],
})
export class InformesModule {}
