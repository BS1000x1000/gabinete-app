import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { N8nModule } from './n8n/n8n.module';

@Module({
  imports: [ClientesModule,
    // NO VA N8nModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
