import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { escapeHtml } from '../utils/html.utils';

const DEFAULT_FROM = 'facturacion@gabinete.es';

/**
 * Tope de adjuntos por mensaje. Resend corta en 40 MB y el contenido viaja en
 * base64, asi que el binario util son ~28 MB; se deja margen. Antes no habia
 * ninguna comprobacion y un envio pasado de tamaño se perdia en silencio.
 */
const MAX_ADJUNTOS_BYTES = 25 * 1024 * 1024;

export interface Adjunto {
  filename: string;
  content: Buffer;
}

export interface FacturaEmailPayload {
  to: string;
  replyTo: string;
  nombreTrabajador: string;
  numeroFormateado: string;
  periodoFacturado: string;
  concepto: string;
  total: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
}

export interface PackGestoriaEmailPayload {
  to: string;
  replyTo: string;
  nombreTrabajador: string;
  nifTrabajador: string | null;
  /** "3T 2026" o "2026-07 — 2026-11". */
  periodo: string;
  numFacturas: number;
  totalImporte: number;
  /** Nombres de los ficheros que van dentro del paquete, para listarlos. */
  ficheros: string[];
  /** Cuando el zip no cabe como adjunto, va el enlace y solo se adjunta el libro. */
  enlaceDescarga?: string | null;
  adjuntos: Adjunto[];
}

export interface ExpedienteEmailPayload {
  to: string;
  replyTo: string;
  nombreTrabajador: string;
  nombreMenor: string;
  /** Nombres legibles de lo que se adjunta, para listarlo en el cuerpo. */
  documentos: string[];
  adjuntos: Adjunto[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.EMAIL_FROM ?? DEFAULT_FROM;

    if (!apiKey) {
      this.logger.warn(
        'EmailService no configurado (falta RESEND_API_KEY). ' +
          'Los emails no se enviarán hasta que se defina la variable.',
      );
      this.resend = null;
      return;
    }

    this.resend = new Resend(apiKey);
    this.logger.log(`EmailService listo — from: ${this.from}`);
  }

  get isConfigured(): boolean {
    return this.resend !== null;
  }

  async sendFacturaEmail(payload: FacturaEmailPayload): Promise<boolean> {
    return this.enviar({
      to: payload.to,
      replyTo: payload.replyTo,
      subject: `Factura ${payload.numeroFormateado} – ${payload.nombreTrabajador}`,
      html: this.buildFacturaHtml(payload),
      adjuntos: [{ filename: payload.pdfFilename, content: payload.pdfBuffer }],
      etiquetaLog: `factura ${payload.numeroFormateado}`,
    });
  }

  /**
   * Documentacion inicial (contrato y consentimientos) para que la familia la
   * firme y la devuelva.
   *
   * A diferencia de la factura, aqui van varios adjuntos y datos de un menor,
   * por lo que el pie lleva el aviso de confidencialidad correspondiente.
   */
  async sendExpedienteEmail(payload: ExpedienteEmailPayload): Promise<boolean> {
    return this.enviar({
      to: payload.to,
      replyTo: payload.replyTo,
      subject: `Documentación para la firma – ${payload.nombreTrabajador}`,
      html: this.buildExpedienteHtml(payload),
      adjuntos: payload.adjuntos,
      etiquetaLog: `expediente de ${payload.nombreMenor}`,
    });
  }

  /**
   * El paquete de facturas de un periodo para la gestoria.
   *
   * `enlaceDescarga` llega cuando el zip no cabia como adjunto: en ese caso solo
   * se adjunta el libro en Excel y los PDF viajan por enlace temporal.
   */
  async sendPackGestoriaEmail(payload: PackGestoriaEmailPayload): Promise<boolean> {
    const total = payload.adjuntos.reduce((s, a) => s + a.content.length, 0);
    if (total > MAX_ADJUNTOS_BYTES) {
      // Sin esto el proveedor rechaza el mensaje y `enviar` devuelve `false` sin
      // decir por que: el fallo se veria como "email no enviado" a secas.
      this.logger.error(
        `Adjuntos de ${(total / 1024 / 1024).toFixed(1)} MB para ${payload.to}: ` +
          'por encima del limite del proveedor. No se envia.',
      );
      return false;
    }

    const lista = payload.ficheros
      .map((f) => `<li style="font-family:monospace;font-size:12px;">${escapeHtml(f)}</li>`)
      .join('');

    const bloqueEnlace = payload.enlaceDescarga
      ? `<p>El paquete completo con los PDF pesa demasiado para ir adjunto.
           Puedes descargarlo aqui durante los proximos 7 dias:<br>
           <a href="${escapeHtml(payload.enlaceDescarga)}">Descargar paquete de facturas</a></p>`
      : '';

    const html = `
      <p>Hola,</p>
      <p>Te envio las facturas emitidas del periodo <strong>${escapeHtml(payload.periodo)}</strong>.</p>
      <ul>
        <li><strong>Emisor:</strong> ${escapeHtml(payload.nombreTrabajador)}${
          payload.nifTrabajador ? ` (NIF ${escapeHtml(payload.nifTrabajador)})` : ''
        }</li>
        <li><strong>Facturas:</strong> ${payload.numFacturas}</li>
        <li><strong>Total facturado:</strong> ${payload.totalImporte
          .toFixed(2)
          .replace('.', ',')} &euro;</li>
      </ul>
      ${bloqueEnlace}
      <p>Contenido del paquete:</p>
      <ul>${lista}</ul>
      <p style="font-size:12px;color:#666;">
        El libro en Excel recoge tambien las facturas anuladas, para que la numeracion
        correlativa no presente huecos sin explicacion.
      </p>
      <p>Un saludo,<br>${escapeHtml(payload.nombreTrabajador)}</p>
    `;

    return this.enviar({
      to: payload.to,
      replyTo: payload.replyTo,
      subject: `Facturas emitidas ${payload.periodo} — ${payload.nombreTrabajador}`,
      html,
      adjuntos: payload.adjuntos,
      etiquetaLog: `pack gestoria ${payload.periodo}`,
    });
  }

