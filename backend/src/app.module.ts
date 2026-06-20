import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
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
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { ExportModule } from './export/export.module';
import { EventosAgendaModule } from './eventos-agenda/eventos-agenda.module';
import { HorariosAdminModule } from './horarios-admin/horarios-admin.module';
import { ContratosModule } from './contratos/contratos.module';
import { FestivosModule } from './festivos/festivos.module';
import { VacacionesModule } from './vacaciones/vacaciones.module';
import { FacturasModule } from './facturas/facturas.module';

@Module({
  imports: [
    // Rate limiting global: 200 req / 60s por IP (permisivo para uso normal)
    // Los endpoints criticos aplican limites mas estrictos con @Throttle()
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,
        limit: 200,
      },
    ]),
    ScheduleModule.forRoot(),
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
    BonosModule,
    NotificacionesModule,
    ExportModule,
    EventosAgendaModule,
    HorariosAdminModule,
    ContratosModule,
    FestivosModule,
    VacacionesModule,
    FacturasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // ThrottlerGuard global: todas las rutas quedan limitadas a 200 req/60s por IP.
    // Los endpoints críticos sobrescriben con @Throttle() (p.ej. login: 5/60s).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
