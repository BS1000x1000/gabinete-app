// ──────────────────────────────────────────────────────────────
// informe.template.ts — HTML autocontenido para Puppeteer
// ──────────────────────────────────────────────────────────────

import { escapeHtml } from '../../common/utils/html.utils';

export interface GasNivel {
  nivel: number;
  descripcion: string;
}

export interface GasObjetivo {
  objetivo: string;
  area: string;
  nivelActual: number;
  niveles: GasNivel[];
}

export interface InformeTemplateData {
  titulo: string;
  tipo: string; // 'INICIAL' | 'SEGUIMIENTO'
  elaborado_por: string;
  num_colegiada: string;
  fecha_elaboracion: string;
  alumno: {
    nombre: string;
    nombre_pila: string;
    fecha_nacimiento: string;
    edad: string;
    curso: string;
    colegio: string;
  };
  motivoConsulta: string;
  analisisInformacion: string;
  evaluacionInicial: string;
  objetivosGeneralesTexto: string;
  evolucionObservada: string;
  objetivosProximoCurso: string;
  recomendaciones: string;
  snapshot: GasObjetivo[];
}

const GAS_LABELS: Record<number, string> = {
  [-2]: 'Desde donde partimos',
  [-1]: 'Parcialmente alcanzado',
  [0]: 'Conseguido (lo esperado)',
  [1]: 'Un poco más de lo esperado',
  [2]: 'Mucho más de lo esperado',
};

// Single source of truth for the GAS scale columns
const GAS_COLS = [-2, -1, 0, 1, 2] as const;

