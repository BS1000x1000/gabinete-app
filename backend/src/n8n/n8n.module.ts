import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { N8nService } from './n8n.service';
import { N8nController } from './n8n.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PdfModule } from '../common/pdf/pdf.module';

@Module({
  imports: [HttpModule, PrismaModule, PdfModule],
  controllers: [N8nController],
  providers: [N8nService],
  exports: [N8nService],
})
export class N8nModule {}
