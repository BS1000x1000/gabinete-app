import {
  documento,
  bloqueFirmas,
  esc,
  hueco,
  Profesional,
} from '../../common/documentos/documento-base';

/**
 * Consentimiento informado para el tratamiento de datos personales.
 *
 * ATENCION: esta plantilla NO esta validada. El documento de origen llega con
 * cinco marcadores `[CONSULTOR]` sin resolver en las secciones 5 (base legal) y
 * 6 (plazos de conservacion), y la duda de fondo es sustantiva: si el
 * tratamiento de datos de salud se ampara en el art. 9.2.h (profesional
 * sanitario) o en el 9.2.a (consentimiento explicito), siendo la profesional
 * pedagoga y no sanitaria.
 *
 * Mientras `PLANTILLA_VALIDADA` sea false, el expediente deja generar y revisar
 * el documento pero bloquea su envio a las familias, y el PDF sale con una
 * franja de aviso bien visible para que nadie lo entregue por error.
 *
 * Para cerrarlo: sustituir el texto de las secciones 5 y 6 por el que fije el
 * dictamen, subir `PLANTILLA_VERSION` y poner `PLANTILLA_VALIDADA` a true.
 */

export const PLANTILLA_VERSION = 'consentimiento-datos-v0-borrador-2026-09';
export const PLANTILLA_VALIDADA = false;

export const MOTIVO_NO_VALIDADA =
  'Las secciones de base legal y plazos de conservación están pendientes del ' +
  'dictamen del consultor de protección de datos.';

export interface ConsentimientoDatosData {
  profesional: Profesional;
  menor: { nombreCompleto: string; dni: string | null };
  tutores: Array<{ nombreCompleto: string; nif: string | null }>;
  ciudadFirma: string | null;
}

