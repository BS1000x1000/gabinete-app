import { TipoSesion } from '@prisma/client';

/**
 * Nombre de cada tipo de terapia tal y como debe leerse en un documento.
 *
 * No vale `tipoSesion.toLowerCase()`: el enum de Prisma va sin tildes, asi que
 * el concepto de la factura salia como "Cuota mensual de pedagogia". Tampoco
 * sirve el mapa del frontend (`sesion.interface.ts`), que esta abreviado para
 * caber en las etiquetas de la agenda ("Ter. Ocupacional"): en una factura el
 * concepto es texto legal y va entero.
 */
export const TIPO_SESION_LABELS: Record<TipoSesion, string> = {
  PEDAGOGIA: 'Pedagogía',
  NEUROPSICOLOGIA: 'Neuropsicología',
  LOGOPEDIA: 'Logopedia',
  TERAPIA_OCUPACIONAL: 'Terapia ocupacional',
  EVALUACION: 'Evaluación',
  REUNION_COLEGIO: 'Reunión con el colegio',
};

/** El nombre del tipo, o el propio valor si algun dia se anade uno al enum. */
export function tipoSesionLabel(tipo: TipoSesion | string): string {
  return TIPO_SESION_LABELS[tipo as TipoSesion] ?? String(tipo);
}
