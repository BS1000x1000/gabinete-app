import { Test, TestingModule } from '@nestjs/testing';
import { ContratosService } from './contratos.service';
import { ContratosPdfService } from './contratos-pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';

/**
 * La ventana móvil y las sesiones que genera tienen que cerrar exactamente.
 *
 * Estos tests fijan un fallo real: el generador incluye las sesiones del último
 * día de la ventana (`generarFechasRecurrentes` cierra a las 23:59), pero
 * guardaba `generadoHasta` con la hora de INICIO de ese día. La sesión de ese
 * último día quedaba creada por el generador y fuera de su propia ventana, así
 * que el recolocador no la veía y la dejaba en el día viejo: al pasar de lunes a
 * miércoles quedaba un lunes suelto al final de la serie.
 */
describe('ContratosService — ventana móvil', () => {
  let svc: ContratosService;
  let prisma: any;

  const sesionesCreadas: any[] = [];

  beforeEach(async () => {
    sesionesCreadas.length = 0;

    prisma = {
      contratoServicio: {
        findUniqueOrThrow: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      sesion: {
        createMany: jest.fn().mockImplementation(({ data }) => {
          sesionesCreadas.push(...data);
          return { count: data.length };
        }),
      },
      festivo: { findMany: jest.fn().mockResolvedValue([]) },
      periodoVacaciones: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratosService,
        { provide: PrismaService, useValue: prisma },
        { provide: ContratosPdfService, useValue: { generarPdf: jest.fn() } },
        { provide: StorageService, useValue: { isConfigured: false } },
      ],
    }).compile();

    svc = module.get(ContratosService);
  });

  const montarContrato = (slotDiaISO: number) => {
    prisma.contratoServicio.findUniqueOrThrow.mockResolvedValue({
      id: 'ctr-1',
      clienteId: 'cli-1',
      trabajadorId: 'tra-1',
      tipoSesion: 'PEDAGOGIA',
      fechaInicio: new Date(2026, 8, 1),
      fechaFin: null,
      generadoHasta: null,
      slots: [
        {
          diaSemana: slotDiaISO,
          horaInicio: '10:00',
          horaFin: '10:50',
          modalidad: 'PRESENCIAL',
        },
      ],
      cliente: { provincia: 'Madrid' },
    });
  };

  /** Se ejecuta para los 7 días: el fallo solo asomaba según dónde cayera el corte. */
  for (let dia = 1; dia <= 7; dia++) {
    it(`ninguna sesión queda fuera de la ventana (día ISO ${dia})`, async () => {
      montarContrato(dia);

      await svc.generarSesionesContrato('ctr-1');

      const generadoHasta: Date =
        prisma.contratoServicio.update.mock.calls[0][0].data.generadoHasta;

      expect(sesionesCreadas.length).toBeGreaterThan(0);
      for (const s of sesionesCreadas) {
        expect(s.fechaHoraInicio.getTime()).toBeLessThanOrEqual(generadoHasta.getTime());
      }
    });
  }

  it('marca la ventana aunque no genere ninguna sesión', async () => {
    montarContrato(3);
    // Todo el rango de vacaciones: no sale ninguna sesión
    prisma.periodoVacaciones.findMany.mockResolvedValue([
      { fechaInicio: new Date(2026, 0, 1), fechaFin: new Date(2027, 11, 31) },
    ]);

    await svc.generarSesionesContrato('ctr-1');

    // Si no se marcara, el cron reintentaría el mismo tramo vacío cada mes
    expect(prisma.contratoServicio.update).toHaveBeenCalled();
    expect(sesionesCreadas.length).toBe(0);
  });

  it('cierra la ventana al final del día, no al principio', async () => {
    montarContrato(3);

    await svc.generarSesionesContrato('ctr-1');

    const generadoHasta: Date =
      prisma.contratoServicio.update.mock.calls[0][0].data.generadoHasta;
    expect(generadoHasta.getHours()).toBe(23);
    expect(generadoHasta.getMinutes()).toBe(59);
  });
});
