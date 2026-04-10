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
  INICIAL:             { texto: 'Informe Inicial',        color: '#0d6efd', bg: '#cfe2ff' },
  SEGUIMIENTO:         { texto: 'Informe de Seguimiento', color: '#6610f2', bg: '#e0cffc' },
  REGISTROS:           { texto: 'Informe de Sesiones',    color: '#059669', bg: '#d1fae5' },
  OBJETIVOS_PROGRESO:  { texto: 'Informe de Progreso',    color: '#7c3aed', bg: '#ede9fe' },
  ALTA:                { texto: 'Informe de Alta',         color: '#b45309', bg: '#fef3c7' },
};

export const ESTADO_INFORME_LABELS: Record<EstadoInforme, { texto: string; badgeClass: string }> = {
  BORRADOR:    { texto: 'Borrador',    badgeClass: 'bg-secondary' },
  REVISION:    { texto: 'En revisión', badgeClass: 'bg-warning text-dark' },
  FINALIZADO:  { texto: 'Finalizado',  badgeClass: 'bg-success' },
  ENVIADO:     { texto: 'Enviado',     badgeClass: 'badge-enviado' },
};

// Secciones del informe para el formulario
export interface SeccionInforme {
  key: keyof UpdateInformeDto;
  titulo: string;
  placeholder: string;
  soloSeguimiento?: boolean;
}

export const SECCIONES_INICIAL: SeccionInforme[] = [
  {
    key: 'motivoConsulta',
    titulo: '1. Motivo de consulta',
    placeholder: 'Describe el motivo por el que el alumno acude al gabinete...',
  },
  {
    key: 'analisisInformacion',
    titulo: '2. Análisis de la información aportada',
    placeholder: 'Analiza la información recibida de familia, colegio y otros profesionales...',
  },
  {
    key: 'evaluacionInicial',
    titulo: '3. Evaluación inicial',
    placeholder: 'Describe los resultados de la evaluación inicial realizada...',
  },
  {
    key: 'objetivosGeneralesTexto',
    titulo: '4. Objetivos generales',
    placeholder: 'Describe los objetivos generales del plan de intervención...',
  },
];

export const SECCIONES_ALTA: SeccionInforme[] = [
  {
    key: 'motivoConsulta',
    titulo: '1. Motivo de consulta / razón del alta',
    placeholder: 'Describe el motivo original de consulta y la razón del alta...',
  },
  {
    key: 'evolucionObservada',
    titulo: '2. Resumen del proceso terapéutico',
    placeholder: 'Resume el proceso seguido durante el tratamiento...',
  },
  {
    key: 'evaluacionInicial',
    titulo: '3. Estado al cierre del tratamiento',
    placeholder: 'Describe el estado del alumno al finalizar el tratamiento...',
  },
  {
    key: 'objetivosGeneralesTexto',
    titulo: '4. Logros alcanzados',
    placeholder: 'Enumera los logros y objetivos alcanzados durante el tratamiento...',
  },
  {
    key: 'recomendaciones',
    titulo: '5. Recomendaciones de continuidad',
    placeholder: 'Incluye recomendaciones para familia, colegio y seguimiento post-alta...',
  },
];

export const SECCIONES_SEGUIMIENTO: SeccionInforme[] = [
  {
    key: 'motivoConsulta',
    titulo: '1. Motivo de consulta',
    placeholder: 'Motivo de consulta original o actualizado...',
  },
  {
    key: 'evolucionObservada',
    titulo: '2. Evolución observada',
    placeholder: 'Describe la evolución del alumno durante el período evaluado...',
    soloSeguimiento: true,
  },
  {
    key: 'evaluacionInicial',
    titulo: '3. Evaluación del período',
    placeholder: 'Evaluación del trabajo realizado durante el período...',
  },
  {
    key: 'objetivosGeneralesTexto',
    titulo: '4. Objetivos trabajados',
    placeholder: 'Resumen narrativo de los objetivos trabajados...',
  },
  {
    key: 'objetivosProximoCurso',
    titulo: '5. Objetivos para el próximo período',
    placeholder: 'Objetivos propuestos para el siguiente curso o período...',
    soloSeguimiento: true,
  },
  {
    key: 'recomendaciones',
    titulo: '6. Recomendaciones',
    placeholder: 'Recomendaciones para familia, colegio u otros profesionales...',
    soloSeguimiento: true,
  },
];
