import {
  IsUUID,
  IsEnum,
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
import { TipoSesion } from '@prisma/client';

export class CreateContratoDto {
  @IsUUID('4')
  clienteId: string;

  @IsOptional()
  @IsUUID('4')
  trabajadorId?: string; // ignorado si no es ADMIN; se sobreescribe con userId del token

  @IsEnum(TipoSesion)
  tipoSesion: TipoSesion;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cuotaMensual: number;

  @IsInt()
  @Min(1)
  @Max(7)
  diaSemana: number;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string;

  @IsInt()
  @Min(15)
  @Max(240)
  duracionMinutos: number;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;
}
