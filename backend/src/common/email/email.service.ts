import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { escapeHtml } from '../utils/html.utils';

const DEFAULT_FROM = 'facturacion@gabinete.es';

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
