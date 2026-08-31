import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoSesion, TipoSesion } from '@prisma/client';
import { SesionesService } from './sesiones.service';
import { PrismaService } from '../prisma/prisma.service';
import { BonosService } from '../bonos/bonos.service';
import { HorariosLaboralesService } from '../horarios-laborales/horarios-laborales.service';

// ── Mock factories ──────────────────────────────────────────────────────────
const mockSesion = (overrides: Record<string, any> = {}) => ({
  id: 'sesion-1',
  clienteId: 'cliente-1',
  trabajadorId: 'trabajador-1',
  fechaHoraInicio: new Date('2026-03-10T09:00:00'),
  fechaHoraFin: new Date('2026-03-10T10:00:00'),
  estado: EstadoSesion.PROGRAMADA,
  tipoSesion: TipoSesion.PEDAGOGIA,
  notas: null,
  objetivosTrabajados: [],
  bonoId: null,
  ...overrides,
});

const mockAsignacion = (overrides: Record<string, any> = {}) => ({
  clienteId: 'cliente-1',
  trabajadorId: 'trabajador-1',
  activo: true,
  tipoTerapia: 'PEDAGOGIA',
  cliente: { id: 'cliente-1', nombre: 'Ana', apellidos: 'García', fechaInicio: null },
  trabajador: { id: 'trabajador-1', nombre: 'Luis', apellidos: 'Pérez' },
  horarios: [
    { diaSemana: 1, horaInicio: '09:00', horaFin: '10:00' }, // lunes
    { diaSemana: 3, horaInicio: '09:00', horaFin: '10:00' }, // miércoles
  ],
  ...overrides,
});

const makePrismaMock = () => ({
  sesion: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  clienteTrabajador: {
    findFirst: jest.fn(),
  },
  cliente: {
    update: jest.fn(),
    findFirst: jest.fn(),
  },
  trabajador: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
});

const makeBonosMock = () => ({
  descontarSesion: jest.fn(),
});

