import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Trim, TrimUpper, siTieneValor } from '../../common/dto/texto.decorators';

/**
 * Destinatario fiscal de la factura. Son campos propios de `Cliente` y NO se
 * derivan de ningun `Familiar`: el pagador puede no ser ninguno de los contactos
 * registrados —un abuelo, una empresa— y su NIF puede diferir del DNI de la ficha.
 * El perfil ofrece copiarlos del familiar marcado como responsable de pago, pero
 * la ultima palabra la tiene lo que se escriba aqui.
 *
 * Todo va recortado porque **se imprime en la factura** y acaba en el libro que
 * recibe la gestoria; un NIF con un espacio detras no se ve en papel pero viaja.
 */
export class UpdateDatosPagadorDto {
  @IsOptional()
  @TrimUpper()
  @IsString()
  @MaxLength(20)
  nifTutorPagador?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(120)
  nombreTutorPagador?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(250)
  direccionFiscalTutor?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(10)
  codigoPostalTutor?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  ciudadTutor?: string;

  /**
   * Sin este email la factura NO se envia, y no hay respaldo al del contacto
   * principal a proposito: la factura lleva el nombre y el NIF del pagador y no
   * debe llegar al correo de otra persona.
   *
   * El `@ValidateIf` no es redundante con `@IsOptional()`: ese solo salta con
   * `null`/`undefined` y el formulario manda cadena vacia, asi que guardar la
   * ficha del pagador sin email devolvia un 400.
   */
  @IsOptional()
  @ValidateIf(siTieneValor)
  @Trim()
  @IsEmail()
  emailFacturacion?: string;
}
