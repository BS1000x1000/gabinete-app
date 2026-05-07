import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TrabajadorController } from './trabajador.controller';
import { TrabajadorService } from './trabajador.service';
import { TipoSesion } from '@prisma/client';

// ── Mock factory ─────────────────────────────────────────────────────────────
const mockTrabajador = (overrides: Record<string, any> = {}) => ({
  id: 'trabajador-1',
  username: 'terapeuta1',
  nombre: 'Laura',
  apellidos: 'Martín',
  email: 'laura@gabinete.es',
  activo: true,
  rol: { id: 'rol-1', codigo: 'PEDAGOGO' },
  ...overrides,
});

const mockReq = (overrides: Record<string, any> = {}) => ({
  user: { userId: 'admin-1', rol: 'ADMIN', ...overrides },
});

const makeTrabajadorServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByRol: jest.fn(),
  findOne: jest.fn(),
  getClientesAsignados: jest.fn(),
  asignarCliente: jest.fn(),
  desasignarCliente: jest.fn(),
  update: jest.fn(),
  cambiarPassword: jest.fn(),
  setPasswordAdmin: jest.fn(),
  reactivar: jest.fn(),
  remove: jest.fn(),
});

// ── Suite ────────────────────────────────────────────────────────────────────
describe('TrabajadorController', () => {
  let controller: TrabajadorController;
  let service: ReturnType<typeof makeTrabajadorServiceMock>;

  beforeEach(async () => {
    service = makeTrabajadorServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrabajadorController],
      providers: [{ provide: TrabajadorService, useValue: service }],
    }).compile();

    controller = module.get<TrabajadorController>(TrabajadorController);
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('crea y devuelve el trabajador', async () => {
      const dto = { username: 'nuevo', nombre: 'Ana', apellidos: 'Gil', email: 'ana@test.es' };
      service.create.mockResolvedValue(mockTrabajador());

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toBeDefined();
    });
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('devuelve trabajadores activos por defecto', async () => {
      const lista = [mockTrabajador(), mockTrabajador({ id: 'trabajador-2' })];
      service.findAll.mockResolvedValue(lista);

      const result = await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toHaveLength(2);
    });

    it('pasa incluirInactivos=true cuando se pasa "true"', async () => {
      service.findAll.mockResolvedValue([]);

      await controller.findAll('true');

      expect(service.findAll).toHaveBeenCalledWith(true);
    });
  });

  // ── findByRol ─────────────────────────────────────────────────────────────
  describe('findByRol()', () => {
    it('devuelve trabajadores del rol especificado', async () => {
      const lista = [mockTrabajador()];
      service.findByRol.mockResolvedValue(lista);

      const result = await controller.findByRol('rol-1');

      expect(service.findByRol).toHaveBeenCalledWith('rol-1');
      expect(result).toEqual(lista);
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('devuelve el trabajador si existe', async () => {
      service.findOne.mockResolvedValue(mockTrabajador());

      const result = await controller.findOne('trabajador-1', mockReq());

      expect(result).toBeDefined();
    });

    it('lanza NotFoundException si no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('no-existe', mockReq())).rejects.toThrow(NotFoundException);
    });
  });

  // ── getClientesAsignados ──────────────────────────────────────────────────
  describe('getClientesAsignados()', () => {
    it('devuelve los clientes asignados al trabajador', async () => {
      const clientes = [{ id: 'cliente-1', nombre: 'Ana' }];
      service.getClientesAsignados.mockResolvedValue(clientes);

      const result = await controller.getClientesAsignados('trabajador-1', mockReq());

      expect(service.getClientesAsignados).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(clientes);
    });
  });

  // ── asignarCliente ────────────────────────────────────────────────────────
  describe('asignarCliente()', () => {
    it('asigna cliente con tipo de terapia', async () => {
      const expected = { id: 'asignacion-1' };
      service.asignarCliente.mockResolvedValue(expected);

      const result = await controller.asignarCliente(
        'trabajador-1',
        'cliente-1',
        { tipoTerapia: TipoSesion.PEDAGOGIA },
      );

      expect(service.asignarCliente).toHaveBeenCalledWith(
        'trabajador-1', 'cliente-1', TipoSesion.PEDAGOGIA,
      );
      expect(result).toEqual(expected);
    });
  });

  // ── desasignarCliente ─────────────────────────────────────────────────────
  describe('desasignarCliente()', () => {
    it('desasigna el cliente del trabajador', async () => {
      const expected = { message: 'Desasignado' };
      service.desasignarCliente.mockResolvedValue(expected);

      const result = await controller.desasignarCliente('trabajador-1', 'cliente-1');

      expect(service.desasignarCliente).toHaveBeenCalledWith('trabajador-1', 'cliente-1');
      expect(result).toEqual(expected);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('actualiza y devuelve el trabajador', async () => {
      const dto = { nombre: 'Laura M.' };
      const updated = mockTrabajador({ nombre: 'Laura M.' });
      service.update.mockResolvedValue(updated);

      const result = await controller.update('trabajador-1', dto as any);

      expect(service.update).toHaveBeenCalledWith('trabajador-1', dto);
      expect(result).toEqual(updated);
    });
  });

  // ── cambiarPassword (admin) ───────────────────────────────────────────────
  describe('cambiarPassword()', () => {
    it('delega a setPasswordAdmin con id y nueva contraseña', async () => {
      const expected = { message: 'Contraseña actualizada correctamente' };
      service.setPasswordAdmin.mockResolvedValue(expected);

      const result = await controller.cambiarPassword('trabajador-1', {
        passwordNueva: 'Nueva123!',
      });

      expect(service.setPasswordAdmin).toHaveBeenCalledWith('trabajador-1', 'Nueva123!');
      expect(result).toEqual(expected);
    });
  });

  // ── reactivar ─────────────────────────────────────────────────────────────
  describe('reactivar()', () => {
    it('reactiva el trabajador', async () => {
      const reactivado = mockTrabajador({ activo: true });
      service.reactivar.mockResolvedValue(reactivado);

      const result = await controller.reactivar('trabajador-1');

      expect(service.reactivar).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(reactivado);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('desactiva el trabajador', async () => {
      const expected = { message: 'Trabajador desactivado' };
      service.remove.mockResolvedValue(expected);

      const result = await controller.remove('trabajador-1');

      expect(service.remove).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(expected);
    });
  });
});
