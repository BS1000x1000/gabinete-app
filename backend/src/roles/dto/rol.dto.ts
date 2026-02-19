import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @MinLength(3)
  nombreRol: string;

  @IsString()
  @MinLength(2)
  codigo: string; // Código corto: "ADMIN", "PEDAGOGO", "NEURO", etc.

  @IsOptional()
  @IsString()
  descripcion?: string;
}

export class UpdateRolDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombreRol?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  codigo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;
}