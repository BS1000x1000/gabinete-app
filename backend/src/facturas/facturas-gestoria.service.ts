import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  EstadoEnvioGestoria,
  EstadoFactura,
  PeriodicidadEnvio,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { EmailService } from '../common/email/email.service';
import { AuditService } from '../auth/audit.service';
import { FacturasPackService, SeleccionFacturas } from './facturas-pack.service';
import { FacturaCompleta } from './facturas.include';
import { toNum } from './facturas.utils';

/**
 * Tope de adjunto. Resend corta en 40 MB por mensaje y el contenido viaja en
 * base64, asi que el binario util son ~28 MB. Por encima se manda el libro en
 * Excel y un enlace de descarga en vez del zip entero: el servicio de email se
 * traga los fallos devolviendo `false`, asi que un adjunto pasado de tamaño se
 * perderia en silencio.
 */
const MAX_ADJUNTO_BYTES = 20 * 1024 * 1024;

/** Cuanto vive el enlace de descarga que se manda cuando el zip no cabe. */
const VIGENCIA_ENLACE_SEGUNDOS = 7 * 24 * 3600;

export interface PreviewEnvio {
  destinatario: { nombre: string | null; email: string | null };
  /** `false` cuando falta el email de la gestoria: no se puede enviar. */
  listoParaEnviar: boolean;
  emailConfigurado: boolean;
  numFacturas: number;
  totalImporte: number;
  periodoDesde: string;
  periodoHasta: string;
  filename: string;
  ficheros: string[];
  /** Facturas de la selección que ya se entregaron en un envío anterior. */
  yaEntregadas: number;
}

@Injectable()
export class FacturasGestoriaService {
  private readonly logger = new Logger(FacturasGestoriaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pack: FacturasPackService,
    private readonly storage: StorageService,
    private readonly email: EmailService,
    private readonly audit: AuditService,
  ) {}

  // ── Previsualización ──────────────────────────────────────────────────────

  /**
   * Que se mandaria, a quien y con que nombres de fichero. Se enseña antes de
   * enviar: mandar facturas a un tercero a ciegas no es aceptable.
   */
  async previsualizar(
    user: { userId: string; rol: string },
    seleccion: SeleccionFacturas,
  ): Promise<PreviewEnvio> {
    const facturas = await this.pack.facturasDeLaSeleccion(user, seleccion);
    const resumen = this.pack.resumen(facturas);
    const trabajador = await this.datosGestoria(user.userId);

    const yaEntregadas = await this.prisma.envioGestoriaFactura.count({
      where: {
        facturaId: { in: facturas.map((f) => f.id) },
        envio: { estado: EstadoEnvioGestoria.ENVIADO },
      },
    });

    return {
      destinatario: {
        nombre: trabajador.nombreGestoria,
        email: trabajador.emailGestoria,
      },
      listoParaEnviar: Boolean(trabajador.emailGestoria) && this.email.isConfigured,
      emailConfigurado: this.email.isConfigured,
      numFacturas: resumen.numFacturas,
      totalImporte: resumen.totalImporte,
      periodoDesde: resumen.periodoDesde,
      periodoHasta: resumen.periodoHasta,
      filename: resumen.filename,
      ficheros: resumen.ficheros,
      yaEntregadas,
    };
  }

  // ── Envío ─────────────────────────────────────────────────────────────────

  async enviar(
    user: { userId: string; rol: string },
    seleccion: SeleccionFacturas,
  ) {
    const facturas = await this.pack.facturasDeLaSeleccion(user, seleccion);
    return this.entregar(user.userId, facturas, { automatico: false, user });
  }

