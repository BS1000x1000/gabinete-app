import { Module } from '@nestjs/common';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { PdfModule } from '../common/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ExportController],
  providers: [ExportService],
})
export class ExportModule {}
