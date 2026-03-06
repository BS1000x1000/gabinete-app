import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoSesion, TipoSesion } from '@prisma/client';
import { SesionesService } from './sesiones.service';
import { PrismaService } from '../prisma/prisma.service';
import { BonosService } from '../bonos/bonos.service';

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

  // ── generarSesiones ─────────────────────────────────────────────────────
  describe('generarSesiones()', () => {
    const dto = {
      clienteId: 'cliente-1',
      trabajadorId: 'trabajador-1',
      fechaInicio: '2026-03-09', // lunes
      fechaFin: '2026-03-15',   // domingo
      tipoSesion: TipoSesion.PEDAGOGIA,
    };

    it('lanza NotFoundException si no hay asignación activa', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue(null);

      await expect(service.generarSesiones(dto)).rejects.toThrow(NotFoundException);
    });

    it('lanza BadRequestException si la asignación no tiene horarios', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue(
        mockAsignacion({ horarios: [] }),
      );

      await expect(service.generarSesiones(dto)).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si ya existen sesiones en el rango', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue(mockAsignacion());
      prisma.sesion.count.mockResolvedValue(3);

      await expect(service.generarSesiones(dto)).rejects.toThrow(BadRequestException);
    });

    it('lanza BadRequestException si ningún día del rango coincide con los horarios', async () => {
      // Horarios solo para sábado (6), pero el rango lunes-domingo debería generar sesiones
      // Aquí probamos un rango que no contiene el día configurado (martes=2, miercoles=3)
      // Usamos un rango de solo martes (2026-03-10) con horario solo para sábado
      prisma.clienteTrabajador.findFirst.mockResolvedValue(
        mockAsignacion({ horarios: [{ diaSemana: 6, horaInicio: '10:00', horaFin: '11:00' }] }),
      );
      prisma.sesion.count.mockResolvedValue(0);
      prisma.$transaction.mockResolvedValue(undefined);

      const dtoSinCoincidencia = {
        ...dto,
        fechaInicio: '2026-03-10', // martes
        fechaFin: '2026-03-11',    // miércoles — no hay sábado en este rango
      };

      await expect(service.generarSesiones(dtoSinCoincidencia)).rejects.toThrow(BadRequestException);
    });

    it('crea sesiones correctamente para los días coincidentes', async () => {
      prisma.clienteTrabajador.findFirst.mockResolvedValue(mockAsignacion());
      prisma.sesion.count.mockResolvedValue(0);

      let sesionesCreadas: any[] = [];
      prisma.$transaction.mockImplementation(async (cb) => {
        const tx = {
          sesion: {
            createMany: jest.fn().mockImplementation(({ data }) => {
              sesionesCreadas = data;
              return Promise.resolve({ count: data.length });
            }),
          },
          cliente: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return cb(tx);
      });

      const result = await service.generarSesiones(dto);

      // Semana 9-15 marzo 2026: lunes 9 (día 1) y miércoles 11 (día 3) coinciden con horarios
      expect(result.sesionesCreadas).toBe(2);
      expect(sesionesCreadas).toHaveLength(2);
      expect(result.mensaje || result.message).toContain('2');
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
