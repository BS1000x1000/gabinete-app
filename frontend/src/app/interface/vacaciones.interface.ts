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
