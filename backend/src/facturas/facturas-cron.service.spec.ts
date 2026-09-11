import { Test, TestingModule } from '@nestjs/testing';
import { FacturasCronService } from './facturas-cron.service';
import { FacturasService } from './facturas.service';
import { FacturasGestoriaService } from './facturas-gestoria.service';
import { AuditService } from '../auth/audit.service';
import {
  EjecucionTareaService,
  TAREAS,
} from '../common/tareas/ejecucion-tarea.service';

/**
 * Doble de `EjecucionTareaService` que respeta su contrato: ejecuta la funcion,
 * guarda el resumen que devuelva y **nunca relanza** el error.
 */
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

/** Congela el reloj en una fecha local concreta. */
const enLaFecha = (anio: number, mes: number, dia: number) => {
  jest.useFakeTimers().setSystemTime(new Date(anio, mes - 1, dia, 9, 0, 0));
};

describe('FacturasCronService', () => {
  let svc: FacturasCronService;
  let facturas: {
    generarFacturasMes: jest.Mock;
    enviarEmailsPendientes: jest.Mock;
    reconciliarPdfsPendientes: jest.Mock;
  };
  let gestoria: { entregarPeriodicas: jest.Mock };
  let audit: { registrar: jest.Mock };
  let tareas: ReturnType<typeof mkTareas>;

  beforeEach(async () => {
    facturas = {
      generarFacturasMes: jest.fn().mockResolvedValue({
        periodo: '2026-09',
        creadas: 3,
        omitidas: 1,
        fallidas: [],
      }),
      enviarEmailsPendientes: jest.fn().mockResolvedValue(0),
      reconciliarPdfsPendientes: jest.fn().mockResolvedValue(0),
    };
    gestoria = { entregarPeriodicas: jest.fn().mockResolvedValue(2) };
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    tareas = mkTareas();

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        FacturasCronService,
        { provide: FacturasService, useValue: facturas },
        { provide: FacturasGestoriaService, useValue: gestoria },
        { provide: AuditService, useValue: audit },
        { provide: EjecucionTareaService, useValue: tareas },
      ],
    }).compile();

    svc = mod.get(FacturasCronService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Generación ─────────────────────────────────────────────────────────────

  describe('cronGenerarFacturasMes()', () => {
    it('registra la ejecución con el recuento de lo generado', async () => {
      enLaFecha(2026, 9, 1);

      await svc.cronGenerarFacturasMes();

      expect(facturas.generarFacturasMes).toHaveBeenCalledWith(2026, 9);
      expect(tareas.filas).toEqual([
        {
          tarea: TAREAS.FACTURAS_GENERAR,
          resumen: { periodo: '2026-09', creadas: 3, omitidas: 1, fallidas: 0 },
        },
      ]);
    });

    /**
     * "No se generó julio" y "el cron no se disparó en julio" son cosas muy
     * distintas y sin fila se ven igual. Por eso el caso de omisión también
     * deja rastro.
     */
    it('deja fila de omitida el 1 de julio, sin llamar a la generación', async () => {
      enLaFecha(2026, 7, 1);

      await svc.cronGenerarFacturasMes();

      expect(facturas.generarFacturasMes).not.toHaveBeenCalled();
      expect(tareas.filas).toHaveLength(1);
      expect(tareas.filas[0].resumen).toMatchObject({
        omitida: true,
        motivo: expect.stringContaining('agosto') as unknown as string,
      });
    });

    it('el 1 de agosto genera JULIO, no agosto', async () => {
      enLaFecha(2026, 8, 1);

      await svc.cronGenerarFacturasMes();

      expect(facturas.generarFacturasMes).toHaveBeenCalledWith(2026, 7);
    });

    // El fallo total queda como ERROR en la ejecución, pero el rastro RGPD de
    // AuditLog se mantiene aparte: son dos registros con propósitos distintos.
    it('un fallo total se registra en la ejecución Y en AuditLog', async () => {
      enLaFecha(2026, 9, 1);
      facturas.generarFacturasMes.mockRejectedValue(new Error('BD caida'));

      await expect(svc.cronGenerarFacturasMes()).resolves.toBeUndefined();

      expect(tareas.filas[0].error).toBe('BD caida');
      const [traza] = audit.registrar.mock.calls[0] as [
        {
          evento: string;
          recurso: string;
          metadata: { origen: string; error: string };
        },
      ];
      expect(traza.evento).toBe('FACTURA_GENERACION');
      expect(traza.recurso).toBe('2026-09');
      expect(traza.metadata).toMatchObject({
        origen: 'cron',
        error: 'BD caida',
      });
    });
  });

  // ── Envío de emails ────────────────────────────────────────────────────────

  describe('cronEnviarEmailsFacturas()', () => {
    it('registra la ejecución con lo recuperado y lo enviado', async () => {
      enLaFecha(2026, 9, 12);
      facturas.reconciliarPdfsPendientes.mockResolvedValue(1);
      facturas.enviarEmailsPendientes.mockResolvedValue(4);

      await svc.cronEnviarEmailsFacturas();

      expect(tareas.filas).toEqual([
        {
          tarea: TAREAS.FACTURAS_EMAIL,
          resumen: { periodo: '2026-09', recuperadas: 1, enviados: 4 },
        },
      ]);
    });

    it('deja fila de omitida cuando no toca enviar, en vez de no dejar nada', async () => {
      enLaFecha(2026, 7, 15);

      await svc.cronEnviarEmailsFacturas();

      expect(facturas.enviarEmailsPendientes).not.toHaveBeenCalled();
      expect(tareas.filas).toHaveLength(1);
      expect(tareas.filas[0].tarea).toBe(TAREAS.FACTURAS_EMAIL);
      expect(tareas.filas[0].resumen).toMatchObject({ omitida: true });
    });

    // Sin esto habria que esperar al cron de las 03:00 del dia siguiente para
    // que una factura generada esta madrugada sin PDF pudiera enviarse.
    it('reconcilia los PDF que falten ANTES de enviar', async () => {
      enLaFecha(2026, 9, 1);
      const orden: string[] = [];
      facturas.reconciliarPdfsPendientes.mockImplementation(() => {
        orden.push('reconciliar');
        return Promise.resolve(0);
      });
      facturas.enviarEmailsPendientes.mockImplementation(() => {
        orden.push('enviar');
        return Promise.resolve(0);
      });

      await svc.cronEnviarEmailsFacturas();

      expect(orden).toEqual(['reconciliar', 'enviar']);
    });

    /**
     * El bug que cierra el paso a cron diario.
     *
     * El día 1 la factura no tiene PDF (Puppeteer falló), así que el envío la
     * ignora: filtra por `urlPdfR2 != null`. Con el cron mensual la
     * reconciliación de las 03:00 le ponía el PDF al día siguiente, pero el
     * envío ya no volvía hasta el mes que viene y esa factura no salía nunca.
     */
    it('una factura sin PDF el día 1 sale en la pasada del día siguiente', async () => {
      // Estado de la única factura del mes: generada, sin PDF, sin enviar.
      const factura = { tienePdf: false, enviada: false };

      facturas.reconciliarPdfsPendientes.mockImplementation(() => {
        if (factura.tienePdf) return Promise.resolve(0);
        factura.tienePdf = true;
        return Promise.resolve(1);
      });
      facturas.enviarEmailsPendientes.mockImplementation(() => {
        // Espejo del filtro real: `emailEnviado: false` + `urlPdfR2 != null`.
        if (!factura.tienePdf || factura.enviada) return Promise.resolve(0);
        factura.enviada = true;
        return Promise.resolve(1);
      });

      // Día 1: el archivado del PDF ya había fallado antes de este cron.
      enLaFecha(2026, 9, 1);
      factura.tienePdf = false;
      facturas.reconciliarPdfsPendientes.mockImplementationOnce(() =>
        Promise.resolve(0),
      );
      await svc.cronEnviarEmailsFacturas();
      expect(factura.enviada).toBe(false);

      // Día 2: el cron vuelve a pasar — antes no lo hacía hasta el mes siguiente.
      enLaFecha(2026, 9, 2);
      await svc.cronEnviarEmailsFacturas();

      expect(factura.enviada).toBe(true);
      expect(tareas.filas[1].resumen).toMatchObject({ enviados: 1 });
    });

    it('no reenvía en la tercera pasada', async () => {
      enLaFecha(2026, 9, 3);
      facturas.enviarEmailsPendientes.mockResolvedValue(0);

      await svc.cronEnviarEmailsFacturas();

      expect(tareas.filas[0].resumen).toMatchObject({ enviados: 0 });
    });
  });

  // ── Reconciliación y gestoría ──────────────────────────────────────────────

  it('cronReconciliarPdfs registra cuántas recuperó', async () => {
    facturas.reconciliarPdfsPendientes.mockResolvedValue(7);

    await svc.cronReconciliarPdfs();

    expect(tareas.filas).toEqual([
      { tarea: TAREAS.FACTURAS_RECONCILIAR, resumen: { recuperadas: 7 } },
    ]);
  });

  it('cronEntregaGestoria registra cuántas entregas salieron', async () => {
    await svc.cronEntregaGestoria();

    expect(tareas.filas).toEqual([
      { tarea: TAREAS.FACTURAS_GESTORIA, resumen: { entregados: 2 } },
    ]);
  });

  it('un fallo de la gestoría no propaga: queda como ERROR de la ejecución', async () => {
    gestoria.entregarPeriodicas.mockRejectedValue(new Error('SMTP caido'));

    await expect(svc.cronEntregaGestoria()).resolves.toBeUndefined();

    expect(tareas.filas[0].error).toBe('SMTP caido');
  });
});
