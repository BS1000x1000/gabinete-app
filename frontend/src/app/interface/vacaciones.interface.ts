export interface PeriodoVacaciones {
  id: string;
  trabajadorId: string;
  fechaInicio: string;
  fechaFin: string;
  motivo?: string | null;
  createdAt?: string;
}

export interface CreateVacacionesPayload {
  fechaInicio: string;
  fechaFin: string;
  motivo?: string;
}

export interface ConflictoSesion {
  id: string;
  fecha: string;
  cliente: string;
  tipoSesion: string;
}

export interface ConflictoEvento {
  id: string;
  fecha: string;
  titulo: string;
  tipo: string;
}

export interface ConflictoVacaciones {
  sesiones: ConflictoSesion[];
  eventos: ConflictoEvento[];
}