export function buildConsentimientoDatosHtml(d: ConsentimientoDatosData): string {
  const p = d.profesional;
  const t1 = d.tutores[0] ?? { nombreCompleto: '', nif: null };
  const t2 = d.tutores[1] ?? { nombreCompleto: '', nif: null };

  const domicilio = p.direccionProfesional
    ? esc(p.direccionProfesional)
    : hueco(null, 240);

  const avisoBorrador = PLANTILLA_VALIDADA
    ? ''
    : `<div class="aviso-borrador">
         <strong>BORRADOR — NO ENTREGAR A LA FAMILIA.</strong>
         ${esc(MOTIVO_NO_VALIDADA)} Este documento se genera para revisión interna.
       </div>`;

  const cuerpo = `
  ${avisoBorrador}

  <p>
    En cumplimiento de los principios de licitud, lealtad y transparencia establecidos en el
    Reglamento (UE) 2016/679 (RGPD) y en la Ley Orgánica 3/2018 (LOPDGDD), se pone en su
    conocimiento la presente información relativa al tratamiento de los datos personales del/la
    menor, así como la autorización para los usos específicos detallados en este documento.
  </p>

  <h2 class="clausula">1. Responsable del tratamiento</h2>
  <p>
    <strong>${esc(p.nombreCompleto)}</strong>, pedagoga, NIF ${hueco(p.nif, 110)}, domicilio
    profesional en ${domicilio}. Contacto: ${esc(p.email)} (en adelante,
    <strong>LA PROFESIONAL</strong>).
  </p>

  <h2 class="clausula">2. Finalidad del tratamiento</h2>
  <p>Los datos personales del menor serán tratados exclusivamente con las siguientes finalidades:</p>
  <ul>
    <li>Realizar la exploración pedagógica funcional y elaborar el informe correspondiente.</li>
    <li>Planificar, desarrollar y hacer seguimiento de la intervención pedagógica individualizada.</li>
    <li>Registrar la evolución del menor a lo largo del proceso de intervención.</li>
    <li>
      Realizar registro interno de sesiones mediante fotografías o grabaciones de vídeo/audio con
      fines exclusivos de seguimiento profesional, sin difusión a terceros.
    </li>
    <li>
      Coordinar, cuando sea necesario y con consentimiento expreso, con el centro educativo u otros
      profesionales implicados en la atención del menor.
    </li>
  </ul>
  <p>
    Los datos no serán utilizados con fines comerciales ni publicitarios sin consentimiento
    adicional y explícito.
  </p>

  <h2 class="clausula">3. Destinatarios</h2>
  <p>
    Con carácter general, los datos no se comunicarán a terceros. Únicamente, cuando sea
    estrictamente necesario para la prestación del servicio o por obligación legal, y con la
    autorización expresa de la familia cuando corresponda, podrán tener acceso a los datos:
  </p>
  <ul>
    <li>
      El centro educativo del/la menor, previa autorización expresa de la familia, con fines de
      coordinación pedagógica.
    </li>
    <li>
      Otros profesionales implicados en la atención del/la menor (psicólogos, terapeutas u otros),
      previa autorización expresa de la familia.
    </li>
    <li>Organismos públicos o autoridades competentes, cuando así lo exija una obligación legal.</li>
  </ul>
  <p>Las grabaciones e imágenes de registro interno no se comunicarán ni difundirán en ningún caso.</p>

  <h2 class="clausula">4. Datos tratados</h2>
  <p>Podrán recogerse y tratarse las siguientes categorías de datos:</p>
  <ul>
    <li>Datos identificativos del/la menor y de la familia (nombre, fecha de nacimiento, domicilio, contacto).</li>
    <li>Información sobre el desarrollo y el historial académico y escolar del/la menor.</li>
    <li>
      Informes previos de carácter educativo, psicológico, médico o neuropsicológico aportados
      voluntariamente por la familia.
    </li>
    <li>Registros de evolución elaborados en el marco de la intervención pedagógica.</li>
    <li>
      Imágenes y grabaciones de audio o vídeo obtenidas durante las sesiones, con finalidad
      exclusiva de registro interno profesional.
    </li>
    <li>
      Comunicaciones profesionales con el centro educativo u otros profesionales, cuando sean
      autorizadas expresamente.
    </li>
  </ul>

  <h2 class="clausula">5. Base legal</h2>
  ${
    PLANTILLA_VALIDADA
      ? ''
      : `<div class="aviso-borrador">
           Sección pendiente de validación. Se recogen las bases previstas a reserva de dictamen:
           procede confirmar si el tratamiento de datos de salud se ampara en el art. 9.2.a
           (consentimiento explícito) o en el 9.2.h, y delimitar qué finalidades quedan bajo
           contrato (6.1.b) y cuáles bajo consentimiento (6.1.a).
         </div>`
  }
  <p>El tratamiento se fundamenta en:</p>
  <ul>
    <li>
      <strong>Art. 6.1.b RGPD</strong> — ejecución de la relación de prestación de servicios: para
      las finalidades imprescindibles para prestar la intervención contratada.
    </li>
    <li>
      <strong>Art. 6.1.a y art. 8 RGPD</strong> — consentimiento expreso del titular de la patria
      potestad para el tratamiento de datos de un menor: para las finalidades accesorias y
      revocables (grabaciones, coordinación con terceros).
    </li>
    <li>
      <strong>Art. 9.2.a RGPD</strong> (consentimiento explícito) — para los datos de salud
      estrictamente necesarios para orientar la intervención pedagógica.
    </li>
  </ul>

  <h2 class="clausula">6. Plazo de conservación</h2>
  ${
    PLANTILLA_VALIDADA
      ? ''
      : `<div class="aviso-borrador">
           Plazos pendientes de confirmar para documentación pedagógica de menores.
         </div>`
  }
  <p>
    Los datos se conservarán durante la vigencia de la relación de prestación de servicios y, una
    vez finalizada, durante un plazo mínimo de cinco (5) años, por analogía con el plazo de
    prescripción de acciones personales del art. 1964 del Código Civil, y de cuatro (4) años en lo
    relativo a la documentación con obligaciones fiscales.
  </p>
  <p>
    Las grabaciones e imágenes de registro interno se eliminarán en cuanto dejen de ser necesarias
    para los fines descritos y, en todo caso, al finalizar la intervención, salvo autorización
    expresa de conservación.
  </p>

  <h2 class="clausula">7. Derechos del interesado</h2>
  <p>
    En cualquier momento podrá ejercer los derechos de <strong>acceso, rectificación, supresión,
    limitación del tratamiento, portabilidad y oposición</strong>, así como retirar el
    consentimiento prestado (sin que ello afecte a la licitud del tratamiento previo), dirigiéndose
    a: ${esc(p.nombreCompleto)} — ${esc(p.email)}${p.direccionProfesional ? ` — ${esc(p.direccionProfesional)}` : ''}.
  </p>
  <p>
    Tiene derecho a presentar una reclamación ante la Agencia Española de Protección de Datos
    (www.aepd.es) si considera que el tratamiento no es conforme a la normativa.
  </p>

  <h2 class="clausula">8. Declaración de consentimiento</h2>
  <p>El/la firmante declara:</p>
  <ul>
    <li>Haber sido informado/a de forma clara y comprensible sobre el tratamiento de los datos del/la menor.</li>
    <li>Otorgar su consentimiento libre, específico, informado e inequívoco para los tratamientos descritos.</li>
    <li>Que los datos facilitados son veraces y que comunicará cualquier modificación relevante.</li>
    <li>
      Que ostenta la patria potestad o tutela del/la menor y que actúa sin oposición conocida del
      otro progenitor o tutor legal, conforme al art. 156 del Código Civil. En caso de existir
      resolución judicial que exija el consentimiento de ambos progenitores, ambos deberán suscribir
      este documento.
    </li>
  </ul>

  <div class="casilla">
    <span class="marca"></span>
    <span>
      Autorizo que <strong>LA PROFESIONAL</strong> consulte y trabaje con informes médicos,
      psicológicos o neuropsicológicos que la familia aporte voluntariamente, con la finalidad
      exclusiva de orientar la intervención pedagógica. No se comunicarán a terceros sin
      autorización adicional.
    </span>
  </div>
  <div class="casilla">
    <span class="marca"></span>
    <span>
      Autorizo el intercambio de documentación relativa al/la menor (informes, registros de
      evolución, valoraciones e información sobre su evolución escolar) entre
      <strong>LA PROFESIONAL</strong> y el centro educativo o los profesionales externos implicados
      en su atención, en envío y recepción, cuando sea necesario para la coordinación. Se realizará
      de forma segura y con carácter estrictamente profesional.
    </span>
  </div>
  <div class="casilla">
    <span class="marca"></span>
    <span>
      Autorizo la realización de fotografías y/o grabaciones de audio o vídeo durante las sesiones,
      con finalidad exclusiva de registro interno profesional y seguimiento, sin difusión a
      terceros.
    </span>
  </div>

  <p class="lugar-fecha">
    En ${hueco(d.ciudadFirma, 150)}, a ${hueco(null, 40)} de ${hueco(null, 110)} de 20${hueco(null, 26)}.
  </p>

  <table class="datos-tabla">
    <tr>
      <td class="etiqueta">Nombre y apellidos del menor</td>
      <td>${hueco(d.menor.nombreCompleto, 220)}</td>
      <td class="etiqueta">DNI del menor</td>
      <td>${hueco(d.menor.dni, 110)}</td>
    </tr>
    <tr>
      <td class="etiqueta">Representante legal 1</td>
      <td>${hueco(t1.nombreCompleto, 220)}</td>
      <td class="etiqueta">DNI</td>
      <td>${hueco(t1.nif, 110)}</td>
    </tr>
    <tr>
      <td class="etiqueta">Representante legal 2</td>
      <td>${hueco(t2.nombreCompleto, 220)}</td>
      <td class="etiqueta">DNI</td>
      <td>${hueco(t2.nif, 110)}</td>
    </tr>
  </table>

  ${bloqueFirmas(p.nombreCompleto)}

  <h2 class="clausula">Consentimiento del/la menor de 14 o más años</h2>
  <p>
    Si el/la menor tiene 14 o más años, se requiere también su consentimiento. Yo,
    ${hueco(null, 200)}, con fecha de nacimiento ${hueco(null, 110)}, declaro haber sido
    informado/a de forma comprensible sobre el tratamiento de mis datos personales y presto mi
    consentimiento expreso para los tratamientos descritos.
  </p>
  <div class="firmas">
    <table><tr><td class="solo">Firma del/la menor</td></tr></table>
  </div>
  `;

  return documento(
    'Consentimiento informado para el tratamiento de datos personales',
    p,
    cuerpo,
  );
}
