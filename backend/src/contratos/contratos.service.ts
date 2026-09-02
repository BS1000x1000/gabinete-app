import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoContrato, EstadoSesion, ModalidadSesion, TipoSesion } from '@prisma/client';
import { CreateContratoDto } from './dto/create-contrato.dto';
import { UpdateContratoDto } from './dto/update-contrato.dto';
import { ContratosPdfService } from './contratos-pdf.service';
import { ExpedienteService } from '../expediente/expediente.service';
import { StorageService } from '../common/storage/storage.service';
import { FestivosService } from '../festivos/festivos.service';
import { HORIZONTE_GENERACION_MESES } from './contratos.constants';
import { randomUUID } from 'crypto';
import {
  addMonths,
  añosCubiertos,
  combinarFechaHora,
  esFestivo,
  enVacaciones,
  generarFechasRecurrentes,
} from './contratos.utils';

const CONTRATO_INCLUDE = {
  cliente:    { select: { id: true, nombre: true, apellidos: true } },
  trabajador: { select: { id: true, nombre: true, apellidos: true, especialidad: true } },
  slots:      { orderBy: { diaSemana: 'asc' as const } },
  _count:     { select: { sesiones: true } },
} as const;

export { CONTRATO_PDF_INCLUDE } from './contratos.include';
import { CONTRATO_PDF_INCLUDE } from './contratos.include';

/** 10 MB: un contrato escaneado cabe de sobra; corta subidas accidentales. */
export const TAMANO_MAX_CONTRATO = 10 * 1024 * 1024;

/** Una cita recurrente de la semana del terapeuta, aplanada desde ContratoSlot. */
export interface CargaSemanalSlot {
  contratoId: string;
  clienteId: string;
  clienteNombre: string;
  tipoSesion: TipoSesion;
  horaInicio: string;
  horaFin: string;
  duracionMinutos: number;
  modalidad: ModalidadSesion;
}

/** Fichero en memoria de multer. Tipado local para no depender de @types/multer. */
export interface FicheroContrato {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class ContratosService {
  private readonly logger = new Logger(ContratosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: ContratosPdfService,
    private readonly expediente: ExpedienteService,
    private readonly storage: StorageService,
    private readonly festivos: FestivosService,
  ) {}

