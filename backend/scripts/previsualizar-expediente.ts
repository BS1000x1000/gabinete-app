/**
 * Genera los tres documentos del expediente inicial con datos de ejemplo y los
 * deja en PDF para poder compararlos a ojo con los originales del gabinete.
 *
 * Uso:  npx ts-node -T scripts/previsualizar-expediente.ts [carpeta-salida]
 *
 * No toca la base de datos ni Object Storage: solo plantilla + Puppeteer.
 */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PdfGeneratorService } from '../src/common/pdf/pdf-generator.service';
import { buildContratoHtml } from '../src/contratos/templates/contrato.template';
import { buildConsentimientoInformadoHtml } from '../src/expediente/templates/consentimiento-informado.template';
import { buildConsentimientoDatosHtml } from '../src/expediente/templates/consentimiento-datos.template';
import { CalendarioContratoService } from '../src/expediente/calendario-contrato.service';
import {
  Profesional,
  DocumentoImprimible,
} from '../src/common/documentos/documento-base';

const salida = process.argv[2] ?? join(process.cwd(), 'tmp-expediente');
mkdirSync(salida, { recursive: true });

const PROFESIONAL: Profesional = {
  nombreCompleto: 'Belén Palacios Aguirre',
  nif: '47461696-T',
  numeroColegiado: '48698',
  colegioProfesional:
    'Colegio Oficial de Doctores y Licenciados en Filosofía y Letras y en Ciencias de la Comunidad de Madrid',
  direccionProfesional: 'Calle María Moliner, Fuenlabrada, 28942 Madrid',
  email: 'belen.depedagogia@gmail.com',
  numeroPoliza: '2008265',
};

const TUTORES = [
  { nombreCompleto: 'María López Serrano', nif: '05123456-K' },
  { nombreCompleto: 'Javier Ortega Ruiz', nif: '51234567-B' },
];

const MENOR = {
  nombreCompleto: 'Lucía Ortega López',
  fechaNacimiento: '14/03/2016',
  dni: null as string | null,
};

// Mismo calendario oficial que usa el test del caso de oro.
const f = (a: number, m: number, d: number, descripcion: string) => ({
  fecha: new Date(a, m - 1, d, 12, 0, 0, 0),
  descripcion,
});
const FESTIVOS = [
  f(2026, 10, 12, 'Fiesta Nacional de España'),
  f(2026, 11, 2, 'Fiesta de Todos los Santos'),
  f(2026, 12, 7, 'Día de la Constitución Española'),
  f(2026, 12, 8, 'Inmaculada Concepción'),
  f(2026, 12, 25, 'Natividad del Señor'),
  f(2027, 1, 1, 'Año Nuevo'),
  f(2027, 1, 6, 'Epifanía del Señor'),
  f(2027, 3, 25, 'Jueves Santo'),
  f(2027, 3, 26, 'Viernes Santo'),
  f(2027, 5, 1, 'Fiesta del Trabajo'),
  f(2027, 5, 2, 'Fiesta de la Comunidad de Madrid'),
  f(2027, 7, 25, 'Santiago Apóstol'),
];

async function main() {
  const calendario = new CalendarioContratoService();
  const curso = { anioInicio: 2026 };

  // El MISMO servicio que produccion: con otros margenes, lo que se ve aqui
  // no es lo que sale del gabinete.
  const pdf = new PdfGeneratorService();

  const aPdf = async (doc: DocumentoImprimible, fichero: string) => {
    const buffer = await pdf.generatePdf(doc.html, doc.opcionesPdf);
    writeFileSync(join(salida, fichero), buffer);
    console.log(`  ${fichero}  (${(buffer.length / 1024).toFixed(0)} KB)`);
  };

  for (const [diaISO, nombre] of [[1, 'lunes'], [5, 'viernes']] as const) {
    const filas = calendario.construirTabla(diaISO, curso, FESTIVOS);
    const doc = buildContratoHtml({
      profesional: PROFESIONAL,
      tutores: TUTORES,
      menor: { nombreCompleto: MENOR.nombreCompleto, fechaNacimiento: MENOR.fechaNacimiento },
      diaSemana: diaISO,
      horario: '17:00 a 18:00',
      cuotaMensual: 180,
      fechaInicioEfectos: '1 de septiembre de 2026',
      ciudadFirma: 'Madrid',
      calendario: filas,
      cursoEtiqueta: calendario.etiquetaCurso(curso),
      calendarioEtiqueta: 'Comunidad de Madrid · Fuenlabrada',
      calendarioSinMunicipio: false,
      periodoNavidad: calendario.textoPeriodosSinServicio(curso, FESTIVOS).navidad,
      periodoSemanaSanta: calendario.textoPeriodosSinServicio(curso, FESTIVOS).semanaSanta,
      notas: null,
    });
    await aPdf(doc, `CONTRATO_${nombre}.pdf`);
    console.log(
      `    sesiones efectivas del curso: ${calendario.totalSesiones(filas)}`,
    );
  }

  await aPdf(
    buildConsentimientoInformadoHtml({
      profesional: PROFESIONAL,
      menor: { nombreCompleto: MENOR.nombreCompleto, fechaNacimiento: MENOR.fechaNacimiento },
      tutores: TUTORES,
      ciudadFirma: 'Madrid',
    }),
    'CONSENTIMIENTO_INFORMADO.pdf',
  );

  await aPdf(
    buildConsentimientoDatosHtml({
      profesional: PROFESIONAL,
      menor: { nombreCompleto: MENOR.nombreCompleto, dni: MENOR.dni },
      tutores: TUTORES,
      ciudadFirma: 'Madrid',
    }),
    'CONSENTIMIENTO_DATOS.pdf',
  );

  console.log(`\nListo en: ${salida}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
