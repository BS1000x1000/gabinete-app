/**
 * Renderiza el expediente de un contrato REAL de la base de datos, sin subir
 * nada a Object Storage.
 *
 * Sirve para comprobar el trayecto completo de datos —Prisma, el include, la
 * eleccion de tutores, los festivos guardados y el calculo del calendario—
 * que los tests unitarios cubren con mocks.
 *
 * Uso:  npx ts-node -T scripts/previsualizar-contrato-real.ts <contratoId> [salida]
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PrismaClient } from '@prisma/client';

import { PdfGeneratorService } from '../src/common/pdf/pdf-generator.service';
import type { DocumentoImprimible } from '../src/common/documentos/documento-base';

import { CONTRATO_PDF_INCLUDE } from '../src/contratos/contratos.include';
import { ContratosPdfService } from '../src/contratos/contratos-pdf.service';
import { CalendarioContratoService } from '../src/expediente/calendario-contrato.service';
import { FestivosService } from '../src/festivos/festivos.service';
import { buildContratoHtml } from '../src/contratos/templates/contrato.template';
import { buildConsentimientoInformadoHtml } from '../src/expediente/templates/consentimiento-informado.template';
import { buildConsentimientoDatosHtml } from '../src/expediente/templates/consentimiento-datos.template';

const contratoId = process.argv[2];
const salida = process.argv[3] ?? join(process.cwd(), 'tmp-expediente-real');

if (!contratoId) {
  console.error('Falta el id del contrato.');
  process.exit(1);
}
mkdirSync(salida, { recursive: true });

async function main() {
  const prisma = new PrismaClient();
  const contrato = await prisma.contratoServicio.findUnique({
    where: { id: contratoId },
    include: CONTRATO_PDF_INCLUDE,
  });
  if (!contrato) {
    console.error(`No existe el contrato ${contratoId}`);
    process.exit(1);
  }

  const calendario = new CalendarioContratoService();
  const festivos = new FestivosService(prisma as any);
  const svc = new ContratosPdfService(null as any, prisma as any, calendario, festivos);

  const datos = await svc.construirDatos(contrato as any);
  const faltantes = svc.faltantes(contrato as any);

  console.log('Menor      :', datos.menor.nombreCompleto, '·', datos.menor.fechaNacimiento ?? 'sin fecha');
  console.log('Tutores    :', datos.tutores.map(t => `${t.nombreCompleto || '(sin nombre)'} [${t.nif ?? 'sin NIF'}]`).join(' | ') || '(ninguno)');
  console.log('Dia/hora   :', datos.diaSemana, datos.horario);
  console.log('Cuota      :', datos.cuotaMensual);
  console.log('Curso      :', datos.cursoEtiqueta, '·', datos.calendario.length, 'meses');
  console.log('Navidad    :', datos.periodoNavidad);
  console.log('S. Santa   :', datos.periodoSemanaSanta);
  console.log('Faltantes  :', faltantes.length ? faltantes.join('; ') : 'ninguno');
  console.log('\nCalendario calculado con los festivos de la BD:');
  for (const f of datos.calendario) {
    const obs = f.observaciones.join(' / ');
    console.log(`  ${f.mes} ${f.anio}: ${f.diasTexto}   | ${obs}`);
  }

  const pdf = new PdfGeneratorService();
  const aPdf = async (doc: DocumentoImprimible, fichero: string) => {
    const buf = await pdf.generatePdf(doc.html, doc.opcionesPdf);
    writeFileSync(join(salida, fichero), buf);
    console.log(`  ${fichero} (${(buf.length / 1024).toFixed(0)} KB)`);
  };

  console.log('\nPDF:');
  await aPdf(buildContratoHtml(datos), 'REAL_contrato.pdf');
  await aPdf(
    buildConsentimientoInformadoHtml({
      profesional: datos.profesional,
      menor: datos.menor,
      tutores: datos.tutores,
      ciudadFirma: datos.ciudadFirma,
    }),
    'REAL_consentimiento-informado.pdf',
  );
  await aPdf(
    buildConsentimientoDatosHtml({
      profesional: datos.profesional,
      menor: { nombreCompleto: datos.menor.nombreCompleto, dni: null },
      tutores: datos.tutores,
      ciudadFirma: datos.ciudadFirma,
    }),
    'REAL_consentimiento-datos.pdf',
  );

  await prisma.$disconnect();
  console.log(`\nListo en: ${salida}`);
}

main().catch(async err => {
  console.error(err);
  process.exit(1);
});
