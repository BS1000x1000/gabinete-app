import { Test, TestingModule } from '@nestjs/testing';
import { EstadoContrato } from '@prisma/client';
import { ContratosCronService } from './contratos-cron.service';
import { ContratosService } from './contratos.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/** Doble de `EjecucionTareaService`: guarda el resumen y nunca relanza. */
type Resumen = Record<string, unknown>;
type Fila = { tarea: string; resumen?: Resumen; error?: string };

const mkTareas = () => {
  const filas: Fila[] = [];
  return {
    filas,
    ejecutar: jest.fn(
      async (
        tarea: string,
        fn: () => Promise<Resumen | void>,
      ): Promise<void> => {
        try {
          filas.push({ tarea, resumen: (await fn()) ?? undefined });
        } catch (err) {
          filas.push({
            tarea,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },
    ),
  };
};

describe('ContratosCronService', () => {
  let svc: ContratosCronService;
  let prisma: {
    contratoServicio: { findMany: jest.Mock };
    $queryRaw: jest.Mock;
  };
  let contratos: { generarSesionesContrato: jest.Mock };
  let tareas: ReturnType<typeof mkTareas>;

  /** El advisory lock se pide una vez y se suelta al final. */
  const conLock = (tomado: boolean) => {
    prisma.$queryRaw
      .mockResolvedValueOnce([{ locked: tomado }]) // pg_try_advisory_lock
      .mockResolvedValue([{}]); // pg_advisory_unlock
  };

  beforeEach(async () => {
    prisma = {
      contratoServicio: {
        findMany: jest.fn().mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]),
      },
      $queryRaw: jest.fn(),
    };
    contratos = { generarSesionesContrato: jest.fn().mockResolvedValue(4) };
    tareas = mkTareas();

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        ContratosCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: ContratosService, useValue: contratos },
        { provide: EjecucionTareaService, useValue: tareas },
      ],
    }).compile();

    svc = mod.get(ContratosCronService);
  });

  it('registra la ejecución con el recuento de la pasada', async () => {
    conLock(true);

    await svc.cronExtenderVentana();

    const [arg] = prisma.contratoServicio.findMany.mock.calls[0] as [
      { where: { estado: EstadoContrato } },
    ];
    expect(arg.where.estado).toBe(EstadoContrato.ACTIVO);
    expect(tareas.filas).toEqual([
      {
        tarea: TAREAS.CONTRATOS_VENTANA,
        resumen: { procesados: 2, creadas: 8, fallidos: 0 },
      },
    ]);
  });

  /**
   * El advisory lock serializa réplicas. Que la pasada se salte el trabajo
   * porque otra instancia lo está haciendo no es un fallo, pero sí algo que
   * hay que poder distinguir de "no había contratos".
   */
  it('sin el lock no toca nada y lo dice en el resumen', async () => {
    conLock(false);

    await svc.cronExtenderVentana();

    expect(prisma.contratoServicio.findMany).not.toHaveBeenCalled();
    expect(tareas.filas[0].resumen).toMatchObject({
      procesados: 0,
      creadas: 0,
      omitida: true,
    });
  });

  // Un contrato con datos raros no puede impedir que los demás generen.
  it('cuenta los contratos fallidos sin abortar la pasada', async () => {
    conLock(true);
    contratos.generarSesionesContrato
      .mockRejectedValueOnce(new Error('horario imposible'))
      .mockResolvedValueOnce(4);

    await svc.cronExtenderVentana();

    expect(tareas.filas[0].resumen).toEqual({
      procesados: 2,
      creadas: 4,
      fallidos: 1,
    });
  });

  it('suelta el lock aunque la pasada falle, y el fallo queda como ERROR', async () => {
    conLock(true);
    prisma.contratoServicio.findMany.mockRejectedValue(new Error('BD caida'));

    await expect(svc.cronExtenderVentana()).resolves.toBeUndefined();

    expect(tareas.filas[0].error).toBe('BD caida');
    // 1 = tomar el lock, 2 = soltarlo en el `finally`.
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(2);
  });
});
