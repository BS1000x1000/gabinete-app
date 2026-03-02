import { IsInt, IsDecimal, IsString, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBonoDto {
  @IsUUID()
  clienteId: string;

  @IsInt()
  @Min(1)
  totalSesiones: number;

  @Type(() => Number)
  precio: number;

  @IsOptional()
  @IsUUID()
  familiarPagoId?: string;

  @IsOptional()
  @IsString()
  notas?: string;
}