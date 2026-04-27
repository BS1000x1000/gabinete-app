import {
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EtiquetaRegistro } from '@prisma/client';

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
  sesionId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(EtiquetaRegistro, { each: true })
  etiquetas?: EtiquetaRegistro[];

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
  @IsEnum(EtiquetaRegistro, { each: true })
  etiquetas?: EtiquetaRegistro[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ObjetivoTrabajadoDto)
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoDto[];
}
