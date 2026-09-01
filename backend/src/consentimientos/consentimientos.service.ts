import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../auth/audit.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';

type UsuarioPeticion = { userId: string; rol: string };

export interface AlcancesConsentimiento {
  autorizaInformesTerceros: boolean;
  autorizaCoordinacionCentro: boolean;
  autorizaImagenes: boolean;
  consentimientoMenor14: boolean;
}

export interface RegistroConsentimiento extends AlcancesConsentimiento {
  /**
   * Los tutores legales que suscriben el documento. Van varios porque con dos
   * titulares de la patria potestad lo habitual es que firmen los dos.
   */
  firmanteIds: string[];
  /** Version de la plantilla firmada, o una nota si el papel es externo. */
  versionTexto: string;
  /** El PDF firmado que lo acredita. */
  documentoId?: string | null;
  fechaFirma?: Date | null;
  motivoRegistroManual?: string | null;
  ipRegistro?: string | null;
}

/** Lo que el frontend necesita para pintar el panel y el historico. */
const consentimientoSelect = {
  id: true,
  aceptado: true,
  versionTexto: true,
  fechaRegistro: true,
  fechaFirma: true,
  motivoRegistroManual: true,
  autorizaInformesTerceros: true,
  autorizaCoordinacionCentro: true,
  autorizaImagenes: true,
  consentimientoMenor14: true,
  documentoId: true,
  documento: { select: { id: true, nombre: true, mimeType: true } },
  firmantes: {
    select: {
      familiar: {
        select: { id: true, nombre: true, apellidos: true, parentesco: true },
      },
    },
  },
  trabajador: { select: { id: true, nombre: true, apellidos: true } },
} satisfies Prisma.ConsentimientoRgpdSelect;

/**
 * Unico punto del backend que escribe el consentimiento RGPD.
 *
 * La tabla `consentimientos_rgpd` es la fuente de verdad y es de solo anadir:
 * otorgar y revocar son hechos, y un hecho no se edita. Los tres campos
 * `consentimiento*` de `Cliente` son una cache derivada para que los listados y
 * el motor de reglas no tengan que recorrer el historico de cada cliente.
 *
 * Antes esto lo escribian cuatro sitios distintos (el alta, el PATCH del
 * cliente, la ficha y la firma del expediente) y ninguno dejaba la misma
 * evidencia, asi que la pestana del perfil y los listados podian contradecirse.
 */
@Injectable()
export class ConsentimientosService {
  private readonly logger = new Logger(ConsentimientosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notificaciones: NotificacionesService,
  ) {}

  // ============================================================
  // ESCRITURA
  // ============================================================

  /**
   * Deja constancia de que un tutor legal otorgo el consentimiento.
   *
   * Lo llaman dos caminos: la subida del consentimiento de datos firmado desde
   * el expediente, y el registro manual de un papel firmado fuera de la app.
   * Los dos aportan un documento; sin el no hay nada que acredite el hecho.
   */
  async registrar(
    clienteId: string,
    datos: RegistroConsentimiento,
    user: UsuarioPeticion,
  ) {
    await this.assertClienteExiste(clienteId);
    // Devuelve la lista ya sin repetidos: la clave primaria de
    // `consentimiento_firmantes` es compuesta y un duplicado la rompe.
    const firmanteIds = await this.assertTutoresLegales(
      clienteId,
      datos.firmanteIds,
    );

    if (datos.documentoId) {
      const doc = await this.prisma.documentoCliente.findFirst({
        where: { id: datos.documentoId, clienteId },
        select: { id: true },
      });
      if (!doc) {
        throw new BadRequestException(
          'El documento indicado no pertenece a este cliente',
        );
      }
    }

    const registro = await this.prisma.consentimientoRgpd.create({
      data: {
        clienteId,
        trabajadorId: user.userId,
        firmantes: {
          create: firmanteIds.map((familiarId) => ({ familiarId })),
        },
        aceptado: true,
        versionTexto: datos.versionTexto,
        documentoId: datos.documentoId ?? null,
        fechaFirma: datos.fechaFirma ?? null,
        motivoRegistroManual: datos.motivoRegistroManual ?? null,
        ipRegistro: datos.ipRegistro ?? null,
        autorizaInformesTerceros: datos.autorizaInformesTerceros,
        autorizaCoordinacionCentro: datos.autorizaCoordinacionCentro,
        autorizaImagenes: datos.autorizaImagenes,
        consentimientoMenor14: datos.consentimientoMenor14,
      },
      select: consentimientoSelect,
    });

    await this.sincronizarCache(clienteId, true, user.userId);

    await this.audit.registrar({
      evento: 'CONSENTIMIENTO_RGPD',
      userId: user.userId,
      recurso: clienteId,
      metadata: {
        accion: 'OTORGADO',
        consentimientoId: registro.id,
        firmantes: firmanteIds,
        versionTexto: datos.versionTexto,
        documentoId: datos.documentoId ?? null,
        manual: Boolean(datos.motivoRegistroManual),
      },
    });

    this.logger.log(
      `Consentimiento RGPD otorgado para el cliente ${clienteId} (version ${datos.versionTexto})`,
    );
    return registro;
  }

