import { Module } from '@nestjs/common';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';
import { PdfModule } from '../common/pdf/pdf.module';
import { R2Service } from '../common/storage/r2.service';

@Module({
  imports: [PdfModule],
  controllers: [InformesController],
  providers: [InformesService, InformesPdfService, R2Service],
  exports: [InformesService],
})
export class InformesModule {}
