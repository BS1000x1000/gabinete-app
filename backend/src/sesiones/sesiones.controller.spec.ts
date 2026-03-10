import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SesionesController } from './sesiones.controller';
import { SesionesService } from './sesiones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EstadoSesion, TipoSesion } from '@prisma/client';

// ── Mock helpers ─────────────────────────────────────────────────────────────
const mockReq = (userId = 'trabajador-1') => ({ user: { userId } });

const mockSesion = (overrides: Record<string, any> = {}) => ({
  id: 'sesion-1',
  clienteId: 'cliente-1',
  trabajadorId: 'trabajador-1',
  fechaHoraInicio: new Date('2026-03-10T09:00:00'),
  fechaHoraFin: new Date('2026-03-10T10:00:00'),
  estado: EstadoSesion.PROGRAMADA,
  tipoSesion: TipoSesion.PEDAGOGIA,
  ...overrides,
});

const makeSesionesServiceMock = () => ({
  generarSesiones: jest.fn(),
  getSesionesHoy: jest.fn(),
  getCalendarioDiario: jest.fn(),
  getCalendarioSemanal: jest.fn(),
  getCalendarioMensual: jest.fn(),
  findByTrabajadorYFecha: jest.fn(),
  findByCliente: jest.fn(),
  findOne: jest.fn(),
  completarSesion: jest.fn(),
  cancelarSesion: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

// ── Suite ────────────────────────────────────────────────────────────────────
describe('SesionesController', () => {
  let controller: SesionesController;
  let service: ReturnType<typeof makeSesionesServiceMock>;

  beforeEach(async () => {
    service = makeSesionesServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SesionesController],
      providers: [{ provide: SesionesService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SesionesController>(SesionesController);
  });

  // ── generarSesiones ────────────────────────────────────────────────────────
  describe('generarSesiones()', () => {
    it('delega al servicio y devuelve el resultado', async () => {
      const dto = {
        clienteId: 'cliente-1',
        trabajadorId: 'trabajador-1',
        fechaInicio: '2026-03-09',
        fechaFin: '2026-03-15',
        tipoSesion: TipoSesion.PEDAGOGIA,
      };
      const expected = { sesionesCreadas: 2, mensaje: 'Creadas 2 sesiones' };
      service.generarSesiones.mockResolvedValue(expected);

      const result = await controller.generarSesiones(dto as any);

      expect(service.generarSesiones).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  // ── getSesionesHoy ─────────────────────────────────────────────────────────
  describe('getSesionesHoy()', () => {
    it('extrae userId del request y llama al servicio', async () => {
      const sesiones = [mockSesion()];
      service.getSesionesHoy.mockResolvedValue(sesiones);

      const result = await controller.getSesionesHoy(mockReq());

      expect(service.getSesionesHoy).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(sesiones);
    });
  });

  // ── getMiCalendarioDiario ──────────────────────────────────────────────────
  describe('getMiCalendarioDiario()', () => {
    it('pasa la fecha parseada cuando se proporciona', async () => {
      service.getCalendarioDiario.mockResolvedValue([]);

      await controller.getMiCalendarioDiario(mockReq(), '2026-03-10');

      expect(service.getCalendarioDiario).toHaveBeenCalledWith(
        'trabajador-1',
        new Date('2026-03-10'),
      );
    });

    it('pasa undefined cuando no se proporciona fecha', async () => {
      service.getCalendarioDiario.mockResolvedValue([]);

      await controller.getMiCalendarioDiario(mockReq(), undefined);

      expect(service.getCalendarioDiario).toHaveBeenCalledWith('trabajador-1', undefined);
    });
  });

  // ── getMiCalendarioSemanal ─────────────────────────────────────────────────
  describe('getMiCalendarioSemanal()', () => {
    it('pasa la fecha parseada al servicio', async () => {
      service.getCalendarioSemanal.mockResolvedValue([]);

      await controller.getMiCalendarioSemanal(mockReq(), '2026-03-09');

      expect(service.getCalendarioSemanal).toHaveBeenCalledWith(
        'trabajador-1',
        new Date('2026-03-09'),
      );
    });
  });

  // ── findByTrabajador ───────────────────────────────────────────────────────
  describe('findByTrabajador()', () => {
    it('pasa userId y fechas al servicio', async () => {
      service.findByTrabajadorYFecha.mockResolvedValue([]);

      await controller.findByTrabajador(mockReq(), '2026-03-01', '2026-03-31');

      expect(service.findByTrabajadorYFecha).toHaveBeenCalledWith(
        'trabajador-1',
        '2026-03-01',
        '2026-03-31',
      );
    });
  });

  // ── findByCliente ──────────────────────────────────────────────────────────
  describe('findByCliente()', () => {
    it('devuelve las sesiones del cliente', async () => {
      const sesiones = [mockSesion()];
      service.findByCliente.mockResolvedValue(sesiones);

      const result = await controller.findByCliente('cliente-1');

      expect(service.findByCliente).toHaveBeenCalledWith('cliente-1');
      expect(result).toEqual(sesiones);
    });
  });

  // ── findOne ────────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('devuelve la sesión si existe', async () => {
      const sesion = mockSesion();
      service.findOne.mockResolvedValue(sesion);

      const result = await controller.findOne('sesion-1');

      expect(result).toEqual(sesion);
    });

    it('lanza NotFoundException si la sesión no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('sesion-x')).rejects.toThrow(NotFoundException);
    });
  });

  // ── completar ─────────────────────────────────────────────────────────────
  describe('completar()', () => {
    it('delega al servicio con id y dto', async () => {
      const dto = { notas: 'Sesión completada' };
      const expected = { sesion: mockSesion({ estado: EstadoSesion.COMPLETADA }), bono: null };
      service.completarSesion.mockResolvedValue(expected);

      const result = await controller.completar('sesion-1', dto as any);

      expect(service.completarSesion).toHaveBeenCalledWith('sesion-1', dto);
      expect(result).toEqual(expected);
    });
  });

  // ── cancelar ──────────────────────────────────────────────────────────────
  describe('cancelar()', () => {
    it('cancela con aviso por defecto', async () => {
      const cancelada = mockSesion({ estado: EstadoSesion.CANCELADA_CON_AVISO });
      service.cancelarSesion.mockResolvedValue(cancelada);

      await controller.cancelar('sesion-1', {} as any);

      expect(service.cancelarSesion).toHaveBeenCalledWith('sesion-1', true);
    });

    it('cancela sin aviso cuando conAviso=false', async () => {
      service.cancelarSesion.mockResolvedValue(
        mockSesion({ estado: EstadoSesion.CANCELADA_SIN_AVISO }),
      );

      await controller.cancelar('sesion-1', { conAviso: false } as any);

      expect(service.cancelarSesion).toHaveBeenCalledWith('sesion-1', false);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('delega al servicio y devuelve el resultado', async () => {
      const expected = { message: 'Sesión eliminada' };
      service.remove.mockResolvedValue(expected);

      const result = await controller.remove('sesion-1');

      expect(service.remove).toHaveBeenCalledWith('sesion-1');
      expect(result).toEqual(expected);
    });
  });
});
