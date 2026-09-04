import { escapeHtml } from '../utils/html.utils';
import { LOGO_BASE64 } from '../marca/logo';
import type { OpcionesPdf } from '../pdf/pdf-generator.service';

/**
 * Chapa comun de los tres documentos del expediente inicial.
 *
 * El contrato y los dos consentimientos comparten membrete, tipografia y
 * bloque de firmas: los tres salen del mismo papel con membrete que la
 * profesional venia usando en Word. Tenerlo en un sitio evita que cambiar el
 * numero de colegiada obligue a tocar tres ficheros.
 */

export function esc(v: unknown): string {
  if (v == null) return '';
  return escapeHtml(String(v));
}

/**
 * Un dato que puede faltar. Si falta, se imprime una linea para rellenar a
 * mano, que es exactamente lo que hacian las plantillas de Word.
 */
export function hueco(valor: string | null | undefined, ancho = 180): string {
  const limpio = valor == null ? '' : String(valor).trim();
  if (limpio.length > 0) return `<strong>${esc(limpio)}</strong>`;
  return `<span class="hueco" style="min-width:${ancho}px"></span>`;
}

/** Datos de la profesional que encabezan todos los documentos. */
export interface Profesional {
  nombreCompleto: string;
  nif: string | null;
  numeroColegiado: string | null;
  colegioProfesional: string | null;
  direccionProfesional: string | null;
  email: string;
  numeroPoliza: string | null;
}

