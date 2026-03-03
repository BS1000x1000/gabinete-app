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

function buildGasTableHtml(niveles: GasNivel[], nivelActual: number): string {
  const cols = [-2, -1, 0, 1, 2];

  const nivelMap: Record<number, string> = {};
  for (const n of niveles) {
    nivelMap[n.nivel] = n.descripcion;
  }

  const headerCells = cols
    .map((c) => `<th style="width:20%;text-align:center;padding:6px 4px;font-size:10px;color:#1f2937;">${c >= 0 ? '+' + c : c}</th>`)
    .join('');

  const labelCells = cols
    .map((c) => {
      const isActive = c === nivelActual;
      const bg = isActive ? '#5a9de8' : '#d9ebfc';
      const color = isActive ? '#ffffff' : '#1f2937';
      const indicator = isActive ? ' ▲' : '';
      return `<td style="background:${bg};color:${color};text-align:center;padding:8px 4px;font-size:9px;vertical-align:top;border:1px solid #b3d4f5;">${escapeHtml(GAS_LABELS[c] || '')}${indicator}</td>`;
    })
    .join('');

  const descCells = cols
    .map((c) => {
      const isActive = c === nivelActual;
      const bg = isActive ? '#5a9de8' : '#f0f7fe';
      const color = isActive ? '#ffffff' : '#374151';
      return `<td style="background:${bg};color:${color};text-align:center;padding:8px 4px;font-size:9px;vertical-align:top;border:1px solid #b3d4f5;">${escapeHtml(nivelMap[c] ?? '—')}</td>`;
    })
    .join('');

  return `
    <table style="width:100%;border-collapse:collapse;margin-top:6px;">
      <thead>
        <tr style="background:#adc9f6;">${headerCells}</tr>
      </thead>
      <tbody>
        <tr>${labelCells}</tr>
        <tr>${descCells}</tr>
      </tbody>
    </table>`;
}

export function buildInformeHtml(datos: InformeTemplateData): string {
  const esSeguimiento = datos.tipo === 'SEGUIMIENTO';
  const subtitulo = esSeguimiento
    ? 'INFORME DE SEGUIMIENTO'
    : 'INFORME PSICOPEDAGÓGICO INICIAL';

  // ── Secciones de texto ────────────────────────────────────
  type Seccion = { titulo: string; contenido: string };
  const secciones: Seccion[] = [
    { titulo: '1. MOTIVO DE CONSULTA', contenido: datos.motivoConsulta },
    {
      titulo: '2. ANÁLISIS DE LA INFORMACIÓN RECABADA',
      contenido: datos.analisisInformacion
        ? `En el proceso de valoración de ${escapeHtml(datos.alumno.nombre_pila)}, se ha recabado la siguiente información:<br><br>${escapeHtml(datos.analisisInformacion)}`
        : '',
    },
    {
      titulo: '3. EVALUACIÓN INICIAL',
      contenido: datos.evaluacionInicial
        ? `Tras el proceso de evaluación realizado con ${escapeHtml(datos.alumno.nombre_pila)}, se presentan los siguientes resultados:<br><br>${escapeHtml(datos.evaluacionInicial)}`
        : '',
    },
    {
      titulo: '4. OBJETIVOS GENERALES DE INTERVENCIÓN',
      contenido: datos.objetivosGeneralesTexto
        ? `Los objetivos generales de intervención planteados para ${escapeHtml(datos.alumno.nombre_pila)} son los siguientes:<br><br>${escapeHtml(datos.objetivosGeneralesTexto)}`
        : '',
    },
  ];

  if (esSeguimiento) {
    secciones.push(
      { titulo: '5. EVOLUCIÓN OBSERVADA', contenido: datos.evolucionObservada },
      { titulo: '6. OBJETIVOS PRÓXIMO CURSO', contenido: datos.objetivosProximoCurso },
      { titulo: '7. RECOMENDACIONES', contenido: datos.recomendaciones },
    );
  }

  const seccionesHtml = secciones
    .map(
      (s) => `
    <div style="margin-bottom:18px;page-break-inside:avoid;">
      <div style="background:#7c6fd6;color:#ffffff;padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-radius:4px 4px 0 0;">
        ${s.titulo}
      </div>
      <div style="border:1px solid #e8e4f8;border-top:none;padding:12px;font-size:11px;line-height:1.7;color:#374151;text-align:justify;border-radius:0 0 4px 4px;background:#ffffff;">
        ${s.contenido || '<span style="color:#9ca3af;font-style:italic;">Sin contenido</span>'}
      </div>
    </div>`,
    )
    .join('');

  // ── Sección GAS ───────────────────────────────────────────
  const gasNumero = esSeguimiento ? 8 : 5;
  const gasIntro = `La metodología GAS (Goal Attainment Scaling) permite cuantificar el progreso de ${escapeHtml(datos.alumno.nombre_pila)}
    estableciendo objetivos individualizados en una escala de cinco niveles. Esta herramienta facilita la medición objetiva del avance terapéutico.`;

  const gasResumenCabecera = [-2, -1, 0, 1, 2]
    .map(
      (c) => `<th style="width:20%;text-align:center;padding:6px 4px;font-size:10px;background:#adc9f6;color:#1f2937;border:1px solid #b3d4f5;">${c >= 0 ? '+' + c : c}</th>`,
    )
    .join('');

  const gasResumenLabels = [-2, -1, 0, 1, 2]
    .map(
      (c) => `<td style="text-align:center;padding:6px 4px;font-size:9px;border:1px solid #b3d4f5;color:#374151;">${escapeHtml(GAS_LABELS[c])}</td>`,
    )
    .join('');

  const gasObjetivosHtml =
    datos.snapshot.length === 0
      ? '<p style="color:#9ca3af;font-style:italic;font-size:11px;">Sin objetivos registrados.</p>'
      : datos.snapshot
          .map(
            (obj) => `
          <div style="margin-bottom:16px;page-break-inside:avoid;">
            <table style="width:100%;border-collapse:collapse;margin-bottom:4px;">
              <tr>
                <td style="width:18%;background:#adc9f6;padding:6px 8px;font-size:10px;font-weight:600;color:#1f2937;border:1px solid #b3d4f5;">Área</td>
                <td style="padding:6px 8px;font-size:10px;color:#374151;border:1px solid #b3d4f5;background:#f0f7fe;">${escapeHtml(obj.area)}</td>
              </tr>
              <tr>
                <td style="background:#adc9f6;padding:6px 8px;font-size:10px;font-weight:600;color:#1f2937;border:1px solid #b3d4f5;">Objetivo</td>
                <td style="padding:6px 8px;font-size:10px;color:#374151;border:1px solid #b3d4f5;background:#ffffff;">${escapeHtml(obj.objetivo)}</td>
              </tr>
            </table>
            ${buildGasTableHtml(obj.niveles, obj.nivelActual)}
          </div>`,
          )
          .join('');

  const gasSectionHtml = `
    <div style="margin-bottom:18px;">
      <div style="background:#7c6fd6;color:#ffffff;padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;border-radius:4px 4px 0 0;">
        ${gasNumero}. OBJETIVOS GAS (GOAL ATTAINMENT SCALING)
      </div>
      <div style="border:1px solid #e8e4f8;border-top:none;padding:12px;border-radius:0 0 4px 4px;background:#ffffff;">
        <p style="font-size:11px;line-height:1.7;color:#374151;text-align:justify;margin-bottom:12px;">${gasIntro}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <thead><tr>${gasResumenCabecera}</tr></thead>
          <tbody><tr>${gasResumenLabels}</tr></tbody>
        </table>
        ${gasObjetivosHtml}
      </div>
    </div>`;

  // ── HTML final ────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      color: #1f2937;
      line-height: 1.5;
    }
    @page { size: A4; margin: 0; }
  </style>