  async create(dto: CreateContratoDto, user: { userId: string; rol: string }) {
    const trabajadorId = user.rol === 'ADMIN' && dto.trabajadorId
      ? dto.trabajadorId
      : user.userId;

    const existente = await this.prisma.contratoServicio.findFirst({
      where: {
        clienteId: dto.clienteId,
        trabajadorId,
        tipoSesion: dto.tipoSesion,
        estado: { in: [EstadoContrato.ACTIVO, EstadoContrato.BORRADOR] },
      },
    });
    if (existente) {
      throw new BadRequestException(
        `Ya existe un contrato activo para esta pareja cliente-terapeuta con tipo ${dto.tipoSesion}`,
      );
    }

    const contrato = await this.prisma.contratoServicio.create({
      data: {
        clienteId: dto.clienteId,
        trabajadorId,
        tipoSesion: dto.tipoSesion,
        cuotaMensual: dto.cuotaMensual,
        fechaInicio: new Date(dto.fechaInicio),
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
        notas: dto.notas,
        estado: EstadoContrato.ACTIVO,
        slots: {
          create: dto.slots.map(s => ({
            diaSemana:       s.diaSemana,
            horaInicio:      s.horaInicio,
            horaFin:         s.horaFin,
            duracionMinutos: s.duracionMinutos,
            modalidad:       s.modalidad ?? ModalidadSesion.PRESENCIAL,
          })),
        },
      },
      include: CONTRATO_INCLUDE,
    });

    // El contrato es tambien la declaracion de que este terapeuta atiende a este
    // niño. Se asegura la asignacion porque es lo que gobierna el control de
    // acceso: sin ella, el propio terapeuta dejaria de ver la ficha.
    await this.prisma.clienteTrabajador.upsert({
      where: {
        clienteId_trabajadorId_tipoTerapia: {
          clienteId:   contrato.clienteId,
          trabajadorId: contrato.trabajadorId,
          tipoTerapia: contrato.tipoSesion,
        },
      },
      create: {
        clienteId:    contrato.clienteId,
        trabajadorId: contrato.trabajadorId,
        tipoTerapia:  contrato.tipoSesion,
      },
      update: { activo: true },
    });

    // Se espera a proposito. Antes iba fire-and-forget con un `.catch(console.error)`:
    // si fallaba, el contrato quedaba creado pero sin ninguna sesion y nadie se
    // enteraba hasta que la familia preguntaba por su cita.
    try {
      const creadas = await this.generarSesionesContrato(contrato.id);
      this.logger.log(`Contrato ${contrato.id}: ${creadas} sesiones generadas`);
    } catch (err) {
      // El contrato ya existe y es valido; lo que falla es su calendario. Se
      // informa en la respuesta para que la UI lo pueda decir, en vez de fingir
      // que todo fue bien.
      this.logger.error(`Contrato ${contrato.id}: fallo la generacion de sesiones`, err);
      return { ...contrato, avisoGeneracion: 'El contrato se creo, pero no se pudieron generar sus sesiones. Revisa el horario y vuelve a intentarlo.' };
    }

    // Documentacion inicial: contrato y los dos consentimientos.
    //
    // Va sin `await` a proposito, al contrario que las sesiones: son tres
    // arranques de Chromium (~3-6 s) y la terapeuta no tiene por que esperarlos
    // para ver el contrato creado. Si falla, el contrato sigue siendo valido y
    // la pantalla de Documentacion ofrece el boton de generar.
    this.expediente.generar(contrato.id, user).catch(err =>
      this.logger.error(
        `Contrato ${contrato.id}: fallo la generacion del expediente inicial`,
        err,
      ),
    );

    return contrato;
  }

  async generarSesionesContrato(contratoId: string): Promise<number> {
    const contrato = await this.prisma.contratoServicio.findUniqueOrThrow({
      where: { id: contratoId },
      include: {
        slots:   true,
        cliente: { select: { provincia: true } },
      },
    });

    if (!contrato.slots.length) return 0;

    // Ventana movil: se genera desde donde se quedo la ultima vez (o desde el
    // inicio del contrato) y solo unos meses por delante. El cron mensual la va
    // empujando. Generar el contrato entero de golpe obligaba a recolocar
    // decenas de sesiones ante cualquier cambio de horario.
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const desde = [contrato.fechaInicio, contrato.generadoHasta, hoy]
      .filter((d): d is Date => !!d)
      .reduce((a, b) => (a > b ? a : b));

    const limiteVentana = addMonths(hoy, HORIZONTE_GENERACION_MESES);
    const fechaFin = contrato.fechaFin && contrato.fechaFin < limiteVentana
      ? new Date(contrato.fechaFin)
      : limiteVentana;

    // El fin de ventana cubre el DIA COMPLETO. `generarFechasRecurrentes` ya
    // incluye las sesiones de ese ultimo dia (pone el fin a las 23:59), asi que
    // si `generadoHasta` se guardase a las 00:00 quedaria una sesion creada por
    // el generador pero fuera de su propia ventana: invisible para el
    // recolocador, que la dejaria en el dia viejo al cambiar el horario.
    fechaFin.setHours(23, 59, 59, 999);

    if (fechaFin <= desde) return 0;

    const fechaInicio = desde;
    const anos        = añosCubiertos(fechaInicio, fechaFin);

    // El calendario es el del CENTRO, no el de la provincia del cliente: un
    // festivo local cierra el local, no cierra a la familia. Esta query estaba
    // copiada aqui, en la replanificacion y en el PDF, y las tres casaban texto
    // libre contra texto libre.
    const [festivos, vacaciones] = await Promise.all([
      this.festivos.delCentro(anos),
      this.prisma.periodoVacaciones.findMany({
        where: { trabajadorId: contrato.trabajadorId },
      }),
    ]);

    const sesiones = contrato.slots.flatMap(slot => {
      const fechasValidas = generarFechasRecurrentes(fechaInicio, fechaFin, slot.diaSemana)
        .filter(f => !esFestivo(f, festivos) && !enVacaciones(f, vacaciones));
      return fechasValidas.map(f => ({
        clienteId:       contrato.clienteId,
        trabajadorId:    contrato.trabajadorId,
        contratoId:      contrato.id,
        tipoSesion:      contrato.tipoSesion,
        modalidad:       slot.modalidad,
        fechaHoraInicio: combinarFechaHora(f, slot.horaInicio),
        fechaHoraFin:    combinarFechaHora(f, slot.horaFin),
        estado:          EstadoSesion.PROGRAMADA,
      }));
    });

    // Se marca la ventana aunque no haya salido ninguna sesion (todo festivos o
    // vacaciones): si no, el cron reintentaria el mismo tramo cada mes.
    await this.prisma.contratoServicio.update({
      where: { id: contratoId },
      data: { generadoHasta: fechaFin },
    });

    if (!sesiones.length) return 0;

    // `skipDuplicates` ahora si protege: la tabla tiene un indice unico sobre
    // (cliente, trabajador, inicio). Esto hace el cron idempotente, asi que
    // ejecutarlo de mas no cuesta nada y ejecutarlo de menos si.
    const { count } = await this.prisma.sesion.createMany({
      data: sesiones,
      skipDuplicates: true,
    });
    return count;
  }

