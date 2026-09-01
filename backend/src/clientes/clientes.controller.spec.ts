import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { AuditService } from '../auth/audit.service';
import { ConsentimientosService } from '../consentimientos/consentimientos.service';
import { DocumentosService } from '../documentos/documentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TipoSesion } from '@prisma/client';

// ── Mock helpers ─────────────────────────────────────────────────────────────
const mockReq = (userId = 'trabajador-1') => ({ user: { userId } });

const mockCliente = (overrides: Record<string, any> = {}) => ({
  id: 'cliente-1',
  nombre: 'Ana',
  apellidos: 'García',
  dni: '12345678A',
  activo: true,
  ...overrides,
});

const makeClientesServiceMock = () => ({
  findAll: jest.fn(),
  create: jest.fn(),
  search: jest.fn(),
  findByTrabajador: jest.fn(),
  existeDni: jest.fn(),
  getEstadisticasObjetivos: jest.fn(),
  getObjetivosGenerales: jest.fn(),
  asignarObjetivosGenerales: jest.fn(),
  asignarTrabajador: jest.fn(),
  desasignarTrabajador: jest.fn(),
  actualizarHorariosAsignacion: jest.fn(),
  crearFamiliar: jest.fn(),
  updateFamiliar: jest.fn(),
  eliminarFamiliar: jest.fn(),
  updateSanitario: jest.fn(),
  updateColegio: jest.fn(),
  desasignarObjetivoGeneral: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

// ── Suite ────────────────────────────────────────────────────────────────────
describe('ClientesController', () => {
  let controller: ClientesController;
  let service: ReturnType<typeof makeClientesServiceMock>;

  beforeEach(async () => {
    service = makeClientesServiceMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [
        { provide: ClientesService, useValue: service },
        { provide: AuditService, useValue: { registrar: jest.fn() } },
        {
          provide: ConsentimientosService,
          useValue: {
            registrar: jest.fn(),
            revocar: jest.fn(),
            historico: jest.fn(),
            assertTutoresLegales: jest.fn(),
          },
        },
        { provide: DocumentosService, useValue: { create: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ClientesController>(ClientesController);
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('devuelve todos los clientes', async () => {
      const clientes = [mockCliente(), mockCliente({ id: 'cliente-2' })];
      service.findAll.mockResolvedValue(clientes);

      const mockReq = { user: { userId: 'admin-1', rol: 'ADMIN' } };
      const result = await controller.findAll(mockReq as any, {} as any);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(clientes);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('crea y devuelve el cliente', async () => {
      const dto = { nombre: 'Ana', apellidos: 'García', dni: '12345678A' };
      const cliente = mockCliente();
      service.create.mockResolvedValue(cliente);
      // El rol viaja al servicio: con el se auto-asigna al terapeuta que da de
      // alta, para que no pierda de vista la ficha que acaba de crear.
      const req = { user: { userId: 'admin-1', rol: 'PEDAGOGO' } };

      const result = await controller.create(dto as any, req as any);

      expect(service.create).toHaveBeenCalledWith(dto, 'admin-1', 'PEDAGOGO');
      expect(result).toEqual(cliente);
    });
  });

  // ── search ────────────────────────────────────────────────────────────────
  describe('search()', () => {
    it('busca por query y devuelve resultados', async () => {
      const resultados = [mockCliente()];
      service.search.mockResolvedValue(resultados);

      const mockReq = { user: { userId: 'admin-1', rol: 'ADMIN' } };
      const result = await controller.search('Ana', mockReq as any);

      expect(service.search).toHaveBeenCalledWith('Ana', mockReq.user);
      expect(result).toEqual(resultados);
    });
  });

  // ── getMisClientes ────────────────────────────────────────────────────────
  describe('getMisClientes()', () => {
    it('extrae userId del request y devuelve clientes asignados', async () => {
      const clientes = [mockCliente()];
      service.findByTrabajador.mockResolvedValue(clientes);

      const result = await controller.getMisClientes(mockReq());

      expect(service.findByTrabajador).toHaveBeenCalledWith('trabajador-1');
      expect(result).toEqual(clientes);
    });
  });

  // ── verificarDni ──────────────────────────────────────────────────────────
  describe('verificarDni()', () => {
    it('devuelve disponible=true si el DNI no existe', async () => {
      service.existeDni.mockResolvedValue(false);

      const result = await controller.verificarDni('12345678A');

      expect(result).toEqual({
        dni: '12345678A',
        disponible: true,
        mensaje: 'DNI disponible',
      });
    });

    it('devuelve disponible=false si el DNI ya está registrado', async () => {
      service.existeDni.mockResolvedValue(true);

      const result = await controller.verificarDni('12345678A');

      expect(result).toEqual({
        dni: '12345678A',
        disponible: false,
        mensaje: 'DNI ya registrado',
      });
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────
  describe('findOne()', () => {
    it('devuelve el cliente si existe', async () => {
      const cliente = mockCliente();
      service.findOne.mockResolvedValue(cliente);

      const result = await controller.findOne('cliente-1', mockReq() as any);

      expect(result).toEqual(cliente);
    });

    it('lanza NotFoundException si el cliente no existe', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('cliente-x', mockReq() as any)).rejects.toThrow(NotFoundException);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('actualiza y devuelve el cliente', async () => {
      const dto = { nombre: 'Ana María' };
      const actualizado = mockCliente({ nombre: 'Ana María' });
      service.update.mockResolvedValue(actualizado);

      const result = await controller.update('cliente-1', dto as any);

      // Sin trabajadorId: el PATCH ya no escribe el consentimiento, asi que no
      // hay nada que atribuir a nadie.
      expect(service.update).toHaveBeenCalledWith('cliente-1', dto);
      expect(result).toEqual(actualizado);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('elimina el cliente y devuelve la respuesta formateada', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('cliente-1');

      expect(service.remove).toHaveBeenCalledWith('cliente-1');
      expect(result).toMatchObject({
        message: 'Cliente eliminado correctamente',
        id: 'cliente-1',
        status: 'success',
      });
    });
  });

  // ── asignarTrabajador ─────────────────────────────────────────────────────
  describe('asignarTrabajador()', () => {
    it('delega al servicio con los datos correctos', async () => {
      const body = {
        trabajadorId: 'trabajador-1',
        tipoTerapia: TipoSesion.PEDAGOGIA,
        horarios: [{ diaSemana: 1, horaInicio: '09:00', horaFin: '10:00' }],
      };
      const expected = { id: 'asignacion-1' };
      service.asignarTrabajador.mockResolvedValue(expected);

      const result = await controller.asignarTrabajador('cliente-1', body);

      expect(service.asignarTrabajador).toHaveBeenCalledWith(
        'cliente-1',
        body.trabajadorId,
        body.tipoTerapia,
        body.horarios,
      );
      expect(result).toEqual(expected);
    });
  });

  // ── desasignarTrabajador ──────────────────────────────────────────────────
  describe('desasignarTrabajador()', () => {
    it('delega al servicio con clienteId y asignacionId', async () => {
      const expected = { message: 'Asignación eliminada' };
      service.desasignarTrabajador.mockResolvedValue(expected);

      const result = await controller.desasignarTrabajador('cliente-1', 'asignacion-1');

      expect(service.desasignarTrabajador).toHaveBeenCalledWith('cliente-1', 'asignacion-1');
      expect(result).toEqual(expected);
    });
  });

  // ── getObjetivosGenerales ─────────────────────────────────────────────────
  describe('getObjetivosGenerales()', () => {
    it('devuelve los objetivos del cliente', async () => {
      const objetivos = [{ id: 'obj-1', descripcion: 'Objetivo 1' }];
      service.getObjetivosGenerales.mockResolvedValue(objetivos);

      const result = await controller.getObjetivosGenerales('cliente-1');

      expect(service.getObjetivosGenerales).toHaveBeenCalledWith('cliente-1');
      expect(result).toEqual(objetivos);
    });
  });

  // ── asignarObjetivosGenerales ─────────────────────────────────────────────
  describe('asignarObjetivosGenerales()', () => {
    it('asigna los objetivos y devuelve el resultado', async () => {
      const body = { objetivosGeneralesIds: ['obj-1', 'obj-2'] };
      const expected = { asignados: 2 };
      service.asignarObjetivosGenerales.mockResolvedValue(expected);

      const result = await controller.asignarObjetivosGenerales('cliente-1', body);

      expect(service.asignarObjetivosGenerales).toHaveBeenCalledWith(
        'cliente-1',
        body.objetivosGeneralesIds,
      );
      expect(result).toEqual(expected);
    });
  });
});
