import * as ExcelJS from 'exceljs';

/**
 * Construccion de hojas de calculo, compartida por `export` y por los packs de
 * facturas. Estaba como funcion privada de modulo dentro de `export.service.ts`,
 * asi que el libro de facturas emitidas habria sido una segunda copia.
 *
 * La paleta es la lila del sistema de diseno anterior; el resto de la app ya usa
 * el verde de marca. Se deja como estaba para no cambiar de aspecto los exports
 * existentes en el mismo movimiento — cambiarla es una decision de diseno aparte.
 */

const CABECERA_BG = 'FF7C6FD6';
const CABECERA_BORDE = 'FF5A4FA8';
const FILA_ALTERNA = 'FFF5F3FC';
const FILA_BORDE = 'FFE8E4F8';

export const EXCEL_CONTENT_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * `Date` se escribe como fecha real y `null` deja la celda vacia de verdad. Antes
 * solo habia `string | number`, asi que las fechas viajaban ya formateadas y la
 * gestoria no podia ordenar ni filtrar por ellas, y los huecos se guardaban como
 * cadena vacia en la tabla de textos compartidos.
 */
export type CeldaExcel = string | number | Date | null;

/**
 * Formatos de celda de uso comun, para no repetir los codigos de Excel.
 */
export const FORMATO = {
  FECHA: 'dd/mm/yyyy',
  EUROS: '#,##0.00 "€"',
  PORCENTAJE: '0"%"',
} as const;

export interface BuildExcelOpts {
  sheetName: string;
  headers: string[];
  rows: CeldaExcel[][];
  /**
   * Fila final destacada (totales). Va con fondo propio y en negrita para que se
   * distinga del cuerpo sin tener que leerla.
   */
  totales?: CeldaExcel[];
  /**
   * `numFmt` por columna, alineado con `headers`. Opcional y por posicion: los
   * exports que ya existian no pasan nada y se comportan igual que antes.
   */
  formatos?: (string | undefined)[];
}

export async function buildExcel(opts: BuildExcelOpts): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(opts.sheetName);

  ws.columns = opts.headers.map((h) => ({
    header: h,
    key: h,
    width: Math.max(h.length + 4, 16),
  }));

  const headerRow = ws.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: CABECERA_BG },
    };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: CABECERA_BORDE } },
      bottom: { style: 'thin', color: { argb: CABECERA_BORDE } },
      left: { style: 'thin', color: { argb: CABECERA_BORDE } },
      right: { style: 'thin', color: { argb: CABECERA_BORDE } },
    };
  });
  headerRow.height = 22;

  opts.rows.forEach((row, i) => {
    const r = ws.addRow(row);
    const bg = i % 2 === 0 ? 'FFFFFFFF' : FILA_ALTERNA;
    r.eachCell({ includeEmpty: true }, (cell, col) => {
      aplicarFormato(cell, opts.formatos?.[col - 1]);
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      cell.border = {
        top: { style: 'hair', color: { argb: FILA_BORDE } },
        bottom: { style: 'hair', color: { argb: FILA_BORDE } },
        left: { style: 'hair', color: { argb: FILA_BORDE } },
        right: { style: 'hair', color: { argb: FILA_BORDE } },
      };
    });
  });

  if (opts.totales) {
    const r = ws.addRow(opts.totales);
    r.eachCell({ includeEmpty: true }, (cell, col) => {
      aplicarFormato(cell, opts.formatos?.[col - 1]);
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: FILA_ALTERNA },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: CABECERA_BORDE } },
        bottom: { style: 'thin', color: { argb: CABECERA_BORDE } },
      };
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

/**
 * Aplica el formato de una columna. Los numeros van a la derecha: con el formato
 * de euros puesto y el texto centrado por defecto la columna de importes no se
 * podia leer en vertical.
 */
function aplicarFormato(cell: ExcelJS.Cell, formato: string | undefined): void {
  if (!formato) return;
  cell.numFmt = formato;
  if (typeof cell.value === 'number') {
    cell.alignment = { horizontal: 'right' };
  }
}