// ── Suite ───────────────────────────────────────────────────────────────────
describe('SesionesService', () => {
  let service: SesionesService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let bonosService: ReturnType<typeof makeBonosMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();
    bonosService = makeBonosMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SesionesService,
        { provide: PrismaService, useValue: prisma },
        { provide: BonosService, useValue: bonosService },
        // Los avisos no bloquean nada: por defecto, ninguno
        { provide: HorariosLaboralesService, useValue: { evaluarAvisos: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get<SesionesService>(SesionesService);
  });

  // ── completarSesion ─────────────────────────────────────────────────────
  describe('completarSesion()', () => {
    it('lanza NotFoundException si la sesión no existe', async () => {
      prisma.sesion.findUnique.mockResolvedValue(null);

      await expect(service.completarSesion('sesion-x', {})).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si la sesión ya está completada', async () => {
      prisma.sesion.findUnique.mockResolvedValue(
        mockSesion({ estado: EstadoSesion.COMPLETADA }),
      );

      await expect(service.completarSesion('sesion-1', {})).rejects.toThrow(BadRequestException);
    });

    it('completa la sesión y descuenta del bono en transacción', async () => {
      const sesion = mockSesion();
      prisma.sesion.findUnique.mockResolvedValue(sesion);

      const sesionActualizada = mockSesion({ estado: EstadoSesion.COMPLETADA });
      const bono = { id: 'bono-1', sesionesConsumidas: 3, totalSesiones: 10, estado: 'ACTIVO' };

      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          sesion: { update: jest.fn().mockResolvedValue(sesionActualizada) },
        };
        bonosService.descontarSesion.mockResolvedValue(bono);
        return cb(tx);
      });

      const result = await service.completarSesion('sesion-1', { notas: 'Bien' });

      expect(result.sesion.estado).toBe(EstadoSesion.COMPLETADA);
      expect(result.sinBonoActivo).toBe(false);
      expect(result.bono).toEqual(bono);
    });

    it('devuelve sinBonoActivo=true si no hay bono', async () => {
      const sesion = mockSesion();
      prisma.sesion.findUnique.mockResolvedValue(sesion);

      const sesionActualizada = mockSesion({ estado: EstadoSesion.COMPLETADA });

      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          sesion: { update: jest.fn().mockResolvedValue(sesionActualizada) },
        };
        bonosService.descontarSesion.mockResolvedValue(null);
        return cb(tx);
      });

      const result = await service.completarSesion('sesion-1', {});

      expect(result.bono).toBeNull();
      expect(result.sinBonoActivo).toBe(true);
    });
  });

  // ── cancelarSesion ──────────────────────────────────────────────────────
  describe('cancelarSesion()', () => {
    it('lanza NotFoundException si la sesión no existe', async () => {
      prisma.sesion.findUnique.mockResolvedValue(null);

      await expect(service.cancelarSesion('sesion-x')).rejects.toThrow(NotFoundException);
    });

    it('cancela con aviso por defecto', async () => {
      prisma.sesion.findUnique.mockResolvedValue(mockSesion());
      const cancelada = mockSesion({ estado: EstadoSesion.CANCELADA_CON_AVISO });
      prisma.sesion.update.mockResolvedValue(cancelada);

      const result = await service.cancelarSesion('sesion-1');

      expect(prisma.sesion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { estado: EstadoSesion.CANCELADA_CON_AVISO },
        }),
      );
      expect(result.estado).toBe(EstadoSesion.CANCELADA_CON_AVISO);
    });

    it('cancela sin aviso cuando conAviso=false', async () => {
      prisma.sesion.findUnique.mockResolvedValue(mockSesion());
      const cancelada = mockSesion({ estado: EstadoSesion.CANCELADA_SIN_AVISO });
      prisma.sesion.update.mockResolvedValue(cancelada);

      const result = await service.cancelarSesion('sesion-1', false);

      expect(prisma.sesion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { estado: EstadoSesion.CANCELADA_SIN_AVISO },
        }),
      );
      expect(result.estado).toBe(EstadoSesion.CANCELADA_SIN_AVISO);
    });
  });

  // ── create (sesion suelta) ──────────────────────────────────────────────
  describe('create()', () => {
    const dto = {
      clienteId: 'cliente-1',
      trabajadorId: 'trabajador-1',
      fechaHoraInicio: '2026-03-09T16:00:00.000Z',
      fechaHoraFin: '2026-03-09T17:00:00.000Z',
      tipoSesion: TipoSesion.PEDAGOGIA,
    } as any;

    beforeEach(() => {
      prisma.cliente.findFirst.mockResolvedValue({ id: 'cliente-1' });
      prisma.trabajador.findUnique.mockResolvedValue({ id: 'trabajador-1' });
      prisma.sesion.create.mockResolvedValue({ id: 'ses-1' });
    });

    it('crea la sesion suelta', async () => {
      await expect(service.create(dto)).resolves.toMatchObject({ id: 'ses-1' });
      expect(prisma.sesion.create).toHaveBeenCalledTimes(1);
    });

    // Lo que la protege del recolocador y del cron del contrato
    it('la deja sin contrato, para que ningun proceso automatico la mueva', async () => {
      await service.create(dto);
      const data = prisma.sesion.create.mock.calls[0][0].data;
      expect(data.contratoId).toBeUndefined();
    });

    it('rechaza que la hora de fin no sea posterior a la de inicio', async () => {
      await expect(
        service.create({ ...dto, fechaHoraFin: dto.fechaHoraInicio }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.sesion.create).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si el cliente no existe o esta borrado', async () => {
      prisma.cliente.findFirst.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFoundException si el trabajador no existe', async () => {
      prisma.trabajador.findUnique.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });


  // ── remove ──────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('elimina la sesión y devuelve mensaje', async () => {
      prisma.sesion.delete.mockResolvedValue({});

      const result = await service.remove('sesion-1');

      expect(prisma.sesion.delete).toHaveBeenCalledWith({ where: { id: 'sesion-1' } });
      expect(result.message).toContain('eliminada');
    });
  });

  // ── findByCliente ───────────────────────────────────────────────────────
  describe('findByCliente()', () => {
    it('devuelve las sesiones del cliente ordenadas por fecha desc', async () => {
      const sesiones = [mockSesion(), mockSesion({ id: 'sesion-2' })];
      prisma.sesion.findMany.mockResolvedValue(sesiones);

      const result = await service.findByCliente('cliente-1');

      expect(result).toEqual(sesiones);
      expect(prisma.sesion.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: 'cliente-1' },
          orderBy: { fechaHoraInicio: 'desc' },
        }),
      );
    });
  });
});
