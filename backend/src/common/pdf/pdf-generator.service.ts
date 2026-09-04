import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

/**
 * Opciones de impresion de un documento concreto.
 *
 * Existe sobre todo por la cabecera repetida: en Chrome, un elemento del cuerpo
 * con `position: fixed` se repinta en todas las paginas pero NO reserva sitio
 * en ninguna, asi que a partir de la segunda se come la primera linea. El unico
 * mecanismo que reserva hueco pagina a pagina es el encabezado de pagina, que
 * vive en el margen — igual que el encabezado de Word.
 */
export interface OpcionesPdf {
  margin?: { top?: string; bottom?: string; left?: string; right?: string };
  /** HTML autocontenido: se renderiza en un documento aparte, sin el CSS de la pagina. */
  headerTemplate?: string;
  footerTemplate?: string;
}

const MARGEN_POR_DEFECTO = {
  top: '2cm',
  bottom: '2cm',
  left: '1.5cm',
  right: '1.5cm',
};

/**
 * Con `displayHeaderFooter` activo y sin pie, Chrome imprime el suyo: la fecha
 * y `about:blank` al pie de cada pagina. Este hueco lo silencia.
 */
const PIE_VACIO = '<div></div>';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generatePdf(html: string, opciones: OpcionesPdf = {}): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30_000 });

      const conCabecera =
        opciones.headerTemplate != null || opciones.footerTemplate != null;

      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { ...MARGEN_POR_DEFECTO, ...(opciones.margin ?? {}) },
        ...(conCabecera
          ? {
              displayHeaderFooter: true,
              headerTemplate: opciones.headerTemplate ?? PIE_VACIO,
              footerTemplate: opciones.footerTemplate ?? PIE_VACIO,
            }
          : {}),
      });
      this.logger.log(`✅ PDF generado: ${buffer.length} bytes`);
      return Buffer.from(buffer);
    } finally {
      await browser.close();
    }
  }
}
