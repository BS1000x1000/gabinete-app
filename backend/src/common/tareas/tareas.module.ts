import { Global, Module } from '@nestjs/common';
import { EjecucionTareaService } from './ejecucion-tarea.service';
import { TareasController } from './tareas.controller';

/**
 * Global por el mismo motivo que `AccesoModule`: las tareas programadas viven
 * repartidas por media docena de modulos (facturas, contratos, auth, informes) y
 * tener que acordarse de importar esto en cada uno es justo como se acaba con un
 * cron sin rastro.
 */
@Global()
@Module({
  controllers: [TareasController],
  providers: [EjecucionTareaService],
  exports: [EjecucionTareaService],
})
export class TareasModule {}