  /**
   * Registra la retirada del consentimiento.
   *
   * No corta el acceso clinico a proposito: la Ley 41/2002 obliga a conservar
   * la historia un minimo de cinco anos, asi que borrar aqui seria ilegal. Lo
   * que si hace es dejarlo asentado, avisar a quien tiene que decidir y
   * devolver al cliente al estado "pendiente" en listados y reglas.
   */
  async revocar(
    clienteId: string,
    motivo: string,
    user: UsuarioPeticion,
    ipRegistro?: string,
  ) {
    await this.assertClienteExiste(clienteId);

    const vigente = await this.prisma.consentimientoRgpd.findFirst({
      where: { clienteId },
      orderBy: { fechaRegistro: 'desc' },
      select: {
        id: true,
        aceptado: true,
        versionTexto: true,
        firmantes: { select: { familiarId: true } },
      },
    });

    if (!vigente || !vigente.aceptado) {
      throw new BadRequestException(
        'Este cliente no tiene un consentimiento vigente que revocar',
      );
    }

    const registro = await this.prisma.consentimientoRgpd.create({
      data: {
        clienteId,
        trabajadorId: user.userId,
        // Se revoca el consentimiento de quienes lo otorgaron, tal cual: el
        // navegador no elige a quien se le retira.
        firmantes: {
          create: vigente.firmantes.map(({ familiarId }) => ({ familiarId })),
        },
        aceptado: false,
        versionTexto: vigente.versionTexto,
        motivoRegistroManual: motivo,
        ipRegistro: ipRegistro ?? null,
      },
      select: consentimientoSelect,
    });

    await this.sincronizarCache(clienteId, false, user.userId);

    await this.audit.registrar({
      evento: 'CONSENTIMIENTO_RGPD',
      userId: user.userId,
      recurso: clienteId,
      metadata: { accion: 'REVOCADO', consentimientoId: registro.id, motivo },
    });

    await this.avisarRevocacion(clienteId, registro.id);

    this.logger.warn(
      `Consentimiento RGPD REVOCADO para el cliente ${clienteId}`,
    );
    return registro;
  }

  /**
   * Mantiene los campos `consentimiento*` de `Cliente` alineados con el ultimo
   * hecho registrado. Es lo unico que leen los chips de los listados y la
   * regla 10 del motor de notificaciones.
   */
  private async sincronizarCache(
    clienteId: string,
    aceptado: boolean,
    trabajadorId: string,
  ) {
    await this.prisma.cliente.update({
      where: { id: clienteId },
      data: {
        consentimientoRgpd: aceptado,
        consentimientoFecha: new Date(),
        consentimientoTrabajadorId: trabajadorId,
      },
    });
  }

