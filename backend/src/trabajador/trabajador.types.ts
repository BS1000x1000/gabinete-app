import { Prisma } from '@prisma/client';

export const trabajadorInclude = {
  rol: true,
  clientesAsignados: {
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          activo: true,
        },
      },
    },
  },
} as const;

export type TrabajadorWithRelations = Prisma.TrabajadorGetPayload<{
  include: typeof trabajadorInclude;
}>;

// Tipo para trabajador sin password
export type TrabajadorSafe = Omit<TrabajadorWithRelations, 'passwordHash'>;