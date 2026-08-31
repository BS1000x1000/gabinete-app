import { ModalidadSesion } from '@prisma/client';

export interface PreviewReplanificacion {
  /** Firma del plan. Se exige al aplicar para no ejecutar un plan caducado. */
  hash: string;
  desde: string;
  hasta: string;

  /** Sesiones que cambian de fecha/hora conservando su identidad y sus notas. */
  mover: { sesionId: string; de: string; a: string; finNuevo: string }[];
  crear: { inicio: string; fin: string; modalidad: ModalidadSesion }[];
  /**
   * Sesiones que se retiran. `motivo` distingue dos casos muy distintos:
   * - `SLOT_ELIMINADO`: esa semana ya no toca sesión. Es una baja real.
   * - `FIN_DE_VENTANA`: su sustituta cae más allá de los meses ya generados;
   *   aparecerá sola cuando el cron extienda la ventana. No se pierde nada.
   */
  cancelar: {
    sesionId: string;
    inicio: string;
    motivo: 'SLOT_ELIMINADO' | 'FIN_DE_VENTANA';
  }[];

  /** Fechas descartadas del horario nuevo, con su motivo. */
  omitidas: { fecha: string; motivo: 'FESTIVO' | 'VACACIONES'; detalle: string }[];

  /** Choques con otras sesiones. Se informan, no bloquean. */
  choques: { inicio: string; conSesionId: string; descripcion: string }[];

  /**
   * Lo que la replanificación NO toca. Se devuelve a propósito: es la prueba,
   * visible en pantalla, de que no se está reescribiendo historia clínica.
   */
  intocables: {
    completadas: number;
    canceladas: number;
    /** Sesiones sueltas del cliente (evaluaciones, extras): nunca se mueven. */
    sueltas: number;
    pasadas: number;
  };

  resumen: {
    seMueven: number;
    seCrean: number;
    seCancelan: number;
    /** De las canceladas, cuántas son solo por el borde de la ventana. */
    seCancelanPorVentana: number;
    enFestivo: number;
    enVacaciones: number;
    choques: number;
  };
}
