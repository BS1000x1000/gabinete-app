import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EstadoContrato, EstadoFactura, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { MarcarPagadaDto } from './dto/marcar-pagada.dto';
import { CrearFacturaPuntualDto } from './dto/crear-factura-puntual.dto';
import { toNum } from './facturas.utils';
import { EmailService } from '../common/email/email.service';
import { AuditService } from '../auth/audit.service';
import { facturaInclude, FacturaCompleta } from './facturas.include';

const EXENCION_IVA = 'Exenta de IVA conforme al Art. 20.1.3 LIVA';

/**
 * Cuantos PDF se generan a la vez. Cada uno levanta su propio Chromium, asi que
 * el numero sale de la memoria del contenedor (0,5 vCPU / 2 GB), no de la prisa.
 */
const CONCURRENCIA_PDF = 3;

export interface ContratoAFacturar {
  contratoId: string;
  cliente: string;
  trabajador: string;
  tipoSesion: string;
  importe: number;
}

export interface PreviewGeneracion {
  periodo: string;
  aGenerar: ContratoAFacturar[];
  /** Contratos del periodo que ya tienen factura: no se tocan. */
  yaFacturadas: number;
  importeTotal: number;
}

export interface FalloGeneracion {
  contratoId: string;
  cliente: string;
  motivo: string;
}

export interface ResultadoGeneracion {
  periodo: string;
  creadas: number;
  omitidas: number;
  fallidas: FalloGeneracion[];
}

/**
 * Retencion de IRPF aplicada a las facturas que emite la app.
 *
 * Siempre 0: el receptor es el tutor pagador, un particular, y un particular no
 * practica retencion — solo retienen empresarios, profesionales y entidades. Lo
 * dice el propio diseno del hito R ("la retencion no aplica a familias
 * particulares; el campo se deja por flexibilidad"), pero el codigo venia
 * restando `Trabajador.retencionIrpf` sin mirar a quien facturaba, asi que una
 * ficha con retencion configurada emitia facturas por debajo de lo que se cobra.
 *
 * Las columnas `retencionPorcentaje` / `retencionImporte` de `Factura` y el campo
 * `Trabajador.retencionIrpf` se conservan para el dia que haya un receptor
 * empresa; ese dia esto pasa a depender del tipo de receptor, no a desaparecer.
 */
const RETENCION_IRPF_PARTICULARES = 0;


@Injectable()
export class FacturasService {
  private readonly logger = new Logger(FacturasService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly r2: StorageService,
    private readonly pdfService: FacturasPdfService,
    private readonly emailService: EmailService,
    private readonly audit: AuditService,
  ) {}

  async asignarNumeroCorrelativo(
    tx: Prisma.TransactionClient,
    trabajadorId: string,
    anio: number,
  ): Promise<{ numero: number; numeroFormateado: string }> {
    const contador = await tx.contadorFactura.upsert({
      where: { trabajadorId_anio: { trabajadorId, anio } },
      update: { ultimoNumero: { increment: 1 } },
      create: { trabajadorId, anio, ultimoNumero: 1 },
    });
    return {
      numero: contador.ultimoNumero,
      numeroFormateado: `${contador.ultimoNumero}/${anio}`,
    };
  }

