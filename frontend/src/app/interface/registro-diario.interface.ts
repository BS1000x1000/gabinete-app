export type EtiquetaRegistro =
  | 'REGISTRO_DIARIO'
  | 'AUSENCIA'
  | 'COORDINACION_FAMILIA'
  | 'COORDINACION_COLEGIO'
  | 'PARTICIPACION_FAMILIA'
  | 'COORDINACION_PROFESIONALES'
  | 'REVISION_OBJETIVOS'
  | 'EVALUACION_INICIAL'
  | 'SESION_GRUPAL'
  | 'ALTA_TEMPORAL';

export interface EtiquetaMeta {
  label: string;
  icon: string;
  cssClass: string;
}

export const ETIQUETAS_META: Record<EtiquetaRegistro, EtiquetaMeta> = {
  REGISTRO_DIARIO:             { label: 'Registro Diario',        icon: 'bi-journal-text',    cssClass: 'rd-tag--registro-diario' },
  AUSENCIA:                    { label: 'Ausencia',               icon: 'bi-x-circle',        cssClass: 'rd-tag--ausencia' },
  COORDINACION_FAMILIA:        { label: 'Coord. Familia',         icon: 'bi-house-heart',     cssClass: 'rd-tag--coordinacion-familia' },
  COORDINACION_COLEGIO:        { label: 'Coord. Colegio',         icon: 'bi-building',        cssClass: 'rd-tag--coordinacion-colegio' },
  PARTICIPACION_FAMILIA:       { label: 'Familia en sesión',      icon: 'bi-people',          cssClass: 'rd-tag--participacion-familia' },
  COORDINACION_PROFESIONALES:  { label: 'Coord. Profesionales',   icon: 'bi-diagram-3',       cssClass: 'rd-tag--coordinacion-profesionales' },
  REVISION_OBJETIVOS:          { label: 'Revisión Objetivos',     icon: 'bi-clipboard-check', cssClass: 'rd-tag--revision-objetivos' },
  EVALUACION_INICIAL:          { label: 'Evaluación Inicial',     icon: 'bi-clipboard-pulse', cssClass: 'rd-tag--evaluacion-inicial' },
  SESION_GRUPAL:               { label: 'Sesión en Grupo',        icon: 'bi-people-fill',     cssClass: 'rd-tag--sesion-grupal' },
  ALTA_TEMPORAL:               { label: 'Alta / Baja Temporal',   icon: 'bi-calendar-x',      cssClass: 'rd-tag--alta-temporal' },
};

export const ETIQUETAS_OPCIONALES: EtiquetaRegistro[] = [
  'AUSENCIA',
  'COORDINACION_FAMILIA',
  'COORDINACION_COLEGIO',
  'PARTICIPACION_FAMILIA',
  'COORDINACION_PROFESIONALES',
  'REVISION_OBJETIVOS',
  'EVALUACION_INICIAL',
  'SESION_GRUPAL',
  'ALTA_TEMPORAL',
];

export interface RegistroDiario {
  id?: string;
  fechaRegistro: string;
  contenido: string;
  etiquetas?: EtiquetaRegistro[];
  clienteId: string;
  trabajadorId: string;
  cliente?: { id: string; nombre: string; apellidos: string };
  trabajador?: { id: string; nombre: string; apellidos: string };
  objetivosGeneralesTrabajados?: ObjetivoTrabajado[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ObjetivoTrabajado {
  id: string;
  notasRegistro?: string | null;
  objetivoGeneral: {
    id: string;
    titulo: string;
    areaDesarrollo: {
      nombre: string;
      color?: string;
    };
  };
}

export interface ObjetivoTrabajadoInput {
  objetivoGeneralId: string;
  notasRegistro?: string;
}

export interface CreateRegistroDiarioDto {
  clienteId: string;
  contenido: string;
  fechaRegistro?: string;
  sesionId?: string;
  etiquetas?: EtiquetaRegistro[];
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoInput[];
}

export interface UpdateRegistroDiarioDto {
  contenido?: string;
  etiquetas?: EtiquetaRegistro[];
  objetivosGeneralesTrabajados?: ObjetivoTrabajadoInput[];
}
