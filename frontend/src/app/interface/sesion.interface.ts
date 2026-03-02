/**
 * Interfaz para las sesiones (antes horarios)
 * Coincide con el modelo Sesion del backend
 */
export interface SesionData {
  id: string;
  fechaHoraInicio: string; // ISO string
  fechaHoraFin: string;
  estado: EstadoSesion;
  tipoSesion: TipoSesion;
  notas?: string;
  objetivosTrabajados?: string; // Texto libre de objetivos
  
  clienteId: string;
  trabajadorId: string;
  
  // Relaciones populadas
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
    curso?: string;
  };
  
  trabajador?: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  
  // Campo local para UI
  asistio?: boolean | null;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Estados posibles de una sesión
 */
export enum EstadoSesion {
  PROGRAMADA = 'PROGRAMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA_CON_AVISO = 'CANCELADA_CON_AVISO',
  CANCELADA_SIN_AVISO = 'CANCELADA_SIN_AVISO'
}

/**
 * Tipos de sesión disponibles
 */
export enum TipoSesion {
  PEDAGOGIA = 'PEDAGOGIA',
  NEUROPSICOLOGIA = 'NEUROPSICOLOGIA',
  EVALUACION = 'EVALUACION',
  REUNION_COLEGIO = 'REUNION_COLEGIO'
}

/**
 * DTO para crear una sesión
 */
export interface CreateSesionDto {
  fechaHoraInicio: string;
  fechaHoraFin: string;
  tipoSesion: TipoSesion;
  clienteId: string;
  trabajadorId: string;
  notas?: string;
}

/**
 * DTO para completar una sesión
 */
export interface CompletarSesionDto {
  notas?: string;
  objetivosTrabajados?: string;
}