  /**
   * Contratos que deben facturarse en un periodo.
   *
   * `FINALIZADO` entra a propósito: el estado se evalúa hoy, no en el mes pedido,
   * así que filtrar solo por `ACTIVO` hacía imposible recuperar un mes pasado de
   * un cliente que ya causó baja — la factura de marzo de quien se fue en junio
   * no se podía emitir nunca. La ventana de fechas es la que decide de verdad si
   * el contrato estaba vivo en ese periodo. `SUSPENDIDO` y `BORRADOR` no facturan.
   */
  private async contratosDelPeriodo(
    primerDia: Date,
    ultimoDia: Date,
    trabajadorId?: string,
  ) {
    return this.prisma.contratoServicio.findMany({
      where: {
        estado: { in: [EstadoContrato.ACTIVO, EstadoContrato.FINALIZADO] },
        fechaInicio: { lte: ultimoDia },
        OR: [{ fechaFin: null }, { fechaFin: { gte: primerDia } }],
        ...(trabajadorId && { trabajadorId }),
      },
      include: {
        trabajador: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            nombreFiscal: true,
            nifFiscal: true,
            retencionIrpf: true,
          },
        },
        cliente: {
          select: { id: true, nombre: true, apellidos: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /** Rechaza periodos que aún no han empezado. */
  private assertPeriodoNoFuturo(anio: number, mes: number): void {
    const hoy = new Date();
    const periodoPedido = anio * 12 + mes;
    const periodoActual = hoy.getFullYear() * 12 + (hoy.getMonth() + 1);
    if (periodoPedido > periodoActual) {
      throw new BadRequestException(
        'No se pueden generar facturas de un periodo futuro: consumiría números ' +
          'de una serie correlativa que todavía no ha empezado.',
      );
    }
  }

  /**
   * Qué pasaría si se generase ese periodo, sin escribir nada. Es lo que ve el
   * usuario antes de confirmar: hasta ahora el botón era ciego.
   */
  async previsualizarGeneracionMes(
    anio: number,
    mes: number,
    opts?: { trabajadorId?: string },
  ): Promise<PreviewGeneracion> {
    this.assertPeriodoNoFuturo(anio, mes);

    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);
    const periodoFacturado = this.formatPeriodo(anio, mes);

    const contratos = await this.contratosDelPeriodo(primerDia, ultimoDia, opts?.trabajadorId);
    const yaFacturados = await this.contratosYaFacturados(periodoFacturado, contratos);

    const aGenerar = contratos
      .filter((c) => !yaFacturados.has(c.id))
      .map((c) => ({
        contratoId: c.id,
        cliente: `${c.cliente.nombre} ${c.cliente.apellidos}`,
        trabajador: `${c.trabajador.nombre} ${c.trabajador.apellidos}`,
        tipoSesion: c.tipoSesion as string,
        importe: toNum(c.cuotaMensual),
      }));

    return {
      periodo: periodoFacturado,
      aGenerar,
      yaFacturadas: contratos.length - aGenerar.length,
      importeTotal: aGenerar.reduce((s, c) => s + c.importe, 0),
    };
  }

  private async contratosYaFacturados(
    periodoFacturado: string,
    contratos: { id: string }[],
  ): Promise<Set<string>> {
    if (!contratos.length) return new Set();
    const existentes = await this.prisma.factura.findMany({
      where: {
        periodoFacturado,
        contratoId: { in: contratos.map((c) => c.id) },
      },
      select: { contratoId: true },
    });
    return new Set(existentes.map((f) => f.contratoId).filter((id): id is string => id !== null));
  }

  /**
   * Genera las facturas de un periodo. Idempotente: la unicidad
   * `(contratoId, periodoFacturado)` de la BD es la garantía real, la consulta
   * previa solo evita el trabajo.
   *
   * @param opts.trabajadorId  Limita la generación a un autónomo. Cada terapeuta
   *   genera las suyas; sin este campo se genera para todo el gabinete (cron y
   *   palanca manual del ADMIN).
   */
  async generarFacturasMes(
    anio: number,
    mes: number,
    opts?: { trabajadorId?: string; user?: { userId: string } },
  ): Promise<ResultadoGeneracion> {
    this.assertPeriodoNoFuturo(anio, mes);

    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);
    const periodoFacturado = this.formatPeriodo(anio, mes);
    const mesNombre = new Date(anio, mes - 1, 1).toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });

    const contratos = await this.contratosDelPeriodo(primerDia, ultimoDia, opts?.trabajadorId);
    const yaFacturados = await this.contratosYaFacturados(periodoFacturado, contratos);

    const pendientes = contratos.filter((c) => !yaFacturados.has(c.id));
    const fallidas: FalloGeneracion[] = [];
    const nuevas: FacturaCompleta[] = [];

    for (const contrato of pendientes) {
      try {
        nuevas.push(
          await this.crearFacturaDesdeContrato(contrato, mesNombre, periodoFacturado),
        );
      } catch (err: any) {
        // El fallo se recoge en vez de perderse en el log: quien lanza la
        // generación tiene que ver qué no salió, no solo cuántas salieron.
        fallidas.push({
          contratoId: contrato.id,
          cliente: `${contrato.cliente.nombre} ${contrato.cliente.apellidos}`,
          motivo: err?.message ?? String(err),
        });
        this.logger.error(
          `Error generando factura contrato ${contrato.id} para ${periodoFacturado}: ${err}`,
        );
      }
    }

    // El PDF se archiva DESPUÉS de crear todas las filas y con la concurrencia
    // acotada: antes iba disparado dentro del bucle, así que un mes de 40
    // contratos abría 40 Chromium a la vez.
    await this.archivarPdfsEnLote(nuevas);

    const resultado: ResultadoGeneracion = {
      periodo: periodoFacturado,
      creadas: nuevas.length,
      omitidas: contratos.length - pendientes.length,
      fallidas,
    };

    this.logger.log(
      `Mes ${periodoFacturado}: ${resultado.creadas} creadas, ` +
        `${resultado.omitidas} omitidas, ${fallidas.length} fallidas`,
    );

    await this.audit.registrar({
      evento: 'FACTURA_GENERACION',
      userId: opts?.user?.userId,
      recurso: periodoFacturado,
      metadata: {
        creadas: resultado.creadas,
        omitidas: resultado.omitidas,
        fallidas: fallidas.length,
        alcance: opts?.trabajadorId ?? 'gabinete',
        origen: opts?.user ? 'manual' : 'cron',
      },
    });

    return resultado;
  }

