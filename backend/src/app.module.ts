import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { TrabajadorModule } from './trabajador/trabajador.module';
import { AuthModule } from './auth/auth.module';
import { FichajeModule } from './fichaje/fichaje.module';
import { PrismaModule } from './prisma/prisma.module';
import { SesionesModule } from './sesiones/sesiones.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { RolesModule } from './roles/roles.module';
import { ObjetivosGeneralesModule } from './objetivos-generales/objetivos-generales.module';
import { AreasDesarrolloModule } from './areas-desarrollo/areas-desarrollo.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GasModule } from './gas/gas.module';
import { InformesModule } from './informes/informes.module';
import { BonosModule } from './bonos/bonos.module';

@Module({
  imports: [
    PrismaModule, 
    ClientesModule,
    DisponibilidadModule,
    SesionesModule,
    FichajeModule,
    AuthModule,
    TrabajadorModule,
    RolesModule,
    ObjetivosGeneralesModule,
    AreasDesarrolloModule,
    HealthModule,
    DashboardModule,
    InformesModule,
    GasModule,
    BonosModule
    // NO VA N8nModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
