import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AmbitoFestivo } from '@prisma/client';
import { FestivosService, normalizarDia } from './festivos.service';
import { LOCALES } from './data/calendarios';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Lo que estos tests fijan es el fallo que motivó el rediseño: los festivos se
 * resolvían contra `Cliente.provincia` —texto libre contra texto libre— y el
 * ámbito LOCAL se guardaba por provincia, así que era imposible distinguir dos
 * municipios de la misma provincia. Un festivo que no casaba desaparecía sin
 * decir nada y el contrato salía con una sesión de más.
 */
describe('FestivosService', () => {
  let svc: FestivosService;
  let prisma: any;

  const mkPrisma = () => ({
    configuracionCentro: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    festivo: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(i => i.data),
      update: jest.fn(i => i.data),
      delete: jest.fn(),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn().mockResolvedValue(0),
    },
  });

  const centro = (municipio = 'Fuenlabrada', ccaaCodigo = 'MAD') => ({
    id: 'centro', ccaaCodigo, municipio, provincia: 'Madrid', updatedAt: new Date(),
  });

  beforeEach(async () => {
    prisma = mkPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [FestivosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    svc = module.get(FestivosService);
  });

  // ── delCentro ──────────────────────────────────────────────

  describe('delCentro()', () => {
    it('pide los nacionales siempre, los autonómicos de la CCAA del centro y los locales de su municipio', async () => {
      prisma.configuracionCentro.findUnique.mockResolvedValue(centro());

      await svc.delCentro([2026]);

      const { where } = prisma.festivo.findMany.mock.calls[0][0];
      expect(where.anio).toEqual({ in: [2026] });
      expect(where.OR).toEqual([
        { ambito: AmbitoFestivo.NACIONAL },
        { ambito: AmbitoFestivo.AUTONOMICO, ccaa: 'MAD' },
        { ambito: AmbitoFestivo.LOCAL, municipio: 'Fuenlabrada' },
      ]);
    });

    it('sin municipio elegido no pide festivos locales, en vez de traerlos todos', async () => {
      prisma.configuracionCentro.findUnique.mockResolvedValue(centro(''));

      await svc.delCentro([2026]);

      const { where } = prisma.festivo.findMany.mock.calls[0][0];
      expect(where.OR).toHaveLength(2);
      expect(where.OR.some((o: any) => o.ambito === AmbitoFestivo.LOCAL)).toBe(false);
    });

    it('cambiar el municipio del centro cambia los locales que aplican', async () => {
      prisma.configuracionCentro.findUnique.mockResolvedValue(centro('Alcorcón'));

      await svc.delCentro([2026]);

      const { where } = prisma.festivo.findMany.mock.calls[0][0];
      expect(where.OR).toContainEqual({ ambito: AmbitoFestivo.LOCAL, municipio: 'Alcorcón' });
      expect(where.OR).not.toContainEqual({ ambito: AmbitoFestivo.LOCAL, municipio: 'Fuenlabrada' });
    });

    it('sin años no toca la base', async () => {
      expect(await svc.delCentro([])).toEqual([]);
      expect(prisma.festivo.findMany).not.toHaveBeenCalled();
    });

    it('crea la configuración si falta, sin municipio: los locales no se adivinan', async () => {
      prisma.configuracionCentro.findUnique.mockResolvedValue(null);
      prisma.configuracionCentro.create.mockResolvedValue(centro(''));

      await svc.delCentro([2026]);

      expect(prisma.configuracionCentro.create).toHaveBeenCalledWith({
        data: { id: 'centro', ccaaCodigo: 'MAD', municipio: '', provincia: 'Madrid' },
      });
    });
  });

  // ── Normalización del día ──────────────────────────────────

  describe('normalizarDia()', () => {
    it('lleva cualquier hora al mediodía UTC del mismo día natural', () => {
      const a = normalizarDia(new Date(2026, 4, 15, 0, 0, 0));
      const b = normalizarDia(new Date(2026, 4, 15, 23, 59, 59));
      expect(a.toISOString()).toBe('2026-05-15T12:00:00.000Z');
      expect(a.getTime()).toBe(b.getTime());
    });

    it('el mediodía UTC deja el día local intacto (el índice único depende de esto)', () => {
      const d = normalizarDia(new Date(2026, 0, 1, 12, 0, 0));
      expect(d.getDate()).toBe(1);
      expect(d.getMonth()).toBe(0);
    });
  });

  // ── Coherencia ámbito / ccaa / municipio ───────────────────

  describe('create()', () => {
    beforeEach(() => prisma.configuracionCentro.findUnique.mockResolvedValue(centro()));

    it('un festivo local sin municipio se rechaza (antes se creaba invisible para siempre)', async () => {
      await expect(
        svc.create({ fecha: '2026-09-14', descripcion: 'Patrona', ambito: AmbitoFestivo.LOCAL }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('un municipio fuera del catálogo se rechaza', async () => {
      await expect(
        svc.create({
          fecha: '2026-09-14', descripcion: 'Patrona',
          ambito: AmbitoFestivo.LOCAL, municipio: 'Cuenca',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('un festivo local hereda la CCAA de su municipio, no se teclea', async () => {
      await svc.create({
        fecha: '2026-09-14', descripcion: 'Patrona',
        ambito: AmbitoFestivo.LOCAL, municipio: 'Fuenlabrada',
      });

      expect(prisma.festivo.create.mock.calls[0][0].data).toMatchObject({
        ccaa: 'MAD', municipio: 'Fuenlabrada', anio: 2026,
      });
    });

    it('un nacional se guarda sin comunidad ni municipio, aunque vengan en el DTO', async () => {
      await svc.create({
        fecha: '2026-01-01', descripcion: 'Año Nuevo',
        ambito: AmbitoFestivo.NACIONAL, ccaa: 'MAD', municipio: 'Madrid',
      });

      expect(prisma.festivo.create.mock.calls[0][0].data).toMatchObject({ ccaa: '', municipio: '' });
    });

    it('un autonómico sin comunidad se rechaza', async () => {
      await expect(
        svc.create({ fecha: '2026-05-02', descripcion: 'Fiesta', ambito: AmbitoFestivo.AUTONOMICO }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('avisa del duplicado en vez de dejar dos festivos el mismo día', async () => {
      prisma.festivo.findUnique.mockResolvedValue({ id: 'f1', descripcion: 'Año Nuevo' });

      await expect(
        svc.create({ fecha: '2026-01-01', descripcion: 'Otro', ambito: AmbitoFestivo.NACIONAL }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  // ── Importación ────────────────────────────────────────────

  describe('importarCalendario()', () => {
    beforeEach(() => prisma.configuracionCentro.findUnique.mockResolvedValue(centro()));

    it('carga nacionales y autonómicos de la comunidad del centro', async () => {
      await svc.importarCalendario(2026);

      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      const nacionales = data.filter((d: any) => d.ambito === AmbitoFestivo.NACIONAL);
      const autonomicos = data.filter((d: any) => d.ambito === AmbitoFestivo.AUTONOMICO);

      expect(nacionales).toHaveLength(10); // 9 fijos + Viernes Santo
      expect(autonomicos.map((a: any) => a.descripcion)).toEqual(
        expect.arrayContaining(['Fiesta de la Comunidad de Madrid', 'Jueves Santo']),
      );
      expect(autonomicos.every((a: any) => a.ccaa === 'MAD')).toBe(true);
    });

    it('todas las fechas salen normalizadas al mediodía UTC', async () => {
      await svc.importarCalendario(2026);

      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      expect(data.every((d: any) => d.fecha.toISOString().endsWith('T12:00:00.000Z'))).toBe(true);
    });

    it('delega la deduplicación al índice único en vez de filtrar en memoria', async () => {
      await svc.importarCalendario(2026);
      expect(prisma.festivo.createMany.mock.calls[0][0].skipDuplicates).toBe(true);
    });

    it('reporta el municipio sin datos en vez de dar el calendario por completo', async () => {
      // Fuenlabrada está declarada en el catálogo pero aún sin festivos cargados.
      const res = await svc.importarCalendario(2026);
      expect(res.sinDatos).toEqual(['Fuenlabrada']);
    });

    it('carga los locales del municipio cuando el catálogo los tiene', async () => {
      prisma.configuracionCentro.findUnique.mockResolvedValue(centro('Madrid'));

      const res = await svc.importarCalendario(2026);
      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      const locales = data.filter((d: any) => d.ambito === AmbitoFestivo.LOCAL);

      expect(locales.map((l: any) => l.descripcion)).toEqual([
        'San Isidro Labrador',
        'Nuestra Señora de la Almudena',
      ]);
      expect(locales.every((l: any) => l.municipio === 'Madrid')).toBe(true);
      expect(res.sinDatos).toEqual([]);
    });

    it('avisa de que el año no lo ha revisado nadie contra el boletín', async () => {
      const res = await svc.importarCalendario(2031);
      expect(res.sinVerificar).toBe(true);
    });

    it('traslada al lunes el festivo nacional que cae en domingo', async () => {
      // 1-nov-2026 y 6-dic-2026 caen en domingo.
      await svc.importarCalendario(2026);

      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      const trasladados = data.filter((d: any) => d.descripcion.includes('trasladado del domingo'));

      expect(trasladados).toHaveLength(2);
      expect(trasladados.map((t: any) => t.fecha.toISOString().slice(0, 10)).sort()).toEqual([
        '2026-11-02',
        '2026-12-07',
      ]);
    });

    it('traslada también el AUTONÓMICO que cae en domingo', async () => {
      // El 2 de mayo de 2027 cae en domingo y Madrid lo pasa al lunes 3. Cuando
      // solo se trasladaban los nacionales, el centro cerraba un domingo —sin
      // ninguna sesión— y el lunes seguía abierto: una sesión de más en el
      // contrato de toda familia de lunes.
      await svc.importarCalendario(2027);

      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      const dosDeMayo = data.find((d: any) =>
        d.descripcion.startsWith('Fiesta de la Comunidad de Madrid'),
      );

      expect(dosDeMayo.ambito).toBe(AmbitoFestivo.AUTONOMICO);
      expect(dosDeMayo.fecha.toISOString().slice(0, 10)).toBe('2027-05-03');
      expect(dosDeMayo.descripcion).toContain('trasladado del domingo');
    });

    it('el festivo LOCAL en fin de semana NO se traslada: lo elige el ayuntamiento', async () => {
      // San Isidro cae en sábado en 2027. Trasladarlo sería inventarse un día
      // que nadie ha decretado; el municipio elegirá otro y hay que cotejarlo.
      prisma.configuracionCentro.findUnique.mockResolvedValue(centro('Madrid'));

      await svc.importarCalendario(2027);

      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      const sanIsidro = data.find((d: any) => d.descripcion === 'San Isidro Labrador');

      expect(sanIsidro.fecha.toISOString().slice(0, 10)).toBe('2027-05-15');
      expect(sanIsidro.descripcion).not.toContain('trasladado');
    });
  });

  // ── Festivos locales móviles ───────────────────────────────

  /**
   * Alcorcón celebra Santo Domingo y San Dominguín el Lunes de Pascua, que se
   * mueve cada año. Mientras `CalendarioLocal` solo admitía fechas fijas, ese
   * municipio no era representable y se quedaba declarado pero sin datos.
   */
  describe('locales móviles', () => {
    const MUNICIPIO = '__TestPascua';

    beforeEach(() => {
      LOCALES[MUNICIPIO] = {
        ccaa: 'MAD',
        provincia: 'Madrid',
        fijos: [{ mes: 9, dia: 8, descripcion: 'Patrona' }],
        moviles: [{ offsetPascua: 1, descripcion: 'Lunes de Pascua' }],
      };
      prisma.configuracionCentro.findUnique.mockResolvedValue(centro(MUNICIPIO));
    });

    afterEach(() => {
      delete LOCALES[MUNICIPIO];
    });

    it('expande el festivo local atado a la Pascua', async () => {
      // Domingo de Resurrección 2026: 5 de abril. Lunes de Pascua: 6.
      await svc.importarCalendario(2026);

      const data = prisma.festivo.createMany.mock.calls[0][0].data;
      const locales = data.filter((d: any) => d.ambito === AmbitoFestivo.LOCAL);

      expect(locales.map((l: any) => l.descripcion).sort()).toEqual([
        'Lunes de Pascua',
        'Patrona',
      ]);
      const lunes = locales.find((l: any) => l.descripcion === 'Lunes de Pascua');
      expect(lunes.fecha.toISOString()).toBe('2026-04-06T12:00:00.000Z');
      expect(lunes.municipio).toBe(MUNICIPIO);
      expect(lunes.ccaa).toBe('MAD');
    });

    it('un municipio con solo festivos móviles no se reporta como sin datos', async () => {
      LOCALES[MUNICIPIO].fijos = [];

      const res = await svc.importarCalendario(2026);

      expect(res.sinDatos).toEqual([]);
    });
  });

  // ── Configuración ──────────────────────────────────────────

  describe('setConfiguracion()', () => {
    it('rechaza un municipio fuera del catálogo', async () => {
      await expect(
        svc.setConfiguracion({ ccaaCodigo: 'MAD', municipio: 'Cuenca' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('toma la provincia del catálogo y no del cliente', async () => {
      prisma.configuracionCentro.upsert.mockResolvedValue({});

      await svc.setConfiguracion({ ccaaCodigo: 'MAD', municipio: 'Alcorcón', provincia: 'Toledo' });

      expect(prisma.configuracionCentro.upsert.mock.calls[0][0].update).toEqual({
        ccaaCodigo: 'MAD', municipio: 'Alcorcón', provincia: 'Madrid',
      });
    });
  });
});