  /**
   * Construye el paquete, lo archiva y lo manda. Deja fila en `EnvioGestoria`
   * pase lo que pase: un envio fallido tiene que verse, no desaparecer.
   */
  private async entregar(
    trabajadorId: string,
    facturas: FacturaCompleta[],
    opts: { automatico: boolean; user?: { userId: string } },
  ) {
    const trabajador = await this.datosGestoria(trabajadorId);
    if (!trabajador.emailGestoria) {
      throw new BadRequestException(
        'No hay email de gestoría configurado. Añádelo en Mis datos fiscales.',
      );
    }

    const resumen = this.pack.resumen(facturas);
    const envio = await this.prisma.envioGestoria.create({
      data: {
        trabajadorId,
        periodoDesde: resumen.periodoDesde,
        periodoHasta: resumen.periodoHasta,
        emailDestino: trabajador.emailGestoria,
        numFacturas: resumen.numFacturas,
        totalImporte: resumen.totalImporte,
        estado: EstadoEnvioGestoria.PENDIENTE,
        automatico: opts.automatico,
        facturas: {
          create: facturas.map((f) => ({ facturaId: f.id })),
        },
      },
    });

    try {
      const archivo = await this.pack.construirPack(facturas);

      // Se archiva el zip tal cual se manda: si mañana hay que demostrar que se
      // entrego, vale el fichero que salio, no una reconstruccion parecida.
      const storageKey = `gestoria/${trabajadorId}/${resumen.periodoDesde}_${resumen.periodoHasta}_${envio.id}.zip`;
      const guardado = await this.storage.upload(storageKey, archivo.buffer, 'application/zip');

      const cabeMoverloAdjunto = archivo.buffer.length <= MAX_ADJUNTO_BYTES;
      const enlace =
        !cabeMoverloAdjunto && guardado
          ? await this.storage.getSignedUrl(storageKey, VIGENCIA_ENLACE_SEGUNDOS)
          : null;

      if (!cabeMoverloAdjunto && !enlace) {
        throw new Error(
          'El paquete pesa demasiado para ir adjunto y no se pudo generar un enlace de descarga.',
        );
      }

      const libro = await this.pack.construirLibro(facturas);
      const enviado = await this.email.sendPackGestoriaEmail({
        to: trabajador.emailGestoria,
        replyTo: trabajador.emailFacturacion ?? trabajador.email,
        nombreTrabajador: trabajador.nombreFiscal ?? `${trabajador.nombre} ${trabajador.apellidos}`,
        nifTrabajador: trabajador.nifFiscal,
        periodo: this.etiqueta(resumen.periodoDesde, resumen.periodoHasta),
        numFacturas: resumen.numFacturas,
        totalImporte: resumen.totalImporte,
        ficheros: resumen.ficheros,
        enlaceDescarga: enlace,
        adjuntos: cabeMoverloAdjunto
          ? [{ filename: archivo.filename, content: archivo.buffer }]
          : [{ filename: libro.filename, content: libro.buffer }],
      });

      const actualizado = await this.prisma.envioGestoria.update({
        where: { id: envio.id },
        data: {
          storageKey: guardado ? storageKey : null,
          estado: enviado ? EstadoEnvioGestoria.ENVIADO : EstadoEnvioGestoria.ERROR,
          error: enviado ? null : 'El servicio de email rechazó el envío o no está configurado.',
          fechaEnvio: enviado ? new Date() : null,
        },
      });

      if (enviado) {
        await this.resolverAvisos(trabajadorId, resumen.periodoHasta);
      }

      await this.audit.registrar({
        evento: 'FACTURA_ENTREGA_GESTORIA',
        userId: opts.user?.userId,
        recurso: envio.id,
        metadata: {
          periodo: this.etiqueta(resumen.periodoDesde, resumen.periodoHasta),
          numFacturas: resumen.numFacturas,
          destino: trabajador.emailGestoria,
          enviado,
          incidencias: archivo.incidencias.length,
          automatico: opts.automatico,
        },
      });

      return { envio: actualizado, incidencias: archivo.incidencias };
    } catch (err: any) {
      this.logger.error(`Envío a gestoría ${envio.id} falló: ${err}`);
      const conError = await this.prisma.envioGestoria.update({
        where: { id: envio.id },
        data: {
          estado: EstadoEnvioGestoria.ERROR,
          error: err?.message ?? String(err),
        },
      });
      return { envio: conError, incidencias: [] };
    }
  }

  // ── Historial y pendientes ────────────────────────────────────────────────

