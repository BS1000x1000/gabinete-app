import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BonosService } from './bonos.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Mock factory ────────────────────────────────────────────────────────────
const mockBono = (overrides: Record<string, any> = {}) => ({
  id: 'bono-1',
  clienteId: 'cliente-1',
  totalSesiones: 10,
  sesionesConsumidas: 0,
  precio: 500,
  estado: 'ACTIVO',
  pagado: false,
  metodoPago: null,
  fechaPago: null,
  fechaFin: null,
  familiarPagoId: null,
  notas: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

const makePrismaMock = () => ({
  bono: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
});

// ── Suite ───────────────────────────────────────────────────────────────────
describe('BonosService', () => {
  let service: BonosService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BonosService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BonosService>(BonosService);
  });

  // ── create ─────────────────────────────────────────────────────────────
  describe('create()', () => {
    const dto = { clienteId: 'cliente-1', totalSesiones: 10, precio: 500 };

    it('lanza ConflictException si ya existe bono activo', async () => {
      prisma.bono.findFirst.mockResolvedValue(mockBono());

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });

    it('crea el bono si no hay bono activo', async () => {
      prisma.bono.findFirst.mockResolvedValue(null);
      const creado = mockBono();
      prisma.bono.create.mockResolvedValue(creado);

      const result = await service.create(dto as any);

      expect(prisma.bono.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(creado);
    });

    it('pasa los datos correctos a prisma.create', async () => {
      prisma.bono.findFirst.mockResolvedValue(null);
      prisma.bono.create.mockResolvedValue(mockBono());

      await service.create(dto as any);

      expect(prisma.bono.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clienteId: 'cliente-1',
            totalSesiones: 10,
            precio: 500,
          }),
        }),
      );
    });
  });

  // ── registrarPago ───────────────────────────────────────────────────────
  describe('registrarPago()', () => {
    const dto = { metodoPago: 'TRANSFERENCIA' };

    it('lanza NotFoundException si el bono no existe', async () => {
      prisma.bono.findUnique.mockResolvedValue(null);

      await expect(service.registrarPago('bono-x', dto as any)).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el bono ya está pagado', async () => {
      prisma.bono.findUnique.mockResolvedValue(mockBono({ pagado: true }));

      await expect(service.registrarPago('bono-1', dto as any)).rejects.toThrow(BadRequestException);
    });

    it('actualiza el bono con pagado=true', async () => {
      prisma.bono.findUnique.mockResolvedValue(mockBono());
      const actualizado = mockBono({ pagado: true, metodoPago: 'TRANSFERENCIA' });
      prisma.bono.update.mockResolvedValue(actualizado);

      const result = await service.registrarPago('bono-1', dto as any);

      expect(prisma.bono.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bono-1' },
          data: expect.objectContaining({ pagado: true, metodoPago: 'TRANSFERENCIA' }),
        }),
      );
      expect(result.pagado).toBe(true);
    });
  });

  // ── cancelar ────────────────────────────────────────────────────────────
  describe('cancelar()', () => {
    it('lanza NotFoundException si el bono no existe', async () => {
      prisma.bono.findUnique.mockResolvedValue(null);

      await expect(service.cancelar('bono-x')).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si el bono ya está consumido', async () => {
      prisma.bono.findUnique.mockResolvedValue(mockBono({ estado: 'CONSUMIDO' }));

      await expect(service.cancelar('bono-1')).rejects.toThrow(BadRequestException);
    });

    it('cambia estado a CANCELADO', async () => {
      prisma.bono.findUnique.mockResolvedValue(mockBono());
      const cancelado = mockBono({ estado: 'CANCELADO' });
      prisma.bono.update.mockResolvedValue(cancelado);

      const result = await service.cancelar('bono-1');

      expect(prisma.bono.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'bono-1' },
          data: expect.objectContaining({ estado: 'CANCELADO' }),
        }),
      );
      expect(result.estado).toBe('CANCELADO');
    });
  });

  // ── descontarSesion ─────────────────────────────────────────────────────
  describe('descontarSesion()', () => {
    const makeTx = () => ({
      bono: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    });

    it('devuelve null si no hay bono activo', async () => {
      const tx = makeTx();
      tx.bono.findFirst.mockResolvedValue(null);

      const result = await service.descontarSesion('cliente-1', 'PEDAGOGIA', 'sesion-1', tx as any);

      expect(result).toBeNull();
      expect(tx.bono.update).not.toHaveBeenCalled();
    });

    it('incrementa sesionesConsumidas y mantiene estado ACTIVO si no se agota', async () => {
      const tx = makeTx();
      const bono = mockBono({ sesionesConsumidas: 4, totalSesiones: 10 });
      tx.bono.findFirst.mockResolvedValue(bono);
      const actualizado = mockBono({ sesionesConsumidas: 5, estado: 'ACTIVO' });
      tx.bono.update.mockResolvedValue(actualizado);

      const result = await service.descontarSesion('cliente-1', 'PEDAGOGIA', 'sesion-1', tx as any);

      expect(tx.bono.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sesionesConsumidas: 5,
            estado: 'ACTIVO',
          }),
        }),
      );
      expect(result?.estado).toBe('ACTIVO');
    });

    it('marca estado CONSUMIDO cuando se alcanza el total', async () => {
      const tx = makeTx();
      const bono = mockBono({ sesionesConsumidas: 9, totalSesiones: 10 });
      tx.bono.findFirst.mockResolvedValue(bono);
      const agotado = mockBono({ sesionesConsumidas: 10, estado: 'CONSUMIDO' });
      tx.bono.update.mockResolvedValue(agotado);

      const result = await service.descontarSesion('cliente-1', 'PEDAGOGIA', 'sesion-1', tx as any);

      expect(tx.bono.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sesionesConsumidas: 10,
            estado: 'CONSUMIDO',
          }),
        }),
      );
      expect(result?.estado).toBe('CONSUMIDO');
    });

    it('conecta la sesion al bono al descontar', async () => {
      const tx = makeTx();
      tx.bono.findFirst.mockResolvedValue(mockBono({ sesionesConsumidas: 0, totalSesiones: 5 }));
      tx.bono.update.mockResolvedValue(mockBono({ sesionesConsumidas: 1 }));

      await service.descontarSesion('cliente-1', 'PEDAGOGIA', 'sesion-99', tx as any);

      expect(tx.bono.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sesiones: { connect: { id: 'sesion-99' } },
          }),
        }),
      );
    });
  });

  // ── findActivoByCliente ─────────────────────────────────────────────────
  describe('findActivoByCliente()', () => {
    it('devuelve null si no existe bono activo', async () => {
      prisma.bono.findFirst.mockResolvedValue(null);

      const result = await service.findActivoByCliente('cliente-sin-bono');

      expect(result).toBeNull();
    });

    it('devuelve el bono activo del cliente', async () => {
      const bono = mockBono();
      prisma.bono.findFirst.mockResolvedValue(bono);

      const result = await service.findActivoByCliente('cliente-1');

      expect(result).toEqual(bono);
      expect(prisma.bono.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: 'cliente-1', estado: 'ACTIVO' },
        }),
      );
    });
  });
});
