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
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

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
