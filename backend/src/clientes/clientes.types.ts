import { Prisma } from '@prisma/client';

// Define el include una sola vez
export const clienteInclude = {
  colegio: true,
  contactosFamiliares: true,
  sanitario: true,
  disponibilidad: true,
  trabajadoresAsignados: {
    include: {
      trabajador: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          email: true,
          // NO incluyas passwordHash por seguridad
        },
      },
    },
  },
  objetivosGeneralesAsignados: {
    where: { activo: true },
    include: {
      objetivoGeneral: {
        include: {
          areaDesarrollo: true,
        },
      },
    },
  },
} as const;

// Infiere el tipo desde Prisma
export type ClienteWithRelations = Prisma.ClienteGetPayload<{
  include: typeof clienteInclude;
}>;