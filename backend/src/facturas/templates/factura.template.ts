import { escapeHtml } from '../../common/utils/html.utils';

function esc(v: unknown): string {
  if (v == null) return '';
  return escapeHtml(String(v));
}

function fmt(v: unknown): string {
  if (v == null) return '0,00';
  return Number(v).toFixed(2).replace('.', ',');
}

export interface FacturaTemplateData {
  // Emisor (autónomo)
  nombreFiscal: string;
  nifFiscal: string;
  direccionFiscal: string;
  codigoPostalFiscal: string;
  ciudadFiscal: string;
  provinciaFiscal: string;
  iban: string;
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

  const ivaRow =
    d.ivaPorcentaje > 0
      ? `<tr>
           <td>IVA (${esc(d.ivaPorcentaje)}%)</td>
           <td>${esc(fmt(d.ivaImporte))} €</td>
         </tr>`
      : '';

  const exencionRow = d.exencionIvaTexto
    ? `<tr class="exencion"><td colspan="2">${esc(d.exencionIvaTexto)}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #23322b; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2d4a3e; padding-bottom: 20px; margin-bottom: 28px; }
  .emisor h1 { font-size: 20px; font-weight: 700; color: #2d4a3e; margin-bottom: 6px; }
  .emisor p { line-height: 1.6; color: #2d4a3e; }
  .factura-badge { text-align: right; }
  .factura-badge .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #798d82; }
  .factura-badge .numero { font-size: 28px; font-weight: 700; color: #2d4a3e; }
  .factura-badge .fecha { font-size: 11px; color: #556d62; margin-top: 4px; }

  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
  .party-box { background: #f7f5ec; border: 1px solid #c2cdc3; border-radius: 8px; padding: 16px; }
  .party-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2d4a3e; margin-bottom: 8px; }
  .party-box p { line-height: 1.7; color: #273c32; }

  .concepto-box { background: #f7f5ec; border: 1px solid #c2cdc3; border-radius: 8px; padding: 16px; margin-bottom: 28px; }
  .concepto-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2d4a3e; margin-bottom: 8px; }
  .concepto-box .periodo { font-size: 11px; color: #798d82; margin-top: 4px; }

  .totales { margin-left: auto; width: 300px; margin-bottom: 28px; }
  .totales table { width: 100%; border-collapse: collapse; }
  .totales td { padding: 7px 10px; }
  .totales tr { border-bottom: 1px solid #e5eadf; }
  .totales tr.subtotal td:last-child { font-weight: 600; }
  .totales tr.exencion td { font-size: 10px; color: #798d82; font-style: italic; border-bottom: none; padding-top: 2px; }
  .totales tr.retencion td:last-child { color: #96382e; }
  .totales tr.total-row td { font-weight: 700; font-size: 14px; color: #2d4a3e; border-top: 2px solid #2d4a3e; border-bottom: none; }

  .iban-box { margin-bottom: 28px; background: #f7f5ec; border: 1px solid #c2cdc3; border-radius: 8px; padding: 14px 16px; }
  .iban-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #2d4a3e; margin-bottom: 6px; }
  .iban-box p { font-size: 13px; font-weight: 600; color: #1f2a24; letter-spacing: 1px; }

  .footer { border-top: 1px solid #c2cdc3; padding-top: 16px; font-size: 10px; color: #798d82; line-height: 1.6; }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="emisor">
      <h1>${esc(d.nombreFiscal)}</h1>
      <p>NIF: ${esc(d.nifFiscal)}<br>
         ${esc(d.direccionFiscal)}<br>
         ${esc(d.codigoPostalFiscal)} ${esc(d.ciudadFiscal)} — ${esc(d.provinciaFiscal)}<br>
         ${esc(d.emailFacturacion)}</p>
    </div>
    <div class="factura-badge">
      <div class="label">Factura</div>
      <div class="numero">${esc(d.numeroFormateado)}</div>
      <div class="fecha">${esc(d.fechaEmision)}</div>
    </div>
  </div>

  <div class="parties">
    <div class="party-box">
      <h3>Emisor</h3>
      <p><strong>${esc(d.nombreFiscal)}</strong><br>
         NIF: ${esc(d.nifFiscal)}<br>
         ${esc(d.ciudadFiscal)}</p>
    </div>
    <div class="party-box">
      <h3>Receptor / Pagador</h3>
      <p><strong>${esc(d.nombreTutorPagador)}</strong><br>
         NIF: ${esc(d.nifTutorPagador)}<br>
         ${esc(d.direccionFiscalTutor)}<br>
         ${esc(d.codigoPostalTutor)} ${esc(d.ciudadTutor)}</p>
    </div>
  </div>

  <div class="concepto-box">
    <h3>Concepto</h3>
    <p>${esc(d.concepto)}</p>
    <p class="periodo">Período facturado: ${esc(d.periodoFacturado)}</p>
  </div>

  <div class="totales">
    <table>
      <tr class="subtotal">
        <td>Base imponible</td>
        <td>${esc(fmt(d.importe))} €</td>
      </tr>
      ${ivaRow}
      ${exencionRow}
      ${retencionRow}
      <tr class="total-row">
        <td>Total</td>
        <td>${esc(fmt(d.total))} €</td>
      </tr>
    </table>
  </div>

  ${
    d.iban
      ? `<div class="iban-box">
           <h3>Datos de pago</h3>
           <p>IBAN: ${esc(d.iban)}</p>
         </div>`
      : ''
  }

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
