import { escapeHtml } from '../../common/utils/html.utils';

function esc(v: unknown): string {
  if (v == null) return '';
  return escapeHtml(String(v));
}

const TIPO_LABEL: Record<string, string> = {
  PEDAGOGIA:           'Pedagogía',
  NEUROPSICOLOGIA:     'Neuropsicología',
  LOGOPEDIA:           'Logopedia',
  TERAPIA_OCUPACIONAL: 'Terapia Ocupacional',
  EVALUACION:          'Evaluación Psicopedagógica',
  REUNION_COLEGIO:     'Coordinación con Centro Educativo',
};

const DIA_LABEL: Record<number, string> = {
  1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves',
  5: 'Viernes', 6: 'Sábado', 7: 'Domingo',
};

export interface ContratoTemplateData {
  // Prestador
  nombreFiscal: string;
  nifFiscal: string;
  direccionFiscal: string;
  codigoPostalFiscal: string;
  ciudadFiscal: string;
  provinciaFiscal: string;
  emailPrestador: string;
  // Cliente (pagador)
  nombrePagador: string;
  nifPagador: string;
  direccionPagador: string;
  codigoPostalPagador: string;
  ciudadPagador: string;
  // Beneficiario (menor)
  nombreBeneficiario: string;
  // Contrato
  tipoSesion: string;
  cuotaMensual: number;
  fechaInicio: string;
  fechaFin: string | null;
  fechaFirma: string;
  notas: string | null;
  slots: Array<{
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
    duracionMinutos: number;
    modalidad: string;
  }>;
  // Fiscal
  exentoIva: boolean;
  retencionPorcentaje: number;
}

