import { 
  IsString, 
  IsOptional, 
  IsEmail, 
  IsDateString, 
  IsArray, 
  ValidateNested, 
  IsBoolean, 
  IsUUID
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ===== DTOs ANIDADOS =====

/**
 * DTO para datos del colegio
 */
export class ColegioDto {
  @IsOptional()
  @IsString()
  id?: string

  @IsString()
  nombre: string;

  @IsString()
  direccionColegio: string;

  // Contacto 1 (obligatorio)
  @IsString()
  ctoColegioUno: string;

  @IsString()
  ctoTelefonoUno: string;

  @IsEmail()
  ctoEmailColegioUno: string;

  @IsString()
  ctoRelacionColegioUno: string;

  // Contacto 2 (opcional)
  @IsOptional()
  @IsString()
  ctoColegioDos?: string;

  @IsOptional()
  @IsString()
  ctoTelefonoDos?: string;

  @IsOptional()
  @IsEmail()
  ctoEmailColegioDos?: string;

  @IsOptional()
  @IsString()
  ctoRelacionColegioDos?: string;
}

/**
 * DTO para contactos familiares
 * Basado en el modelo Familiar del schema
 */
export class FamiliarDto {
  @IsString()
  nombre: string;

  @IsString()
  apellidos: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsString()
  parentesco: string; // "Madre", "Padre", "Tutor", etc.

  @IsString()
  telefono: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  esResponsablePago?: boolean;

  @IsOptional()
  @IsBoolean()
  esContactoPrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsapp?: boolean;
}

/**
 * DTO para disponibilidad horaria del cliente
 */
export class DisponibilidadDto {
  @IsString()
  @Transform(({ value }) => {
    // Convierte día de la semana a número 0-6
    const dias: { [key: string]: number } = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sábado': 6
    };
    return typeof value === 'string' ? dias[value.toLowerCase()] ?? parseInt(value) : value;
  })
  diaSemana: number; // 0-6 (Domingo-Sábado)

  @IsString()
  horaInicio: string; // Formato "HH:mm" ej: "17:00"

  @IsString()
  horaFin: string; // Formato "HH:mm" ej: "18:00"
}

/**
 * DTO para información sanitaria del cliente
 */
export class DatosSanitariosDto {
  @IsString()
  diagnostico: string;

  @IsString()
  centroSalud: string;

  @IsString()
  tratamientos: string;

  @IsString()
  medicacion: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsBoolean()
  adaptaciones?: boolean;

  @IsOptional()
  @IsString()
  tipoAdaptaciones?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  especialistas?: string[];

  @IsOptional()
  @IsBoolean()
  apoyos?: boolean;
}

// ===== DTO PRINCIPAL =====

/**
 * DTO para crear un nuevo cliente
 * Incluye toda la información del cliente, colegio, familiares y datos sanitarios
 */
export class CreateClienteDto {
  // ----- Datos básicos del cliente -----
  @IsString()
  nombre: string;

  @IsString()
  apellidos: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsString()
  dni: string;

  @IsString()
  domicilio: string;

  @IsString()
  provincia: string;

  @IsString()
  ciudad: string;

  @IsString()
  curso: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaAlta?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  // ----- Carpeta de Drive (opcional) -----
  @IsOptional()
  @IsString()
  idCarpetaDrive?: string;

  // ----- Datos del colegio (anidado) -----
  @IsOptional()
  @ValidateNested()
  @Type(() => ColegioDto)
  colegio?: ColegioDto;

  // ----- Contactos familiares (array) -----
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamiliarDto)
  familiares?: FamiliarDto[];

  // ----- Disponibilidad horaria (array) -----
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisponibilidadDto)
  disponibilidad?: DisponibilidadDto[];

  // ----- Datos sanitarios (anidado) -----
  @IsOptional()
  @ValidateNested()
  @Type(() => DatosSanitariosDto)
  datosSanitarios?: DatosSanitariosDto;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  objetivosGeneralesIds?: string[];
}

/**
 * DTO para actualizar un cliente
 * Todos los campos son opcionales para permitir actualizaciones parciales
 */
export class UpdateClienteDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellidos?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  dni?: string;

  @IsOptional()
  @IsString()
  domicilio?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  curso?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  idCarpetaDrive?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ColegioDto)
  colegio?: ColegioDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamiliarDto)
  familiares?: FamiliarDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DisponibilidadDto)
  disponibilidad?: DisponibilidadDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DatosSanitariosDto)
  datosSanitarios?: DatosSanitariosDto;
}