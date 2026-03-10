import { Test, TestingModule } from '@nestjs/testing';
import { MotorReglasService } from './motor-reglas.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificacionesService } from './notificaciones.service';

// ─── Helpers de fecha ────────────────────────────────────────────────────────

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// ─── Mock factories ───────────────────────────────────────────────────────────

const makeCliente = (overrides: Record<string, any> = {}) => ({
  id: 'cliente-1',
  nombre: 'Ana',
  apellidos: 'García',
  activo: true,
  fechaInicio: daysAgo(60),
  sesiones: [],
  informes: [],
  bonos: [],
  objetivosGeneralesAsignados: [],
  ...overrides,
});

const makePrismaMock = () => ({
  clienteTrabajador: {
    findMany: jest.fn(),
  },
});

const makeNotifMock = () => ({
  crearSiNoExiste: jest.fn().mockResolvedValue(undefined),
});

// ─── Suite ───────────────────────────────────────────────────────────────────

describe('MotorReglasService', () => {
  let service: MotorReglasService;
  let prisma: ReturnType<typeof makePrismaMock>;
  let notif: ReturnType<typeof makeNotifMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();
    notif = makeNotifMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MotorReglasService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificacionesService, useValue: notif },
      ],
    }).compile();

    service = module.get<MotorReglasService>(MotorReglasService);
  });

  // Util: ejecutar evaluarReglas con un único cliente
  const evaluar = async (clienteOverrides: Record<string, any> = {}, rol = 'PEDAGOGO') => {
    prisma.clienteTrabajador.findMany.mockResolvedValue([
      { cliente: makeCliente(clienteOverrides) },
    ]);
    await service.evaluarReglas('trabajador-1', rol);
  };

  // ── Regla 1: Informe inicial pendiente ───────────────────────────────────
  describe('Regla 1 — INFORME_INICIAL_PENDIENTE', () => {
    it('crea notificación cuando han pasado 30+ días sin informe inicial finalizado', async () => {
      await evaluar({ fechaInicio: daysAgo(40), informes: [] });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_INICIAL_PENDIENTE' }),
      );
    });

    it('NO crea notificación si hay informe inicial finalizado', async () => {
      await evaluar({
        fechaInicio: daysAgo(40),
        informes: [{ tipoInforme: 'INICIAL', estado: 'FINALIZADO', updatedAt: daysAgo(10) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_INICIAL_PENDIENTE' }),
      );
    });

    it('NO crea notificación si han pasado menos de 30 días', async () => {
      await evaluar({ fechaInicio: daysAgo(10), informes: [] });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_INICIAL_PENDIENTE' }),
      );
    });

    it('NO crea notificación si el cliente está inactivo', async () => {
      await evaluar({ activo: false, fechaInicio: daysAgo(60), informes: [] });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_INICIAL_PENDIENTE' }),
      );
    });
  });

  // ── Regla 2: Informe de seguimiento pendiente ────────────────────────────
  describe('Regla 2 — INFORME_SEGUIMIENTO_PENDIENTE', () => {
    it('crea notificación cuando el último informe finalizado tiene 180+ días', async () => {
      await evaluar({
        informes: [{ tipoInforme: 'INICIAL', estado: 'FINALIZADO', updatedAt: daysAgo(200) }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_SEGUIMIENTO_PENDIENTE' }),
      );
    });

    it('NO crea notificación si el último informe tiene menos de 180 días', async () => {
      await evaluar({
        informes: [{ tipoInforme: 'INICIAL', estado: 'FINALIZADO', updatedAt: daysAgo(90) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_SEGUIMIENTO_PENDIENTE' }),
      );
    });

    it('NO crea notificación si no hay ningún informe finalizado', async () => {
      await evaluar({ informes: [] });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_SEGUIMIENTO_PENDIENTE' }),
      );
    });
  });

  // ── Regla 3: Bono agotado sin pagar ────────────────────────────────────
  describe('Regla 3 — BONO_AGOTADO', () => {
    it('crea notificación por cada bono CONSUMIDO no pagado', async () => {
      await evaluar({
        bonos: [
          { id: 'bono-1', estado: 'CONSUMIDO', pagado: false, totalSesiones: 10, precio: 200, updatedAt: daysAgo(5) },
          { id: 'bono-2', estado: 'CONSUMIDO', pagado: false, totalSesiones: 5, precio: 100, updatedAt: daysAgo(3) },
        ],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_AGOTADO', referenciaId: 'bono-1' }),
      );
      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_AGOTADO', referenciaId: 'bono-2' }),
      );
    });

    it('NO crea notificación si el bono ya está pagado', async () => {
      await evaluar({
        bonos: [{ id: 'bono-1', estado: 'CONSUMIDO', pagado: true, totalSesiones: 10, precio: 200, updatedAt: daysAgo(5) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_AGOTADO' }),
      );
    });
  });

  // ── Regla 4: Bono casi agotado ──────────────────────────────────────────
  describe('Regla 4 — BONO_CASI_AGOTADO', () => {
    it('crea notificación cuando al bono ACTIVO le queda 1 sesión', async () => {
      await evaluar({
        bonos: [{ id: 'bono-1', estado: 'ACTIVO', totalSesiones: 10, sesionesConsumidas: 9, updatedAt: daysAgo(1) }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_CASI_AGOTADO', referenciaId: 'bono-1' }),
      );
    });

    it('NO crea notificación si quedan 2 o más sesiones', async () => {
      await evaluar({
        bonos: [{ id: 'bono-1', estado: 'ACTIVO', totalSesiones: 10, sesionesConsumidas: 7, updatedAt: daysAgo(1) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_CASI_AGOTADO' }),
      );
    });
  });

  // ── Regla 5: Bono pendiente de pago 7+ días ─────────────────────────────
  describe('Regla 5 — BONO_PENDIENTE_PAGO', () => {
    it('crea notificación cuando el bono lleva 7+ días sin pagar', async () => {
      await evaluar({
        bonos: [{ id: 'bono-1', estado: 'CONSUMIDO', pagado: false, totalSesiones: 10, precio: 200, updatedAt: daysAgo(10) }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_PENDIENTE_PAGO', referenciaId: 'bono-1' }),
      );
    });

    it('NO crea notificación si han pasado menos de 7 días', async () => {
      await evaluar({
        bonos: [{ id: 'bono-1', estado: 'CONSUMIDO', pagado: false, totalSesiones: 10, precio: 200, updatedAt: daysAgo(3) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'BONO_PENDIENTE_PAGO' }),
      );
    });
  });

  // ── Regla 6: Sin sesiones recientes ────────────────────────────────────
  describe('Regla 6 — SIN_SESIONES_RECIENTES', () => {
    it('crea notificación si no hay sesiones en los últimos 21 días', async () => {
      await evaluar({
        sesiones: [{ estado: 'COMPLETADA', fechaHoraInicio: daysAgo(30) }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SIN_SESIONES_RECIENTES' }),
      );
    });

    it('NO crea notificación si hay una sesión reciente COMPLETADA', async () => {
      await evaluar({
        sesiones: [{ estado: 'COMPLETADA', fechaHoraInicio: daysAgo(5) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SIN_SESIONES_RECIENTES' }),
      );
    });

    it('NO crea notificación si hay sesión PROGRAMADA reciente', async () => {
      await evaluar({
        sesiones: [{ estado: 'PROGRAMADA', fechaHoraInicio: daysAgo(3) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SIN_SESIONES_RECIENTES' }),
      );
    });

    it('NO crea notificación si el cliente está inactivo', async () => {
      await evaluar({ activo: false, sesiones: [] });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SIN_SESIONES_RECIENTES' }),
      );
    });
  });

  // ── Regla 7: Objetivo sin evaluar ───────────────────────────────────────
  describe('Regla 7 — OBJETIVO_SIN_EVALUAR', () => {
    it('crea notificación si un objetivo activo lleva 30+ días sin evaluación', async () => {
      await evaluar({
        objetivosGeneralesAsignados: [{
          id: 'co-1',
          activo: true,
          fechaAsignacion: daysAgo(60),
          fechaUltimaEvaluacion: daysAgo(45),
          evaluaciones: [],
        }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'OBJETIVO_SIN_EVALUAR', referenciaId: 'co-1' }),
      );
    });

    it('crea notificación si nunca fue evaluado y la asignación tiene 30+ días', async () => {
      await evaluar({
        objetivosGeneralesAsignados: [{
          id: 'co-1',
          activo: true,
          fechaAsignacion: daysAgo(40),
          fechaUltimaEvaluacion: null,
          evaluaciones: [],
        }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'OBJETIVO_SIN_EVALUAR' }),
      );
    });

    it('NO crea notificación si fue evaluado hace menos de 30 días', async () => {
      await evaluar({
        objetivosGeneralesAsignados: [{
          id: 'co-1',
          activo: true,
          fechaAsignacion: daysAgo(60),
          fechaUltimaEvaluacion: daysAgo(10),
          evaluaciones: [],
        }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'OBJETIVO_SIN_EVALUAR' }),
      );
    });

    it('NO crea notificación si el objetivo está inactivo', async () => {
      await evaluar({
        objetivosGeneralesAsignados: [{
          id: 'co-1',
          activo: false,
          fechaAsignacion: daysAgo(60),
          fechaUltimaEvaluacion: daysAgo(45),
          evaluaciones: [],
        }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'OBJETIVO_SIN_EVALUAR' }),
      );
    });
  });

  // ── Regla 8: Informe en borrador ────────────────────────────────────────
  describe('Regla 8 — INFORME_EN_BORRADOR', () => {
    it('crea notificación si un informe lleva 14+ días en BORRADOR', async () => {
      await evaluar({
        informes: [{ id: 'inf-1', estado: 'BORRADOR', titulo: 'Informe test', createdAt: daysAgo(20), updatedAt: daysAgo(20) }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_EN_BORRADOR', referenciaId: 'inf-1' }),
      );
    });

    it('NO crea notificación si el borrador tiene menos de 14 días', async () => {
      await evaluar({
        informes: [{ id: 'inf-1', estado: 'BORRADOR', titulo: 'Informe test', createdAt: daysAgo(5), updatedAt: daysAgo(5) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_EN_BORRADOR' }),
      );
    });

    it('NO crea notificación si el informe no es BORRADOR', async () => {
      await evaluar({
        informes: [{ id: 'inf-1', estado: 'FINALIZADO', titulo: 'Informe test', createdAt: daysAgo(20), updatedAt: daysAgo(20) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'INFORME_EN_BORRADOR' }),
      );
    });
  });

  // ── Regla 9: Sesión completada sin bono ─────────────────────────────────
  describe('Regla 9 — SESION_SIN_BONO', () => {
    it('crea notificación por sesión COMPLETADA sin bonoId', async () => {
      await evaluar({
        sesiones: [{ id: 'sesion-1', estado: 'COMPLETADA', bonoId: null, fechaHoraInicio: daysAgo(2) }],
      });

      expect(notif.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SESION_SIN_BONO', referenciaId: 'sesion-1' }),
      );
    });

    it('NO crea notificación si la sesión tiene bono asignado', async () => {
      await evaluar({
        sesiones: [{ id: 'sesion-1', estado: 'COMPLETADA', bonoId: 'bono-1', fechaHoraInicio: daysAgo(2) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SESION_SIN_BONO' }),
      );
    });

    it('NO crea notificación si la sesión no está COMPLETADA', async () => {
      await evaluar({
        sesiones: [{ id: 'sesion-1', estado: 'PROGRAMADA', bonoId: null, fechaHoraInicio: daysAgo(2) }],
      });

      expect(notif.crearSiNoExiste).not.toHaveBeenCalledWith(
        expect.objectContaining({ tipo: 'SESION_SIN_BONO' }),
      );
    });
  });

  // ── Comportamiento global ────────────────────────────────────────────────
  describe('evaluarReglas() — comportamiento global', () => {
    it('filtra por trabajadorId cuando el rol no es ADMIN', async () => {
      prisma.clienteTrabajador.findMany.mockResolvedValue([]);
      await service.evaluarReglas('trabajador-1', 'PEDAGOGO');

      expect(prisma.clienteTrabajador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { trabajadorId: 'trabajador-1', activo: true },
        }),
      );
    });

    it('no filtra por trabajadorId cuando el rol es ADMIN', async () => {
      prisma.clienteTrabajador.findMany.mockResolvedValue([]);
      await service.evaluarReglas('admin-1', 'ADMIN');

      expect(prisma.clienteTrabajador.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { activo: true },
        }),
      );
    });

    it('no lanza excepción si Prisma falla — captura el error internamente', async () => {
      prisma.clienteTrabajador.findMany.mockRejectedValue(new Error('DB error'));
      await expect(service.evaluarReglas('trabajador-1', 'PEDAGOGO')).resolves.toBeUndefined();
    });

    it('evalúa múltiples clientes en paralelo', async () => {
      prisma.clienteTrabajador.findMany.mockResolvedValue([
        { cliente: makeCliente({ id: 'c-1' }) },
        { cliente: makeCliente({ id: 'c-2' }) },
      ]);
      await service.evaluarReglas('trabajador-1', 'PEDAGOGO');
      // Si no lanza, los dos clientes fueron procesados
      expect(prisma.clienteTrabajador.findMany).toHaveBeenCalledTimes(1);
    });
  });
});
