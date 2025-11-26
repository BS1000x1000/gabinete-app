import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// Importamos el cliente de Prisma y el objeto 'Prisma' para manejar tipos de errores
import { prisma } from 'src/lib/prisma';
import { Cliente, Prisma } from 'generated/prisma'; // Asumo que 'Prisma' se exporta aquí o desde @prisma/client

import { CreateClienteDto } from './dto/clientedto-interface';

// Definición de un tipo auxiliar para el retorno que incluye las relaciones.
type ClienteWithRelations = Prisma.ClienteGetPayload<{
  include: {
    colegio: true;
    contactosFamiliares: true;
  };
}>;


@Injectable()
export class ClientesService {
  // Constructor simplificado, ya no inyecta N8nService
  constructor() {} 

  /**
   * Crea un nuevo cliente, realiza un upsert del colegio asociado,
   * y crea un contacto familiar. Todo dentro de una transacción atómica.
   * @param data DTO con los datos del nuevo cliente.
   * @returns El objeto Cliente recién creado con relaciones.
   */
  async create(data: CreateClienteDto): Promise<ClienteWithRelations> {
    let nuevoCliente: ClienteWithRelations;

    try {
      // Usar $transaction para garantizar la atomicidad de las operaciones de DB
      nuevoCliente = await prisma.$transaction(async (tx) => {
        // 1. Lógica de Upsert para el Colegio (crear o actualizar si ya existe)
        let colegioExistente: any = null;
        if (data.nombreDelCentro) {
          colegioExistente = await tx.colegio.upsert({
            where: { nombre: data.nombreDelCentro },
            update: {
              direccionColegio: data.direccionColegio,
              ctoEmailColegioUno: data.ctoEmailColegioUno,
              ctoRelacionColegioUno: data.ctoRelacionColegioUno,
              ctoEmailColegioDos: data.ctoEmailColegioDos,
              ctoRelacionColegioDos: data.ctoRelacionColegioDos,
            },
            create: {
              nombre: data.nombreDelCentro,
              direccionColegio: data.direccionColegio,
              ctoEmailColegioUno: data.ctoEmailColegioUno,
              ctoRelacionColegioUno: data.ctoRelacionColegioUno,
              ctoEmailColegioDos: data.ctoEmailColegioDos,
              ctoRelacionColegioDos: data.ctoRelacionColegioDos,
            },
          });
        }

        // 2. Crear el Cliente y el Contacto Familiar en una sola transacción anidada
        return await tx.cliente.create({
          data: {
            nombre: data.nombre,
            apellidos: data.apellidos,
            fechaNacimiento: data.fechaNacimiento,
            alergias: data.alergias,
            activo: true,

            domicilio: data.domicilio,
            curso: data.cursoEscolar,
            diagnostico: data.diagnostico ?? '',
            tratamientos: data.otrosTratamientos ?? '',
            medicacion: data.medicacion ?? '',

            // Campos booleanos basados en la presencia de datos
            adaptaciones: !!data.tipoAdaptaciones,
            apoyos: !!(data.numeroDeSesiones && data.numeroDeSesiones.length > 0),

            // Conecta el colegio si se creó o encontró
            colegio: colegioExistente
              ? { connect: { id: colegioExistente.id } }
              : undefined,

            // Creación anidada del contacto familiar
            contactosFamiliares: {
              create: {
                nombreContacto:
                  data.nombreMadre ||
                  data.nombrePadre ||
                  data.otroContactoNombre ||
                  'Contacto Principal',
                parentesco: 'Contacto Principal',

                emailPadre: data.emailPadre,
                telefonoPadre: data.telefonoPadre
                  ? String(data.telefonoPadre)
                  : undefined,

                emailMadre: data.emailMadre,
                telefonoMadre: data.telefonoMadre
                  ? String(data.telefonoMadre)
                  : undefined,

                telefonoWhatsapp:
                  String(data.telefonoMadre) ||
                  String(data.telefonoPadre) ||
                  String(data.otroContactoTelefono),
              },
            },
          },
          // Incluir la información de relaciones en el retorno
          include: {
            colegio: true,
            contactosFamiliares: true,
          },
        });
      });

      return nuevoCliente;
    } catch (error: any) {
      // Manejo de errores de Prisma (e.g., violación de unicidad P2002)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code, 'Message:', error.message);
        throw new InternalServerErrorException(
          `Error de base de datos (Prisma): Código ${error.code}. Intente de nuevo.`,
        );
      }
      
      console.error('General Error:', error.message);
      throw new InternalServerErrorException(
        `Fallo general en la creación del cliente: ${error.message}`,
      );
    }
  }

  // ---------- READ ALL ----------
  async findAll(): Promise<Cliente[]> {
    try {
      return await prisma.cliente.findMany({
        where: { activo: true },
        include: {
          colegio: true,
          contactosFamiliares: true,
        },
        orderBy: { id: 'desc' },
      });
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        throw new InternalServerErrorException(
          `Error de base de datos al obtener clientes: Código ${error.code}.`,
        );
      }
      throw new InternalServerErrorException(
        `Error al obtener clientes: ${error.message}`,
      );
    }
  }

  // ---------- READ (por ID) ----------
  async findOne(id: string): Promise<ClienteWithRelations> {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id },
        include: {
          colegio: true,
          contactosFamiliares: true,
        },
      });

      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      return cliente as ClienteWithRelations;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        throw new InternalServerErrorException(
          `Error de base de datos al buscar cliente: Código ${error.code}.`,
        );
      }
      throw new InternalServerErrorException(
        `Error al obtener cliente: ${error.message}`,
      );
    }
  }

  // ---------- UPDATE ----------
  async update(id: string, data: CreateClienteDto): Promise<ClienteWithRelations> {

    try {
      // 1. Upsert del colegio si viene en el payload
      let colegioId: string | undefined;
      if (data.nombreDelCentro) {
        const colegio = await prisma.colegio.upsert({
          where: { nombre: data.nombreDelCentro },
          update: {
            direccionColegio: data.direccionColegio,
            ctoEmailColegioUno: data.ctoEmailColegioUno,
            ctoRelacionColegioUno: data.ctoRelacionColegioUno,
            ctoEmailColegioDos: data.ctoEmailColegioDos,
            ctoRelacionColegioDos: data.ctoRelacionColegioDos,
          },
          create: {
            nombre: data.nombreDelCentro,
            direccionColegio: data.direccionColegio,
            ctoEmailColegioUno: data.ctoEmailColegioUno,
            ctoRelacionColegioUno: data.ctoRelacionColegioUno,
            ctoEmailColegioDos: data.ctoEmailColegioDos,
            ctoRelacionColegioDos: data.ctoRelacionColegioDos,
          },
        });
        colegioId = colegio.id;
      }

      // 2. Actualización del cliente
      const updated = await prisma.cliente.update({
        where: { id },
        data: {
          nombre: data.nombre,
          apellidos: data.apellidos,
          fechaNacimiento: data.fechaNacimiento,
          domicilio: data.domicilio,
          curso: data.cursoEscolar,
          diagnostico: data.diagnostico,
          tratamientos: data.otrosTratamientos,
          medicacion: data.medicacion,
          alergias: data.alergias,
          adaptaciones: !!data.tipoAdaptaciones,
          apoyos: !!(data.numeroDeSesiones && data.numeroDeSesiones.length > 0),
          colegio: colegioId ? { connect: { id: colegioId } } : undefined,
        },
        include: {
          colegio: true,
          contactosFamiliares: true,
        },
      });


      // 3. Actualización/Creación del contacto familiar (upsert)
      // ESTO REQUIERE QUE clienteId SEA @unique EN EL MODELO Familiar.
      if (data.nombreMadre || data.nombrePadre) {
        await prisma.familiar.upsert({
          where: { clienteId: id }, 
          update: {
            nombreContacto:
              data.nombreMadre || data.nombrePadre || 'Contacto Principal',
            emailMadre: data.emailMadre,
            telefonoMadre: data.telefonoMadre
              ? String(data.telefonoMadre)
              : undefined,
            emailPadre: data.emailPadre,
            telefonoPadre: data.telefonoPadre
              ? String(data.telefonoPadre)
              : undefined,
            telefonoWhatsapp:
              String(data.telefonoMadre) ||
              String(data.telefonoPadre) ||
              String(data.otroContactoTelefono),
          },
          create: {
            clienteId: id,
            nombreContacto:
              data.nombreMadre || data.nombrePadre || 'Contacto Principal',
            emailMadre: data.emailMadre,
            telefonoMadre: data.telefonoMadre
              ? String(data.telefonoMadre)
              : undefined,
            emailPadre: data.emailPadre,
            telefonoPadre: data.telefonoPadre
              ? String(data.telefonoPadre)
              : undefined,
            telefonoWhatsapp:
              String(data.telefonoMadre) ||
              String(data.telefonoPadre) ||
              String(data.otroContactoTelefono),
          },
        });
      }
      
      return updated as ClienteWithRelations;
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        throw new InternalServerErrorException(
          `Error de base de datos al actualizar cliente: Código ${error.code}.`,
        );
      }
      throw new InternalServerErrorException(
        `Error al actualizar cliente: ${error.message}`,
      );
    }
  }

  // ---------- DELETE (soft delete) ----------
  async remove(id: string): Promise<void> {
    try {
      // 1. Comprobar existencia
      const cliente = await prisma.cliente.findUnique({ where: { id } });
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
      }

      // 2. Soft delete: marcamos como inactivo
      await prisma.cliente.update({
        where: { id },
        data: { activo: false },
      });
      
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma Error Code:', error.code);
        throw new InternalServerErrorException(
          `Error de base de datos al eliminar cliente: Código ${error.code}.`,
        );
      }
      throw new InternalServerErrorException(
        `Error al eliminar cliente: ${error.message}`,
      );
    }
  }
}