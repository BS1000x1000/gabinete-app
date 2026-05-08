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

export const TIPO_EVENTO_CONFIG: Record<
  TipoEvento,
  { label: string; color: string; icon: string }
> = {
  COORDINACION_EQUIPO: {
    label: 'Coordinación de equipo',
    color: '#8b5cf6',
    icon: 'bi-people-fill',
  },
  COORDINACION_COLEGIO: {
    label: 'Coordinación colegio',
    color: '#0ea5e9',
    icon: 'bi-building',
  },
  COORDINACION_PROFESIONAL: {
    label: 'Coordinación profesional ext.',
    color: '#14b8a6',
    icon: 'bi-person-lines-fill',
  },
  TIEMPO_ADMINISTRACION: {
    label: 'Administración',
    color: '#6b7280',
    icon: 'bi-clipboard2-check',
  },
  FORMACION: {
    label: 'Formación',
    color: '#f59e0b',
    icon: 'bi-mortarboard',
  },
  OTRO: {
    label: 'Otro',
    color: '#94a3b8',
    icon: 'bi-calendar-event',
  },
};
