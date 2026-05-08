import { Prisma } from '@prisma/client';

export const sesionInclude = {
  cliente: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      dni: true,
    },
  },
  trabajador: {
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      email: true,
      urlVideollamada: true,
    },
  },
} as const;

export type SesionWithRelations = Prisma.SesionGetPayload<{
  include: typeof sesionInclude;
}>;