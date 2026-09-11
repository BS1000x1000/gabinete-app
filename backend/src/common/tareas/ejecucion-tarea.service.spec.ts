import { Test, TestingModule } from '@nestjs/testing';
import { EstadoEjecucion } from '@prisma/client';
import { EjecucionTareaService, TAREAS } from './ejecucion-tarea.service';
import { PrismaService } from '../../prisma/prisma.service';

const mkPrisma = () => ({
  ejecucionTarea: {
    create: jest.fn().mockResolvedValue({ id: 'ej-1' }),
    update: jest.fn().mockResolvedValue({}),
    findFirst: jest.fn().mockResolvedValue(null),
    findMany: jest.fn().mockResolvedValue([]),
  },
});

describe('EjecucionTareaService', () => {
  let svc: EjecucionTareaService;
  let prisma: ReturnType<typeof mkPrisma>;

  beforeEach(async () => {
    prisma = mkPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EjecucionTareaService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    svc = module.get(EjecucionTareaService);
    jest.spyOn(svc['logger'], 'log').mockImplementation(() => undefined);
    jest.spyOn(svc['logger'], 'error').mockImplementation(() => undefined);
  });

  describe('ejecutar()', () => {
    it('abre la fila antes de correr la tarea y la cierra en OK con el resumen', async () => {
      await svc.ejecutar(TAREAS.FACTURAS_GENERAR, async () => ({ creadas: 3 }));

      expect(prisma.ejecucionTarea.create).toHaveBeenCalledWith({
        data: {
          tarea: TAREAS.FACTURAS_GENERAR,
          estado: EstadoEjecucion.EN_CURSO,
        },
        select: { id: true },
      });
      const cierre = prisma.ejecucionTarea.update.mock.calls[0][0];
      expect(cierre.where).toEqual({ id: 'ej-1' });
      expect(cierre.data.estado).toBe(EstadoEjecucion.OK);
      expect(cierre.data.resumen).toEqual({ creadas: 3 });
      expect(cierre.data.error).toBeNull();
    });

    it('cierra en ERROR con el mensaje y NO relanza: un throw tumbaria el cron', async () => {
      await expect(
        svc.ejecutar(TAREAS.FACTURAS_EMAIL, async () => {
          throw new Error('SMTP caido');
        }),
      ).resolves.toBeUndefined();

      const cierre = prisma.ejecucionTarea.update.mock.calls[0][0];
      expect(cierre.data.estado).toBe(EstadoEjecucion.ERROR);
      expect(cierre.data.error).toBe('SMTP caido');
    });

    it('ejecuta la tarea aunque no se pueda registrar: el trabajo importa mas que su rastro', async () => {
      prisma.ejecucionTarea.create.mockRejectedValue(new Error('BD caida'));
      const tarea = jest.fn().mockResolvedValue(undefined);

      await svc.ejecutar(TAREAS.TOKENS_PURGAR, tarea);

      expect(tarea).toHaveBeenCalled();
      expect(prisma.ejecucionTarea.update).not.toHaveBeenCalled();
    });
  });

  describe('resumenPorTarea()', () => {
    it('lista TODAS las tareas conocidas, tambien las que no se han ejecutado nunca', async () => {
      const resumen = await svc.resumenPorTarea();

      expect(resumen).toHaveLength(Object.values(TAREAS).length);
      expect(resumen.map((r) => r.tarea)).toEqual(
        expect.arrayContaining(Object.values(TAREAS)),
      );
      // Es el caso que importa: sin filas, la tarea sale igual con `ultima: null`.
      expect(resumen.every((r) => r.ultima === null)).toBe(true);
    });
  });

  describe('historial()', () => {
    it('acota el limite para que nadie se traiga la tabla entera', async () => {
      await svc.historial(undefined, 9999);
      expect(prisma.ejecucionTarea.findMany.mock.calls[0][0].take).toBe(200);
    });
  });
});
