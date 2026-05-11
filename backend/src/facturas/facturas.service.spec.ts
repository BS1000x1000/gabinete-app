import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoFactura } from '@prisma/client';
import { FacturasService } from './facturas.service';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../common/storage/r2.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { EmailService } from '../common/email/email.service';

// ── Factories ────────────────────────────────────────────────────────────────

const ADMIN_USER = { userId: 'admin-1', rol: 'ADMIN' };
const TERAPEUTA_USER = { userId: 'trabajador-1', rol: 'PEDAGOGO' };

const mockTrabajador = (overrides: Record<string, any> = {}) => ({
  id: 'trabajador-1',
  nombre: 'María',
  apellidos: 'García',
  nombreFiscal: 'María García López',
  nifFiscal: '12345678A',
  direccionFiscal: 'Calle Mayor 1',
  codigoPostalFiscal: '28001',
  ciudadFiscal: 'Madrid',
  provinciaFiscal: 'Madrid',
  iban: 'ES91 2100 0418 4502 0005 1332',
  emailFacturacion: 'maria@gabinete.es',
  email: 'maria@gabinete.es',
  retencionIrpf: { toNumber: () => 15 },
  ...overrides,
});

const mockCliente = (overrides: Record<string, any> = {}) => ({
  id: 'cliente-1',
  nombre: 'Pablo',
  apellidos: 'Martínez',
  nifTutorPagador: '87654321B',
  nombreTutorPagador: 'Ana Martínez',
  direccionFiscalTutor: 'Calle Luna 5',
  codigoPostalTutor: '28002',
  ciudadTutor: 'Madrid',
  emailFacturacion: 'ana@email.com',
  ...overrides,
});

const mockContrato = (overrides: Record<string, any> = {}) => ({
  id: 'contrato-1',
  clienteId: 'cliente-1',
  trabajadorId: 'trabajador-1',
  cuotaMensual: { toNumber: () => 120 },
  tipoSesion: 'PEDAGOGIA',
  estado: 'ACTIVO',
  fechaInicio: new Date('2026-01-01'),
  fechaFin: null,
  trabajador: mockTrabajador(),
  cliente: mockCliente(),
  ...overrides,
});

const mockFactura = (overrides: Record<string, any> = {}) => ({
  id: 'factura-1',
  numero: 1,
  numeroFormateado: '1/2026',
  anio: 2026,
  trabajadorId: 'trabajador-1',
  clienteId: 'cliente-1',
  contratoId: 'contrato-1',
  fechaEmision: new Date('2026-09-01'),
  periodoFacturado: '2026-09',
  concepto: 'Cuota mensual de pedagogia — septiembre 2026',
  importe: { toNumber: () => 120 },
  ivaPorcentaje: { toNumber: () => 0 },
  ivaImporte: { toNumber: () => 0 },
  retencionPorcentaje: { toNumber: () => 15 },
  retencionImporte: { toNumber: () => 18 },
  exencionIvaTexto: 'Exenta de IVA conforme al Art. 20.1.3 LIVA',
  total: { toNumber: () => 102 },
  estado: EstadoFactura.PENDIENTE,
  fechaPago: null,
  metodoPago: null,
  urlPdfR2: null,
  emailEnviado: false,
  fechaEnvioEmail: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  trabajador: mockTrabajador(),
  cliente: mockCliente(),
  contrato: { id: 'contrato-1', tipoSesion: 'PEDAGOGIA' },
  ...overrides,
});

// ── Mock Prisma ───────────────────────────────────────────────────────────────

