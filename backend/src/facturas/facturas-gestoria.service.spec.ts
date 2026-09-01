import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FacturasGestoriaService } from './facturas-gestoria.service';
import { FacturasPackService } from './facturas-pack.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { EmailService } from '../common/email/email.service';
import { AuditService } from '../auth/audit.service';

const TERAPEUTA = { userId: 'trabajador-1', rol: 'PEDAGOGO' };

const mockFactura = (over: Record<string, any> = {}): any => ({
  id: 'f-1',
  numero: 12,
  numeroFormateado: '12/2026',
  periodoFacturado: '2026-07',
  total: { toNumber: () => 120 },
  estado: 'PENDIENTE',
  ...over,
});

const conGestoria = {
  nombre: 'María',
  apellidos: 'García',
  email: 'maria@gabinete.es',
  nombreFiscal: 'María García López',
  nifFiscal: '12345678A',
  emailFacturacion: 'facturacion@maria.es',
  nombreGestoria: 'Asesoría Pérez',
  emailGestoria: 'gestor@asesoria.es',
};

const makePrismaMock = () => ({
  trabajador: { findUnique: jest.fn().mockResolvedValue(conGestoria), findMany: jest.fn() },
  factura: { findMany: jest.fn().mockResolvedValue([]) },
  envioGestoria: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
  },
  envioGestoriaFactura: { count: jest.fn().mockResolvedValue(0), findMany: jest.fn().mockResolvedValue([]) },
  notificacion: { updateMany: jest.fn() },
});

