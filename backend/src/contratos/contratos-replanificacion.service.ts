import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { AmbitoFestivo, EstadoContrato, EstadoSesion, ModalidadSesion } from '@prisma/client';
import { getISOWeek, getISOWeekYear } from 'date-fns';
import { PrismaService } from '../prisma/prisma.service';
import { ReplanificarContratoDto } from './dto/replanificar-contrato.dto';
import { PreviewReplanificacion } from './replanificacion.types';
import {
  addMonths,
  añosCubiertos,
  combinarFechaHora,
  esFestivo,
  enVacaciones,
  generarFechasRecurrentes,
} from './contratos.utils';
import { HORIZONTE_GENERACION_MESES } from './contratos.constants';

type Objetivo = { inicio: Date; fin: Date; modalidad: ModalidadSesion };
type SesionActual = { id: string; fechaHoraInicio: Date; fechaHoraFin: Date };

@Injectable()
export class ContratosReplanificacionService {
  private readonly logger = new Logger(ContratosReplanificacionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // VISTA PREVIA
  // ============================================================

  async preview(
    contratoId: string,
    dto: ReplanificarContratoDto,
    user: { userId: string; rol: string },
  ): Promise<PreviewReplanificacion> {
    const contrato = await this.cargarContrato(contratoId, user);

    // Desde mañana: lo de hoy ya está en marcha y mover una cita del mismo día
    // por un cambio de contrato sería una sorpresa desagradable para la familia.
    const desde = new Date();
    desde.setDate(desde.getDate() + 1);
    desde.setHours(0, 0, 0, 0);

    // Se replanifica SOLO hasta donde ya hay sesiones generadas, nunca más allá.
    // Extender el horizonte es trabajo del cron de la ventana móvil: un cambio de
    // horario debe recolocar lo que existe, no adelantar un año de citas.
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const finVentana =
      contrato.generadoHasta ?? addMonths(hoy, HORIZONTE_GENERACION_MESES);

    const hasta = contrato.fechaFin && contrato.fechaFin < finVentana
      ? contrato.fechaFin
      : finVentana;

    if (hasta <= desde) {
      throw new BadRequestException(
        'El contrato termina antes de mañana: no hay sesiones futuras que replanificar',
      );
    }

    const { festivos, vacaciones } = await this.cargarCalendario(contrato, desde, hasta);

    // ── Lo que hay hoy ────────────────────────────────────────
    // Solo sesiones de ESTE contrato, programadas y futuras. Todo lo demás
    // (completadas, canceladas, sueltas, pasadas) queda fuera por construcción.
    const actuales: SesionActual[] = await this.prisma.sesion.findMany({
      where: {
        contratoId,
        estado: EstadoSesion.PROGRAMADA,
        fechaHoraInicio: { gte: desde, lte: hasta },
      },
      orderBy: { fechaHoraInicio: 'asc' },
      select: { id: true, fechaHoraInicio: true, fechaHoraFin: true },
    });

    // ── Lo que debería haber con el horario nuevo ─────────────
    const omitidas: PreviewReplanificacion['omitidas'] = [];
    const objetivos: Objetivo[] = [];

    for (const slot of dto.slots) {
      for (const fecha of generarFechasRecurrentes(desde, hasta, slot.diaSemana)) {
        const festivo = festivos.find((f) => esFestivo(fecha, [f]));
        if (festivo) {
          omitidas.push({
            fecha: fecha.toISOString(),
            motivo: 'FESTIVO',
            detalle: festivo.descripcion ?? 'Festivo',
          });
          continue;
        }
        if (enVacaciones(fecha, vacaciones)) {
          omitidas.push({
            fecha: fecha.toISOString(),
            motivo: 'VACACIONES',
            detalle: 'Vacaciones del terapeuta',
          });
          continue;
        }
        objetivos.push({
          inicio: combinarFechaHora(fecha, slot.horaInicio),
          fin: combinarFechaHora(fecha, slot.horaFin),
          modalidad: slot.modalidad ?? ModalidadSesion.PRESENCIAL,
        });
      }
    }
    objetivos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());

    const { mover, crear, cancelar } = this.emparejar(actuales, objetivos);

    const choques = await this.detectarChoques(
      contrato,
      [...mover.map((m) => new Date(m.a)), ...crear.map((c) => new Date(c.inicio))],
      actuales.map((s) => s.id),
    );

    const intocables = await this.contarIntocables(contrato, desde);

    const preview: Omit<PreviewReplanificacion, 'hash'> = {
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      mover,
      crear,
      cancelar,
      omitidas,
      choques,
      intocables,
      resumen: {
        seMueven: mover.length,
        seCrean: crear.length,
        seCancelan: cancelar.length,
        seCancelanPorVentana: cancelar.filter((c) => c.motivo === 'FIN_DE_VENTANA').length,
        enFestivo: omitidas.filter((o) => o.motivo === 'FESTIVO').length,
        enVacaciones: omitidas.filter((o) => o.motivo === 'VACACIONES').length,
        choques: choques.length,
      },
    };

    return { ...preview, hash: this.firmar(preview) };
  }

