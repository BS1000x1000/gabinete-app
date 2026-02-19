import { Prisma } from '@prisma/client';

export const rolInclude = {
  trabajadores: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      email: true,
      activo: true,
    },
  },
} as const;

export type RolWithRelations = Prisma.RolGetPayload<{
  include: typeof rolInclude;
}>;