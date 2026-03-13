import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EstadoInforme } from '@prisma/client';
import { InformesService } from './informes.service';
import { PrismaService } from '../prisma/prisma.service';

// ── Mock helpers ──────────────────────────────────────────────────────────────

const mkPrisma = () => ({
  cliente:       { findUnique: jest.fn() },
  informe:       { findMany: jest.fn(), findUnique: jest.fn() },
  clienteObjetivo: { findMany: jest.fn().mockResolvedValue([]) },
});

const mkCliente = () => ({ id: 'c1', nombre: 'Ana', apellidos: 'García' });

const mkInforme = (overrides: Record<string, any> = {}) => ({
  id: 'inf-1',
  clienteId: 'c1',
  trabajadorId: 'terapeuta-1',
  estado: EstadoInforme.BORRADOR,
  ...overrides,
});

const userAdmin    = { userId: 'admin-1',     rol: 'ADMIN'    };
const userRecep    = { userId: 'recep-1',      rol: 'RECEP'    };
const userPedagogo = { userId: 'terapeuta-1',  rol: 'PEDAGOGO' };

// ── Suite ──────────────────────────────────────────────────────────────────────

describe('InformesService', () => {
  let svc: InformesService;
  let prisma: ReturnType<typeof mkPrisma>;

  beforeEach(async () => {
    prisma = mkPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InformesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    svc = module.get<InformesService>(InformesService);
  });

  // ── findByCliente ────────────────────────────────────────────────────────────

  describe('findByCliente()', () => {
    beforeEach(() => {
      prisma.cliente.findUnique.mockResolvedValue(mkCliente());
      prisma.informe.findMany.mockResolvedValue([]);
    });

    it('lanza NotFoundException si el cliente no existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);
      await expect(svc.findByCliente('c-inexistente')).rejects.toThrow(NotFoundException);
    });

    it('ADMIN: devuelve todos los informes sin filtro extra', async () => {
      const informes = [mkInforme({ estado: 'BORRADOR' }), mkInforme({ id: 'inf-2', estado: 'FINALIZADO' })];
      prisma.informe.findMany.mockResolvedValue(informes);

      const result = await svc.findByCliente('c1', userAdmin);

      expect(prisma.informe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: 'c1' },
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('RECEP: filtra solo informes FINALIZADOS', async () => {
      await svc.findByCliente('c1', userRecep);

      expect(prisma.informe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: 'c1', estado: EstadoInforme.FINALIZADO },
        }),
      );
    });

    it('Terapeuta: filtra solo sus propios informes por trabajadorId', async () => {
      await svc.findByCliente('c1', userPedagogo);

      expect(prisma.informe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: 'c1', trabajadorId: 'terapeuta-1' },
        }),
      );
    });

    it('Sin user: devuelve todos los informes (retro-compatibilidad)', async () => {
      await svc.findByCliente('c1');

      expect(prisma.informe.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { clienteId: 'c1' },
        }),
      );
    });

    it('RECEP no ve informes en BORRADOR de otros terapeutas', async () => {
      const borrador = mkInforme({ estado: 'BORRADOR' });
      const finalizado = mkInforme({ id: 'inf-2', estado: 'FINALIZADO' });
      // El mock simula que la BD ya aplica el filtro
      prisma.informe.findMany.mockResolvedValue([finalizado]);

      const result = await svc.findByCliente('c1', userRecep);

      const where = (prisma.informe.findMany.mock.calls[0][0] as any).where;
      expect(where.estado).toBe(EstadoInforme.FINALIZADO);
      expect(where.trabajadorId).toBeUndefined();
      expect(result).toHaveLength(1);
      expect(result[0].estado).toBe('FINALIZADO');
    });

    it('Terapeuta no filtra por estado (puede ver sus borradores)', async () => {
      await svc.findByCliente('c1', userPedagogo);

      const where = (prisma.informe.findMany.mock.calls[0][0] as any).where;
      expect(where.estado).toBeUndefined();
      expect(where.trabajadorId).toBe('terapeuta-1');
    });
  });
});
