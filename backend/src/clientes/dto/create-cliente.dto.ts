import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsInt,
  Max,
  Min,
  ValidateIf,
  Matches,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TipoSesion } from '@prisma/client';

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

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsEmail()
  ctoEmailColegioUno?: string;

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
  @ValidateIf((_, v) => v !== '')
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

  /**
   * NIF/NIE del progenitor o tutor. Sigue siendo opcional -no siempre se tiene
   * a mano al dar el alta- pero si viene, tiene que tener forma de NIF: es el
   * dato que va impreso en el contrato y en los consentimientos.
   */
  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v != null)
  @Matches(/^[0-9XYZ][0-9]{7}[A-Za-z]$/, {
    message: 'El DNI/NIE debe tener 8 caracteres y una letra (ej. 12345678Z)',
  })
  dni?: string;

  @IsString()
  parentesco: string; // "Madre", "Padre", "Tutor", etc.

  @IsString()
  telefono: string;

  @IsOptional()
  @ValidateIf((_, v) => v !== '')
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  esResponsablePago?: boolean;

  @IsOptional()
  @IsBoolean()
  esContactoPrincipal?: boolean;

  /**
   * Firma el contrato y los consentimientos. Aparte de `esContactoPrincipal`,
   * que nace en true para todos y solo dice a quien se llama primero.
   */
  @IsOptional()
  @IsBoolean()
  esTutorLegal?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsapp?: boolean;
}

/**
 * DTO para disponibilidad horaria del cliente
 */
export class DisponibilidadDto {
  @IsInt()
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

export class HorarioTrabajadorDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @Transform(({ value }) => Number(value))
  diaSemana: number;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFin: string;
}

export class AsignacionTrabajadorDto {
  @IsString()
  trabajadorId: string;

  @IsString()
  tipoTerapia: TipoSesion;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HorarioTrabajadorDto)
  horarios: HorarioTrabajadorDto[];
}

/**
 * DTO para informacion sanitaria del cliente.
 * Todo opcional: en el alta a menudo aun no hay diagnostico.
 * `especialistas` son profesionales sanitarios EXTERNOS (psicologo, logopeda,
 * neuropediatra...). Lo escolar va en DatosEscolaresDto.
 */
export class DatosSanitariosDto {
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @IsOptional()
  @IsString()
  centroSalud?: string;

  @IsOptional()
  @IsString()
  tratamientos?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  especialistas?: string[];
}

/**
 * DTO para la situacion escolar DEL NINO.
 * Separado de ColegioDto a proposito: el colegio es una entidad compartida entre
 * clientes, mientras que las adaptaciones, los apoyos y los especialistas del
 * centro (PT, AL, orientador...) son del alumno concreto.
 */
export class DatosEscolaresDto {
  @IsOptional()
  @IsBoolean()
  adaptaciones?: boolean;

  @IsOptional()
  @IsString()
  tipoAdaptaciones?: string;

  @IsOptional()
  @IsBoolean()
  apoyos?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  especialistas?: string[];
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

  /**
   * Opcional: muchos menores no tienen DNI al darse de alta.
   * Se normaliza a null para que varios clientes sin DNI convivan bajo el indice unico.
   */
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() ? value.trim() : null))
  dni?: string | null;

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

  // ----- Situacion escolar del nino (anidado) -----
  @IsOptional()
  @ValidateNested()
  @Type(() => DatosEscolaresDto)
  datosEscolares?: DatosEscolaresDto;

  // Asignaciones cliente-trabajador creadas junto con el alta
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsignacionTrabajadorDto)
  asignaciones?: AsignacionTrabajadorDto[];

  // El consentimiento RGPD no se declara en el alta: en ese momento la familia
  // todavia no ha firmado nada. Se registra al subir el documento firmado, via
  // `POST /expediente/documento/:id/firmado`.
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
  @Transform(({ value }) => (typeof value === 'string' && value.trim() ? value.trim() : null))
  dni?: string | null;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => DatosEscolaresDto)
  datosEscolares?: DatosEscolaresDto;

  // Ni aqui: un PATCH generico no puede otorgar ni retirar un consentimiento
  // sin dejar rastro. Ver `ConsentimientosService`.
}