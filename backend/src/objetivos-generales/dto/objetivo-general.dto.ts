import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateObjetivoGeneralDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsUUID()
  areaDesarrolloId: string;
}

export class UpdateObjetivoGeneralDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  areaDesarrolloId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}