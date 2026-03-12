import { IsInt, IsNumber, IsString, IsOptional, IsUUID, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoSesion } from '@prisma/client';

export class CreateBonoDto {
  @IsUUID()
  clienteId: string;

  @IsEnum(TipoSesion)
  tipoSesion: TipoSesion;

  @IsInt()
  @Min(1)
  totalSesiones: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precio: number;

  @IsOptional()
  @IsUUID()
  familiarPagoId?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}