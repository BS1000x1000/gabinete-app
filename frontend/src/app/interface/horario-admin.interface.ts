export interface HorarioAdmin {
  id: string;
  trabajadorId: string;
  diaSemana: number; // 1=Lun ... 7=Dom (ISO)
  horaInicio: string; // "HH:mm"
  horaFin: string;
  titulo: string;
  activo: boolean;
}

export interface CreateHorarioAdminDto {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  titulo?: string;
}

export interface UpdateHorarioAdminDto {
  diaSemana?: number;
  horaInicio?: string;
  horaFin?: string;
  titulo?: string;
  activo?: boolean;
}

export const DIA_SEMANA_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  7: 'Domingo',
};
