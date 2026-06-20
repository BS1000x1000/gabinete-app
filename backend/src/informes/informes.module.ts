import { Module } from '@nestjs/common';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';
import { PdfModule } from '../common/pdf/pdf.module';
import { StorageService } from '../common/storage/storage.service';

@Module({
  imports: [PdfModule],
  controllers: [InformesController],
  providers: [InformesService, InformesPdfService, StorageService],
  exports: [InformesService],
})
export class InformesModule {}
