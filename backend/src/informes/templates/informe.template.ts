// ──────────────────────────────────────────────────────────────
// informe.template.ts — HTML autocontenido para Puppeteer
// ──────────────────────────────────────────────────────────────

import { escapeHtml } from '../../common/utils/html.utils';
import { GAS_NIVEL, GAS_ACTIVO } from '../../common/marca/paleta';
import { LOGO_BASE64 } from '../../common/marca/logo';
import type { DocumentoImprimible } from '../../common/documentos/documento-base';

/**
 * La franja verde que corona cada pagina.
 *
 * Va como encabezado de pagina y no en el cuerpo. En el cuerpo era un
 * `position: fixed`, que Chrome repinta en todas las paginas pero sin reservar
 * sitio en ninguna: desde la segunda se pintaba sobre los primeros 5px del
 * texto. Aqui vive en el margen superior, coronando la pagina: es el sitio que
 * Chrome reserva para el encabezado y el unico donde la franja no compite con
 * el contenido. Ojo con `height:100%` aqui dentro — la caja del encabezado es
 * mas alta que el margen, asi que estirarse a ella devuelve la franja al area
 * de texto, que es el fallo que esto viene a arreglar.
 */
const BARRA_SUPERIOR = `
  <div style="box-sizing:border-box;width:100%;margin:0;padding:0;line-height:0">
    <div style="width:100%;height:5px;background:#2d4a3e;-webkit-print-color-adjust:exact;print-color-adjust:exact"></div>
  </div>`;

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
  num_colegiado: string;
  especialidad: string;
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
    .map((c) => {
      const t = GAS_NIVEL[c];
      return `<th style="width:20%;text-align:center;padding:7px 4px;font-size:9.5px;color:${t.texto};font-weight:700;background:${t.fondo};border:1px solid ${t.borde};">${c > 0 ? '+' + c : c}</th>`;
    })
    .join('');

  const labelCells = GAS_COLS
    .map((c) => {
      const t = GAS_NIVEL[c];
      const isActive = c === nivelActual;
      // El nivel alcanzado se invierte para que salte a la vista; el resto
      // conserva el color de su tramo, que es lo que permite leer el SIGNO
      // (por debajo / por encima de lo esperado) sin mirar la etiqueta.
      const bg = isActive ? GAS_ACTIVO.fondo : t.fondo;
      const color = isActive ? GAS_ACTIVO.texto : t.texto;
      const fw = isActive ? 'font-weight:700;' : '';
      const indicator = isActive ? ' ▲' : '';
      return `<td style="background:${bg};color:${color};${fw}text-align:center;padding:7px 5px;font-size:9px;line-height:1.4;vertical-align:top;border:1px solid ${t.borde};">${escapeHtml(GAS_LABELS[c] || '')}${indicator}</td>`;
    })
    .join('');

  const descCells = GAS_COLS
    .map((c) => {
      const t = GAS_NIVEL[c];
      const isActive = c === nivelActual;
      const bg = isActive ? GAS_ACTIVO.fondo : '#ffffff';
      const color = isActive ? GAS_ACTIVO.texto : t.texto;
      return `<td style="background:${bg};color:${color};text-align:center;padding:7px 5px;font-size:9px;line-height:1.4;vertical-align:top;border:1px solid ${t.borde};">${escapeHtml(nivelMap[c] ?? '—')}</td>`;
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

export function buildInformeHtml(
  datos: InformeTemplateData,
): DocumentoImprimible {
  const esSeguimiento = datos.tipo === 'SEGUIMIENTO';
  const esAlta = datos.tipo === 'ALTA';
  const subtitulo = esSeguimiento ? 'INFORME DE SEGUIMIENTO' : esAlta ? 'INFORME DE ALTA' : 'INFORME INICIAL';

  // Escape once — used in both student card and signatures section
  const elaboradoPor = escapeHtml(datos.elaborado_por);

  // ── Secciones del informe ──────────────────────────────────
  // El orden del array ES el orden del documento; la numeración se calcula
  // al renderizar, así que reordenar aquí no obliga a renumerar títulos.
  // La sección GAS es una sección más y puede ir en cualquier posición.
  type Seccion =
    | { tipo: 'texto'; titulo: string; contenido: string }
    | { tipo: 'gas'; titulo: string };

  const GAS_SECCION: Seccion = { tipo: 'gas', titulo: 'Objetivos GAS (Goal Attainment Scaling)' };

  const secciones: Seccion[] = esAlta
    ? [
        { tipo: 'texto', titulo: 'Motivo de consulta / razón del alta', contenido: datos.motivoConsulta },
        { tipo: 'texto', titulo: 'Resumen del proceso terapéutico', contenido: datos.evolucionObservada },
        { tipo: 'texto', titulo: 'Estado al cierre del tratamiento', contenido: datos.evaluacionInicial },
        GAS_SECCION,
        { tipo: 'texto', titulo: 'Recomendaciones de continuidad', contenido: datos.recomendaciones },
      ]
    : esSeguimiento
      ? [
          { tipo: 'texto', titulo: 'Evaluación del período', contenido: datos.evaluacionInicial },
          { tipo: 'texto', titulo: 'Objetivos trabajados', contenido: datos.objetivosGeneralesTexto },
          GAS_SECCION,
          { tipo: 'texto', titulo: 'Objetivos para el próximo período', contenido: datos.objetivosProximoCurso },
          { tipo: 'texto', titulo: 'Recomendaciones', contenido: datos.recomendaciones },
        ]
      : [
          { tipo: 'texto', titulo: 'Motivo de consulta', contenido: datos.motivoConsulta },
          {
            tipo: 'texto',
            titulo: 'Análisis de la información recabada',
            contenido: datos.analisisInformacion
              ? `En el proceso de valoración de ${escapeHtml(datos.alumno.nombre_pila)}, se ha recabado la siguiente información:<br><br>${escapeHtml(datos.analisisInformacion)}`
              : '',
          },
          {
            tipo: 'texto',
            titulo: 'Evaluación inicial',
            contenido: datos.evaluacionInicial
              ? `Tras el proceso de evaluación realizado con ${escapeHtml(datos.alumno.nombre_pila)}, se presentan los siguientes resultados:<br><br>${escapeHtml(datos.evaluacionInicial)}`
              : '',
          },
          {
            tipo: 'texto',
            titulo: 'Objetivos generales de intervención',
            contenido: datos.objetivosGeneralesTexto
              ? `Los objetivos generales de intervención planteados para ${escapeHtml(datos.alumno.nombre_pila)} son los siguientes:<br><br>${escapeHtml(datos.objetivosGeneralesTexto)}`
              : '',
          },
          GAS_SECCION,
        ];

  // ── Sección GAS ─────────────────────────────────────────────
  const gasIntro = `La metodología GAS (Goal Attainment Scaling) permite cuantificar el progreso de ${escapeHtml(datos.alumno.nombre_pila)} estableciendo objetivos individualizados en una escala de cinco niveles, facilitando la medición objetiva del avance terapéutico.`;

  // Single pass over GAS_COLS to build both header and label rows
  const gasResumenCells = GAS_COLS.map((c) => {
    const t = GAS_NIVEL[c];
    return {
      header: `<th style="width:20%;text-align:center;padding:6px 4px;font-size:9.5px;background:${t.fondo};color:${t.texto};font-weight:700;border:1px solid ${t.borde};">${c > 0 ? '+' + c : c}</th>`,
      label:  `<td style="text-align:center;padding:6px 4px;font-size:9px;background:${t.fondo};border:1px solid ${t.borde};color:${t.texto};line-height:1.4;">${escapeHtml(GAS_LABELS[c])}</td>`,
    };
  });
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
                <td style="width:16%;background:#eef2ea;padding:8px 10px;font-size:10px;font-weight:700;color:#255138;border:1px solid #c2cdc3;text-transform:uppercase;letter-spacing:0.4px;">Área</td>
                <td style="padding:8px 10px;font-size:10.5px;color:#273c32;border:1px solid #c2cdc3;background:#f7f5ec;">${escapeHtml(obj.area)}</td>
              </tr>
              <tr>
                <td style="background:#eef2ea;padding:8px 10px;font-size:10px;font-weight:700;color:#255138;border:1px solid #c2cdc3;text-transform:uppercase;letter-spacing:0.4px;">Objetivo</td>
                <td style="padding:8px 10px;font-size:10.5px;color:#23322b;border:1px solid #c2cdc3;background:#ffffff;line-height:1.5;">${escapeHtml(obj.objetivo)}</td>
              </tr>
            </table>
            ${buildGasTableHtml(obj.niveles, obj.nivelActual)}
          </div>`,
          )
          .join('');

  // GAS section allows page breaks within — tables can be taller than one page
  const buildGasSectionHtml = (numero: number, titulo: string) => `
    <div class="section-block gas-section">
      <div class="section-header">
        <div class="section-accent section-accent--blue"></div>
        <div class="section-title">${numero}. ${titulo}</div>
      </div>
      <div class="section-body" style="padding:14px 16px;">
        <p style="font-size:10.5px;line-height:1.7;color:#2d4a3e;margin-bottom:14px;text-align:justify;">${gasIntro}</p>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr>${gasResumenCabecera}</tr></thead>
          <tbody><tr>${gasResumenLabels}</tr></tbody>
        </table>
        <hr class="gas-separator">
        ${gasObjetivosHtml}
      </div>
    </div>`;

  // ── Render ordenado (texto + GAS) con numeración automática ─
  const seccionesHtml = secciones
    .map((s, i) => {
      const numero = i + 1;
      if (s.tipo === 'gas') return buildGasSectionHtml(numero, s.titulo);
      return `
    <div class="section-block">
      <div class="section-header">
        <div class="section-accent"></div>
        <div class="section-title">${numero}. ${s.titulo}</div>
      </div>
      <div class="section-body">
        ${s.contenido || '<em class="empty-text">Sin contenido registrado.</em>'}
      </div>
    </div>`;
    })
    .join('');

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
              <div class="sig-name">Fdo.: ${elaboradoPor}</div>
              ${datos.especialidad ? `<div class="sig-role">${escapeHtml(datos.especialidad)}</div>` : ''}
              ${datos.num_colegiado ? `<div class="sig-role" style="margin-top:1px;">Col. N.º ${escapeHtml(datos.num_colegiado)}</div>` : ''}
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
      <div class="lopd-title">Información sobre protección de datos personales — RGPD (UE) 2016/679 · LOPDGDD 3/2018</div>
      <p class="lopd-text"><strong>Responsable del tratamiento:</strong> Gabinete SL · CIF: B74392815 · C/ Ejemplo, 1 · 28001 Madrid · info@gabinete.es<br>
      <strong>Finalidad:</strong> Prestación de servicios de intervención pedagógica, psicológica y/o terapéutica, elaboración de informes de seguimiento y gestión de la relación terapéutica con el menor.<br>
      <strong>Categoría especial de datos:</strong> Los datos tratados incluyen información relativa a la salud y desarrollo del menor, considerados datos de categoría especial conforme al Art. 9 del RGPD.<br>
      <strong>Base jurídica:</strong> Consentimiento explícito del tutor o tutora legal del menor (Art. 6.1.a y Art. 9.2.a del RGPD). Dicho consentimiento podrá ser retirado en cualquier momento sin que ello afecte a la licitud del tratamiento previo a su retirada.<br>
      <strong>Conservación:</strong> Los datos se conservarán durante la vigencia de la relación terapéutica y, una vez finalizada, durante el plazo legalmente exigible (mínimo 5 años) para atender posibles responsabilidades.<br>
      <strong>Cesiones:</strong> No se cederán datos a terceros salvo obligación legal o cuando sea estrictamente necesario para la prestación del servicio (p.ej. coordinación con otros especialistas con consentimiento previo).<br>
      <strong>Derechos:</strong> Acceso · Rectificación · Supresión · Portabilidad · Oposición · Limitación del tratamiento — mediante solicitud escrita a la dirección indicada, adjuntando copia del DNI del tutor/a legal.<br>
      <strong>Reclamaciones:</strong> Si considera que sus derechos no han sido atendidos, puede reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).</p>
    </div>`;

  // ── HTML final ──────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @page { size: A4; }

    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      color: #23322b;
      line-height: 1.65;
      padding: 0 4mm;
    }

    /* ── Masthead ── */
    .masthead {
      position: relative;
      overflow: hidden;
      background: #2d4a3e;
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
    /* El logo es verde oscuro y aqui va sobre fondo bosque, asi que se sirve
       dentro de un disco claro para que se lea. */
    .masthead-logo {
      position: relative;
      z-index: 2;
      width: 52px; height: 52px;
      border-radius: 50%;
      background: #f0ead8;
      border: 2px solid rgba(255,255,255,0.35);
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .masthead-logo img { width: 34px; height: 34px; object-fit: contain; }
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
      background: #f7f5ec;
      border: 1px solid #d9e8da;
      border-left: 4px solid #2d4a3e;
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
      letter-spacing: 0.8px; color: #2d4a3e; margin-bottom: 1px;
    }
    .sc-value {
      font-size: 11px; font-weight: 500; color: #23322b;
      line-height: 1.4;
    }
    .sc-name { font-size: 13px; font-weight: 600; }
    .sc-divider {
      border: none; border-top: 1px solid #d9e8da;
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
      background: #2d4a3e; border-radius: 2px;
    }
    .section-accent--blue { background: #2d4a3e; }
    .section-title {
      font-size: 10.5px; font-weight: 700;
      color: #23322b; letter-spacing: 0.2px;
    }
    .section-body {
      border: 1px solid #c2cdc3;
      border-left: 3px solid #d9e8da;
      padding: 13px 15px;
      font-size: 11px; line-height: 1.75;
      color: #273c32; text-align: justify;
      border-radius: 0 5px 5px 0;
      background: #fff;
    }
    .empty-text { font-style: italic; color: #798d82; }

    /* ── GAS ── */
    .gas-objetivo {
      break-inside: avoid;
      page-break-inside: avoid;
      display: block;
      overflow: hidden;
      margin-bottom: 16px;
      border: 1px solid #c2cdc3;
      border-radius: 6px;
    }
    .gas-objetivo table {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    .gas-separator {
      border: none;
      border-top: 1.5px solid #d9e8da;
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
      letter-spacing: 0.8px; color: #798d82;
      padding-bottom: 8px;
      border-bottom: 1px solid #c2cdc3;
      margin-bottom: 14px;
    }
    .sig-box {
      border: 1px solid #c2cdc3;
      border-radius: 6px;
      padding: 12px 14px;
      min-height: 88px;
      background: #f7f5ec;
    }
    .sig-name {
      font-size: 10.5px; font-weight: 600; color: #23322b;
      margin-bottom: 1px;
    }
    .sig-role {
      font-size: 9.5px; color: #556d62;
    }
    .sig-line {
      border-top: 1px dashed #a5b4a9;
      margin: 18px 0 6px;
    }
    .sig-label {
      font-size: 8.5px; color: #798d82; text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .signing-place {
      font-size: 10px; color: #556d62; margin-top: 14px;
    }

    /* ── LOPD ── */
    .lopd-section {
      background: #f0ead8;
      border: 1px solid #c2cdc3;
      border-radius: 6px;
      padding: 11px 14px;
      margin-top: 20px;
    }
    .lopd-title {
      font-size: 8px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.7px; color: #798d82; margin-bottom: 5px;
    }
    .lopd-text {
      font-size: 7.5px; line-height: 1.6;
      color: #798d82; text-align: justify;
    }

    /* ── Contact footer ── */
    .doc-footer {
      margin-top: 14px;
      padding-top: 10px;
      border-top: 1px solid #c2cdc3;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .doc-footer-info { font-size: 8px; color: #798d82; }
    .doc-confidential {
      font-size: 7.5px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1.2px; color: #a5b4a9;
    }
  </style>
</head>
<body>

  <!-- ══ MASTHEAD ══════════════════════════════════════════════ -->
  <div class="masthead">
    <!-- Decorative rings -->
    <div class="masthead-ring" style="width:130px;height:130px;right:-35px;top:-40px;"></div>
    <div class="masthead-ring" style="width:90px;height:90px;right:55px;bottom:-40px;background:rgba(240,234,216,0.14);border:none;"></div>
    <div class="masthead-ring" style="width:60px;height:60px;right:-10px;bottom:-10px;"></div>
    <!-- Logo -->
    <div class="masthead-logo"><img src="${LOGO_BASE64}" alt=""></div>
    <!-- Title -->
    <div class="masthead-body">
      <div class="masthead-name">Informe Pedagógico</div>
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
        <div class="sc-value">${escapeHtml(datos.alumno.fecha_nacimiento)}${datos.alumno.edad ? '<span style="color:#2d4a3e;margin-left:6px;font-size:10px;">(' + escapeHtml(datos.alumno.edad) + ')</span>' : ''}</div>
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
        <div class="sc-value">${elaboradoPor}${datos.num_colegiado ? '<span style="color:#798d82;font-size:9.5px;"> · Col. N.º ' + escapeHtml(datos.num_colegiado) + '</span>' : ''}</div>
      </div>
    </div>
  </div>

  <!-- ══ SECCIONES (texto + GAS, en el orden definido arriba) ══ -->
  ${seccionesHtml}

  <!-- ══ FIRMAS ════════════════════════════════════════════════ -->
  ${signaturas}

  <!-- ══ LOPD ══════════════════════════════════════════════════ -->
  ${lopd}

  <!-- ══ PIE ═══════════════════════════════════════════════════ -->
  <div class="doc-footer">
    <div class="doc-footer-info">Documento generado el ${escapeHtml(datos.fecha_elaboracion)} · Belén Palacios</div>
    <div class="doc-confidential">Confidencial</div>
  </div>

</body>
</html>`;

  return { html, opcionesPdf: { headerTemplate: BARRA_SUPERIOR } };
}
