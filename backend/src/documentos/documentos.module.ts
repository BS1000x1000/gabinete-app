import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { StorageService } from '../common/storage/storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DocumentosController],
  providers: [DocumentosService, StorageService],
  exports: [DocumentosService],
})
export class DocumentosModule {}
