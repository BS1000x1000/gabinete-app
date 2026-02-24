import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
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

      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // 2. ✅ Verificar que los objetivos existan (si se enviaron)
      if (dto.objetivosGeneralesTrabajados!.length > 0) {
        const objetivosExistentes = await this.prisma.objetivoGeneral.findMany({
          where: {
            id: {
              in: dto.objetivosGeneralesTrabajados,
            },
          },
          select: {
            id: true,
            titulo: true,
          },
        });

        const idsEncontrados = objetivosExistentes.map(obj => obj.id);
        const idsNoEncontrados = dto.objetivosGeneralesTrabajados!.filter(
          id => !idsEncontrados.includes(id)
        );

        if (idsNoEncontrados.length > 0) {
          throw new BadRequestException(
            `Objetivos no encontrados: ${idsNoEncontrados.join(', ')}`
          );
        }

        console.log('✅ Objetivos validados:', objetivosExistentes.map(o => o.titulo));
      }

      // 3. Si viene sesionId, verificar y marcarla como completada
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

      // 4. ✅ CORREGIDO: Crear el registro diario
      const nuevoRegistro = await this.prisma.registroDiario.create({
        data: {
          contenido: dto.contenido,
          clienteId: dto.clienteId,
          trabajadorId: trabajadorId,
          ...(dto.fechaRegistro && {
            fechaRegistro: new Date(dto.fechaRegistro),
          }),
          // ✅ CLAVE: Usar los campos explícitos de la tabla intermedia
          ...(dto.objetivosGeneralesTrabajados && 
            dto.objetivosGeneralesTrabajados.length > 0 && {
            objetivosGeneralesTrabajados: {
              create: dto.objetivosGeneralesTrabajados.map((objetivoId) => ({
                objetivoGeneralId: objetivoId, // ✅ Campo directo, no nested
              })),
            },
          }),
        },
        include: {
          cliente: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
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
      });

      console.log('✅ Registro creado:', nuevoRegistro.id);
      console.log(`✅ Con ${nuevoRegistro.objetivosGeneralesTrabajados.length} objetivos`);

      return nuevoRegistro;

    } catch (err) {
      console.error('❌ Error completo:', err);
      
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      
      throw new InternalServerErrorException(
        `Error al crear registro diario: ${err.message}`,
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
      
      if (!registro) {
        throw new NotFoundException('Registro diario no encontrado');
      }

      // ✅ Validar objetivos si se envían
      if (objetivosGeneralesTrabajados!.length > 0) {
        const objetivosExistentes = await this.prisma.objetivoGeneral.findMany({
          where: {
            id: { in: objetivosGeneralesTrabajados },
          },
          select: { id: true },
        });

        const idsEncontrados = objetivosExistentes.map(obj => obj.id);
        const idsNoEncontrados = objetivosGeneralesTrabajados!.filter(
          id => !idsEncontrados.includes(id)
        );

        if (idsNoEncontrados.length > 0) {
          throw new BadRequestException(
            `Objetivos no encontrados: ${idsNoEncontrados.join(', ')}`
          );
        }
      }

      // Si se actualizan los objetivos, primero eliminar los existentes
      if (objetivosGeneralesTrabajados !== undefined) {
        await this.prisma.registroDiarioObjetivo.deleteMany({
          where: { registroDiarioId: id },
        });
      }

      // ✅ CORREGIDO: Actualizar el registro
      return await this.prisma.registroDiario.update({
        where: { id },
        data: {
          contenido,
          ...(objetivosGeneralesTrabajados && 
            objetivosGeneralesTrabajados.length > 0 && {
            objetivosGeneralesTrabajados: {
              create: objetivosGeneralesTrabajados.map((objetivoId) => ({
                objetivoGeneralId: objetivoId, // ✅ Campo directo
              })),
            },
          }),
        },
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
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error al actualizar registro diario: ${err.message}`,
      );
    }
  }

  /* ---------- READ (por Cliente) ---------- */
  async findByCliente(clienteId: string): Promise<any[]> {
    try {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: clienteId },
      });
      
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

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
          trabajador: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
            },
          },
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
      });
      
      if (!registro) {
        throw new NotFoundException('Registro diario no encontrado');
      }
      
      return registro;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al obtener el registro diario: ${err.message}`,
      );
    }
  }

  /* ---------- DELETE ---------- */
  async remove(id: string): Promise<void> {
    try {
      const registro = await this.prisma.registroDiario.findUnique({
        where: { id },
      });
      
      if (!registro) {
        throw new NotFoundException('Registro diario no encontrado');
      }

      // Las relaciones se eliminan automáticamente por el onDelete: Cascade
      await this.prisma.registroDiario.delete({ where: { id } });
      
      console.log('🗑️ Registro eliminado:', id);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al eliminar registro diario: ${err.message}`,
      );
    }
  }
}