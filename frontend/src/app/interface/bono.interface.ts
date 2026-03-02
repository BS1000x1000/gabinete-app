export type EstadoBono = 'ACTIVO' | 'CONSUMIDO' | 'CANCELADO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'BIZUM' | 'TARJETA';

export interface Bono {
  id: string;
  clienteId: string;
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
  ACTIVO:    { label: 'Activo',    color: '#16a34a', bgColor: '#dcfce7' },
  CONSUMIDO: { label: 'Consumido', color: '#dc2626', bgColor: '#fee2e2' },
  CANCELADO: { label: 'Cancelado', color: '#6b7280', bgColor: '#f3f4f6' },
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
  const color = restante > 50 ? '#16a34a' : restante > 25 ? '#f59e0b' : '#dc2626';
  return { porcentaje, color };
}