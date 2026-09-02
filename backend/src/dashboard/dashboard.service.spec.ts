import { Test } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const makePrismaMock = () => ({
  sesion: {
    findMany: jest.fn().mockResolvedValue([]),
    groupBy: jest.fn().mockResolvedValue([]),
  },
  registroDiario: { count: jest.fn().mockResolvedValue(0) },
  cliente: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn(),
  },
});

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: ReturnType<typeof makePrismaMock>;

  beforeEach(async () => {
    prisma = makePrismaMock();
    const module = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(DashboardService);
  });

  describe('getEstadisticasAvanzadas() — top clientes', () => {
    const desde = new Date('2026-08-01');
    const hasta = new Date('2026-08-31');

    const groupBy = [
      { clienteId: 'c-3', _count: { clienteId: 9 } },
      { clienteId: 'c-1', _count: { clienteId: 5 } },
      { clienteId: 'c-2', _count: { clienteId: 2 } },
    ];

    /**
     * Antes eran diez `findUnique` dentro de un `Promise.all`: once viajes a la
     * base de datos para pintar una lista de diez filas.
     */
    it('resuelve los nombres en una sola consulta', async () => {
      prisma.sesion.groupBy.mockResolvedValue(groupBy);
      prisma.cliente.findMany.mockResolvedValue([
        { id: 'c-1', nombre: 'Ana', apellidos: 'Ruiz' },
        { id: 'c-2', nombre: 'Beto', apellidos: 'Sanz' },
        { id: 'c-3', nombre: 'Cira', apellidos: 'Toro' },
      ]);

      await service.getEstadisticasAvanzadas(desde, hasta);

      expect(prisma.cliente.findUnique).not.toHaveBeenCalled();
      expect(prisma.cliente.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.cliente.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['c-3', 'c-1', 'c-2'] } },
        select: { id: true, nombre: true, apellidos: true },
      });
    });

    /**
     * `findMany` no garantiza orden; el ranking lo manda el `groupBy`, que viene
     * ordenado por número de sesiones descendente.
     */
    it('conserva el orden del ranking, no el que devuelva la consulta', async () => {
      prisma.sesion.groupBy.mockResolvedValue(groupBy);
      prisma.cliente.findMany.mockResolvedValue([
        { id: 'c-1', nombre: 'Ana', apellidos: 'Ruiz' },
        { id: 'c-2', nombre: 'Beto', apellidos: 'Sanz' },
        { id: 'c-3', nombre: 'Cira', apellidos: 'Toro' },
      ]);

      const res = await service.getEstadisticasAvanzadas(desde, hasta);

      expect(res.topClientes.map((t) => t.cliente!.id)).toEqual([
        'c-3',
        'c-1',
        'c-2',
      ]);
      expect(res.topClientes.map((t) => t.total)).toEqual([9, 5, 2]);
    });

    it('descarta el cliente que ya no existe en vez de colar un hueco', async () => {
      prisma.sesion.groupBy.mockResolvedValue(groupBy);
      prisma.cliente.findMany.mockResolvedValue([
        { id: 'c-3', nombre: 'Cira', apellidos: 'Toro' },
      ]);

      const res = await service.getEstadisticasAvanzadas(desde, hasta);

      expect(res.topClientes).toEqual([
        { cliente: { id: 'c-3', nombre: 'Cira', apellidos: 'Toro' }, total: 9 },
      ]);
    });

    it('no consulta clientes cuando el periodo no tiene sesiones', async () => {
      const res = await service.getEstadisticasAvanzadas(desde, hasta);

      expect(res.topClientes).toEqual([]);
      expect(prisma.cliente.findMany).toHaveBeenCalledWith({
        where: { id: { in: [] } },
        select: { id: true, nombre: true, apellidos: true },
      });
    });
  });
});
