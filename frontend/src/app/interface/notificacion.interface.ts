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
  // Colores de la paleta de marca (sass/abstracts/_variables.scss), no los
  // primarios de Bootstrap. `color` se pinta como texto pequeno en la campana,
  // asi que va el tono -dark: el naranja #fd7e14 anterior daba 2.57 sobre
  // blanco, por debajo del minimo de 4.5.
  URGENTE: {
    color: '#7a2c24',        // $danger-dark   — 9.20 sobre blanco
    bgColor: '#f4e3dc',      // $danger-light
    icon: 'bi-exclamation-circle-fill',
    label: 'Urgente',
  },
  ALTA: {
    color: '#6b4a12',        // $warning-dark  — 8.28
    bgColor: '#f5ecd8',      // $warning-light
    icon: 'bi-exclamation-triangle-fill',
    label: 'Alta',
  },
  MEDIA: {
    color: '#274854',        // $info-dark     — 9.86
    bgColor: '#e2ecef',      // $info-light
    icon: 'bi-info-circle-fill',
    label: 'Media',
  },
  BAJA: {
    color: '#556d62',        // $gray-500      — 5.63
    bgColor: '#e5eadf',      // $gray-100
    icon: 'bi-bell-fill',
    label: 'Baja',
  },
};
