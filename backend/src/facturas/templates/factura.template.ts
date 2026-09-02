import { escapeHtml } from '../../common/utils/html.utils';
import { LOGO_GABINETE_DATA_URI } from '../../common/documentos/logo';

function esc(v: unknown): string {
  if (v == null) return '';
  return escapeHtml(String(v));
}

function fmt(v: unknown): string {
  if (v == null) return '0,00';
  return Number(v).toFixed(2).replace('.', ',');
}

export interface FacturaTemplateData {
  // Emisor (autonomo)
  nombreFiscal: string;
  nifFiscal: string;
  direccionFiscal: string;
  codigoPostalFiscal: string;
  ciudadFiscal: string;
  provinciaFiscal: string;
  numeroColegiado: string;
  iban: string;
  swift: string;
  emailFacturacion: string;
  // Receptor (tutor pagador)
  nombreTutorPagador: string;
  nifTutorPagador: string;
  direccionFiscalTutor: string;
  codigoPostalTutor: string;
  ciudadTutor: string;
  // Datos factura
  numeroFormateado: string;
  fechaEmision: string;
  periodoFacturado: string;
  /** El periodo en portada, en mayusculas: "SEPTIEMBRE 2026". */
  periodoEtiqueta: string;
  /** Cuando vence el pago. La clausula 3 del contrato da diez dias naturales. */
  fechaVencimiento: string;
  formaPago: string;
  concepto: string;
  importe: number;
  ivaPorcentaje: number;
  ivaImporte: number;
  retencionPorcentaje: number;
  retencionImporte: number;
  exencionIvaTexto: string | null;
  total: number;
}