  // ============================================================
  // APLICAR
  // ============================================================

  async aplicar(
    contratoId: string,
    dto: ReplanificarContratoDto,
    user: { userId: string; rol: string },
  ) {
    if (!dto.hashPrevisualizacion) {
      throw new BadRequestException(
        'Falta la firma de la vista previa. Vuelve a previsualizar antes de aplicar.',
      );
    }

    // Se recalcula a propósito: si algo cambió desde la previsualización (alguien
    // completó o canceló una sesión), el plan que se vio ya no es el que se
    // aplicaría, y aplicar a ciegas movería cosas que el usuario no aprobó.
    const plan = await this.preview(contratoId, dto, user);
    if (plan.hash !== dto.hashPrevisualizacion) {
      throw new ConflictException(
        'La agenda ha cambiado desde que viste la vista previa. Revísala de nuevo antes de aplicar.',
      );
    }

    const contrato = await this.cargarContrato(contratoId, user);

    await this.prisma.$transaction(async (tx) => {
      // 1. El horario nuevo pasa a ser el del contrato
      await tx.contratoSlot.deleteMany({ where: { contratoId } });
      await tx.contratoSlot.createMany({
        data: dto.slots.map((s) => ({
          contratoId,
          diaSemana: s.diaSemana,
          horaInicio: s.horaInicio,
          horaFin: s.horaFin,
          duracionMinutos: s.duracionMinutos,
          modalidad: s.modalidad ?? ModalidadSesion.PRESENCIAL,
        })),
      });

      // 2. Mover conserva la identidad de la sesión: sus notas y su historia
      //    siguen ahí. Es la diferencia con el viejo borrar-y-recrear.
      for (const m of plan.mover) {
        await tx.sesion.update({
          where: { id: m.sesionId },
          data: {
            fechaHoraInicio: new Date(m.a),
            fechaHoraFin: new Date(m.finNuevo),
          },
        });
      }

      // 3. Las que sobran se CANCELAN, no se borran: existieron y se comunicaron
      //    a la familia, así que deben dejar rastro.
      if (plan.cancelar.length) {
        await tx.sesion.updateMany({
          where: { id: { in: plan.cancelar.map((c) => c.sesionId) } },
          data: { estado: EstadoSesion.CANCELADA_CON_AVISO },
        });
      }

      if (plan.crear.length) {
        await tx.sesion.createMany({
          data: plan.crear.map((c) => ({
            clienteId: contrato.clienteId,
            trabajadorId: contrato.trabajadorId,
            contratoId,
            tipoSesion: contrato.tipoSesion,
            modalidad: c.modalidad,
            fechaHoraInicio: new Date(c.inicio),
            fechaHoraFin: new Date(c.fin),
            estado: EstadoSesion.PROGRAMADA,
          })),
          skipDuplicates: true,
        });
      }

      // El PDF firmado deja de reflejar el horario real
      if (contrato.storageKeyFirmado) {
        await tx.contratoServicio.update({
          where: { id: contratoId },
          data: { resumenModificadoAt: new Date() },
        });
      }
    });

    this.logger.warn(
      `Contrato ${contratoId} replanificado por ${user.userId}: ` +
        `${plan.resumen.seMueven} movidas, ${plan.resumen.seCrean} creadas, ` +
        `${plan.resumen.seCancelan} canceladas`,
    );

    return { aplicado: plan.resumen };
  }

