export interface WizardStep {
  id: number;
  titulo: string;
  icono: string;
  completado: boolean;
  opcional: boolean;
}

/**
 * Orden del alta: quién es el niño, quién responde por él y su contexto de salud
 * y colegio. Nada más.
 *
 * No hay paso de Horario ni de Asignación a propósito: el horario semanal y el
 * terapeuta los define el CONTRATO, que es lo que firma la familia. Pedirlos aquí
 * obligaba a teclear el mismo horario hasta tres veces y creaba una segunda
 * fuente de verdad que competía con la del contrato.
 *
 * Tampoco hay paso de Objetivos: los GAS se dictaminan tras el período de
 * análisis con la pedagoga, y se definen desde la pestaña Seguimiento.
 */
export const WIZARD_STEPS: WizardStep[] = [
  { id: 0, titulo: 'Datos básicos', icono: 'person',       completado: false, opcional: false },
  { id: 1, titulo: 'Familia',       icono: 'people',       completado: false, opcional: false },
  { id: 2, titulo: 'Sanitario',     icono: 'heart-pulse',  completado: false, opcional: true  },
  { id: 3, titulo: 'Colegio',       icono: 'building',     completado: false, opcional: true  },
  { id: 4, titulo: 'Resumen',       icono: 'check-circle', completado: false, opcional: false },
];

/** Especialistas del CENTRO ESCOLAR — atienden al alumno dentro del colegio. */
export const ESPECIALISTAS_COLEGIO = [
  'PT (Pedagogía Terapéutica)',
  'AL (Audición y Lenguaje)',
  'Orientador/a',
  'ATE / Educador/a',
  'Fisioterapeuta',
] as const;

/** Especialistas SANITARIOS EXTERNOS — siguen al menor fuera del gabinete. */
export const ESPECIALISTAS_SANITARIOS = [
  'Psicólogo/a',
  'Logopeda',
  'Neuropediatra',
  'Psiquiatra',
  'Terapeuta ocupacional',
  'Pediatra',
] as const;
