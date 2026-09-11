import { Test, TestingModule } from '@nestjs/testing';
import { EstadoInforme } from '@prisma/client';
import { InformesCronService } from './informes-cron.service';
import { InformesService } from './informes.service';
import { InformesPdfService } from './informes-pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/** Mismo doble que en los demás crons: guarda el resumen y no relanza. */
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

/**
 * El archivado del PDF de un informe es fire-and-forget: si falla, el informe
 * queda FINALIZADO con `urlDocumentoFinal = null` y nadie lo reintentaba. Esto
 * fija que el cron los encuentre y los recupere.
 */
describe('InformesCronService', () => {
  let cron: InformesCronService;
  let prisma: {
    informe: { findMany: jest.Mock; update: jest.Mock };
  };
  let storage: { isConfigured: boolean; upload: jest.Mock };
  let pdf: { generarPdf: jest.Mock };
  let tareas: ReturnType<typeof mkTareas>;

  const montar = async (storageConfigurado: boolean) => {
    prisma = {
      informe: {
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    storage = {
      isConfigured: storageConfigurado,
      upload: jest.fn().mockResolvedValue(undefined),
    };
    pdf = { generarPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')) };
    tareas = mkTareas();

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        InformesCronService,
        InformesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
        { provide: InformesPdfService, useValue: pdf },
        { provide: EjecucionTareaService, useValue: tareas },
      ],
    }).compile();

    cron = mod.get(InformesCronService);
  };

  beforeEach(() => montar(true));

  it('busca solo los FINALIZADO sin PDF archivado, los más antiguos primero', async () => {
    await cron.cronReconciliarArchivados();

    const [arg] = prisma.informe.findMany.mock.calls[0] as [
      {
        where: { estado: EstadoInforme; urlDocumentoFinal: null };
        orderBy: { createdAt: string };
        take: number;
      },
    ];
    expect(arg.where).toEqual({
      estado: EstadoInforme.FINALIZADO,
      urlDocumentoFinal: null,
    });
    expect(arg.orderBy).toEqual({ createdAt: 'asc' });
    expect(arg.take).toBe(50);
  });

  it('archiva cada pendiente y guarda su key', async () => {
    prisma.informe.findMany.mockResolvedValue([
      { id: 'inf-1' },
      { id: 'inf-2' },
    ]);

    await cron.cronReconciliarArchivados();

    expect(storage.upload).toHaveBeenCalledTimes(2);
    expect(prisma.informe.update).toHaveBeenCalledWith({
      where: { id: 'inf-1' },
      data: { urlDocumentoFinal: 'informes/inf-1.pdf' },
    });
    expect(tareas.filas).toEqual([
      { tarea: TAREAS.INFORMES_RECONCILIAR, resumen: { recuperados: 2 } },
    ]);
  });

  // Un informe con datos raros no puede dejar sin archivar a los que van detrás.
  it('un fallo individual no arrastra a los demás', async () => {
    prisma.informe.findMany.mockResolvedValue([
      { id: 'inf-1' },
      { id: 'inf-2' },
    ]);
    pdf.generarPdf.mockRejectedValueOnce(new Error('Chromium se cayó'));

    await cron.cronReconciliarArchivados();

    expect(tareas.filas[0].resumen).toEqual({ recuperados: 1 });
    expect(tareas.filas[0].error).toBeUndefined();
  });

  it('sin Storage configurado no consulta nada: sería gastar Chromium para nada', async () => {
    await montar(false);

    await cron.cronReconciliarArchivados();

    expect(prisma.informe.findMany).not.toHaveBeenCalled();
    expect(tareas.filas).toEqual([
      { tarea: TAREAS.INFORMES_RECONCILIAR, resumen: { recuperados: 0 } },
    ]);
  });

  it('registra la ejecución también cuando no hay nada pendiente', async () => {
    prisma.informe.findMany.mockResolvedValue([]);

    await cron.cronReconciliarArchivados();

    expect(tareas.filas).toEqual([
      { tarea: TAREAS.INFORMES_RECONCILIAR, resumen: { recuperados: 0 } },
    ]);
  });
});
