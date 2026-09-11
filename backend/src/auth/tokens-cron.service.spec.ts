import { Test, TestingModule } from '@nestjs/testing';
import { TokensCronService } from './tokens-cron.service';
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

describe('TokensCronService', () => {
  let svc: TokensCronService;
  let prisma: { tokenRevocado: { deleteMany: jest.Mock } };
  let tareas: ReturnType<typeof mkTareas>;

  beforeEach(async () => {
    prisma = {
      tokenRevocado: { deleteMany: jest.fn().mockResolvedValue({ count: 3 }) },
    };
    tareas = mkTareas();
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        TokensCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: EjecucionTareaService, useValue: tareas },
      ],
    }).compile();
    svc = mod.get(TokensCronService);
  });

  it('borra solo los tokens ya caducados', async () => {
    await svc.purgarTokensCaducados();

    const [arg] = prisma.tokenRevocado.deleteMany.mock.calls[0] as [
      { where: { expiresAt: { lt: unknown } } },
    ];
    expect(arg.where.expiresAt.lt).toBeInstanceOf(Date);
  });

  it('devuelve cuantos ha purgado', async () => {
    await expect(svc.purgarTokensCaducados()).resolves.toBe(3);
  });

  it('el cron registra la ejecucion con lo purgado', async () => {
    await svc.cronPurgarTokens();

    expect(tareas.filas).toEqual([
      { tarea: TAREAS.TOKENS_PURGAR, resumen: { purgados: 3 } },
    ]);
  });

  /**
   * Es mantenimiento: si falla, queda registrado y se sigue. El error ya no se
   * traga dentro del metodo —antes devolvia 0 tanto con la BD caida como sin
   * nada que purgar, dos cosas indistinguibles— sino que sube al registro de
   * ejecuciones, que lo guarda como ERROR sin tumbar el proceso.
   */
  it('un fallo no propaga: queda como ERROR de la ejecucion', async () => {
    prisma.tokenRevocado.deleteMany.mockRejectedValue(new Error('BD caida'));

    await expect(svc.cronPurgarTokens()).resolves.toBeUndefined();

    expect(tareas.filas).toEqual([
      { tarea: TAREAS.TOKENS_PURGAR, error: 'BD caida' },
    ]);
  });
});
