import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ConsentimientosModule } from 'src/consentimientos/consentimientos.module';
import { DocumentosModule } from 'src/documentos/documentos.module';

@Module({
  imports: [AuthModule, ConsentimientosModule, DocumentosModule],
  providers: [ClientesService],
  controllers: [ClientesController]
})
export class ClientesModule {}
