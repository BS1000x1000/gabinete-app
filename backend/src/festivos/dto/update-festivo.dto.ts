import { IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { AmbitoFestivo } from '@prisma/client';
import { CODIGOS_CCAA } from '../data/calendarios';

/**
 * Todo opcional: el servicio completa lo que no venga con lo que ya hay.
 * Existe para poder corregir una fecha mal tecleada sin borrar el festivo —
 * borrarlo es justo lo que hace que un contrato salga con una sesion de mas.
 */
export class UpdateFestivoDto {
  @IsDateString()
  @IsOptional()
  fecha?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  descripcion?: string;

  @IsEnum(AmbitoFestivo)
  @IsOptional()
  ambito?: AmbitoFestivo;

  @IsIn(CODIGOS_CCAA as string[])
  @IsOptional()
  ccaa?: string;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  municipio?: string;
}
