import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter, SendMailOptions } from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import { escapeHtml } from '../utils/html.utils';

const DEFAULT_FROM = 'facturacion@gabinete.es';

/** Servidor SMTP de Scaleway Transactional Email (region unica, fr-par). */
const TEM_HOST_POR_DEFECTO = 'smtp.tem.scaleway.com';

/**
 * 465 = TLS implicito (SMTPS). Es el que se usa por defecto porque no depende de
 * negociar el cifrado a mitad de conexion: aqui viajan datos de salud de un
 * menor (RGPD art. 9) y una conexion que se queda en claro no es una opcion.
 * TEM admite tambien 587 y 2587 (STARTTLS) y 2465 (TLS), por si un proveedor de
 * red bloquea el 465.
 */
const TEM_PUERTO_POR_DEFECTO = 465;

/** Puertos de TEM que hablan TLS desde el primer byte, sin STARTTLS. */
const PUERTOS_TLS_IMPLICITO = [465, 2465];

/**
 * Tope de adjuntos por mensaje. TEM corta en 50 MB por email via SMTP contando
 * el mensaje entero, y el contenido viaja en base64 (~37% de sobrecarga), asi
 * que el binario util son ~36 MB; se deja margen amplio. Antes esto solo lo
 * comprobaba el pack de gestoria: una factura con un PDF gigante se perdia en
 * silencio, y quien llama marcaba `emailEnviado: true` igualmente.
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

/**
 * Unico transporte de correo de la aplicacion.
 *
 * Habla SMTP contra **Scaleway Transactional Email** (fr-par). Se migro desde
 * Resend (EE.UU.) por soberania de datos: por aqui salen informes y expedientes
 * con datos de salud de un menor —RGPD art. 9— y Scaleway ya tiene el DPA
 * firmado como encargado del tratamiento del resto de la infraestructura.
 *
 * SMTP y no la API REST de TEM a proposito: es estandar, portable si el
 * proveedor cambia otra vez, y se mockea en tests sin inventarse un cliente.
 *
 * **Modo no-op.** Sin credenciales el servicio arranca igual, avisa por log y
 * `enviar()` devuelve `false`. TEM exige dominio verificado y todavia no hay
 * dominio: la app tiene que poder arrancar y trabajar sin correo.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo> | null;
  private readonly from: string;

  constructor() {
    // Usuario SMTP = ID del proyecto de Scaleway donde vive el dominio TEM.
    // Contrasena  = clave secreta de una API key con permiso sobre ese proyecto.
    const projectId = process.env.SCW_TEM_PROJECT_ID;
    const secretKey = process.env.SCW_TEM_SECRET_KEY;
    const host = process.env.SCW_TEM_HOST ?? TEM_HOST_POR_DEFECTO;
    const port = Number(process.env.SCW_TEM_PORT ?? TEM_PUERTO_POR_DEFECTO);

    this.from = process.env.EMAIL_FROM ?? DEFAULT_FROM;

    if (!projectId || !secretKey) {
      this.logger.warn(
        'EmailService no configurado (faltan SCW_TEM_PROJECT_ID y/o SCW_TEM_SECRET_KEY). ' +
          'Los emails no se enviaran hasta que se definan las variables.',
      );
      this.transporter = null;
      return;
    }

    if (!Number.isFinite(port) || port <= 0) {
      // Un puerto mal escrito dejaria el transporte creado y fallando en cada
      // envio; mejor caer al modo no-op, que al menos se ve en el arranque.
      this.logger.error(
        `SCW_TEM_PORT invalido ("${process.env.SCW_TEM_PORT}"). EmailService queda desactivado.`,
      );
      this.transporter = null;
      return;
    }

    const tlsImplicito = PUERTOS_TLS_IMPLICITO.includes(port);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      // `secure: true` habla TLS desde el saludo; en los puertos de STARTTLS se
      // exige la promocion con `requireTLS`, para que nunca se envie en claro.
      secure: tlsImplicito,
      requireTLS: !tlsImplicito,
      auth: { user: projectId, pass: secretKey },
    });

    this.logger.log(
      `EmailService listo — ${host}:${port} — from: ${this.from}`,
    );
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
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
  async sendPackGestoriaEmail(
    payload: PackGestoriaEmailPayload,
  ): Promise<boolean> {
    const lista = payload.ficheros
      .map(
        (f) =>
          `<li style="font-family:monospace;font-size:12px;">${escapeHtml(f)}</li>`,
      )
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
          payload.nifTrabajador
            ? ` (NIF ${escapeHtml(payload.nifTrabajador)})`
            : ''
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
    if (!this.transporter) return false;

    // El tope se comprueba aqui, en el estrangulamiento, y no en cada metodo
    // publico: asi ningun camino de envio futuro puede saltarselo.
    const bytes = opts.adjuntos.reduce((s, a) => s + a.content.length, 0);
    if (bytes > MAX_ADJUNTOS_BYTES) {
      // Sin esto el proveedor rechaza el mensaje y `enviar` devuelve `false` sin
      // decir por que: el fallo se veria como "email no enviado" a secas.
      this.logger.error(
        `Adjuntos de ${(bytes / 1024 / 1024).toFixed(1)} MB (${opts.etiquetaLog}) para ${opts.to}: ` +
          'por encima del limite del proveedor. No se envia.',
      );
      return false;
    }

    const mensaje: SendMailOptions = {
      from: this.from,
      to: opts.to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.adjuntos.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    };

    try {
      const info = await this.transporter.sendMail(mensaje);
      if (!this.fueAceptado(info, opts.etiquetaLog, opts.to)) return false;

      this.logger.log(`Email enviado (${opts.etiquetaLog}) a ${opts.to}`);
      return true;
    } catch (err) {
      this.logger.error(`Error enviando email (${opts.etiquetaLog}): ${err}`);
      return false;
    }
  }

  /**
   * Un servidor SMTP puede rechazar al destinatario **sin lanzar excepcion**:
   * nodemailer solo lanza si falla el mensaje entero, y con varios destinatarios
   * (o con un 4xx temporal) devuelve el rechazo dentro del resultado. Antes se
   * devolvia `true` en cuanto no saltaba una excepcion, y quien llama marca la
   * factura como `emailEnviado: true` con ese booleano: una factura que nunca
   * salio quedaba marcada como enviada y no se reintentaba jamas.
   */
  private fueAceptado(
    info: SMTPTransport.SentMessageInfo,
    etiquetaLog: string,
    to: string,
  ): boolean {
    const rechazados = info?.rejected ?? [];
    // `pending` son destinatarios con fallo temporal (4xx): tampoco han salido.
    const pendientes = info?.pending ?? [];

    if (rechazados.length > 0 || pendientes.length > 0) {
      this.logger.error(
        `Email NO entregado (${etiquetaLog}) a ${to} — ` +
          `rechazados: ${JSON.stringify(rechazados)}, pendientes: ${JSON.stringify(pendientes)}, ` +
          `respuesta: ${info?.response ?? '(sin respuesta)'}`,
      );
      return false;
    }

    if ((info?.accepted ?? []).length === 0) {
      this.logger.error(
        `Email sin destinatarios aceptados (${etiquetaLog}) a ${to} — ` +
          `respuesta: ${info?.response ?? '(sin respuesta)'}`,
      );
      return false;
    }

    // La respuesta final de SMTP es un codigo de tres digitos; solo el 2xx es
    // entrega aceptada. Se comprueba solo si viene, porque no todo transporte
    // la rellena.
    const respuesta = info?.response;
    if (
      typeof respuesta === 'string' &&
      respuesta.length > 0 &&
      !respuesta.startsWith('2')
    ) {
      this.logger.error(
        `Email rechazado por el servidor (${etiquetaLog}) a ${to} — respuesta: ${respuesta}`,
      );
      return false;
    }

    return true;
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
      .map((d) => `<li style="margin-bottom:6px;">${esc(d)}</li>`)
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
