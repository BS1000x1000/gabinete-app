import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TAREAS } from '../ejecucion-tarea.service';
// `import type` obligatorio: con isolatedModules + emitDecoratorMetadata,
// un tipo usado en una propiedad decorada no puede venir del import normal.
import type { Tarea } from '../ejecucion-tarea.service';

export class HistorialTareasDto {
  /** Filtra por una tarea concreta. La lista cerrada evita consultas a lo loco. */
  @IsOptional()
  @IsIn(Object.values(TAREAS))
  tarea?: Tarea;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limite?: number;
}