function buildGasTableHtml(niveles: GasNivel[], nivelActual: number): string {
  const nivelMap: Record<number, string> = {};
  for (const n of niveles) {
    nivelMap[n.nivel] = n.descripcion;
  }

  const headerCells = GAS_COLS
    .map((c) => `<th style="width:20%;text-align:center;padding:7px 4px;font-size:9.5px;color:#374151;font-weight:600;background:#e8f4fd;border:1px solid #b3d4f5;">${c >= 0 ? '+' + c : c}</th>`)
    .join('');

  const labelCells = GAS_COLS
    .map((c) => {
      const isActive = c === nivelActual;
      const bg = isActive ? '#5a9de8' : '#f0f7fe';
      const color = isActive ? '#ffffff' : '#374151';
      const fw = isActive ? 'font-weight:600;' : '';
      const indicator = isActive ? ' ▲' : '';
      return `<td style="background:${bg};color:${color};${fw}text-align:center;padding:7px 5px;font-size:9px;line-height:1.4;vertical-align:top;border:1px solid #b3d4f5;">${escapeHtml(GAS_LABELS[c] || '')}${indicator}</td>`;
    })
    .join('');

  const descCells = GAS_COLS
    .map((c) => {
      const isActive = c === nivelActual;
      const bg = isActive ? '#3d7bc4' : '#ffffff';
      const color = isActive ? '#ffffff' : '#4b5563';
      return `<td style="background:${bg};color:${color};text-align:center;padding:7px 5px;font-size:9px;line-height:1.4;vertical-align:top;border:1px solid #b3d4f5;">${escapeHtml(nivelMap[c] ?? '—')}</td>`;
    })
    .join('');

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:0;">
      <thead><tr>${headerCells}</tr></thead>
      <tbody>
        <tr>${labelCells}</tr>
        <tr>${descCells}</tr>
      </tbody>
    </table>`;
}

export function buildInformeHtml(datos: InformeTemplateData): string {
  const esSeguimiento = datos.tipo === 'SEGUIMIENTO';
  const subtitulo = esSeguimiento ? 'INFORME DE SEGUIMIENTO' : 'INFORME INICIAL';

  // Escape once — used in both student card and signatures section
  const elaboradoPor = escapeHtml(datos.elaborado_por);

  // ── Secciones de texto ─────────────────────────────────────
  type Seccion = { titulo: string; contenido: string };
  const secciones: Seccion[] = [
    { titulo: '1. Motivo de consulta', contenido: datos.motivoConsulta },
    {
      titulo: '2. Análisis de la información recabada',
      contenido: datos.analisisInformacion
        ? `En el proceso de valoración de ${escapeHtml(datos.alumno.nombre_pila)}, se ha recabado la siguiente información:<br><br>${escapeHtml(datos.analisisInformacion)}`
        : '',
    },
    {
      titulo: '3. Evaluación inicial',
      contenido: datos.evaluacionInicial
        ? `Tras el proceso de evaluación realizado con ${escapeHtml(datos.alumno.nombre_pila)}, se presentan los siguientes resultados:<br><br>${escapeHtml(datos.evaluacionInicial)}`
        : '',
    },
    {
      titulo: '4. Objetivos generales de intervención',
      contenido: datos.objetivosGeneralesTexto
        ? `Los objetivos generales de intervención planteados para ${escapeHtml(datos.alumno.nombre_pila)} son los siguientes:<br><br>${escapeHtml(datos.objetivosGeneralesTexto)}`
        : '',
    },
  ];

  if (esSeguimiento) {
    secciones.push(
      { titulo: '5. Evolución observada', contenido: datos.evolucionObservada },
      { titulo: '6. Objetivos próximo curso', contenido: datos.objetivosProximoCurso },
      { titulo: '7. Recomendaciones', contenido: datos.recomendaciones },
    );
  }

  const seccionesHtml = secciones
    .map(
      (s) => `
    <div class="section-block">
      <div class="section-header">
        <div class="section-accent"></div>
        <div class="section-title">${s.titulo}</div>
      </div>
      <div class="section-body">
        ${s.contenido || '<em class="empty-text">Sin contenido registrado.</em>'}
      </div>
    </div>`,
    )
    .join('');

  // ── Sección GAS ─────────────────────────────────────────────
  const gasNumero = esSeguimiento ? 8 : 5;
  const gasIntro = `La metodología GAS (Goal Attainment Scaling) permite cuantificar el progreso de ${escapeHtml(datos.alumno.nombre_pila)} estableciendo objetivos individualizados en una escala de cinco niveles, facilitando la medición objetiva del avance terapéutico.`;

  // Single pass over GAS_COLS to build both header and label rows
  const gasResumenCells = GAS_COLS.map((c) => ({
    header: `<th style="width:20%;text-align:center;padding:6px 4px;font-size:9.5px;background:#e8f4fd;color:#374151;font-weight:600;border:1px solid #b3d4f5;">${c >= 0 ? '+' + c : c}</th>`,
    label:  `<td style="text-align:center;padding:6px 4px;font-size:9px;background:#f8fbfe;border:1px solid #b3d4f5;color:#4b5563;line-height:1.4;">${escapeHtml(GAS_LABELS[c])}</td>`,
  }));
  const gasResumenCabecera = gasResumenCells.map((x) => x.header).join('');
  const gasResumenLabels   = gasResumenCells.map((x) => x.label).join('');

  const snapshot = datos.snapshot ?? [];
  const gasObjetivosHtml =
    snapshot.length === 0
      ? '<p class="empty-text" style="padding:12px 0;">Sin objetivos GAS registrados.</p>'
      : snapshot
          .map(
            (obj) => `
          <div class="gas-objetivo">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="width:16%;background:#e8f4fd;padding:8px 10px;font-size:10px;font-weight:700;color:#3d7bc4;border:1px solid #b3d4f5;text-transform:uppercase;letter-spacing:0.4px;">Área</td>
                <td style="padding:8px 10px;font-size:10.5px;color:#374151;border:1px solid #b3d4f5;background:#f8fbfe;">${escapeHtml(obj.area)}</td>
              </tr>
              <tr>
                <td style="background:#e8f4fd;padding:8px 10px;font-size:10px;font-weight:700;color:#3d7bc4;border:1px solid #b3d4f5;text-transform:uppercase;letter-spacing:0.4px;">Objetivo</td>
                <td style="padding:8px 10px;font-size:10.5px;color:#1f2937;border:1px solid #b3d4f5;background:#ffffff;line-height:1.5;">${escapeHtml(obj.objetivo)}</td>
              </tr>
            </table>
            ${buildGasTableHtml(obj.niveles, obj.nivelActual)}
          </div>`,
          )
          .join('');

  const gasSectionHtml = `
    <!-- GAS section allows page breaks within — tables can be taller than one page -->
    <div class="section-block gas-section">
      <div class="section-header">
        <div class="section-accent section-accent--blue"></div>
        <div class="section-title">${gasNumero}. Objetivos GAS (Goal Attainment Scaling)</div>
      </div>
      <div class="section-body" style="padding:14px 16px;">
        <p style="font-size:10.5px;line-height:1.7;color:#4b5563;margin-bottom:14px;text-align:justify;">${gasIntro}</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>${gasResumenCabecera}</tr></thead>
          <tbody><tr>${gasResumenLabels}</tr></tbody>
        </table>
        <hr class="gas-separator">
        ${gasObjetivosHtml}
      </div>
    </div>`;

  // ── Firmas ──────────────────────────────────────────────────
  const signaturas = `
    <div class="signatures-section">
      <div class="signatures-title">Firmas y conformidad</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="width:48%;vertical-align:top;padding-right:8px;">
            <div class="sig-box">
              <div class="sig-role">Padre / Madre / Tutor legal</div>
              <div class="sig-line"></div>
              <div class="sig-label">Firma y DNI</div>
            </div>
          </td>
          <td style="width:4%;"></td>
          <td style="width:48%;vertical-align:top;padding-left:8px;">
            <div class="sig-box">
              <div class="sig-name">${elaboradoPor}</div>
              <div class="sig-role">${datos.num_colegiada ? 'Colegiado/a N.º ' + escapeHtml(datos.num_colegiada) : 'Pedagogo/a'}</div>
              <div class="sig-line"></div>
              <div class="sig-label">Firma y sello</div>
            </div>
          </td>
        </tr>
      </table>
      <p class="signing-place">En ________________________, a ${escapeHtml(datos.fecha_elaboracion)}</p>
    </div>`;

  // ── LOPD ────────────────────────────────────────────────────
  const lopd = `
    <div class="lopd-section">
      <div class="lopd-title">Información sobre protección de datos personales</div>
      <p class="lopd-text">Los datos que nos facilite serán tratados exclusivamente para la gestión de la relación contractual existente entre las partes, así como para las finalidades que expresamente nos autorice. Sus datos serán conservados mientras dure nuestra relación contractual y el tiempo necesario para cumplir con las obligaciones legales correspondientes. La base legal para el tratamiento es el mantenimiento de la relación contractual. Sus datos podrán ser cedidos únicamente a destinatarios estrictamente necesarios para el cumplimiento de las obligaciones contractuales o legales. En cualquier momento puede ejercer sus derechos de acceso, rectificación, supresión, portabilidad y oposición mediante petición escrita acompañada de copia de su DNI. Si considera que sus derechos han sido desatendidos, puede reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
    </div>`;

  // ── HTML final ──────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page { size: A4; }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      color: #1f2937;
      line-height: 1.65;
      padding: 0 4mm;
    }

    /* ── Thin gradient bar on every page (fixed) ── */
    .page-stripe {
      position: fixed;
      top: 0; left: -6mm; right: -6mm;
      height: 5px;
      background: linear-gradient(90deg, #7c6fd6 0%, #5a9de8 100%);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
      z-index: 999;
    }

    /* ── Masthead ── */
    .masthead {
      position: relative;
      overflow: hidden;
      background: #7c6fd6;
      border-radius: 8px;
      padding: 18px 22px 16px;
      margin-top: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .masthead-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.12);
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .masthead-monogram {
      position: relative;
      z-index: 2;
      width: 48px; height: 48px;
      border-radius: 50%;
      background: rgba(255,255,255,0.18);
      border: 2px solid rgba(255,255,255,0.4);
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 700; color: #fff;
      flex-shrink: 0;
      letter-spacing: 0.5px;
    }
    .masthead-body {
      position: relative; z-index: 2; flex: 1;
    }
    .masthead-name {
      font-size: 14px; font-weight: 700; color: #fff;
      letter-spacing: 1px; line-height: 1.2;
    }
    .masthead-sub {
      font-size: 9.5px; color: rgba(255,255,255,0.7);
      margin-top: 3px; letter-spacing: 0.3px;
    }
    .masthead-badge {
      position: relative; z-index: 2;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.32);
      color: #fff;
      font-size: 8.5px; font-weight: 700;
      letter-spacing: 0.9px; text-transform: uppercase;
      padding: 5px 12px; border-radius: 20px;
      white-space: nowrap;
    }

    /* ── Student card ── */
    .student-card {
      background: #f7f6fd;
      border: 1px solid #e2ddf5;
      border-left: 4px solid #7c6fd6;
      border-radius: 6px;
      padding: 14px 18px;
      margin-bottom: 22px;
    }
    .sc-row {
      display: flex; gap: 28px; margin-bottom: 6px;
    }
    .sc-row:last-child { margin-bottom: 0; }
    .sc-field { flex: 1; }
    .sc-field-wide { flex: 2; }
    .sc-label {
      font-size: 8px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; color: #7c6fd6; margin-bottom: 1px;
    }
    .sc-value {
      font-size: 11px; font-weight: 500; color: #1f2937;
      line-height: 1.4;
    }
    .sc-name { font-size: 13px; font-weight: 600; }
    .sc-divider {
      border: none; border-top: 1px solid #e2ddf5;
      margin: 10px 0;
    }

    /* ── Content sections ── */
    .section-block {
      margin-bottom: 20px;
      break-inside: avoid;
      page-break-inside: avoid;
      display: block;
    }
    /* GAS section can be taller than one page — allow page breaks within */
    .section-block.gas-section {
      overflow: visible;
      break-inside: auto;
      page-break-inside: auto;
    }
    .section-header {
      display: flex; align-items: center; gap: 9px;
      margin-bottom: 7px;
    }
    .section-accent {
      width: 3px; height: 16px; flex-shrink: 0;
      background: #7c6fd6; border-radius: 2px;
    }
    .section-accent--blue { background: #5a9de8; }
    .section-title {
      font-size: 10.5px; font-weight: 700;
      color: #3d337a; letter-spacing: 0.2px;
    }
    .section-body {
      border: 1px solid #e8e4f8;
      border-left: 3px solid #e2ddf5;
      padding: 13px 15px;
      font-size: 11px; line-height: 1.75;
      color: #374151; text-align: justify;
      border-radius: 0 5px 5px 0;
      background: #fff;
    }
    .empty-text { font-style: italic; color: #9ca3af; }

    /* ── GAS ── */
    .gas-objetivo {
      break-inside: avoid;
      page-break-inside: avoid;
      display: block;
      overflow: hidden;
      margin-bottom: 16px;
      border: 1px solid #cde4f8;
      border-radius: 6px;
    }
    .gas-objetivo table {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .gas-separator {
      border: none;
      border-top: 1.5px solid #d9ebfc;
      margin: 16px 0 18px;
    }

    /* ── Signatures ── */
    .signatures-section {
      margin-top: 28px;
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .signatures-title {
      font-size: 8.5px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; color: #9ca3af;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8e4f8;
      margin-bottom: 14px;
    }
    .sig-box {
      border: 1px solid #e8e4f8;
      border-radius: 6px;
      padding: 12px 14px;
      min-height: 88px;
      background: #fafafa;
    }
    .sig-name {
      font-size: 10.5px; font-weight: 600; color: #1f2937;
      margin-bottom: 1px;
    }
    .sig-role {
      font-size: 9.5px; color: #6b7280;
    }
    .sig-line {
      border-top: 1px dashed #d1d5db;
      margin: 18px 0 6px;
    }
    .sig-label {
      font-size: 8.5px; color: #9ca3af; text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .signing-place {
      font-size: 10px; color: #6b7280; margin-top: 14px;
    }

    /* ── LOPD ── */
    .lopd-section {
      background: #f9fafb;
      border: 1px solid #e8e4f8;
      border-radius: 6px;
      padding: 11px 14px;
      margin-top: 20px;
    }
    .lopd-title {
      font-size: 8px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.7px; color: #9ca3af; margin-bottom: 5px;
    }
    .lopd-text {
      font-size: 7.5px; line-height: 1.6;
      color: #9ca3af; text-align: justify;
    }

    /* ── Contact footer ── */
    .doc-footer {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid #e8e4f8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .doc-footer-info { font-size: 8px; color: #b0b0b8; }
    .doc-confidential {
      font-size: 7.5px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: #c4bce8;
    }
  </style>
</head>
<body>

  <!-- Thin gradient stripe (repeats every page via fixed) -->
  <div class="page-stripe"></div>

  <!-- ══ MASTHEAD ══════════════════════════════════════════════ -->
  <div class="masthead">
    <!-- Decorative rings -->
    <div class="masthead-ring" style="width:130px;height:130px;right:-35px;top:-40px;"></div>
    <div class="masthead-ring" style="width:90px;height:90px;right:55px;bottom:-40px;background:rgba(90,157,232,0.18);border:none;"></div>
    <div class="masthead-ring" style="width:60px;height:60px;right:-10px;bottom:-10px;"></div>
    <!-- Monogram -->
    <div class="masthead-monogram">CJ</div>
    <!-- Title -->
    <div class="masthead-body">
      <div class="masthead-name">Conectadas Juntas</div>
      <div class="masthead-sub">Evaluación · Intervención · Seguimiento</div>
    </div>
    <!-- Report type badge -->
    <div class="masthead-badge">${subtitulo}</div>
  </div>

  <!-- ══ DATOS DEL ALUMNO ══════════════════════════════════════ -->
  <div class="student-card">
    <div class="sc-row">
      <div class="sc-field sc-field-wide">
        <div class="sc-label">Nombre del alumno / a</div>
        <div class="sc-value sc-name">${escapeHtml(datos.alumno.nombre)}</div>
      </div>
    </div>
    <hr class="sc-divider">
    <div class="sc-row">
      <div class="sc-field">
        <div class="sc-label">Fecha de nacimiento</div>
        <div class="sc-value">${escapeHtml(datos.alumno.fecha_nacimiento)}${datos.alumno.edad ? '<span style="color:#7c6fd6;margin-left:6px;font-size:10px;">(' + escapeHtml(datos.alumno.edad) + ')</span>' : ''}</div>
      </div>
      <div class="sc-field">
        <div class="sc-label">Etapa educativa / Curso</div>
        <div class="sc-value">${escapeHtml(datos.alumno.curso)}${datos.alumno.colegio ? ' · ' + escapeHtml(datos.alumno.colegio) : ''}</div>
      </div>
    </div>
    <div class="sc-row" style="margin-top:4px;">
      <div class="sc-field">
        <div class="sc-label">Fecha de elaboración</div>
        <div class="sc-value">${escapeHtml(datos.fecha_elaboracion)}</div>
      </div>
      <div class="sc-field">
        <div class="sc-label">Elaborado por</div>
        <div class="sc-value">${elaboradoPor}${datos.num_colegiada ? '<span style="color:#9ca3af;font-size:9.5px;"> · N.º col. ' + escapeHtml(datos.num_colegiada) + '</span>' : ''}</div>
      </div>
    </div>
  </div>

  <!-- ══ SECCIONES DE TEXTO ════════════════════════════════════ -->
  ${seccionesHtml}

  <!-- ══ SECCIÓN GAS ══════════════════════════════════════════ -->
  ${gasSectionHtml}

  <!-- ══ FIRMAS ════════════════════════════════════════════════ -->
  ${signaturas}

  <!-- ══ LOPD ══════════════════════════════════════════════════ -->
  ${lopd}

  <!-- ══ PIE ═══════════════════════════════════════════════════ -->
  <div class="doc-footer">
    <div class="doc-footer-info">Documento generado el ${escapeHtml(datos.fecha_elaboracion)} · Conectadas Juntas</div>
    <div class="doc-confidential">Confidencial</div>
  </div>

</body>
</html>`;
}
