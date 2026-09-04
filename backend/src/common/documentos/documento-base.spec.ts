import {
  documento,
  membreteHeaderTemplate,
  MARGEN_SUPERIOR_MEMBRETE,
  Profesional,
} from './documento-base';
import { LOGO_BASE64 } from '../marca/logo';

/**
 * El membrete tiene que repetirse en TODAS las paginas sin comerse la primera
 * linea de ninguna.
 *
 * Estuvo hecho con un `position: fixed` en el cuerpo, que Chrome repinta en
 * cada pagina pero sin reservar sitio en ninguna: el hueco lo abria un
 * `padding-top` del cuerpo, que solo empuja una vez. De la segunda pagina en
 * adelante el texto arrancaba debajo del membrete. De ahi que estos tests
 * vigilen sobre todo lo que ya NO puede volver al HTML.
 */

const PROFESIONAL: Profesional = {
  nombreCompleto: 'Belén Palacios Aguirre',
  nif: '00000000-A',
  numeroColegiado: '48698',
  colegioProfesional: 'COPPMadrid',
  direccionProfesional: 'Calle de Ejemplo 1, Madrid',
  email: 'ejemplo@ejemplo.es',
  numeroPoliza: null,
};

const TITULO = 'Contrato de prestación de servicios pedagógicos';

describe('documento()', () => {
  const doc = documento(TITULO, PROFESIONAL, '<p>Cuerpo del documento</p>');

  it('no deja el membrete fijo en el cuerpo', () => {
    expect(doc.html).not.toContain('position: fixed');
    expect(doc.html).not.toContain('class="membrete"');
  });

  it('no compensa el membrete con padding, que solo valia para la pagina 1', () => {
    expect(doc.html).not.toContain('padding-top: 86px');
  });

  it('manda el membrete como encabezado de pagina y reserva su margen', () => {
    expect(doc.opcionesPdf.headerTemplate).toContain(TITULO);
    expect(doc.opcionesPdf.margin?.top).toBe(MARGEN_SUPERIOR_MEMBRETE);
  });

  it('conserva el cuerpo', () => {
    expect(doc.html).toContain('<p>Cuerpo del documento</p>');
  });
});

describe('membreteHeaderTemplate()', () => {
  it('lleva identidad, logo y titulo, porque se renderiza sin el CSS de la pagina', () => {
    const h = membreteHeaderTemplate(TITULO, PROFESIONAL);
    expect(h).toContain(PROFESIONAL.nombreCompleto);
    expect(h).toContain('Pedagoga colegiada Nº 48698');
    expect(h).toContain(PROFESIONAL.email);
    expect(h).toContain(LOGO_BASE64);
  });

  it('declara el tamaño de fuente: el heredado ahi vale 0', () => {
    expect(membreteHeaderTemplate(TITULO, PROFESIONAL)).toContain('font-size:');
  });

  it('fuerza la impresion de fondos, que por defecto no salen', () => {
    expect(membreteHeaderTemplate(TITULO, PROFESIONAL)).toContain(
      'print-color-adjust:exact',
    );
  });

  it('escapa el titulo', () => {
    const h = membreteHeaderTemplate('Contrato <script>', PROFESIONAL);
    expect(h).not.toContain('<script>');
    expect(h).toContain('&lt;script&gt;');
  });

  it('cabe en el margen que se reserva para el', () => {
    // Medido en Chrome: el encabezado empieza a 0,53 cm del borde y el
    // membrete mide 2,47 cm. Si el margen baja de ahi, Chrome lo recorta.
    expect(parseFloat(MARGEN_SUPERIOR_MEMBRETE)).toBeGreaterThan(0.53 + 2.47);
  });
});
