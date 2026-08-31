import { TipoSesion } from './sesion.interface';

export type EstadoContrato  = 'BORRADOR' | 'ACTIVO' | 'SUSPENDIDO' | 'FINALIZADO';

export const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

export const TIPO_COLOR: Record<string, string> = {
  PEDAGOGIA:           '#7c6fd6',
  NEUROPSICOLOGIA:     '#3b82f6',
  LOGOPEDIA:           '#10b981',
  TERAPIA_OCUPACIONAL: '#f59e0b',
  EVALUACION:          '#8b5cf6',
  REUNION_COLEGIO:     '#6b7280',
};

export const ESTADO_CONTRATO_LABEL: Record<EstadoContrato, string> = {
  BORRADOR:   'Borrador',
  ACTIVO:     'Activo',
  SUSPENDIDO: 'Suspendido',
  FINALIZADO: 'Finalizado',
};
export type ModalidadSlot   = 'PRESENCIAL' | 'ONLINE';

export interface ContratoSlot {
  id:              string;
  diaSemana:       number;   // 1=Lun..7=Dom (ISO)
  horaInicio:      string;   // "HH:mm"
  horaFin:         string;
  duracionMinutos: number;
  modalidad:       ModalidadSlot;
}

export interface ContratoServicio {
  id:           string;
  clienteId:    string;
  trabajadorId: string;
  tipoSesion:   TipoSesion;
  cuotaMensual: number;
  slots:        ContratoSlot[];
  fechaInicio:  string;
  fechaFin?:    string | null;
  estado:       EstadoContrato;
  notas?:       string | null;
  fechaFirma:   string;

  /** PDF firmado subido. Cuando existe, sustituye al generado por la app. */
  storageKeyFirmado?:  string | null;
  mimeTypeFirmado?:    string | null;
  tamanoBytesFirmado?: number | null;
  fechaSubidaFirmado?: string | null;
  /** Si es posterior a `fechaSubidaFirmado`, el PDF firmado quedó desfasado. */
  resumenModificadoAt?: string | null;

  createdAt:    string;
  updatedAt:    string;
  cliente:    { id: string; nombre: string; apellidos: string };
  trabajador: { id: string; nombre: string; apellidos: string; especialidad?: string | null };
  _count:     { sesiones: number };
}

export interface SlotPayload {
  diaSemana:       number;
  horaInicio:      string;
  horaFin:         string;
  duracionMinutos: number;
  modalidad?:      ModalidadSlot;
}

export interface CreateContratoPayload {
  clienteId:    string;
  trabajadorId?: string;
  tipoSesion:   TipoSesion;
  cuotaMensual: number;
  slots:        SlotPayload[];
  fechaInicio:  string;
  fechaFin?:    string;
  notas?:       string;
}

export interface UpdateContratoPayload {
  cuotaMensual?: number;
  fechaFin?:     string | null;
  notas?:        string;
  slots?:        SlotPayload[];
}
