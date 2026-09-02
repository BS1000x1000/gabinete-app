export type TipoEvento =
  | 'COORDINACION_EQUIPO'
  | 'COORDINACION_COLEGIO'
  | 'COORDINACION_PROFESIONAL'
  | 'TIEMPO_ADMINISTRACION'
  | 'FORMACION'
  | 'OTRO';

export type ModalidadEvento = 'PRESENCIAL' | 'ONLINE';

export interface EventoAgenda {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  tipo: TipoEvento;
  modalidad?: ModalidadEvento;
  creadoPor: { id: string; nombre: string; apellidos: string; urlVideollamada?: string };
  participantes: Array<{
    trabajador: { id: string; nombre: string; apellidos: string; urlVideollamada?: string };
  }>;
  createdAt: string;
  updatedAt: string;
  esVirtual?: boolean;
  horarioAdminId?: string;
}

export interface CreateEventoDto {
  titulo: string;
  tipo: TipoEvento;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  descripcion?: string;
  participantesIds?: string[];
  horarioAdminId?: string;
  modalidad?: ModalidadEvento;
}

export interface UpdateEventoDto {
  titulo?: string;
  tipo?: TipoEvento;
  fechaHoraInicio?: string;
  fechaHoraFin?: string;
  descripcion?: string;
  participantesIds?: string[];
  modalidad?: ModalidadEvento;
}

export interface ResumenHoras {
  horasClinicas: number;
  minutosClinicas: number;
  horasNoClinicas: number;
  minutosNoClinicas: number;
  totalMinutos: number;
}

/** Minutos dedicados a un tipo de actividad en el periodo consultado. */
export interface DesgloseTipoJornada {
  tipo: string;
  minutos: number;
}

/**
 * `GET /dashboard/horas-trabajadas`. Vive aqui, junto a `ResumenHoras`, del que
 * depende: estaba declarada dentro de `estadisticas.component.ts`, asi que el
 * servicio tenia que pedirla como generico (`getHorasHistoricas<T>`) y nadie
 * mas podia consumir el endpoint sin volver a escribir el tipo.
 */
export interface HorasTrabajadasResponse {
  semanas: Array<{
    semana: string;
    labelSemana: string;
    minutosClinicas: number;
    minutosNoClinicas: number;
  }>;
  totales: ResumenHoras;
  desgloseTipo: DesgloseTipoJornada[];
}

export const TIPO_EVENTO_CONFIG: Record<
  TipoEvento,
  { label: string; color: string; icon: string }
> = {
  COORDINACION_EQUIPO: {
    label: 'Coordinación de equipo',
    color: '#6b5a8a',
    icon: 'bi-people-fill',
  },
  COORDINACION_COLEGIO: {
    label: 'Coordinación colegio',
    color: '#3a5c74',
    icon: 'bi-building',
  },
  COORDINACION_PROFESIONAL: {
    label: 'Coordinación profesional ext.',
    color: '#3a6b63',
    icon: 'bi-person-lines-fill',
  },
  TIEMPO_ADMINISTRACION: {
    label: 'Administración',
    color: '#556d62',
    icon: 'bi-clipboard2-check',
  },
  FORMACION: {
    label: 'Formación',
    color: '#8a6018',
    icon: 'bi-mortarboard',
  },
  OTRO: {
    label: 'Otro',
    color: '#798d82',
    icon: 'bi-calendar-event',
  },
};
