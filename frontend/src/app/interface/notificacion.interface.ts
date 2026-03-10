export type TipoNotificacion =
  | 'INFORME_INICIAL_PENDIENTE'
  | 'INFORME_SEGUIMIENTO_PENDIENTE'
  | 'BONO_AGOTADO'
  | 'BONO_CASI_AGOTADO'
  | 'BONO_PENDIENTE_PAGO'
  | 'SIN_SESIONES_RECIENTES'
  | 'OBJETIVO_SIN_EVALUAR'
  | 'INFORME_EN_BORRADOR'
  | 'SESION_SIN_BONO'
  | 'CONSENTIMIENTO_RGPD_PENDIENTE';

export type PrioridadNotif = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA';

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  prioridad: PrioridadNotif;
  titulo: string;
  mensaje: string;
  leida: boolean;
  descartada: boolean;
  accionUrl?: string;
  clienteId?: string;
  referenciaId?: string;
  fechaCreacion: string;
  fechaLectura?: string;
  cliente?: { id: string; nombre: string; apellidos: string } | null;
}

export const PRIORIDAD_CONFIG: Record<
  PrioridadNotif,
  { color: string; bgColor: string; icon: string; label: string }
> = {
  URGENTE: {
    color: '#dc3545',
    bgColor: '#fff5f5',
    icon: 'bi-exclamation-circle-fill',
    label: 'Urgente',
  },
  ALTA: {
    color: '#fd7e14',
    bgColor: '#fff8f0',
    icon: 'bi-exclamation-triangle-fill',
    label: 'Alta',
  },
  MEDIA: {
    color: '#0d6efd',
    bgColor: '#f0f4ff',
    icon: 'bi-info-circle-fill',
    label: 'Media',
  },
  BAJA: {
    color: '#6c757d',
    bgColor: '#f8f9fa',
    icon: 'bi-bell-fill',
    label: 'Baja',
  },
};
