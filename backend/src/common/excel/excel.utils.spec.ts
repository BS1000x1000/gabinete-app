import * as ExcelJS from 'exceljs';
import { buildExcel, FORMATO } from './excel.utils';

/** Lee de vuelta el buffer para afirmar sobre celdas reales, no sobre el XML. */
async function leer(buffer: Buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as any);
  return wb.worksheets[0];
}

describe('buildExcel', () => {
  it('escribe la cabecera y las filas en orden', async () => {
    const ws = await leer(
      await buildExcel({
        sheetName: 'Prueba',
        headers: ['A', 'B'],
        rows: [['uno', 1]],
      }),
    );

    expect(ws.name).toBe('Prueba');
    expect(ws.getRow(1).getCell(1).value).toBe('A');
    expect(ws.getRow(2).getCell(2).value).toBe(1);
  });

  /**
   * Un `null` tiene que dejar la celda vacia de verdad. Con la cadena vacia que
   * se usaba antes, el hueco entraba en la tabla de textos compartidos y Excel
   * lo trataba como contenido: la fila de totales del libro de facturas salia
   * con celdas "ocupadas" en las columnas que no aplican.
   */
  it('deja vacías las celdas null en vez de escribir cadena vacía', async () => {
    const ws = await leer(
      await buildExcel({
        sheetName: 'Prueba',
        headers: ['A', 'B', 'C'],
        rows: [['uno', null, 3]],
      }),
    );

    expect(ws.getRow(2).getCell(2).value).toBeNull();
    expect(ws.getRow(2).getCell(3).value).toBe(3);
  });

  it('conserva las fechas como fecha, no como texto', async () => {
    const ws = await leer(
      await buildExcel({
        sheetName: 'Prueba',
        headers: ['Fecha'],
        rows: [[new Date('2026-09-01T00:00:00Z')]],
        formatos: [FORMATO.FECHA],
      }),
    );

    expect(ws.getRow(2).getCell(1).value).toBeInstanceOf(Date);
    expect(ws.getRow(2).getCell(1).numFmt).toBe(FORMATO.FECHA);
  });

  it('aplica el formato por posición de columna, también en los totales', async () => {
    const ws = await leer(
      await buildExcel({
        sheetName: 'Prueba',
        headers: ['Concepto', 'Importe'],
        rows: [['uno', 120]],
        totales: ['TOTAL', 120],
        formatos: [undefined, FORMATO.EUROS],
      }),
    );

    expect(ws.getRow(2).getCell(1).numFmt).toBeUndefined();
    expect(ws.getRow(2).getCell(2).numFmt).toBe(FORMATO.EUROS);
    expect(ws.getRow(3).getCell(2).numFmt).toBe(FORMATO.EUROS);
    expect(ws.getRow(2).getCell(2).alignment?.horizontal).toBe('right');
  });

  it('sin formatos se comporta como antes (los exports existentes no cambian)', async () => {
    const ws = await leer(
      await buildExcel({
        sheetName: 'Sesiones',
        headers: ['Fecha', 'Estado'],
        rows: [['2/3/2026', 'PROGRAMADA']],
      }),
    );

    expect(ws.getRow(2).getCell(1).numFmt).toBeUndefined();
    expect(ws.getRow(2).getCell(1).value).toBe('2/3/2026');
  });
});
