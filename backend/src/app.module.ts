import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { N8nModule } from './n8n/n8n.module';
import { HorariosModule } from './horarios/horarios.module';
import { TrabajadorModule } from './trabajador/trabajador.module';
import { AuthModule } from './auth/auth.module';
import { FichajeModule } from './fichaje/fichaje.module';

@Module({
  imports: [
    ClientesModule,
    HorariosModule,
    TrabajadorModule,
    AuthModule,
    FichajeModule,
    // NO VA N8nModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
