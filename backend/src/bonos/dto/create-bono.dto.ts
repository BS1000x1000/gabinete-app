import { IsInt, IsNumber, IsString, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBonoDto {
  @IsUUID()
  clienteId: string;

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