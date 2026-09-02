import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  EstadoContrato,
  EstadoFactura,
  EstadoSesion,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { FacturasPdfService } from './facturas-pdf.service';
import { MarcarPagadaDto } from './dto/marcar-pagada.dto';
import { CrearFacturaPuntualDto } from './dto/crear-factura-puntual.dto';
import {
  motivoSinDatosEmisor,
  motivoSinDatosFiscales,
  toNum,
} from './facturas.utils';
import { EmailService } from '../common/email/email.service';
import { AuditService } from '../auth/audit.service';
import { facturaInclude, FacturaCompleta } from './facturas.include';

/**
 * Texto de exencion que se imprime en la factura, literal y tal cual lo dicto la
 * gestoria (2026-09-02).
 *
 * Es el **20.Uno.10** (clases a titulo particular sobre materias incluidas en los
 * planes de estudio), NO el 20.Uno.3 que habia antes. El 3 exime la asistencia de
 * profesionales **sanitarios de la LOPS** (Ley 44/2003) y Belen es pedagoga, que
 * no esta en esa lista: el articulo que citaba la factura no le amparaba.
 *
 * Sigue siendo una constante global, y de momento es correcto: `exencionIvaTexto`
 * se guarda **por factura**, asi que cada una congela el texto con el que se
 * expidio y cambiar esto no reescribe el historico. El dia que entre una segunda
 * autonoma con otro regimen —una logopeda SI es sanitaria de la LOPS y iria por el
 * 20.Uno.3— esto pasa a ser un campo de `Trabajador` sin migrar nada.
 */
const EXENCION_IVA =
  'Factura exenta de I.V.A (Artículo 20. Uno. 10º. Ley 37/1992)';

/**
 * Cuantos PDF se generan a la vez. Cada uno levanta su propio Chromium, asi que
 * el numero sale de la memoria del contenedor (0,5 vCPU / 2 GB), no de la prisa.
 */
const CONCURRENCIA_PDF = 3;

/**
 * Concepto de la cuota mensual, literal y fijo.
 *
 * Es el texto del modelo de factura del gabinete y lo pide la propia profesional:
 * describe el servicio real prestado, que es lo que exige el RD 1619/2012 art. 6,
 * y encaja con el articulo de exencion que aplica (20.Uno.10, clases a titulo
 * particular) — cosa que "Cuota mensual de pedagogia" no hacia.
 *
 * De paso quita un problema de RGPD que este mismo repo tenia apuntado: el
 * concepto viejo nombraba el TIPO DE TERAPIA, asi que el libro que se manda a la
 * gestoria revelaba que tratamiento recibe cada menor. Este no. El mes ya viaja
 * en `periodoFacturado`, que es donde tiene que estar, y la plantilla lo pinta en
 * portada ("SEPTIEMBRE 2026").
 *
 * Fijo y global por el mismo motivo que `EXENCION_IVA`: `concepto` se guarda por
 * factura, asi que cada una congela el suyo. El dia que otra autonoma preste otro
 * servicio, esto pasa a depender del trabajador sin migrar historico.
 */
const CONCEPTO_CUOTA_MENSUAL =
  'Servicios profesionales de reeducación pedagógica y apoyo al aprendizaje adaptado al currículo escolar';

/**
 * El calendario de facturacion sale de la clausula 3 del contrato que firma la
 * familia, que dice dos cosas que el generador ignoraba por completo:
 *
 *   "...con la excepcion del mes de julio, que se facturara de forma proporcional
 *   al numero de sesiones efectivamente impartidas. El mes de agosto no sera
 *   objeto de facturacion."
 *
 * Sin esto, un contrato indefinido (`fechaFin = null`) emitia en julio y agosto
 * la cuota entera, automaticamente y en contra del documento firmado.
 */
const MES_AGOSTO = 8;
const MES_JULIO = 7;

/**
 * Sesiones que cubre una cuota mensual completa, por cada sesion semanal del
 * contrato. Cuatro, es decir "la cuota cubre cuatro semanas".
 *
 * El contrato habla de "tarifa plana mensual" y NO fija precio por sesion, asi
 * que el divisor es una decision, no un dato: se eligio 4 por ser el mas facil de
 * explicar a una familia y el que no cambia de un mes a otro. Con cuota 180 y una
 * sesion semanal, la sesion sale a 45,00 EUR.
 */
const SESIONES_POR_CUOTA = 4;

