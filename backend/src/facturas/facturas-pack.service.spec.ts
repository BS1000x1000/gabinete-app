import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { FacturasPackService } from './facturas-pack.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { FacturasPdfService } from './facturas-pdf.service';

// ── Factories ────────────────────────────────────────────────────────────────

const dec = (n: number) => ({ toNumber: () => n });

const mockFactura = (over: Record<string, any> = {}): any => ({
  id: 'f-1',
  numero: 12,
  numeroFormateado: '12/2026',
  anio: 2026,
  trabajadorId: 'trabajador-1',
  clienteId: 'cliente-1',
  contratoId: 'contrato-1',
  fechaEmision: new Date('2026-07-01T10:00:00Z'),
  periodoFacturado: '2026-07',
  concepto: 'Cuota mensual de pedagogia — julio de 2026',
  importe: dec(120),
  ivaPorcentaje: dec(0),
  ivaImporte: dec(0),
  retencionPorcentaje: dec(0),
  retencionImporte: dec(0),
  total: dec(120),
  estado: 'PENDIENTE',
  fechaPago: null,
  metodoPago: null,
  urlPdfR2: 'facturas/trabajador-1/2026/12.pdf',
  trabajador: { nifFiscal: '12345678A', nombre: 'María', apellidos: 'García' },
  cliente: {
    nombre: 'Pablo',
    apellidos: 'Martínez',
    nombreTutorPagador: 'Ana Martínez Ruiz',
    nifTutorPagador: '87654321B',
  },
  ...over,
});

const makePrismaMock = () => ({
  factura: { findMany: jest.fn().mockResolvedValue([]) },
});

/** Lee de vuelta el xlsx generado para poder afirmar sobre las filas de verdad. */
async function leerHoja(buffer: Buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as any);
  const ws = wb.worksheets[0];
  const filas: any[][] = [];
  ws.eachRow((row) => filas.push((row.values as any[]).slice(1)));
  return { nombre: ws.name, filas };
}

