import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContratosService } from './contratos.service';
import { ContratosPdfService } from './contratos-pdf.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { ExpedienteService } from '../expediente/expediente.service';
import { FestivosService } from '../festivos/festivos.service';

/**
 * `cargaSemanal` responde a "¿dónde meto al cliente que entra?": qué clientes
 * caen cada día y a qué hora, según los contratos vigentes.
 *
 * Lo que estos tests fijan es el filtro. La regla de facturación —un contrato
 * `FINALIZADO` cuya ventana cubre el periodo SÍ factura— no aplica aquí, y
 * confundir las dos llenaría la rejilla de clientes que ya no vienen.
 */
describe('ContratosService — carga semanal', () => {
  let svc: ContratosService;
  let prisma: any;

  const YO = 'trab-1';
  const OTRO = 'trab-2';

  beforeEach(async () => {
    prisma = {
      contratoServicio: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratosService,
        { provide: PrismaService, useValue: prisma },
        { provide: ContratosPdfService, useValue: { generarPdf: jest.fn() } },
        { provide: StorageService, useValue: { isConfigured: false } },
        { provide: ExpedienteService, useValue: { generar: jest.fn() } },
        {
          provide: FestivosService,
          useValue: { delCentro: jest.fn().mockResolvedValue([]) },
        },
      ],
    }).compile();

    svc = module.get(ContratosService);
  });

  const contrato = (over: any = {}) => ({
    id: 'c1',
    tipoSesion: 'PEDAGOGIA',
    cliente: { id: 'cli-1', nombre: 'Ana', apellidos: 'Pérez' },
    slots: [
      {
        diaSemana: 3,
        horaInicio: '17:00',
        horaFin: '17:50',
        duracionMinutos: 50,
        modalidad: 'PRESENCIAL',
      },
    ],
    ...over,
  });

  describe('permisos', () => {
    it('deja ver la propia', async () => {
      await expect(
        svc.cargaSemanal(YO, { userId: YO, rol: 'PEDAGOGO' }),
      ).resolves.toEqual([]);
    });

    it('un ADMIN puede ver la de otro', async () => {
      await expect(
        svc.cargaSemanal(OTRO, { userId: YO, rol: 'ADMIN' }),
      ).resolves.toEqual([]);
    });

    it('un terapeuta no puede ver la de otro', async () => {
      await expect(
        svc.cargaSemanal(OTRO, { userId: YO, rol: 'PEDAGOGO' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('filtro de vigencia', () => {
    it('pide solo contratos ACTIVO vigentes hoy', async () => {
      await svc.cargaSemanal(YO, { userId: YO, rol: 'PEDAGOGO' });

      const where = prisma.contratoServicio.findMany.mock.calls[0][0].where;
      expect(where.trabajadorId).toBe(YO);
      expect(where.estado).toBe('ACTIVO');
      // Ya empezado y no terminado: indefinido (fechaFin null) o con fin futuro.
      expect(where.fechaInicio.lte).toBeInstanceOf(Date);
      expect(where.OR).toEqual([
        { fechaFin: null },
        { fechaFin: { gte: expect.any(Date) } },
      ]);
    });
  });

  describe('agrupación', () => {
    it('agrupa los slots por día ISO y los ordena por hora', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([
        contrato({
          id: 'c1',
          cliente: { id: 'cli-1', nombre: 'Ana', apellidos: 'Pérez' },
          slots: [
            {
              diaSemana: 3,
              horaInicio: '18:00',
              horaFin: '18:50',
              duracionMinutos: 50,
              modalidad: 'PRESENCIAL',
            },
            {
              diaSemana: 1,
              horaInicio: '10:00',
              horaFin: '10:50',
              duracionMinutos: 50,
              modalidad: 'PRESENCIAL',
            },
          ],
        }),
        contrato({
          id: 'c2',
          cliente: { id: 'cli-2', nombre: 'Luis', apellidos: 'Gómez' },
          slots: [
            {
              diaSemana: 3,
              horaInicio: '16:00',
              horaFin: '16:50',
              duracionMinutos: 50,
              modalidad: 'ONLINE',
            },
          ],
        }),
      ]);

      const carga = await svc.cargaSemanal(YO, { userId: YO, rol: 'PEDAGOGO' });

      expect(carga.map((d) => d.dia)).toEqual([1, 3]);
      // Dentro del miércoles, Luis (16:00) antes que Ana (18:00) aunque su
      // contrato viniera después en la consulta.
      expect(carga[1].slots.map((s) => s.horaInicio)).toEqual([
        '16:00',
        '18:00',
      ]);
      expect(carga[1].slots[0].clienteNombre).toBe('Luis Gómez');
    });

    it('no inventa días sin actividad', async () => {
      prisma.contratoServicio.findMany.mockResolvedValue([contrato()]);
      const carga = await svc.cargaSemanal(YO, { userId: YO, rol: 'PEDAGOGO' });
      expect(carga).toHaveLength(1);
      expect(carga[0].dia).toBe(3);
    });
  });
});