export function buildFacturaHtml(d: FacturaTemplateData): string {
  const retencionRow =
    d.retencionPorcentaje > 0
      ? `<tr class="retencion">
           <td>Retención IRPF (${esc(d.retencionPorcentaje)}%)</td>
           <td>-${esc(fmt(d.retencionImporte))} €</td>
         </tr>`
      : '';

  // El IVA se pinta SIEMPRE, tambien al 0%. Antes la fila desaparecia cuando el
  // porcentaje era cero, que es el unico caso real hoy: la factura no decia en
  // ninguna parte que el IVA fuese 0, solo la nota de exencion al pie. El modelo
  // del gabinete lo declara expresamente ("I.V.A. (0%) — 0,00 €") y es lo
  // correcto: el tipo aplicado es un dato obligatorio (RD 1619/2012 art. 6).
  const ivaRow = `<tr>
           <td>I.V.A. (${esc(d.ivaPorcentaje)}%)</td>
           <td>${esc(fmt(d.ivaImporte))} €</td>
         </tr>`;

  const exencionRow = d.exencionIvaTexto
    ? `<p class="exencion">${esc(d.exencionIvaTexto)}</p>`
    : '';

  const lineaColegiado = d.numeroColegiado
    ? `Nº Colegiado: ${esc(d.numeroColegiado)}<br>`
    : '';

  const lineaSwift = d.swift ? `SWIFT: ${esc(d.swift)}<br>` : '';

  const datosPago =
    d.iban || d.fechaVencimiento
      ? `<div class="pago">
           <h3>Datos de pago</h3>
           <p>Forma de pago: ${esc(d.formaPago)}<br>
              ${d.iban ? `IBAN: ${esc(d.iban)}<br>` : ''}
              ${lineaSwift}
              ${d.fechaVencimiento ? `Fecha de vencimiento: ${esc(d.fechaVencimiento)}` : ''}</p>
         </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #23322b; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 32px; }
  .logo img { display: block; width: 150px; height: auto; }
  .titulo { text-align: right; }
  .titulo h1 { font-size: 30px; font-weight: 700; letter-spacing: 3px; color: #2d4a3e; line-height: 1.1; }
  .titulo .periodo { font-size: 13px; font-weight: 600; letter-spacing: 2px; color: #556d62; margin-top: 2px; }
  .titulo .meta { font-size: 11px; color: #556d62; margin-top: 10px; line-height: 1.7; }
  .titulo .meta strong { color: #2d4a3e; }

  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
  .party-box { background: #f7f5ec; border: 1px solid #c2cdc3; border-radius: 8px; padding: 16px; }
  .party-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2d4a3e; margin-bottom: 8px; }
  .party-box p { line-height: 1.7; color: #273c32; }
  .party-box .nombre { font-weight: 700; color: #1f2a24; }

  .conceptos { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  .conceptos th { background: #2d4a3e; color: #f0ead8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; text-align: left; padding: 9px 14px; }
  .conceptos th.importe, .conceptos td.importe { text-align: right; white-space: nowrap; }
  .conceptos td { padding: 16px 14px; border: 1px solid #c2cdc3; border-top: none; line-height: 1.6; vertical-align: top; }

  .totales { margin-left: auto; width: 320px; }
  .totales table { width: 100%; border-collapse: collapse; }
  .totales td { padding: 7px 14px; }
  .totales td:last-child { text-align: right; white-space: nowrap; }
  .totales tr { border-bottom: 1px solid #e5eadf; }
  .totales tr.subtotal td:last-child { font-weight: 600; }
  .totales tr.retencion td:last-child { color: #96382e; }
  .totales tr.total-row td { font-weight: 700; font-size: 15px; color: #2d4a3e; border-top: 2px solid #2d4a3e; border-bottom: none; padding-top: 10px; }

  .exencion { clear: both; font-size: 11px; font-style: italic; color: #556d62; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5eadf; }

  .pago { margin-top: 24px; background: #f7f5ec; border: 1px solid #c2cdc3; border-radius: 8px; padding: 14px 16px; }
  .pago h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2d4a3e; margin-bottom: 6px; }
  .pago p { line-height: 1.8; color: #1f2a24; }

  .footer { margin-top: 32px; border-top: 1px solid #c2cdc3; padding-top: 14px; font-size: 9px; color: #798d82; line-height: 1.6; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="logo"><img src="${LOGO_GABINETE_DATA_URI}" alt=""/></div>
    <div class="titulo">
      <h1>FACTURA</h1>
      <div class="periodo">${esc(d.periodoEtiqueta)}</div>
      <div class="meta">
        Factura Nº: <strong>${esc(d.numeroFormateado)}</strong><br>
        Fecha factura: ${esc(d.fechaEmision)}
      </div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h3>Emisor</h3>
      <p><span class="nombre">${esc(d.nombreFiscal)}</span><br>
         NIF: ${esc(d.nifFiscal)}<br>
         ${esc(d.direccionFiscal)}<br>
         ${esc(d.codigoPostalFiscal)} ${esc(d.ciudadFiscal)}${d.provinciaFiscal ? ` - ${esc(d.provinciaFiscal)}` : ''}<br>
         ${lineaColegiado}
         ${esc(d.emailFacturacion)}</p>
    </div>
    <div class="party-box">
      <h3>Datos del cliente</h3>
      <p><span class="nombre">${esc(d.nombreTutorPagador)}</span><br>
         NIF: ${esc(d.nifTutorPagador)}<br>
         ${esc(d.direccionFiscalTutor)}<br>
         ${esc(d.codigoPostalTutor)} ${esc(d.ciudadTutor)}</p>
    </div>
  </div>

  <table class="conceptos">
    <tr>
      <th>Concepto</th>
      <th class="importe">Importe</th>
    </tr>
    <tr>
      <td>${esc(d.concepto)}</td>
      <td class="importe">${esc(fmt(d.importe))} €</td>
    </tr>
  </table>

  <div class="totales">
    <table>
      <tr class="subtotal">
        <td>Base imponible</td>
        <td>${esc(fmt(d.importe))} €</td>
      </tr>
      ${ivaRow}
      ${retencionRow}
      <tr class="total-row">
        <td>Total a pagar</td>
        <td>${esc(fmt(d.total))} €</td>
      </tr>
    </table>
  </div>

  ${exencionRow}

  ${datosPago}

  <div class="footer">
    <p>Este documento es una factura oficial emitida por un profesional autónomo.
       Los datos personales incluidos en esta factura están tratados conforme al Reglamento (UE) 2016/679 (RGPD)
       y la Ley Orgánica 3/2018 (LOPDGDD). Su tratamiento tiene como única finalidad el cumplimiento de las
       obligaciones fiscales y contables. Conservación: 4 años (Hacienda) / 5 años (Cód. Civil).</p>
  </div>

</div>
</body>
</html>`;
}
