import { buildInformeHtml, InformeTemplateData } from './informe.template';

/**
 * La franja verde corona todas las paginas. Estuvo hecha con un
 * `position: fixed` en el cuerpo, que Chrome repinta en cada pagina pero sin
 * reservar sitio: desde la segunda se pintaba sobre los primeros pixeles del
 * texto. Ahora va en el margen, como encabezado de pagina.
 */

const DATOS: InformeTemplateData = {
  titulo: 'Informe pedagógico inicial',
  tipo: 'INICIAL',
  elaborado_por: 'Belén Palacios Aguirre',
  num_colegiado: '48698',
  especialidad: 'Pedagogía',
  fecha_elaboracion: '04/09/2026',
  alumno: {
    nombre: 'Nombre Apellido',
    nombre_pila: 'Nombre',
    fecha_nacimiento: '12/03/2015',
    edad: '11 años',
    curso: '6º Primaria',
    colegio: 'CEIP Ejemplo',
  },
  motivoConsulta: 'Texto del motivo.',
  analisisInformacion: '',
  evaluacionInicial: '',
  objetivosGeneralesTexto: '',
  evolucionObservada: '',
  objetivosProximoCurso: '',
  recomendaciones: '',
  snapshot: [],
};

describe('buildInformeHtml()', () => {
  const doc = buildInformeHtml(DATOS);

  it('no deja la franja fija en el cuerpo', () => {
    expect(doc.html).not.toContain('page-stripe');
    expect(doc.html).not.toContain('position: fixed');
  });

  it('la manda como encabezado de pagina', () => {
    expect(doc.opcionesPdf.headerTemplate).toContain('#2d4a3e');
  });

  it('no se estira a la caja del encabezado, que es mas alta que el margen', () => {
    expect(doc.opcionesPdf.headerTemplate).not.toContain('height:100%');
  });

  it('conserva el contenido del informe', () => {
    expect(doc.html).toContain('Texto del motivo.');
    expect(doc.html).toContain('Nombre Apellido');
  });
});
