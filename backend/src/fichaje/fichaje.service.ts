import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegistroDiarioDto } from './dto/fichajedto.interface';
import { prisma } from 'src/lib/prisma';

@Injectable()
export class FichajeService {
  /* ---------- CREATE ---------- */
  async create(
    dto: CreateRegistroDiarioDto,
    trabajadorId: string,
  ): Promise<any> {
    try {
      const id = dto.clienteId;
      // 1. Verificar que el cliente exista
      const cliente = await prisma.cliente.findUnique({
        where: { id },
      });
      console.log(cliente);
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      // 2. Crear el registro diario vinculado a trabajador y cliente
      return await prisma.registroDiario.create({
        data: {
          contenido: dto.contenido,
          clienteId: dto.clienteId,
          trabajadorId: trabajadorId,
          // Si el DTO trae fecha se usa, si no, Prisma aplica @default(now())
          ...(dto.fechaRegistro && {
            fechaRegistro: new Date(dto.fechaRegistro),
          }),
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
      // Verificar si el cliente existe
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
      });
      if (!cliente) throw new NotFoundException('Cliente no encontrado');

      return await prisma.registroDiario.findMany({
        where: { clienteId },
        include: {
          trabajador: {
            select: {
              id: true,
              nombre: true,
              apellidos: true,
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

  /* ---------- READ (por ID) ---------- */
  async findOne(id: string): Promise<any> {
    try {
      const registro = await prisma.registroDiario.findUnique({
        where: { id },
        include: {
          trabajador: true,
          cliente: true,
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
  async update(id: string, contenido: string): Promise<any> {
    try {
      const registro = await prisma.registroDiario.findUnique({
        where: { id },
      });
      if (!registro)
        throw new NotFoundException('Registro diario no encontrado');

      return await prisma.registroDiario.update({
        where: { id },
        data: { contenido },
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
      const registro = await prisma.registroDiario.findUnique({
        where: { id },
      });
      if (!registro)
        throw new NotFoundException('Registro diario no encontrado');

      await prisma.registroDiario.delete({ where: { id } });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al eliminar registro diario: ${err.message}`,
      );
    }
  }
}
