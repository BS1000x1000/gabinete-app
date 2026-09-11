import { Test, TestingModule } from '@nestjs/testing';
import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AccesoObjetivoGasGuard } from './acceso-objetivo-gas.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { AccesoClienteService } from '../../common/acceso/acceso-cliente.service';

type Usuario = { userId: string; rol: string };

const USUARIO: Usuario = { userId: 't1', rol: 'PEDAGOGO' };

const mkCtx = (
  params: Record<string, string>,
  user: Usuario = USUARIO,
): ExecutionContext =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ params, user }) }),
  }) as unknown as ExecutionContext;

describe('AccesoObjetivoGasGuard', () => {
  let guard: AccesoObjetivoGasGuard;
  let prisma: {
    clienteObjetivo: { findUnique: jest.Mock };
    evaluacionGAS: { findUnique: jest.Mock };
  };
  let acceso: { assertAcceso: jest.Mock };

  beforeEach(async () => {
    prisma = {
      clienteObjetivo: { findUnique: jest.fn() },
      evaluacionGAS: { findUnique: jest.fn() },
    };
    acceso = { assertAcceso: jest.fn().mockResolvedValue(undefined) };

    const m: TestingModule = await Test.createTestingModule({
      providers: [
        AccesoObjetivoGasGuard,
        { provide: PrismaService, useValue: prisma },
        { provide: AccesoClienteService, useValue: acceso },
      ],
    }).compile();
    guard = m.get(AccesoObjetivoGasGuard);
  });

  describe('rutas que cuelgan de clienteObjetivoId', () => {
    it('traduce el objetivo a su cliente y delega en AccesoClienteService', async () => {
      prisma.clienteObjetivo.findUnique.mockResolvedValue({ clienteId: 'c1' });

      await expect(
        guard.canActivate(mkCtx({ clienteObjetivoId: 'co-1' })),
      ).resolves.toBe(true);
      expect(acceso.assertAcceso).toHaveBeenCalledWith(
        'c1',
        { userId: 't1', rol: 'PEDAGOGO' },
        'los objetivos de este cliente',
      );
    });

    it('NotFound si el objetivo no existe', async () => {
      prisma.clienteObjetivo.findUnique.mockResolvedValue(null);
      await expect(
        guard.canActivate(mkCtx({ clienteObjetivoId: 'co-x' })),
      ).rejects.toThrow(NotFoundException);
      expect(acceso.assertAcceso).not.toHaveBeenCalled();
    });
  });

  describe('rutas que cuelgan de evaluacionId', () => {
    it('traduce la evaluacion a su cliente', async () => {
      prisma.evaluacionGAS.findUnique.mockResolvedValue({
        clienteObjetivo: { clienteId: 'c2' },
      });

      await expect(
        guard.canActivate(mkCtx({ evaluacionId: 'e-1' })),
      ).resolves.toBe(true);
      expect(acceso.assertAcceso).toHaveBeenCalledWith(
        'c2',
        expect.anything(),
        'los objetivos de este cliente',
      );
    });
  });

  // La lectura por periodo (`GET /gas/cliente/:clienteId/evaluaciones`) cruza
  // todos los objetivos del cliente, asi que no cuelga de ningun
  // ClienteObjetivo: trae el clienteId directo.
  describe('rutas que traen el clienteId directo', () => {
    it('usa el clienteId de la ruta sin traducir nada', async () => {
      await expect(guard.canActivate(mkCtx({ clienteId: 'c3' }))).resolves.toBe(
        true,
      );

      expect(prisma.clienteObjetivo.findUnique).not.toHaveBeenCalled();
      expect(prisma.evaluacionGAS.findUnique).not.toHaveBeenCalled();
      expect(acceso.assertAcceso).toHaveBeenCalledWith(
        'c3',
        expect.anything(),
        'los objetivos de este cliente',
      );
    });

    it('propaga el 403 de un cliente que no se tiene asignado', async () => {
      acceso.assertAcceso.mockRejectedValueOnce(new ForbiddenException());
      await expect(
        guard.canActivate(mkCtx({ clienteId: 'c-ajeno' })),
      ).rejects.toThrow(ForbiddenException);
    });

    it('propaga el 404 de un cliente inexistente o dado de baja', async () => {
      // El soft-delete lo filtra ya AccesoClienteService.
      acceso.assertAcceso.mockRejectedValueOnce(new NotFoundException());
      await expect(
        guard.canActivate(mkCtx({ clienteId: 'c-borrado' })),
      ).rejects.toThrow(NotFoundException);
    });
  });

  it('falla si la ruta no identifica a ningun cliente, en vez de pasar de largo', async () => {
    await expect(guard.canActivate(mkCtx({}))).rejects.toThrow(
      NotFoundException,
    );
    expect(acceso.assertAcceso).not.toHaveBeenCalled();
  });
});
