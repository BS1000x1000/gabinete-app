import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { HorariosLaboralesService } from './horarios-laborales.service';
import { PrismaService } from '../prisma/prisma.service';
import { FestivosService } from '../festivos/festivos.service';

const mkPrisma = () => ({
  horarioLaboral: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sesion: { findMany: jest.fn().mockResolvedValue([]) },
  periodoVacaciones: { findMany: jest.fn().mockResolvedValue([]) },
});

// Miércoles 2 de septiembre de 2026 (ISO 3)
const miercoles = (h: number, m = 0) => new Date(2026, 8, 2, h, m, 0, 0);

const base = {
  trabajadorId: 'tra-1',
  clienteId: 'cli-1',
  inicio: miercoles(16),
  fin: miercoles(16, 50),
};

describe('HorariosLaboralesService', () => {
  let svc: HorariosLaboralesService;
  let prisma: ReturnType<typeof mkPrisma>;
  let festivos: { delCentro: jest.Mock };

  beforeEach(async () => {
    prisma = mkPrisma();
    festivos = { delCentro: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HorariosLaboralesService,
        { provide: PrismaService, useValue: prisma },
        { provide: FestivosService, useValue: festivos },
      ],
    }).compile();
    svc = module.get(HorariosLaboralesService);
  });

  describe('evaluarAvisos()', () => {
    it('no avisa de nada si el terapeuta no tiene disponibilidad declarada', async () => {
      // Avisar aquí sería ruido para quien aún no la ha configurado
      expect(await svc.evaluarAvisos(base)).toEqual([]);
    });

    it('no avisa si la sesión cae dentro de la disponibilidad', async () => {
      prisma.horarioLaboral.findMany.mockResolvedValue([
        { diaSemana: 3, horaInicio: '15:00', horaFin: '20:00', activo: true },
      ]);
      expect(await svc.evaluarAvisos(base)).toEqual([]);
    });

    it('avisa si la sesión cae fuera de la disponibilidad', async () => {
      prisma.horarioLaboral.findMany.mockResolvedValue([
        { diaSemana: 3, horaInicio: '09:00', horaFin: '14:00', activo: true },
      ]);
      const avisos = await svc.evaluarAvisos(base);
      expect(avisos.map((a) => a.tipo)).toContain('FUERA_DE_DISPONIBILIDAD');
    });

    it('consulta la disponibilidad del día ISO correcto', async () => {
      await svc.evaluarAvisos(base);
      // Miércoles es 3 en ISO, no 2 como daría un getDay() sin convertir
      expect(prisma.horarioLaboral.findMany.mock.calls[0][0].where.diaSemana).toBe(3);
    });

    it('trata el domingo como 7, no como 0', async () => {
      const domingo = new Date(2026, 8, 6, 16, 0, 0, 0);
      await svc.evaluarAvisos({
        ...base,
        inicio: domingo,
        fin: new Date(2026, 8, 6, 16, 50, 0, 0),
      });
      expect(prisma.horarioLaboral.findMany.mock.calls[0][0].where.diaSemana).toBe(7);
    });

    it('avisa de un solape con otra sesión del terapeuta', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        {
          id: 's9',
          trabajadorId: 'tra-1',
          fechaHoraInicio: miercoles(16),
          cliente: { nombre: 'Luis', apellidos: 'Pérez' },
        },
      ]);
      const avisos = await svc.evaluarAvisos(base);
      expect(avisos[0].tipo).toBe('SOLAPE_TERAPEUTA');
      expect(avisos[0].mensaje).toContain('Luis Pérez');
    });

    it('avisa si el cliente ya tiene sesión con otro terapeuta', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        {
          id: 's9',
          trabajadorId: 'otro',
          fechaHoraInicio: miercoles(16),
          cliente: { nombre: 'Ana', apellidos: 'G.' },
        },
      ]);
      const avisos = await svc.evaluarAvisos(base);
      expect(avisos[0].tipo).toBe('SOLAPE_CLIENTE');
    });

    it('excluye la propia sesión al moverla, para no chocar consigo misma', async () => {
      await svc.evaluarAvisos({ ...base, excluirSesionId: 's1' });
      expect(prisma.sesion.findMany.mock.calls[0][0].where.id).toEqual({ not: 's1' });
    });

    it('avisa si ese día el terapeuta está de vacaciones', async () => {
      prisma.periodoVacaciones.findMany.mockResolvedValue([
        { fechaInicio: new Date('2026-09-01T12:00:00Z'), fechaFin: new Date('2026-09-10T12:00:00Z') },
      ]);
      const avisos = await svc.evaluarAvisos(base);
      expect(avisos.map((a) => a.tipo)).toContain('VACACIONES');
    });

    /**
     * El tipo 'FESTIVO' llevaba declarado en `AvisoSesion` desde el principio y
     * `evaluarAvisos` no lo emitía nunca: poner una sesión el 25 de diciembre no
     * decía absolutamente nada.
     */
    it('avisa si ese día es festivo del centro, con el nombre del festivo', async () => {
      festivos.delCentro.mockResolvedValue([
        { fecha: new Date('2026-09-02T12:00:00Z'), descripcion: 'Ntra. Sra. de Belén' },
      ]);
      const avisos = await svc.evaluarAvisos(base);
      expect(avisos).toContainEqual({
        tipo: 'FESTIVO',
        mensaje: 'Ese día es festivo (Ntra. Sra. de Belén).',
      });
    });

    it('no avisa por un festivo de otro día', async () => {
      festivos.delCentro.mockResolvedValue([
        { fecha: new Date('2026-09-03T12:00:00Z'), descripcion: 'Otro día' },
      ]);
      const avisos = await svc.evaluarAvisos(base);
      expect(avisos.map((a) => a.tipo)).not.toContain('FESTIVO');
    });

    it('pregunta por el calendario del centro, no por el municipio del cliente', async () => {
      await svc.evaluarAvisos(base);
      expect(festivos.delCentro).toHaveBeenCalledWith([2026]);
    });

    // La garantía de que avisar no es bloquear
    it('nunca lanza excepción, por muchos avisos que haya', async () => {
      prisma.horarioLaboral.findMany.mockResolvedValue([
        { diaSemana: 3, horaInicio: '09:00', horaFin: '10:00', activo: true },
      ]);
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's9', trabajadorId: 'tra-1', fechaHoraInicio: miercoles(16), cliente: { nombre: 'X', apellidos: 'Y' } },
      ]);
      prisma.periodoVacaciones.findMany.mockResolvedValue([
        { fechaInicio: new Date('2026-09-01T12:00:00Z'), fechaFin: new Date('2026-09-10T12:00:00Z') },
      ]);

      const avisos = await svc.evaluarAvisos(base);
      expect(avisos.length).toBe(3);
    });
  });

  describe('CRUD', () => {
    const userPropio = { userId: 'tra-1', rol: 'PEDAGOGO' };

    it('rechaza una franja con fin anterior al inicio', async () => {
      await expect(
        svc.create('tra-1', { diaSemana: 3, horaInicio: '18:00', horaFin: '17:00' }, userPropio),
      ).rejects.toThrow(BadRequestException);
    });

    // La disponibilidad de un autónomo es suya
    it('un terapeuta no puede editar la disponibilidad de otro', async () => {
      await expect(
        svc.create('otro-tra', { diaSemana: 3, horaInicio: '09:00', horaFin: '14:00' }, userPropio),
      ).rejects.toThrow(ForbiddenException);
    });

    /**
     * Ni siquiera un ADMIN escribe la disponibilidad de otro. Mismo criterio que
     * ya imponían los bloques de administración —`HorariosAdminService.create`
     * usa siempre el `userId` de quien llama— y el que la UI daba por hecho con
     * `puedeEditar`. Antes aquí el ADMIN sí podía: las dos mitades de "Mi
     * semana" tenían reglas distintas.
     */
    it('un ADMIN tampoco escribe la disponibilidad de otro', async () => {
      await expect(
        svc.create('otro-tra', { diaSemana: 3, horaInicio: '09:00', horaFin: '14:00' }, { userId: 'a', rol: 'ADMIN' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.horarioLaboral.create).not.toHaveBeenCalled();
    });

    it('un ADMIN sí puede leer la disponibilidad de otro', async () => {
      await expect(
        svc.findByTrabajador('otro-tra', { userId: 'a', rol: 'ADMIN' }),
      ).resolves.toEqual([]);
    });

    it('un terapeuta no puede leer la disponibilidad de otro', async () => {
      await expect(
        svc.findByTrabajador('otro-tra', userPropio),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
