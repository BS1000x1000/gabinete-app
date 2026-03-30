import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ObjetivoTrabajadoDto {
  @IsUUID('4')
  objetivoGeneralId: string;

  @IsOptional()
  @IsString()
  notasRegistro?: string;
}

export class CreateRegistroDiarioDto {
  @IsString()
  clienteId: string;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsDateString()
  fechaRegistro?: string;

  @IsOptional()
  @IsString()
  sesionId?: string; // Para vincular el registro con una sesión específica

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjetivoTrabajadoDto)
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoDto[];
}

export class UpdateRegistroDiarioDto {
  @IsString()
  contenido: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjetivoTrabajadoDto)
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoDto[];
}
