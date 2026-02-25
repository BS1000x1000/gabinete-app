import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClienteWithRelations, clienteInclude } from './clientes.types';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createClienteDto: CreateClienteDto,
  ): Promise<ClienteWithRelations> {
    // Verificar DNI duplicado
    const dniExiste = await this.existeDni(createClienteDto.dni);

    if (dniExiste) {
      throw new ConflictException(
        `Ya existe un cliente registrado con el DNI ${createClienteDto.dni}`,
      );
    }

    let colegioId = createClienteDto.colegio?.id;

    // Buscar o crear colegio
    if (createClienteDto.colegio && !createClienteDto.colegio?.id) {
      const colegioExistente = await this.prisma.colegio.findUnique({
        where: { nombre: createClienteDto.colegio.nombre },
      });

      if (colegioExistente) {
        colegioId = colegioExistente.id;
        console.log(`✅ Usando colegio existente: ${colegioExistente.nombre}`);
      } else {
        const nuevoColegio = await this.prisma.colegio.create({
          data: {
            nombre: createClienteDto.colegio.nombre,
            direccionColegio: createClienteDto.colegio.direccionColegio,
            ctoColegioUno: createClienteDto.colegio.ctoColegioUno,
            ctoTelefonoUno: createClienteDto.colegio.ctoTelefonoUno,
            ctoEmailColegioUno: createClienteDto.colegio.ctoEmailColegioUno,
            ctoRelacionColegioUno:
              createClienteDto.colegio.ctoRelacionColegioUno,
            ctoColegioDos: createClienteDto.colegio.ctoColegioDos,
            ctoTelefonoDos: createClienteDto.colegio.ctoTelefonoDos,
            ctoEmailColegioDos: createClienteDto.colegio.ctoEmailColegioDos,
            ctoRelacionColegioDos:
              createClienteDto.colegio.ctoRelacionColegioDos,
          },
        });
        colegioId = nuevoColegio.id;
        console.log(`✅ Colegio creado: ${nuevoColegio.nombre}`);
      }
    }

    // Convertir fechas a ISO
    const fechaNacimientoISO = new Date(
      createClienteDto.fechaNacimiento!,
    ).toISOString();
    const fechaInicioISO = new Date(
      createClienteDto.fechaInicio!,
    ).toISOString();

    // ✅ CREAR CLIENTE
    const cliente = await this.prisma.cliente.create({
      data: {
        nombre: createClienteDto.nombre,
        apellidos: createClienteDto.apellidos,
        dni: createClienteDto.dni,
        domicilio: createClienteDto.domicilio,
        provincia: createClienteDto.provincia,
        ciudad: createClienteDto.ciudad,
        curso: createClienteDto.curso,
        fechaNacimiento: fechaNacimientoISO,
        fechaInicio: fechaInicioISO,
        colegioId: colegioId,
        idCarpetaDrive: createClienteDto.idCarpetaDrive,

        // Familiares
        contactosFamiliares: createClienteDto.familiares
          ? {
              create: createClienteDto.familiares.map((f) => ({
                nombre: f.nombre,
                apellidos: f.apellidos,
                dni: f.dni || '',
                parentesco: f.parentesco,
                telefono: f.telefono,
                email: f.email || '',
                esResponsablePago: f.esResponsablePago ?? false,
                esContactoPrincipal: f.esContactoPrincipal ?? false,
                whatsapp: f.whatsapp ?? false,
              })),
            }
          : undefined,

        // ✅ Disponibilidad GENERAL del cliente
        disponibilidad: createClienteDto.disponibilidad
          ? {
              create: createClienteDto.disponibilidad.map((d) => ({
                diaSemana: d.diaSemana,
                horaInicio: d.horaInicio,
                horaFin: d.horaFin,
              })),
            }
          : undefined,

        // Datos sanitarios
        sanitario: createClienteDto.datosSanitarios
          ? {
              create: {
                diagnostico: createClienteDto.datosSanitarios.diagnostico || '',
                centroSalud: createClienteDto.datosSanitarios.centroSalud || '',
                tratamientos:
                  createClienteDto.datosSanitarios.tratamientos || '',
                medicacion: createClienteDto.datosSanitarios.medicacion || '',
                alergias: createClienteDto.datosSanitarios.alergias || '',
                adaptaciones:
                  createClienteDto.datosSanitarios.adaptaciones ?? false,
                tipoAdaptaciones:
                  createClienteDto.datosSanitarios.tipoAdaptaciones || null,
                especialistas:
                  createClienteDto.datosSanitarios.especialistas ?? [],
                apoyos: createClienteDto.datosSanitarios.apoyos ?? false,
              },
            }
          : undefined,

        // Objetivos generales
        objetivosGeneralesAsignados: createClienteDto.objetivosGeneralesIds
          ? {
              create: createClienteDto.objetivosGeneralesIds.map((objId) => ({
                objetivoGeneralId: objId,
              })),
            }
          : undefined,
      },
      include: clienteInclude,
    });

    console.log(`✅ Cliente creado: ${cliente.nombre} ${cliente.apellidos}`);

    // ✅ NUEVO: Si viene asignación, crear relación con trabajador y horarios específicos
    if (
      createClienteDto.asignaciones &&
      createClienteDto.asignaciones.length > 0
    ) {
      for (const asignacion of createClienteDto.asignaciones) {
        await this.prisma.clienteTrabajador.create({
          data: {
            clienteId: cliente.id,
            trabajadorId: asignacion.trabajadorId,
            tipoTerapia: asignacion.tipoTerapia,
            horarios: {
              create: asignacion.horarios.map((h) => ({
                diaSemana: h.diaSemana,
                horaInicio: h.horaInicio,
                horaFin: h.horaFin,
              })),
            },
          },
        });

        console.log(
          `✅ Asignación creada: ${asignacion.tipoTerapia} con trabajador ${asignacion.trabajadorId}`,
        );
      }
    }
    // Retornar cliente con todas las relaciones
    const clienteCreado = await this.prisma.cliente.findUnique({
      where: { id: cliente.id },
      include: clienteInclude,
    });

    if (!clienteCreado) {
      throw new Error('Error al recuperar el cliente recién creado');
    }

    // Retornar cliente con todas las relaciones
    return clienteCreado;
  }

  async findAll(): Promise<ClienteWithRelations[]> {
    return await this.prisma.cliente.findMany({
      include: clienteInclude,
    });
  }

  async findAllPaginated(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.cliente.findMany({
        skip,
        take: limit,
        include: clienteInclude,
      }),
      this.prisma.cliente.count(),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<ClienteWithRelations | null> {
    return await this.prisma.cliente.findUnique({
      where: { id },
      include: clienteInclude,
    });
  }

  async getObjetivosGenerales(clienteId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        objetivosGeneralesAsignados: {
          where: { activo: true },
          include: {
            objetivoGeneral: {
              include: {
                areaDesarrollo: true,
              },
            },
          },
          orderBy: {
            objetivoGeneral: {
              areaDesarrollo: {
                orden: 'asc',
              },
            },
          },
        },
      },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // Obtener estadísticas de uso
    const objetivosConEstadisticas = await Promise.all(
      cliente.objetivosGeneralesAsignados.map(async (asignacion) => {
        const estadisticas = await this.prisma.registroDiarioObjetivo.findMany({
          where: {
            objetivoGeneralId: asignacion.objetivoGeneralId,
            registroDiario: {
              clienteId: clienteId,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        });

        const vecesTrabajado = await this.prisma.registroDiarioObjetivo.count({
          where: {
            objetivoGeneralId: asignacion.objetivoGeneralId,
            registroDiario: {
              clienteId: clienteId,
            },
          },
        });

        return {
          id: asignacion.objetivoGeneral.id,
          objetivoGeneralId: asignacion.objetivoGeneralId,
          area: asignacion.objetivoGeneral.areaDesarrollo.nombre,
          titulo: asignacion.objetivoGeneral.titulo,
          descripcion: asignacion.objetivoGeneral.descripcion,
          color: asignacion.objetivoGeneral.areaDesarrollo.color,
          fechaAsignacion: asignacion.fechaAsignacion,
          vecesTrabajado,
          ultimaVez: estadisticas[0]?.createdAt || null,
        };
      }),
    );

    return {
      cliente: `${cliente.nombre} ${cliente.apellidos}`,
      objetivos: objetivosConEstadisticas,
    };
  }

  /**
   * Asignar objetivos generales a un cliente
   */
  async asignarObjetivosGenerales(clienteId: string, objetivosIds: string[]) {
    // 1. Validar cliente
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // 2. Validar que los objetivos existen
    const objetivos = await this.prisma.objetivoGeneral.findMany({
      where: { id: { in: objetivosIds } },
    });

    if (objetivos.length !== objetivosIds.length) {
      throw new NotFoundException('Uno o más objetivos no encontrados');
    }

    // 3. ✅ Obtener todos los existentes de UNA SOLA VEZ (activos e inactivos)
    const existentes = await this.prisma.clienteObjetivo.findMany({
      where: {
        clienteId,
        objetivoGeneralId: { in: objetivosIds },
      },
    });

    // Crear un mapa para búsqueda rápida
    const existentesMap = new Map(
      existentes.map((obj) => [obj.objetivoGeneralId, obj]),
    );

    let nuevosAsignados = 0;
    let reactivados = 0;

    // 4. ✅ Usar transaction para atomicidad
    await this.prisma.$transaction(async (tx) => {
      for (const objetivoId of objetivosIds) {
        const existente = existentesMap.get(objetivoId);

        if (existente) {
          // Si existe pero está inactivo, reactivar
          if (!existente.activo) {
            await tx.clienteObjetivo.update({
              where: { id: existente.id },
              data: { activo: true }, // ✅ updatedAt se actualiza automáticamente
            });
            reactivados++;
          }
        } else {
          // Si no existe, crear nuevo
          await tx.clienteObjetivo.create({
            data: {
              clienteId,
              objetivoGeneralId: objetivoId,
              activo: true,
            },
          });
          nuevosAsignados++;
        }
      }
    });

    const total = nuevosAsignados + reactivados;

    return {
      message: `Se procesaron ${total} objetivos correctamente`,
      clienteId,
      nuevosAsignados,
      reactivados,
      total,
    };
  }
  /**
   * Desasignar un objetivo general de un cliente
   */
  async desasignarObjetivoGeneral(
    clienteId: string,
    objetivoGeneralId: string,
  ) {
    const asignacion = await this.prisma.clienteObjetivo.findFirst({
      where: {
        clienteId,
        objetivoGeneralId,
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    // Soft delete
    await this.prisma.clienteObjetivo.update({
      where: { id: asignacion.id },
      data: { activo: false },
    });

    return {
      message: 'Objetivo desasignado correctamente',
      clienteId,
      objetivoGeneralId,
    };
  }

  /**
   * Asignar un trabajador adicional a un cliente existente
   */
  async asignarTrabajador(
    clienteId: string,
    trabajadorId: string,
    tipoTerapia: string,
    horarios: { diaSemana: number; horaInicio: string; horaFin: string }[],
  ) {
    // ✅ MOVER ESTA VALIDACIÓN AL PRINCIPIO
    if (!tipoTerapia) {
      throw new BadRequestException('El tipo de terapia es obligatorio');
    }

    // Verificar que el cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    // Verificar que el trabajador existe
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id: trabajadorId },
    });

    if (!trabajador) {
      throw new NotFoundException(
        `Trabajador con ID ${trabajadorId} no encontrado`,
      );
    }

    // Verificar si ya existe esta asignación
    const asignacionExistente = await this.prisma.clienteTrabajador.findFirst({
      where: {
        clienteId,
        trabajadorId,
        tipoTerapia,
      },
    });

    if (asignacionExistente) {
      throw new ConflictException(
        `El cliente ya tiene asignado este trabajador para ${tipoTerapia}`,
      );
    }

    // Crear la nueva asignación
    const asignacion = await this.prisma.clienteTrabajador.create({
      data: {
        clienteId,
        trabajadorId,
        tipoTerapia,
        horarios: {
          create: horarios.map((h) => ({
            diaSemana: h.diaSemana,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
          })),
        },
      },
      include: {
        trabajador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            email: true,
          },
        },
        horarios: true,
      },
    });

    console.log(
      `✅ Cliente ${clienteId} asignado a trabajador ${trabajadorId} para ${tipoTerapia}`,
    );

    return {
      message: 'Trabajador asignado correctamente',
      asignacion,
    };
  }

  /**
   * Eliminar una asignación cliente-trabajador por su ID
   * Elimina también en cascada los horarios (DisponibilidadClienteTrabajador)
   */
  async desasignarTrabajador(clienteId: string, asignacionId: string) {
    const asignacion = await this.prisma.clienteTrabajador.findFirst({
      where: { id: asignacionId, clienteId },
      include: { trabajador: true },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación con ID ${asignacionId} no encontrada para este cliente`,
      );
    }

    // Cascade borra los horarios automáticamente (onDelete: Cascade en schema)
    await this.prisma.clienteTrabajador.delete({
      where: { id: asignacionId },
    });

    return {
      message: `Asignación de ${asignacion.trabajador.nombre} ${asignacion.trabajador.apellidos} eliminada correctamente`,
      asignacionId,
      clienteId,
    };
  }

  async actualizarHorariosAsignacion(
    clienteId: string,
    asignacionId: string,
    horarios: { diaSemana: number; horaInicio: string; horaFin: string }[],
    confirmarActualizacionSesiones: boolean = false,
  ) {
    const asignacion = await this.prisma.clienteTrabajador.findFirst({
      where: { id: asignacionId, clienteId },
      include: {
        trabajador: true,
        horarios: true, // horarios actuales (antes de cambiar)
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación con ID ${asignacionId} no encontrada para este cliente`,
      );
    }

    if (horarios.length === 0) {
      throw new BadRequestException('Debes proporcionar al menos un horario');
    }

    const ahora = new Date();

    // 1. Buscar sesiones futuras de esta asignación cliente-trabajador
    const sesionesFuturas = await this.prisma.sesion.findMany({
      where: {
        clienteId,
        trabajadorId: asignacion.trabajadorId,
        fechaHoraInicio: { gt: ahora },
      },
      select: {
        id: true,
        fechaHoraInicio: true,
        fechaHoraFin: true,
        tipoSesion: true,
      },
    });

    // 2. Si hay sesiones futuras y el usuario NO ha confirmado → devolver aviso
    if (sesionesFuturas.length > 0 && !confirmarActualizacionSesiones) {
      return {
        requiereConfirmacion: true,
        ssesionesFuturas: sesionesFuturas.length,
        mensaje: `Hay ${sesionesFuturas.length} sesiones futuras programadas para este terapeuta. ¿Quieres eliminarlas y regenerarlas con el nuevo horario?`,
      };
    }

    // 3. Ejecutar todo en una transacción
    await this.prisma.$transaction(async (tx) => {
      // 3a. Reemplazar horarios
      await tx.disponibilidadClienteTrabajador.deleteMany({
        where: { clienteTrabajadorId: asignacionId },
      });
      await tx.disponibilidadClienteTrabajador.createMany({
        data: horarios.map((h) => ({
          clienteTrabajadorId: asignacionId,
          diaSemana: h.diaSemana,
          horaInicio: h.horaInicio,
          horaFin: h.horaFin,
        })),
      });

      // 3b. Si hay sesiones futuras y el usuario confirmó → eliminar y regenerar
      if (sesionesFuturas.length > 0 && confirmarActualizacionSesiones) {
        // Borrar las sesiones futuras existentes
        await tx.sesion.deleteMany({
          where: {
            clienteId,
            trabajadorId: asignacion.trabajadorId,
            fechaHoraInicio: { gt: ahora },
          },
        });

        // Regenerar con el nuevo horario
        // Rango: desde mañana hasta la fecha máxima de las sesiones eliminadas
        const fechasExistentes = sesionesFuturas.map((s) => s.fechaHoraInicio);
        const fechaMaxima = new Date(
          Math.max(...fechasExistentes.map((f) => f.getTime())),
        );

        const sesionesNuevas: any[] = [];
        const cursor = new Date(ahora);
        cursor.setDate(cursor.getDate() + 1); // Empezar desde mañana
        cursor.setHours(0, 0, 0, 0);

        // Tomar el tipoSesion de la primera sesión eliminada
        const tipoSesion = sesionesFuturas[0]?.tipoSesion ?? 'PEDAGOGIA';

        while (cursor <= fechaMaxima) {
          const diaSemana = cursor.getDay();
          const horarioDelDia = horarios.find((h) => h.diaSemana === diaSemana);

          if (horarioDelDia) {
            const [hInicio, mInicio] = horarioDelDia.horaInicio
              .split(':')
              .map(Number);
            const [hFin, mFin] = horarioDelDia.horaFin.split(':').map(Number);

            const inicio = new Date(cursor);
            inicio.setHours(hInicio, mInicio, 0, 0);

            const fin = new Date(cursor);
            fin.setHours(hFin, mFin, 0, 0);

            sesionesNuevas.push({
              fechaHoraInicio: inicio,
              fechaHoraFin: fin,
              estado: 'PROGRAMADA',
              tipoSesion,
              clienteId,
              trabajadorId: asignacion.trabajadorId,
            });
          }

          cursor.setDate(cursor.getDate() + 1);
        }

        if (sesionesNuevas.length > 0) {
          await tx.sesion.createMany({ data: sesionesNuevas });
        }
      }
    });

    const sesionesMigradas =
      confirmarActualizacionSesiones && sesionesFuturas.length > 0
        ? `Se eliminaron ${sesionesFuturas.length} sesiones antiguas y se regeneraron con el nuevo horario.`
        : '';

    return {
      requiereConfirmacion: false,
      message:
        `Horarios actualizados correctamente. ${sesionesMigradas}`.trim(),
      asignacionId,
      horariosActualizados: horarios.length,
      sesionesMigradas: confirmarActualizacionSesiones
        ? sesionesFuturas.length
        : 0,
    };
  }

  /**
   * Estadísticas de objetivos del cliente
   */
  async getEstadisticasObjetivos(clienteId: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);
    }

    const totalSesiones = await this.prisma.registroDiario.count({
      where: { clienteId },
    });

    const objetivosMasTrabajados =
      await this.prisma.registroDiarioObjetivo.groupBy({
        by: ['objetivoGeneralId'],
        where: {
          registroDiario: {
            clienteId,
          },
        },
        _count: {
          objetivoGeneralId: true,
        },
        orderBy: {
          _count: {
            objetivoGeneralId: 'desc',
          },
        },
        take: 10,
      });

    const objetivosConDetalles = await Promise.all(
      objetivosMasTrabajados.map(async (obj) => {
        const objetivo = await this.prisma.objetivoGeneral.findUnique({
          where: { id: obj.objetivoGeneralId },
          include: {
            areaDesarrollo: true,
          },
        });

        return {
          titulo: objetivo?.titulo,
          area: objetivo?.areaDesarrollo.nombre,
          veces: obj._count.objetivoGeneralId,
        };
      }),
    );

    const totalObjetivosAsignados = await this.prisma.clienteObjetivo.count({
      where: {
        clienteId,
        activo: true,
      },
    });

    return {
      cliente: `${cliente.nombre} ${cliente.apellidos}`,
      totalObjetivosAsignados,
      totalSesiones,
      objetivosMasTrabajados: objetivosConDetalles,
    };
  }

  async update(
    id: string,
    updateDto: Partial<CreateClienteDto> & {
      autorizaDatosPersonales?: boolean;
      autorizaDatosImagen?: boolean;
      email?: string;
      movil?: string;
      fechaAlta?: string;
    },
  ): Promise<ClienteWithRelations> {
    const updateData: any = {};

    if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre;
    if (updateDto.apellidos !== undefined)
      updateData.apellidos = updateDto.apellidos;
    if (updateDto.dni !== undefined) updateData.dni = updateDto.dni;
    if (updateDto.domicilio !== undefined)
      updateData.domicilio = updateDto.domicilio;
    if (updateDto.provincia !== undefined)
      updateData.provincia = updateDto.provincia;
    if (updateDto.ciudad !== undefined) updateData.ciudad = updateDto.ciudad;
    if (updateDto.curso !== undefined) updateData.curso = updateDto.curso;
    if (updateDto.email !== undefined) updateData.email = updateDto.email;
    if (updateDto.movil !== undefined) updateData.movil = updateDto.movil;
    if (updateDto.fechaNacimiento !== undefined)
      updateData.fechaNacimiento = new Date(updateDto.fechaNacimiento);
    if (updateDto.fechaInicio !== undefined)
      updateData.fechaInicio = new Date(updateDto.fechaInicio);
    if (updateDto.fechaAlta !== undefined)
      updateData.fechaAlta = new Date(updateDto.fechaAlta);
    if (updateDto.autorizaDatosPersonales !== undefined)
      updateData.autorizaDatosPersonales = updateDto.autorizaDatosPersonales;
    if (updateDto.autorizaDatosImagen !== undefined)
      updateData.autorizaDatosImagen = updateDto.autorizaDatosImagen;
    if (updateDto.colegio?.id !== undefined)
      updateData.colegioId = updateDto.colegio.id;

    return await this.prisma.cliente.update({
      where: { id },
      data: updateData,
      include: clienteInclude,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.cliente.delete({
      where: { id },
    });
  }

  async search(query: string) {
    return await this.prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { apellidos: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query } },
        ],
        activo: true,
      },
      take: 10,
    });
  }

  async existeDni(dni: string): Promise<boolean> {
    const cliente = await this.prisma.cliente.findUnique({
      where: { dni },
      select: { id: true },
    });

    return !!cliente;
  }

  // ── FAMILIARES ────────────────────────────────────────────
  async crearFamiliar(clienteId: string, data: any) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);

    return this.prisma.familiar.create({
      data: {
        clienteId,
        nombre:             data.nombre,
        apellidos:          data.apellidos,
        parentesco:         data.parentesco,
        telefono:           data.telefono,
        email:              data.email ?? '',
        dni:                data.dni ?? '',
        esContactoPrincipal:data.esContactoPrincipal ?? false,
        esResponsablePago:  data.esResponsablePago ?? false,
        whatsapp:           data.whatsapp ?? true,
      },
    });
  }

  async updateFamiliar(clienteId: string, familiarId: string, data: any) {
    const familiar = await this.prisma.familiar.findFirst({
      where: { id: familiarId, clienteId },
    });
    if (!familiar) throw new NotFoundException(`Familiar ${familiarId} no encontrado`);

    return this.prisma.familiar.update({
      where: { id: familiarId },
      data: {
        ...(data.nombre             !== undefined && { nombre: data.nombre }),
        ...(data.apellidos          !== undefined && { apellidos: data.apellidos }),
        ...(data.parentesco         !== undefined && { parentesco: data.parentesco }),
        ...(data.telefono           !== undefined && { telefono: data.telefono }),
        ...(data.esContactoPrincipal!== undefined && { esContactoPrincipal: data.esContactoPrincipal }),
        ...(data.esResponsablePago  !== undefined && { esResponsablePago: data.esResponsablePago }),
        ...(data.whatsapp           !== undefined && { whatsapp: data.whatsapp }),
      },
    });
  }

  async eliminarFamiliar(clienteId: string, familiarId: string) {
    const familiar = await this.prisma.familiar.findFirst({
      where: { id: familiarId, clienteId },
    });
    if (!familiar) throw new NotFoundException(`Familiar ${familiarId} no encontrado`);

    await this.prisma.familiar.delete({ where: { id: familiarId } });
    return { message: 'Contacto eliminado correctamente', familiarId };
  }

  // ── SANITARIO ─────────────────────────────────────────────
  async updateSanitario(clienteId: string, data: any) {
    const sanitario = await this.prisma.sanitario.findUnique({ where: { clienteId } });

    if (!sanitario) {
      // Crear si no existe
      return this.prisma.sanitario.create({
        data: {
          clienteId,
          diagnostico:     data.diagnostico  ?? '',
          centroSalud:     data.centroSalud  ?? '',
          tratamientos:    data.tratamientos ?? '',
          medicacion:      data.medicacion   ?? '',
          alergias:        data.alergias     ?? '',
          adaptaciones:    data.adaptaciones ?? false,
          tipoAdaptaciones:data.tipoAdaptaciones ?? null,
          especialistas:   data.especialistas ?? [],
          apoyos:          data.apoyos       ?? false,
        },
      });
    }

    return this.prisma.sanitario.update({
      where: { clienteId },
      data: {
        ...(data.diagnostico      !== undefined && { diagnostico: data.diagnostico }),
        ...(data.centroSalud      !== undefined && { centroSalud: data.centroSalud }),
        ...(data.tratamientos     !== undefined && { tratamientos: data.tratamientos }),
        ...(data.medicacion       !== undefined && { medicacion: data.medicacion }),
        ...(data.alergias         !== undefined && { alergias: data.alergias }),
        ...(data.adaptaciones     !== undefined && { adaptaciones: data.adaptaciones }),
        ...(data.tipoAdaptaciones !== undefined && { tipoAdaptaciones: data.tipoAdaptaciones }),
        ...(data.especialistas    !== undefined && { especialistas: data.especialistas }),
        ...(data.apoyos           !== undefined && { apoyos: data.apoyos }),
      },
    });
  }

  // ── COLEGIO ───────────────────────────────────────────────
  async updateColegio(clienteId: string, data: any) {
    // Obtener el colegioId actual del cliente
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { colegioId: true },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);
    if (!cliente.colegioId) throw new NotFoundException('Este cliente no tiene colegio asignado');

    return this.prisma.colegio.update({
      where: { id: cliente.colegioId },
      data: {
        ...(data.nombre               !== undefined && { nombre: data.nombre }),
        ...(data.direccionColegio     !== undefined && { direccionColegio: data.direccionColegio }),
        ...(data.ctoColegioUno        !== undefined && { ctoColegioUno: data.ctoColegioUno }),
        ...(data.ctoTelefonoUno       !== undefined && { ctoTelefonoUno: data.ctoTelefonoUno }),
        ...(data.ctoEmailColegioUno   !== undefined && { ctoEmailColegioUno: data.ctoEmailColegioUno }),
        ...(data.ctoRelacionColegioUno!== undefined && { ctoRelacionColegioUno: data.ctoRelacionColegioUno }),
        ...(data.ctoColegioDos        !== undefined && { ctoColegioDos: data.ctoColegioDos }),
        ...(data.ctoTelefonoDos       !== undefined && { ctoTelefonoDos: data.ctoTelefonoDos }),
        ...(data.ctoEmailColegioDos   !== undefined && { ctoEmailColegioDos: data.ctoEmailColegioDos }),
        ...(data.ctoRelacionColegioDos!== undefined && { ctoRelacionColegioDos: data.ctoRelacionColegioDos }),
      },
    });
  }
}