  /** Una revocacion la tiene que ver quien responde del tratamiento, hoy. */
  private async avisarRevocacion(clienteId: string, referenciaId: string) {
    try {
      const [cliente, admins] = await Promise.all([
        this.prisma.cliente.findUnique({
          where: { id: clienteId },
          select: { nombre: true, apellidos: true },
        }),
        this.prisma.trabajador.findMany({
          where: { rol: { codigo: 'ADMIN' }, activo: true },
          select: { id: true },
        }),
      ]);
      if (!cliente) return;

      for (const admin of admins) {
        await this.notificaciones.crearSiNoExiste({
          tipo: 'CONSENTIMIENTO_RGPD_PENDIENTE',
          prioridad: 'URGENTE',
          titulo: `Consentimiento RGPD revocado — ${cliente.nombre} ${cliente.apellidos}`,
          mensaje:
            'La familia ha retirado el consentimiento de tratamiento de datos. ' +
            'Revisa qué finalidades pueden seguir amparándose en el contrato y cuáles deben cesar.',
          accionUrl: `/home/listado/${clienteId}/perfil`,
          reglaOrigen: 'CONSENTIMIENTO_RGPD_REVOCADO',
          clienteId,
          referenciaId,
          trabajadorId: admin.id,
        });
      }
    } catch (err: unknown) {
      // Avisar es importante, pero no tanto como dejar la revocacion asentada.
      const motivo = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `No se pudo notificar la revocación del cliente ${clienteId}: ${motivo}`,
      );
    }
  }

  // ============================================================
  // LECTURA
  // ============================================================

  /** El ultimo hecho registrado, con sus alcances. `null` si no hay ninguno. */
  async estadoActual(clienteId: string) {
    const ultimo = await this.prisma.consentimientoRgpd.findFirst({
      where: { clienteId },
      orderBy: { fechaRegistro: 'desc' },
      select: consentimientoSelect,
    });
    if (!ultimo) return null;
    return { ...ultimo, vigente: ultimo.aceptado };
  }

  async historico(clienteId: string) {
    await this.assertClienteExiste(clienteId);
    return this.prisma.consentimientoRgpd.findMany({
      where: { clienteId },
      orderBy: { fechaRegistro: 'desc' },
      select: consentimientoSelect,
    });
  }

  /**
   * Si se puede mandar documentacion del menor al colegio o a otro
   * profesional. Es una casilla propia del documento, no el consentimiento
   * general: se puede consentir el tratamiento y negar la coordinacion.
   */
  async puedeCoordinarConCentro(clienteId: string): Promise<boolean> {
    const estado = await this.estadoActual(clienteId);
    return Boolean(estado?.vigente && estado.autorizaCoordinacionCentro);
  }

  // ============================================================
  // VALIDACIONES
  // ============================================================

  private async assertClienteExiste(clienteId: string) {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, deletedAt: null },
      select: { id: true },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${clienteId} no encontrado`);
    }
  }

  /**
   * Solo un tutor legal puede consentir por un menor (LOPDGDD art. 7). Que el
   * familiar sea el contacto principal no basta.
   *
   * Acepta varios porque con dos titulares de la patria potestad lo normal es
   * que firmen ambos. Es publico para que quien vaya a subir un PDF pueda
   * comprobarlo antes y no dejar el fichero huerfano en el bucket.
   */
  async assertTutoresLegales(
    clienteId: string,
    firmanteIds: string[],
  ): Promise<string[]> {
    const ids = [...new Set(firmanteIds ?? [])];
    if (ids.length === 0) {
      throw new BadRequestException(
        'Indica al menos un tutor legal que haya firmado el consentimiento',
      );
    }

    const familiares = await this.prisma.familiar.findMany({
      where: { id: { in: ids }, clienteId },
      select: { id: true, esTutorLegal: true, nombre: true, apellidos: true },
    });

    if (familiares.length !== ids.length) {
      throw new BadRequestException(
        'Alguno de los firmantes indicados no pertenece a este cliente',
      );
    }

    const noTutores = familiares.filter((f) => !f.esTutorLegal);
    if (noTutores.length > 0) {
      const nombres = noTutores
        .map((f) => `${f.nombre} ${f.apellidos}`)
        .join(', ');
      throw new BadRequestException(
        `${nombres} no consta como tutor legal: solo un tutor legal puede ` +
          'consentir el tratamiento de datos de un menor.',
      );
    }

    return ids;
  }

  /**
   * Cuantos tutores legales tiene el cliente. Sirve para avisar cuando solo
   * firma uno de los dos, que es legitimo (art. 156 CC) pero conviene ver.
   */
  async contarTutoresLegales(clienteId: string): Promise<number> {
    return this.prisma.familiar.count({
      where: { clienteId, esTutorLegal: true },
    });
  }
}
