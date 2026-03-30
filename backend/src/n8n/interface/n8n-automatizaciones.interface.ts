export interface BonoAlertaItem {
  clienteId: string;
  clienteNombre: string;
  clienteApellidos: string;
  bonoId: string;
  tipoSesion: string;
  sesionesRestantes: number;
  emailResponsable: string;
  nombreResponsable: string;
}

// ─── Progreso de objetivos para informe semestral IA ──────────────────────────

export interface NotaObjetivoItem {
  fecha: string;           // YYYY-MM-DD
  notasRegistro: string;
  registroId: string;
  terapeutaNombre: string;
}

export interface ObjetivoProgresoItem {
  objetivoGeneralId: string;
  titulo: string;
  area: string;
  colorArea: string | null;
  nivelGASActual: number | null;
  totalSesiones: number;    // incluye sesiones sin notas
  notas: NotaObjetivoItem[]; // solo entradas con notasRegistro no nulo
}

export interface ObjetivosProgresoResponse {
  clienteId: string;
  clienteNombre: string;
  clienteApellidos: string;
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
  objetivos: ObjetivoProgresoItem[];
}

