import { IsString, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';

export class CreateRegistroDiarioDto {
  @IsString()
  clienteId: string;

  @IsString()
  contenido: string;

  @IsOptional()
  @IsDateString()
  fechaRegistro?: string;

  @IsOptional()
  @IsString()
  sesionId?: string; // Para vincular el registro con una sesión específica

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  objetivosGeneralesTrabajados?: string[];
}