export const ESTILOS_BASE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 11px;
    color: #23322b;
    background: #fff;
    line-height: 1.5;
  }

  h2.clausula {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #2d4a3e;
    margin: 16px 0 7px;
  }
  h3.sub {
    font-size: 10px;
    font-weight: 700;
    color: #2f6b43;
    margin: 11px 0 5px;
  }

  p { margin-bottom: 7px; text-align: justify; }
  strong { color: #1f2a24; }
  em { color: #556d62; }

  ul { margin: 0 0 8px 18px; }
  li { margin-bottom: 3px; text-align: justify; }

  /* Los huecos por rellenar se ven como la raya del documento original. */
  .hueco {
    display: inline-block;
    border-bottom: 1px solid #798d82;
    height: 11px;
    vertical-align: baseline;
  }

  .tabla-calendario {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    margin: 10px 0 12px;
  }
  /* Que la cabecera se repita cuando la tabla parte pagina; si no, las filas
     de la segunda pagina quedan sin saber a que columna pertenecen. */
  .tabla-calendario thead { display: table-header-group; }
  .tabla-calendario tr { break-inside: avoid; page-break-inside: avoid; }

  .tabla-calendario th {
    background: #e3eae0;
    color: #2d4a3e;
    font-weight: 700;
    text-align: left;
    padding: 6px 9px;
    border: 1px solid #c2cdc3;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 9px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .tabla-calendario td { padding: 6px 9px; border: 1px solid #c2cdc3; vertical-align: top; }
  .tabla-calendario td.mes { font-weight: 700; color: #23322b; white-space: nowrap; }
  .tabla-calendario td.dias { font-weight: 600; white-space: nowrap; }
  .tabla-calendario .sin-sesion { color: #96382e; font-weight: 700; }

  .nota-pie { font-size: 9.5px; color: #556d62; font-style: italic; margin-top: 6px; }

  .aviso-borrador {
    background: #f5ecd8;
    border: 1px solid #8a6018;
    border-radius: 4px;
    padding: 9px 12px;
    font-size: 10px;
    color: #8a6018;
    margin-bottom: 14px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .casilla { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 9px; }
  .casilla .marca {
    width: 12px; height: 12px; flex-shrink: 0; margin-top: 2px;
    border: 1.2px solid #556d62; border-radius: 2px;
  }

  .firmas { margin-top: 22px; break-inside: avoid; page-break-inside: avoid; }
  .firmas table { width: 100%; border-collapse: collapse; }
  .firmas td {
    border: 1px solid #23322b;
    padding: 10px 12px 44px;
    vertical-align: top;
    font-size: 10.5px;
    font-weight: 700;
    width: 50%;
  }
  .firmas td.solo { width: 100%; }
  .firmas .sep { height: 12px; border: none; padding: 0; }

  .lugar-fecha { margin: 18px 0 6px; }

  .datos-tabla { width: 100%; border-collapse: collapse; font-size: 10.5px; margin-bottom: 10px; }
  .datos-tabla td { border: 1px solid #c2cdc3; padding: 7px 9px; }
  .datos-tabla td.etiqueta { background: #f0ead8; font-weight: 600; color: #2d4a3e; width: 26%;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
`;

/**
 * Altura reservada arriba para el membrete.
 *
 * Medido: Chrome empieza a pintar el encabezado a 0,53 cm del borde del papel
 * y el membrete mide 2,47 cm, o sea que acaba sobre los 3,0 cm. Lo que se pase
 * de este margen Chrome lo RECORTA sin avisar, asi que los 4 mm que sobran son
 * el colchon para que un email largo o un nombre en dos lineas no se corten.
 * Si el membrete crece de verdad, hay que subir esto con el.
 */
export const MARGEN_SUPERIOR_MEMBRETE = '3.4cm';

/**
 * Membrete como encabezado de pagina: logo, identidad de la profesional y
 * titulo del documento.
 *
 * Va en el margen de la pagina (`headerTemplate` de Puppeteer), no en el
 * cuerpo, que es lo unico que hace que reserve sitio en TODAS las paginas y no
 * solo en la primera. A cambio, Chrome lo renderiza en un documento aparte que
 * no ve el CSS de la pagina: de ahi que los estilos vayan en linea, que cada
 * nodo con texto declare su `font-size` (el heredado ahi vale 0) y que los
 * fondos lleven `print-color-adjust`.
 */
export function membreteHeaderTemplate(titulo: string, p: Profesional): string {
  const colegiada = p.numeroColegiado
    ? `Pedagoga colegiada Nº ${esc(p.numeroColegiado)}`
    : 'Pedagoga colegiada';
  const exacto = '-webkit-print-color-adjust:exact;print-color-adjust:exact';
  // El encabezado ocupa el ancho del papel, no el del contenido: el padding
  // lateral lo alinea con el cuerpo, que se imprime con margenes de 1,5 cm.
  const marco =
    `box-sizing:border-box;width:100%;padding:0 1.5cm;margin:0;` +
    `font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#23322b;${exacto}`;
  const fila =
    `box-sizing:border-box;display:flex;align-items:center;gap:14px;` +
    `border:1px solid #c2cdc3;border-radius:4px;padding:8px 12px;background:#fff;${exacto}`;
  const tit =
    `box-sizing:border-box;margin-top:5px;background:#e3eae0;` +
    `border:1px solid #c2cdc3;border-radius:3px;padding:5px 12px;font-size:10.5px;` +
    `font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#2d4a3e;` +
    `text-align:center;line-height:1.5;${exacto}`;
  return `
  <div style="${marco}">
    <div style="${fila}">
      <div style="width:42px;flex-shrink:0"><img src="${LOGO_BASE64}" alt="" style="width:100%;display:block"></div>
      <div style="margin-left:auto;text-align:right;line-height:1.4">
        <div style="font-weight:700;font-size:11.5px;color:#23322b">${esc(p.nombreCompleto)}</div>
        <div style="font-size:9.5px;color:#556d62">${colegiada}</div>
        <div style="font-size:9.5px;color:#556d62">${esc(p.email)}</div>
      </div>
    </div>
    <div style="${tit}">${esc(titulo)}</div>
  </div>`;
}

/** "En ____, a __ de ______ de 20__." Se deja en huecos a proposito. */
export function lugarYFecha(ciudad?: string | null): string {
  return `<p class="lugar-fecha">En ${hueco(ciudad, 150)}, a ${hueco(null, 40)} de ${hueco(null, 110)} de 20${hueco(null, 26)}.</p>`;
}

/** Dos recuadros para los representantes legales y uno para la profesional. */
export function bloqueFirmas(nombreProfesional: string): string {
  return `
  <div class="firmas">
    <table>
      <tr>
        <td>Fdo: Representante legal 1</td>
        <td>Fdo: Representante legal 2</td>
      </tr>
    </table>
    <div class="sep" style="height:12px"></div>
    <table>
      <tr><td class="solo">Fdo: La profesional — ${esc(nombreProfesional)}</td></tr>
    </table>
  </div>`;
}

/**
 * Un documento listo para imprimir: el HTML del cuerpo y las opciones con las
 * que hay que llevarlo al PDF.
 *
 * Van juntos a proposito. El titulo aparece en el encabezado, que ya no forma
 * parte del HTML, y la altura del margen depende de ese encabezado: separarlos
 * obligaria a repetir el titulo en dos sitios y a mantener el margen a mano.
 */
export interface DocumentoImprimible {
  html: string;
  opcionesPdf: OpcionesPdf;
}

/** Envuelve el cuerpo en el documento completo. */
export function documento(
  titulo: string,
  p: Profesional,
  cuerpo: string,
  estilosExtra = '',
): DocumentoImprimible {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<style>
${ESTILOS_BASE}
${estilosExtra}
</style>
</head>
<body>
<div class="cuerpo">
${cuerpo}
</div>
</body>
</html>`;
  return {
    html,
    opcionesPdf: {
      margin: { top: MARGEN_SUPERIOR_MEMBRETE },
      headerTemplate: membreteHeaderTemplate(titulo, p),
    },
  };
}
