import {
  IsUUID,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  IsArray,
  ArrayMinSize,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoSesion } from '@prisma/client';
import { CreateSlotDto } from './create-slot.dto';

export class CreateContratoDto {
  @IsUUID('4')
  clienteId: string;

  @IsOptional()
  @IsUUID('4')
  trabajadorId?: string;

  @IsEnum(TipoSesion)
  tipoSesion: TipoSesion;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cuotaMensual: number;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateSlotDto)
  slots: CreateSlotDto[];
}