</head>
<body>

  <!-- Cabecera -->
  <div style="text-align:center;margin-bottom:20px;">
    <h1 style="font-size:18px;font-weight:700;color:#7c6fd6;letter-spacing:1px;margin-bottom:4px;">
      GABINETE PSICOPEDAGÓGICO
    </h1>
    <h2 style="font-size:13px;font-weight:500;color:#5a4fa8;margin-bottom:10px;">
      ${subtitulo}
    </h2>
    <hr style="border:none;border-top:2px solid #7c6fd6;">
  </div>

  <!-- Datos del alumno -->
  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:10.5px;">
    <tr>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;width:22%;border:1px solid #d1c9f0;">Nombre del alumno/a</td>
      <td colspan="3" style="padding:6px 8px;border:1px solid #d1c9f0;">${escapeHtml(datos.alumno.nombre)}</td>
    </tr>
    <tr>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;border:1px solid #d1c9f0;">Fecha de nacimiento</td>
      <td style="padding:6px 8px;border:1px solid #d1c9f0;width:28%;">${escapeHtml(datos.alumno.fecha_nacimiento)}</td>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;border:1px solid #d1c9f0;width:22%;">Edad</td>
      <td style="padding:6px 8px;border:1px solid #d1c9f0;">${escapeHtml(datos.alumno.edad)}</td>
    </tr>
    <tr>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;border:1px solid #d1c9f0;">Etapa educativa / Curso</td>
      <td colspan="3" style="padding:6px 8px;border:1px solid #d1c9f0;">${escapeHtml(datos.alumno.curso)}${datos.alumno.colegio ? ' — ' + escapeHtml(datos.alumno.colegio) : ''}</td>
    </tr>
    <tr>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;border:1px solid #d1c9f0;">Fecha de elaboración</td>
      <td colspan="3" style="padding:6px 8px;border:1px solid #d1c9f0;">${escapeHtml(datos.fecha_elaboracion)}</td>
    </tr>
    <tr>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;border:1px solid #d1c9f0;">Elaborado por</td>
      <td style="padding:6px 8px;border:1px solid #d1c9f0;">${escapeHtml(datos.elaborado_por)}</td>
      <td style="background:#e8e4f8;padding:6px 8px;font-weight:600;border:1px solid #d1c9f0;">N.º colegiada</td>
      <td style="padding:6px 8px;border:1px solid #d1c9f0;">${escapeHtml(datos.num_colegiada) || '—'}</td>
    </tr>
  </table>

  <!-- Secciones de texto -->
  ${seccionesHtml}

  <!-- Sección GAS -->
  ${gasSectionHtml}

  <!-- Pie de página -->
  <hr style="border:none;border-top:1px solid #adc9f6;margin-top:20px;margin-bottom:10px;">
  <p style="text-align:center;font-size:9px;color:#9ca3af;">
    Documento confidencial — Gabinete Psicopedagógico · Generado el ${escapeHtml(datos.fecha_elaboracion)}
  </p>

</body>
</html>`;
}
