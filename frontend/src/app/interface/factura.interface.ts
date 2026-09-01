export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'ANULADA';

export const ESTADO_FACTURA_LABEL: Record<EstadoFactura, string> = {
  PENDIENTE: 'Pendiente',
  PAGADA:    'Pagada',
  ANULADA:   'Anulada',
};

export interface Factura {
  id: string;
  numero: number;
  numeroFormateado: string;
  anio: number;
  trabajadorId: string;
  clienteId: string;
  contratoId: string | null;
  fechaEmision: string;
  periodoFacturado: string; // "2026-09"
  concepto: string;
  importe: number;
  ivaPorcentaje: number;
  ivaImporte: number;
  retencionPorcentaje: number;
  retencionImporte: number;
  exencionIvaTexto: string | null;
  total: number;
  estado: EstadoFactura;
  fechaPago: string | null;
  metodoPago: string | null;
  urlPdfR2: string | null;
  emailEnviado: boolean;
  fechaEnvioEmail: string | null;
  createdAt: string;
  updatedAt: string;
  trabajador: {
    id: string;
    nombre: string;
    apellidos: string;
    nombreFiscal: string | null;
    nifFiscal: string | null;
    emailFacturacion: string | null;
    email: string;
  };
  cliente: {
    id: string;
    nombre: string;
    apellidos: string;
    emailFacturacion: string | null;
  };
  contrato: { id: string; tipoSesion: string } | null;
}

export interface MarcarPagadaPayload {
  fechaPago: string;
  metodoPago?: string;
}

// ── Generación por periodo ───────────────────────────────────────────────────

export interface ContratoAFacturar {
  contratoId: string;
  cliente: string;
  trabajador: string;
  tipoSesion: string;
  importe: number;
}

export interface PreviewGeneracion {
  periodo: string;
  aGenerar: ContratoAFacturar[];
  /** Contratos del periodo que ya tienen factura: no se tocan. */
  yaFacturadas: number;
  importeTotal: number;
}

export interface FalloGeneracion {
  contratoId: string;
  cliente: string;
  motivo: string;
}

export interface ResultadoGeneracion {
  periodo: string;
  creadas: number;
  omitidas: number;
  fallidas: FalloGeneracion[];
}

// ── Paquetes para la gestoría ────────────────────────────────────────────────

export interface SeleccionPack {
  /** Periodos facturados, inclusive. Se ignora si se pasan `ids`. */
  periodoDesde?: string;
  periodoHasta?: string;
  ids?: string[];
  /** `zip` = libro + PDFs; `excel` = solo el libro. */
  formato?: 'zip' | 'excel';
}

export interface ResumenPack {
  numFacturas: number;
  totalImporte: number;
  periodoDesde: string;
  periodoHasta: string;
  filename: string;
  /** Los nombres tal cual irán dentro del zip. */
  ficheros: string[];
}

// ── Entrega a la gestoría ────────────────────────────────────────────────────

export type PeriodicidadEnvio = 'NINGUNA' | 'MENSUAL' | 'TRIMESTRAL';

export const PERIODICIDAD_LABEL: Record<PeriodicidadEnvio, string> = {
  NINGUNA: 'Manual (no se envía solo)',
  MENSUAL: 'Cada mes',
  TRIMESTRAL: 'Cada trimestre',
};

export type EstadoEnvioGestoria = 'PENDIENTE' | 'ENVIADO' | 'ERROR';

export const ESTADO_ENVIO_LABEL: Record<EstadoEnvioGestoria, string> = {
  PENDIENTE: 'Sin salir',
  ENVIADO: 'Enviado',
  ERROR: 'Con error',
};

export interface PreviewEnvioGestoria {
  destinatario: { nombre: string | null; email: string | null };
  /** `false` si falta el email de la gestoría o el servicio de email. */
  listoParaEnviar: boolean;
  emailConfigurado: boolean;
  numFacturas: number;
  totalImporte: number;
  periodoDesde: string;
  periodoHasta: string;
  filename: string;
  ficheros: string[];
  /** Facturas de la selección que ya salieron en una entrega anterior. */
  yaEntregadas: number;
}

export interface EnvioGestoria {
  id: string;
  periodoDesde: string;
  periodoHasta: string;
  emailDestino: string;
  numFacturas: number;
  totalImporte: number;
  estado: EstadoEnvioGestoria;
  error: string | null;
  automatico: boolean;
  fechaEnvio: string | null;
  createdAt: string;
}

export interface PeriodoPendiente {
  periodo: string;
  numFacturas: number;
  total: number;
}
