import { Test, TestingModule } from '@nestjs/testing';
import { TokensCronService } from './tokens-cron.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TokensCronService', () => {
  let svc: TokensCronService;
  let prisma: { tokenRevocado: { deleteMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { tokenRevocado: { deleteMany: jest.fn().mockResolvedValue({ count: 3 }) } };
    const mod: TestingModule = await Test.createTestingModule({
      providers: [TokensCronService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    svc = mod.get(TokensCronService);
  });

  it('borra solo los tokens ya caducados', async () => {
    await svc.purgarTokensCaducados();

    const where = prisma.tokenRevocado.deleteMany.mock.calls[0][0].where;
    expect(where.expiresAt.lt).toBeInstanceOf(Date);
  });

  it('devuelve cuantos ha purgado', async () => {
    await expect(svc.purgarTokensCaducados()).resolves.toBe(3);
  });

  // Es mantenimiento: si falla, se registra y se sigue.
  it('un fallo no propaga', async () => {
    prisma.tokenRevocado.deleteMany.mockRejectedValue(new Error('BD caida'));

    await expect(svc.purgarTokensCaducados()).resolves.toBe(0);
  });
});
