import { 
  IsString, 
  IsEmail, 
  IsOptional, 
  IsBoolean, 
  MinLength,
  IsUUID 
} from 'class-validator';

export class CreateTrabajadorDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombre: string;

  @IsString()
  apellidos: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  img?: string;

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
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  img?: string;

  @IsOptional()
  @IsString()
  fechaContratacion?: string;

  @IsOptional()
  @IsUUID()
  rolId?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}