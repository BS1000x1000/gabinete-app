import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import archiver from 'archiver';
import { EstadoFactura, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { FacturasPdfService } from './facturas-pdf.service';
import {
  buildExcel,
  CeldaExcel,
  EXCEL_CONTENT_TYPE,
  FORMATO,
} from '../common/excel/excel.utils';
import { motivoSinDatosFiscales, toNum } from './facturas.utils';
import { facturaInclude, FacturaCompleta } from './facturas.include';

/**
 * Tope de facturas por pack. Un trimestre de un autonomo son ~75; el tope existe
 * para que nadie se descargue el historico entero de golpe y tumbe el contenedor.
 */
const MAX_FACTURAS_PACK = 400;

/**
 * Cuantos PDF se regeneran al vuelo como maximo cuando faltan en Object Storage.
 * Por encima de esto el pack se entrega igual, con parte de incidencias: mejor
 * un pack incompleto y avisado que una peticion que tarda cinco minutos.
 */
const MAX_PDF_REGENERADOS = 25;

export interface SeleccionFacturas {
  /** Periodos facturados, inclusive: "2026-07".."2026-09". */
  periodoDesde?: string;
  periodoHasta?: string;
  /** Seleccion explicita desde la tabla. Tiene prioridad sobre el rango. */
  ids?: string[];
}

export interface IncidenciaPack {
  numeroFormateado: string;
  motivo: string;
}

export interface ArchivoPack {
  buffer: Buffer;
  filename: string;
  contentType: string;
  incidencias: IncidenciaPack[];
}

export interface ResumenPack {
  numFacturas: number;
  totalImporte: number;
  periodoDesde: string;
  periodoHasta: string;
  filename: string;
  /** Los nombres tal cual iran dentro del zip, para poder enseñarlos antes. */
  ficheros: string[];
}

const CABECERAS_LIBRO = [
  'Nº factura',
  'Fecha emisión',
  'Periodo',
  'Destinatario',
  'NIF',
  'Concepto',
  'Base imponible',
  'IVA %',
  'IVA €',
  'Retención %',
  'Retención €',
  'Total',
  'Estado',
  'Fecha cobro',
  'Método de cobro',
];

/**
 * `numFmt` por columna, en el mismo orden que `CABECERAS_LIBRO`. Las fechas
 * viajaban formateadas como texto y la gestoria no podia ordenar el libro por
 * fecha de emision, que es justo como lo mira.
 */
const FORMATOS_LIBRO: (string | undefined)[] = [
  undefined, // Nº factura
  FORMATO.FECHA, // Fecha emisión
  undefined, // Periodo
  undefined, // Destinatario
  undefined, // NIF
  undefined, // Concepto
  FORMATO.EUROS, // Base imponible
  FORMATO.PORCENTAJE, // IVA %
  FORMATO.EUROS, // IVA €
  FORMATO.PORCENTAJE, // Retención %
  FORMATO.EUROS, // Retención €
  FORMATO.EUROS, // Total
  undefined, // Estado
  FORMATO.FECHA, // Fecha cobro
  undefined, // Método de cobro
];

@Injectable()
export class FacturasPackService {
  private readonly logger = new Logger(FacturasPackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly pdfService: FacturasPdfService,
  ) {}

  // ── Consulta ──────────────────────────────────────────────────────────────

  /**
   * Las facturas del pack, siempre acotadas al autonomo salvo que sea el ADMIN
   * pidiendo explicitamente algo global.
   *
   * Las ANULADAS entran a proposito: el gestor tiene que ver por que hay un
   * hueco en la numeracion correlativa. Van marcadas y no suman en los totales.
   */
  async facturasDeLaSeleccion(
    user: { userId: string; rol: string },
    seleccion: SeleccionFacturas,
  ): Promise<FacturaCompleta[]> {
    const where: Prisma.FacturaWhereInput = {};

    if (user.rol !== 'ADMIN') {
      where.trabajadorId = user.userId;
    }

    if (seleccion.ids?.length) {
      where.id = { in: seleccion.ids };
    } else {
      const { periodoDesde, periodoHasta } = seleccion;
      if (!periodoDesde || !periodoHasta) {
        throw new BadRequestException(
          'Indica un rango de periodos (periodoDesde y periodoHasta) o una lista de facturas.',
        );
      }
      if (periodoDesde > periodoHasta) {
        throw new BadRequestException(
          'El periodo inicial es posterior al final.',
        );
      }
      where.periodoFacturado = { gte: periodoDesde, lte: periodoHasta };
    }

    const facturas = await this.prisma.factura.findMany({
      where,
      include: facturaInclude,
      orderBy: [{ anio: 'asc' }, { numero: 'asc' }],
    });

    if (!facturas.length) {
      throw new BadRequestException('No hay facturas en la selección.');
    }
    if (facturas.length > MAX_FACTURAS_PACK) {
      throw new BadRequestException(
        `La selección tiene ${facturas.length} facturas y el máximo por paquete es ` +
          `${MAX_FACTURAS_PACK}. Acota el periodo.`,
      );
    }

    return facturas;
  }

  /** Lo que se va a empaquetar, sin construir nada. Es la previsualización. */
  resumen(facturas: FacturaCompleta[]): ResumenPack {
    const periodos = facturas.map((f) => f.periodoFacturado).sort();
    const periodoDesde = periodos[0];
    const periodoHasta = periodos[periodos.length - 1];
    return {
      numFacturas: facturas.length,
      totalImporte: facturas
        .filter((f) => f.estado !== EstadoFactura.ANULADA)
        .reduce((s, f) => s + toNum(f.total), 0),
      periodoDesde,
      periodoHasta,
      filename: this.nombrePack(facturas, 'zip'),
      ficheros: [
        this.nombreLibro(facturas),
        ...facturas.map((f) => this.nombrePdf(f)),
      ],
    };
  }

  // ── Libro de facturas emitidas ────────────────────────────────────────────

  async construirLibro(facturas: FacturaCompleta[]): Promise<ArchivoPack> {
    const rows: CeldaExcel[][] = facturas.map((f) => [
      f.numeroFormateado,
      new Date(f.fechaEmision),
      f.periodoFacturado,
      // Nunca el nombre del menor: el destinatario fiscal es el tutor pagador y,
      // si falta, la celda se queda vacia y la factura sale como incidencia.
      f.cliente.nombreTutorPagador ?? null,
      f.cliente.nifTutorPagador ?? null,
      f.concepto,
      toNum(f.importe),
      toNum(f.ivaPorcentaje),
      toNum(f.ivaImporte),
      toNum(f.retencionPorcentaje),
      toNum(f.retencionImporte),
      toNum(f.total),
      this.estadoLabel(f.estado),
      f.fechaPago ? new Date(f.fechaPago) : null,
      f.metodoPago ?? null,
    ]);

    const computables = facturas.filter(
      (f) => f.estado !== EstadoFactura.ANULADA,
    );
    const totales: CeldaExcel[] = [
      'TOTAL',
      null,
      null,
      `${computables.length} ${computables.length === 1 ? 'factura' : 'facturas'}`,
      null,
      null,
      computables.reduce((s, f) => s + toNum(f.importe), 0),
      null,
      computables.reduce((s, f) => s + toNum(f.ivaImporte), 0),
      null,
      computables.reduce((s, f) => s + toNum(f.retencionImporte), 0),
      computables.reduce((s, f) => s + toNum(f.total), 0),
      null,
      null,
      null,
    ];

    const buffer = await buildExcel({
      sheetName: 'Facturas emitidas',
      headers: CABECERAS_LIBRO,
      rows,
      totales,
      formatos: FORMATOS_LIBRO,
    });

    return {
      buffer,
      filename: this.nombreLibro(facturas),
      contentType: EXCEL_CONTENT_TYPE,
      incidencias: [],
    };
  }

  // ── Pack completo ─────────────────────────────────────────────────────────

  /**
   * ZIP con el libro en Excel y los PDF de cada factura.
   *
   * Los PDF se leen de Object Storage (`urlPdfR2` guarda la clave, no una URL).
   * Solo se regenera con Puppeteer lo que falte, y con tope: cada regeneracion
   * levanta un Chromium, asi que un trimestre sin archivar no puede convertirse
   * en setenta y cinco navegadores.
   */
  async construirPack(facturas: FacturaCompleta[]): Promise<ArchivoPack> {
    const libro = await this.construirLibro(facturas);
    const incidencias: IncidenciaPack[] = [];
    let regenerados = 0;

    const zip = archiver('zip', { zlib: { level: 9 } });
    const trozos: Buffer[] = [];
    zip.on('data', (t: Buffer) => trozos.push(t));
    const cerrado = new Promise<void>((resolve, reject) => {
      zip.on('end', () => resolve());
      zip.on('error', reject);
    });

    zip.append(libro.buffer, { name: libro.filename });

    for (const factura of facturas) {
      // Facturas antiguas emitidas antes de que se exigieran los datos fiscales
      // del pagador. Van igualmente en el paquete (existen y numeran), pero el
      // usuario tiene que enterarse de que su destinatario esta incompleto.
      const sinDatos = motivoSinDatosFiscales(factura.cliente);
      if (sinDatos) {
        incidencias.push({
          numeroFormateado: factura.numeroFormateado,
          motivo: sinDatos,
        });
      }

      const pdf = await this.obtenerPdf(
        factura,
        regenerados < MAX_PDF_REGENERADOS,
      );
      if (!pdf) {
        incidencias.push({
          numeroFormateado: factura.numeroFormateado,
          motivo:
            regenerados >= MAX_PDF_REGENERADOS
              ? 'PDF sin archivar y se alcanzó el límite de regeneración'
              : 'No se pudo obtener el PDF',
        });
        continue;
      }
      if (pdf.regenerado) regenerados++;
      zip.append(pdf.buffer, { name: this.nombrePdf(factura) });
    }

    if (incidencias.length) {
      this.logger.warn(`Pack con ${incidencias.length} incidencia(s)`);
    }

    await zip.finalize();
    await cerrado;

    return {
      buffer: Buffer.concat(trozos),
      filename: this.nombrePack(facturas, 'zip'),
      contentType: 'application/zip',
      incidencias,
    };
  }

  /** Del almacenamiento si está archivado; si no, se regenera cuando se permite. */
  private async obtenerPdf(
    factura: FacturaCompleta,
    puedeRegenerar: boolean,
  ): Promise<{ buffer: Buffer; regenerado: boolean } | null> {
    if (factura.urlPdfR2) {
      try {
        const buffer = await this.storage.download(factura.urlPdfR2);
        if (buffer) return { buffer, regenerado: false };
      } catch (err) {
        this.logger.warn(`No se pudo leer ${factura.urlPdfR2}: ${err}`);
      }
    }
    if (!puedeRegenerar) return null;
    try {
      return {
        buffer: await this.pdfService.generarPdf(factura),
        regenerado: true,
      };
    } catch (err) {
      this.logger.error(
        `No se pudo regenerar el PDF de ${factura.numeroFormateado}: ${err}`,
      );
      return null;
    }
  }

  // ── Nombres ───────────────────────────────────────────────────────────────

  /**
   * `0012_2026-07_Martinez-Ruiz-Ana.pdf`
   *
   * El numero va primero porque es como ordena la gestoria. El nombre es el del
   * tutor pagador, que es el destinatario fiscal de la factura — y ademas evita
   * pasear el nombre del menor por el nombre de fichero.
   */
  private nombrePdf(f: FacturaCompleta): string {
    const numero = String(f.numero).padStart(4, '0');
    // Sin tutor pagador NO se cae al nombre del menor: eso metia el nombre del
    // nino en el fichero que se manda a la gestoria, justo lo que este nombrado
    // por el tutor existe para evitar. Se queda en el numero y el periodo.
    const destinatario = f.cliente.nombreTutorPagador;
    if (!destinatario?.trim())
      return `${numero}_${f.periodoFacturado}_sin-destinatario.pdf`;
    return `${numero}_${f.periodoFacturado}_${this.sanear(destinatario)}.pdf`;
  }

  private nombreLibro(facturas: FacturaCompleta[]): string {
    return `resumen-facturas_${this.etiquetaPeriodo(facturas)}.xlsx`;
  }

  private nombrePack(facturas: FacturaCompleta[], ext: string): string {
    const nif = facturas[0]?.trabajador?.nifFiscal;
    const quien = nif ? `_${this.sanear(nif)}` : '';
    return `facturas${quien}_${this.etiquetaPeriodo(facturas)}.${ext}`;
  }

  /** "2026-3T" si el rango cae en un trimestre; "2026-07_2026-11" si no. */
  private etiquetaPeriodo(facturas: FacturaCompleta[]): string {
    const periodos = [
      ...new Set(facturas.map((f) => f.periodoFacturado)),
    ].sort();
    const desde = periodos[0];
    const hasta = periodos[periodos.length - 1];
    if (desde === hasta) return desde;

    const [anioD, mesD] = desde.split('-').map(Number);
    const [anioH, mesH] = hasta.split('-').map(Number);
    const trimestre = Math.floor((mesD - 1) / 3) + 1;
    const mismoTrimestre =
      anioD === anioH && Math.floor((mesH - 1) / 3) + 1 === trimestre;
    if (mismoTrimestre) return `${anioD}-${trimestre}T`;
    if (anioD === anioH && mesD === 1 && mesH === 12) return `${anioD}`;
    return `${desde}_${hasta}`;
  }

  /**
   * Deja letras (con tildes y ñ), digitos, punto y guion; lo demas fuera.
   *
   * No vale el `[^\w.\- ]` que usa `documentos`: `\w` es ASCII, asi que
   * "Martinez" con tilde salia como "Mart_nez" y medio listado de apellidos
   * espanoles llegaba a la gestoria mutilado.
   */
  private sanear(valor: string): string {
    return valor
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}.\-]+/gu, '_');
  }

  private estadoLabel(e: EstadoFactura): string {
    if (e === EstadoFactura.ANULADA) return 'ANULADA';
    return e === EstadoFactura.PAGADA ? 'Cobrada' : 'Pendiente';
  }
}
