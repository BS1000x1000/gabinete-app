import { IsString, IsOptional } from 'class-validator';

export class CompletarSesionDto {
  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  objetivosTrabajados?: string;

  @IsOptional()
  @IsString()
  contenidoRegistroDiario?: string; // Para crear el registro diario automáticamente
}