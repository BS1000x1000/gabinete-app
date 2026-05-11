import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { escapeHtml } from '../utils/html.utils';

const DEFAULT_FROM = 'facturacion@gabinete.es';

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
          'Los emails de factura no se enviarán hasta que se defina la variable.',
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
    if (!this.resend) return false;

    const subject = `Factura ${payload.numeroFormateado} – ${payload.nombreTrabajador}`;
    const html = this.buildEmailHtml(payload);

    try {
      await this.resend.emails.send({
        from: this.from,
        to: payload.to,
        replyTo: payload.replyTo,
        subject,
        html,
        attachments: [
          {
            filename: payload.pdfFilename,
            content: payload.pdfBuffer,
          },
        ],
      });
      this.logger.log(`Email factura ${payload.numeroFormateado} enviado a ${payload.to}`);
      return true;
    } catch (err) {
      this.logger.error(`Error enviando email factura ${payload.numeroFormateado}: ${err}`);
      return false;
    }
  }

  private buildEmailHtml(p: FacturaEmailPayload): string {
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/></head>
<body style="font-family:sans-serif;color:#222;background:#fff;padding:0;margin:0;">
  <div style="max-width:600px;margin:0 auto;padding:32px 24px;">
    <div style="border-bottom:2px solid #7c6fd6;padding-bottom:16px;margin-bottom:24px;">
      <h1 style="color:#7c6fd6;font-size:20px;margin:0;">${esc(p.nombreTrabajador)}</h1>
    </div>

    <p style="margin-bottom:16px;">Estimado/a cliente,</p>

    <p style="margin-bottom:16px;">
      Le adjuntamos la factura <strong>${esc(p.numeroFormateado)}</strong>
      correspondiente al período <strong>${esc(p.periodoFacturado)}</strong>.
    </p>

    <div style="background:#f9f8ff;border:1px solid #e8e4f8;border-radius:8px;padding:16px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr>
          <td style="padding:6px 0;color:#666;">Concepto</td>
          <td style="padding:6px 0;font-weight:600;">${esc(p.concepto)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#666;">Total</td>
          <td style="padding:6px 0;font-weight:700;color:#7c6fd6;font-size:16px;">${esc(p.total)} €</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom:8px;">El documento PDF se adjunta a este correo.</p>
    <p style="margin-bottom:24px;color:#666;font-size:13px;">
      Si tiene alguna duda, puede responder a este correo directamente.
    </p>

    <div style="border-top:1px solid #e8e4f8;padding-top:16px;font-size:11px;color:#999;">
      Este mensaje contiene información fiscal confidencial. Si lo ha recibido por error,
      por favor elimínelo y notifíquenos. Tratamiento de datos conforme al RGPD (UE) 2016/679.
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
