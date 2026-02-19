import { 
  Injectable, 
  InternalServerErrorException, 
  NotFoundException, 
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateTrabajadorDto, UpdateTrabajadorDto } from './dto/trabajador.dto';
import { PrismaService } from '../prisma/prisma.service';
import { trabajadorInclude, TrabajadorSafe } from './trabajador.types';

@Injectable()
export class TrabajadorService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo trabajador
   */
  async create(dto: CreateTrabajadorDto): Promise<TrabajadorSafe> {
    try {
      // 1. Verificar que el rol exista
      const rol = await this.prisma.rol.findUnique({ 
        where: { id: dto.rolId } 
      });
      
      if (!rol) {
        throw new NotFoundException(`Rol con ID ${dto.rolId} no encontrado`);
      }

      // 2. Verificar que no exista username o email duplicado
      const existente = await this.prisma.trabajador.findFirst({
        where: { 
          OR: [
            { username: dto.username }, 
            { email: dto.email }
          ] 
        },
      });

      if (existente) {
        if (existente.username === dto.username) {
          throw new ConflictException(`El username "${dto.username}" ya está registrado`);
        }
        throw new ConflictException(`El email "${dto.email}" ya está registrado`);
      }

      // 3. Hash de contraseña
      const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

      // 4. Crear el trabajador
      const trabajador = await this.prisma.trabajador.create({
        data: {
          username: dto.username,
          passwordHash,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          email: dto.email,
          telefono: dto.telefono,
          img: dto.img,
          fechaContratacion: dto.fechaContratacion ? new Date(dto.fechaContratacion) : null,
          rolId: dto.rolId,
          activo: dto.activo ?? true,
        },
        include: trabajadorInclude,
      });

      // 5. Eliminar passwordHash antes de retornar
      const { passwordHash: _, ...trabajadorSeguro } = trabajador;
      return trabajadorSeguro as TrabajadorSafe;

    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al crear trabajador: ${err.message}`);
    }
  }

  /**
   * Obtener todos los trabajadores activos
   */
  async findAll(incluirInactivos: boolean = false): Promise<TrabajadorSafe[]> {
    try {
      const trabajadores = await this.prisma.trabajador.findMany({
        where: incluirInactivos ? {} : { activo: true },
        include: trabajadorInclude,
        orderBy: { createdAt: 'desc' },
      });

      // Eliminar passwordHash de todos
      return trabajadores.map(({ passwordHash, ...trabajador }) => trabajador as TrabajadorSafe);

    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener trabajadores: ${err.message}`);
    }
  }

  /**
   * Obtener un trabajador por ID
   */
  async findOne(id: string): Promise<TrabajadorSafe> {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({
        where: { id },
        include: trabajadorInclude,
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      const { passwordHash, ...trabajadorSeguro } = trabajador;
      return trabajadorSeguro as TrabajadorSafe;

    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener trabajador: ${err.message}`);
    }
  }

  /**
   * Buscar trabajador por username (para autenticación)
   */
  async findByUsername(username: string): Promise<any> {
    try {
      const usuario = await this.prisma.trabajador.findFirst({
        where: { username },
        include: { rol: true },
      });

      return usuario; // Incluye passwordHash para validación en auth
    } catch (error) {
      throw new InternalServerErrorException(`Error al obtener usuario: ${error.message}`);
    }
  }

  /**
   * Obtener trabajadores por rol
   */
  async findByRol(rolId: string): Promise<TrabajadorSafe[]> {
    try {
      const trabajadores = await this.prisma.trabajador.findMany({
        where: { 
          rolId,
          activo: true,
        },
        include: trabajadorInclude,
        orderBy: { nombre: 'asc' },
      });

      return trabajadores.map(({ passwordHash, ...trabajador }) => trabajador as TrabajadorSafe);
    } catch (err) {
      throw new InternalServerErrorException(`Error al obtener trabajadores por rol: ${err.message}`);
    }
  }

  /**
   * Obtener clientes asignados a un trabajador
   */
  async getClientesAsignados(trabajadorId: string) {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({
        where: { id: trabajadorId },
        include: {
          clientesAsignados: {
            include: {
              cliente: {
                include: {
                  colegio: true,
                  contactosFamiliares: true,
                },
              },
            },
          },
        },
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${trabajadorId} no encontrado`);
      }

      return trabajador.clientesAsignados.map(ca => ({
        ...ca.cliente,
        tipoTerapia: ca.tipoTerapia,
        fechaAsignacion: ca.createdAt,
      }));

    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener clientes asignados: ${err.message}`);
    }
  }

  /**
   * Asignar un cliente a un trabajador
   */
  async asignarCliente(
    trabajadorId: string, 
    clienteId: string, 
    tipoTerapia?: string
  ) {
    try {
      // Verificar que ambos existan
      const [trabajador, cliente] = await Promise.all([
        this.prisma.trabajador.findUnique({ where: { id: trabajadorId } }),
        this.prisma.cliente.findUnique({ where: { id: clienteId } }),
      ]);

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${trabajadorId} no encontrado`);
      }
      if (!cliente) {
        throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
      }

      // Verificar si ya está asignado
      const asignacionExistente = await this.prisma.clienteTrabajador.findUnique({
        where: {
          clienteId_trabajadorId: {
            clienteId,
            trabajadorId,
          },
        },
      });

      if (asignacionExistente) {
        throw new ConflictException('El cliente ya está asignado a este trabajador');
      }

      // Crear la asignación
      return await this.prisma.clienteTrabajador.create({
        data: {
          clienteId,
          trabajadorId,
          tipoTerapia,
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
        },
      });

    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al asignar cliente: ${err.message}`);
    }
  }

  /**
   * Desasignar un cliente de un trabajador
   */
  async desasignarCliente(trabajadorId: string, clienteId: string) {
    try {
      const asignacion = await this.prisma.clienteTrabajador.findUnique({
        where: {
          clienteId_trabajadorId: {
            clienteId,
            trabajadorId,
          },
        },
      });

      if (!asignacion) {
        throw new NotFoundException('Asignación no encontrada');
      }

      await this.prisma.clienteTrabajador.delete({
        where: {
          clienteId_trabajadorId: {
            clienteId,
            trabajadorId,
          },
        },
      });

      return { 
        message: 'Cliente desasignado correctamente',
        clienteId,
        trabajadorId,
      };

    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al desasignar cliente: ${err.message}`);
    }
  }

  /**
   * Actualizar un trabajador
   */
  async update(id: string, dto: UpdateTrabajadorDto): Promise<TrabajadorSafe> {
    try {
      // 1. Verificar que exista
      const trabajadorActual = await this.prisma.trabajador.findUnique({ 
        where: { id } 
      });

      if (!trabajadorActual) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      // 2. Si cambia rol, verificar que exista
      if (dto.rolId && dto.rolId !== trabajadorActual.rolId) {
        const rol = await this.prisma.rol.findUnique({ 
          where: { id: dto.rolId } 
        });
        if (!rol) {
          throw new NotFoundException(`Rol con ID ${dto.rolId} no encontrado`);
        }
      }

      // 3. Si cambia username o email, verificar que no estén duplicados
      if (dto.username || dto.email) {
        const existente = await this.prisma.trabajador.findFirst({
          where: {
            AND: [
              { id: { not: id } }, // Excluir el trabajador actual
              {
                OR: [
                  ...(dto.username ? [{ username: dto.username }] : []),
                  ...(dto.email ? [{ email: dto.email }] : []),
                ],
              },
            ],
          },
        });

        if (existente) {
          if (existente.username === dto.username) {
            throw new ConflictException(`El username "${dto.username}" ya está registrado`);
          }
          throw new ConflictException(`El email "${dto.email}" ya está registrado`);
        }
      }

      // 4. Si cambia contraseña, hashearla
      let passwordHash: string | undefined;
      if (dto.password) {
        passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
      }

      // 5. Actualizar
      const trabajadorActualizado = await this.prisma.trabajador.update({
        where: { id },
        data: {
          ...(dto.username && { username: dto.username }),
          ...(passwordHash && { passwordHash }),
          ...(dto.nombre && { nombre: dto.nombre }),
          ...(dto.apellidos && { apellidos: dto.apellidos }),
          ...(dto.email && { email: dto.email }),
          ...(dto.telefono !== undefined && { telefono: dto.telefono }),
          ...(dto.img !== undefined && { img: dto.img }),
          ...(dto.fechaContratacion && { 
            fechaContratacion: new Date(dto.fechaContratacion) 
          }),
          ...(dto.rolId && { rolId: dto.rolId }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
        },
        include: trabajadorInclude,
      });

      const { passwordHash: _, ...trabajadorSeguro } = trabajadorActualizado;
      return trabajadorSeguro as TrabajadorSafe;

    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ConflictException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al actualizar trabajador: ${err.message}`);
    }
  }

  /**
   * Eliminar trabajador (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({ 
        where: { id } 
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      // Soft delete
      await this.prisma.trabajador.update({ 
        where: { id }, 
        data: { activo: false } 
      });

      return { 
        message: `Trabajador ${trabajador.nombre} ${trabajador.apellidos} desactivado correctamente` 
      };

    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al eliminar trabajador: ${err.message}`);
    }
  }

  /**
   * Reactivar trabajador
   */
  async reactivar(id: string): Promise<TrabajadorSafe> {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({ 
        where: { id } 
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      const trabajadorReactivado = await this.prisma.trabajador.update({
        where: { id },
        data: { activo: true },
        include: trabajadorInclude,
      });

      const { passwordHash, ...trabajadorSeguro } = trabajadorReactivado;
      return trabajadorSeguro as TrabajadorSafe;

    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al reactivar trabajador: ${err.message}`);
    }
  }

  /**
   * Cambiar contraseña
   */
  async cambiarPassword(id: string, passwordActual: string, passwordNueva: string) {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({
        where: { id },
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      // Verificar contraseña actual
      const passwordValida = await bcrypt.compare(passwordActual, trabajador.passwordHash);
      if (!passwordValida) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }

      // Hashear nueva contraseña
      const nuevoHash = await bcrypt.hash(passwordNueva, this.SALT_ROUNDS);

      // Actualizar
      await this.prisma.trabajador.update({
        where: { id },
        data: { passwordHash: nuevoHash },
      });

      return { message: 'Contraseña actualizada correctamente' };

    } catch (err) {
      if (err instanceof NotFoundException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(`Error al cambiar contraseña: ${err.message}`);
    }
  }
}