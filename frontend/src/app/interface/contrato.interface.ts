import { TipoSesion, TIPO_SESION_LABELS } from './sesion.interface';

export type EstadoContrato  = 'BORRADOR' | 'ACTIVO' | 'SUSPENDIDO' | 'FINALIZADO';

export const DIAS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;

/**
 * Color por tipo de terapia. Apagados para convivir con el verde de marca, pero
 * distinguibles entre si: con cuatro terapias en la misma semana hay que
 * reconocerlas en la agenda sin leer la etiqueta. Todos cumplen AA sobre papel.
 *
 * ESTA ES LA UNICA DEFINICION. Habia una copia en `agenda.component.ts` que ya
 * habia divergido (dos tipos con colores distintos segun donde se mirase).
 */
export const TIPO_COLOR: Record<string, string> = {
  PEDAGOGIA:           '#2d4a3e', // 8.08
  NEUROPSICOLOGIA:     '#3a5c74', // 5.89
  LOGOPEDIA:           '#6b5a8a', // 5.06
  TERAPIA_OCUPACIONAL: '#8a6018', // 4.64
  EVALUACION:          '#6b6249', // 5.04
  REUNION_COLEGIO:     '#556d62', // 4.66
};

/** Para un tipo desconocido. */
export const TIPO_COLOR_POR_DEFECTO = '#556d62';

export const ESTADO_CONTRATO_LABEL: Record<EstadoContrato, string> = {
  BORRADOR:   'Borrador',
  ACTIVO:     'Activo',
  SUSPENDIDO: 'Suspendido',
  FINALIZADO: 'Finalizado',
};

/**
 * Helpers de etiqueta y color de un contrato. Estaban copiados carácter a
 * carácter en `mis-contratos` y en `contratos-tab`, y ademas ambos usaban un
 * gris propio (`#6b7280`) en vez de `TIPO_COLOR_POR_DEFECTO`.
 */
export const diaLabel = (n: number): string => DIAS[n] ?? '';

export const tipoLabel = (t: string): string =>
  TIPO_SESION_LABELS[t as TipoSesion] ?? t;

export const tipoColor = (t: string): string =>
  TIPO_COLOR[t] ?? TIPO_COLOR_POR_DEFECTO;

/** El mismo color al 9% de opacidad, para el fondo de la píldora de tipo. */
export const tipoBg = (t: string): string => `${tipoColor(t)}18`;

export const estadoContratoLabel = (e: string): string =>
  ESTADO_CONTRATO_LABEL[e as EstadoContrato] ?? e;
export type ModalidadSlot   = 'PRESENCIAL' | 'ONLINE';

export interface ContratoSlot {
  id:              string;
  diaSemana:       number;   // 1=Lun..7=Dom (ISO)
  horaInicio:      string;   // "HH:mm"
  horaFin:         string;
  duracionMinutos: number;
  modalidad:       ModalidadSlot;
}

export interface ContratoServicio {
  id:           string;
  clienteId:    string;
  trabajadorId: string;
  tipoSesion:   TipoSesion;
  cuotaMensual: number;
  slots:        ContratoSlot[];
  fechaInicio:  string;
  fechaFin?:    string | null;
  estado:       EstadoContrato;
  notas?:       string | null;
  fechaFirma:   string;

  /** PDF firmado subido. Cuando existe, sustituye al generado por la app. */
  storageKeyFirmado?:  string | null;
  mimeTypeFirmado?:    string | null;
  tamanoBytesFirmado?: number | null;
  fechaSubidaFirmado?: string | null;
  /** Si es posterior a `fechaSubidaFirmado`, el PDF firmado quedó desfasado. */
  resumenModificadoAt?: string | null;

  createdAt:    string;
  updatedAt:    string;
  cliente:    { id: string; nombre: string; apellidos: string };
  trabajador: { id: string; nombre: string; apellidos: string; especialidad?: string | null };
  _count:     { sesiones: number };
}

export interface SlotPayload {
  diaSemana:       number;
  horaInicio:      string;
  horaFin:         string;
  duracionMinutos: number;
  modalidad?:      ModalidadSlot;
}

export interface CreateContratoPayload {
  clienteId:    string;
  trabajadorId?: string;
  tipoSesion:   TipoSesion;
  cuotaMensual: number;
  slots:        SlotPayload[];
  fechaInicio:  string;
  fechaFin?:    string;
  notas?:       string;
}

export interface UpdateContratoPayload {
  cuotaMensual?: number;
  fechaFin?:     string | null;
  notas?:        string;
  slots?:        SlotPayload[];
}

/**
 * Vista previa de una replanificación: qué le pasa a las sesiones futuras si se
 * cambia el horario del contrato. No escribe nada hasta que se confirma.
 */
export interface PreviewReplanificacion {
  hash: string;
  desde: string;
  hasta: string;
  mover:    { sesionId: string; de: string; a: string; finNuevo: string }[];
  crear:    { inicio: string; fin: string; modalidad: ModalidadSlot }[];
  cancelar: { sesionId: string; inicio: string; motivo: 'SLOT_ELIMINADO' | 'FIN_DE_VENTANA' }[];
  omitidas: { fecha: string; motivo: 'FESTIVO' | 'VACACIONES'; detalle: string }[];
  choques:  { inicio: string; conSesionId: string; descripcion: string }[];
  /** Lo que NO se toca: la prueba de que no se reescribe historia clínica. */
  intocables: { completadas: number; canceladas: number; sueltas: number; pasadas: number };
  resumen: {
    seMueven: number;
    seCrean: number;
    seCancelan: number;
    /** De las canceladas, cuántas son solo por el borde de la ventana generada. */
    seCancelanPorVentana: number;
    enFestivo: number;
    enVacaciones: number;
    choques: number;
  };
}
