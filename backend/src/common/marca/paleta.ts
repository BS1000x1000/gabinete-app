/**
 * Paleta de marca del gabinete — fuente única para todo lo que se genera desde
 * el backend: PDF de informes, contratos y facturas, exportaciones y emails.
 *
 * Antes cada plantilla repetía sus hex a mano (25 colores distintos solo en el
 * informe, 168 apariciones entre las cinco superficies) y ninguna compartía nada
 * con las demás: cambiar la marca obligaba a recorrerlas una por una y era
 * cuestión de tiempo que se quedara alguna atrás.
 *
 * Los cuatro colores de arriba son los de las redes sociales; el resto está
 * derivado de ellos e **igualado o mejorado hasta cumplir WCAG AA** (4.5:1 para
 * texto). El ratio verificado va anotado en cada uno.
 */

// ── Los cuatro colores de la marca ──────────────────────────

export const MARCA = {
  /** Verde muy oscuro. Tinta principal y fondo del cromo. */
  tinta: '#1f2a24',
  /** Verde bosque. Color de acción y de los títulos. */
  bosque: '#2d4a3e',
  /** Salvia claro. Superficies hundidas. */
  salvia: '#e3eae0',
  /** Crema cálido. El papel sobre el que se apoya todo. */
  papel: '#f0ead8',
} as const;

// ── Escala neutra ───────────────────────────────────────────
// Interpolada entre los cuatro de marca. El contraste indicado es sobre `papel`.

export const NEUTRO = {
  50: '#f0ead8', //  papel
  100: '#e5eadf', //  hundido
  200: '#c2cdc3', //  bordes
  300: '#a5b4a9', //  bordes activos
  400: '#798d82', //  2.94  deshabilitado
  500: '#556d62', //  4.66  texto secundario
  600: '#2d4a3e', //  8.08  texto normal
  700: '#273c32', //  9.82  texto importante
  800: '#23322b', // 11.18  títulos
  900: '#1f2a24', // 12.34  texto principal
  blanco: '#ffffff',
} as const;

// ── Semánticos ──────────────────────────────────────────────
// El peligro NO puede ser verde: en una marca verde se confundiría con "todo
// bien", y estas plantillas señalan cosas como retenciones o impagos.

export const SEMANTICO = {
  exito: '#2f6b43', // 5.28
  exitoFondo: '#e4eee2',
  aviso: '#8a6018', // 4.64
  avisoFondo: '#f5ecd8',
  peligro: '#96382e', // 6.02
  peligroFondo: '#f4e3dc',
  info: '#345c6b', // 6.05
  infoFondo: '#e2ecef',
} as const;

// ── Escala GAS ──────────────────────────────────────────────
/**
 * El GAS mide si un objetivo se cumple **por debajo o por encima** de lo
 * esperado, así que es una escala DIVERGENTE, no una rampa.
 *
 * Antes los cinco niveles compartían el mismo azul y el color solo indicaba cuál
 * estaba activo: había que leer la etiqueta para saber el signo. Con la arcilla
 * en el lado negativo y el verde en el positivo, el signo se lee de un vistazo
 * — que es justo para lo que sirve la tabla en un informe que ve la familia.
 *
 * La arcilla es el complemento natural del verde bosque: sigue siendo la misma
 * familia cálida, no una alarma.
 */
export const GAS_NIVEL: Record<number, { texto: string; fondo: string; borde: string }> = {
  [-2]: { texto: '#8f4232', fondo: '#f4e3dc', borde: '#e0c4b8' }, // 5.64
  [-1]: { texto: '#9c5434', fondo: '#f8ece2', borde: '#e8d3c2' }, // 4.85
  [0]: { texto: '#6b6249', fondo: '#f1ebdc', borde: '#ddd3bd' }, // 5.09
  [1]: { texto: '#3d6b4a', fondo: '#e4eee2', borde: '#c4d8c6' }, // 5.18
  [2]: { texto: '#255138', fondo: '#d9e8da', borde: '#b2ccb5' }, // 7.14
};

/** Nivel resaltado: se invierte para que el actual salte a la vista. */
export const GAS_ACTIVO = {
  fondo: MARCA.bosque,
  texto: MARCA.papel, // 8.08
} as const;

// ── Tipos de terapia ────────────────────────────────────────
// Apagados para convivir con el verde, pero distinguibles entre sí: con cuatro
// terapias en la misma semana hay que reconocerlas sin leer la etiqueta.

export const TERAPIA: Record<string, string> = {
  PEDAGOGIA: '#2d4a3e', // 8.08
  NEUROPSICOLOGIA: '#3a5c74', // 5.89
  LOGOPEDIA: '#6b5a8a', // 5.06
  TERAPIA_OCUPACIONAL: '#8a6018', // 4.64
  EVALUACION: '#6b6249', // 5.04
  REUNION_COLEGIO: '#556d62', // 4.66
};

/** Para un tipo desconocido; nunca debería usarse, pero mejor legible que crudo. */
export const TERAPIA_POR_DEFECTO = NEUTRO[500];

// ── Documentos ──────────────────────────────────────────────
// Roles con nombre para las plantillas, en vez de repartir hex por el HTML.

export const DOC = {
  /** Cabecera del documento y barras de acento de sección. */
  acento: MARCA.bosque,
  acentoSuave: '#d9e8da',
  /** Franja superior de página. */
  franja: `linear-gradient(90deg, ${MARCA.bosque} 0%, ${MARCA.tinta} 100%)`,
  titulo: NEUTRO[800],
  texto: NEUTRO[700],
  textoSuave: NEUTRO[500],
  borde: NEUTRO[200],
  bordeSuave: NEUTRO[100],
  fondoCaja: '#f7f5ec',
  fondoTabla: '#eef2ea',
  /** La marca "CONFIDENCIAL" del pie: presente pero sin gritar. */
  confidencial: NEUTRO[300],
  pie: NEUTRO[400],
} as const;
