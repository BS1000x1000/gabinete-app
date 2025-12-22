// trabajador.service.ts
import { Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from 'src/lib/prisma';
import * as bcrypt from 'bcrypt';
import { CreateTrabajadorDto } from './dto/trabajador.dto';

@Injectable()
export class TrabajadorService {
  private readonly SALT_ROUNDS = 10;

  /* ---------- CREATE ---------- */
  async create(dto: CreateTrabajadorDto): Promise<any> {
    try {
      // 1. Verifica que el rol exista
      const rol = await prisma.rol.findUnique({ where: { id: dto.rolId } });
      if (!rol) throw new NotFoundException('Rol no encontrado');

      // 2. Verifica que no exista username o email duplicado
      const existe = await prisma.trabajador.findFirst({
        where: { OR: [{ username: dto.username }, { email: dto.email }] },
      });
      if (existe) throw new ConflictException('Usuario o email ya registrado');

      // 3. Hash de contraseña
      const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

      // 4. Crea el trabajador
      const trabajador = await prisma.trabajador.create({
        data: {
          username: dto.username,
          passwordHash,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          email: dto.email,
          telefono: dto.telefono,
          rolId: dto.rolId,
          activo: true
        },
        include: { rol: true },
      });
      // const { passwordHash, ...trabajadorSinPassword } = trabajador;
      return trabajador;
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) throw err;
      throw new InternalServerErrorException(`Error al crear trabajador: ${err.message}`);
    }
  }

  /* ---------- READ (todos) ---------- */
  async findAll(): Promise<any[]> {
    try {
      return await prisma.trabajador.findMany({
        where: { activo: true },
        include: { rol: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener trabajadores: ${err.message}`);
    }
  }

  /* ---------- READ (por ID) ---------- */
  async findOne(id: string): Promise<any> {
    try {
      const trabajador = await prisma.trabajador.findUnique({
        where: { id },
        include: { rol: true },
      });
      if (!trabajador) throw new NotFoundException('Trabajador no encontrado');
      return trabajador;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener trabajador: ${err.message}`);
    }
  }

  async findUser(username: string): Promise<any> {
    try {
      const usuario = await prisma.trabajador.findFirst({
        where: { username },
        include: { rol: true },
      });
      if( usuario ) return usuario;
      return null;
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener usuario: ${error.message}`);
    }
  }

  /* ---------- UPDATE (parcial) ---------- */
  async update(id: string, dto: CreateTrabajadorDto): Promise<any> {
    try {
      // 1. Verifica que exista
      const actual = await prisma.trabajador.findUnique({ where: { id } });
      if (!actual) throw new NotFoundException('Trabajador no encontrado');

      // 2. Si cambia rol, verifica que exista
      if (dto.rolId && dto.rolId !== actual.rolId) {
        const rol = await prisma.rol.findUnique({ where: { id: dto.rolId } });
        if (!rol) throw new NotFoundException('Rol no encontrado');
      }

      // 3. Si cambia contraseña, hashea
      let passwordHash: string | undefined;
      if (dto.password) {
        passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
      }

      // 4. Actualiza
      const updated = await prisma.trabajador.update({
        where: { id },
        data: {
          username: dto.username,
          passwordHash,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          email: dto.email,
          telefono: dto.telefono,
          rolId: dto.rolId,
          activo: dto.activo,
        },
        include: { rol: true },
      });
      // const { passwordHash, ...trabajadorSinPassword} = updated;
      return updated;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al actualizar trabajador: ${err.message}`);
    }
  }

  /* ---------- DELETE (soft) ---------- */
  async remove(id: string): Promise<void> {
    try {
      const trabajador = await prisma.trabajador.findUnique({ where: { id } });
      if (!trabajador) throw new NotFoundException('Trabajador no encontrado');
      await prisma.trabajador.update({ where: { id }, data: { activo: false } });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al eliminar trabajador: ${err.message}`);
    }
  }
}