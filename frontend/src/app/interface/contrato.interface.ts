import { TipoSesion } from './sesion.interface';

export type EstadoContrato = 'BORRADOR' | 'ACTIVO' | 'SUSPENDIDO' | 'FINALIZADO';

export interface ContratoServicio {
  id: string;
  clienteId: string;
  trabajadorId: string;
  tipoSesion: TipoSesion;
  cuotaMensual: number;
  diaSemana: number; // 1=Lun..7=Dom (ISO)
  horaInicio: string; // "HH:mm"
  horaFin: string;
  duracionMinutos: number;
  fechaInicio: string; // ISO
  fechaFin?: string | null;
  estado: EstadoContrato;
  notas?: string | null;
  fechaFirma: string;
  createdAt: string;
  updatedAt: string;
  cliente: { id: string; nombre: string; apellidos: string };
  trabajador: { id: string; nombre: string; apellidos: string; especialidad?: string | null };
  _count: { sesiones: number };
}

export interface CreateContratoPayload {
  clienteId: string;
  trabajadorId?: string;
  tipoSesion: TipoSesion;
  cuotaMensual: number;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  fechaInicio: string;
  fechaFin?: string;
  notas?: string;
}

export interface UpdateContratoPayload {
  cuotaMensual?: number;
  diaSemana?: number;
  horaInicio?: string;
  horaFin?: string;
  duracionMinutos?: number;
  fechaFin?: string | null;
  notas?: string;
}
