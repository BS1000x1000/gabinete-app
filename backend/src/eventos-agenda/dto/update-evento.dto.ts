import {
  IsString,
  MinLength,
  MaxLength,
  IsEnum,
  IsDateString,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';
import { TipoEvento } from '@prisma/client';

export class UpdateEventoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @IsOptional()
  titulo?: string;

  @IsEnum(TipoEvento)
  @IsOptional()
  tipo?: TipoEvento;

  @IsDateString()
  @IsOptional()
  fechaHoraInicio?: string;

  @IsDateString()
  @IsOptional()
  fechaHoraFin?: string;

  @IsString()
  @MaxLength(1000)
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  participantesIds?: string[];
}
