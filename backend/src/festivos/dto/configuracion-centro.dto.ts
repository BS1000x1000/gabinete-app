import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { CODIGOS_CCAA } from '../data/calendarios';

/**
 * El calendario que rige el centro. Es lo unico que decide que dias cierra:
 * los festivos ya no se resuelven por la provincia del cliente.
 */
export class ConfiguracionCentroDto {
  @IsIn(CODIGOS_CCAA as string[])
  ccaaCodigo: string;

  /** Vacio = sin festivos locales. Se valida contra el catalogo en el servicio. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  municipio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provincia?: string;
}
