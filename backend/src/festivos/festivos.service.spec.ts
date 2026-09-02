import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AmbitoFestivo } from '@prisma/client';
import { FestivosService, normalizarDia } from './festivos.service';
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
