import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDatosPagadorDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nifTutorPagador?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombreTutorPagador?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccionFiscalTutor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoPostalTutor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudadTutor?: string;

  @IsOptional()
  @IsEmail()
  emailFacturacion?: string;
}
