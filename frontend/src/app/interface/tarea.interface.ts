/**
 * Espejo de `TAREAS` en `backend/src/common/tareas/ejecucion-tarea.service.ts`.
 * Si añades una tarea allí, añádela aquí: el panel recorre este mapa.
 */
export type Tarea =
  | 'facturas.generar'
  | 'facturas.email'
  | 'facturas.reconciliar'
  | 'facturas.gestoria'
  | 'contratos.ventana'
  | 'tokens.purgar'
  | 'informes.reconciliar';

export type EstadoEjecucion = 'EN_CURSO' | 'OK' | 'ERROR';

export interface EjecucionTarea {
  id: string;
  tarea: Tarea;
  inicio: string;
  fin: string | null;
  estado: EstadoEjecucion;
  resumen: Record<string, unknown> | null;
  error: string | null;
}

export interface ResumenTareaProgramada {
  tarea: Tarea;
  ultima: EjecucionTarea | null;
}

/**
 * Nombre legible de cada tarea. Única fuente en el frontend.
 *
 * A propósito **no** incluye el horario ("día 1 a las 02:00"): eso vive en el
 * decorador `@Cron` del backend y duplicarlo aquí crearía una segunda fuente de
 * verdad que se desincroniza en cuanto alguien cambia una expresión. Lo que se
 * pinta es cuándo corrió de verdad, que además siempre es cierto.
 */
export const TAREA_LABEL: Record<Tarea, string> = {
  'facturas.generar': 'Generación de facturas',
  'facturas.email': 'Envío de facturas a las familias',
  'facturas.reconciliar': 'Reconciliación de PDF de facturas',
  'facturas.gestoria': 'Entrega a la gestoría',
  'contratos.ventana': 'Ventana de generación de sesiones',
  'tokens.purgar': 'Purga de tokens caducados',
  'informes.reconciliar': 'Reconciliación de PDF de informes',
};

/** Estado tal y como se le presenta a una persona, no como está en la BD. */
export type EstadoVista = 'NUNCA' | 'OK' | 'ERROR' | 'EN_CURSO' | 'INTERRUMPIDA';

/**
 * Una ejecución que arrancó y sigue "en curso" pasadas estas horas no está en
 * curso: el proceso murió por el camino. Seis horas es holgado incluso para la
 * generación de un mes entero con sus PDF.
 */
const HORAS_PARA_INTERRUMPIDA = 6;

export function estadoVista(
  resumen: ResumenTareaProgramada,
  ahora: Date = new Date(),
): EstadoVista {
  if (!resumen.ultima) return 'NUNCA';
  if (resumen.ultima.estado === 'ERROR') return 'ERROR';
  if (resumen.ultima.estado === 'OK') return 'OK';

  const transcurridas =
    (ahora.getTime() - new Date(resumen.ultima.inicio).getTime()) / 3_600_000;
  return transcurridas > HORAS_PARA_INTERRUMPIDA ? 'INTERRUMPIDA' : 'EN_CURSO';
}

export const ESTADO_VISTA_LABEL: Record<EstadoVista, string> = {
  NUNCA: 'Nunca',
  OK: 'Correcta',
  ERROR: 'Con error',
  EN_CURSO: 'En curso',
  INTERRUMPIDA: 'Interrumpida',
};

/** Sufijo de la clase `.adm-badge-tarea-*` que corresponde a cada estado. */
export const ESTADO_VISTA_BADGE: Record<EstadoVista, string> = {
  NUNCA: 'nunca',
  OK: 'ok',
  ERROR: 'error',
  EN_CURSO: 'curso',
  INTERRUMPIDA: 'interrumpida',
};