  private async enviar(opts: {
    to: string;
    replyTo: string;
    subject: string;
    html: string;
    adjuntos: Adjunto[];
    etiquetaLog: string;
  }): Promise<boolean> {
    if (!this.resend) return false;

    try {
      await this.resend.emails.send({
        from: this.from,
        to: opts.to,
        replyTo: opts.replyTo,
        subject: opts.subject,
        html: opts.html,
        attachments: opts.adjuntos.map(a => ({
          filename: a.filename,
          content: a.content,
        })),
      });
      this.logger.log(`Email enviado (${opts.etiquetaLog}) a ${opts.to}`);
      return true;
    } catch (err) {
      this.logger.error(`Error enviando email (${opts.etiquetaLog}): ${err}`);
      return false;
    }
  }

  private buildFacturaHtml(p: FacturaEmailPayload): string {
    return this.envoltorio(
      p.nombreTrabajador,
      `
    <p style="margin-bottom:16px;">Estimado/a cliente,</p>

    <p style="margin-bottom:16px;">
      Le adjuntamos la factura <strong>${esc(p.numeroFormateado)}</strong>
      correspondiente al período <strong>${esc(p.periodoFacturado)}</strong>.
    </p>

    <div style="background:#f7f5ec;border:1px solid #c2cdc3;border-radius:8px;padding:16px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#556d62;">Concepto</td>
          <td style="padding:6px 0;font-weight:600;">${esc(p.concepto)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#556d62;">Total</td>
          <td style="padding:6px 0;font-weight:700;color:#2d4a3e;font-size:16px;">${esc(p.total)} €</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom:8px;">El documento PDF se adjunta a este correo.</p>
    <p style="margin-bottom:24px;color:#556d62;font-size:13px;">
      Si tiene alguna duda, puede responder a este correo directamente.
    </p>`,
      'Este mensaje contiene información fiscal confidencial. Si lo ha recibido por error, ' +
        'por favor elimínelo y notifíquenos. Tratamiento de datos conforme al RGPD (UE) 2016/679.',
    );
  }

  private buildExpedienteHtml(p: ExpedienteEmailPayload): string {
    const lista = p.documentos
      .map(
        d =>
          `<li style="margin-bottom:6px;">${esc(d)}</li>`,
      )
      .join('');

    return this.envoltorio(
      p.nombreTrabajador,
      `
    <p style="margin-bottom:16px;">Estimada familia,</p>

    <p style="margin-bottom:16px;">
      Os adjuntamos la documentación de inicio correspondiente a
      <strong>${esc(p.nombreMenor)}</strong>. Os pedimos que la reviséis, la firméis
      y nos la devolváis respondiendo a este mismo correo.
    </p>

    <div style="background:#f7f5ec;border:1px solid #c2cdc3;border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;color:#556d62;font-size:13px;">Documentos adjuntos</p>
      <ul style="margin:0;padding-left:18px;font-size:14px;">${lista}</ul>
    </div>

    <p style="margin-bottom:24px;color:#556d62;font-size:13px;">
      Si tenéis cualquier duda sobre alguno de los documentos, podéis responder a este
      correo directamente.
    </p>`,
      'Este mensaje contiene datos personales de un menor. Si lo ha recibido por error, ' +
        'elimínelo y notifíquenoslo sin difundir su contenido. Tratamiento de datos conforme ' +
        'al RGPD (UE) 2016/679 y a la LO 3/2018.',
    );
  }

  private envoltorio(titulo: string, cuerpo: string, pie: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="font-family:sans-serif;color:#23322b;background:#fff;padding:0;margin:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="border-bottom:2px solid #2d4a3e;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="color:#2d4a3e;font-size:20px;margin:0;">${esc(titulo)}</h1>
    </div>
${cuerpo}
    <div style="border-top:1px solid #c2cdc3;padding-top:16px;font-size:11px;color:#798d82;">
      ${esc(pie)}
    </div>
  </div>
</body>
</html>`;
  }
}

function esc(v: unknown): string {
  if (v == null) return '';
  return escapeHtml(String(v));
}
