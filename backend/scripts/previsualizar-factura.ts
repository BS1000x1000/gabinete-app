/**
 * Genera una factura de ejemplo en PDF para compararla a ojo con el modelo del
 * gabinete (`Modelo factura/Factura.pdf`).
 *
 * Uso:  npx ts-node -T scripts/previsualizar-factura.ts [carpeta-salida]
 *
 * No toca la base de datos ni Object Storage: solo plantilla + Puppeteer.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

import { buildFacturaHtml } from '../src/facturas/templates/factura.template';

const salida = process.argv[2] ?? join(process.cwd(), 'tmp-factura');
mkdirSync(salida, { recursive: true });

const HTML = buildFacturaHtml({
  nombreFiscal: 'Belén Palacios Aguirre',
  nifFiscal: '47461696-T',
  direccionFiscal: 'Calle María Moliner Nº4 P²3ºC',
  codigoPostalFiscal: '28942',
  ciudadFiscal: 'Fuenlabrada',
  provinciaFiscal: 'Madrid',
  numeroColegiado: '48698',
  iban: 'ES76 2100 8222 1302 0035 7005',
  swift: 'CAIXESBBXXX',
  emailFacturacion: 'belen.depedagogia@gmail.com',

  nombreTutorPagador: 'Ana Martínez Ruiz',
  nifTutorPagador: '87654321-B',
  direccionFiscalTutor: 'Calle de la Luna 5, 2º A',
  codigoPostalTutor: '28942',
  ciudadTutor: 'Fuenlabrada',

  numeroFormateado: '1/2026',
  fechaEmision: '01/09/2026',
  periodoFacturado: '2026-09',
  periodoEtiqueta: 'SEPTIEMBRE 2026',
  fechaVencimiento: '10/09/2026',
  formaPago: 'Transferencia bancaria',
  concepto:
    'Servicios profesionales de reeducación pedagógica y apoyo al aprendizaje adaptado al currículo escolar',
  importe: 180,
  ivaPorcentaje: 0,
  ivaImporte: 0,
  retencionPorcentaje: 0,
  retencionImporte: 0,
  exencionIvaTexto: 'Factura exenta de I.V.A (Artículo 20. Uno. 10º. Ley 37/1992)',
  total: 180,
});

async function main() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  });
  const page = await browser.newPage();
  await page.setContent(HTML, { waitUntil: 'networkidle0', timeout: 30_000 });

  const destino = join(salida, 'FACTURA_EJEMPLO.pdf');
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '2cm', bottom: '2cm', left: '1.5cm', right: '1.5cm' },
  });
  writeFileSync(destino, pdf);

  writeFileSync(join(salida, 'FACTURA_EJEMPLO.html'), HTML, 'utf-8');

  await browser.close();
  console.log(`Listo: ${destino}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