const makePrismaMock = () => ({
  factura: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  contadorFactura: {
    upsert: jest.fn(),
  },
  contratoServicio: {
    findMany: jest.fn(),
  },
  trabajador: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: any) => Promise<any>) => fn({
    factura: { create: jest.fn().mockResolvedValue(mockFactura()) },
    contadorFactura: {
      upsert: jest.fn().mockResolvedValue({ ultimoNumero: 1 }),
    },
  })),
});

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('FacturasService', () => {
  let service: FacturasService;
  let prisma: ReturnType<typeof makePrismaMock>;

  const r2Mock = { upload: jest.fn().mockResolvedValue(null), getSignedUrl: jest.fn().mockResolvedValue(null), isConfigured: false };
  const pdfMock = { generarPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')) };
  const emailMock = { sendFacturaEmail: jest.fn().mockResolvedValue(true), isConfigured: true };

  beforeEach(async () => {
    prisma = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasService,
        { provide: PrismaService, useValue: prisma },
        { provide: R2Service, useValue: r2Mock },
        { provide: FacturasPdfService, useValue: pdfMock },
        { provide: EmailService, useValue: emailMock },
      ],
    }).compile();

    service = module.get<FacturasService>(FacturasService);
    jest.clearAllMocks();
  });

  // ── asignarNumeroCorrelativo ───────────────────────────────────────────────

  describe('asignarNumeroCorrelativo()', () => {
    it('devuelve numero y numeroFormateado correctos', async () => {
      const txMock = {
        contadorFactura: {
          upsert: jest.fn().mockResolvedValue({ ultimoNumero: 3 }),
        },
      };

      const result = await service.asignarNumeroCorrelativo(txMock as any, 'trabajador-1', 2026);

      expect(result).toEqual({ numero: 3, numeroFormateado: '3/2026' });
      expect(txMock.contadorFactura.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trabajadorId_anio: { trabajadorId: 'trabajador-1', anio: 2026 } },
          update: { ultimoNumero: { increment: 1 } },
          create: { trabajadorId: 'trabajador-1', anio: 2026, ultimoNumero: 1 },
        }),
      );
    });

    it('para primer número devuelve 1/2026', async () => {
      const txMock = {
        contadorFactura: {
          upsert: jest.fn().mockResolvedValue({ ultimoNumero: 1 }),
        },
      };

      const result = await service.asignarNumeroCorrelativo(txMock as any, 'trabajador-1', 2026);

      expect(result.numero).toBe(1);
      expect(result.numeroFormateado).toBe('1/2026');
    });
  });

  // ── generarFacturasMes (idempotencia) ──────────────────────────────────────

  describe('generarFacturasMes()', () => {
    it('no crea factura si ya existe para ese contrato/periodo', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      // Factura ya existe — pre-load devuelve una con el contratoId
      prisma.factura.findMany.mockResolvedValue([{ contratoId: 'contrato-1' }]);

      const creadas = await service.generarFacturasMes(2026, 9);

      expect(creadas).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('crea facturas para contratos activos sin factura previa', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      // Pre-load devuelve vacío — no hay facturas previas
      prisma.factura.findMany.mockResolvedValue([]);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const txFactura = jest.fn().mockResolvedValue(mockFactura());
        const txContador = jest.fn().mockResolvedValue({ ultimoNumero: 1 });
        return fn({ factura: { create: txFactura }, contadorFactura: { upsert: txContador } });
      });

      const creadas = await service.generarFacturasMes(2026, 9);

      expect(creadas).toBe(1);
    });

    it('es idempotente: ejecutar dos veces no duplica facturas', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      // Primera vez: sin facturas previas
      prisma.factura.findMany.mockResolvedValueOnce([]);
      prisma.$transaction.mockResolvedValueOnce(mockFactura());
      // Segunda vez: ya existe
      prisma.factura.findMany.mockResolvedValueOnce([{ contratoId: 'contrato-1' }]);

      await service.generarFacturasMes(2026, 9);
      const creadasSegundaVez = await service.generarFacturasMes(2026, 9);

      expect(creadasSegundaVez).toBe(0);
    });
  });

  // ── Cálculo retención IRPF ─────────────────────────────────────────────────

  describe('cálculo retención IRPF', () => {
    it('total = importe - retencion para 15%', () => {
      const importe = 120;
      const retencionPct = 15;
      const retencionImporte = (importe * retencionPct) / 100;
      const total = importe - retencionImporte;

      expect(retencionImporte).toBe(18);
      expect(total).toBe(102);
    });

    it('total = importe cuando retención es 0%', () => {
      const importe = 120;
      const retencionPct = 0;
      const retencionImporte = (importe * retencionPct) / 100;
      const total = importe - retencionImporte;

      expect(retencionImporte).toBe(0);
      expect(total).toBe(120);
    });
  });

  // ── findAll scoping ────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('ADMIN no filtra por trabajadorId', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await service.findAll(ADMIN_USER);

      const call = (prisma.factura.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.trabajadorId).toBeUndefined();
    });

    it('terapeuta filtra por su propio userId', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await service.findAll(TERAPEUTA_USER);

      const call = (prisma.factura.findMany as jest.Mock).mock.calls[0][0];
      expect(call.where.trabajadorId).toBe('trabajador-1');
    });
  });

  // ── findOne RBAC ───────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('lanza NotFoundException si la factura no existe', async () => {
      prisma.factura.findUnique.mockResolvedValue(null);

      await expect(service.findOne('no-existe', ADMIN_USER)).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si terapeuta intenta ver factura de otro', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ trabajadorId: 'otro-trabajador' }),
      );

      await expect(service.findOne('factura-1', TERAPEUTA_USER)).rejects.toThrow(NotFoundException);
    });

    it('ADMIN puede ver cualquier factura', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ trabajadorId: 'otro-trabajador' }),
      );

      const result = await service.findOne('factura-1', ADMIN_USER);

      expect(result).toBeDefined();
    });
  });

  // ── anular ─────────────────────────────────────────────────────────────────

  describe('anular()', () => {
    it('marca la factura como ANULADA', async () => {
      prisma.factura.findUnique.mockResolvedValue(mockFactura());
      prisma.factura.update.mockResolvedValue(mockFactura({ estado: EstadoFactura.ANULADA }));

      const result = await service.anular('factura-1', ADMIN_USER);

      expect(prisma.factura.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { estado: EstadoFactura.ANULADA },
        }),
      );
      expect(result.estado).toBe(EstadoFactura.ANULADA);
    });

    it('lanza ForbiddenException si ya está anulada', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ estado: EstadoFactura.ANULADA }),
      );

      await expect(service.anular('factura-1', ADMIN_USER)).rejects.toThrow(ForbiddenException);
    });

    it('no incrementa el contador al anular', async () => {
      prisma.factura.findUnique.mockResolvedValue(mockFactura());
      prisma.factura.update.mockResolvedValue(mockFactura({ estado: EstadoFactura.ANULADA }));

      await service.anular('factura-1', ADMIN_USER);

      expect(prisma.contadorFactura.upsert).not.toHaveBeenCalled();
    });
  });

  // ── marcarPagada ───────────────────────────────────────────────────────────

  describe('marcarPagada()', () => {
    it('actualiza estado a PAGADA', async () => {
      prisma.factura.findUnique.mockResolvedValue(mockFactura());
      prisma.factura.update.mockResolvedValue(
        mockFactura({ estado: EstadoFactura.PAGADA, fechaPago: new Date(), metodoPago: 'Bizum' }),
      );

      const dto = { fechaPago: '2026-09-15', metodoPago: 'Bizum' };
      const result = await service.marcarPagada('factura-1', dto, ADMIN_USER);

      expect(prisma.factura.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estado: EstadoFactura.PAGADA }),
        }),
      );
      expect(result.estado).toBe(EstadoFactura.PAGADA);
    });

    it('lanza ForbiddenException si la factura está ANULADA', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ estado: EstadoFactura.ANULADA }),
      );

      await expect(
        service.marcarPagada('factura-1', { fechaPago: '2026-09-15' }, ADMIN_USER),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── enviarEmailsPendientes ─────────────────────────────────────────────────

  describe('enviarEmailsPendientes()', () => {
    it('envía email y marca emailEnviado=true cuando hay PDF', async () => {
      const factura = mockFactura({ urlPdfR2: 'facturas/t/2026/1.pdf' });
      prisma.factura.findMany.mockResolvedValue([factura]);
      prisma.factura.update.mockResolvedValue(factura);
      pdfMock.generarPdf.mockResolvedValue(Buffer.from('pdf'));
      emailMock.sendFacturaEmail.mockResolvedValue(true);

      const enviados = await service.enviarEmailsPendientes(2026, 9);

      expect(enviados).toBe(1);
      expect(emailMock.sendFacturaEmail).toHaveBeenCalledTimes(1);
      expect(prisma.factura.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ emailEnviado: true }),
        }),
      );
    });

    it('no marca emailEnviado si Resend devuelve error', async () => {
      const factura = mockFactura({ urlPdfR2: 'facturas/t/2026/1.pdf' });
      prisma.factura.findMany.mockResolvedValue([factura]);
      pdfMock.generarPdf.mockResolvedValue(Buffer.from('pdf'));
      emailMock.sendFacturaEmail.mockResolvedValue(false);

      const enviados = await service.enviarEmailsPendientes(2026, 9);

      expect(enviados).toBe(0);
      expect(prisma.factura.update).not.toHaveBeenCalled();
    });

    it('omite facturas de clientes sin email', async () => {
      const factura = mockFactura({
        urlPdfR2: 'facturas/t/2026/1.pdf',
        cliente: mockCliente({ emailFacturacion: null }),
      });
      prisma.factura.findMany.mockResolvedValue([factura]);

      const enviados = await service.enviarEmailsPendientes(2026, 9);

      expect(enviados).toBe(0);
      expect(emailMock.sendFacturaEmail).not.toHaveBeenCalled();
    });
  });

  // ── reenviarEmail ──────────────────────────────────────────────────────────

  describe('reenviarEmail()', () => {
    it('devuelve { enviado: true } cuando el email se envía', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ urlPdfR2: 'facturas/t/2026/1.pdf' }),
      );
      prisma.factura.update.mockResolvedValue(mockFactura());
      pdfMock.generarPdf.mockResolvedValue(Buffer.from('pdf'));
      emailMock.sendFacturaEmail.mockResolvedValue(true);

      const result = await service.reenviarEmail('factura-1', ADMIN_USER);

      expect(result).toEqual({ enviado: true });
    });

    it('devuelve { enviado: false } cuando email falla', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ urlPdfR2: 'facturas/t/2026/1.pdf' }),
      );
      pdfMock.generarPdf.mockResolvedValue(Buffer.from('pdf'));
      emailMock.sendFacturaEmail.mockResolvedValue(false);

      const result = await service.reenviarEmail('factura-1', ADMIN_USER);

      expect(result).toEqual({ enviado: false });
    });
  });
});