  /**
   * Archiva N PDFs con un tope de trabajos en vuelo. Cada `generarPdf` levanta
   * un Chromium propio, así que sin tope un mes grande se lleva por delante la
   * memoria del contenedor.
   */
  private async archivarPdfsEnLote(facturas: FacturaCompleta[]): Promise<void> {
    if (!facturas.length || !this.r2.isConfigured) return;

    const cola = [...facturas];
    const trabajadores = Array.from(
      { length: Math.min(CONCURRENCIA_PDF, cola.length) },
      async () => {
        for (let factura = cola.shift(); factura; factura = cola.shift()) {
          try {
            await this.archivarPdfEnR2(factura);
          } catch (err) {
            // No corta la generación: la factura existe y el cron de
            // reconciliación reintentará el PDF.
            this.logger.error(`Error archivando PDF factura ${factura.id}: ${err}`);
          }
        }
      },
    );
    await Promise.all(trabajadores);
  }

  /**
   * Reintenta el archivado de las facturas que se quedaron sin PDF.
   *
   * Sin esto, un fallo puntual de Puppeteer dejaba `urlPdfR2 = null` para
   * siempre, y como `enviarEmailsPendientes` filtra por `urlPdfR2: { not: null }`
   * esa factura no se enviaba nunca y nadie se enteraba.
   */
  async reconciliarPdfsPendientes(limite = 50): Promise<number> {
    if (!this.r2.isConfigured) return 0;

    const pendientes = await this.prisma.factura.findMany({
      where: { urlPdfR2: null, estado: { not: EstadoFactura.ANULADA } },
      include: facturaInclude,
      orderBy: { createdAt: 'asc' },
      take: limite,
    });
    if (!pendientes.length) return 0;

    await this.archivarPdfsEnLote(pendientes);

    const recuperadas = await this.prisma.factura.count({
      where: { id: { in: pendientes.map((f) => f.id) }, urlPdfR2: { not: null } },
    });
    this.logger.log(
      `Reconciliación PDFs: ${recuperadas}/${pendientes.length} archivadas`,
    );
    return recuperadas;
  }

  private async crearFacturaDesdeContrato(
    contrato: {
      id: string;
      clienteId: string;
      trabajadorId: string;
      cuotaMensual: { toNumber: () => number } | number;
      tipoSesion: string;
      trabajador: { retencionIrpf: { toNumber: () => number } | null | number };
    },
    mesNombre: string,
    periodoFacturado: string,
  ): Promise<FacturaCompleta> {
    const importe = toNum(contrato.cuotaMensual);
    const retencionPct = RETENCION_IRPF_PARTICULARES;
    const retencionImporte = (importe * retencionPct) / 100;
    const total = importe - retencionImporte;
    const concepto = `Cuota mensual de ${contrato.tipoSesion.toLowerCase()} — ${mesNombre}`;

    // La serie correlativa es la del año en que se EXPIDE, no la del periodo que
    // se factura. Numerar por el año del periodo hacía que recuperar 2025-03
    // durante 2026 cogiera el siguiente hueco libre de la serie 2025 y lo
    // estampara con fecha de hoy: un 47/2025 expedido después del 52/2025.
    const fechaEmision = new Date();
    const anioSerie = fechaEmision.getFullYear();

    const factura = await this.prisma.$transaction(async (tx) => {
      const { numero, numeroFormateado } = await this.asignarNumeroCorrelativo(
        tx,
        contrato.trabajadorId,
        anioSerie,
      );
      return tx.factura.create({
        data: {
          numero,
          numeroFormateado,
          anio: anioSerie,
          trabajadorId: contrato.trabajadorId,
          clienteId: contrato.clienteId,
          contratoId: contrato.id,
          fechaEmision,
          periodoFacturado,
          concepto,
          importe,
          ivaPorcentaje: 0,
          ivaImporte: 0,
          retencionPorcentaje: retencionPct,
          retencionImporte,
          exencionIvaTexto: EXENCION_IVA,
          total,
          estado: EstadoFactura.PENDIENTE,
        },
        include: facturaInclude,
      });
    });

    return factura;
  }

