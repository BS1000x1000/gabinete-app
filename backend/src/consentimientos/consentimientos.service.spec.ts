import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConsentimientosService } from './consentimientos.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

const USER = { userId: 'trab-1', rol: 'ADMIN' };

const REGISTRO = {
  familiarId: 'fam-1',
  versionTexto: 'consentimiento-datos-v1-2026-09',
  documentoId: 'doc-1',
  autorizaInformesTerceros: true,
  autorizaCoordinacionCentro: false,
  autorizaImagenes: true,
  consentimientoMenor14: false,
};

describe('ConsentimientosService', () => {
  let service: ConsentimientosService;
  let prisma: any;
  let audit: any;
  let notificaciones: any;

  beforeEach(async () => {
    prisma = {
      cliente: {
        findFirst: jest.fn().mockResolvedValue({ id: 'cliente-1' }),
        findUnique: jest
          .fn()
          .mockResolvedValue({ nombre: 'Ana', apellidos: 'García' }),
        update: jest.fn().mockResolvedValue({}),
      },
      familiar: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'fam-1',
          esTutorLegal: true,
          nombre: 'Madre',
          apellidos: 'Uno',
        }),
      },
      documentoCliente: {
        findFirst: jest.fn().mockResolvedValue({ id: 'doc-1' }),
      },
      consentimientoRgpd: {
        create: jest.fn().mockResolvedValue({ id: 'cons-1' }),
        findFirst: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      trabajador: {
        findMany: jest.fn().mockResolvedValue([{ id: 'admin-1' }]),
      },
    };
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    notificaciones = { crearSiNoExiste: jest.fn().mockResolvedValue(null) };

    const mod = await Test.createTestingModule({
      providers: [
        ConsentimientosService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: audit },
        { provide: NotificacionesService, useValue: notificaciones },
      ],
    }).compile();

    service = mod.get(ConsentimientosService);
  });

  describe('registrar()', () => {
    it('guarda el hecho con su evidencia y sus alcances', async () => {
      await service.registrar('cliente-1', REGISTRO, USER);

      expect(prisma.consentimientoRgpd.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            clienteId: 'cliente-1',
            familiarId: 'fam-1',
            trabajadorId: 'trab-1',
            aceptado: true,
            documentoId: 'doc-1',
            versionTexto: 'consentimiento-datos-v1-2026-09',
            autorizaInformesTerceros: true,
            autorizaCoordinacionCentro: false,
            autorizaImagenes: true,
          }),
        }),
      );
    });

    it('sincroniza la cache del cliente, que es lo que leen chips y reglas', async () => {
      await service.registrar('cliente-1', REGISTRO, USER);

      expect(prisma.cliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cliente-1' },
          data: expect.objectContaining({
            consentimientoRgpd: true,
            consentimientoTrabajadorId: 'trab-1',
          }),
        }),
      );
    });

    it('deja rastro en el audit log', async () => {
      await service.registrar('cliente-1', REGISTRO, USER);

      expect(audit.registrar).toHaveBeenCalledWith(
        expect.objectContaining({
          evento: 'CONSENTIMIENTO_RGPD',
          recurso: 'cliente-1',
          metadata: expect.objectContaining({ accion: 'OTORGADO' }),
        }),
      );
    });

    it('rechaza a un familiar que no es tutor legal', async () => {
      prisma.familiar.findFirst.mockResolvedValue({
        id: 'fam-2',
        esTutorLegal: false,
        nombre: 'Abuela',
        apellidos: 'Dos',
      });

      await expect(
        service.registrar(
          'cliente-1',
          { ...REGISTRO, familiarId: 'fam-2' },
          USER,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prisma.consentimientoRgpd.create).not.toHaveBeenCalled();
    });

    it('rechaza a un familiar de otro cliente', async () => {
      prisma.familiar.findFirst.mockResolvedValue(null);

      await expect(
        service.registrar('cliente-1', REGISTRO, USER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza un documento que no es del cliente', async () => {
      prisma.documentoCliente.findFirst.mockResolvedValue(null);

      await expect(
        service.registrar('cliente-1', REGISTRO, USER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza un cliente inexistente o borrado', async () => {
      prisma.cliente.findFirst.mockResolvedValue(null);

      await expect(
        service.registrar('cliente-x', REGISTRO, USER),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('revocar()', () => {
    it('registra la retirada sobre el tutor que consintio, no sobre uno elegido fuera', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue({
        id: 'cons-1',
        aceptado: true,
        familiarId: 'fam-1',
        versionTexto: 'v-firmada',
      });

      await service.revocar('cliente-1', 'la familia lo solicita', USER);

      expect(prisma.consentimientoRgpd.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            aceptado: false,
            familiarId: 'fam-1',
            versionTexto: 'v-firmada',
            motivoRegistroManual: 'la familia lo solicita',
          }),
        }),
      );
      expect(prisma.cliente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ consentimientoRgpd: false }),
        }),
      );
    });

    it('avisa a la direccion', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue({
        id: 'cons-1',
        aceptado: true,
        familiarId: 'fam-1',
        versionTexto: 'v-firmada',
      });

      await service.revocar('cliente-1', 'motivo suficiente', USER);

      expect(notificaciones.crearSiNoExiste).toHaveBeenCalledWith(
        expect.objectContaining({
          prioridad: 'URGENTE',
          reglaOrigen: 'CONSENTIMIENTO_RGPD_REVOCADO',
          trabajadorId: 'admin-1',
        }),
      );
    });

    it('no se puede revocar lo que no se otorgo', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue(null);

      await expect(
        service.revocar('cliente-1', 'motivo suficiente', USER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('no se puede revocar dos veces', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue({
        id: 'cons-2',
        aceptado: false,
        familiarId: 'fam-1',
        versionTexto: 'v-firmada',
      });

      await expect(
        service.revocar('cliente-1', 'motivo suficiente', USER),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('estadoActual()', () => {
    it('es el ultimo hecho, aunque antes hubiera un otorgamiento', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue({
        id: 'cons-2',
        aceptado: false,
        autorizaCoordinacionCentro: true,
      });

      const estado = await service.estadoActual('cliente-1');

      expect(estado?.vigente).toBe(false);
      // Revocado: los alcances dejan de amparar nada aunque siguieran a true.
      await expect(service.puedeCoordinarConCentro('cliente-1')).resolves.toBe(
        false,
      );
    });

    it('sin registros no hay estado', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue(null);

      await expect(service.estadoActual('cliente-1')).resolves.toBeNull();
    });

    it('la coordinacion con el centro es su propia casilla', async () => {
      prisma.consentimientoRgpd.findFirst.mockResolvedValue({
        id: 'cons-1',
        aceptado: true,
        autorizaCoordinacionCentro: false,
      });

      // Consentimiento vigente pero sin autorizar la coordinacion: son
      // consentimientos distintos y hay que poder distinguirlos.
      await expect(service.puedeCoordinarConCentro('cliente-1')).resolves.toBe(
        false,
      );
    });
  });
});
