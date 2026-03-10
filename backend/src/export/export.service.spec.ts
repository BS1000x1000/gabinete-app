import { Test, TestingModule } from '@nestjs/testing';
import { ExportService, ExportResult } from './export.service';
import { PrismaService } from '../prisma/prisma.service';
import { PdfGeneratorService } from '../common/pdf/pdf-generator.service';
import { ExportFormato } from './dto/export-query.dto';

// ─── Mock factories ───────────────────────────────────────────────────────────

const makePrismaMock = () => ({
  sesion: { findMany: jest.fn() },
  cliente: { findUnique: jest.fn() },
  bono: { findMany: jest.fn() },
});

const makePdfMock = () => ({
  generatePdf: jest.fn().mockResolvedValue(Buffer.from('%PDF')),
});

const mockCliente = () => ({ nombre: 'Ana', apellidos: 'García' });

const mockSesion = (overrides: Record<string, any> = {}) => ({
  id: 'sesion-1',
  fechaHoraInicio: new Date('2026-03-10T09:00:00'),
  fechaHoraFin: new Date('2026-03-10T10:00:00'),
  estado: 'COMPLETADA',
  tipoSesion: 'PEDAGOGIA',
  bono: null,
  ...overrides,
});

const mockBono = (overrides: Record<string, any> = {}) => ({
  id: 'bono-1',
  fechaInicio: new Date('2026-01-01'),
  fechaFin: new Date('2026-06-30'),
  sesionesConsumidas: 5,
  totalSesiones: 10,
  precio: 200,
  estado: 'ACTIVO',
  pagado: false,
  cliente: { nombre: 'Ana', apellidos: 'García' },
  ...overrides,
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('ExportService', () => {
  let service: ExportService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let pdfGenerator: ReturnType<typeof makePdfMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();
    pdfGenerator = makePdfMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        { provide: PrismaService, useValue: prisma },
        { provide: PdfGeneratorService, useValue: pdfGenerator },
      ],
    }).compile();

    service = module.get<ExportService>(ExportService);
  });

  // ── exportSesiones — PDF ─────────────────────────────────────────────────
  describe('exportSesiones() — formato PDF', () => {
    beforeEach(() => {
      prisma.sesion.findMany.mockResolvedValue([mockSesion()]);
      prisma.cliente.findUnique.mockResolvedValue(mockCliente());
    });

    it('devuelve contentType application/pdf', async () => {
      const result: ExportResult = await service.exportSesiones('cliente-1', { formato: ExportFormato.PDF });
      expect(result.contentType).toBe('application/pdf');
    });

    it('devuelve filename sesiones_{clienteId}.pdf', async () => {
      const result = await service.exportSesiones('cliente-1', { formato: ExportFormato.PDF });
      expect(result.filename).toBe('sesiones_cliente-1.pdf');
    });

    it('llama a pdfGenerator.generatePdf con HTML que contiene el nombre del cliente', async () => {
      await service.exportSesiones('cliente-1', { formato: ExportFormato.PDF });
      expect(pdfGenerator.generatePdf).toHaveBeenCalledWith(
        expect.stringContaining('García'),
      );
    });

    it('devuelve el buffer generado por pdfGenerator', async () => {
      const buffer = Buffer.from('%PDF-test');
      pdfGenerator.generatePdf.mockResolvedValue(buffer);
      const result = await service.exportSesiones('cliente-1', { formato: ExportFormato.PDF });
      expect(result.buffer).toBe(buffer);
    });

    it('consulta sesiones filtrando por clienteId', async () => {
      await service.exportSesiones('cliente-1', { formato: ExportFormato.PDF });
      expect(prisma.sesion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ clienteId: 'cliente-1' }) }),
      );
    });

    it('añade filtro de rango de fechas cuando se proporcionan desde/hasta', async () => {
      await service.exportSesiones('cliente-1', {
        formato: ExportFormato.PDF,
        desde: '2026-01-01',
        hasta: '2026-03-31',
      });
      expect(prisma.sesion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fechaHoraInicio: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
          }),
        }),
      );
    });
  });

  // ── exportSesiones — Excel ───────────────────────────────────────────────
  describe('exportSesiones() — formato Excel', () => {
    beforeEach(() => {
      prisma.sesion.findMany.mockResolvedValue([mockSesion()]);
      prisma.cliente.findUnique.mockResolvedValue(mockCliente());
    });

    it('devuelve contentType openxmlformats spreadsheet', async () => {
      const result = await service.exportSesiones('cliente-1', { formato: ExportFormato.EXCEL });
      expect(result.contentType).toContain('openxmlformats');
    });

    it('devuelve filename sesiones_{clienteId}.xlsx', async () => {
      const result = await service.exportSesiones('cliente-1', { formato: ExportFormato.EXCEL });
      expect(result.filename).toBe('sesiones_cliente-1.xlsx');
    });

    it('NO llama a pdfGenerator para Excel', async () => {
      await service.exportSesiones('cliente-1', { formato: ExportFormato.EXCEL });
      expect(pdfGenerator.generatePdf).not.toHaveBeenCalled();
    });

    it('devuelve un Buffer no vacío', async () => {
      const result = await service.exportSesiones('cliente-1', { formato: ExportFormato.EXCEL });
      expect(result.buffer.length).toBeGreaterThan(0);
    });
  });

  // ── exportBonos — PDF con clienteId ─────────────────────────────────────
  describe('exportBonos() — con clienteId', () => {
    beforeEach(() => {
      prisma.bono.findMany.mockResolvedValue([mockBono()]);
    });

    it('filtra bonos por clienteId', async () => {
      await service.exportBonos('cliente-1', { formato: ExportFormato.PDF });
      expect(prisma.bono.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ clienteId: 'cliente-1' }) }),
      );
    });

    it('devuelve filename bonos_{clienteId}.pdf', async () => {
      const result = await service.exportBonos('cliente-1', { formato: ExportFormato.PDF });
      expect(result.filename).toBe('bonos_cliente-1.pdf');
    });

    it('devuelve filename bonos_{clienteId}.xlsx para Excel', async () => {
      const result = await service.exportBonos('cliente-1', { formato: ExportFormato.EXCEL });
      expect(result.filename).toBe('bonos_cliente-1.xlsx');
    });
  });

  // ── exportBonos — PDF global (clienteId null) ────────────────────────────
  describe('exportBonos() — exportación global (clienteId null)', () => {
    beforeEach(() => {
      prisma.bono.findMany.mockResolvedValue([mockBono(), mockBono({ id: 'bono-2' })]);
    });

    it('NO filtra por clienteId cuando es null', async () => {
      await service.exportBonos(null, { formato: ExportFormato.PDF });
      expect(prisma.bono.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.not.objectContaining({ clienteId: expect.anything() }) }),
      );
    });

    it('devuelve filename bonos.pdf cuando clienteId es null', async () => {
      const result = await service.exportBonos(null, { formato: ExportFormato.PDF });
      expect(result.filename).toBe('bonos.pdf');
    });

    it('devuelve filename bonos.xlsx para Excel cuando clienteId es null', async () => {
      const result = await service.exportBonos(null, { formato: ExportFormato.EXCEL });
      expect(result.filename).toBe('bonos.xlsx');
    });

    it('incluye todos los bonos en el HTML generado', async () => {
      await service.exportBonos(null, { formato: ExportFormato.PDF });
      expect(pdfGenerator.generatePdf).toHaveBeenCalledWith(
        expect.stringContaining('Todos los clientes'),
      );
    });
  });

  // ── exportBonos — rango de fechas ────────────────────────────────────────
  describe('exportBonos() — rango de fechas', () => {
    it('añade filtro fechaInicio cuando se pasan desde/hasta', async () => {
      prisma.bono.findMany.mockResolvedValue([]);
      await service.exportBonos(null, {
        formato: ExportFormato.PDF,
        desde: '2026-01-01',
        hasta: '2026-03-31',
      });
      expect(prisma.bono.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            fechaInicio: expect.objectContaining({ gte: expect.any(Date) }),
          }),
        }),
      );
    });
  });
});
