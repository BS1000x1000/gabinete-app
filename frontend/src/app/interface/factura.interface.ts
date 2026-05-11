export type EstadoFactura = 'PENDIENTE' | 'PAGADA' | 'ANULADA';

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