describe('FacturasGestoriaService', () => {
  let service: FacturasGestoriaService;
  let prisma: ReturnType<typeof makePrismaMock>;

  const packMock = {
    facturasDeLaSeleccion: jest.fn(),
    resumen: jest.fn(),
    construirPack: jest.fn(),
    construirLibro: jest.fn(),
  };
  const storageMock = { upload: jest.fn(), getSignedUrl: jest.fn(), isConfigured: true };
  const emailMock = { sendPackGestoriaEmail: jest.fn(), isConfigured: true };
  const auditMock = { registrar: jest.fn().mockResolvedValue(undefined) };

  const RESUMEN = {
    numFacturas: 1,
    totalImporte: 120,
    periodoDesde: '2026-07',
    periodoHasta: '2026-09',
    filename: 'facturas_12345678A_2026-3T.zip',
    ficheros: ['resumen-facturas_2026-3T.xlsx', '0012_2026-07_Ana.pdf'],
  };

  beforeEach(async () => {
    prisma = makePrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasGestoriaService,
        { provide: PrismaService, useValue: prisma },
        { provide: FacturasPackService, useValue: packMock },
        { provide: StorageService, useValue: storageMock },
        { provide: EmailService, useValue: emailMock },
        { provide: AuditService, useValue: auditMock },
      ],
    }).compile();

    service = module.get(FacturasGestoriaService);
    jest.clearAllMocks();

    prisma.trabajador.findUnique.mockResolvedValue(conGestoria);
    packMock.facturasDeLaSeleccion.mockResolvedValue([mockFactura()]);
    packMock.resumen.mockReturnValue(RESUMEN);
    packMock.construirPack.mockResolvedValue({
      buffer: Buffer.from('zip-pequeño'),
      filename: RESUMEN.filename,
      contentType: 'application/zip',
      incidencias: [],
    });
    packMock.construirLibro.mockResolvedValue({
      buffer: Buffer.from('xlsx'),
      filename: 'resumen-facturas_2026-3T.xlsx',
      contentType: 'application/vnd.ms-excel',
      incidencias: [],
    });
    storageMock.upload.mockResolvedValue('gestoria/k.zip');
    storageMock.getSignedUrl.mockResolvedValue('https://enlace');
    emailMock.sendPackGestoriaEmail.mockResolvedValue(true);
    emailMock.isConfigured = true;
    prisma.envioGestoria.create.mockResolvedValue({ id: 'envio-1' });
    prisma.envioGestoria.update.mockImplementation(async ({ data }: any) => ({
      id: 'envio-1',
      ...data,
    }));
  });

  // ── Previsualización ───────────────────────────────────────────────────────

  describe('previsualizar()', () => {
    it('devuelve destinatario y nombres de fichero antes de mandar nada', async () => {
      const prev = await service.previsualizar(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      expect(prev.destinatario).toEqual({
        nombre: 'Asesoría Pérez',
        email: 'gestor@asesoria.es',
      });
      expect(prev.ficheros).toEqual(RESUMEN.ficheros);
      expect(prev.listoParaEnviar).toBe(true);
      expect(emailMock.sendPackGestoriaEmail).not.toHaveBeenCalled();
    });

    it('sin email de gestoría no está listo para enviar', async () => {
      prisma.trabajador.findUnique.mockResolvedValue({ ...conGestoria, emailGestoria: null });

      const prev = await service.previsualizar(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      expect(prev.listoParaEnviar).toBe(false);
    });

    it('sin servicio de email configurado tampoco', async () => {
      emailMock.isConfigured = false;

      const prev = await service.previsualizar(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      expect(prev.listoParaEnviar).toBe(false);
      expect(prev.emailConfigurado).toBe(false);
    });

    it('avisa de cuántas de la selección ya se entregaron', async () => {
      prisma.envioGestoriaFactura.count.mockResolvedValue(3);

      const prev = await service.previsualizar(TERAPEUTA, { ids: ['f-1'] });

      expect(prev.yaEntregadas).toBe(3);
    });
  });

  // ── Envío ──────────────────────────────────────────────────────────────────

  describe('enviar()', () => {
    it('sin email de gestoría configurado no deja enviar', async () => {
      prisma.trabajador.findUnique.mockResolvedValue({ ...conGestoria, emailGestoria: null });

      await expect(
        service.enviar(TERAPEUTA, { periodoDesde: '2026-07', periodoHasta: '2026-09' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.envioGestoria.create).not.toHaveBeenCalled();
    });

    it('adjunta el zip cuando cabe y marca el envío como ENVIADO', async () => {
      const res = await service.enviar(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      const payload = emailMock.sendPackGestoriaEmail.mock.calls[0][0];
      expect(payload.to).toBe('gestor@asesoria.es');
      expect(payload.adjuntos[0].filename).toBe(RESUMEN.filename);
      expect(payload.enlaceDescarga).toBeNull();
      expect(res.envio.estado).toBe('ENVIADO');
      expect(res.envio.fechaEnvio).toBeInstanceOf(Date);
    });

    /**
     * El proveedor corta en 40 MB. Por encima del umbral se manda el libro en
     * Excel y los PDF por enlace, en vez de un correo que se pierde en silencio.
     */
    it('si el zip no cabe, manda el libro y un enlace de descarga', async () => {
      packMock.construirPack.mockResolvedValue({
        buffer: Buffer.alloc(21 * 1024 * 1024),
        filename: RESUMEN.filename,
        contentType: 'application/zip',
        incidencias: [],
      });

      await service.enviar(TERAPEUTA, { periodoDesde: '2026-07', periodoHasta: '2026-09' });

      const payload = emailMock.sendPackGestoriaEmail.mock.calls[0][0];
      expect(payload.enlaceDescarga).toBe('https://enlace');
      expect(payload.adjuntos[0].filename).toBe('resumen-facturas_2026-3T.xlsx');
    });

    it('archiva el zip que se manda, para poder demostrar qué se entregó', async () => {
      await service.enviar(TERAPEUTA, { periodoDesde: '2026-07', periodoHasta: '2026-09' });

      expect(storageMock.upload).toHaveBeenCalledWith(
        expect.stringContaining('gestoria/trabajador-1/2026-07_2026-09_envio-1'),
        expect.any(Buffer),
        'application/zip',
      );
    });

    it('un email rechazado deja el envío en ERROR, no lo pierde', async () => {
      emailMock.sendPackGestoriaEmail.mockResolvedValue(false);

      const res = await service.enviar(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      expect(res.envio.estado).toBe('ERROR');
      expect(res.envio.fechaEnvio).toBeNull();
      expect(prisma.notificacion.updateMany).not.toHaveBeenCalled();
    });

    it('un fallo al construir el paquete queda registrado como ERROR', async () => {
      packMock.construirPack.mockRejectedValue(new Error('Storage caído'));

      const res = await service.enviar(TERAPEUTA, {
        periodoDesde: '2026-07',
        periodoHasta: '2026-09',
      });

      expect(res.envio.estado).toBe('ERROR');
      expect(res.envio.error).toBe('Storage caído');
    });

    /** Nada en el motor de reglas retira un aviso cuando deja de aplicar. */
    it('al entregar retira el aviso de facturas sin entregar', async () => {
      await service.enviar(TERAPEUTA, { periodoDesde: '2026-07', periodoHasta: '2026-09' });

      expect(prisma.notificacion.updateMany).toHaveBeenCalledWith({
        where: {
          trabajadorId: 'trabajador-1',
          reglaOrigen: 'FACTURAS_SIN_ENTREGAR',
          referenciaId: { lte: '2026-09' },
          descartada: false,
        },
        data: { descartada: true },
      });
    });

    it('deja rastro en el audit log: salen datos hacia un tercero', async () => {
      await service.enviar(TERAPEUTA, { periodoDesde: '2026-07', periodoHasta: '2026-09' });

      expect(auditMock.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          evento: 'FACTURA_ENTREGA_GESTORIA',
          metadata: expect.objectContaining({ destino: 'gestor@asesoria.es', enviado: true }),
        }),
      );
    });
  });

  // ── Pendientes ─────────────────────────────────────────────────────────────

  describe('pendientesDeEntregar()', () => {
    it('agrupa por periodo lo que nunca ha salido', async () => {
      prisma.factura.findMany.mockResolvedValue([
        mockFactura({ periodoFacturado: '2026-07' }),
        mockFactura({ id: 'f-2', periodoFacturado: '2026-07' }),
        mockFactura({ id: 'f-3', periodoFacturado: '2026-08' }),
      ]);

      const pendientes = await service.pendientesDeEntregar('trabajador-1');

      expect(pendientes).toEqual([
        { periodo: '2026-07', numFacturas: 2, total: 240 },
        { periodo: '2026-08', numFacturas: 1, total: 120 },
      ]);
    });

    it('solo mira periodos ya cerrados y lo no entregado', async () => {
      await service.pendientesDeEntregar('trabajador-1');

      const { where } = prisma.factura.findMany.mock.calls[0][0];
      expect(where.trabajadorId).toBe('trabajador-1');
      expect(where.periodoFacturado.lt).toBeDefined();
      expect(where.entregas).toEqual({ none: { envio: { estado: 'ENVIADO' } } });
    });
  });

  // ── Automático ─────────────────────────────────────────────────────────────

  describe('entregarPeriodicas()', () => {
    it('solo toca a quien tiene periodicidad y gestoría', async () => {
      prisma.trabajador.findMany.mockResolvedValue([]);

      await service.entregarPeriodicas();

      const { where } = prisma.trabajador.findMany.mock.calls[0][0];
      expect(where.periodicidadGestoria).toEqual({ not: 'NINGUNA' });
      expect(where.emailGestoria).toEqual({ not: null });
      expect(where.activo).toBe(true);
    });

    it('no reenvía lo que ya salió', async () => {
      prisma.trabajador.findMany.mockResolvedValue([
        { id: 'trabajador-1', periodicidadGestoria: 'TRIMESTRAL' },
      ]);
      prisma.envioGestoriaFactura.findMany.mockResolvedValue([{ facturaId: 'f-1' }]);

      const entregados = await service.entregarPeriodicas();

      expect(entregados).toBe(0);
      expect(emailMock.sendPackGestoriaEmail).not.toHaveBeenCalled();
    });

    it('un periodo sin facturas no rompe el recorrido de los demás', async () => {
      prisma.trabajador.findMany.mockResolvedValue([
        { id: 'trabajador-1', periodicidadGestoria: 'TRIMESTRAL' },
      ]);
      packMock.facturasDeLaSeleccion.mockRejectedValue(
        new BadRequestException('No hay facturas en la selección.'),
      );

      await expect(service.entregarPeriodicas()).resolves.toBe(0);
    });
  });
});
