export interface SesionCalendario {
  id: string;
  horaInicio: string;
  horaFin: string;
  duracion: number;
  estado: string;
  tipoSesion: string;
  modalidad?: 'PRESENCIAL' | 'ONLINE';
  urlVideollamada?: string | null;
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
    nombreCompleto: string;
    curso?: string;
  };
  notas?: string;
  temporal?: {
    esPasada: boolean;
    esActual: boolean;
    esFutura: boolean;
  };
}

export interface CalendarioDiario {
  fecha: string;
  fechaFormateada: string;
  diaSemana: string;
  esHoy: boolean;
  totalSesiones: number;
  estadisticas: {
    completadas: number;
    programadas: number;
    canceladas: number;
  };
  sesiones: SesionCalendario[];
}

// Mantener interfaces semanales por compatibilidad
export interface DiaSemana {
  fecha: string;
  diaSemana: string;
  dia: string;
  mes: string;
  esHoy: boolean;
  totalSesiones: number;
  sesiones: SesionCalendario[];
}

export interface CalendarioSemanal {
  rangoSemana: {
    inicio: string;
    fin: string;
    inicioFormateado: string;
    finFormateado: string;
  };
  dias: DiaSemana[];
  resumen: {
    totalSesiones: number;
    completadas: number;
    programadas: number;
    canceladas: number;
    clientesUnicos: number;
  };
}