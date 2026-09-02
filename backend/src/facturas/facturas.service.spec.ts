import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoFactura } from '@prisma/client';
import { FacturasService } from './facturas.service';
import { periodoQueTocaFacturar } from './facturas-cron.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { EmailService } from '../common/email/email.service';
import { AuditService } from '../auth/audit.service';

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
  // Sesiones semanales del contrato: el divisor del prorrateo de julio.
  _count: { slots: 1 },
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
  sesion: {
    groupBy: jest.fn().mockResolvedValue([]),
  },
  trabajador: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((fn: (tx: any) => Promise<any>) =>
    fn({
      factura: { create: jest.fn().mockResolvedValue(mockFactura()) },
      contadorFactura: {
        upsert: jest.fn().mockResolvedValue({ ultimoNumero: 1 }),
      },
    }),
  ),
});

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('FacturasService', () => {
  let service: FacturasService;
  let prisma: ReturnType<typeof makePrismaMock>;

  const r2Mock = {
    upload: jest.fn().mockResolvedValue(null),
    getSignedUrl: jest.fn().mockResolvedValue(null),
    isConfigured: false,
  };
  const pdfMock = {
    generarPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')),
  };
  const emailMock = {
    sendFacturaEmail: jest.fn().mockResolvedValue(true),
    isConfigured: true,
  };
  const auditMock = { registrar: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    prisma = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: r2Mock },
        { provide: FacturasPdfService, useValue: pdfMock },
        { provide: EmailService, useValue: emailMock },
        { provide: AuditService, useValue: auditMock },
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

      const result = await service.asignarNumeroCorrelativo(
        txMock as any,
        'trabajador-1',
        2026,
      );

      expect(result).toEqual({ numero: 3, numeroFormateado: '3/2026' });
      expect(txMock.contadorFactura.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            trabajadorId_anio: { trabajadorId: 'trabajador-1', anio: 2026 },
          },
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

      const result = await service.asignarNumeroCorrelativo(
        txMock as any,
        'trabajador-1',
        2026,
      );

      expect(result.numero).toBe(1);
      expect(result.numeroFormateado).toBe('1/2026');
    });
  });

  // ── generarFacturasMes ─────────────────────────────────────────────────────

  /** Deja el `$transaction` devolviendo una factura y expone el `create` del tx. */
  const stubTransaccion = () => {
    const txCreate = jest.fn().mockResolvedValue(mockFactura());
    prisma.$transaction.mockImplementation(async (fn: any) =>
      fn({
        factura: { create: txCreate },
        contadorFactura: {
          upsert: jest.fn().mockResolvedValue({ ultimoNumero: 1 }),
        },
      }),
    );
    return txCreate;
  };

  describe('generarFacturasMes()', () => {
    it('no crea factura si ya existe para ese contrato/periodo', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      // Factura ya existe — pre-load devuelve una con el contratoId
      prisma.factura.findMany.mockResolvedValue([{ contratoId: 'contrato-1' }]);

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(0);
      expect(res.omitidas).toBe(1);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('crea facturas para contratos activos sin factura previa', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      // Pre-load devuelve vacío — no hay facturas previas
      prisma.factura.findMany.mockResolvedValue([]);
      stubTransaccion();

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(1);
      expect(res.periodo).toBe('2026-09');
      expect(res.fallidas).toEqual([]);
    });

    it('es idempotente: ejecutar dos veces no duplica facturas', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      // Primera vez: sin facturas previas
      prisma.factura.findMany.mockResolvedValueOnce([]);
      prisma.$transaction.mockResolvedValueOnce(mockFactura());
      // Segunda vez: ya existe
      prisma.factura.findMany.mockResolvedValueOnce([
        { contratoId: 'contrato-1' },
      ]);

      await service.generarFacturasMes(2026, 9);
      const segunda = await service.generarFacturasMes(2026, 9);

      expect(segunda.creadas).toBe(0);
    });

    /**
     * El estado del contrato se evalúa hoy, no en el mes pedido. Filtrando solo
     * por ACTIVO no se podía emitir la factura de marzo de un cliente que causó
     * baja en junio: quedaba sin facturar para siempre.
     */
    it('recupera un mes pasado de un contrato ya FINALIZADO', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);
      prisma.factura.findMany.mockResolvedValue([]);

      await service.generarFacturasMes(2026, 3);

      const where = prisma.contratoServicio.findMany.mock.calls[0][0].where;
      expect(where.estado).toEqual({ in: ['ACTIVO', 'FINALIZADO'] });
    });

    it('acota la generación a un trabajador cuando se le pasa', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);
      prisma.factura.findMany.mockResolvedValue([]);

      await service.generarFacturasMes(2026, 9, {
        trabajadorId: 'trabajador-7',
      });

      const where = prisma.contratoServicio.findMany.mock.calls[0][0].where;
      expect(where.trabajadorId).toBe('trabajador-7');
    });

    /**
     * La serie correlativa la marca la fecha de expedición, no el periodo que se
     * factura: numerar por el año del periodo hacía que recuperar 2025-03 hoy
     * cogiera un hueco de la serie 2025 y lo estampara con fecha de este año.
     */
    it('numera en la serie del año de emisión al recuperar un mes de otro año', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);
      const txCreate = stubTransaccion();
      const anioActual = new Date().getFullYear();

      await service.generarFacturasMes(anioActual - 1, 3);

      const { data } = txCreate.mock.calls[0][0];
      expect(data.anio).toBe(anioActual);
      expect(data.periodoFacturado).toBe(`${anioActual - 1}-03`);
    });

    /**
     * El concepto es fijo y describe el servicio real. El anterior nombraba el
     * tipo de terapia ("Cuota mensual de pedagogia"), asi que el libro que se
     * entrega a la gestoria revelaba que tratamiento recibe cada menor.
     */
    it('usa el concepto fijo del modelo, sin nombrar el tipo de terapia', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);
      const txCreate = stubTransaccion();

      await service.generarFacturasMes(2026, 9);

      const { data } = txCreate.mock.calls[0][0];
      expect(data.concepto).toBe(
        'Servicios profesionales de reeducación pedagógica y apoyo al aprendizaje adaptado al currículo escolar',
      );
      expect(data.concepto).not.toMatch(
        /pedagog[ií]a\s*$|logopedia|neuropsicolog/i,
      );
      // El mes viaja en el periodo, que es donde tiene que estar.
      expect(data.periodoFacturado).toBe('2026-09');
    });

    it('estampa la exención del 20.Uno.10, no la del 20.Uno.3', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);
      const txCreate = stubTransaccion();

      await service.generarFacturasMes(2026, 9);

      const { data } = txCreate.mock.calls[0][0];
      expect(data.exencionIvaTexto).toBe(
        'Factura exenta de I.V.A (Artículo 20. Uno. 10º. Ley 37/1992)',
      );
      expect(data.ivaPorcentaje).toBe(0);
      expect(data.ivaImporte).toBe(0);
    });

    it('rechaza un periodo futuro: quemaría números de una serie que no ha empezado', async () => {
      const anioFuturo = new Date().getFullYear() + 1;

      await expect(service.generarFacturasMes(anioFuturo, 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.contratoServicio.findMany).not.toHaveBeenCalled();
    });

    it('recoge los fallos en vez de perderlos en el log', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);
      prisma.$transaction.mockRejectedValue(new Error('BD caída'));

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(0);
      expect(res.fallidas).toEqual([
        {
          contratoId: 'contrato-1',
          cliente: 'Pablo Martínez',
          motivo: 'BD caída',
        },
      ]);
    });

    it('deja rastro en el audit log', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([]);
      prisma.factura.findMany.mockResolvedValue([]);

      await service.generarFacturasMes(2026, 9, {
        user: { userId: 'admin-1' },
      });

      expect(auditMock.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          evento: 'FACTURA_GENERACION',
          recurso: '2026-09',
        }),
      );
    });
  });

  // ── Datos fiscales del destinatario ────────────────────────────────────────

  describe('datos fiscales del tutor pagador', () => {
    /**
     * Una factura sin nombre y NIF del destinatario no es valida, y ademas quema
     * un numero de la serie correlativa que anular no libera. Se corta antes de
     * llegar a la transaccion.
     */
    it('no emite ni numera si falta el NIF del tutor pagador', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ cliente: mockCliente({ nifTutorPagador: '  ' }) }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(res.fallidas).toEqual([
        {
          contratoId: 'contrato-1',
          cliente: 'Pablo Martínez',
          motivo: expect.stringContaining('NIF del tutor pagador'),
        },
      ]);
    });

    /**
     * El emisor tambien es obligatorio (RD 1619/2012 art. 6), y hasta ahora solo
     * se validaba el destinatario: una ficha fiscal a medias emitia igual, con el
     * bloque del emisor en blanco en el PDF, y quemaba un numero de la serie.
     */
    it('no emite ni numera si falta el NIF fiscal de la profesional', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ trabajador: mockTrabajador({ nifFiscal: null }) }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(res.fallidas).toEqual([
        {
          contratoId: 'contrato-1',
          cliente: 'Pablo Martínez',
          motivo: expect.stringContaining('NIF fiscal'),
        },
      ]);
    });

    it('no emite si el domicilio fiscal de la profesional esta incompleto', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ trabajador: mockTrabajador({ ciudadFiscal: '  ' }) }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(res.fallidas[0].motivo).toContain('domicilio fiscal');
    });

    it('un contrato sin datos no impide facturar al resto', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ cliente: mockCliente({ nombreTutorPagador: null }) }),
        mockContrato({ id: 'contrato-2' }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          factura: { create: jest.fn().mockResolvedValue(mockFactura()) },
          contadorFactura: {
            upsert: jest.fn().mockResolvedValue({ ultimoNumero: 1 }),
          },
        }),
      );

      const res = await service.generarFacturasMes(2026, 9);

      expect(res.creadas).toBe(1);
      expect(res.fallidas).toHaveLength(1);
    });
  });

  // ── calendario de facturación (cláusula 3 del contrato) ────────────────────

  describe('julio y agosto', () => {
    it('agosto no se factura y explica por qué', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);

      const res = await service.generarFacturasMes(2026, 8);

      expect(res.creadas).toBe(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(res.fallidas[0].motivo).toContain('Agosto no se factura');
    });

    /**
     * Julio depende de sesiones que el día 1 todavía no se han dado: emitirlo
     * entonces daría facturas de 0,00 € con el número de serie ya quemado.
     */
    it('rechaza julio mientras julio no ha terminado', async () => {
      const anioActual = new Date().getFullYear();
      const enJulio = new Date(anioActual, 6, 1);
      jest.useFakeTimers().setSystemTime(enJulio);

      await expect(service.generarFacturasMes(anioActual, 7)).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.contratoServicio.findMany).not.toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('prorratea julio por sesiones impartidas', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ cuotaMensual: { toNumber: () => 180 } }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);
      // 2 sesiones impartidas de las 4 que cubre la cuota
      prisma.sesion.groupBy.mockResolvedValue([
        { contratoId: 'contrato-1', _count: { _all: 2 } },
      ]);
      const txCreate = stubTransaccion();

      await service.generarFacturasMes(2025, 7);

      const { data } = txCreate.mock.calls[0][0];
      expect(data.importe).toBe(90);
      expect(data.total).toBe(90);
    });

    it('julio sin sesiones impartidas se factura a cero, no a cuota entera', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);
      prisma.sesion.groupBy.mockResolvedValue([]);
      const txCreate = stubTransaccion();

      await service.generarFacturasMes(2025, 7);

      expect(txCreate.mock.calls[0][0].data.importe).toBe(0);
    });

    it('el divisor crece con las sesiones semanales del contrato', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({
          cuotaMensual: { toNumber: () => 360 },
          _count: { slots: 2 },
        }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);
      // 360 / (2 slots * 4) = 45 €/sesión; 3 sesiones -> 135 €
      prisma.sesion.groupBy.mockResolvedValue([
        { contratoId: 'contrato-1', _count: { _all: 3 } },
      ]);
      const txCreate = stubTransaccion();

      await service.generarFacturasMes(2025, 7);

      expect(txCreate.mock.calls[0][0].data.importe).toBe(135);
    });

    it('un mes normal sigue cobrando la cuota entera', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);
      const txCreate = stubTransaccion();

      await service.generarFacturasMes(2026, 9);

      expect(txCreate.mock.calls[0][0].data.importe).toBe(120);
      expect(prisma.sesion.groupBy).not.toHaveBeenCalled();
    });
  });

  describe('periodoQueTocaFacturar()', () => {
    it('el 1 de julio no emite nada: julio va a mes vencido', () => {
      expect(periodoQueTocaFacturar(new Date(2027, 6, 1))).toBeNull();
    });

    it('el 1 de agosto emite JULIO, ya cerrado', () => {
      expect(periodoQueTocaFacturar(new Date(2027, 7, 1))).toEqual({
        anio: 2027,
        mes: 7,
      });
    });

    it('el resto del año emite el mes en curso, por adelantado', () => {
      expect(periodoQueTocaFacturar(new Date(2026, 8, 1))).toEqual({
        anio: 2026,
        mes: 9,
      });
    });
  });

  // ── previsualizarGeneracionMes ─────────────────────────────────────────────

  describe('previsualizarGeneracionMes()', () => {
    it('lista lo que se generaría sin escribir nada', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([]);

      const preview = await service.previsualizarGeneracionMes(2026, 9);

      expect(preview.periodo).toBe('2026-09');
      expect(preview.importeTotal).toBe(120);
      expect(preview.yaFacturadas).toBe(0);
      expect(preview.aGenerar).toEqual([
        {
          contratoId: 'contrato-1',
          cliente: 'Pablo Martínez',
          trabajador: 'María García',
          tipoSesion: 'PEDAGOGIA',
          importe: 120,
        },
      ]);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('cuenta como ya facturados los contratos que tienen factura del periodo', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([mockContrato()]);
      prisma.factura.findMany.mockResolvedValue([{ contratoId: 'contrato-1' }]);

      const preview = await service.previsualizarGeneracionMes(2026, 9);

      expect(preview.aGenerar).toEqual([]);
      expect(preview.yaFacturadas).toBe(1);
    });

    it('separa los contratos sin datos fiscales del pagador y no los suma', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ cliente: mockCliente({ nifTutorPagador: null }) }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);

      const preview = await service.previsualizarGeneracionMes(2026, 9);

      expect(preview.aGenerar).toEqual([]);
      expect(preview.yaFacturadas).toBe(0);
      expect(preview.importeTotal).toBe(0);
      expect(preview.bloqueadas).toEqual([
        {
          contratoId: 'contrato-1',
          cliente: 'Pablo Martínez',
          motivo: expect.stringContaining('NIF del tutor pagador'),
        },
      ]);
    });
  });

  // ── reconciliarPdfsPendientes ──────────────────────────────────────────────

  describe('reconciliarPdfsPendientes()', () => {
    it('no hace nada si no hay almacenamiento configurado', async () => {
      const recuperadas = await service.reconciliarPdfsPendientes();

      expect(recuperadas).toBe(0);
      expect(prisma.factura.findMany).not.toHaveBeenCalled();
    });
  });

  // ── Cálculo retención IRPF ─────────────────────────────────────────────────

  describe('retención IRPF', () => {
    /**
     * El receptor de la factura es el tutor pagador, un particular, y un
     * particular no practica retención. El trabajador del mock tiene un 15%
     * configurado en su ficha: la factura debe salir igual sin retener.
     */
    it('no retiene aunque el trabajador tenga retencionIrpf configurada', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        mockContrato({ cuotaMensual: { toNumber: () => 120 } }),
      ]);
      prisma.factura.findMany.mockResolvedValue([]);

      const txCreate = jest.fn().mockResolvedValue(mockFactura());
      prisma.$transaction.mockImplementation(async (fn: any) =>
        fn({
          factura: { create: txCreate },
          contadorFactura: {
            upsert: jest.fn().mockResolvedValue({ ultimoNumero: 1 }),
          },
        }),
      );

      await service.generarFacturasMes(2026, 9);

      const { data } = txCreate.mock.calls[0][0];
      expect(data.retencionPorcentaje).toBe(0);
      expect(data.retencionImporte).toBe(0);
      expect(data.importe).toBe(120);
      expect(data.total).toBe(120);
    });
  });

  // ── findAll scoping ────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('ADMIN no filtra por trabajadorId', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await service.findAll(ADMIN_USER);

      const call = prisma.factura.findMany.mock.calls[0][0];
      expect(call.where.trabajadorId).toBeUndefined();
    });

    it('terapeuta filtra por su propio userId', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await service.findAll(TERAPEUTA_USER);

      const call = prisma.factura.findMany.mock.calls[0][0];
      expect(call.where.trabajadorId).toBe('trabajador-1');
    });

    /**
     * El ADMIN tambien es un autonomo: "Mis facturas" y "Mis ingresos" son
     * suyas, no del gabinete. La vista global es Supervision, que llama sin
     * el flag.
     */
    it('ADMIN con soloMias filtra por su propio userId', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await service.findAll(ADMIN_USER, { soloMias: true });

      const call = prisma.factura.findMany.mock.calls[0][0];
      expect(call.where.trabajadorId).toBe('admin-1');
    });

    it('terapeuta sin soloMias sigue viendo solo las suyas', async () => {
      prisma.factura.findMany.mockResolvedValue([]);

      await service.findAll(TERAPEUTA_USER, { soloMias: false });

      const call = prisma.factura.findMany.mock.calls[0][0];
      expect(call.where.trabajadorId).toBe('trabajador-1');
    });
  });

  // ── findOne RBAC ───────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('lanza NotFoundException si la factura no existe', async () => {
      prisma.factura.findUnique.mockResolvedValue(null);

      await expect(service.findOne('no-existe', ADMIN_USER)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFoundException si terapeuta intenta ver factura de otro', async () => {
      prisma.factura.findUnique.mockResolvedValue(
        mockFactura({ trabajadorId: 'otro-trabajador' }),
      );

      await expect(
        service.findOne('factura-1', TERAPEUTA_USER),
      ).rejects.toThrow(NotFoundException);
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
      prisma.factura.update.mockResolvedValue(
        mockFactura({ estado: EstadoFactura.ANULADA }),
      );

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

      await expect(service.anular('factura-1', ADMIN_USER)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('no incrementa el contador al anular', async () => {
      prisma.factura.findUnique.mockResolvedValue(mockFactura());
      prisma.factura.update.mockResolvedValue(
        mockFactura({ estado: EstadoFactura.ANULADA }),
      );

      await service.anular('factura-1', ADMIN_USER);

      expect(prisma.contadorFactura.upsert).not.toHaveBeenCalled();
    });
  });

  // ── marcarPagada ───────────────────────────────────────────────────────────

  describe('marcarPagada()', () => {
    it('actualiza estado a PAGADA', async () => {
      prisma.factura.findUnique.mockResolvedValue(mockFactura());
      prisma.factura.update.mockResolvedValue(
        mockFactura({
          estado: EstadoFactura.PAGADA,
          fechaPago: new Date(),
          metodoPago: 'Bizum',
        }),
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
        service.marcarPagada(
          'factura-1',
          { fechaPago: '2026-09-15' },
          ADMIN_USER,
        ),
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