describe('FacturasPackService', () => {
  let service: FacturasPackService;
  let prisma: ReturnType<typeof makePrismaMock>;

  const storageMock = { download: jest.fn(), isConfigured: true };
  const pdfMock = { generarPdf: jest.fn() };

  const ADMIN = { userId: 'admin-1', rol: 'ADMIN' };
  const TERAPEUTA = { userId: 'trabajador-1', rol: 'PEDAGOGO' };

  beforeEach(async () => {
    prisma = makePrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasPackService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storageMock },
        { provide: FacturasPdfService, useValue: pdfMock },
      ],
    }).compile();

    service = module.get(FacturasPackService);
    jest.clearAllMocks();
    storageMock.download.mockResolvedValue(Buffer.from('%PDF-fake'));
    pdfMock.generarPdf.mockResolvedValue(Buffer.from('%PDF-regenerado'));
  });

  // ── Selección ──────────────────────────────────────────────────────────────

  describe('facturasDeLaSeleccion()', () => {
    it('un terapeuta solo puede empaquetar las suyas', async () => {
      prisma.factura.findMany.mockResolvedValue([mockFactura()]);

      await service.facturasDeLaSeleccion(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      const { where } = prisma.factura.findMany.mock.calls[0][0];
      expect(where.trabajadorId).toBe('trabajador-1');
      expect(where.periodoFacturado).toEqual({
        gte: '2026-07',
        lte: '2026-09',
      });
    });

    it('el ADMIN puede pedir sin filtro de trabajador', async () => {
      prisma.factura.findMany.mockResolvedValue([mockFactura()]);

      await service.facturasDeLaSeleccion(ADMIN, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-07',
      });

      const { where } = prisma.factura.findMany.mock.calls[0][0];
      expect(where.trabajadorId).toBeUndefined();
    });

    it('la selección explícita manda sobre el rango', async () => {
      prisma.factura.findMany.mockResolvedValue([mockFactura()]);

      await service.facturasDeLaSeleccion(TERAPEUTA, {
        ids: ['f-1', 'f-2'],
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      const { where } = prisma.factura.findMany.mock.calls[0][0];
      expect(where.id).toEqual({ in: ['f-1', 'f-2'] });
      expect(where.periodoFacturado).toBeUndefined();
    });

    it('sin rango ni ids → 400', async () => {
      await expect(
        service.facturasDeLaSeleccion(TERAPEUTA, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('rango invertido → 400', async () => {
      await expect(
        service.facturasDeLaSeleccion(TERAPEUTA, {
          periodoDesde: '2026-09',
          periodoHasta: '2026-07',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('selección vacía → 400', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await expect(
        service.facturasDeLaSeleccion(TERAPEUTA, { ids: ['no-existe'] }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Libro de facturas emitidas ─────────────────────────────────────────────

  describe('construirLibro()', () => {
    /**
     * Las anuladas van en el libro pero no suman: si se omitieran, el gestor
     * vería un salto en la numeración correlativa sin explicación.
     */
    it('incluye las anuladas y las deja fuera de los totales', async () => {
      const facturas = [
        mockFactura({ numero: 12, total: dec(120), importe: dec(120) }),
        mockFactura({
          id: 'f-2',
          numero: 13,
          numeroFormateado: '13/2026',
          estado: 'ANULADA',
          total: dec(999),
          importe: dec(999),
        }),
      ];

      const libro = await service.construirLibro(facturas as any);
      const { filas } = await leerHoja(libro.buffer);

      // cabecera + 2 facturas + totales
      expect(filas).toHaveLength(4);
      expect(filas[2][0]).toBe('13/2026');
      expect(filas[2][12]).toBe('ANULADA');

      const totales = filas[3];
      expect(totales[0]).toBe('TOTAL');
      expect(totales[3]).toBe('1 factura');
      expect(totales[11]).toBe(120);
    });

    it('usa el tutor pagador como destinatario, no al menor', async () => {
      const libro = await service.construirLibro([mockFactura()] as any);
      const { filas } = await leerHoja(libro.buffer);

      expect(filas[1][3]).toBe('Ana Martínez Ruiz');
      expect(filas[1][4]).toBe('87654321B');
    });

    it('deja el destinatario vacío en vez de nombrar al menor sin tutor pagador', async () => {
      const f = mockFactura({
        cliente: {
          nombre: 'Pablo',
          apellidos: 'Martínez',
          nombreTutorPagador: null,
          nifTutorPagador: null,
        },
      });

      const libro = await service.construirLibro([f] as any);
      const { filas } = await leerHoja(libro.buffer);

      expect(filas[1][3]).toBeUndefined();
      expect(filas[1][4]).toBeUndefined();
    });

    it('escribe las fechas como fecha y no como texto, para poder ordenar', async () => {
      const libro = await service.construirLibro([mockFactura()] as any);
      const { filas } = await leerHoja(libro.buffer);

      expect(filas[1][1]).toBeInstanceOf(Date);
    });

    it('pluraliza la fila de totales', async () => {
      const facturas = [mockFactura(), mockFactura({ id: 'f-2', numero: 13 })];
      const libro = await service.construirLibro(facturas as any);
      const { filas } = await leerHoja(libro.buffer);

      expect(filas[3][3]).toBe('2 facturas');
    });
  });

  // ── Resumen / previsualización ─────────────────────────────────────────────

  describe('resumen()', () => {
    it('nombra el pack por trimestre cuando el rango cae dentro de uno', () => {
      const facturas = [
        mockFactura({ periodoFacturado: '2026-07' }),
        mockFactura({ id: 'f-2', numero: 13, periodoFacturado: '2026-09' }),
      ];

      const r = service.resumen(facturas as any);

      expect(r.filename).toBe('facturas_12345678A_2026-3T.zip');
      expect(r.numFacturas).toBe(2);
      expect(r.totalImporte).toBe(240);
    });

    it('nombra por el año cuando cubre enero a diciembre', () => {
      const facturas = [
        mockFactura({ periodoFacturado: '2026-01' }),
        mockFactura({ id: 'f-2', numero: 13, periodoFacturado: '2026-12' }),
      ];

      expect(service.resumen(facturas as any).filename).toBe(
        'facturas_12345678A_2026.zip',
      );
    });

    it('los ficheros llevan el número delante y el tutor pagador saneado', () => {
      const r = service.resumen([mockFactura()] as any);

      expect(r.ficheros).toEqual([
        'resumen-facturas_2026-07.xlsx',
        '0012_2026-07_Ana-Martínez-Ruiz.pdf',
      ]);
    });

    it('nombra el PDF sin el menor cuando falta el tutor pagador', () => {
      const f = mockFactura({
        cliente: {
          nombre: 'Pablo',
          apellidos: 'Martínez',
          nombreTutorPagador: null,
          nifTutorPagador: null,
        },
      });

      expect(service.resumen([f] as any).ficheros[1]).toBe(
        '0012_2026-07_sin-destinatario.pdf',
      );
    });

    it('lo anulado no cuenta en el importe del resumen', () => {
      const facturas = [
        mockFactura(),
        mockFactura({ id: 'f-2', estado: 'ANULADA', total: dec(999) }),
      ];

      expect(service.resumen(facturas as any).totalImporte).toBe(120);
    });
  });

  // ── Pack ───────────────────────────────────────────────────────────────────

  describe('construirPack()', () => {
    it('lee los PDF del almacenamiento sin lanzar Puppeteer', async () => {
      const pack = await service.construirPack([mockFactura()] as any);

      expect(storageMock.download).toHaveBeenCalledWith(
        'facturas/trabajador-1/2026/12.pdf',
      );
      expect(pdfMock.generarPdf).not.toHaveBeenCalled();
      expect(pack.contentType).toBe('application/zip');
      expect(pack.incidencias).toEqual([]);
      // Firma local de un zip
      expect(pack.buffer.subarray(0, 2).toString()).toBe('PK');
    });

    it('regenera el PDF solo cuando no está archivado', async () => {
      const pack = await service.construirPack([
        mockFactura({ urlPdfR2: null }),
      ] as any);

      expect(storageMock.download).not.toHaveBeenCalled();
      expect(pdfMock.generarPdf).toHaveBeenCalledTimes(1);
      expect(pack.incidencias).toEqual([]);
    });

    it('si el almacenamiento falla, tira de Puppeteer', async () => {
      storageMock.download.mockRejectedValue(new Error('NoSuchKey'));

      await service.construirPack([mockFactura()] as any);

      expect(pdfMock.generarPdf).toHaveBeenCalledTimes(1);
    });

    /** El pack se entrega igual, pero avisando de qué falta. */
    it('registra incidencia cuando no hay forma de obtener el PDF', async () => {
      storageMock.download.mockResolvedValue(null);
      pdfMock.generarPdf.mockRejectedValue(new Error('Chromium no arranca'));

      const pack = await service.construirPack([mockFactura()] as any);

      expect(pack.incidencias).toEqual([
        { numeroFormateado: '12/2026', motivo: 'No se pudo obtener el PDF' },
      ]);
      expect(pack.buffer.subarray(0, 2).toString()).toBe('PK');
    });
  });
});
