import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AccesoClienteService } from './acceso-cliente.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Este servicio es el unico punto donde se decide si alguien puede tocar un
 * cliente. Antes la misma comprobacion estaba copiada en tres modulos con
 * criterios distintos —y ausente en `export`—, asi que las diferencias entre
 * copias eran justo lo que nadie probaba. Aqui se prueba el criterio; los
 * modulos que lo consumen solo prueban que delegan.
 */
describe('AccesoClienteService', () => {
  let svc: AccesoClienteService;
  let prisma: {
    cliente: { findFirst: jest.Mock };
    clienteTrabajador: { findFirst: jest.Mock };
  };

  const admin = { userId: 'admin-1', rol: 'ADMIN' };
  const recep = { userId: 'recep-1', rol: 'RECEP' };
  const pedagogo = { userId: 'terapeuta-1', rol: 'PEDAGOGO' };

  beforeEach(async () => {
    prisma = {
      cliente: { findFirst: jest.fn().mockResolvedValue({ id: 'c1' }) },
      clienteTrabajador: { findFirst: jest.fn().mockResolvedValue(null) },
    };

    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AccesoClienteService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    svc = mod.get(AccesoClienteService);
  });

  it('404 si el cliente no existe', async () => {
    prisma.cliente.findFirst.mockResolvedValue(null);

    await expect(svc.assertAcceso('nope', admin)).rejects.toThrow(NotFoundException);
  });

  // Este es el agujero que la unificacion cierra: las copias de `documentos` y
  // `expediente` no miraban `deletedAt`, asi que la documentacion clinica de un
  // cliente dado de baja seguia siendo legible por sus endpoints.
  it('excluye a los clientes dados de baja (soft-delete)', async () => {
    prisma.cliente.findFirst.mockResolvedValue(null);

    await expect(svc.assertAcceso('c-borrado', admin)).rejects.toThrow(NotFoundException);
    expect(prisma.cliente.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ deletedAt: null }),
      }),
    );
  });

  it('ADMIN pasa sin mirar asignaciones', async () => {
    await expect(svc.assertAcceso('c1', admin)).resolves.toBeUndefined();
    expect(prisma.clienteTrabajador.findFirst).not.toHaveBeenCalled();
  });

  it('RECEP pasa sin mirar asignaciones', async () => {
    await expect(svc.assertAcceso('c1', recep)).resolves.toBeUndefined();
    expect(prisma.clienteTrabajador.findFirst).not.toHaveBeenCalled();
  });

  it('un terapeuta con el cliente asignado pasa', async () => {
    prisma.clienteTrabajador.findFirst.mockResolvedValue({ id: 'ct-1' });

    await expect(svc.assertAcceso('c1', pedagogo)).resolves.toBeUndefined();
  });

  it('un terapeuta sin asignacion recibe 403', async () => {
    prisma.clienteTrabajador.findFirst.mockResolvedValue(null);

    await expect(svc.assertAcceso('c1', pedagogo)).rejects.toThrow(ForbiddenException);
  });

  // Una asignacion dada de baja no vale: el terapeuta que dejo de llevar al
  // menor deja de ver su ficha.
  it('solo cuenta la asignacion activa', async () => {
    prisma.clienteTrabajador.findFirst.mockResolvedValue({ id: 'ct-1' });

    await svc.assertAcceso('c1', pedagogo);

    expect(prisma.clienteTrabajador.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          clienteId: 'c1',
          trabajadorId: 'terapeuta-1',
          activo: true,
        }),
      }),
    );
  });

  it('el mensaje del 403 dice a que no se tiene acceso', async () => {
    prisma.clienteTrabajador.findFirst.mockResolvedValue(null);

    await expect(
      svc.assertAcceso('c1', pedagogo, 'la documentación de este cliente'),
    ).rejects.toThrow('No tienes acceso a la documentación de este cliente');
  });

  // Las llamadas internas (crones, tareas sin usuario) no traen `user`. No se
  // les puede exigir una asignacion que no tienen.
  it('sin usuario solo comprueba que el cliente existe', async () => {
    await expect(svc.assertAcceso('c1', undefined)).resolves.toBeUndefined();
    expect(prisma.clienteTrabajador.findFirst).not.toHaveBeenCalled();
  });
});