  // ============================================================
  // INTERNOS
  // ============================================================

  /**
   * Empareja lo que hay con lo que debería haber, **semana ISO a semana ISO**.
   *
   * Se empareja por semana y no cronológicamente porque es lo que espera una
   * familia: «la sesión de esta semana pasa del miércoles al viernes». Un
   * emparejamiento global desplazaría toda la serie en cascada al añadir o
   * quitar un día, y la última sesión desaparecería sin motivo aparente.
   */
  private emparejar(actuales: SesionActual[], objetivos: Objetivo[]) {
    const claveSemana = (d: Date) => `${getISOWeekYear(d)}-${getISOWeek(d)}`;

    const ultimoObjetivo = objetivos.length
      ? objetivos[objetivos.length - 1].inicio.getTime()
      : null;

    const porSemanaActual = new Map<string, SesionActual[]>();
    for (const s of actuales) {
      const k = claveSemana(s.fechaHoraInicio);
      if (!porSemanaActual.has(k)) porSemanaActual.set(k, []);
      porSemanaActual.get(k)!.push(s);
    }

    const porSemanaObjetivo = new Map<string, Objetivo[]>();
    for (const o of objetivos) {
      const k = claveSemana(o.inicio);
      if (!porSemanaObjetivo.has(k)) porSemanaObjetivo.set(k, []);
      porSemanaObjetivo.get(k)!.push(o);
    }

    const mover: PreviewReplanificacion['mover'] = [];
    const crear: PreviewReplanificacion['crear'] = [];
    const cancelar: PreviewReplanificacion['cancelar'] = [];

    const semanas = new Set([...porSemanaActual.keys(), ...porSemanaObjetivo.keys()]);

    for (const semana of semanas) {
      const enSemana = [...(porSemanaActual.get(semana) ?? [])].sort(
        (a, b) => a.fechaHoraInicio.getTime() - b.fechaHoraInicio.getTime(),
      );
      const objetivosSemana = [...(porSemanaObjetivo.get(semana) ?? [])].sort(
        (a, b) => a.inicio.getTime() - b.inicio.getTime(),
      );

      const n = Math.min(enSemana.length, objetivosSemana.length);
      for (let i = 0; i < n; i++) {
        const sesion = enSemana[i];
        const objetivo = objetivosSemana[i];
        // Si ya está donde debe, no se toca
        if (sesion.fechaHoraInicio.getTime() === objetivo.inicio.getTime()) continue;
        mover.push({
          sesionId: sesion.id,
          de: sesion.fechaHoraInicio.toISOString(),
          a: objetivo.inicio.toISOString(),
          finNuevo: objetivo.fin.toISOString(),
        });
      }

      for (let i = n; i < objetivosSemana.length; i++) {
        crear.push({
          inicio: objetivosSemana[i].inicio.toISOString(),
          fin: objetivosSemana[i].fin.toISOString(),
          modalidad: objetivosSemana[i].modalidad,
        });
      }
      for (let i = n; i < enSemana.length; i++) {
        // Si la sesion cae DESPUES del ultimo objetivo, su sustituta no es que no
        // exista: es que queda fuera de los meses ya generados y la creara el cron
        // al extender la ventana. Decirlo evita que parezca una baja real.
        const esBorde =
          ultimoObjetivo !== null &&
          enSemana[i].fechaHoraInicio.getTime() > ultimoObjetivo;

        cancelar.push({
          sesionId: enSemana[i].id,
          inicio: enSemana[i].fechaHoraInicio.toISOString(),
          motivo: esBorde ? 'FIN_DE_VENTANA' : 'SLOT_ELIMINADO',
        });
      }
    }

    return { mover, crear, cancelar };
  }

