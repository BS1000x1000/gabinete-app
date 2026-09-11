import {
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
  IsArray,
  Matches,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

// ============================================================
// DescripcionNivelGAS
// ============================================================

export class DescripcionNivelDto {
  @IsInt()
  @Min(-2)
  @Max(2)
  nivel: number; // -2, -1, 0, 1, 2

  @IsString()
  descripcion: string;
}

// Guarda los 5 niveles de un objetivo de golpe (se usa al definir el objetivo en el informe inicial)
export class SetDescripcionesNivelesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DescripcionNivelDto)
  niveles: DescripcionNivelDto[]; // Debe contener los 5 niveles (-2 a +2)
}

// Actualizar la descripción de un nivel concreto
export class UpdateDescripcionNivelDto {
  @IsString()
  descripcion: string;
}

// ============================================================
// EvaluacionGAS
// ============================================================

export class CreateEvaluacionGASDto {
  @IsInt()
  @Min(-2)
  @Max(2)
  nivel: number; // -2, -1, 0, 1, 2

  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsDateString()
  fecha?: string; // Si no se envía, usa la fecha actual
}

// ============================================================
// Evolución GAS de un cliente en un periodo
// ============================================================

/**
 * Filtros de `GET /gas/cliente/:clienteId/evaluaciones`.
 *
 * `desde` y `hasta` son DIAS (`YYYY-MM-DD`), inclusivos por los dos extremos, y
 * se exige ese formato pelado en vez de `@IsDateString()` a proposito: aceptar
 * un ISO completo invita a mandar `...T00:00:00.000Z`, que es la medianoche UTC
 * y en Madrid ya es la vispera.
 */
export class QueryEvolucionGasDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'desde debe tener el formato YYYY-MM-DD',
  })
  desde?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'hasta debe tener el formato YYYY-MM-DD',
  })
  hasta?: string;

  /**
   * Por defecto solo los objetivos activos, que es de lo que habla un resumen de
   * evolucion. `incluirInactivos=true` los trae todos, para un informe de alta
   * que sí quiere repasar lo ya cerrado.
   */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  incluirInactivos?: boolean;
}