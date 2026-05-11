import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CrearFacturaPuntualDto {
  @IsUUID('4')
  clienteId: string;

  @IsDateString()
  fechaEmision: string;

  @IsString()
  @MaxLength(50)
  periodoFacturado: string;

  @IsString()
  @MaxLength(500)
  concepto: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  importe: number;

  @IsUUID('4')
  @IsOptional()
  contratoId?: string;
}
