import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class CreateAreaDesarrolloDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  color?: string; // Formato: "#3B82F6"

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}

export class UpdateAreaDesarrolloDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}