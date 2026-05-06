import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EtiquetaRegistro } from '@prisma/client';
import { CreateRegistroDiarioDto, ObjetivoTrabajadoDto, UpdateRegistroDiarioDto } from './dto/create-registro.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FichajeService {
  constructor(private readonly prisma: PrismaService) {}

  private buildEtiquetas(etiquetas?: EtiquetaRegistro[]): EtiquetaRegistro[] {
    const base = etiquetas ?? [];
    return base.includes(EtiquetaRegistro.REGISTRO_DIARIO)
      ? base
      : [EtiquetaRegistro.REGISTRO_DIARIO, ...base];
  }

  private async validateObjetivos(objetivos: ObjetivoTrabajadoDto[]): Promise<void> {
    const ids = objetivos.map(o => o.objetivoGeneralId);
    const encontrados = await this.prisma.objetivoGeneral.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const idsEncontrados = encontrados.map(o => o.id);
    const idsNoEncontrados = ids.filter(id => !idsEncontrados.includes(id));
    if (idsNoEncontrados.length > 0) {
      throw new BadRequestException(
        `Objetivos no encontrados: ${idsNoEncontrados.join(', ')}`,
      );
    }
  }

  /* ---------- CREATE ---------- */
  async create(
    dto: CreateRegistroDiarioDto,
    trabajadorId: string,
  ): Promise<any> {
    try {
      const cliente = await this.prisma.cliente.findUnique({
        where: { id: dto.clienteId },
      });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      if (dto.objetivosGeneralesTrabajados?.length) {
        await this.validateObjetivos(dto.objetivosGeneralesTrabajados);
      }

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

      return await this.prisma.registroDiario.create({
        data: {
          contenido: dto.contenido,
          clienteId: dto.clienteId,
          trabajadorId,
          etiquetas: this.buildEtiquetas(dto.etiquetas),
          ...(dto.proximaSesion !== undefined && { proximaSesion: dto.proximaSesion || null }),
          ...(dto.fechaRegistro && {
            fechaRegistro: new Date(dto.fechaRegistro),
          }),
          ...(dto.objetivosGeneralesTrabajados?.length && {
            objetivosGeneralesTrabajados: {
              create: dto.objetivosGeneralesTrabajados.map((obj) => ({
                objetivoGeneralId: obj.objetivoGeneralId,
                notasRegistro: obj.notasRegistro ?? null,
              })),
            },
          }),
        },
        include: {
          cliente: { select: { id: true, nombre: true, apellidos: true } },
          trabajador: { select: { id: true, nombre: true, apellidos: true } },
          objetivosGeneralesTrabajados: {
            include: { objetivoGeneral: { include: { areaDesarrollo: true } } },
          },
        },
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Error al crear registro diario: ${err.message}`);
    }
  }

  /* ---------- UPDATE ---------- */
  async update(id: string, dto: UpdateRegistroDiarioDto): Promise<any> {
    const { contenido, objetivosGeneralesTrabajados, etiquetas, fechaRegistro, proximaSesion } = dto;
    try {
      const registro = await this.prisma.registroDiario.findUnique({ where: { id } });
      if (!registro) throw new NotFoundException('Registro diario no encontrado');

      if (objetivosGeneralesTrabajados?.length) {
        await this.validateObjetivos(objetivosGeneralesTrabajados);
      }

      return await this.prisma.$transaction(async (tx) => {
        if (objetivosGeneralesTrabajados !== undefined) {
          await tx.registroDiarioObjetivo.deleteMany({ where: { registroDiarioId: id } });
        }
        return tx.registroDiario.update({
          where: { id },
          data: {
            contenido,
            ...(proximaSesion !== undefined && { proximaSesion: proximaSesion || null }),
            ...(fechaRegistro && { fechaRegistro: new Date(fechaRegistro) }),
            ...(etiquetas !== undefined && { etiquetas: this.buildEtiquetas(etiquetas) }),
            ...(objetivosGeneralesTrabajados?.length && {
              objetivosGeneralesTrabajados: {
                create: objetivosGeneralesTrabajados.map((obj) => ({
                  objetivoGeneralId: obj.objetivoGeneralId,
                  notasRegistro: obj.notasRegistro ?? null,
                })),
              },
            }),
          },
          include: {
            trabajador: { select: { id: true, nombre: true, apellidos: true } },
            objetivosGeneralesTrabajados: {
              include: { objetivoGeneral: { include: { areaDesarrollo: true } } },
            },
          },
        });
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
      throw new InternalServerErrorException(`Error al actualizar registro diario: ${err.message}`);
    }
  }

  /* ---------- READ (por Cliente) ---------- */
  async findByCliente(clienteId: string): Promise<any[]> {
    try {
      const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      return await this.prisma.registroDiario.findMany({
        where: { clienteId },
        include: {
          trabajador: { select: { id: true, nombre: true, apellidos: true } },
          objetivosGeneralesTrabajados: {
            include: { objetivoGeneral: { include: { areaDesarrollo: true } } },
          },
        },
        orderBy: { fechaRegistro: 'desc' },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener registros del cliente: ${err.message}`);
    }
  }

  /* ---------- READ (por Trabajador) ---------- */
  async findByTrabajador(trabajadorId: string): Promise<any[]> {
    try {
      return await this.prisma.registroDiario.findMany({
        where: { trabajadorId },
        include: {
          cliente: { select: { id: true, nombre: true, apellidos: true } },
          objetivosGeneralesTrabajados: {
            include: { objetivoGeneral: { include: { areaDesarrollo: true } } },
          },
        },
        orderBy: { fechaRegistro: 'desc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener registros del trabajador: ${err.message}`);
    }
  }

  /* ---------- READ (por ID) ---------- */
  async findOne(id: string): Promise<any> {
    try {
      const registro = await this.prisma.registroDiario.findUnique({
        where: { id },
        include: {
          trabajador: { select: { id: true, nombre: true, apellidos: true } },
          cliente: { select: { id: true, nombre: true, apellidos: true } },
          objetivosGeneralesTrabajados: {
            include: { objetivoGeneral: { include: { areaDesarrollo: true } } },
          },
        },
      });
      if (!registro) throw new NotFoundException('Registro diario no encontrado');
      return registro;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener el registro diario: ${err.message}`);
    }
  }

  /* ---------- DELETE ---------- */
  async remove(id: string): Promise<void> {
    try {
      const registro = await this.prisma.registroDiario.findUnique({ where: { id } });
      if (!registro) throw new NotFoundException('Registro diario no encontrado');
      await this.prisma.registroDiario.delete({ where: { id } });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al eliminar registro diario: ${err.message}`);
    }
  }
}
