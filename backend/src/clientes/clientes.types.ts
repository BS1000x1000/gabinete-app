import { Prisma } from '@prisma/client';

export const WHERE_NOT_DELETED = { deletedAt: null } as const;

// Define el include una sola vez
export const clienteInclude = {
  colegio: true,
  contactosFamiliares: true,
  sanitario: true,
  disponibilidad: true, // Disponibilidad general
  trabajadoresAsignados: {
    include: {
      trabajador: {
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          email: true,
        },
      },
      horarios: true, // ✅ AGREGAR: Horarios específicos con el trabajador
    },
  },
  objetivosGeneralesAsignados: {
    where: {
      activo: true,
    },
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