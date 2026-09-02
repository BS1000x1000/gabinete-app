import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { EstadoContrato, EstadoSesion } from '@prisma/client';
import { ContratosReplanificacionService } from './contratos-replanificacion.service';
import { PrismaService } from '../prisma/prisma.service';
import { FestivosService } from '../festivos/festivos.service';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mkPrisma = () => ({
  contratoServicio: { findUnique: jest.fn(), update: jest.fn() },
  contratoSlot: { deleteMany: jest.fn(), createMany: jest.fn() },
  sesion: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    update: jest.fn(),
    updateMany: jest.fn(),
    createMany: jest.fn(),
  },

  periodoVacaciones: { findMany: jest.fn().mockResolvedValue([]) },
  $transaction: jest.fn(),
});

const mkContrato = (over: Record<string, any> = {}) => ({
  id: 'ctr-1',
  clienteId: 'cli-1',
  trabajadorId: 'tra-1',
  tipoSesion: 'PEDAGOGIA',
  estado: EstadoContrato.ACTIVO,
  fechaInicio: new Date('2026-09-01T00:00:00'),
  fechaFin: new Date('2026-10-31T23:59:59'),
  storageKeyFirmado: null,
  generadoHasta: null,
  cliente: { provincia: 'Madrid' },
  ...over,
});

/** Miércoles 16:00 (ISO 3) → viernes 16:00 (ISO 5): el caso real del gabinete. */
const SLOT_MIERCOLES = { diaSemana: 3, horaInicio: '16:00', horaFin: '16:50', duracionMinutos: 50 };
const SLOT_VIERNES = { diaSemana: 5, horaInicio: '16:00', horaFin: '16:50', duracionMinutos: 50 };

const userAdmin = { userId: 'admin-1', rol: 'ADMIN' };

