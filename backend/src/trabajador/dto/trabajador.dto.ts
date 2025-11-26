// dto/trabajador.dto.ts
import { IsEmail, IsNotEmpty, IsIn, IsOptional, IsBoolean } from 'class-validator';

export class CreateTrabajadorDto {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  password!: string;

  @IsNotEmpty()
  nombre!: string;

  @IsOptional()
  activo?: boolean;

  @IsNotEmpty()
  apellidos!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  telefono?: string;

  @IsNotEmpty()
  rolId!: string;
}