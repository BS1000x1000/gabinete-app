import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { GasService } from './gas.service';
import { PrismaService } from '../prisma/prisma.service';

const mkPrisma = () => ({
  clienteObjetivo: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  evaluacionGAS: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  descripcionNivelGAS: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
});

// Forma de los argumentos con los que `getEvolucionCliente` llama a Prisma.
// Tipada a mano porque `jest.fn()` sin genericos devuelve `any` en `mock.calls`,
// y sobre `any` no hay asercion que compruebe nada.
type RangoFecha = { gte?: Date; lte?: Date };
type ArgsFindMany = {
  where: { clienteId: string; activo?: boolean };
  include: {
    objetivoGeneral: unknown;
    descripcionesNiveles: unknown;
    evaluaciones: {
      where?: { fecha: RangoFecha };
      orderBy: unknown;
    };
  };
};

/** El rango de fechas del include, exigiendo que el filtro exista. */
const rangoDe = (args: ArgsFindMany): RangoFecha => {
  const fecha = args.include.evaluaciones.where?.fecha;
  if (!fecha) throw new Error('Se esperaba un filtro de fecha en evaluaciones');
  return fecha;
};

// Un ClienteObjetivo tal y como lo devuelve el include de `getEvolucionCliente`.
const mkObjetivo = (overrides: Record<string, any> = {}) => ({
  id: 'co-1',
  clienteId: 'c1',
  objetivoGeneralId: 'og-1',
  activo: true,
  fechaAsignacion: new Date('2026-09-01T10:00:00.000Z'),
  nivelGASActual: 1,
  fechaUltimaEvaluacion: new Date('2026-10-28T10:00:00.000Z'),
  objetivoGeneral: {
    titulo: 'Mantener la atención sostenida 15 minutos',
    descripcion: 'Trabajo con tareas de lápiz y papel',
    areaDesarrollo: { nombre: 'Atención', color: '#2d4a3e' },
  },
  descripcionesNiveles: [],
  evaluaciones: [],
  ...overrides,
});

