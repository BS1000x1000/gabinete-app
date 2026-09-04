import {
  documento,
  bloqueFirmas,
  lugarYFecha,
  esc,
  hueco,
  Profesional,
  DocumentoImprimible,
} from '../../common/documentos/documento-base';

/**
 * Consentimiento informado para la intervencion pedagogica.
 *
 * Reproduce el documento del gabinete. A diferencia del consentimiento de
 * proteccion de datos, este esta cerrado: no tiene ninguna seccion pendiente
 * de dictamen, asi que puede enviarse a las familias.
 */

export const PLANTILLA_VERSION = 'consentimiento-informado-v1-2026-09';
export const PLANTILLA_VALIDADA = true;

export interface ConsentimientoInformadoData {
  profesional: Profesional;
  menor: { nombreCompleto: string; fechaNacimiento: string | null };
  tutores: Array<{ nombreCompleto: string; nif: string | null }>;
  ciudadFirma: string | null;
}

export function buildConsentimientoInformadoHtml(
  d: ConsentimientoInformadoData,
): DocumentoImprimible {
  const p = d.profesional;
  const t1 = d.tutores[0] ?? { nombreCompleto: '', nif: null };
  const t2 = d.tutores[1] ?? { nombreCompleto: '', nif: null };

  const colegio = p.colegioProfesional
    ? `colegiada n.º ${esc(p.numeroColegiado ?? '')} en ${esc(p.colegioProfesional)}`
    : `colegiada n.º ${hueco(p.numeroColegiado, 90)}`;
  const poliza = p.numeroPoliza
    ? `con seguro de responsabilidad civil profesional, póliza nº ${esc(p.numeroPoliza)}`
    : `con seguro de responsabilidad civil profesional, póliza nº ${hueco(null, 110)}`;

  const cuerpo = `
  <h2 class="clausula">1. Identificación del/la menor y de los representantes legales</h2>
  <table class="datos-tabla">
    <tr>
      <td class="etiqueta">Datos del/la menor</td>
      <td>${hueco(d.menor.nombreCompleto, 200)}</td>
      <td class="etiqueta">Fecha de nacimiento</td>
      <td>${hueco(d.menor.fechaNacimiento, 110)}</td>
    </tr>
    <tr>
      <td class="etiqueta">Progenitor/Tutor 1</td>
      <td>${hueco(t1.nombreCompleto, 200)}</td>
      <td class="etiqueta">NIF</td>
      <td>${hueco(t1.nif, 110)}</td>
    </tr>
    <tr>
      <td class="etiqueta">Progenitor/Tutor 2</td>
      <td>${hueco(t2.nombreCompleto, 200)}</td>
      <td class="etiqueta">NIF</td>
      <td>${hueco(t2.nif, 110)}</td>
    </tr>
  </table>

  <h2 class="clausula">2. Identificación de la profesional</h2>
  <p>
    Dña. <strong>${esc(p.nombreCompleto)}</strong>, Graduada en Pedagogía, ${colegio}, ${poliza}.
  </p>

  <h2 class="clausula">3. Naturaleza de la intervención</h2>
  <p>
    La intervención pedagógica consiste en sesiones individuales realizadas en el domicilio
    familiar y, excepcionalmente, en formato telemático cuando las circunstancias así lo
    requieran, siempre con acuerdo previo de la familia. El trabajo se centra en:
  </p>
  <ul>
    <li>Dificultades específicas de aprendizaje detectadas en el/la menor.</li>
    <li>
      Desarrollo de competencias curriculares relacionadas con lectoescritura, comprensión
      lectora, razonamiento matemático, entre otras.
    </li>
    <li>Técnicas de estudio, organización y planificación del trabajo escolar.</li>
    <li>Funciones ejecutivas, autorregulación y autonomía en el aprendizaje.</li>
    <li>Orientación y acompañamiento a la familia.</li>
  </ul>
  <p>
    <strong>La intervención pedagógica especializada no constituye actividad sanitaria</strong> y
    no sustituye la evaluación clínica de profesionales de la salud mental, la psicología
    sanitaria o la medicina. Si durante la intervención se detectan indicadores que requieran
    valoración clínica, <strong>LA PROFESIONAL</strong> lo comunicará a <strong>LA FAMILIA</strong>
    para su derivación al especialista correspondiente.
  </p>

  <h2 class="clausula">4. Beneficios esperables</h2>
  <p>
    La intervención puede contribuir a la mejora del rendimiento académico del/la menor, a la
    adquisición de estrategias de aprendizaje autónomo y al fortalecimiento de su autoestima
    escolar. Asimismo, se trabaja el desarrollo de las funciones ejecutivas, la autorregulación y
    la autonomía personal en el contexto del aprendizaje. La familia recibe orientación y
    acompañamiento a lo largo del proceso, y se promueve la coordinación con el entorno educativo
    y los profesionales que intervienen con el/la menor.
  </p>

  <h2 class="clausula">5. Riesgos e inconvenientes</h2>
  <p>
    La intervención requiere implicación activa tanto del/la menor como de la familia; sin ese
    compromiso sostenido, los resultados pueden verse limitados. Los avances académicos dependen
    además de múltiples factores externos al proceso de intervención, como el entorno escolar, el
    estado de salud o la motivación del/la menor, por lo que no es posible garantizar la superación
    de cursos académicos ni la obtención de calificaciones determinadas.
  </p>
  <p>
    Es habitual que en las fases iniciales el/la menor experimente momentos de frustración o
    resistencia, especialmente al enfrentarse a áreas de dificultad. Esto forma parte del proceso y
    será gestionado por <strong>LA PROFESIONAL</strong> dentro de la propia intervención.
  </p>

  <h2 class="clausula">6. Confidencialidad y custodia</h2>
  <p>
    La información relativa al/la menor tiene carácter estrictamente confidencial. Los datos se
    custodian conforme al Reglamento (UE) 2016/679 (RGPD), la Ley Orgánica 3/2018 (LOPDGDD) y el
    código deontológico profesional aplicable, durante un mínimo de 5 años desde el alta del
    proceso. El tratamiento detallado de los datos personales, los derechos de la familia y los
    plazos aplicables se recogen en el documento de consentimiento informado para el tratamiento de
    datos personales, que se entrega junto a este.
  </p>
  <p>
    La confidencialidad tiene carácter general, pero <strong>LA PROFESIONAL</strong> tiene
    obligación legal de revelar información ante las instancias oportunas en los siguientes
    supuestos: cuando exista un riesgo grave para la integridad del/la menor u otras personas;
    cuando tenga conocimiento de la comisión actual o futura de un delito que afecte al/la menor u
    otras personas; o cuando así lo ordene una autoridad judicial. En este último caso, se
    proporcionará únicamente la información estrictamente relevante para el asunto en cuestión,
    manteniendo la confidencialidad del resto.
  </p>

  <h2 class="clausula">7. Consentimiento de ambos representantes legales</h2>
  <p>
    Cuando el/la menor cuente con dos progenitores o tutores legales con patria potestad vigente,
    <strong>LA PROFESIONAL</strong> no iniciará la intervención hasta haber obtenido el
    consentimiento informado expreso y por escrito de ambos. En situaciones de separación, divorcio
    o cualquier otra circunstancia que afecte al ejercicio de la patria potestad,
    <strong>LA FAMILIA</strong> deberá aportar la documentación acreditativa que corresponda. En
    caso de patria potestad exclusiva o situación equivalente, bastará el consentimiento del
    titular.
  </p>

  <h2 class="clausula">8. Revocación</h2>
  <p>
    <strong>LA FAMILIA</strong> puede revocar este consentimiento en cualquier momento, sin
    necesidad de justificación, mediante comunicación escrita a <strong>LA PROFESIONAL</strong> en
    la dirección de correo electrónico ${esc(p.email)}. La revocación no afectará a la validez de
    la intervención realizada hasta ese momento.
  </p>

  <h2 class="clausula">9. Declaraciones y firmas</h2>
  <p>
    Declaramos haber recibido información comprensible sobre todo lo anterior, haber podido
    formular preguntas y haber obtenido respuestas satisfactorias. Otorgamos consentimiento
    informado expreso para la realización de la intervención pedagógica especializada descrita.
  </p>

  ${lugarYFecha(d.ciudadFirma)}
  ${bloqueFirmas(p.nombreCompleto)}
  `;

  return documento(
    'Consentimiento informado para la intervención pedagógica',
    p,
    cuerpo,
  );
}
