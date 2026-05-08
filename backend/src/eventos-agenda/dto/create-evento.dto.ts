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

export class CreateEventoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titulo: string;

  @IsEnum(TipoEvento)
  tipo: TipoEvento;

  @IsDateString()
  fechaHoraInicio: string;

  @IsDateString()
  fechaHoraFin: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  descripcion?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  participantesIds?: string[];

  @IsString()
  @IsOptional()
  horarioAdminId?: string;
}
