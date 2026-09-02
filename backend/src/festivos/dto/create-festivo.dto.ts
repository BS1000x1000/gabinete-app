import { IsDateString, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { AmbitoFestivo } from '@prisma/client';
import { CODIGOS_CCAA } from '../data/calendarios';

export class CreateFestivoDto {
  @IsDateString()
  fecha: string;

  @IsString()
  @MaxLength(200)
  descripcion: string;

  @IsEnum(AmbitoFestivo)
  ambito: AmbitoFestivo;

  /**
   * Codigo de comunidad ("MAD"), no nombre libre. Antes era texto libre y se
   * comparaba contra `Cliente.provincia`, tambien libre: una tilde de mas y el
   * festivo desaparecia sin decir nada.
   */
  @IsOptional()
  @IsIn(CODIGOS_CCAA as string[])
  ccaa?: string;

  /** Solo si el ambito es LOCAL. Se valida contra el catalogo en el servicio. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipio?: string;
}
