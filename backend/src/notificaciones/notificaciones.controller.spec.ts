import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';
import { MotorReglasService } from './motor-reglas.service';
import { NotificacionesSseService } from './notificaciones-sse.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtFlexGuard } from '../auth/guards/jwt-flex.guard';

// ── Mock helpers ─────────────────────────────────────────────────────────────
const mockReq = (sub = 'trabajador-1', rol = 'PEDAGOGO') => ({
  user: { sub, userId: sub, rol },
});

const mockNotif = (overrides: Record<string, any> = {}) => ({
  id: 'notif-1',
  tipo: 'BONO_AGOTADO',
  titulo: 'Bono agotado',
  mensaje: 'El bono del cliente ha sido consumido',
  leida: false,
  descartada: false,
  trabajadorId: 'trabajador-1',
  ...overrides,
});

const makeNotificacionesServiceMock = () => ({
  findByTrabajador: jest.fn(),
  countNoLeidas: jest.fn(),
  marcarTodasLeidas: jest.fn(),
  marcarLeida: jest.fn(),
  descartar: jest.fn(),
});

const makeMotorReglasMock = () => ({
  evaluarReglas: jest.fn().mockResolvedValue(undefined),
});

// ── Suite ────────────────────────────────────────────────────────────────────
describe('NotificacionesController', () => {
  let controller: NotificacionesController;
  let service: ReturnType<typeof makeNotificacionesServiceMock>;
  let motor: ReturnType<typeof makeMotorReglasMock>;

  beforeEach(async () => {
    service = makeNotificacionesServiceMock();
    motor = makeMotorReglasMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionesController],
      providers: [
        { provide: NotificacionesService, useValue: service },
        { provide: MotorReglasService, useValue: motor },
        { provide: NotificacionesSseService, useValue: { sendToUser: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtFlexGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificacionesController>(NotificacionesController);
  });

  // ── getNotificaciones ─────────────────────────────────────────────────────
  describe('getNotificaciones()', () => {
    it('devuelve las notificaciones del trabajador autenticado', async () => {
      const notifs = [mockNotif(), mockNotif({ id: 'notif-2' })];
      service.findByTrabajador.mockResolvedValue(notifs);

      const result = await controller.getNotificaciones(mockReq());

      expect(service.findByTrabajador).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(notifs);
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────
  describe('getCount()', () => {
    it('devuelve el conteo de notificaciones no leídas', async () => {
      service.countNoLeidas.mockResolvedValue(3);

      const result = await controller.getCount(mockReq());

      expect(service.countNoLeidas).toHaveBeenCalledWith('trabajador-1');
      expect(result).toBe(3);
    });
  });

  // ── marcarTodasLeidas ─────────────────────────────────────────────────────
  describe('marcarTodasLeidas()', () => {
    it('marca todas las notificaciones como leídas', async () => {
      const expected = { count: 3 };
      service.marcarTodasLeidas.mockResolvedValue(expected);

      const result = await controller.marcarTodasLeidas(mockReq());

      expect(service.marcarTodasLeidas).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(expected);
    });
  });

  // ── marcarLeida ───────────────────────────────────────────────────────────
  describe('marcarLeida()', () => {
    it('marca una notificación como leída por id', async () => {
      const leida = mockNotif({ leida: true });
      service.marcarLeida.mockResolvedValue(leida);

      const result = await controller.marcarLeida('notif-1');

      expect(service.marcarLeida).toHaveBeenCalledWith('notif-1');
      expect(result.leida).toBe(true);
    });
  });

  // ── descartar ─────────────────────────────────────────────────────────────
  describe('descartar()', () => {
    it('descarta una notificación por id', async () => {
      const descartada = mockNotif({ descartada: true });
      service.descartar.mockResolvedValue(descartada);

      const result = await controller.descartar('notif-1');

      expect(service.descartar).toHaveBeenCalledWith('notif-1');
      expect(result.descartada).toBe(true);
    });
  });

  // ── evaluar ───────────────────────────────────────────────────────────────
  describe('evaluar()', () => {
    it('ejecuta el motor de reglas y devuelve las notificaciones actualizadas', async () => {
      const notifs = [mockNotif()];
      service.findByTrabajador.mockResolvedValue(notifs);

      const result = await controller.evaluar(mockReq());

      expect(motor.evaluarReglas).toHaveBeenCalledWith('trabajador-1', 'PEDAGOGO');
      expect(service.findByTrabajador).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(notifs);
    });
  });
});
