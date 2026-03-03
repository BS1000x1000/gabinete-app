import { Module } from '@nestjs/common';
import { InformesController } from './informes.controller';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';
import { PdfModule } from '../common/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [InformesController],
  providers: [InformesService, InformesPdfService],
  exports: [InformesService],
})
export class InformesModule {}
