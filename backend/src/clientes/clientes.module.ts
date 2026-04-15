import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { N8nModule } from 'src/n8n/n8n.module';
import { HttpModule } from '@nestjs/axios';
import { ClientesController } from './clientes.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [N8nModule, HttpModule, AuthModule],
  providers: [ClientesService],
  controllers: [ClientesController]
})
export class ClientesModule {}
