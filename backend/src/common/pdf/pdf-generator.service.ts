import { Injectable, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.name);

  async generatePdf(html: string): Promise<Buffer> {
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
      const buffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '2cm', bottom: '2cm', left: '1.5cm', right: '1.5cm' },
      });
      this.logger.log(`✅ PDF generado: ${buffer.length} bytes`);
      return Buffer.from(buffer);
    } finally {
      await browser.close();
    }
  }
}
