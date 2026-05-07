import { Test, TestingModule } from '@nestjs/testing';
import { EventosAgendaController } from './eventos-agenda.controller';
import { EventosAgendaService } from './eventos-agenda.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoEvento } from '@prisma/client';

// ── Mock factories ────────────────────────────────────────────────────────────

const mockReq = (overrides: Record<string, unknown> = {}) => ({
  user: { userId: 'user-1', rol: 'PEDAGOGO', ...overrides },
});

const mockEvento = (overrides: Record<string, unknown> = {}) => ({
  id: 'evento-1',
  titulo: 'Coordinación equipo',
  tipo: TipoEvento.COORDINACION_EQUIPO,
  fechaHoraInicio: new Date('2026-05-07T10:00:00Z').toISOString(),
  fechaHoraFin: new Date('2026-05-07T11:00:00Z').toISOString(),
  descripcion: null,
  creadoPorId: 'user-1',
  creadoPor: { id: 'user-1', nombre: 'Laura', apellidos: 'Martín' },
  participantes: [
    { trabajador: { id: 'user-1', nombre: 'Laura', apellidos: 'Martín' } },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const mockResumenHoras = () => ({
  horasClinicas: 4,
  minutosClinicas: 30,
  horasNoClinicas: 1,
  minutosNoClinicas: 0,
  totalMinutos: 330,
});

const makeServiceMock = () => ({
  create: jest.fn(),
  findByPeriodo: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getResumenHoras: jest.fn(),
});

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('EventosAgendaController', () => {
  let controller: EventosAgendaController;
  let service: ReturnType<typeof makeServiceMock>;

  beforeEach(async () => {
    service = makeServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventosAgendaController],
      providers: [{ provide: EventosAgendaService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<EventosAgendaController>(EventosAgendaController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('delega al servicio con userId y rol del token', async () => {
      const dto = {
        titulo: 'Reunión equipo',
        tipo: TipoEvento.COORDINACION_EQUIPO,
        fechaHoraInicio: '2026-05-07T10:00:00Z',
        fechaHoraFin: '2026-05-07T11:00:00Z',
      };
      const evento = mockEvento();
      service.create.mockResolvedValue(evento);

      const result = await controller.create(dto as any, mockReq() as any);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1', 'PEDAGOGO');
      expect(result).toEqual(evento);
    });
  });

  describe('findAll()', () => {
    it('devuelve eventos del período del usuario autenticado', async () => {
      const eventos = [mockEvento()];
      service.findByPeriodo.mockResolvedValue(eventos);

      const result = await controller.findAll(
        '2026-05-01',
        '2026-05-07',
        undefined,
        mockReq() as any,
      );

      expect(service.findByPeriodo).toHaveBeenCalledWith(
        'user-1',
        'PEDAGOGO',
        '2026-05-01',
        '2026-05-07',
        undefined,
      );
      expect(result).toEqual(eventos);
    });

    it('ADMIN puede filtrar por trabajadorId', async () => {
      const eventos = [mockEvento({ creadoPorId: 'user-2' })];
      service.findByPeriodo.mockResolvedValue(eventos);

      await controller.findAll(
        '2026-05-01',
        '2026-05-07',
        'user-2',
        mockReq({ rol: 'ADMIN' }) as any,
      );

      expect(service.findByPeriodo).toHaveBeenCalledWith(
        'user-1',
        'ADMIN',
        '2026-05-01',
        '2026-05-07',
        'user-2',
      );
    });
  });

  describe('getResumenHoras()', () => {
    it('devuelve estructura con horas clínicas y no clínicas', async () => {
      const resumen = mockResumenHoras();
      service.getResumenHoras.mockResolvedValue(resumen);

      const result = await controller.getResumenHoras(
        '2026-05-01',
        '2026-05-07',
        undefined,
        mockReq() as any,
      );

      expect(service.getResumenHoras).toHaveBeenCalledWith(
        'user-1',
        'PEDAGOGO',
        '2026-05-01',
        '2026-05-07',
        undefined,
      );
      expect(result).toMatchObject({
        horasClinicas: expect.any(Number),
        minutosClinicas: expect.any(Number),
        horasNoClinicas: expect.any(Number),
        minutosNoClinicas: expect.any(Number),
        totalMinutos: expect.any(Number),
      });
    });
  });

  describe('update()', () => {
    it('delega al servicio con userId y rol correctos', async () => {
      const dto = { titulo: 'Nuevo título' };
      const evento = mockEvento({ titulo: 'Nuevo título' });
      service.update.mockResolvedValue(evento);

      const result = await controller.update(
        'evento-1',
        dto as any,
        mockReq() as any,
      );

      expect(service.update).toHaveBeenCalledWith(
        'evento-1',
        dto,
        'user-1',
        'PEDAGOGO',
      );
      expect(result).toEqual(evento);
    });
  });

  describe('remove()', () => {
    it('delega al servicio y no devuelve contenido', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('evento-1', mockReq() as any);

      expect(service.remove).toHaveBeenCalledWith('evento-1', 'user-1', 'PEDAGOGO');
      expect(result).toBeUndefined();
    });
  });
});