  /**
   * `soloMias` lo mandan las pantallas "Mis contratos": el ADMIN tambien es un
   * autonomo con su propio circuito fiscal y no debe ver los contratos de los
   * demas mezclados con los suyos. La vista global es Supervision.
   */
  async findAll(
    user: { userId: string; rol: string },
    opts?: { soloMias?: boolean },
  ) {
    const where =
      user.rol === 'ADMIN' && !opts?.soloMias ? {} : { trabajadorId: user.userId };
    return this.prisma.contratoServicio.findMany({
      where,
      include: CONTRATO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCliente(clienteId: string, user: { userId: string; rol: string }) {
    const where: any = { clienteId };
    if (user.rol !== 'ADMIN') {
      where.trabajadorId = user.userId;
    }
    return this.prisma.contratoServicio.findMany({
      where,
      include: CONTRATO_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Carga semanal recurrente del terapeuta: que cliente cae cada dia y a que
   * hora, segun los contratos vigentes HOY.
   *
   * Sale de `ContratoSlot` y no de las sesiones porque la pregunta que responde
   * es de planificacion —"donde meto al cliente que entra"— y para eso vale el
   * patron estable, no la semana concreta, que varia con cancelaciones,
   * festivos y vacaciones. Las sesiones reales ya se ven en la Agenda.
   *
   * OJO con el filtro de estado: en FACTURACION un contrato `FINALIZADO` cuya
   * ventana de fechas cubre el periodo si factura, y filtrar solo por `ACTIVO`
   * es un error conocido y documentado. Aqui la pregunta es otra —que ocupa el
   * calendario HOY—, asi que `ACTIVO` + vigencia por fechas es lo correcto: un
   * contrato terminado ya no ocupa hueco. No "corregirlo" a la regla de
   * facturacion, que responde a otra pregunta.
   */
  async cargaSemanal(trabajadorId: string, user: { userId: string; rol: string }) {
    // Mismo criterio que `HorariosLaboralesService.assertPuedeVer`: la ficha
    // ajena se mira en solo lectura, y solo la mira un ADMIN. RECEP no llega
    // hasta aqui —la pestana es ROLES_CLINICOS—, pero la regla no depende de eso.
    if (user.userId !== trabajadorId && user.rol !== 'ADMIN') {
      throw new ForbiddenException('No tienes acceso a la carga semanal de este trabajador');
    }

    const hoy = new Date();

    const contratos = await this.prisma.contratoServicio.findMany({
      where: {
        trabajadorId,
        estado: EstadoContrato.ACTIVO,
        fechaInicio: { lte: hoy },
        OR: [{ fechaFin: null }, { fechaFin: { gte: hoy } }],
      },
      select: {
        id: true,
        tipoSesion: true,
        cliente: { select: { id: true, nombre: true, apellidos: true } },
        slots: true,
      },
    });

    const porDia = new Map<number, CargaSemanalSlot[]>();
    for (const contrato of contratos) {
      for (const slot of contrato.slots) {
        const lista = porDia.get(slot.diaSemana) ?? [];
        lista.push({
          contratoId: contrato.id,
          clienteId: contrato.cliente.id,
          clienteNombre: `${contrato.cliente.nombre} ${contrato.cliente.apellidos}`.trim(),
          tipoSesion: contrato.tipoSesion,
          horaInicio: slot.horaInicio,
          horaFin: slot.horaFin,
          duracionMinutos: slot.duracionMinutos,
          modalidad: slot.modalidad,
        });
        porDia.set(slot.diaSemana, lista);
      }
    }

    return Array.from(porDia.entries())
      .sort(([a], [b]) => a - b)
      .map(([dia, slots]) => ({
        dia,
        slots: slots.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
      }));
  }

  async findOne(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id },
      include: CONTRATO_INCLUDE,
    });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);
    return contrato;
  }

  async update(id: string, dto: UpdateContratoDto, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (contrato.estado === EstadoContrato.FINALIZADO) {
      throw new BadRequestException('No se puede editar un contrato finalizado');
    }

    return this.prisma.$transaction(async tx => {
      if (dto.slots) {
        await tx.contratoSlot.deleteMany({ where: { contratoId: id } });
        await tx.contratoSlot.createMany({
          data: dto.slots.map(s => ({
            contratoId:      id,
            diaSemana:       s.diaSemana,
            horaInicio:      s.horaInicio,
            horaFin:         s.horaFin,
            duracionMinutos: s.duracionMinutos,
            modalidad:       s.modalidad ?? ModalidadSesion.PRESENCIAL,
          })),
        });
      }

      // Si se tocan los datos con los que se factura y ya hay un PDF firmado,
      // sellamos la fecha para poder avisar de que el papel quedo desfasado.
      const tocaResumen =
        dto.cuotaMensual !== undefined ||
        dto.fechaFin !== undefined ||
        dto.slots !== undefined;

      return tx.contratoServicio.update({
        where: { id },
        data: {
          ...(dto.cuotaMensual !== undefined && { cuotaMensual: dto.cuotaMensual }),
          ...(dto.fechaFin     !== undefined && { fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null }),
          ...(dto.notas        !== undefined && { notas: dto.notas }),
          ...(tocaResumen && contrato.storageKeyFirmado
            ? { resumenModificadoAt: new Date() }
            : {}),
        },
        include: CONTRATO_INCLUDE,
      });
    });
  }

  async finalizar(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (contrato.estado === EstadoContrato.FINALIZADO) {
      throw new BadRequestException('El contrato ya está finalizado');
    }

    const ahora = new Date();

    const [, contratoFinalizado] = await this.prisma.$transaction([
      this.prisma.sesion.updateMany({
        where: {
          contratoId: id,
          fechaHoraInicio: { gt: ahora },
          estado: EstadoSesion.PROGRAMADA,
        },
        data: { estado: EstadoSesion.CANCELADA_CON_AVISO },
      }),
      this.prisma.contratoServicio.update({
        where: { id },
        data: { estado: EstadoContrato.FINALIZADO, fechaFin: ahora },
        include: CONTRATO_INCLUDE,
      }),
    ]);

    return contratoFinalizado;
  }

  // ── PDF FIRMADO ───────────────────────────────────────────

  /**
   * Sube el contrato firmado. Sustituye al PDF generado al vuelo: a partir de
   * aqui, "Ver PDF" sirve este documento.
   */
  async subirDocumentoFirmado(
    id: string,
    fichero: FicheroContrato,
    user: { userId: string; rol: string },
  ) {
    if (!fichero) throw new BadRequestException('No se ha recibido ningun fichero');
    if (fichero.mimetype !== 'application/pdf') {
      throw new BadRequestException('El contrato firmado debe ser un PDF');
    }
    if (fichero.size > TAMANO_MAX_CONTRATO) {
      throw new BadRequestException(
        `El fichero supera el maximo de ${TAMANO_MAX_CONTRATO / (1024 * 1024)} MB`,
      );
    }

    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    // Fallo ruidoso: sin Object Storage el fichero no puede persistir. Nunca a
    // disco local — el contenedor es efimero y el PDF desapareceria al desplegar.
    if (!this.storage.isConfigured) {
      throw new ServiceUnavailableException(
        'El almacenamiento de ficheros no esta configurado (faltan variables SCW_*). ' +
          'No se pueden subir contratos firmados hasta que se configure Object Storage.',
      );
    }

    const anterior = contrato.storageKeyFirmado;
    const storageKey = `contratos/${id}/${randomUUID()}.pdf`;

    await this.storage.upload(storageKey, fichero.buffer, fichero.mimetype);

    let actualizado;
    try {
      actualizado = await this.prisma.contratoServicio.update({
        where: { id },
        data: {
          storageKeyFirmado:  storageKey,
          mimeTypeFirmado:    fichero.mimetype,
          tamanoBytesFirmado: fichero.size,
          fechaSubidaFirmado: new Date(),
          // El PDF recien subido refleja los datos actuales: se limpia el aviso
          resumenModificadoAt: null,
        },
        include: CONTRATO_INCLUDE,
      });
    } catch (error) {
      // El objeto ya esta en el bucket pero la fila no apunta a el: seria
      // inalcanzable, asi que lo borramos para no dejar basura huerfana.
      await this.storage.delete(storageKey).catch(e =>
        this.logger.error(`No se pudo limpiar el objeto huerfano ${storageKey}`, e),
      );
      throw error;
    }

    // Ya sustituido en BD: el PDF anterior no lo alcanza nadie
    if (anterior && anterior !== storageKey) {
      await this.storage.delete(anterior).catch(e =>
        this.logger.error(`No se pudo borrar el PDF anterior ${anterior}`, e),
      );
    }

    this.logger.log(`Contrato ${id}: PDF firmado subido`);
    return actualizado;
  }

  /**
   * URL prefirmada del PDF firmado, o null si este contrato no tiene ninguno
   * (en ese caso el controlador genera el PDF al vuelo, como siempre).
   */
  async getUrlDocumentoFirmado(id: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({ where: { id } });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);

    if (!contrato.storageKeyFirmado) return null;

    if (!this.storage.isConfigured) {
      throw new ServiceUnavailableException(
        'El almacenamiento de ficheros no esta configurado (faltan variables SCW_*).',
      );
    }

    return this.storage.getSignedUrl(contrato.storageKeyFirmado, 300);
  }

  async generarPdf(id: string, user: { userId: string; rol: string }): Promise<Buffer> {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id },
      include: CONTRATO_PDF_INCLUDE,
    });
    if (!contrato) throw new NotFoundException(`Contrato ${id} no encontrado`);
    this.checkAcceso(contrato, user);
    return this.pdfService.generarPdf(contrato);
  }

  private checkAcceso(
    contrato: { trabajadorId: string },
    user: { userId: string; rol: string },
  ) {
    if (user.rol !== 'ADMIN' && contrato.trabajadorId !== user.userId) {
      throw new ForbiddenException('No tienes acceso a este contrato');
    }
  }
}
