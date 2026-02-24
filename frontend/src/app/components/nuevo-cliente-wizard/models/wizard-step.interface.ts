export interface WizardStep {
  id: number;
  titulo: string;
  icono: string;
  completado: boolean;
  opcional: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 0, titulo: 'Datos Básicos', icono: 'person', completado: false, opcional: false },
  { id: 1, titulo: 'Colegio', icono: 'building', completado: false, opcional: true },
  { id: 2, titulo: 'Familia', icono: 'people', completado: false, opcional: false },
  { id: 3, titulo: 'Sanitario', icono: 'heart-pulse', completado: false, opcional: true },
  { id: 4, titulo: 'Horario', icono: 'clock', completado: false, opcional: false },
  { id: 5, titulo: 'Objetivos', icono: 'bullseye', completado: false, opcional: true },
  { id: 6, titulo: 'Asignación', icono: 'person-badge', completado: false, opcional: false },
  { id: 7, titulo: 'Resumen', icono: 'check-circle', completado: false, opcional: false },
];