  async historial(user: { userId: string; rol: string }, trabajadorId?: string) {
    const objetivo = user.rol === 'ADMIN' ? (trabajadorId ?? user.userId) : user.userId;
    return this.prisma.envioGestoria.findMany({
      where: { trabajadorId: objetivo },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
  }

  /**
   * Facturas de periodos ya cerrados que nunca han salido hacia la gestoria.
   * Es lo que contesta a "?que me queda por entregar?".
   */
  async pendientesDeEntregar(trabajadorId: string) {
    const hoy = new Date();
    const periodoActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

    const facturas = await this.prisma.factura.findMany({
      where: {
        trabajadorId,
        periodoFacturado: { lt: periodoActual },
        estado: { not: EstadoFactura.ANULADA },
        entregas: { none: { envio: { estado: EstadoEnvioGestoria.ENVIADO } } },
      },
      select: { id: true, periodoFacturado: true, total: true },
    });

    const porPeriodo = new Map<string, { periodo: string; numFacturas: number; total: number }>();
    for (const f of facturas) {
      const acc = porPeriodo.get(f.periodoFacturado) ?? {
        periodo: f.periodoFacturado,
        numFacturas: 0,
        total: 0,
      };
      acc.numFacturas++;
      acc.total += toNum(f.total);
      porPeriodo.set(f.periodoFacturado, acc);
    }

    return [...porPeriodo.values()].sort((a, b) => a.periodo.localeCompare(b.periodo));
  }

  // ── Automático ────────────────────────────────────────────────────────────

  /**
   * Recorre a los autonomos con periodicidad activa y entrega el ultimo periodo
   * cerrado que aun no haya salido. Idempotente por construccion: si el periodo
   * ya tiene un envio ENVIADO, no hay facturas pendientes y no se hace nada.
   */
  async entregarPeriodicas(): Promise<number> {
    const trabajadores = await this.prisma.trabajador.findMany({
      where: {
        activo: true,
        periodicidadGestoria: { not: PeriodicidadEnvio.NINGUNA },
        emailGestoria: { not: null },
      },
      select: { id: true, periodicidadGestoria: true },
    });

    let entregados = 0;
    for (const t of trabajadores) {
      const rango = this.ultimoPeriodoCerrado(t.periodicidadGestoria);
      try {
        const facturas = await this.pack.facturasDeLaSeleccion(
          { userId: t.id, rol: 'PEDAGOGO' },
          { periodoDesde: rango.desde, periodoHasta: rango.hasta },
        );
        const sinEntregar = await this.filtrarSinEntregar(facturas);
        if (!sinEntregar.length) continue;

        await this.entregar(t.id, sinEntregar, { automatico: true });
        entregados++;
      } catch (err) {
        // `facturasDeLaSeleccion` lanza 400 cuando no hay nada en el periodo:
        // es el caso normal de un autonomo que no facturó ese trimestre.
        this.logger.debug(`Envío periódico omitido para ${t.id}: ${err}`);
      }
    }
    return entregados;
  }

  private async filtrarSinEntregar(facturas: FacturaCompleta[]): Promise<FacturaCompleta[]> {
    const entregadas = await this.prisma.envioGestoriaFactura.findMany({
      where: {
        facturaId: { in: facturas.map((f) => f.id) },
        envio: { estado: EstadoEnvioGestoria.ENVIADO },
      },
      select: { facturaId: true },
    });
    const ya = new Set(entregadas.map((e) => e.facturaId));
    return facturas.filter((f) => !ya.has(f.id));
  }

  private ultimoPeriodoCerrado(p: PeriodicidadEnvio): { desde: string; hasta: string } {
    const hoy = new Date();
    if (p === PeriodicidadEnvio.MENSUAL) {
      const anterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const periodo = this.periodo(anterior.getFullYear(), anterior.getMonth() + 1);
      return { desde: periodo, hasta: periodo };
    }
    // Trimestral: el trimestre natural anterior al que estamos.
    const trimestreActual = Math.floor(hoy.getMonth() / 3) + 1;
    const anterior = trimestreActual === 1 ? 4 : trimestreActual - 1;
    const anio = trimestreActual === 1 ? hoy.getFullYear() - 1 : hoy.getFullYear();
    const primerMes = (anterior - 1) * 3 + 1;
    return {
      desde: this.periodo(anio, primerMes),
      hasta: this.periodo(anio, primerMes + 2),
    };
  }

  // ── Auxiliares ────────────────────────────────────────────────────────────

  /**
   * Al entregar se retira el aviso: nada en el motor de reglas quita una
   * notificacion cuando su condicion deja de cumplirse.
   */
  private async resolverAvisos(trabajadorId: string, periodoHasta: string): Promise<void> {
    await this.prisma.notificacion.updateMany({
      where: {
        trabajadorId,
        reglaOrigen: 'FACTURAS_SIN_ENTREGAR',
        referenciaId: { lte: periodoHasta },
        descartada: false,
      },
      data: { descartada: true },
    });
  }

  private async datosGestoria(trabajadorId: string) {
    const t = await this.prisma.trabajador.findUnique({
      where: { id: trabajadorId },
      select: {
        nombre: true,
        apellidos: true,
        email: true,
        nombreFiscal: true,
        nifFiscal: true,
        emailFacturacion: true,
        nombreGestoria: true,
        emailGestoria: true,
      },
    });
    if (!t) throw new BadRequestException('Trabajador no encontrado');
    return t;
  }

  private periodo(anio: number, mes: number): string {
    return `${anio}-${String(mes).padStart(2, '0')}`;
  }

  private etiqueta(desde: string, hasta: string): string {
    if (desde === hasta) return desde;
    const [anioD, mesD] = desde.split('-').map(Number);
    const [anioH, mesH] = hasta.split('-').map(Number);
    const t = Math.floor((mesD - 1) / 3) + 1;
    if (anioD === anioH && Math.floor((mesH - 1) / 3) + 1 === t && mesH - mesD === 2) {
      return `${t}T ${anioD}`;
    }
    return `${desde} — ${hasta}`;
  }
}