  private async archivarPdfEnR2(factura: FacturaCompleta): Promise<void> {
    if (!this.r2.isConfigured) {
      this.logger.warn(`R2 no configurado — PDF factura ${factura.id} no archivado`);
      return;
    }
    const buffer = await this.pdfService.generarPdf(factura);
    const key = `facturas/${factura.trabajadorId}/${factura.anio}/${factura.numero}.pdf`;
    const url = await this.r2.upload(key, buffer, 'application/pdf');
    if (url) {
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { urlPdfR2: key },
      });
    }
  }

  async generarPdfBuffer(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<Buffer> {
    const factura = await this.findOneOrThrow(facturaId, user);
    return this.pdfService.generarPdf(factura);
  }

  async regenerarPdf(facturaId: string, user: { userId: string; rol: string }): Promise<void> {
    const factura = await this.findOneOrThrow(facturaId, user);
    await this.archivarPdfEnR2(factura);
  }

  async findAll(
    user: { userId: string; rol: string },
    filters?: {
      anio?: number;
      mes?: number;
      clienteId?: string;
      estado?: EstadoFactura;
      /// Las pantallas "Mis..." lo mandan siempre: el ADMIN tambien es un
      /// autonomo con su propio circuito fiscal, y sus numeros no deben
      /// mezclarse con los de los demas. La vista global es Supervision, que
      /// es la unica que llama sin este flag.
      soloMias?: boolean;
    },
  ) {
    const where: Prisma.FacturaWhereInput = {};

    if (user.rol !== 'ADMIN' || filters?.soloMias) {
      where.trabajadorId = user.userId;
    }

    if (filters?.anio) where.anio = filters.anio;
    if (filters?.clienteId) where.clienteId = filters.clienteId;
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.mes) {
      where.periodoFacturado = this.formatPeriodo(
        filters.anio ?? new Date().getFullYear(),
        filters.mes,
      );
    }

    return this.prisma.factura.findMany({
      where,
      include: facturaInclude,
      orderBy: [{ anio: 'desc' }, { numero: 'desc' }],
    });
  }

  async findOne(facturaId: string, user: { userId: string; rol: string }) {
    return this.findOneOrThrow(facturaId, user);
  }

  private async findOneOrThrow(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<FacturaCompleta> {
    const factura = await this.prisma.factura.findUnique({
      where: { id: facturaId },
      include: facturaInclude,
    });

    if (!factura) throw new NotFoundException(`Factura ${facturaId} no encontrada`);

    if (user.rol !== 'ADMIN' && factura.trabajadorId !== user.userId) {
      throw new NotFoundException(`Factura ${facturaId} no encontrada`);
    }

    return factura;
  }

  async marcarPagada(
    facturaId: string,
    dto: MarcarPagadaDto,
    user: { userId: string; rol: string },
  ) {
    const factura = await this.findOneOrThrow(facturaId, user);

    if (factura.estado === EstadoFactura.ANULADA) {
      throw new ForbiddenException('No se puede marcar como pagada una factura anulada');
    }

    const actualizada = await this.prisma.factura.update({
      where: { id: facturaId },
      data: {
        estado: EstadoFactura.PAGADA,
        fechaPago: new Date(dto.fechaPago),
        metodoPago: dto.metodoPago ?? null,
      },
      include: facturaInclude,
    });

    await this.audit.registrar({
      evento: 'FACTURA',
      userId: user.userId,
      recurso: facturaId,
      metadata: {
        accion: 'MARCADA_PAGADA',
        numeroFormateado: actualizada.numeroFormateado,
        fechaPago: dto.fechaPago,
        metodoPago: dto.metodoPago ?? null,
      },
    });

    return actualizada;
  }

  async anular(facturaId: string, user: { userId: string; rol: string }) {
    const factura = await this.findOneOrThrow(facturaId, user);

    if (factura.estado === EstadoFactura.ANULADA) {
      throw new ForbiddenException('La factura ya está anulada');
    }

    const anulada = await this.prisma.factura.update({
      where: { id: facturaId },
      data: { estado: EstadoFactura.ANULADA },
      include: facturaInclude,
    });

    await this.audit.registrar({
      evento: 'FACTURA',
      userId: user.userId,
      recurso: facturaId,
      metadata: {
        accion: 'ANULADA',
        numeroFormateado: anulada.numeroFormateado,
        total: anulada.total.toString(),
        emailEnviado: anulada.emailEnviado,
      },
    });

    return anulada;
  }

  async crearFacturaPuntual(
    dto: CrearFacturaPuntualDto,
    user: { userId: string; rol: string },
  ) {
    const trabajadorId = user.userId;
    const trabajador = await this.prisma.trabajador.findUnique({
      where: { id: trabajadorId },
      select: { retencionIrpf: true },
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador ${trabajadorId} no encontrado`);
    }

    const anio = new Date(dto.fechaEmision).getFullYear();
    const retencionPct = RETENCION_IRPF_PARTICULARES;
    const retencionImporte = (dto.importe * retencionPct) / 100;
    const total = dto.importe - retencionImporte;

    const factura = await this.prisma.$transaction(async (tx) => {
      const { numero, numeroFormateado } = await this.asignarNumeroCorrelativo(
        tx,
        trabajadorId,
        anio,
      );
      return tx.factura.create({
        data: {
          numero,
          numeroFormateado,
          anio,
          trabajadorId,
          clienteId: dto.clienteId,
          contratoId: dto.contratoId ?? null,
          fechaEmision: new Date(dto.fechaEmision),
          periodoFacturado: dto.periodoFacturado,
          concepto: dto.concepto,
          importe: dto.importe,
          ivaPorcentaje: 0,
          ivaImporte: 0,
          retencionPorcentaje: retencionPct,
          retencionImporte,
          exencionIvaTexto: EXENCION_IVA,
          total,
          estado: EstadoFactura.PENDIENTE,
        },
        include: facturaInclude,
      });
    });

    this.archivarPdfEnR2(factura).catch((err) =>
      this.logger.error(`Error generando PDF factura puntual ${factura.id}: ${err}`),
    );

    return factura;
  }

  private formatPeriodo(anio: number, mes: number): string {
    return `${anio}-${String(mes).padStart(2, '0')}`;
  }

  async enviarEmailsPendientes(anio: number, mes: number): Promise<number> {
    const periodoFacturado = this.formatPeriodo(anio, mes);

    const facturas = await this.prisma.factura.findMany({
      where: {
        emailEnviado: false,
        periodoFacturado,
        urlPdfR2: { not: null },
        estado: { not: EstadoFactura.ANULADA },
      },
      include: facturaInclude,
    });

    let enviados = 0;
    for (const factura of facturas) {
      const ok = await this.enviarEmailFactura(factura);
      if (ok) enviados++;
    }

    this.logger.log(`Emails factura ${periodoFacturado}: ${enviados}/${facturas.length} enviados`);
    return enviados;
  }

  async reenviarEmail(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<{ enviado: boolean }> {
    const factura = await this.findOneOrThrow(facturaId, user);
    const enviado = await this.enviarEmailFactura(factura);
    return { enviado };
  }

  private async enviarEmailFactura(factura: FacturaCompleta): Promise<boolean> {
    if (!this.emailService.isConfigured) return false;

    const emailDestino = factura.cliente.emailFacturacion ?? null;

    if (!emailDestino) {
      this.logger.warn(`Factura ${factura.id}: cliente sin email — no se envía`);
      return false;
    }

    const replyTo =
      factura.trabajador.emailFacturacion ?? factura.trabajador.email;

    const nombreTrabajador =
      factura.trabajador.nombreFiscal ??
      `${factura.trabajador.nombre} ${factura.trabajador.apellidos}`;

    const pdfBuffer = await this.pdfService.generarPdf(factura).catch((err) => {
      this.logger.error(`Error generando PDF para email factura ${factura.id}: ${err}`);
      return null;
    });
    if (!pdfBuffer) return false;

    const enviado = await this.emailService.sendFacturaEmail({
      to: emailDestino,
      replyTo,
      nombreTrabajador,
      numeroFormateado: factura.numeroFormateado,
      periodoFacturado: factura.periodoFacturado,
      concepto: factura.concepto,
      total: toNum(factura.total).toFixed(2).replace('.', ','),
      pdfBuffer,
      pdfFilename: `Factura_${factura.numeroFormateado.replace('/', '-')}.pdf`,
    });

    if (enviado) {
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: { emailEnviado: true, fechaEnvioEmail: new Date() },
      });
    }

    return enviado;
  }
}