describe('ContratosReplanificacionService', () => {
  let svc: ContratosReplanificacionService;
  let prisma: ReturnType<typeof mkPrisma>;
  let festivos: { delCentro: jest.Mock };

  beforeEach(async () => {
    prisma = mkPrisma();
    festivos = { delCentro: jest.fn().mockResolvedValue([]) };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratosReplanificacionService,
        { provide: PrismaService, useValue: prisma },
        { provide: FestivosService, useValue: festivos },
      ],
    }).compile();
    svc = module.get(ContratosReplanificacionService);
    prisma.contratoServicio.findUnique.mockResolvedValue(mkContrato());
  });

  // ── preview ────────────────────────────────────────────────────────────────

  describe('preview()', () => {
    it('propone crear todas las sesiones si no hay ninguna todavía', async () => {
      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      expect(plan.resumen.seCrean).toBeGreaterThan(0);
      expect(plan.resumen.seMueven).toBe(0);
      expect(plan.resumen.seCancelan).toBe(0);
    });

    it('mueve la sesión de cada semana, sin crear ni cancelar', async () => {
      // Dos miércoles consecutivos ya programados
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's1', fechaHoraInicio: new Date('2026-09-02T16:00:00'), fechaHoraFin: new Date('2026-09-02T16:50:00') },
        { id: 's2', fechaHoraInicio: new Date('2026-09-09T16:00:00'), fechaHoraFin: new Date('2026-09-09T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-13T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      // Cada miércoles se empareja con el viernes de SU MISMA semana
      expect(plan.resumen.seMueven).toBe(2);
      expect(plan.resumen.seCrean).toBe(0);
      expect(plan.resumen.seCancelan).toBe(0);
      expect(new Date(plan.mover[0].a).getDay()).toBe(5);
    });

    it('no mueve una sesión que ya está donde debe', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's1', fechaHoraInicio: new Date('2026-09-04T16:00:00'), fechaHoraFin: new Date('2026-09-04T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-06T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);
      expect(plan.resumen.seMueven).toBe(0);
    });

    it('cancela lo que sobra al pasar de dos días a uno', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's1', fechaHoraInicio: new Date('2026-09-02T16:00:00'), fechaHoraFin: new Date('2026-09-02T16:50:00') },
        { id: 's2', fechaHoraInicio: new Date('2026-09-04T16:00:00'), fechaHoraFin: new Date('2026-09-04T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-06T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      // De dos sesiones esa semana queda una: la otra se cancela, no se borra
      expect(plan.resumen.seCancelan).toBe(1);
      expect(plan.resumen.seCrean).toBe(0);
    });

    it('omite los festivos y los cuenta aparte', async () => {
      festivos.delCentro.mockResolvedValue([
        { fecha: new Date('2026-09-04T00:00:00'), descripcion: 'Fiesta local' },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-06T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      expect(plan.resumen.enFestivo).toBe(1);
      expect(plan.omitidas[0].detalle).toBe('Fiesta local');
      expect(plan.resumen.seCrean).toBe(0);
    });

    it('omite las vacaciones del terapeuta', async () => {
      prisma.periodoVacaciones.findMany.mockResolvedValue([
        { fechaInicio: new Date('2026-09-01T12:00:00Z'), fechaFin: new Date('2026-09-30T12:00:00Z') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-30T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      expect(plan.resumen.enVacaciones).toBeGreaterThan(0);
      expect(plan.resumen.seCrean).toBe(0);
    });

    // Un cambio de horario recoloca lo que existe; NO adelanta citas. Extender el
    // horizonte es trabajo del cron de la ventana movil. Antes el recolocador
    // tenia su propio horizonte de 12 meses y al cambiar de dia rellenaba el año
    // entero: 12 sesiones se convertian en ~52.
    it('no genera mas alla de la ventana ya generada', async () => {
      const generadoHasta = new Date('2026-11-30T00:00:00');
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: null, generadoHasta }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      expect(new Date(plan.hasta).getTime()).toBe(generadoHasta.getTime());
      // ~13 viernes en 3 meses, no los ~52 de un año
      expect(plan.resumen.seCrean).toBeLessThan(20);
    });

    it('si el contrato acaba antes que la ventana, manda la fecha de fin', async () => {
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({
          fechaFin: new Date('2026-09-30T23:59:59'),
          generadoHasta: new Date('2026-11-30T00:00:00'),
        }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);
      expect(new Date(plan.hasta).getMonth()).toBe(8); // septiembre
    });

    // Una cancelacion en el borde de la ventana NO es una baja: su sustituta la
    // creara el cron al ampliar la agenda. Confundirlas asusta sin motivo.
    it('distingue la cancelacion de borde de una baja real', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        // Lunes dentro de la ventana: se emparejara con su miercoles
        { id: 's1', fechaHoraInicio: new Date('2026-09-07T16:00:00'), fechaHoraFin: new Date('2026-09-07T16:50:00') },
        // Lunes de la ultima semana: su miercoles cae ya fuera de la ventana
        { id: 's2', fechaHoraInicio: new Date('2026-09-14T16:00:00'), fechaHoraFin: new Date('2026-09-14T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: null, generadoHasta: new Date('2026-09-13T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      const deBorde = plan.cancelar.filter((c) => c.motivo === 'FIN_DE_VENTANA');
      expect(deBorde.length).toBe(plan.resumen.seCancelanPorVentana);
    });

    it('marca como baja real la cancelacion de una semana intermedia', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's1', fechaHoraInicio: new Date('2026-09-02T16:00:00'), fechaHoraFin: new Date('2026-09-02T16:50:00') },
        { id: 's2', fechaHoraInicio: new Date('2026-09-04T16:00:00'), fechaHoraFin: new Date('2026-09-04T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-06T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      // Sobra una sesion en una semana que SI tiene objetivo: es baja real
      expect(plan.cancelar[0].motivo).toBe('SLOT_ELIMINADO');
      expect(plan.resumen.seCancelanPorVentana).toBe(0);
    });

    it('rechaza replanificar un contrato finalizado', async () => {
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ estado: EstadoContrato.FINALIZADO }),
      );

      await expect(
        svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('un terapeuta no puede replanificar el contrato de otro', async () => {
      await expect(
        svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, { userId: 'otro', rol: 'PEDAGOGO' }),
      ).rejects.toThrow(NotFoundException);
    });

    // La garantia de que no se reescribe historia clinica
    it('solo mira sesiones PROGRAMADAS de este contrato', async () => {
      await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);

      const where = prisma.sesion.findMany.mock.calls[0][0].where;
      expect(where.contratoId).toBe('ctr-1');
      expect(where.estado).toBe(EstadoSesion.PROGRAMADA);
    });
  });

  // ── aplicar ────────────────────────────────────────────────────────────────

  describe('aplicar()', () => {
    beforeEach(() => {
      prisma.$transaction.mockImplementation(async (cb: any) => cb(prisma));
    });

    it('exige la firma de la vista previa', async () => {
      await expect(
        svc.aplicar('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('rechaza el plan si la agenda cambió desde la previsualización', async () => {
      await expect(
        svc.aplicar(
          'ctr-1',
          { slots: [SLOT_VIERNES], hashPrevisualizacion: 'firma-caducada' },
          userAdmin,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('mueve conservando la sesión, en vez de borrarla y recrearla', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's1', fechaHoraInicio: new Date('2026-09-02T16:00:00'), fechaHoraFin: new Date('2026-09-02T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-06T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);
      await svc.aplicar(
        'ctr-1',
        { slots: [SLOT_VIERNES], hashPrevisualizacion: plan.hash },
        userAdmin,
      );

      expect(prisma.sesion.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 's1' } }),
      );
      // Nunca se borra una sesión
      expect((prisma.sesion as any).delete).toBeUndefined();
    });

    it('cancela las sobrantes en vez de borrarlas', async () => {
      prisma.sesion.findMany.mockResolvedValue([
        { id: 's1', fechaHoraInicio: new Date('2026-09-02T16:00:00'), fechaHoraFin: new Date('2026-09-02T16:50:00') },
        { id: 's2', fechaHoraInicio: new Date('2026-09-04T16:00:00'), fechaHoraFin: new Date('2026-09-04T16:50:00') },
      ]);
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ fechaFin: new Date('2026-09-06T23:59:59') }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);
      await svc.aplicar(
        'ctr-1',
        { slots: [SLOT_VIERNES], hashPrevisualizacion: plan.hash },
        userAdmin,
      );

      expect(prisma.sesion.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { estado: EstadoSesion.CANCELADA_CON_AVISO },
        }),
      );
    });

    it('marca el PDF firmado como desfasado', async () => {
      prisma.contratoServicio.findUnique.mockResolvedValue(
        mkContrato({ storageKeyFirmado: 'contratos/ctr-1/x.pdf' }),
      );

      const plan = await svc.preview('ctr-1', { slots: [SLOT_VIERNES] }, userAdmin);
      await svc.aplicar(
        'ctr-1',
        { slots: [SLOT_VIERNES], hashPrevisualizacion: plan.hash },
        userAdmin,
      );

      expect(prisma.contratoServicio.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ resumenModificadoAt: expect.any(Date) }),
        }),
      );
    });
  });
});
