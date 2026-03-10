import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// ── Mock helpers ─────────────────────────────────────────────────────────────
const mockReq = (userId = 'trabajador-1', nombre = 'Laura') => ({
  user: { userId, nombre },
});

const makeDashboardServiceMock = () => ({
  getEstadisticasGenerales: jest.fn(),
  getEstadisticasTrabajador: jest.fn(),
  getClientesMasActivos: jest.fn(),
  getObjetivosMasTrabajados: jest.fn(),
  getActividadReciente: jest.fn(),
  getDistribucionSesionesPorTipo: jest.fn(),
  getResumenCompleto: jest.fn(),
  getMiDia: jest.fn(),
});

// ── Suite ────────────────────────────────────────────────────────────────────
describe('DashboardController', () => {
  let controller: DashboardController;
  let service: ReturnType<typeof makeDashboardServiceMock>;

  beforeEach(async () => {
    service = makeDashboardServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [{ provide: DashboardService, useValue: service }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  // ── getEstadisticasGenerales ──────────────────────────────────────────────
  describe('getEstadisticasGenerales()', () => {
    it('delega al servicio y devuelve estadísticas generales', async () => {
      const expected = { totalClientes: 50, totalSesiones: 200 };
      service.getEstadisticasGenerales.mockResolvedValue(expected);

      const result = await controller.getEstadisticasGenerales();

      expect(service.getEstadisticasGenerales).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });

  // ── getMisEstadisticas ────────────────────────────────────────────────────
  describe('getMisEstadisticas()', () => {
    it('extrae userId del request y devuelve estadísticas del trabajador', async () => {
      const expected = { clientesAsignados: 12, sesionesHoy: 3 };
      service.getEstadisticasTrabajador.mockResolvedValue(expected);

      const result = await controller.getMisEstadisticas(mockReq());

      expect(service.getEstadisticasTrabajador).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(expected);
    });
  });

  // ── getClientesMasActivos ─────────────────────────────────────────────────
  describe('getClientesMasActivos()', () => {
    it('pasa el límite al servicio', async () => {
      const expected = [{ clienteId: 'c-1', totalSesiones: 30 }];
      service.getClientesMasActivos.mockResolvedValue(expected);

      const result = await controller.getClientesMasActivos(5);

      expect(service.getClientesMasActivos).toHaveBeenCalledWith(5);
      expect(result).toEqual(expected);
    });

    it('usa límite 10 por defecto', async () => {
      service.getClientesMasActivos.mockResolvedValue([]);

      await controller.getClientesMasActivos(10);

      expect(service.getClientesMasActivos).toHaveBeenCalledWith(10);
    });
  });

  // ── getObjetivosMasTrabajados ─────────────────────────────────────────────
  describe('getObjetivosMasTrabajados()', () => {
    it('devuelve top N objetivos más trabajados', async () => {
      const expected = [{ objetivoId: 'obj-1', veces: 15 }];
      service.getObjetivosMasTrabajados.mockResolvedValue(expected);

      const result = await controller.getObjetivosMasTrabajados(10);

      expect(service.getObjetivosMasTrabajados).toHaveBeenCalledWith(10);
      expect(result).toEqual(expected);
    });
  });

  // ── getActividadReciente ──────────────────────────────────────────────────
  describe('getActividadReciente()', () => {
    it('devuelve las últimas N actividades', async () => {
      const expected = [{ tipo: 'SESION_COMPLETADA', fecha: new Date() }];
      service.getActividadReciente.mockResolvedValue(expected);

      const result = await controller.getActividadReciente(10);

      expect(service.getActividadReciente).toHaveBeenCalledWith(10);
      expect(result).toEqual(expected);
    });
  });

  // ── getDistribucionSesionesPorTipo ────────────────────────────────────────
  describe('getDistribucionSesionesPorTipo()', () => {
    it('devuelve la distribución de sesiones agrupada por tipo', async () => {
      const expected = [
        { tipo: 'PEDAGOGIA', cantidad: 80 },
        { tipo: 'LOGOPEDIA', cantidad: 40 },
      ];
      service.getDistribucionSesionesPorTipo.mockResolvedValue(expected);

      const result = await controller.getDistribucionSesionesPorTipo();

      expect(service.getDistribucionSesionesPorTipo).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expected);
    });
  });

  // ── getResumenCompleto ────────────────────────────────────────────────────
  describe('getResumenCompleto()', () => {
    it('extrae userId y devuelve resumen del dashboard', async () => {
      const expected = { estadisticas: {}, sesionesHoy: [] };
      service.getResumenCompleto.mockResolvedValue(expected);

      const result = await controller.getResumenCompleto(mockReq());

      expect(service.getResumenCompleto).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(expected);
    });
  });

  // ── getMiDia ──────────────────────────────────────────────────────────────
  describe('getMiDia()', () => {
    it('extrae userId y nombre del request y devuelve la vista del día', async () => {
      const expected = {
        fecha: new Date().toISOString(),
        sesionesHoy: [],
        alertas: [],
        saludo: 'Buenos días, Laura',
      };
      service.getMiDia.mockResolvedValue(expected);

      const result = await controller.getMiDia(mockReq());

      expect(service.getMiDia).toHaveBeenCalledWith('trabajador-1', 'Laura');
      expect(result).toEqual(expected);
    });
  });
});