  /** Choques con otras sesiones. Se informan; nunca bloquean. */
  private async detectarChoques(
    contrato: { trabajadorId: string; clienteId: string },
    destinos: Date[],
    idsPropias: string[],
  ): Promise<PreviewReplanificacion['choques']> {
    if (!destinos.length) return [];

    const candidatas = await this.prisma.sesion.findMany({
      where: {
        id: { notIn: idsPropias },
        estado: EstadoSesion.PROGRAMADA,
        fechaHoraInicio: { in: destinos },
        OR: [{ trabajadorId: contrato.trabajadorId }, { clienteId: contrato.clienteId }],
      },
      select: {
        id: true,
        fechaHoraInicio: true,
        trabajadorId: true,
        cliente: { select: { nombre: true, apellidos: true } },
      },
    });

    return candidatas.map((c) => ({
      inicio: c.fechaHoraInicio.toISOString(),
      conSesionId: c.id,
      descripcion:
        c.trabajadorId === contrato.trabajadorId
          ? `El terapeuta ya tiene sesión con ${c.cliente.nombre} ${c.cliente.apellidos}`
          : 'El cliente ya tiene otra sesión a esa hora',
    }));
  }

  private async contarIntocables(
    contrato: { id: string; clienteId: string },
    desde: Date,
  ): Promise<PreviewReplanificacion['intocables']> {
    const [completadas, canceladas, sueltas, pasadas] = await Promise.all([
      this.prisma.sesion.count({
        where: { contratoId: contrato.id, estado: EstadoSesion.COMPLETADA },
      }),
      this.prisma.sesion.count({
        where: {
          contratoId: contrato.id,
          estado: {
            in: [EstadoSesion.CANCELADA_CON_AVISO, EstadoSesion.CANCELADA_SIN_AVISO],
          },
        },
      }),
      this.prisma.sesion.count({
        where: {
          clienteId: contrato.clienteId,
          contratoId: null,
          estado: EstadoSesion.PROGRAMADA,
          fechaHoraInicio: { gte: desde },
        },
      }),
      this.prisma.sesion.count({
        where: {
          contratoId: contrato.id,
          estado: EstadoSesion.PROGRAMADA,
          fechaHoraInicio: { lt: desde },
        },
      }),
    ]);

    return { completadas, canceladas, sueltas, pasadas };
  }

  private async cargarContrato(contratoId: string, user: { userId: string; rol: string }) {
    const contrato = await this.prisma.contratoServicio.findUnique({
      where: { id: contratoId },
      include: { cliente: { select: { provincia: true } } },
    });
    if (!contrato) throw new NotFoundException(`Contrato ${contratoId} no encontrado`);

    if (user.rol !== 'ADMIN' && contrato.trabajadorId !== user.userId) {
      throw new NotFoundException(`Contrato ${contratoId} no encontrado`);
    }
    if (contrato.estado === EstadoContrato.FINALIZADO) {
      throw new BadRequestException('No se puede replanificar un contrato finalizado');
    }
    return contrato;
  }

  private async cargarCalendario(
    contrato: { trabajadorId: string; cliente: { provincia: string } },
    desde: Date,
    hasta: Date,
  ) {
    const anos = añosCubiertos(desde, hasta);
    const provincia = contrato.cliente.provincia;

    const [festivos, vacaciones] = await Promise.all([
      this.prisma.festivo.findMany({
        where: {
          anio: { in: anos },
          OR: [
            { ambito: AmbitoFestivo.NACIONAL },
            { ambito: AmbitoFestivo.AUTONOMICO, ccaa: provincia },
            { ambito: AmbitoFestivo.LOCAL, provincia },
          ],
        },
      }),
      this.prisma.periodoVacaciones.findMany({
        where: { trabajadorId: contrato.trabajadorId },
      }),
    ]);

    return { festivos, vacaciones };
  }

  /** Firma estable del plan, para detectar que la agenda cambió por debajo. */
  private firmar(preview: Omit<PreviewReplanificacion, 'hash'>): string {
    return createHash('sha256')
      .update(JSON.stringify({ m: preview.mover, c: preview.crear, x: preview.cancelar }))
      .digest('hex')
      .slice(0, 16);
  }
}
