import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient, TipoSesion } from '@prisma/client';
import { ClienteWithRelations, clienteInclude, WHERE_NOT_DELETED } from './clientes.types';
import { ROLES_GESTION } from '../roles/roles.constants';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Terapia por defecto segun el rol de quien da de alta al cliente.
   * Sirve para la auto-asignacion: el alta ya no pide terapeuta, pero sin
   * ninguna asignacion el propio profesional dejaria de ver la ficha que acaba
   * de crear (`findAll` filtra por `trabajadoresAsignados`). El contrato luego
   * ajusta o añade las que hagan falta.
   */
  private terapiaPorRol(rol?: string): TipoSesion | null {
    switch (rol) {
      case 'PEDAGOGO': return TipoSesion.PEDAGOGIA;
      case 'NEURO':    return TipoSesion.NEUROPSICOLOGIA;
      case 'LOGOPEDA': return TipoSesion.LOGOPEDIA;
      default:         return null; // ADMIN y RECEP ven todos los clientes igualmente
    }
  }

  async create(
    createClienteDto: CreateClienteDto,
    trabajadorId?: string,
    rol?: string,
  ): Promise<ClienteWithRelations> {
    // El DNI es opcional: '' se normaliza a null para que varios clientes sin DNI
    // puedan convivir bajo el indice unico (en Postgres '' colisiona, NULL no).
    const dni = normalizarDni(createClienteDto.dni);

    // Solo tiene sentido buscar duplicados si el cliente aporta DNI
    if (dni && (await this.existeDni(dni))) {
      throw new ConflictException(
        `Ya existe un cliente registrado con el DNI ${dni}`,
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
      } else {
        const nuevoColegio = await this.prisma.colegio.create({
          data: {
            nombre: createClienteDto.colegio.nombre,
            direccionColegio: createClienteDto.colegio.direccionColegio,
            ctoColegioUno: createClienteDto.colegio.ctoColegioUno,
            ctoTelefonoUno: createClienteDto.colegio.ctoTelefonoUno,
            ctoEmailColegioUno: createClienteDto.colegio.ctoEmailColegioUno ?? '',
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
      }
    }

    // Convertir fechas a ISO
    const fechaNacimientoISO = new Date(
      createClienteDto.fechaNacimiento!,
    ).toISOString();
    const fechaInicioISO = new Date(
      createClienteDto.fechaInicio!,
    ).toISOString();

    // Crear cliente + asignaciones en una sola transacción (rollback automático si falla)
    const clienteCreado = await this.prisma.$transaction(async (tx) => {
      const cliente = await tx.cliente.create({
        data: {
          nombre: createClienteDto.nombre,
          apellidos: createClienteDto.apellidos,
          dni,
          domicilio: createClienteDto.domicilio,
          provincia: createClienteDto.provincia,
          ciudad: createClienteDto.ciudad,
          curso: createClienteDto.curso,
          fechaNacimiento: fechaNacimientoISO,
          fechaInicio: fechaInicioISO,
          colegioId: colegioId,
          idCarpetaDrive: createClienteDto.idCarpetaDrive,
          consentimientoRgpd: createClienteDto.consentimientoRgpd ?? false,
          consentimientoFecha: createClienteDto.consentimientoRgpd ? new Date() : null,
          consentimientoTrabajadorId: createClienteDto.consentimientoRgpd ? (trabajadorId ?? null) : null,

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
                  esTutorLegal: f.esTutorLegal ?? false,
                  whatsapp: f.whatsapp ?? false,
                })),
              }
            : undefined,

          disponibilidad: createClienteDto.disponibilidad
            ? {
                create: createClienteDto.disponibilidad.map((d) => ({
                  diaSemana: d.diaSemana,
                  horaInicio: d.horaInicio,
                  horaFin: d.horaFin,
                })),
              }
            : undefined,

          sanitario: createClienteDto.datosSanitarios
            ? {
                create: {
                  diagnostico: createClienteDto.datosSanitarios.diagnostico || null,
                  centroSalud: createClienteDto.datosSanitarios.centroSalud || null,
                  tratamientos: createClienteDto.datosSanitarios.tratamientos || null,
                  especialistas: createClienteDto.datosSanitarios.especialistas ?? [],
                },
              }
            : undefined,

          escolar: createClienteDto.datosEscolares
            ? {
                create: {
                  adaptaciones: createClienteDto.datosEscolares.adaptaciones ?? false,
                  tipoAdaptaciones: createClienteDto.datosEscolares.tipoAdaptaciones || null,
                  apoyos: createClienteDto.datosEscolares.apoyos ?? false,
                  especialistas: createClienteDto.datosEscolares.especialistas ?? [],
                },
              }
            : undefined,
        },
      });

      if (createClienteDto.asignaciones?.length) {
        for (const asignacion of createClienteDto.asignaciones) {
          await tx.clienteTrabajador.create({
            data: {
              clienteId: cliente.id,
              trabajadorId: asignacion.trabajadorId,
              tipoTerapia: asignacion.tipoTerapia,
            },
          });
        }
      } else {
        // El alta ya no pide terapeuta: quien crea la ficha se asigna solo. Sin
        // ninguna asignacion, un terapeuta perderia de vista al cliente que
        // acaba de dar de alta, porque `findAll` filtra por asignaciones activas.
        // El contrato ajustara o añadira las que hagan falta.
        const terapia = this.terapiaPorRol(rol);
        if (trabajadorId && terapia) {
          await tx.clienteTrabajador.create({
            data: { clienteId: cliente.id, trabajadorId, tipoTerapia: terapia },
          });
        }
      }

      return tx.cliente.findUniqueOrThrow({
        where: { id: cliente.id },
        include: clienteInclude,
      });
    });

    return clienteCreado;
  }

  async findAll(
    user?: { userId: string; rol: string },
    pagination: PaginationDto = {},
  ) {
    const { page = 1, limit = 100 } = pagination;
    const skip = (page - 1) * limit;
    const soloAsignados = user && !ROLES_GESTION.includes(user.rol as any);
    const where = soloAsignados
      ? { ...WHERE_NOT_DELETED, trabajadoresAsignados: { some: { trabajadorId: user.userId, activo: true } } }
      : WHERE_NOT_DELETED;

    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({
        where,
        include: clienteInclude,
        orderBy: { apellidos: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.cliente.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findByTrabajador(trabajadorId: string): Promise<ClienteWithRelations[]> {
    return await this.prisma.cliente.findMany({
      where: {
        ...WHERE_NOT_DELETED,
        trabajadoresAsignados: {
          some: { trabajadorId, activo: true },
        },
      },
      include: clienteInclude,
      orderBy: { apellidos: 'asc' },
    });
  }

  async findOne(id: string, user?: { userId: string; rol: string }): Promise<ClienteWithRelations | null> {
    const soloAsignados = user && !ROLES_GESTION.includes(user.rol as any);
    if (soloAsignados) {
      return await this.prisma.cliente.findFirst({
        where: {
          id,
          ...WHERE_NOT_DELETED,
          trabajadoresAsignados: { some: { trabajadorId: user.userId, activo: true } },
        },
        include: clienteInclude,
      });
    }
    return await this.prisma.cliente.findFirst({
      where: { id, ...WHERE_NOT_DELETED },
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
            // ── NUEVO: incluir datos GAS ──────────────────────────
            descripcionesNiveles: true,
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

    const objetivosConEstadisticas = await Promise.all(
      cliente.objetivosGeneralesAsignados.map(async (asignacion) => {
        const vecesTrabajado = await this.prisma.registroDiarioObjetivo.count({
          where: {
            objetivoGeneralId: asignacion.objetivoGeneralId,
            registroDiario: { clienteId },
          },
        });

        const ultimoRegistro = await this.prisma.registroDiarioObjetivo.findFirst({
          where: {
            objetivoGeneralId: asignacion.objetivoGeneralId,
            registroDiario: { clienteId },
          },
          orderBy: { createdAt: 'desc' },
        });

        return {
          id: asignacion.id,                              // clienteObjetivoId
          objetivoGeneralId: asignacion.objetivoGeneralId,
          area: asignacion.objetivoGeneral.areaDesarrollo.nombre,
          titulo: asignacion.objetivoGeneral.titulo,
          descripcion: asignacion.objetivoGeneral.descripcion,
          color: asignacion.objetivoGeneral.areaDesarrollo.color,
          fechaAsignacion: asignacion.fechaAsignacion,
          vecesTrabajado,
          ultimaVez: ultimoRegistro?.createdAt ?? null,
          // ── Campos GAS ──────────────────────────────────────
          nivelGASActual: asignacion.nivelGASActual ?? null,
          fechaUltimaEvaluacion: asignacion.fechaUltimaEvaluacion ?? null,
          nivelesDefinidos: asignacion.descripcionesNiveles.length === 5,
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
    tipoTerapia: TipoSesion,
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

  /**
   * Actualiza los horarios de una asignacion cliente-terapeuta.
   *
   * YA NO TOCA LAS SESIONES (2026-08-31). Antes borraba las futuras y las
   * recreaba, con tres efectos que nadie veia: perdia el `contratoId` -y con el
   * la trazabilidad a facturacion-, no filtraba festivos ni vacaciones, y
   * competia con el generador del contrato escribiendo en la misma tabla.
   *
   * El horario recurrente lo define el contrato. Para mover sesiones en bloque
   * esta la replanificacion del contrato.
   */
  async actualizarHorariosAsignacion(
    clienteId: string,
    asignacionId: string,
    horarios: { diaSemana: number; horaInicio: string; horaFin: string }[],
  ) {
    const asignacion = await this.prisma.clienteTrabajador.findFirst({
      where: { id: asignacionId, clienteId },
    });

    if (!asignacion) {
      throw new NotFoundException(
        `Asignación con ID ${asignacionId} no encontrada para este cliente`,
      );
    }

    await this.prisma.$transaction([
      this.prisma.disponibilidadClienteTrabajador.deleteMany({
        where: { clienteTrabajadorId: asignacionId },
      }),
      this.prisma.disponibilidadClienteTrabajador.createMany({
        data: horarios.map((h) => ({
          clienteTrabajadorId: asignacionId,
          diaSemana:  h.diaSemana,
          horaInicio: h.horaInicio,
          horaFin:    h.horaFin,
        })),
      }),
    ]);

    return {
      message: 'Horarios actualizados. Las sesiones no se han modificado.',
      asignacionId,
      horariosActualizados: horarios.length,
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
    trabajadorId?: string,
  ): Promise<ClienteWithRelations> {
    const updateData: any = {};

    if (updateDto.nombre !== undefined) updateData.nombre = updateDto.nombre;
    if (updateDto.apellidos !== undefined)
      updateData.apellidos = updateDto.apellidos;
    // Mismo criterio que en create: '' nunca llega a BD, se guarda null
    if (updateDto.dni !== undefined) updateData.dni = normalizarDni(updateDto.dni);
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
    if (updateDto.consentimientoRgpd !== undefined) {
      updateData.consentimientoRgpd = updateDto.consentimientoRgpd;
      updateData.consentimientoFecha = updateDto.consentimientoRgpd ? new Date() : null;
      updateData.consentimientoTrabajadorId = updateDto.consentimientoRgpd ? (trabajadorId ?? null) : null;
    }
    if (updateDto.colegio?.id !== undefined)
      updateData.colegioId = updateDto.colegio.id;

    return await this.prisma.cliente.update({
      where: { id },
      data: updateData,
      include: clienteInclude,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.cliente.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async search(query: string, user?: { userId: string; rol: string }) {
    const soloAsignados = user && !ROLES_GESTION.includes(user.rol as any);
    return await this.prisma.cliente.findMany({
      where: {
        OR: [
          { nombre: { contains: query, mode: 'insensitive' } },
          { apellidos: { contains: query, mode: 'insensitive' } },
          { dni: { contains: query } },
        ],
        activo: true,
        ...WHERE_NOT_DELETED,
        ...(soloAsignados
          ? { trabajadoresAsignados: { some: { trabajadorId: user.userId, activo: true } } }
          : {}),
      },
      take: 10,
    });
  }

  /**
   * Un cliente sin DNI nunca cuenta como duplicado: `findUnique` con undefined
   * reventaria y con null no es lo que queremos preguntar.
   */
  async existeDni(dni?: string | null): Promise<boolean> {
    const valor = normalizarDni(dni);
    if (!valor) return false;

    const cliente = await this.prisma.cliente.findUnique({
      where: { dni: valor },
      select: { deletedAt: true },
    });
    return !!cliente && cliente.deletedAt === null;
  }

  // ── EXPORTACIÓN RGPD (Art. 20) ───────────────────────────
  async exportarDatos(clienteId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, ...WHERE_NOT_DELETED },
      include: {
        colegio: true,
        contactosFamiliares: true,
        sanitario: true,
        escolar: true,
        disponibilidad: true,
        trabajadoresAsignados: {
          include: {
            trabajador: { select: { id: true, nombre: true, apellidos: true, email: true, especialidad: true } },
            horarios: true,
          },
        },
        sesiones: {
          orderBy: { fechaHoraInicio: 'asc' },
          include: { bono: { select: { id: true, tipoSesion: true } } },
        },
        bonos: { orderBy: { createdAt: 'desc' } },
        informes: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, titulo: true, tipoInforme: true, estado: true, createdAt: true },
        },
        registrosDiarios: {
          orderBy: { fechaRegistro: 'desc' },
          include: {
            objetivosGeneralesTrabajados: {
              include: { objetivoGeneral: { select: { id: true, titulo: true } } },
            },
          },
        },
        objetivosGeneralesAsignados: {
          where: { activo: true },
          include: {
            objetivoGeneral: { include: { areaDesarrollo: true } },
            evaluaciones: { orderBy: { fecha: 'desc' } },
            descripcionesNiveles: true,
          },
        },
      },
    });

    if (!cliente) throw new NotFoundException(`Cliente con ID ${clienteId} no encontrado`);

    return {
      exportadoEn: new Date().toISOString(),
      baseLegal: 'Art. 20 RGPD — Derecho a la portabilidad de los datos',
      cliente,
    };
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
        esTutorLegal:       data.esTutorLegal ?? false,
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
        ...(data.email              !== undefined && { email: data.email ?? '' }),
        ...(data.dni                !== undefined && { dni: data.dni ?? '' }),
        ...(data.esContactoPrincipal!== undefined && { esContactoPrincipal: data.esContactoPrincipal }),
        ...(data.esTutorLegal !== undefined && { esTutorLegal: data.esTutorLegal }),
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
          diagnostico:   data.diagnostico   ?? null,
          centroSalud:   data.centroSalud   ?? null,
          tratamientos:  data.tratamientos  ?? null,
          especialistas: data.especialistas ?? [],
        },
      });
    }

    return this.prisma.sanitario.update({
      where: { clienteId },
      data: {
        ...(data.diagnostico   !== undefined && { diagnostico: data.diagnostico }),
        ...(data.centroSalud   !== undefined && { centroSalud: data.centroSalud }),
        ...(data.tratamientos  !== undefined && { tratamientos: data.tratamientos }),
        ...(data.especialistas !== undefined && { especialistas: data.especialistas }),
      },
    });
  }

  // ── ESCOLAR ───────────────────────────────────────────────
  /**
   * Situación escolar del niño (adaptaciones, apoyos, especialistas del centro).
   * Vive aparte de `colegio` porque el colegio se comparte entre clientes.
   */
  async updateEscolar(clienteId: string, data: any) {
    const escolar = await this.prisma.escolar.findUnique({ where: { clienteId } });

    if (!escolar) {
      return this.prisma.escolar.create({
        data: {
          clienteId,
          adaptaciones:     data.adaptaciones     ?? false,
          tipoAdaptaciones: data.tipoAdaptaciones ?? null,
          apoyos:           data.apoyos           ?? false,
          especialistas:    data.especialistas    ?? [],
        },
      });
    }

    return this.prisma.escolar.update({
      where: { clienteId },
      data: {
        ...(data.adaptaciones     !== undefined && { adaptaciones: data.adaptaciones }),
        ...(data.tipoAdaptaciones !== undefined && { tipoAdaptaciones: data.tipoAdaptaciones }),
        ...(data.apoyos           !== undefined && { apoyos: data.apoyos }),
        ...(data.especialistas    !== undefined && { especialistas: data.especialistas }),
      },
    });
  }

  // ── COLEGIO ───────────────────────────────────────────────
  async updateColegio(clienteId: string, data: any) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: clienteId },
      select: { colegioId: true },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);

    const colegioData = {
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
    };

    if (!cliente.colegioId) {
      return await this.prisma.$transaction(async (tx) => {
        const nuevoColegio = await tx.colegio.create({
          data: {
            nombre:               data.nombre               ?? '',
            direccionColegio:     data.direccionColegio     ?? '',
            ctoColegioUno:        data.ctoColegioUno        ?? '',
            ctoTelefonoUno:       data.ctoTelefonoUno       ?? '',
            ctoEmailColegioUno:   data.ctoEmailColegioUno   ?? '',
            ctoRelacionColegioUno:data.ctoRelacionColegioUno ?? '',
            ctoColegioDos:        data.ctoColegioDos        ?? null,
            ctoTelefonoDos:       data.ctoTelefonoDos       ?? null,
            ctoEmailColegioDos:   data.ctoEmailColegioDos   ?? null,
            ctoRelacionColegioDos:data.ctoRelacionColegioDos ?? null,
          },
        });
        await tx.cliente.update({
          where: { id: clienteId },
          data: { colegioId: nuevoColegio.id },
        });
        return nuevoColegio;
      });
    }

    return this.prisma.colegio.update({
      where: { id: cliente.colegioId },
      data: colegioData,
    });
  }

  // ── CONSENTIMIENTO RGPD ───────────────────────────────────

  async registrarConsentimiento(
    clienteId: string,
    trabajadorId: string,
    dto: { familiarId: string; aceptado: boolean; versionTexto: string; textoConsentimiento: string; ipRegistro?: string },
  ) {
    const cliente = await this.prisma.cliente.findFirst({ where: { id: clienteId, ...WHERE_NOT_DELETED } });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);

    const familiar = await this.prisma.familiar.findFirst({ where: { id: dto.familiarId, clienteId } });
    if (!familiar) throw new NotFoundException(`Familiar ${dto.familiarId} no pertenece al cliente`);

    const registro = await this.prisma.consentimientoRgpd.create({
      data: {
        clienteId,
        familiarId: dto.familiarId,
        trabajadorId,
        aceptado: dto.aceptado,
        versionTexto: dto.versionTexto,
        textoConsentimiento: dto.textoConsentimiento,
        ipRegistro: dto.ipRegistro,
      },
      include: { familiar: { select: { nombre: true, apellidos: true, parentesco: true } } },
    });

    // Actualizar cache en Cliente para consultas rápidas
    await this.prisma.cliente.update({
      where: { id: clienteId },
      data: {
        consentimientoRgpd: dto.aceptado,
        consentimientoFecha: new Date(),
        consentimientoTrabajadorId: trabajadorId,
      },
    });

    return registro;
  }

  async getHistoricoConsentimientos(clienteId: string) {
    const cliente = await this.prisma.cliente.findFirst({ where: { id: clienteId, ...WHERE_NOT_DELETED } });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);

    return this.prisma.consentimientoRgpd.findMany({
      where: { clienteId },
      orderBy: { fechaRegistro: 'desc' },
      include: {
        familiar: { select: { nombre: true, apellidos: true, parentesco: true } },
        trabajador: { select: { nombre: true, apellidos: true } },
      },
    });
  }

  // ── DATOS PAGADOR (FACTURACIÓN) ──────────────────────────

  async updateDatosPagador(clienteId: string, data: import('./dto/update-datos-pagador.dto').UpdateDatosPagadorDto) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);

    return this.prisma.cliente.update({
      where: { id: clienteId },
      data: {
        ...(data.nifTutorPagador      !== undefined && { nifTutorPagador: data.nifTutorPagador }),
        ...(data.nombreTutorPagador   !== undefined && { nombreTutorPagador: data.nombreTutorPagador }),
        ...(data.direccionFiscalTutor !== undefined && { direccionFiscalTutor: data.direccionFiscalTutor }),
        ...(data.codigoPostalTutor    !== undefined && { codigoPostalTutor: data.codigoPostalTutor }),
        ...(data.ciudadTutor          !== undefined && { ciudadTutor: data.ciudadTutor }),
        ...(data.emailFacturacion     !== undefined && { emailFacturacion: data.emailFacturacion }),
      },
    });
  }

  // ── ANONIMIZACION (Art. 17 RGPD + Ley 41/2002) ───────────

  async anonimizarCliente(clienteId: string) {
    const cliente = await this.prisma.cliente.findFirst({ where: { id: clienteId } });
    if (!cliente) throw new NotFoundException(`Cliente ${clienteId} no encontrado`);
    if (!cliente.deletedAt) throw new BadRequestException(`El cliente debe estar eliminado (soft delete) antes de anonimizar`);

    const anonId = clienteId.slice(0, 8);

    await this.prisma.$transaction([
      // Anonimizar datos identificativos del cliente
      this.prisma.cliente.update({
        where: { id: clienteId },
        data: {
          nombre: `[ANONIMIZADO-${anonId}]`,
          apellidos: '[ANONIMIZADO]',
          dni: `ANON-${anonId}`,
          domicilio: '[ELIMINADO]',
          provincia: '[ELIMINADO]',
          ciudad: '[ELIMINADO]',
          fechaNacimiento: null,
          idCarpetaDrive: null,
          consentimientoRgpd: false,
          consentimientoFecha: null,
        },
      }),
      // Eliminar datos sanitarios (especial categoría Art. 9)
      this.prisma.sanitario.deleteMany({ where: { clienteId } }),
      // Eliminar datos escolares (adaptaciones y apoyos revelan necesidades del menor)
      this.prisma.escolar.deleteMany({ where: { clienteId } }),
      // Eliminar familiares (datos de terceros)
      this.prisma.familiar.deleteMany({ where: { clienteId } }),
      // Eliminar historial de consentimientos
      this.prisma.consentimientoRgpd.deleteMany({ where: { clienteId } }),
    ]);

    return { message: `Cliente ${clienteId} anonimizado correctamente`, anonimizadoEn: new Date().toISOString() };
  }
}

/**
 * El DNI del cliente es opcional. Cualquier forma de "vacio" (undefined, null,
 * '' o solo espacios) se guarda como NULL: en Postgres varios NULL conviven bajo
 * un indice unico, mientras que dos '' colisionan entre si. Se normaliza tambien
 * a mayusculas para que "12345678z" y "12345678Z" no se cuelen como distintos.
 */
export function normalizarDni(dni?: string | null): string | null {
  const limpio = dni?.trim().toUpperCase();
  return limpio ? limpio : null;
}
