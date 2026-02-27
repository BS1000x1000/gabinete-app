import {
  IsInt,
  IsString,
  IsOptional,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

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