export function buildContratoHtml(d: ContratoTemplateData): string {
  const tipoLabel = TIPO_LABEL[d.tipoSesion] ?? d.tipoSesion;

  const slotsRows = d.slots.map(s => `
    <tr>
      <td>${esc(DIA_LABEL[s.diaSemana] ?? s.diaSemana)}</td>
      <td>${esc(s.horaInicio)} – ${esc(s.horaFin)}</td>
      <td>${esc(s.duracionMinutos)} min</td>
      <td>${s.modalidad === 'ONLINE' ? 'Online (videollamada)' : 'Presencial'}</td>
    </tr>`).join('');

  const precioRow = d.retencionPorcentaje > 0
    ? `<tr><td>Retención IRPF aplicable</td><td>${esc(d.retencionPorcentaje)}%</td></tr>`
    : '';

  const ivaRow = d.exentoIva
    ? `<tr><td>IVA</td><td>Exento — Art. 20.1.3 LIVA<br><small>(servicios de educación y reeducación)</small></td></tr>`
    : '';

  const vigenciaFin = d.fechaFin
    ? esc(d.fechaFin)
    : 'Indefinida — hasta comunicación de alguna de las partes con 30 días de antelación';

  const notasSection = d.notas
    ? `<div class="section">
         <h2 class="section-title">Observaciones</h2>
         <p class="notas">${esc(d.notas)}</p>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11.5px; color: #1a1a2e; background: #fff; line-height: 1.55; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 48px; }

  .doc-header { border-bottom: 3px solid #7c6fd6; padding-bottom: 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: flex-start; }
  .doc-header-left h1 { font-size: 17px; font-weight: 700; color: #7c6fd6; letter-spacing: 0.03em; text-transform: uppercase; }
  .doc-header-left .subtitle { font-size: 10.5px; color: #888; margin-top: 4px; letter-spacing: 0.05em; text-transform: uppercase; }
  .doc-header-right { text-align: right; font-size: 10.5px; color: #888; }
  .doc-header-right .ref { font-weight: 700; color: #7c6fd6; font-size: 12px; }

  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .party-box { background: #f9f8ff; border: 1px solid #e8e4f8; border-radius: 8px; padding: 14px 16px; }
  .party-box.beneficiario { grid-column: 1 / -1; }
  .party-box h3 { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #7c6fd6; margin-bottom: 8px; font-weight: 700; border-bottom: 1px solid #e8e4f8; padding-bottom: 5px; }
  .party-box p { color: #333; font-size: 11px; }
  .party-box strong { color: #1a1a2e; }

  .section { margin-bottom: 22px; }
  .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #7c6fd6; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e8e4f8; }

  .clause { font-size: 11px; color: #333; margin-bottom: 8px; text-align: justify; }
  .clause strong { color: #1a1a2e; }

  .slots-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
  .slots-table th { background: #f0eeff; color: #5a4da8; font-weight: 600; text-align: left; padding: 7px 10px; border: 1px solid #e8e4f8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
  .slots-table td { padding: 7px 10px; border: 1px solid #eee; color: #333; }
  .slots-table tbody tr:nth-child(even) td { background: #faf9ff; }

  .price-table { width: 320px; border-collapse: collapse; font-size: 11px; }
  .price-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
  .price-table td:last-child { text-align: right; font-weight: 600; }
  .price-table .total td { font-size: 13px; font-weight: 700; color: #7c6fd6; border-top: 2px solid #7c6fd6; border-bottom: none; }
  .price-table small { font-weight: 400; color: #888; font-size: 9.5px; }

  .vigencia-table { border-collapse: collapse; font-size: 11px; }
  .vigencia-table td { padding: 5px 12px 5px 0; color: #333; vertical-align: top; }
  .vigencia-table td:first-child { font-weight: 600; color: #555; min-width: 120px; }

  .legal-box { background: #f9f8ff; border: 1px solid #e8e4f8; border-radius: 6px; padding: 12px 14px; font-size: 10px; color: #555; line-height: 1.6; margin-bottom: 22px; }
  .legal-box h3 { font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.08em; color: #7c6fd6; font-weight: 700; margin-bottom: 7px; }

  .notas { font-size: 11px; color: #555; background: #fffbf0; border: 1px solid #fde68a; border-radius: 6px; padding: 10px 12px; font-style: italic; }

  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 40px; }
  .signature-box { border-top: 1px solid #ccc; padding-top: 10px; }
  .signature-box .sig-label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
  .signature-box .sig-name { font-size: 11.5px; font-weight: 600; color: #333; margin-top: 4px; }
  .signature-box .sig-space { height: 48px; }

  .footer { margin-top: 32px; border-top: 1px solid #e8e4f8; padding-top: 12px; font-size: 9.5px; color: #aaa; line-height: 1.6; text-align: center; }
</style>
</head>
<body>
<div class="page">

  <!-- Cabecera -->
  <div class="doc-header">
    <div class="doc-header-left">
      <h1>Contrato de Prestación de Servicios</h1>
      <div class="subtitle">Servicios de ${esc(tipoLabel)}</div>
    </div>
    <div class="doc-header-right">
      <div>Fecha de firma</div>
      <div class="ref">${esc(d.fechaFirma)}</div>
    </div>
  </div>

  <!-- Partes -->
  <div class="section">
    <h2 class="section-title">Partes del contrato</h2>
    <div class="parties">
      <div class="party-box">
        <h3>Prestador del servicio</h3>
        <p>
          <strong>${esc(d.nombreFiscal)}</strong><br>
          NIF/NIE: ${esc(d.nifFiscal)}<br>
          ${esc(d.direccionFiscal)}<br>
          ${esc(d.codigoPostalFiscal)} ${esc(d.ciudadFiscal)}${d.provinciaFiscal ? ' — ' + esc(d.provinciaFiscal) : ''}<br>
          ${esc(d.emailPrestador)}
        </p>
      </div>
      <div class="party-box">
        <h3>Cliente / Responsable del pago</h3>
        <p>
          <strong>${esc(d.nombrePagador)}</strong><br>
          NIF/NIE: ${esc(d.nifPagador)}<br>
          ${esc(d.direccionPagador)}<br>
          ${esc(d.codigoPostalPagador)} ${esc(d.ciudadPagador)}
        </p>
      </div>
      <div class="party-box beneficiario">
        <h3>Beneficiario del servicio</h3>
        <p><strong>${esc(d.nombreBeneficiario)}</strong> — destinatario/a de las sesiones de ${esc(tipoLabel)}</p>
      </div>
    </div>
  </div>

  <!-- Objeto -->
  <div class="section">
    <h2 class="section-title">Objeto del contrato</h2>
    <p class="clause">
      El presente contrato tiene por objeto la prestación de servicios profesionales de
      <strong>${esc(tipoLabel)}</strong> por parte del Prestador al Beneficiario, en las condiciones
      y con la periodicidad detalladas en las cláusulas siguientes.
    </p>
  </div>

  <!-- Condiciones de prestación -->
  <div class="section">
    <h2 class="section-title">Condiciones de prestación del servicio</h2>
    <p class="clause">Las sesiones se realizarán con la siguiente periodicidad semanal:</p>
    <table class="slots-table">
      <thead>
        <tr>
          <th>Día</th>
          <th>Horario</th>
          <th>Duración</th>
          <th>Modalidad</th>
        </tr>
      </thead>
      <tbody>
        ${slotsRows}
      </tbody>
    </table>
    <p class="clause" style="margin-top:10px;">
      Salvo modificación pactada por escrito entre las partes, el horario y la frecuencia
      establecidos tendrán carácter estable durante toda la vigencia del contrato.
    </p>
  </div>

  <!-- Vigencia -->
  <div class="section">
    <h2 class="section-title">Vigencia</h2>
    <table class="vigencia-table">
      <tr><td>Fecha de inicio</td><td>${esc(d.fechaInicio)}</td></tr>
      <tr><td>Fecha de finalización</td><td>${vigenciaFin}</td></tr>
    </table>
  </div>

  <!-- Precio -->
  <div class="section">
    <h2 class="section-title">Precio y condiciones económicas</h2>
    <table class="price-table">
      <tr>
        <td>Cuota mensual</td>
        <td>${esc(d.cuotaMensual.toFixed(2).replace('.', ','))} €</td>
      </tr>
      ${ivaRow}
      ${precioRow}
      <tr class="total">
        <td>Total mensual</td>
        <td>${esc(d.cuotaMensual.toFixed(2).replace('.', ','))} €</td>
      </tr>
    </table>
    <p class="clause" style="margin-top:10px;">
      La cuota se abonará mensualmente, mediante el método de pago acordado entre las partes.
      El Prestador emitirá la correspondiente factura al inicio de cada período.
    </p>
  </div>

  <!-- Festivos y ausencias -->
  <div class="section">
    <h2 class="section-title">Festivos, vacaciones y ausencias</h2>
    <p class="clause">
      Las sesiones coincidentes con festivos nacionales, autonómicos o locales de la provincia
      del Cliente, así como con los períodos de vacaciones del Prestador previamente comunicados,
      <strong>quedan excluidas del cómputo mensual</strong>. Su importe se descontará de la cuota
      del mes en que se produzcan, o se compensará con sesiones adicionales, según acuerdo entre
      las partes.
    </p>
    <p class="clause">
      Las ausencias del Beneficiario no justificadas con un mínimo de <strong>24 horas de
      antelación</strong> podrán ser facturadas íntegramente, a criterio del Prestador.
    </p>
  </div>

  <!-- Modificación y rescisión -->
  <div class="section">
    <h2 class="section-title">Modificación y rescisión</h2>
    <p class="clause">
      Cualquier modificación de las condiciones del presente contrato requerirá acuerdo escrito
      entre ambas partes. Cualquiera de ellas podrá resolver el contrato comunicándolo a la otra
      parte con un mínimo de <strong>30 días naturales</strong> de antelación.
    </p>
  </div>

  <!-- RGPD -->
  <div class="legal-box">
    <h3>Protección de datos — RGPD / LOPDGDD</h3>
    <p>
      Los datos personales recogidos en este contrato serán tratados por el Prestador exclusivamente
      para la gestión de la relación contractual y la prestación del servicio. El tratamiento se
      ampara en la ejecución del presente contrato (Art. 6.1.b RGPD). Los datos de salud del
      Beneficiario se tratan con base en el consentimiento explícito del titular o su representante
      legal (Art. 9.2.a RGPD).
    </p>
    <p style="margin-top:6px;">
      Los datos no serán cedidos a terceros salvo obligación legal. El Cliente puede ejercer sus
      derechos de acceso, rectificación, supresión, limitación y portabilidad dirigiéndose al
      Prestador en la dirección indicada. Conservación: durante la vigencia del contrato y
      5 años adicionales conforme al Código Civil, o 4 años por obligaciones fiscales.
    </p>
  </div>

  ${notasSection}

  <!-- Firmas -->
  <div class="section">
    <h2 class="section-title">Conformidad y firmas</h2>
    <p class="clause">
      Ambas partes declaran haber leído y comprendido el presente contrato, aceptando todas sus
      cláusulas en prueba de lo cual lo firman en <strong>_________________</strong>,
      a _____ de _________________ de 20____
    </p>
    <div class="signatures">
      <div class="signature-box">
        <div class="sig-space"></div>
        <div class="sig-label">Firma del Prestador</div>
        <div class="sig-name">${esc(d.nombreFiscal)}</div>
        <div style="font-size:10px;color:#aaa;">NIF: ${esc(d.nifFiscal)}</div>
      </div>
      <div class="signature-box">
        <div class="sig-space"></div>
        <div class="sig-label">Firma del Cliente</div>
        <div class="sig-name">${esc(d.nombrePagador)}</div>
        <div style="font-size:10px;color:#aaa;">NIF: ${esc(d.nifPagador)}</div>
      </div>
    </div>
  </div>

  <div class="footer">
    Documento generado el ${esc(d.fechaFirma)} · Los datos personales incluidos están
    tratados conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
  </div>

</div>
</body>
</html>`;
}
