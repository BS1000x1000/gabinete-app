import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EjecucionTareaService } from './ejecucion-tarea.service';
import { HistorialTareasDto } from './dto/historial-tareas.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../roles/roles.guard';
import { Roles } from '../../roles/roles.decorator';

/**
 * Solo lectura: quien escribe estas filas son las propias tareas programadas.
 *
 * ADMIN y nadie mas. No es informacion clinica, pero dice a que hora corre cada
 * proceso del gabinete y que falla, y eso no le hace falta a recepcion.
 */
@Controller('tareas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TareasController {
  constructor(private readonly ejecuciones: EjecucionTareaService) {}

  /** Una fila por tarea conocida, incluidas las que no se han ejecutado nunca. */
  @Get('ejecuciones')
  @Roles('ADMIN')
  resumen() {
    return this.ejecuciones.resumenPorTarea();
  }

  @Get('ejecuciones/historial')
  @Roles('ADMIN')
  historial(@Query() query: HistorialTareasDto) {
    return this.ejecuciones.historial(query.tarea, query.limite);
  }
}
