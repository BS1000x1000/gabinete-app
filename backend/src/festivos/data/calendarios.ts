/**
 * Catalogo de calendarios de festivos.
 *
 * Los NACIONALES no viven aqui: se calculan en `festivos.service.ts`
 * (`FESTIVOS_FIJOS` + `calcularViernesSanto` + traslado del domingo). Aqui
 * estan los AUTONOMICOS y los LOCALES, que son los que dependen de decreto.
 *
 * Por que datos versionados y no una API externa: ninguna API publica gratuita
 * cubre los festivos MUNICIPALES espanoles, que son justo la mitad dificil. Y
 * este calendario alimenta la tabla de sesiones del contrato, un documento que
 * firma la familia y que fija una cuota mensual: no debe depender de una
 * llamada de terceros en tiempo de ejecucion.
 *
 * MANTENIMIENTO (una vez al ano, en otono):
 *   1. La Comunidad de Madrid publica su calendario laboral en el BOCM.
 *   2. Cada ayuntamiento publica sus dos festivos locales.
 *   3. Se anaden aqui y se anota el ano en `ANIOS_VERIFICADOS`.
 * Mientras un ano no este verificado, la importacion lo dice en su respuesta y
 * la pantalla de Configuracion lo avisa. Nunca se inventa un festivo.
 */

/** Comunidades autonomas. Conjunto cerrado: alimenta el desplegable. */
export const CCAA = [
  { codigo: 'AND', nombre: 'Andalucía' },
  { codigo: 'ARA', nombre: 'Aragón' },
  { codigo: 'AST', nombre: 'Principado de Asturias' },
  { codigo: 'BAL', nombre: 'Illes Balears' },
  { codigo: 'CAN', nombre: 'Canarias' },
  { codigo: 'CAB', nombre: 'Cantabria' },
  { codigo: 'CLM', nombre: 'Castilla-La Mancha' },
  { codigo: 'CYL', nombre: 'Castilla y León' },
  { codigo: 'CAT', nombre: 'Cataluña' },
  { codigo: 'CEU', nombre: 'Ceuta' },
  { codigo: 'CVA', nombre: 'Comunitat Valenciana' },
  { codigo: 'EXT', nombre: 'Extremadura' },
  { codigo: 'GAL', nombre: 'Galicia' },
  { codigo: 'MAD', nombre: 'Comunidad de Madrid' },
  { codigo: 'MEL', nombre: 'Melilla' },
  { codigo: 'MUR', nombre: 'Región de Murcia' },
  { codigo: 'NAV', nombre: 'Comunidad Foral de Navarra' },
  { codigo: 'PVA', nombre: 'País Vasco' },
  { codigo: 'RIO', nombre: 'La Rioja' },
] as const;

export type CodigoCcaa = (typeof CCAA)[number]['codigo'];

export const CODIGOS_CCAA: readonly string[] = CCAA.map(c => c.codigo);

export function nombreCcaa(codigo: string): string {
  return CCAA.find(c => c.codigo === codigo)?.nombre ?? codigo;
}

/** Un festivo de fecha fija (14 de septiembre, todos los anos). */
export interface DiaFijo {
  mes: number;
  dia: number;
  descripcion: string;
}

/**
 * Un festivo que se mueve con la Pascua. `offsetPascua` son dias respecto al
 * Domingo de Resurreccion: Jueves Santo es -3, Corpus es +60.
 */
export interface DiaMovil {
  offsetPascua: number;
  descripcion: string;
}

export interface CalendarioAutonomico {
  fijos: DiaFijo[];
  moviles: DiaMovil[];
}

/**
 * Festivos autonomicos. Solo estan cargadas las comunidades que se sirven; el
 * resto se anaden a mano desde Configuracion hasta que hagan falta.
 *
 * Madrid: Jueves Santo y el 2 de mayo son los dos que la Comunidad designa de
 * forma estable. El resto de su cupo lo cubre con nacionales trasladados, que
 * ya calcula el servicio.
 */
export const AUTONOMICOS: Record<string, CalendarioAutonomico> = {
  MAD: {
    fijos: [{ mes: 5, dia: 2, descripcion: 'Fiesta de la Comunidad de Madrid' }],
    moviles: [{ offsetPascua: -3, descripcion: 'Jueves Santo' }],
  },
};

export interface CalendarioLocal {
  ccaa: string;
  provincia: string;
  /** Los dos festivos locales. Vacio = no cargados todavia (ver cabecera). */
  dias: DiaFijo[];
}

/**
 * Festivos locales por municipio.
 *
 * Un municipio con `dias: []` esta declarado pero sin datos: la importacion lo
 * reporta como pendiente en vez de generar un calendario incompleto en
 * silencio. Es deliberado — un festivo local que falta produce un contrato con
 * una sesion de mas.
 */
export const LOCALES: Record<string, CalendarioLocal> = {
  Madrid: {
    ccaa: 'MAD',
    provincia: 'Madrid',
    dias: [
      { mes: 5, dia: 15, descripcion: 'San Isidro Labrador' },
      { mes: 11, dia: 9, descripcion: 'Nuestra Señora de la Almudena' },
    ],
  },
  Fuenlabrada: {
    ccaa: 'MAD',
    provincia: 'Madrid',
    dias: [],
  },
  Alcorcón: {
    ccaa: 'MAD',
    provincia: 'Madrid',
    dias: [],
  },
};

export const MUNICIPIOS: readonly string[] = Object.keys(LOCALES);

/**
 * Anos cuyo calendario autonomico y local ha revisado una persona contra el
 * BOCM y los bandos municipales. Importar un ano que no este aqui funciona,
 * pero avisa.
 */
export const ANIOS_VERIFICADOS: readonly number[] = [];
