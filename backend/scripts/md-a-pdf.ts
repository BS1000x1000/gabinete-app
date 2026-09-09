/**
 * Convierte un documento Markdown en un PDF con el membrete del gabinete.
 *
 * Existe porque los documentos de cumplimiento (informe tecnico, registro de
 * actividades del art. 30) se escriben y versionan en Markdown —que es lo
 * comodo para mantenerlos— pero se entregan a terceros, y un despacho que abre
 * un `.md` ve almohadillas y barras verticales. El PDF sale ademas con el mismo
 * aspecto que el contrato y los consentimientos, de modo que el paquete entero
 * se lee como una sola cosa.
 *
 * Uso:  npx ts-node -T scripts/md-a-pdf.ts <entrada.md> [salida.pdf]
 *
 * No toca la base de datos ni Object Storage: solo plantilla y Puppeteer.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { basename, dirname, join } from 'path';
import { marked } from 'marked';
import { PdfGeneratorService } from '../src/common/pdf/pdf-generator.service';
import { LOGO_BASE64 } from '../src/common/marca/logo';

const entrada = process.argv[2];
if (!entrada) {
  console.error('Falta el fichero de entrada.');
  console.error('Uso: npx ts-node -T scripts/md-a-pdf.ts <entrada.md> [salida.pdf]');
  process.exit(1);
}

const salida = process.argv[3] ?? entrada.replace(/\.md$/i, '.pdf');

/**
 * El titulo del documento es el primer `#` del Markdown. Se usa en el
 * encabezado de cada pagina, que es lo que permite identificar una hoja suelta
 * si el documento se imprime y se desgrana.
 */
function tituloDe(md: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : basename(entrada);
}

/**
 * Paleta y tipografia calcadas de los documentos del gabinete
 * (`common/documentos/documento-base.ts`), para que el paquete sea homogeneo.
 */
const ESTILOS = `
  @page { size: A4; }

  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.55;
    color: #23322b;
    margin: 0;
  }

  h1 {
    font-size: 19pt;
    color: #2d4a3e;
    margin: 0 0 4pt;
    line-height: 1.25;
  }
  h2 {
    font-size: 13.5pt;
    color: #2d4a3e;
    margin: 22pt 0 8pt;
    padding-bottom: 4pt;
    border-bottom: 1.5pt solid #2d4a3e;
    /* Un epigrafe suelto al pie de una pagina es ruido: que arrastre texto. */
    page-break-after: avoid;
  }
  h3 {
    font-size: 11.5pt;
    color: #1f2a24;
    margin: 16pt 0 6pt;
    page-break-after: avoid;
  }
  h4 { font-size: 10.5pt; margin: 12pt 0 4pt; page-break-after: avoid; }

  p { margin: 0 0 8pt; text-align: justify; }
  ul, ol { margin: 0 0 8pt; padding-left: 18pt; }
  li { margin-bottom: 3pt; }

  strong { color: #1f2a24; }

  code {
    font-family: "Consolas", "Courier New", monospace;
    font-size: 9pt;
    background: #eef4ec;
    padding: 1pt 3pt;
    border-radius: 2pt;
  }
  pre {
    background: #eef4ec;
    border-left: 3pt solid #2d4a3e;
    padding: 8pt 10pt;
    font-size: 9pt;
    overflow-wrap: break-word;
    white-space: pre-wrap;
    page-break-inside: avoid;
  }
  pre code { background: none; padding: 0; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 12pt;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  th {
    background: #2d4a3e;
    color: #fff;
    text-align: left;
    padding: 5pt 7pt;
    font-weight: 600;
  }
  td {
    padding: 5pt 7pt;
    border-bottom: 0.5pt solid #c2cdc3;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #f0ead8; }

  /* Las citas del documento no son citas: son avisos y advertencias. */
  blockquote {
    margin: 10pt 0;
    padding: 8pt 12pt;
    background: #f0ead8;
    border-left: 3pt solid #8a6018;
    page-break-inside: avoid;
  }
  blockquote p:last-child { margin-bottom: 0; }

  hr {
    border: none;
    border-top: 0.5pt solid #c2cdc3;
    margin: 18pt 0;
  }

  a { color: #2d4a3e; }
`;

/** Encabezado de pagina: vive en el margen, asi que reserva sitio en todas. */
function encabezado(titulo: string): string {
  return `
    <div style="width:100%; font-family:Helvetica,Arial,sans-serif; font-size:7pt;
                color:#556d62; padding:0 1.5cm; display:flex; align-items:center;
                justify-content:space-between; border-bottom:0.5pt solid #c2cdc3;
                padding-bottom:4pt;">
      <img src="${LOGO_BASE64}" style="height:22px;" />
      <span>${titulo}</span>
    </div>`;
}

/** Pie con numeracion: un documento de cumplimiento se cita por pagina. */
const PIE = `
  <div style="width:100%; font-family:Helvetica,Arial,sans-serif; font-size:7pt;
              color:#798d82; padding:0 1.5cm; display:flex;
              justify-content:space-between;">
    <span>Documento confidencial — uso interno y de la asesoría de protección de datos</span>
    <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
  </div>`;

async function main() {
  const md = readFileSync(entrada, 'utf8');
  const titulo = tituloDe(md);

  // `gfm` es lo que habilita las tablas, que es la mitad del documento.
  const cuerpo = marked.parse(md, { gfm: true, breaks: false }) as string;

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
    <title>${titulo}</title><style>${ESTILOS}</style></head>
    <body>${cuerpo}</body></html>`;

  const pdf = new PdfGeneratorService();
  const buffer = await pdf.generatePdf(html, {
    margin: { top: '2.2cm', bottom: '1.8cm', left: '1.6cm', right: '1.6cm' },
    headerTemplate: encabezado(titulo),
    footerTemplate: PIE,
  });

  mkdirSync(dirname(salida), { recursive: true });
  writeFileSync(salida, buffer);

  const kb = Math.round(buffer.length / 1024);
  console.log(`  ${basename(salida)}  (${kb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
