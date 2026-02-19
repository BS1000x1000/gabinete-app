import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto, UpdateRolDto } from './dto/rol.dto';
import { rolInclude, RolWithRelations } from './roles.types';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo rol
   */
  async create(dto: CreateRolDto): Promise<RolWithRelations> {
    try {
      // Verificar que no exista un rol con el mismo nombre o código
      const existente = await this.prisma.rol.findFirst({
        where: {
          OR: [
            { nombreRol: dto.nombreRol },
            { codigo: dto.codigo.toUpperCase() },
          ],
        },
      });

      if (existente) {
        if (existente.nombreRol === dto.nombreRol) {
          throw new ConflictException(`El rol "${dto.nombreRol}" ya existe`);
        }
        throw new ConflictException(`El código "${dto.codigo}" ya está en uso`);
      }

      // Crear el rol
      return await this.prisma.rol.create({
        data: {
          nombreRol: dto.nombreRol,
          codigo: dto.codigo.toUpperCase(),
          descripcion: dto.descripcion,
        },
        include: rolInclude,
      });
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      throw new InternalServerErrorException(`Error al crear rol: ${err.message}`);
    }
  }

  /**
   * Obtener todos los roles
   */
  async findAll(): Promise<RolWithRelations[]> {
    try {
      return await this.prisma.rol.findMany({
        include: rolInclude,
        orderBy: { nombreRol: 'asc' },
      });
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener roles: ${err.message}`);
    }
  }

  /**
   * Obtener un rol por ID
   */
  async findOne(id: string): Promise<RolWithRelations> {
    try {
      const rol = await this.prisma.rol.findUnique({
        where: { id },
        include: rolInclude,
      });

      if (!rol) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      return rol;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener rol: ${err.message}`);
    }
  }

  /**
   * Obtener un rol por código
   */
  async findByCodigo(codigo: string): Promise<RolWithRelations> {
    try {
      const rol = await this.prisma.rol.findUnique({
        where: { codigo: codigo.toUpperCase() },
        include: rolInclude,
      });

      if (!rol) {
        throw new NotFoundException(`Rol con código "${codigo}" no encontrado`);
      }

      return rol;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener rol: ${err.message}`);
    }
  }

  /**
   * Actualizar un rol
   */
  async update(id: string, dto: UpdateRolDto): Promise<RolWithRelations> {
    try {
      // Verificar que el rol existe
      const rolActual = await this.prisma.rol.findUnique({
        where: { id },
      });

      if (!rolActual) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      // Si se cambia el nombre o código, verificar que no estén duplicados
      if (dto.nombreRol || dto.codigo) {
        const existente = await this.prisma.rol.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(dto.nombreRol ? [{ nombreRol: dto.nombreRol }] : []),
                  ...(dto.codigo ? [{ codigo: dto.codigo.toUpperCase() }] : []),
                ],
              },
            ],
          },
        });

        if (existente) {
          if (existente.nombreRol === dto.nombreRol) {
            throw new ConflictException(`El rol "${dto.nombreRol}" ya existe`);
          }
          throw new ConflictException(`El código "${dto.codigo}" ya está en uso`);
        }
      }

      // Actualizar
      return await this.prisma.rol.update({
        where: { id },
        data: {
          ...(dto.nombreRol && { nombreRol: dto.nombreRol }),
          ...(dto.codigo && { codigo: dto.codigo.toUpperCase() }),
          ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        },
        include: rolInclude,
      });
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al actualizar rol: ${err.message}`);
    }
  }

  /**
   * Eliminar un rol
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const rol = await this.prisma.rol.findUnique({
        where: { id },
        include: {
          trabajadores: true,
        },
      });

      if (!rol) {
        throw new NotFoundException(`Rol con ID ${id} no encontrado`);
      }

      // Verificar si hay trabajadores asignados
      if (rol.trabajadores.length > 0) {
        throw new BadRequestException(
          `No se puede eliminar el rol "${rol.nombreRol}" porque tiene ${rol.trabajadores.length} trabajador(es) asignado(s)`,
        );
      }

      await this.prisma.rol.delete({
        where: { id },
      });

      return {
        message: `Rol "${rol.nombreRol}" eliminado correctamente`,
      };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al eliminar rol: ${err.message}`);
    }
  }

  /**
   * Obtener estadísticas de roles
   */
  async getEstadisticas() {
    try {
      const roles = await this.prisma.rol.findMany({
        include: {
          _count: {
            select: {
              trabajadores: true,
            },
          },
        },
      });

      return roles.map(rol => ({
        id: rol.id,
        nombreRol: rol.nombreRol,
        codigo: rol.codigo,
        descripcion: rol.descripcion,
        cantidadTrabajadores: rol._count.trabajadores,
      }));
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener estadísticas: ${err.message}`);
    }
  }

  /**
   * Crear roles por defecto (útil para setup inicial)
   */
  async seedRolesDefault() {
    try {
      const rolesDefault = [
        {
          nombreRol: 'Administrador',
          codigo: 'ADMIN',
          descripcion: 'Acceso completo al sistema',
        },
        {
          nombreRol: 'Pedagogo',
          codigo: 'PEDAGOGO',
          descripcion: 'Especialista en pedagogía terapéutica',
        },
        {
          nombreRol: 'Neuropsicólogo',
          codigo: 'NEURO',
          descripcion: 'Especialista en neuropsicología',
        },
        {
          nombreRol: 'Logopeda',
          codigo: 'LOGOPEDA',
          descripcion: 'Especialista en logopedia',
        },
        {
          nombreRol: 'Recepcionista',
          codigo: 'RECEP',
          descripcion: 'Personal de recepción y administración',
        },
      ];

      const rolesCreados: any = [];
      const rolesExistentes: any = [];

      for (const rolData of rolesDefault) {
        const existe = await this.prisma.rol.findUnique({
          where: { codigo: rolData.codigo },
        });

        if (existe) {
          rolesExistentes.push(existe.nombreRol);
        } else {
          const nuevoRol = await this.prisma.rol.create({
            data: rolData,
          });
          rolesCreados.push(nuevoRol.nombreRol);
        }
      }

      return {
        message: 'Roles por defecto procesados',
        rolesCreados,
        rolesExistentes,
        totalCreados: rolesCreados.length,
        totalExistentes: rolesExistentes.length,
      };
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al crear roles por defecto: ${err.message}`,
      );
    }
  }
}