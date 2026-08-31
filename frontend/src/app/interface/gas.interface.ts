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

/**
 * Escala GAS. Es **divergente**, no una rampa: mide si el objetivo se cumple por
 * debajo o por encima de lo esperado, así que el signo tiene que leerse antes
 * que el número.
 *
 * Hasta 2026-09 los cinco niveles compartían el mismo par de colores
 * (`#3d7bc4`/`#d9ebfc`), con lo que el color no aportaba nada: había que leer la
 * etiqueta. Ahora el lado negativo va en arcilla y el positivo en verde — la
 * arcilla es el complemento natural del verde de marca, así que sigue siendo la
 * misma familia cálida y no parece una alarma.
 *
 * Todos los pares cumplen WCAG AA (ratio anotado).
 */
export const GAS_LABELS: Record<number, { texto: string; color: string; bg: string }> = {
  [-2]: { texto: 'Nivel -2 · Desde donde partimos',        color: '#8f4232', bg: '#f4e3dc' }, // 5.64
  [-1]: { texto: 'Nivel -1 · Parcialmente alcanzado',       color: '#9c5434', bg: '#f8ece2' }, // 4.85
  [0]:  { texto: 'Nivel  0 · Conseguido (lo esperado)',     color: '#6b6249', bg: '#f1ebdc' }, // 5.09
  [1]:  { texto: 'Nivel +1 · Un poco más de lo esperado',  color: '#3d6b4a', bg: '#e4eee2' }, // 5.18
  [2]:  { texto: 'Nivel +2 · Mucho más de lo esperado',    color: '#255138', bg: '#d9e8da' }, // 7.14
};

export const GAS_NIVELES = [-2, -1, 0, 1, 2];