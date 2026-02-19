import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegistroDiarioDto } from './dto/create-registro.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FichajeService {
  constructor(private readonly prisma: PrismaService) {}

  /* ---------- CREATE ---------- */
  async create(
    dto: CreateRegistroDiarioDto,
    trabajadorId: string,
  ): Promise<any> {
    try {
      // 1. Verificar que el cliente exista
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: dto.clienteId },
      });

      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      // 2. Si viene sesionId, verificar que exista y marcarla como completada
      if (dto.sesionId) {
        const sesion = await this.prisma.sesion.findUnique({
          where: { id: dto.sesionId },
        });

        if (sesion) {
          await this.prisma.sesion.update({
            where: { id: dto.sesionId },
            data: { estado: 'COMPLETADA' },
          });
        }
      }

      // 3. Crear el registro diario
      return await this.prisma.registroDiario.create({
        data: {
          contenido: dto.contenido,
          clienteId: dto.clienteId,
          trabajadorId: trabajadorId,
          ...(dto.fechaRegistro && {
            fechaRegistro: new Date(dto.fechaRegistro),
          }),
          // Vincular objetivos generales trabajados
          objetivosGeneralesTrabajados: dto.objetivosGeneralesTrabajados
            ? {
                create: dto.objetivosGeneralesTrabajados.map((objId) => ({
                  objetivoGeneralId: objId,
                })),
              }
            : undefined,
        },
        include: {
          cliente: true,
          trabajador: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          // Incluir objetivos trabajados en la respuesta
          objetivosGeneralesTrabajados: {
            include: {
              objetivoGeneral: {
                include: {
                  areaDesarrollo: true,
                },
              },
            },
          },
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al crear registro diario: ${err.message}`,
      );
    }
  }

  /* ---------- READ (por Cliente) ---------- */
  async findByCliente(clienteId: string): Promise<any[]> {
    try {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: clienteId },
      });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      return await this.prisma.registroDiario.findMany({
        where: { clienteId },
        include: {
          trabajador: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          objetivosGeneralesTrabajados: {
            include: {
              objetivoGeneral: {
                include: {
                  areaDesarrollo: true,
                },
              },
            },
          },
        },
        orderBy: { fechaRegistro: 'desc' },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al obtener registros del cliente: ${err.message}`,
      );
    }
  }

  /* ---------- READ (por Trabajador) ---------- */
  async findByTrabajador(trabajadorId: string): Promise<any[]> {
    try {
      return await this.prisma.registroDiario.findMany({
        where: { trabajadorId },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
          objetivosGeneralesTrabajados: {
            include: {
              objetivoGeneral: {
                include: {
                  areaDesarrollo: true,
                },
              },
            },
          },
        },
        orderBy: { fechaRegistro: 'desc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener registros del trabajador: ${err.message}`,
      );
    }
  }

  /* ---------- READ (por ID) ---------- */
  async findOne(id: string): Promise<any> {
    try {
      const registro = await this.prisma.registroDiario.findUnique({
        where: { id },
        include: {
          trabajador: true,
          cliente: true,
          objetivosGeneralesTrabajados: {
            include: {
              objetivoGeneral: {
                include: {
                  areaDesarrollo: true,
                },
              },
            },
          },
        },
      });
      if (!registro)
        throw new NotFoundException('Registro diario no encontrado');
      return registro;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al obtener el registro diario: ${err.message}`,
      );
    }
  }

  /* ---------- UPDATE ---------- */
  async update(
    id: string,
    contenido: string,
    objetivosGeneralesTrabajados?: string[],
  ): Promise<any> {
    try {
      const registro = await this.prisma.registroDiario.findUnique({
        where: { id },
      });
      if (!registro)
        throw new NotFoundException('Registro diario no encontrado');

      // Si se actualizan los objetivos, primero eliminar los existentes
      if (objetivosGeneralesTrabajados !== undefined) {
        await this.prisma.registroDiarioObjetivo.deleteMany({
          where: { registroDiarioId: id },
        });
      }

      return await this.prisma.registroDiario.update({
        where: { id },
        data: {
          contenido,
          ...(objetivosGeneralesTrabajados && {
            objetivosGeneralesTrabajados: {
              create: objetivosGeneralesTrabajados.map((objId) => ({
                objetivoGeneralId: objId,
              })),
            },
          }),
        },
        include: {
          objetivosGeneralesTrabajados: {
            include: {
              objetivoGeneral: {
                include: {
                  areaDesarrollo: true,
                },
              },
            },
          },
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al actualizar registro diario: ${err.message}`,
      );
    }
  }

  /* ---------- DELETE ---------- */
  async remove(id: string): Promise<void> {
    try {
      const registro = await this.prisma.registroDiario.findUnique({
        where: { id },
      });
      if (!registro)
        throw new NotFoundException('Registro diario no encontrado');

      await this.prisma.registroDiario.delete({ where: { id } });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al eliminar registro diario: ${err.message}`,
      );
    }
  }
}