/**
 * Que cuenta como "sesion efectivamente impartida" al prorratear julio.
 *
 * `CANCELADA_SIN_AVISO` entra porque la clausula 5 lo permite expresamente
 * ("las cancelaciones solicitadas por la familia con menos de cuarenta y ocho
 * horas de antelacion podran facturarse integramente como sesion realizada") y la
 * 6 remata que una sesion no recuperada en plazo "se considerara realizada a
 * todos los efectos". Dejarla fuera cobraria de menos justo en el caso que el
 * contrato protege. `CANCELADA_CON_AVISO`, `VACACIONES` y `PROGRAMADA` no cuentan.
 */
const ESTADOS_SESION_IMPARTIDA: EstadoSesion[] = [
  EstadoSesion.COMPLETADA,
  EstadoSesion.CANCELADA_SIN_AVISO,
];

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
  /**
   * Contratos que NO se van a facturar por faltar los datos fiscales del tutor
   * pagador. Se enseñan antes de generar para que se puedan completar: si no,
   * el usuario solo se enteraba al abrir el libro y ver la columna NIF vacia.
   */
  bloqueadas: FalloGeneracion[];
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
            // El emisor tambien es obligatorio (RD 1619/2012 art. 6). Se trae
            // por el mismo motivo que el destinatario: bloquear antes de quemar
            // un numero de la serie correlativa.
            direccionFiscal: true,
            codigoPostalFiscal: true,
            ciudadFiscal: true,
          },
        },
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            // El destinatario fiscal. Se trae aqui para poder bloquear antes de
            // quemar un numero de la serie correlativa.
            nombreTutorPagador: true,
            nifTutorPagador: true,
          },
        },
        // Cuantas sesiones semanales tiene el contrato: es el divisor del
        // prorrateo de julio (`SESIONES_POR_CUOTA` por cada sesion semanal).
        _count: { select: { slots: true } },
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
   * Julio se factura A MES VENCIDO, no por adelantado como el resto.
   *
   * Es consecuencia directa de prorratearlo por sesiones impartidas: el 1 de
   * julio todavia no se ha dado ninguna, asi que generarlo entonces emitiria
   * facturas de 0,00 EUR — y el numero de la serie ya estaria quemado. Se emite
   * cuando el mes ha terminado.
   */
  private assertJulioCerrado(anio: number, mes: number): void {
    if (mes !== MES_JULIO) return;
    const hoy = new Date();
    const finDeJulio = new Date(anio, MES_JULIO, 1);
    if (hoy < finDeJulio) {
      throw new BadRequestException(
        'Julio se factura a mes vencido, porque su importe depende de las ' +
          'sesiones efectivamente impartidas (cláusula 3 del contrato). ' +
          'Se puede generar a partir del 1 de agosto.',
      );
    }
  }

  /**
   * Sesiones impartidas en el periodo, por contrato. Una sola consulta agregada
   * en vez de una por contrato: en julio se piden todos los del gabinete a la vez.
   */
  private async sesionesImpartidasPorContrato(
    contratoIds: string[],
    primerDia: Date,
    ultimoDia: Date,
  ): Promise<Map<string, number>> {
    if (contratoIds.length === 0) return new Map();
    const filas = await this.prisma.sesion.groupBy({
      by: ['contratoId'],
      where: {
        contratoId: { in: contratoIds },
        estado: { in: ESTADOS_SESION_IMPARTIDA },
        fechaHoraInicio: { gte: primerDia, lte: ultimoDia },
      },
      _count: { _all: true },
    });
    return new Map(
      filas
        .filter((f): f is typeof f & { contratoId: string } => !!f.contratoId)
        .map((f) => [f.contratoId, f._count._all]),
    );
  }

  /**
   * Lo que se factura de ese contrato en ese mes. La cuota entera salvo en julio,
   * que va prorrateado por sesiones impartidas (cláusula 3).
   *
   * Se redondea a dos decimales aquí y no al pintar: el importe que se guarda es
   * el que se cobra, y un `Decimal(10,2)` truncaría en silencio la diferencia.
   */
  private importeAFacturar(
    contrato: {
      cuotaMensual: { toNumber: () => number } | number;
      _count: { slots: number };
    },
    mes: number,
    sesionesImpartidas: number,
  ): number {
    const cuota = toNum(contrato.cuotaMensual);
    if (mes !== MES_JULIO) return cuota;

    const sesionesSemanales = contrato._count.slots || 1;
    const precioSesion = cuota / (sesionesSemanales * SESIONES_POR_CUOTA);
    return Math.round(precioSesion * sesionesImpartidas * 100) / 100;
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
    this.assertJulioCerrado(anio, mes);

    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);
    const periodoFacturado = this.formatPeriodo(anio, mes);

    const contratos = await this.contratosDelPeriodo(
      primerDia,
      ultimoDia,
      opts?.trabajadorId,
    );
    const yaFacturados = await this.contratosYaFacturados(
      periodoFacturado,
      contratos,
    );

    const pendientes = contratos.filter((c) => !yaFacturados.has(c.id));

    const aGenerar: ContratoAFacturar[] = [];
    const bloqueadas: FalloGeneracion[] = [];

    // Agosto no se factura. Se enseña en `bloqueadas` en vez de devolver una
    // lista vacía sin más: quien pulsa "generar" tiene que leer POR QUÉ no sale
    // nada, o parecerá que la pantalla está rota.
    if (mes === MES_AGOSTO) {
      return {
        periodo: periodoFacturado,
        aGenerar: [],
        yaFacturadas: contratos.length - pendientes.length,
        bloqueadas: pendientes.map((c) => ({
          contratoId: c.id,
          cliente: this.nombreCliente(c.cliente),
          motivo:
            'Agosto no se factura: la cláusula 3 del contrato lo excluye por corresponder al periodo vacacional de la profesional.',
        })),
        importeTotal: 0,
      };
    }

    const sesionesPorContrato =
      mes === MES_JULIO
        ? await this.sesionesImpartidasPorContrato(
            pendientes.map((c) => c.id),
            primerDia,
            ultimoDia,
          )
        : new Map<string, number>();

    for (const c of pendientes) {
      // Emisor primero: si a la profesional le faltan sus datos fiscales no hay
      // ninguna factura posible, asi que enterarse antes ahorra revisar cliente
      // por cliente un bloqueo que en realidad es uno solo.
      const motivo =
        motivoSinDatosEmisor(c.trabajador) ?? motivoSinDatosFiscales(c.cliente);
      if (motivo) {
        bloqueadas.push({
          contratoId: c.id,
          cliente: this.nombreCliente(c.cliente),
          motivo,
        });
        continue;
      }
      aGenerar.push({
        contratoId: c.id,
        cliente: this.nombreCliente(c.cliente),
        trabajador: `${c.trabajador.nombre} ${c.trabajador.apellidos}`,
        tipoSesion: c.tipoSesion as string,
        importe: this.importeAFacturar(
          c,
          mes,
          sesionesPorContrato.get(c.id) ?? 0,
        ),
      });
    }

    return {
      periodo: periodoFacturado,
      aGenerar,
      yaFacturadas: contratos.length - pendientes.length,
      bloqueadas,
      importeTotal: aGenerar.reduce((s, c) => s + c.importe, 0),
    };
  }

  private nombreCliente(c: { nombre: string; apellidos: string }): string {
    return `${c.nombre} ${c.apellidos}`;
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
    return new Set(
      existentes
        .map((f) => f.contratoId)
        .filter((id): id is string => id !== null),
    );
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
    this.assertJulioCerrado(anio, mes);

    const primerDia = new Date(anio, mes - 1, 1);
    const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);
    const periodoFacturado = this.formatPeriodo(anio, mes);

    const contratos = await this.contratosDelPeriodo(
      primerDia,
      ultimoDia,
      opts?.trabajadorId,
    );
    const yaFacturados = await this.contratosYaFacturados(
      periodoFacturado,
      contratos,
    );

    const pendientes = contratos.filter((c) => !yaFacturados.has(c.id));
    const fallidas: FalloGeneracion[] = [];
    const nuevas: FacturaCompleta[] = [];

    // Agosto: no se emite nada. Se sale antes de tocar la serie correlativa.
    if (mes === MES_AGOSTO) {
      this.logger.log(
        `Mes ${periodoFacturado}: agosto no se factura (cláusula 3 del contrato)`,
      );
      return {
        periodo: periodoFacturado,
        creadas: 0,
        omitidas: contratos.length - pendientes.length,
        fallidas: pendientes.map((c) => ({
          contratoId: c.id,
          cliente: this.nombreCliente(c.cliente),
          motivo:
            'Agosto no se factura: la cláusula 3 del contrato lo excluye por corresponder al periodo vacacional de la profesional.',
        })),
      };
    }

    const sesionesPorContrato =
      mes === MES_JULIO
        ? await this.sesionesImpartidasPorContrato(
            pendientes.map((c) => c.id),
            primerDia,
            ultimoDia,
          )
        : new Map<string, number>();

    for (const contrato of pendientes) {
      // Antes de nada, los datos fiscales de las dos partes. Una factura sin
      // NIF y domicilio del emisor, o sin nombre y NIF del tutor pagador, no es
      // una factura valida (RD 1619/2012 art. 6), y ademas quema un numero de la
      // serie correlativa que ya no se libera al anularla.
      const sinDatos =
        motivoSinDatosEmisor(contrato.trabajador) ??
        motivoSinDatosFiscales(contrato.cliente);
      if (sinDatos) {
        fallidas.push({
          contratoId: contrato.id,
          cliente: this.nombreCliente(contrato.cliente),
          motivo: sinDatos,
        });
        continue;
      }

      try {
        nuevas.push(
          await this.crearFacturaDesdeContrato(
            contrato,
            periodoFacturado,
            this.importeAFacturar(
              contrato,
              mes,
              sesionesPorContrato.get(contrato.id) ?? 0,
            ),
          ),
        );
      } catch (err: any) {
        // El fallo se recoge en vez de perderse en el log: quien lanza la
        // generación tiene que ver qué no salió, no solo cuántas salieron.
        fallidas.push({
          contratoId: contrato.id,
          cliente: this.nombreCliente(contrato.cliente),
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
            this.logger.error(
              `Error archivando PDF factura ${factura.id}: ${err}`,
            );
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
      where: {
        id: { in: pendientes.map((f) => f.id) },
        urlPdfR2: { not: null },
      },
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
    periodoFacturado: string,
    /**
     * Ya calculado por `importeAFacturar`: la cuota entera, salvo en julio que
     * viene prorrateado. Se pasa hecho para que la previsualización y la
     * generación no puedan discrepar sobre lo que se va a cobrar.
     */
    importe: number,
  ): Promise<FacturaCompleta> {
    const retencionPct = RETENCION_IRPF_PARTICULARES;
    const retencionImporte = (importe * retencionPct) / 100;
    const total = importe - retencionImporte;
    const concepto = CONCEPTO_CUOTA_MENSUAL;

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
      this.logger.warn(
        `R2 no configurado — PDF factura ${factura.id} no archivado`,
      );
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

  async regenerarPdf(
    facturaId: string,
    user: { userId: string; rol: string },
  ): Promise<void> {
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

    if (!factura)
      throw new NotFoundException(`Factura ${facturaId} no encontrada`);

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
      throw new ForbiddenException(
        'No se puede marcar como pagada una factura anulada',
      );
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
      select: {
        retencionIrpf: true,
        nifFiscal: true,
        direccionFiscal: true,
        codigoPostalFiscal: true,
        ciudadFiscal: true,
      },
    });

    if (!trabajador) {
      throw new NotFoundException(`Trabajador ${trabajadorId} no encontrado`);
    }

    const sinEmisor = motivoSinDatosEmisor(trabajador);
    if (sinEmisor) {
      throw new BadRequestException(sinEmisor);
    }

    // La otra puerta de emision. Misma exigencia que la generacion por periodo:
    // sin destinatario fiscal completo no se expide ni se numera.
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
      select: {
        nombreTutorPagador: true,
        nifTutorPagador: true,
        // Para comprobar que quien factura atiende de verdad a este cliente.
        trabajadoresAsignados: {
          where: { trabajadorId, activo: true },
          select: { id: true },
          take: 1,
        },
      },
    });
    if (!cliente) {
      throw new NotFoundException(`Cliente ${dto.clienteId} no encontrado`);
    }

    // La factura se emite SIEMPRE a nombre de quien la pide (`trabajadorId` sale
    // de `user`, ni el ADMIN puede emitir por otro), pero el cliente venia por id
    // sin comprobar nada: cualquier rol clinico podia facturar por API a un
    // cliente que no atiende. `ClienteTrabajador` es lo que gobierna el acceso a
    // la ficha, asi que es tambien el criterio correcto aqui — el mismo que
    // aplica `ContratosService.create` al dar de alta un contrato.
    if (cliente.trabajadoresAsignados.length === 0) {
      throw new ForbiddenException(
        'No puedes emitir una factura a un cliente que no tienes asignado.',
      );
    }

    const sinDatos = motivoSinDatosFiscales(cliente);
    if (sinDatos) {
      throw new BadRequestException(sinDatos);
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
      this.logger.error(
        `Error generando PDF factura puntual ${factura.id}: ${err}`,
      ),
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

    this.logger.log(
      `Emails factura ${periodoFacturado}: ${enviados}/${facturas.length} enviados`,
    );
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
      this.logger.warn(
        `Factura ${factura.id}: cliente sin email — no se envía`,
      );
      return false;
    }

    const replyTo =
      factura.trabajador.emailFacturacion ?? factura.trabajador.email;

    const nombreTrabajador =
      factura.trabajador.nombreFiscal ??
      `${factura.trabajador.nombre} ${factura.trabajador.apellidos}`;

    const pdfBuffer = await this.pdfService.generarPdf(factura).catch((err) => {
      this.logger.error(
        `Error generando PDF para email factura ${factura.id}: ${err}`,
      );
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
