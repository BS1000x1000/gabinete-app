import { Test, TestingModule } from '@nestjs/testing';
import { BonosController } from './bonos.controller';
import { BonosService } from './bonos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ── Mock factory ─────────────────────────────────────────────────────────────
const mockBono = (overrides: Record<string, any> = {}) => ({
  id: 'bono-1',
  clienteId: 'cliente-1',
  totalSesiones: 10,
  sesionesConsumidas: 0,
  precio: 500,
  estado: 'ACTIVO',
  pagado: false,
  ...overrides,
});

const makeBonosServiceMock = () => ({
  create: jest.fn(),
  findByCliente: jest.fn(),
  getCobrosPendientes: jest.fn(),
  registrarPago: jest.fn(),
  cancelar: jest.fn(),
});

// ── Suite ────────────────────────────────────────────────────────────────────
describe('BonosController', () => {
  let controller: BonosController;
  let service: ReturnType<typeof makeBonosServiceMock>;

  beforeEach(async () => {
    service = makeBonosServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BonosController],
      providers: [{ provide: BonosService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BonosController>(BonosController);
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('delega al servicio y devuelve el bono creado', async () => {
      const dto = { clienteId: 'cliente-1', totalSesiones: 10, precio: 500 };
      const bono = mockBono();
      service.create.mockResolvedValue(bono);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(bono);
    });
  });

  // ── findByCliente ─────────────────────────────────────────────────────────
  describe('findByCliente()', () => {
    it('devuelve los bonos del cliente', async () => {
      const bonos = [mockBono(), mockBono({ id: 'bono-2', estado: 'CONSUMIDO' })];
      service.findByCliente.mockResolvedValue(bonos);

      const result = await controller.findByCliente('cliente-1');

      expect(service.findByCliente).toHaveBeenCalledWith('cliente-1');
      expect(result).toEqual(bonos);
    });
  });

  // ── getCobrosPendientes ────────────────────────────────────────────────────
  describe('getCobrosPendientes()', () => {
    it('devuelve los bonos no pagados', async () => {
      const pendientes = [mockBono({ pagado: false })];
      service.getCobrosPendientes.mockResolvedValue(pendientes);

      const result = await controller.getCobrosPendientes();

      expect(service.getCobrosPendientes).toHaveBeenCalledTimes(1);
      expect(result).toEqual(pendientes);
    });
  });

  // ── registrarPago ─────────────────────────────────────────────────────────
  describe('registrarPago()', () => {
    it('registra el pago y devuelve el bono actualizado', async () => {
      const dto = { metodoPago: 'TRANSFERENCIA' };
      const actualizado = mockBono({ pagado: true, metodoPago: 'TRANSFERENCIA' });
      service.registrarPago.mockResolvedValue(actualizado);

      const result = await controller.registrarPago('bono-1', dto as any);

      expect(service.registrarPago).toHaveBeenCalledWith('bono-1', dto);
      expect(result.pagado).toBe(true);
    });
  });

  // ── cancelar ──────────────────────────────────────────────────────────────
  describe('cancelar()', () => {
    it('cancela el bono y devuelve el resultado', async () => {
      const cancelado = mockBono({ estado: 'CANCELADO' });
      service.cancelar.mockResolvedValue(cancelado);

      const result = await controller.cancelar('bono-1');

      expect(service.cancelar).toHaveBeenCalledWith('bono-1');
      expect(result.estado).toBe('CANCELADO');
    });
  });
});