describe('GasService — getEvolucionCliente()', () => {
  let svc: GasService;
  let prisma: ReturnType<typeof mkPrisma>;

  beforeEach(async () => {
    prisma = mkPrisma();
    const m: TestingModule = await Test.createTestingModule({
      providers: [GasService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    svc = m.get(GasService);
  });

  const conFiltros = async (
    query: Record<string, any> = {},
  ): Promise<ArgsFindMany> => {
    prisma.clienteObjetivo.findMany.mockResolvedValue([]);
    await svc.getEvolucionCliente('c1', query);
    const [args] = prisma.clienteObjetivo.findMany.mock.calls[0] as [
      ArgsFindMany,
    ];
    return args;
  };

  // ── Filtro de periodo ────────────────────────────────────────────────────
  //
  // `EvaluacionGAS.fecha` NO sigue la convencion de dia a las 12:00 UTC (la
  // escribe `new Date(dto.fecha)`), asi que el rango tiene que abrir el dia
  // entero. Los extremos son donde se cuela el desfase.
  describe('rango de fechas', () => {
    it('sin desde ni hasta no filtra las evaluaciones', async () => {
      const args = await conFiltros({});
      expect(args.include.evaluaciones.where).toBeUndefined();
      expect(args.include.evaluaciones.orderBy).toEqual({ fecha: 'asc' });
    });

    it('abre el dia completo en UTC por los dos extremos', async () => {
      const args = await conFiltros({
        desde: '2026-10-01',
        hasta: '2026-10-31',
      });
      const rango = rangoDe(args);

      expect(rango.gte).toEqual(new Date(Date.UTC(2026, 9, 1, 0, 0, 0, 0)));
      expect(rango.lte).toEqual(
        new Date(Date.UTC(2026, 9, 31, 23, 59, 59, 999)),
      );
    });

    it('una evaluacion en cualquier hora de los dias frontera cae dentro', async () => {
      const args = await conFiltros({
        desde: '2026-10-01',
        hasta: '2026-10-31',
      });
      const { gte, lte } = rangoDe(args) as { gte: Date; lte: Date };

      const dentro = (iso: string) =>
        new Date(iso) >= gte && new Date(iso) <= lte;

      expect(dentro('2026-10-01T00:00:00.000Z')).toBe(true); // primer instante
      expect(dentro('2026-10-01T12:00:00.000Z')).toBe(true); // mediodia
      expect(dentro('2026-10-31T23:59:59.000Z')).toBe(true); // ultimo instante
      expect(dentro('2026-09-30T23:59:59.999Z')).toBe(false); // vispera: fuera
      expect(dentro('2026-11-01T00:00:00.000Z')).toBe(false); // siguiente: fuera
    });

    it('admite solo desde, o solo hasta', async () => {
      const soloDesde = await conFiltros({ desde: '2026-10-01' });
      expect(rangoDe(soloDesde)).toEqual({
        gte: new Date(Date.UTC(2026, 9, 1, 0, 0, 0, 0)),
      });

      prisma.clienteObjetivo.findMany.mockClear();
      const soloHasta = await conFiltros({ hasta: '2026-10-31' });
      expect(rangoDe(soloHasta)).toEqual({
        lte: new Date(Date.UTC(2026, 9, 31, 23, 59, 59, 999)),
      });
    });

    it('BadRequest si desde es posterior a hasta', async () => {
      await expect(
        svc.getEvolucionCliente('c1', {
          desde: '2026-10-31',
          hasta: '2026-10-01',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.clienteObjetivo.findMany).not.toHaveBeenCalled();
    });

    it('BadRequest si la fecha no es una fecha (lo valida diaDesdeIso)', async () => {
      await expect(
        svc.getEvolucionCliente('c1', { desde: 'no-es-fecha' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── Selección de objetivos ───────────────────────────────────────────────
  describe('objetivos incluidos', () => {
    it('por defecto solo los activos del cliente pedido', async () => {
      const args = await conFiltros({});
      expect(args.where).toEqual({ clienteId: 'c1', activo: true });
    });

    it('incluirInactivos trae tambien los cerrados', async () => {
      const args = await conFiltros({ incluirInactivos: true });
      expect(args.where).toEqual({ clienteId: 'c1' });
    });

    it('trae el objetivo, su area y los descriptores de nivel', async () => {
      const args = await conFiltros({});
      expect(args.include.objetivoGeneral).toEqual({
        include: { areaDesarrollo: true },
      });
      expect(args.include.descripcionesNiveles).toEqual({
        orderBy: { nivel: 'asc' },
      });
    });
  });

  // ── Forma de la respuesta ────────────────────────────────────────────────
  describe('respuesta', () => {
    it('resume el movimiento del periodo: primera, ultima y variacion', async () => {
      prisma.clienteObjetivo.findMany.mockResolvedValue([
        mkObjetivo({
          descripcionesNiveles: [
            { nivel: -2, descripcion: 'Mucho peor' },
            { nivel: -1, descripcion: 'Peor' },
            { nivel: 0, descripcion: 'Esperado' },
            { nivel: 1, descripcion: 'Mejor' },
            { nivel: 2, descripcion: 'Mucho mejor' },
          ],
          evaluaciones: [
            {
              id: 'e1',
              nivel: -1,
              fecha: new Date('2026-10-05T10:00:00.000Z'),
            },
            { id: 'e2', nivel: 0, fecha: new Date('2026-10-15T10:00:00.000Z') },
            { id: 'e3', nivel: 1, fecha: new Date('2026-10-28T10:00:00.000Z') },
          ],
        }),
      ]);

      const r = await svc.getEvolucionCliente('c1', {
        desde: '2026-10-01',
        hasta: '2026-10-31',
      });

      expect(r.clienteId).toBe('c1');
      expect(r.desde).toBe('2026-10-01');
      expect(r.hasta).toBe('2026-10-31');
      expect(r.totalObjetivos).toBe(1);
      expect(r.totalEvaluaciones).toBe(3);

      const o = r.objetivos[0];
      expect(o.objetivo).toBe('Mantener la atención sostenida 15 minutos');
      expect(o.area).toBe('Atención');
      expect(o.nivelesDefinidos).toBe(true);
      expect(o.niveles).toHaveLength(5);
      expect(o.nivelInicioPeriodo).toBe(-1);
      expect(o.nivelFinPeriodo).toBe(1);
      expect(o.variacion).toBe(2);
      expect(o.totalEvaluaciones).toBe(3);
    });

    it('un objetivo sin evaluaciones en el periodo sigue saliendo', async () => {
      // "No se evaluo en octubre" es informacion, no una fila que sobra.
      prisma.clienteObjetivo.findMany.mockResolvedValue([
        mkObjetivo({ evaluaciones: [] }),
      ]);

      const r = await svc.getEvolucionCliente('c1', { desde: '2026-10-01' });

      expect(r.objetivos).toHaveLength(1);
      expect(r.objetivos[0].totalEvaluaciones).toBe(0);
      expect(r.objetivos[0].nivelInicioPeriodo).toBeNull();
      expect(r.objetivos[0].nivelFinPeriodo).toBeNull();
      expect(r.objetivos[0].variacion).toBeNull();
      // El nivel a dia de hoy sale igual: es el campo desnormalizado, no depende
      // del periodo.
      expect(r.objetivos[0].nivelActual).toBe(1);
    });

    it('con una sola evaluacion no inventa variacion', async () => {
      prisma.clienteObjetivo.findMany.mockResolvedValue([
        mkObjetivo({
          evaluaciones: [
            { id: 'e1', nivel: 0, fecha: new Date('2026-10-05T10:00:00.000Z') },
          ],
        }),
      ]);

      const o = (await svc.getEvolucionCliente('c1', {})).objetivos[0];
      expect(o.nivelInicioPeriodo).toBe(0);
      expect(o.nivelFinPeriodo).toBe(0);
      expect(o.variacion).toBe(0);
    });

    it('nivelesDefinidos es false si no estan los 5 descriptores', async () => {
      prisma.clienteObjetivo.findMany.mockResolvedValue([
        mkObjetivo({
          descripcionesNiveles: [{ nivel: 0, descripcion: 'Esperado' }],
        }),
      ]);

      const o = (await svc.getEvolucionCliente('c1', {})).objetivos[0];
      expect(o.nivelesDefinidos).toBe(false);
    });

    it('suma las evaluaciones de todos los objetivos', async () => {
      prisma.clienteObjetivo.findMany.mockResolvedValue([
        mkObjetivo({
          id: 'co-1',
          evaluaciones: [
            { id: 'e1', nivel: 0, fecha: new Date('2026-10-05T10:00:00.000Z') },
          ],
        }),
        mkObjetivo({
          id: 'co-2',
          evaluaciones: [
            { id: 'e2', nivel: 1, fecha: new Date('2026-10-06T10:00:00.000Z') },
            { id: 'e3', nivel: 2, fecha: new Date('2026-10-20T10:00:00.000Z') },
          ],
        }),
      ]);

      const r = await svc.getEvolucionCliente('c1', {});
      expect(r.totalObjetivos).toBe(2);
      expect(r.totalEvaluaciones).toBe(3);
    });
  });
});
