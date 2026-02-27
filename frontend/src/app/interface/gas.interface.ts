// ============================================================
// INTERFACES GAS — FRONTEND
// ============================================================

export interface DescripcionNivelGAS {
  id: string;
  nivel: number; // -2, -1, 0, 1, 2
  descripcion: string;
  clienteObjetivoId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluacionGAS {
  id: string;
  nivel: number; // -2, -1, 0, 1, 2
  notas?: string;
  fecha: string;
  clienteObjetivoId: string;
  createdAt: string;
}

export interface ResumenObjetivoGAS {
  id: string; // clienteObjetivoId
  objetivo: string;
  area: string;
  areaColor?: string;
  nivelActual: number | null;
  fechaUltimaEvaluacion: string | null;
  notas: string | null;
  progreso: number;
  nivelesDefinidos: boolean; // true si ya tiene los 5 niveles descritos
  niveles: DescripcionNivelGAS[];
  historial: EvaluacionGAS[];
}

// DTO para guardar los 5 niveles de golpe
export interface SetDescripcionesNivelesDto {
  niveles: {
    nivel: number;
    descripcion: string;
  }[];
}

// DTO para registrar una evaluación
export interface CreateEvaluacionDto {
  nivel: number;
  notas?: string;
  fecha?: string;
}

// Labels para mostrar en la UI
export const GAS_LABELS: Record<number, { texto: string; color: string; bg: string }> = {
  [-2]: { texto: 'Nivel -2 · Desde donde partimos',    color: '#3d7bc4', bg: '#d9ebfc' },
  [-1]: { texto: 'Nivel -1 · Parcialmente alcanzado',  color: '#3d7bc4', bg: '#d9ebfc' },
  [0]:  { texto: 'Nivel  0 · Conseguido (lo esperado)', color: '#3d7bc4', bg: '#d9ebfc' },
  [1]:  { texto: 'Nivel +1 · Un poco más de lo esperado', color: '#3d7bc4', bg: '#d9ebfc' },
  [2]:  { texto: 'Nivel +2 · Mucho más de lo esperado', color: '#3d7bc4', bg: '#d9ebfc' },
};

export const GAS_NIVELES = [-2, -1, 0, 1, 2];