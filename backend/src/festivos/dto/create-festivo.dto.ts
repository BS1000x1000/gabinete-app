import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AmbitoFestivo } from '@prisma/client';

export class CreateFestivoDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @MaxLength(200)
  descripcion: string;

  @IsEnum(AmbitoFestivo)
  ambito: AmbitoFestivo;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ccaa?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provincia?: string;

  @IsInt()
  @Min(2020)
  anio: number;
}
