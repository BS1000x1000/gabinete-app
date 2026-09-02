/**
 * Interfaz para las sesiones (antes horarios)
 * Coincide con el modelo Sesion del backend
 */
export type ModalidadSesion = 'PRESENCIAL' | 'ONLINE';

/**
 * Aviso al crear o mover una sesión. **Nunca impide guardar**: el gabinete a
 * veces necesita una sesión a deshora —una evaluación un sábado, una
 * recuperación en festivo, que el propio contrato prevé— y la app no debe
 * estorbar. Avisar sí; bloquear no.
 *
 * El backend los devolvía desde el principio y ningún componente los leía, así
 * que ni los solapes se veían.
 */
export interface AvisoSesion {
  tipo: 'FUERA_DE_DISPONIBILIDAD' | 'SOLAPE_TERAPEUTA' | 'SOLAPE_CLIENTE' | 'FESTIVO' | 'VACACIONES';
  mensaje: string;
}

export interface SesionData {
  id: string;
  fechaHoraInicio: string; // ISO string
  fechaHoraFin: string;
  estado: EstadoSesion;
  tipoSesion: TipoSesion;
  modalidad?: ModalidadSesion;
  notas?: string;
  objetivosTrabajados?: string; // Texto libre de objetivos

  /** Solo viene en la respuesta de creación; no se persiste. */
  avisos?: AvisoSesion[];

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
    urlVideollamada?: string;
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
  CANCELADA_SIN_AVISO = 'CANCELADA_SIN_AVISO',
  VACACIONES = 'VACACIONES'
}

/**
 * Tipos de sesión disponibles
 */
export enum TipoSesion {
  PEDAGOGIA = 'PEDAGOGIA',
  NEUROPSICOLOGIA = 'NEUROPSICOLOGIA',
  LOGOPEDIA = 'LOGOPEDIA',
  TERAPIA_OCUPACIONAL = 'TERAPIA_OCUPACIONAL',
  EVALUACION = 'EVALUACION',
  REUNION_COLEGIO = 'REUNION_COLEGIO'
}

export const MODALIDAD_LABELS: Record<ModalidadSesion, string> = {
  PRESENCIAL: 'Presencial',
  ONLINE:     'Online',
};

export const TIPO_SESION_LABELS: Record<TipoSesion, string> = {
  [TipoSesion.PEDAGOGIA]:          'Pedagogía',
  [TipoSesion.NEUROPSICOLOGIA]:    'Neuropsicología',
  [TipoSesion.LOGOPEDIA]:          'Logopedia',
  [TipoSesion.TERAPIA_OCUPACIONAL]:'Ter. Ocupacional',
  [TipoSesion.EVALUACION]:         'Evaluación',
  [TipoSesion.REUNION_COLEGIO]:    'Reunión Colegio',
};

export const ESTADO_SESION_LABELS: Record<EstadoSesion, string> = {
  [EstadoSesion.PROGRAMADA]:          'Programada',
  [EstadoSesion.COMPLETADA]:          'Completada',
  [EstadoSesion.CANCELADA_CON_AVISO]: 'Cancelada con aviso',
  [EstadoSesion.CANCELADA_SIN_AVISO]: 'Cancelada sin aviso',
  [EstadoSesion.VACACIONES]:          'Vacaciones',
};

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