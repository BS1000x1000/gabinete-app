// ============================================================
// INTERFACES INFORMES — FRONTEND
// ============================================================

export type TipoInforme = 'INICIAL' | 'SEGUIMIENTO' | 'REGISTROS' | 'OBJETIVOS_PROGRESO' | 'ALTA';
export type EstadoInforme = 'BORRADOR' | 'REVISION' | 'FINALIZADO' | 'ENVIADO';

export interface Informe {
  id: string;
  titulo: string;
  tipoInforme: TipoInforme;
  estado: EstadoInforme;
  clienteId: string;
  trabajadorId: string;

  // Período evaluado
  periodoDesde?: string | null;
  periodoHasta?: string | null;

  // Secciones del informe (INICIAL / SEGUIMIENTO)
  motivoConsulta?: string | null;
  analisisInformacion?: string | null;
  evaluacionInicial?: string | null;
  objetivosGeneralesTexto?: string | null;
  evolucionObservada?: string | null;
  objetivosProximoCurso?: string | null;
  recomendaciones?: string | null;

  // Contenido libre (REGISTROS)
  contenido?: string | null;
  enviadoFamiliaAt?: string | null;

  // Snapshot GAS para reproducibilidad del PDF
  objetivosSnapshotJson?: string | null;
  urlDocumentoFinal?: string | null;

  // Relaciones
  cliente?: {
    id: string;
    nombre: string;
    apellidos: string;
    fechaNacimiento?: string;
    curso?: string;
    colegio?: { nombre: string } | null;
  };
  trabajador?: {
    id: string;
    nombre: string;
    apellidos: string;
  };

  createdAt: string;
  updatedAt: string;
}

// DTO crear
export interface CreateInformeDto {
  titulo: string;
  tipoInforme: TipoInforme;
  clienteId: string;
  periodoDesde?: string;
  periodoHasta?: string;
  motivoConsulta?: string;
  analisisInformacion?: string;
  evaluacionInicial?: string;
  objetivosGeneralesTexto?: string;
  evolucionObservada?: string;
  objetivosProximoCurso?: string;
  recomendaciones?: string;
}

// DTO actualizar (todos opcionales)
export interface UpdateInformeDto {
  titulo?: string;
  estado?: EstadoInforme;
  periodoDesde?: string;
  periodoHasta?: string;
  motivoConsulta?: string;
  analisisInformacion?: string;
  evaluacionInicial?: string;
  objetivosGeneralesTexto?: string;
  evolucionObservada?: string;
  objetivosProximoCurso?: string;
  recomendaciones?: string;
  urlDocumentoFinal?: string;
  contenido?: string;
}

// Labels para la UI
export const TIPO_INFORME_LABELS: Record<TipoInforme, { texto: string; color: string; bg: string }> = {
  INICIAL:             { texto: 'Informe Inicial',        color: '#2d4a3e', bg: '#d9e8da' },
  SEGUIMIENTO:         { texto: 'Informe de Seguimiento', color: '#3a5c74', bg: '#dde6ec' },
  REGISTROS:           { texto: 'Informe de Sesiones',    color: '#556d62', bg: '#e5eadf' },
  OBJETIVOS_PROGRESO:  { texto: 'Informe de Progreso',    color: '#6b5a8a', bg: '#e8e3ef' },
  ALTA:                { texto: 'Informe de Alta',        color: '#8a6018', bg: '#f5ecd8' },
};

export const ESTADO_INFORME_LABELS: Record<EstadoInforme, { texto: string; badgeClass: string }> = {
  // gb-badge (sistema propio), no las clases de Bootstrap: sus colores estan
  // fuera de la paleta y no se distinguen sobre el papel de la app.
  BORRADOR:    { texto: 'Borrador',    badgeClass: 'gb-badge gb-badge--neutro' },
  REVISION:    { texto: 'En revisión', badgeClass: 'gb-badge gb-badge--aviso' },
  FINALIZADO:  { texto: 'Finalizado',  badgeClass: 'gb-badge gb-badge--exito' },
  ENVIADO:     { texto: 'Enviado',     badgeClass: 'gb-badge gb-badge--info' },
};

// Secciones del informe para el formulario.
// El orden de cada array ES el orden del documento y de la navegación del editor;
// la numeración se calcula al renderizar, así que reordenar no obliga a renumerar.
// Debe mantenerse alineado con `backend/src/informes/templates/informe.template.ts`.
export const SECCION_GAS_KEY = 'gas';

export interface SeccionInforme {
  /** `'gas'` es una sección sintética (tabla GAS), no un campo editable del informe. */
  key: keyof UpdateInformeDto | typeof SECCION_GAS_KEY;
  titulo: string;
  placeholder?: string;
}

const GAS_SECCION: SeccionInforme = {
  key: SECCION_GAS_KEY,
  titulo: 'Objetivos GAS (Goal Attainment Scaling)',
};

export const SECCIONES_INICIAL: SeccionInforme[] = [
  {
    key: 'motivoConsulta',
    titulo: 'Motivo de consulta',
    placeholder: 'Describe el motivo por el que el alumno acude al gabinete...',
  },
  {
    key: 'analisisInformacion',
    titulo: 'Análisis de la información aportada',
    placeholder: 'Analiza la información recibida de familia, colegio y otros profesionales...',
  },
  {
    key: 'evaluacionInicial',
    titulo: 'Evaluación inicial',
    placeholder: 'Describe los resultados de la evaluación inicial realizada...',
  },
  {
    key: 'objetivosGeneralesTexto',
    titulo: 'Objetivos generales',
    placeholder: 'Describe los objetivos generales del plan de intervención...',
  },
  GAS_SECCION,
];

export const SECCIONES_ALTA: SeccionInforme[] = [
  {
    key: 'motivoConsulta',
    titulo: 'Motivo de consulta / razón del alta',
    placeholder: 'Describe el motivo original de consulta y la razón del alta...',
  },
  {
    key: 'evolucionObservada',
    titulo: 'Resumen del proceso terapéutico',
    placeholder: 'Resume el proceso seguido durante el tratamiento...',
  },
  {
    key: 'evaluacionInicial',
    titulo: 'Estado al cierre del tratamiento',
    placeholder: 'Describe el estado del alumno al finalizar el tratamiento...',
  },
  GAS_SECCION,
  {
    key: 'recomendaciones',
    titulo: 'Recomendaciones de continuidad',
    placeholder: 'Incluye recomendaciones para familia, colegio y seguimiento post-alta...',
  },
];

export const SECCIONES_SEGUIMIENTO: SeccionInforme[] = [
  {
    key: 'evaluacionInicial',
    titulo: 'Evaluación del período',
    placeholder: 'Evaluación del trabajo realizado durante el período...',
  },
  {
    key: 'objetivosGeneralesTexto',
    titulo: 'Objetivos trabajados',
    placeholder: 'Resumen narrativo de los objetivos trabajados...',
  },
  GAS_SECCION,
  {
    key: 'objetivosProximoCurso',
    titulo: 'Objetivos para el próximo período',
    placeholder: 'Objetivos propuestos para el siguiente curso o período...',
  },
  {
    key: 'recomendaciones',
    titulo: 'Recomendaciones',
    placeholder: 'Recomendaciones para familia, colegio u otros profesionales...',
  },
];
