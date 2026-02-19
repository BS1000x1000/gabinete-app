import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TipoSesion } from '@prisma/client';

export class GenerarSesionesDto {
  @IsString()
  clienteId: string;

  @IsString()
  trabajadorId: string;

  @IsDateString()
  fechaInicio: string;

  @IsDateString()
  fechaFin: string;

  @IsOptional()
  @IsEnum(TipoSesion)
  tipoSesion?: TipoSesion;
}