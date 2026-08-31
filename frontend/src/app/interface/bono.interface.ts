export type EstadoBono = 'ACTIVO' | 'CONSUMIDO' | 'CANCELADO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'BIZUM' | 'TARJETA';
export type TipoSesion = 'PEDAGOGIA' | 'NEUROPSICOLOGIA' | 'LOGOPEDIA' | 'TERAPIA_OCUPACIONAL' | 'EVALUACION' | 'REUNION_COLEGIO';

export const TIPO_SESION_LABELS: Record<TipoSesion, string> = {
  PEDAGOGIA:           'Pedagogía',
  NEUROPSICOLOGIA:     'Neuropsicología',
  LOGOPEDIA:           'Logopedia',
  TERAPIA_OCUPACIONAL: 'Terapia Ocupacional',
  EVALUACION:          'Evaluación',
  REUNION_COLEGIO:     'Reunión con colegio',
};

export interface Bono {
  id: string;
  clienteId: string;
  tipoSesion: TipoSesion;
  totalSesiones: number;
  sesionesConsumidas: number;
  precio: number;
  estado: EstadoBono;
  pagado: boolean;
  metodoPago?: MetodoPago;
  fechaPago?: string;
  fechaInicio: string;
  fechaFin?: string;
  notas?: string;
  familiarPago?: {
    id: string;
    nombre: string;
    apellidos: string;
  };
  sesiones?: { id: string; fechaHoraInicio: string; estado: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBonoDto {
  clienteId: string;
  tipoSesion: TipoSesion;
  totalSesiones: number;
  precio: number;
  familiarPagoId?: string;
  notas?: string;
}

export interface RegistrarPagoDto {
  metodoPago: MetodoPago;
  fechaPago?: string;
}

// ── Helpers de UI ────────────────────────────────────────────────
export const ESTADO_BONO_CONFIG: Record<EstadoBono, { label: string; color: string; bgColor: string }> = {
  ACTIVO:    { label: 'Activo',    color: '#2f6b43', bgColor: '#e4eee2' },
  CONSUMIDO: { label: 'Consumido', color: '#96382e', bgColor: '#f4e3dc' },
  CANCELADO: { label: 'Cancelado', color: '#556d62', bgColor: '#e5eadf' },
};

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  EFECTIVO:      '💵 Efectivo',
  TRANSFERENCIA: '🏦 Transferencia',
  BIZUM:         '📱 Bizum',
  TARJETA:       '💳 Tarjeta',
};

/** Porcentaje consumido y color semáforo */
export function getBonoProgreso(bono: Bono): { porcentaje: number; color: string } {
  const porcentaje = Math.round((bono.sesionesConsumidas / bono.totalSesiones) * 100);
  const restante = 100 - porcentaje;
  const color = restante > 50 ? '#2f6b43' : restante > 25 ? '#8a6018' : '#96382e';
  return { porcentaje, color };
}