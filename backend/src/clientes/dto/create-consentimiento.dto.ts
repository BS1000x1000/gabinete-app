import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateConsentimientoDto {
  @IsString()
  @IsNotEmpty()
  familiarId: string;

  @IsBoolean()
  aceptado: boolean;

  @IsString()
  @IsNotEmpty()
  versionTexto: string;

  @IsString()
  @MinLength(10)
  textoConsentimiento: string;

  @IsString()
  @IsOptional()
  ipRegistro?: string;
}
