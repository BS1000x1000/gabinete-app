import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EtiquetaRegistro } from '@prisma/client';
import { diaDesdeIso } from '../common/fecha/dia.utils';
import { CreateRegistroDiarioDto, ObjetivoTrabajadoDto, UpdateRegistroDiarioDto } from './dto/create-registro.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AccesoClienteService } from '../common/acceso/acceso-cliente.service';
import { QueryRegistrosClienteDto } from './dto/query-registros.dto';

@Injectable()
export class FichajeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly acceso: AccesoClienteService,
  ) {}

  /**
   * Comprueba el acceso al cliente al que pertenece un registro.
   *
   * Va SIEMPRE fuera del try/catch de cada metodo: esos catch reconvierten todo
   * lo que no sea NotFound en un 500, asi que un 403 lanzado dentro saldria como
   * error de servidor.
   */
  private async assertAccesoRegistro(id: string, user?: { userId: string; rol: string }) {
    const registro = await this.prisma.registroDiario.findUnique({
      where: { id },
      select: { clienteId: true },
    });
    if (!registro) throw new NotFoundException('Registro diario no encontrado');
    await this.acceso.assertAcceso(registro.clienteId, user, 'los registros de este cliente');
  }

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
    user?: { userId: string; rol: string },
  ): Promise<any> {
    await this.acceso.assertAcceso(
      dto.clienteId,
      user,
      'los registros de este cliente',
    );

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
          // `fechaRegistro` es el DIA al que se refiere el registro, no el
          // momento en que se escribio. Eso ultimo ya lo guarda `createdAt`.
          //
          // Sin normalizar, `new Date("2026-09-02")` daba la medianoche UTC, que
          // en Madrid se pinta como las 02:00: de ahi salia el "registro hecho a
          // las 02:00 am". Se guarda a las 12:00 UTC para que el dia local sea
          // el mismo corra el contenedor en UTC o en Europe/Madrid.
          ...(dto.fechaRegistro && {
            fechaRegistro: diaDesdeIso(dto.fechaRegistro),
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
  async update(
    id: string,
    dto: UpdateRegistroDiarioDto,
    user?: { userId: string; rol: string },
  ): Promise<any> {
    await this.assertAccesoRegistro(id, user);

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
            // Un dia, no un instante. Ver el comentario en `create`.
            ...(fechaRegistro && { fechaRegistro: diaDesdeIso(fechaRegistro) }),
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

  /**
   * Rango de dias sobre `fechaRegistro`, **inclusivo por los dos extremos**.
   *
   * `fechaRegistro` guarda un DIA a las 12:00 UTC (ver `common/fecha/dia.utils`),
   * asi que el rango se construye con los mismos mediodias y no con medianoches:
   * `gte` el mediodia del dia `desde` y `lte` el mediodia del dia `hasta` dejan
   * dentro los dos dias frontera, que es justo donde se cuela el desfase de un
   * dia si se parsea con `new Date(iso)` — ese lee la medianoche UTC, que en
   * Madrid ya es la vispera.
   *
   * No se usa `hasta + 'T23:59:59'` (como en `export.service`) a proposito: aqui
   * no hay instantes que recoger despues del mediodia, y el mediodia exacto es
   * lo unico que este campo escribe.
   */
  private buildRangoDias(desde?: string, hasta?: string) {
    const rango: { gte?: Date; lte?: Date } = {};
    if (desde) rango.gte = diaDesdeIso(desde);
    if (hasta) rango.lte = diaDesdeIso(hasta);
    if (rango.gte && rango.lte && rango.gte > rango.lte) {
      throw new BadRequestException(
        'El rango de fechas es invalido: "desde" es posterior a "hasta"',
      );
    }
    return Object.keys(rango).length ? rango : null;
  }

  /* ---------- READ (por Cliente) ---------- */
  // Pagina a proposito: antes traia el historial entero sin tope, con un include
  // anidado a tres niveles, y crecia sin limite con los anos de tratamiento.
  //
  // `desde`/`hasta` acotan por periodo en la BD. Antes no existian: el frontend
  // pedia `?limit=500` y filtraba en memoria, lo que ademas rompe en cuanto un
  // cliente pasa de 500 registros.
  async findByCliente(
    clienteId: string,
    filtros: QueryRegistrosClienteDto = {},
    user?: { userId: string; rol: string },
  ) {
    // Filtraba solo por clienteId: cualquier rol clinico leia la narrativa
    // clinica de cualquier menor, estuviera o no asignado.
    await this.acceso.assertAcceso(clienteId, user, 'los registros de este cliente');

    // Fuera del try: los catch de este servicio reconvierten en 500 todo lo que
    // no sea NotFound, y un rango invalido es un 400.
    const rangoDias = this.buildRangoDias(filtros.desde, filtros.hasta);

    try {
      const { page = 1, limit = 100 } = filtros;
      const skip = (page - 1) * limit;
      const where = {
        clienteId,
        ...(rangoDias && { fechaRegistro: rangoDias }),
      };

      const [data, total] = await Promise.all([
        this.prisma.registroDiario.findMany({
          where,
          include: {
            trabajador: { select: { id: true, nombre: true, apellidos: true } },
            objetivosGeneralesTrabajados: {
              include: { objetivoGeneral: { include: { areaDesarrollo: true } } },
            },
          },
          orderBy: { fechaRegistro: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.registroDiario.count({ where }),
      ]);

      return { data, total, page, limit };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(`Error al obtener registros del cliente: ${err.message}`);
    }
  }

  /* ---------- READ (por Trabajador) ---------- */
  async findByTrabajador(
    trabajadorId: string,
    user?: { userId: string; rol: string },
  ): Promise<any[]> {
    // Los registros de otro profesional solo los ve un ADMIN.
    if (user && user.rol !== 'ADMIN' && user.userId !== trabajadorId) {
      throw new ForbiddenException('No tienes acceso a los registros de otro profesional');
    }

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
  async findOne(id: string, user?: { userId: string; rol: string }): Promise<any> {
    await this.assertAccesoRegistro(id, user);

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
  async remove(id: string, user?: { userId: string; rol: string }): Promise<void> {
    await this.assertAccesoRegistro(id, user);

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
