export interface WizardStep {
  id: number;
  titulo: string;
  icono: string;
  completado: boolean;
  opcional: boolean;
}

/**
 * Orden del alta: primero quién es y quién responde por él, luego el contexto
 * (salud y colegio), y al final la operativa (horario y terapeuta).
 *
 * No hay paso de Objetivos a propósito: los objetivos GAS se dictaminan tras el
 * período de análisis con la pedagoga, no en el alta. Se definen desde la pestaña
 * Registro de la ficha del cliente.
 */
export const WIZARD_STEPS: WizardStep[] = [
  { id: 0, titulo: 'Datos básicos', icono: 'person',        completado: false, opcional: false },
  { id: 1, titulo: 'Familia',       icono: 'people',        completado: false, opcional: false },
  { id: 2, titulo: 'Sanitario',     icono: 'heart-pulse',   completado: false, opcional: true  },
  { id: 3, titulo: 'Colegio',       icono: 'building',      completado: false, opcional: true  },
  { id: 4, titulo: 'Horario',       icono: 'clock',         completado: false, opcional: false },
  { id: 5, titulo: 'Asignación',    icono: 'person-badge',  completado: false, opcional: true  },
  { id: 6, titulo: 'Resumen',       icono: 'check-circle',  completado: false, opcional: false },
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
