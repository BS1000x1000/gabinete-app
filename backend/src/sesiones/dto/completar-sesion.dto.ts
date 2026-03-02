import { IsString, IsOptional } from 'class-validator';

export class CompletarSesionDto {
  @IsOptional()
  @IsString()
  notas?: string;

  @IsOptional()
  @IsString()
  objetivosTrabajados?: string;

}