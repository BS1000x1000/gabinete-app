import {
  IsNumber,
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateContratoDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cuotaMensual?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana?: number;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaFin debe tener formato HH:mm' })
  horaFin?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(240)
  duracionMinutos?: number;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;
}
