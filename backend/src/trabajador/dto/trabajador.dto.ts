import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsNumber,
  Min,
  Max,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PeriodicidadEnvio } from '@prisma/client';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
const PASSWORD_MSG = 'La contrasena debe tener minimo 8 caracteres, una mayuscula, una minuscula y un numero';

export class CreateTrabajadorDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  password: string;

  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MaxLength(100)
  apellidos: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  img?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroColegiado?: string;
  /**
   * Colegio profesional al que pertenece. Va impreso en el encabezado del
   * contrato y del consentimiento informado.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  colegioProfesional?: string;

  /** Poliza del seguro de responsabilidad civil (clausula 11 del contrato). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  numeroPoliza?: string;

  /** Solo si el domicilio profesional difiere del fiscal. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccionProfesional?: string;


  @IsOptional()
  @IsString()
  @MaxLength(100)
  especialidad?: string;

  @IsOptional()
  @IsString()
  fechaContratacion?: string;

  @IsUUID()
  rolId: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateTrabajadorDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  password?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidos?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  img?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroColegiado?: string;
  /**
   * Colegio profesional al que pertenece. Va impreso en el encabezado del
   * contrato y del consentimiento informado.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  colegioProfesional?: string;

  /** Poliza del seguro de responsabilidad civil (clausula 11 del contrato). */
  @IsOptional()
  @IsString()
  @MaxLength(60)
  numeroPoliza?: string;

  /** Solo si el domicilio profesional difiere del fiscal. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  direccionProfesional?: string;


  @IsOptional()
  @IsString()
  @MaxLength(100)
  especialidad?: string;

  @IsOptional()
  @IsString()
  fechaContratacion?: string;

  @IsOptional()
  @IsUUID()
  rolId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @ValidateIf((o) => !!o.urlVideollamada)
  @IsUrl({ require_protocol: true, protocols: ['https'] }, {
    message: 'Debe ser una URL HTTPS válida (ej: https://meet.google.com/abc-defg-hij)',
  })
  urlVideollamada?: string;
}

export class DatosFiscalesDto {
  /**
   * Gestoria a la que se entregan las facturas. Va por trabajador: cada autonomo
   * puede tener la suya.
   */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreGestoria?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  emailGestoria?: string;

  /** Cada cuanto sale la entrega automatica. `NINGUNA` la desactiva. */
  @IsOptional()
  @IsEnum(PeriodicidadEnvio)
  periodicidadGestoria?: PeriodicidadEnvio;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  nifFiscal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombreFiscal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionFiscal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoPostalFiscal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudadFiscal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  provinciaFiscal?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}\d{2}[\dA-Z]{1,30}$/, { message: 'Formato IBAN no válido' })
  iban?: string;

  /** BIC/SWIFT: 8 u 11 caracteres (ISO 9362). Se imprime en la factura. */
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{6}[0-9A-Z]{2}([0-9A-Z]{3})?$/, {
    message: 'Formato SWIFT/BIC no válido',
  })
  swift?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  retencionIrpf?: number;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  emailFacturacion?: string;
}

/**
 * Lo que uno puede cambiar de SI MISMO (`PATCH /trabajadores/me`).
 *
 * Existe porque ese endpoint aceptaba `UpdateTrabajadorDto` entero, que incluye
 * `rolId` y `activo`: cualquier usuario autenticado podia ascenderse a ADMIN
 * con una sola peticion, y `GET /roles` -abierto a todo autenticado- le daba el
 * id que necesitaba. `username` y `password` tambien quedan fuera: la
 * contrasena tiene su propio endpoint, que si verifica la actual.
 *
 * Si se anade un campo a `UpdateTrabajadorDto`, hay que decidir a mano si entra
 * aqui. Es deliberado: una lista blanca que hay que mantener es mas segura que
 * una herencia que arrastra lo que venga.
 */
export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidos?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  img?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  numeroColegiado?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  colegioProfesional?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  numeroPoliza?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  direccionProfesional?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  especialidad?: string;

  @IsOptional()
  @IsString()
  fechaContratacion?: string;

  @IsOptional()
  @Matches(/^https:\/\/.+/, {
    message: 'Debe ser una URL HTTPS válida (ej: https://meet.google.com/abc-defg-hij)',
  })
  urlVideollamada?: string;
}
