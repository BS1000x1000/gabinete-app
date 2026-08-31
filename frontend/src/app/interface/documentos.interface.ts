/**
 * Documentación externa del expediente del cliente.
 * Los informes generados por la app viven en `informes.interface.ts`;
 * la pestaña de Documentación une ambas fuentes en una sola tabla.
 */

export type CategoriaDocumento =
  | 'INFORME_MEDICO'
  | 'INFORME_ESCOLAR'
  | 'ADMINISTRATIVO'
  | 'OTROS'
  // Expediente inicial: los genera la propia aplicación a partir del contrato.
  | 'CONTRATO'
  | 'CONSENTIMIENTO_INFORMADO'
  | 'CONSENTIMIENTO_DATOS';

/** Lo puso la aplicación o lo subió una persona. */
export type OrigenDocumento = 'GENERADO' | 'SUBIDO';

/** Dónde está un documento del expediente camino de la firma. */
export type EstadoFirmaDocumento = 'GENERADO' | 'ENVIADO' | 'FIRMADO';

export interface DocumentoCliente {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: CategoriaDocumento;
  mimeType: string;
  tamanoBytes: number;
  fechaDocumento: string | null;
  createdAt: string;
  updatedAt: string;
  clienteId: string;
  subidoPor: { id: string; nombre: string; apellidos: string };
  origen?: OrigenDocumento;
  estadoFirma?: EstadoFirmaDocumento | null;
  plantillaVersion?: string | null;
  fechaEnvio?: string | null;
  contratoId?: string | null;
  firmadoDeId?: string | null;
}

export interface CreateDocumentoPayload {
  clienteId: string;
  categoria: CategoriaDocumento;
  nombre?: string;
  descripcion?: string;
  fechaDocumento?: string;
}

export interface UpdateDocumentoPayload {
  categoria?: CategoriaDocumento;
  nombre?: string;
  descripcion?: string;
  fechaDocumento?: string;
}

export const CATEGORIA_DOCUMENTO_LABELS: Record<
  CategoriaDocumento,
  { texto: string; corto: string; icono: string }
> = {
  INFORME_MEDICO: {
    texto: 'Informe médico / sanitario',
    corto: 'Médico',
    icono: 'bi-heart-pulse',
  },
  INFORME_ESCOLAR: {
    texto: 'Informe escolar / pedagógico',
    corto: 'Escolar',
    icono: 'bi-mortarboard',
  },
  ADMINISTRATIVO: {
    texto: 'Documentación administrativa',
    corto: 'Administrativo',
    icono: 'bi-folder2',
  },
  OTROS: {
    texto: 'Otros / material de sesión',
    corto: 'Otros',
    icono: 'bi-paperclip',
  },
  CONTRATO: {
    texto: 'Contrato de prestación de servicios',
    corto: 'Contrato',
    icono: 'bi-file-earmark-text',
  },
  CONSENTIMIENTO_INFORMADO: {
    texto: 'Consentimiento informado',
    corto: 'Consent. informado',
    icono: 'bi-clipboard-check',
  },
  CONSENTIMIENTO_DATOS: {
    texto: 'Consentimiento de protección de datos',
    corto: 'Consent. datos',
    icono: 'bi-shield-check',
  },
};

/** Las tres del expediente inicial no se ofrecen al subir a mano: las genera la app. */
export const CATEGORIAS_EXPEDIENTE: CategoriaDocumento[] = [
  'CONTRATO',
  'CONSENTIMIENTO_INFORMADO',
  'CONSENTIMIENTO_DATOS',
];

export const CATEGORIAS_DOCUMENTO = (
  Object.keys(CATEGORIA_DOCUMENTO_LABELS) as CategoriaDocumento[]
).filter(c => !CATEGORIAS_EXPEDIENTE.includes(c));

/** Debe coincidir con MIME_TYPES_PERMITIDOS del backend. */
export const MIME_TYPES_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const TAMANO_MAX_BYTES = 20 * 1024 * 1024;

/** Icono Bootstrap según el tipo de fichero. */
export function iconoPorMime(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'bi-file-earmark-pdf';
  if (mimeType.startsWith('image/')) return 'bi-file-earmark-image';
  if (mimeType.includes('word')) return 'bi-file-earmark-word';
  if (mimeType.includes('sheet') || mimeType.includes('excel'))
    return 'bi-file-earmark-spreadsheet';
  return 'bi-file-earmark';
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
