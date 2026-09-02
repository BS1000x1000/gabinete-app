import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateTrabajadorDto, UpdateTrabajadorDto, DatosFiscalesDto } from './dto/trabajador.dto';
import { PrismaService } from '../prisma/prisma.service';
import { trabajadorInclude, TrabajadorSafe } from './trabajador.types';
import { TipoSesion } from '@prisma/client';

@Injectable()
export class TrabajadorService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear un nuevo trabajador
   */
  async create(dto: CreateTrabajadorDto): Promise<TrabajadorSafe> {
    try {
      const rol = await this.prisma.rol.findUnique({
        where: { id: dto.rolId },
      });

      if (!rol) {
        throw new NotFoundException(`Rol con ID ${dto.rolId} no encontrado`);
      }

      const existente = await this.prisma.trabajador.findFirst({
        where: {
          OR: [{ username: dto.username }, { email: dto.email }],
        },
      });

      if (existente) {
        if (existente.username === dto.username) {
          throw new ConflictException(
            `El username "${dto.username}" ya está registrado`,
          );
        }
        throw new ConflictException(
          `El email "${dto.email}" ya está registrado`,
        );
      }

      const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

      const trabajador = await this.prisma.trabajador.create({
        data: {
          username: dto.username,
          passwordHash,
          nombre: dto.nombre,
          apellidos: dto.apellidos,
          email: dto.email,
          telefono: dto.telefono,
          img: dto.img,
          numeroColegiado: dto.numeroColegiado,
          colegioProfesional: dto.colegioProfesional,
          numeroPoliza: dto.numeroPoliza,
          direccionProfesional: dto.direccionProfesional,
          especialidad: dto.especialidad,
          fechaContratacion: dto.fechaContratacion
            ? new Date(dto.fechaContratacion)
            : null,
          rolId: dto.rolId,
          activo: dto.activo ?? true,
        },
        include: trabajadorInclude,
      });

      const { passwordHash: _, ...trabajadorSeguro } = trabajador;
      return trabajadorSeguro as TrabajadorSafe;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error al crear trabajador: ${err.message}`,
      );
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

      return trabajadores.map(
        ({ passwordHash, ...trabajador }) => trabajador as TrabajadorSafe,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener trabajadores: ${err.message}`,
      );
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
      throw new InternalServerErrorException(
        `Error al obtener trabajador: ${err.message}`,
      );
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

      return usuario;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener usuario: ${error.message}`,
      );
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

      return trabajadores.map(
        ({ passwordHash, ...trabajador }) => trabajador as TrabajadorSafe,
      );
    } catch (err) {
      throw new InternalServerErrorException(
        `Error al obtener trabajadores por rol: ${err.message}`,
      );
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
            where: { activo: true }, // ✅ Solo asignaciones activas
            include: {
              cliente: {
                include: {
                  colegio: true,
                  contactosFamiliares: true,
                },
              },
              horarios: true, // ✅ Incluir horarios específicos
            },
          },
        },
      });

      if (!trabajador) {
        throw new NotFoundException(
          `Trabajador con ID ${trabajadorId} no encontrado`,
        );
      }

      return trabajador.clientesAsignados.map((ca) => ({
        ...ca.cliente,
        tipoTerapia: ca.tipoTerapia,
        fechaAsignacion: ca.createdAt,
        horarios: ca.horarios,
      }));
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al obtener clientes asignados: ${err.message}`,
      );
    }
  }

  /**
   * Asignar un cliente a un trabajador
   */
  async asignarCliente(
    trabajadorId: string,
    clienteId: string,
    tipoTerapia: TipoSesion, // ✅ Ahora obligatorio (sin ?)
  ) {
    try {
      // ✅ Validar tipoTerapia al principio
      if (!tipoTerapia) {
        throw new BadRequestException('El tipo de terapia es obligatorio');
      }

      // Verificar que ambos existan
      const [trabajador, cliente] = await Promise.all([
        this.prisma.trabajador.findUnique({ where: { id: trabajadorId } }),
        this.prisma.cliente.findUnique({ where: { id: clienteId } }),
      ]);

      if (!trabajador) {
        throw new NotFoundException(
          `Trabajador con ID ${trabajadorId} no encontrado`,
        );
      }
      if (!cliente) {
        throw new NotFoundException(
          `Cliente con ID ${clienteId} no encontrado`,
        );
      }

      // ✅ Verificar si ya está asignado (con findFirst)
      const asignacionExistente = await this.prisma.clienteTrabajador.findFirst(
        {
          where: {
            clienteId,
            trabajadorId,
            tipoTerapia,
          },
        },
      );

      if (asignacionExistente) {
        throw new ConflictException(
          `El cliente ya está asignado a este trabajador para ${tipoTerapia}`,
        );
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
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error al asignar cliente: ${err.message}`,
      );
    }
  }

  /**
   * Desasignar un cliente de un trabajador
   * ✅ CORREGIDO: Ahora acepta tipoTerapia opcional
   */
  async desasignarCliente(
    trabajadorId: string,
    clienteId: string,
    tipoTerapia?: string,
  ) {
    try {
      // ✅ Buscar con findFirst
      const whereCondition: any = {
        clienteId,
        trabajadorId,
      };

      if (tipoTerapia) {
        whereCondition.tipoTerapia = tipoTerapia;
      }

      const asignacion = await this.prisma.clienteTrabajador.findFirst({
        where: whereCondition,
      });

      if (!asignacion) {
        throw new NotFoundException('Asignación no encontrada');
      }

      // Eliminar usando el ID
      await this.prisma.clienteTrabajador.delete({
        where: { id: asignacion.id },
      });

      return {
        message: 'Cliente desasignado correctamente',
        clienteId,
        trabajadorId,
        tipoTerapia: asignacion.tipoTerapia,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al desasignar cliente: ${err.message}`,
      );
    }
  }

  /**
   * Actualizar un trabajador
   */
  async update(id: string, dto: UpdateTrabajadorDto): Promise<TrabajadorSafe> {
    try {
      const trabajadorActual = await this.prisma.trabajador.findUnique({
        where: { id },
      });

      if (!trabajadorActual) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      if (dto.rolId && dto.rolId !== trabajadorActual.rolId) {
        const rol = await this.prisma.rol.findUnique({
          where: { id: dto.rolId },
        });
        if (!rol) {
          throw new NotFoundException(`Rol con ID ${dto.rolId} no encontrado`);
        }
      }

      if (dto.username || dto.email) {
        const existente = await this.prisma.trabajador.findFirst({
          where: {
            AND: [
              { id: { not: id } },
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
            throw new ConflictException(
              `El username "${dto.username}" ya está registrado`,
            );
          }
          throw new ConflictException(
            `El email "${dto.email}" ya está registrado`,
          );
        }
      }

      let passwordHash: string | undefined;
      if (dto.password) {
        passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);
      }

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
          ...(dto.numeroColegiado !== undefined && { numeroColegiado: dto.numeroColegiado }),
          ...(dto.colegioProfesional !== undefined && { colegioProfesional: dto.colegioProfesional }),
          ...(dto.numeroPoliza !== undefined && { numeroPoliza: dto.numeroPoliza }),
          ...(dto.direccionProfesional !== undefined && { direccionProfesional: dto.direccionProfesional }),
          ...(dto.especialidad !== undefined && { especialidad: dto.especialidad }),
          ...(dto.fechaContratacion && {
            fechaContratacion: new Date(dto.fechaContratacion),
          }),
          ...(dto.rolId && { rolId: dto.rolId }),
          ...(dto.activo !== undefined && { activo: dto.activo }),
          ...(dto.urlVideollamada !== undefined && { urlVideollamada: dto.urlVideollamada || null }),
        },
        include: trabajadorInclude,
      });

      const { passwordHash: _, ...trabajadorSeguro } = trabajadorActualizado;
      return trabajadorSeguro as TrabajadorSafe;
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ConflictException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error al actualizar trabajador: ${err.message}`,
      );
    }
  }

  /**
   * Eliminar trabajador (soft delete)
   */
  async remove(id: string): Promise<{ message: string }> {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({
        where: { id },
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      await this.prisma.trabajador.update({
        where: { id },
        data: { activo: false },
      });

      return {
        message: `Trabajador ${trabajador.nombre} ${trabajador.apellidos} desactivado correctamente`,
      };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(
        `Error al eliminar trabajador: ${err.message}`,
      );
    }
  }

  /**
   * Reactivar trabajador
   */
  async reactivar(id: string): Promise<TrabajadorSafe> {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({
        where: { id },
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
      throw new InternalServerErrorException(
        `Error al reactivar trabajador: ${err.message}`,
      );
    }
  }

  /**
   * Cambiar contraseña
   */
  async cambiarPassword(
    id: string,
    passwordActual: string,
    passwordNueva: string,
  ) {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({
        where: { id },
      });

      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      const passwordValida = await bcrypt.compare(
        passwordActual,
        trabajador.passwordHash,
      );
      if (!passwordValida) {
        throw new BadRequestException('La contraseña actual es incorrecta');
      }

      const nuevoHash = await bcrypt.hash(passwordNueva, this.SALT_ROUNDS);

      await this.prisma.trabajador.update({
        where: { id },
        data: { passwordHash: nuevoHash },
      });

      return { message: 'Contraseña actualizada correctamente' };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }
      throw new InternalServerErrorException(
        `Error al cambiar contraseña: ${err.message}`,
      );
    }
  }

  /**
   * Establecer contraseña sin validar la actual (solo ADMIN)
   */
  async setPasswordAdmin(id: string, passwordNueva: string): Promise<{ message: string }> {
    try {
      const trabajador = await this.prisma.trabajador.findUnique({ where: { id } });
      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }
      const hash = await bcrypt.hash(passwordNueva, this.SALT_ROUNDS);
      await this.prisma.trabajador.update({ where: { id }, data: { passwordHash: hash } });
      return { message: 'Contraseña actualizada correctamente' };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al actualizar contraseña: ${err.message}`);
    }
  }

  /**
   * Buscar trabajador por email
   */
  async findByEmail(email: string): Promise<any> {
    try {
      return await this.prisma.trabajador.findUnique({
        where: { email },
        include: { rol: true },
      });
    } catch (error) {
      throw new InternalServerErrorException(`Error al buscar por email: ${error.message}`);
    }
  }

  /**
   * Guardar token de reset de contrasena
   */
  async guardarResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.prisma.trabajador.update({
      where: { id },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });
  }

  /**
   * Buscar trabajador por reset token valido (no expirado)
   */
  async findByResetToken(token: string): Promise<any> {
    return await this.prisma.trabajador.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    });
  }

  async updateDatosFiscales(id: string, dto: DatosFiscalesDto): Promise<TrabajadorSafe> {
    const trabajador = await this.prisma.trabajador.findUnique({ where: { id } });
    if (!trabajador) throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);

    return this.prisma.trabajador.update({
      where: { id },
      data: {
        ...(dto.nifFiscal !== undefined && { nifFiscal: dto.nifFiscal }),
        ...(dto.nombreFiscal !== undefined && { nombreFiscal: dto.nombreFiscal }),
        ...(dto.direccionFiscal !== undefined && { direccionFiscal: dto.direccionFiscal }),
        ...(dto.codigoPostalFiscal !== undefined && { codigoPostalFiscal: dto.codigoPostalFiscal }),
        ...(dto.ciudadFiscal !== undefined && { ciudadFiscal: dto.ciudadFiscal }),
        ...(dto.provinciaFiscal !== undefined && { provinciaFiscal: dto.provinciaFiscal }),
        ...(dto.iban !== undefined && { iban: dto.iban }),
        ...(dto.swift !== undefined && { swift: dto.swift }),
        ...(dto.retencionIrpf !== undefined && { retencionIrpf: dto.retencionIrpf }),
        ...(dto.emailFacturacion !== undefined && { emailFacturacion: dto.emailFacturacion }),
        ...(dto.nombreGestoria !== undefined && { nombreGestoria: dto.nombreGestoria }),
        ...(dto.emailGestoria !== undefined && { emailGestoria: dto.emailGestoria }),
        ...(dto.periodicidadGestoria !== undefined && {
          periodicidadGestoria: dto.periodicidadGestoria,
        }),
      },
      include: trabajadorInclude,
    }) as unknown as TrabajadorSafe;
  }

  /**
   * Aplicar nueva contrasena y limpiar el token de reset
   */
  async resetPasswordConToken(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
    await this.prisma.trabajador.update({
      where: { id },
      data: {
        passwordHash: hash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });
  }
}
