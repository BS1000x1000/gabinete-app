import {
  documento,
  bloqueFirmas,
  lugarYFecha,
  esc,
  hueco,
  Profesional,
} from '../../common/documentos/documento-base';

/**
 * Contrato de prestacion de servicios pedagogicos.
 *
 * Reproduce el documento que la profesional venia rellenando a mano, con sus
 * trece clausulas y su redaccion. La unica parte que no es texto fijo es la
 * tabla de la clausula 4, que antes obligaba a mantener una plantilla por dia
 * de la semana (habia una de lunes y otra de viernes, identicas salvo esa
 * tabla) y ahora se calcula.
 */

export const PLANTILLA_VERSION = 'contrato-v1-2026-09';

/** El contrato esta cerrado; los consentimientos no todos. */
export const PLANTILLA_VALIDADA = true;

const DIA_LABEL: Record<number, string> = {
  1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves',
  5: 'viernes', 6: 'sábados', 7: 'domingos',
};

export interface FilaCalendarioTemplate {
  mes: string;
  anio: number;
  diasTexto: string;
  observaciones: string[];
  dias: Array<{ dia: number; haySesion: boolean }>;
}

export interface ContratoTemplateData {
  profesional: Profesional;
  /** Los dos progenitores o tutores legales que firman. */
  tutores: Array<{ nombreCompleto: string; nif: string | null }>;
  menor: { nombreCompleto: string; fechaNacimiento: string | null };
  /** Dia de la semana ISO del slot principal (1=lunes). */
  diaSemana: number | null;
  horario: string | null;
  cuotaMensual: number | null;
  ciudadFirma: string | null;
  calendario: FilaCalendarioTemplate[];
  cursoEtiqueta: string;
  /** Frases literales de la clausula 4, con las fechas ya calculadas. */
  periodoNavidad: string;
  periodoSemanaSanta: string;
  notas: string | null;
}

function filaCalendario(f: FilaCalendarioTemplate): string {
  const dias = f.dias
    .map(d =>
      d.haySesion
        ? String(d.dia)
        : `<span class="sin-sesion">${d.dia}</span>`,
    )
    .join(' - ');
  return `
    <tr>
      <td class="mes">${esc(f.mes)} ${esc(f.anio)}</td>
      <td class="dias">${dias}</td>
      <td>${f.observaciones.map(o => esc(o)).join('<br>')}</td>
    </tr>`;
}

export function buildContratoHtml(d: ContratoTemplateData): string {
  const p = d.profesional;

  const diaTexto = d.diaSemana ? DIA_LABEL[d.diaSemana] ?? null : null;
  const colegio = p.colegioProfesional
    ? `colegiada con el n.º ${esc(p.numeroColegiado ?? '')} en el ${esc(p.colegioProfesional)}`
    : `colegiada con el n.º ${hueco(p.numeroColegiado, 90)}`;
  const domicilio = p.direccionProfesional
    ? esc(p.direccionProfesional)
    : hueco(null, 240);

  const tutor1 = d.tutores[0] ?? { nombreCompleto: '', nif: null };
  const tutor2 = d.tutores[1] ?? { nombreCompleto: '', nif: null };

  const notas = d.notas
    ? `<h2 class="clausula">Observaciones</h2><p>${esc(d.notas)}</p>`
    : '';

  const cuerpo = `
  <h2 class="clausula">Entre</h2>

  <p>
    Dña. <strong>${esc(p.nombreCompleto)}</strong>, con NIF ${hueco(p.nif, 110)},
    graduada en Pedagogía, ${colegio}, con domicilio profesional en ${domicilio},
    en adelante <strong>LA PROFESIONAL</strong>,
  </p>

  <p><strong>Y</strong></p>

  <p>
    D./Dña. ${hueco(tutor1.nombreCompleto, 200)}, con NIF ${hueco(tutor1.nif, 110)},
    y D./Dña. ${hueco(tutor2.nombreCompleto, 200)}, con NIF ${hueco(tutor2.nif, 110)},
    en calidad de progenitores o tutores legales de ${hueco(d.menor.nombreCompleto, 170)}
    (<em>nombre del menor</em>), con fecha de nacimiento ${hueco(d.menor.fechaNacimiento, 110)},
    en adelante <strong>LA FAMILIA</strong>,
  </p>

  <p>
    acuerdan suscribir el presente contrato de prestación de servicios pedagógicos,
    que se regirá por las siguientes cláusulas.
  </p>

  <h2 class="clausula">1. Naturaleza del servicio</h2>
  <p>
    El presente acuerdo regula la prestación de un servicio profesional de intervención
    pedagógica especializada e individualizada, dirigido a población infantojuvenil y a su
    entorno familiar. Se configura como un proceso continuo, estructurado y personalizado,
    orientado a favorecer el desarrollo, la adaptación y el bienestar del o de la menor en
    sus distintos contextos.
  </p>
  <p>
    <strong>Este servicio no tiene carácter sanitario</strong>, no se vincula a los calendarios
    escolares y no constituye una actividad puntual ni de carácter extracurricular. Es un
    servicio de naturaleza educativa y pedagógica, prestado por una profesional colegiada en el
    ámbito de la pedagogía. La continuidad del proceso se considera un elemento esencial del
    servicio, dado que las interrupciones prolongadas pueden afectar negativamente a los
    objetivos de intervención establecidos.
  </p>
  <p>
    <strong>La profesional queda sujeta al deber de secreto profesional</strong> inherente a su
    condición de colegiada, respecto de toda la información conocida en el ejercicio de su
    actividad, con independencia de las obligaciones específicas en materia de protección de
    datos recogidas en la cláusula correspondiente.
  </p>

  <h2 class="clausula">2. Modalidad del servicio y tarifa</h2>
  <p>
    El servicio se presta bajo un sistema de tarifa plana mensual, que garantiza la reserva de
    un día y horario fijo semanal, la continuidad del proceso de intervención y la estabilidad
    organizativa tanto para la familia como para la profesional.
  </p>
  <p>
    <strong>Día y horario de la sesión:</strong> las sesiones se realizarán los días
    ${hueco(diaTexto, 130)} en horario de ${hueco(d.horario, 140)} horas, salvo modificación
    acordada expresamente entre ambas partes conforme a lo previsto en este contrato.
  </p>
  <p>
    <strong>El primer mes de prestación del servicio incluye, sin coste adicional sobre la cuota
    mensual, una valoración pedagógica inicial mediante observación directa e instrumentos de
    valoración pedagógica</strong>, consistente en la recogida de información relevante sobre el
    desarrollo, la historia escolar y familiar del o de la menor, la realización de las sesiones
    de exploración necesarias, la coordinación con el centro educativo cuando proceda, y la
    elaboración de un informe inicial que recoja el perfil de aprendizaje y la propuesta de
    objetivos de intervención, consensuada posteriormente con la familia.
  </p>
  <p>
    La tarifa mensual incluye, además de las sesiones de intervención directa correspondientes a
    la frecuencia contratada, la coordinación con la familia y, cuando proceda, con el centro
    educativo u otros profesionales que intervengan con el o la menor, así como
    <strong>la elaboración de un informe de seguimiento cada seis meses, sin coste
    adicional</strong>, en el que se recoja la evolución del proceso y, en su caso, la
    actualización de los objetivos de intervención.
  </p>
  <p>
    En cuanto a la documentación escrita, <strong>quedan incluidas en la tarifa mensual las notas
    y orientaciones de seguimiento de hasta dos páginas de extensión</strong>, dirigidas a la
    familia o al centro educativo en el marco ordinario de la coordinación prevista en este
    contrato. La elaboración de informes de mayor extensión, o de documentos específicos
    solicitados por la familia para su presentación ante terceros (otros profesionales, centros,
    organismos o entidades), no queda incluida en la tarifa mensual y será objeto de presupuesto
    y facturación independiente, que se comunicará a la familia con carácter previo a su
    realización.
  </p>
  <p>
    El servicio se presta con carácter general de forma presencial en el domicilio familiar. No
    obstante, cuando la sesión presencial no pueda tener lugar por causas justificadas y así lo
    solicite la familia, podrá realizarse de forma telemática mediante videollamada, manteniendo
    la misma duración y sin que ello suponga modificación de la cuota mensual.
  </p>

  <h2 class="clausula">3. Cuota y condiciones económicas</h2>
  <p>
    La cuota mensual asciende a ${hueco(d.cuotaMensual != null ? d.cuotaMensual.toFixed(2).replace('.', ',') : null, 80)}
    <strong>euros</strong>, de carácter fijo, e incluye lo descrito en la cláusula anterior. La
    cuota es independiente del número de sesiones que resulten efectivamente realizadas en cada
    mes natural, dado que responde a la reserva de plaza, a la estructura completa del servicio y
    a la continuidad del proceso a lo largo del curso. <strong>Este régimen resulta de aplicación
    con carácter general, con la excepción del mes de julio, que se facturará de forma
    proporcional al número de sesiones efectivamente impartidas</strong>, conforme a lo
    establecido en la cláusula de vacaciones. <strong>El mes de agosto no será objeto de
    facturación</strong>, al corresponder al periodo vacacional de la profesional.
  </p>
  <p>
    El pago se realizará con periodicidad mensual, mediante factura emitida por la profesional al
    inicio de cada mes, dentro de los primeros diez días naturales siguientes a su emisión.
  </p>
  <p>
    En caso de impago transcurrido el plazo anterior, la profesional lo comunicará a la familia y
    concederá un plazo adicional de cinco días naturales para la regularización. De no producirse
    el pago en dicho plazo, la profesional podrá suspender la prestación del servicio hasta la
    regularización de la cuota pendiente, sin que ello exima a la familia del pago de las
    cantidades adeudadas.
  </p>
  <p>
    La cuota mensual podrá ser objeto de actualización anual, que se comunicará a la familia con
    una antelación mínima de un mes antes de su entrada en vigor.
  </p>

  <h2 class="clausula">4. Festivos y vacaciones</h2>

  <h3 class="sub">Festivos</h3>
  <p>
    Las sesiones que coincidan con festivos nacionales o autonómicos de la Comunidad de Madrid
    <strong>no se prestarán con carácter general</strong>, no siendo objeto de recuperación ni
    compensación, y considerándose incluidas dentro del cómputo general de la tarifa mensual,
    <strong>sin que ello dé lugar a reducción de la cuota ni a devolución parcial alguna</strong>.
  </p>
  <p>
    No obstante, <strong>de manera excepcional</strong>, la profesional podrá proponer la
    realización o reubicación de alguna sesión <strong>con el fin de garantizar la continuidad del
    servicio y el equilibrio en el número de sesiones mensuales</strong>. En estos casos,
    <strong>se informará previamente a la familia</strong>.
  </p>
  <p>
    <em>Los festivos de carácter local, propios de cada municipio, no quedan reflejados en el
    calendario general de este contrato y se gestionarán, en su caso, de forma individual según el
    municipio de residencia de cada familia.</em>
  </p>

  <h3 class="sub">Vacaciones de la profesional y periodos sin servicio</h3>
  <p>
    La profesional <strong>interrumpirá la prestación del servicio durante el mes de agosto</strong>,
    no realizándose sesiones durante dicho periodo y <strong>no siendo este mes objeto de
    facturación</strong>.
  </p>
  <p>
    Asimismo, la profesional podrá establecer periodos adicionales de descanso a lo largo del año,
    los cuales deberán ser comunicados con <strong>una antelación mínima de treinta días
    naturales</strong>. Las sesiones afectadas podrán reorganizarse en función de la
    disponibilidad; en caso de no ser posible dicha reorganización, <strong>se procederá a la
    devolución de la parte proporcional correspondiente a las sesiones no realizadas</strong>.
  </p>
  <p>
    En el <strong>periodo navideño</strong>, no se prestará servicio ${esc(d.periodoNavidad)}.
    Los días festivos oficiales comprendidos en estas fechas <strong>no se consideran periodo
    vacacional</strong>, sino festivos conforme al calendario laboral aplicable.
  </p>
  <p>
    En relación con la Semana Santa, no se prestará servicio ${esc(d.periodoSemanaSanta)}.
    Los días festivos correspondientes a dicho periodo <strong>no se consideran periodo
    vacacional</strong>, sino festivos conforme al calendario laboral.
  </p>
  <p>
    Las sesiones correspondientes a los periodos anteriormente indicados <strong>no serán
    recuperables con carácter general</strong>. No obstante, <strong>de forma puntual y previa
    comunicación</strong>, podrá valorarse su reorganización en función de la disponibilidad,
    <strong>con el objetivo de mantener la continuidad del servicio sin alterar el cómputo mensual
    de sesiones</strong>.
  </p>
  <p>
    <strong>En caso de incapacidad prolongada de la profesional por enfermedad, intervención
    quirúrgica, maternidad u otra causa de fuerza mayor de duración superior a treinta días
    naturales, el servicio quedará suspendido durante dicho periodo, sin facturación de las
    mensualidades correspondientes a los meses en que no se preste servicio.</strong> Una vez
    finalizada la causa de suspensión, se retomará la prestación del servicio, pudiendo acordarse
    con la familia la reorganización del calendario para favorecer la continuidad del proceso de
    intervención.
  </p>

  <h3 class="sub">Vacaciones de la familia</h3>
  <p>
    Las interrupciones del servicio solicitadas por la familia deberán comunicarse con una
    antelación mínima de treinta días naturales. <strong>El mes de junio queda incluido en el
    régimen ordinario de tarifa plana</strong>, con independencia de las vacaciones que la familia
    pueda tener dentro de dicho mes.
  </p>
  <p>
    <strong>En relación con el mes de julio</strong>, y con el fin de garantizar la continuidad del
    proceso de intervención en la medida de lo posible, se acordará previamente con la familia el
    periodo concreto de vacaciones. <strong>La facturación correspondiente al mes de julio se
    ajustará a las sesiones efectivamente realizadas</strong>, aplicándose el importe proporcional
    en función del número de sesiones impartidas.
  </p>
  <p>
    A continuación, se detalla la previsión orientativa de <strong>sesiones para el curso
    ${esc(d.cursoEtiqueta)}</strong>, tomando como referencia las
    <strong>sesiones semanales fijadas en ${diaTexto ? esc(diaTexto) : '—'}</strong> y considerando
    los festivos del calendario oficial de la Comunidad de Madrid. Esta previsión es aplicable con
    independencia del municipio de residencia de la familia; los festivos de carácter local no
    quedan reflejados en esta tabla y se gestionarán, en su caso, de forma individual.
  </p>

  <table class="tabla-calendario">
    <thead>
      <tr>
        <th>Mes</th>
        <th>${diaTexto ? esc(diaTexto.toUpperCase()) : 'DÍAS'} del mes</th>
        <th>Observaciones</th>
      </tr>
    </thead>
    <tbody>
      ${d.calendario.map(filaCalendario).join('')}
    </tbody>
  </table>

  <p class="nota-pie">
    Nota: el calendario se ha elaborado sobre la base de los festivos nacionales y autonómicos
    registrados en la aplicación para el curso indicado. Los festivos de ámbito autonómico sujetos
    a decreto anual se confirmarán cuando la Comunidad de Madrid publique el calendario oficial
    correspondiente, y esta tabla se actualizará en consecuencia si fuera necesario.
  </p>

  <h2 class="clausula">5. Ausencias y cancelaciones</h2>
  <p>
    <strong>Las cancelaciones solicitadas por la familia con menos de cuarenta y ocho horas de
    antelación podrán facturarse íntegramente como sesión realizada.</strong> En caso de enfermedad
    del o de la menor o de otra causa de fuerza mayor debidamente justificada, se valorará la
    reprogramación de la sesión o, cuando la situación lo permita, la realización de la sesión con
    la familia en su lugar.
  </p>
  <p>
    Las ausencias no previstas por parte de la profesional serán en todo caso recuperadas,
    ofreciéndose alternativas dentro del horario habitualmente establecido.
  </p>

  <h2 class="clausula">6. Recuperación de sesiones</h2>
  <p>
    Las sesiones susceptibles de recuperación conforme a las cláusulas anteriores deberán
    realizarse en un plazo máximo de <strong>tres meses desde la fecha inicialmente
    prevista</strong>. <strong>Transcurrido dicho plazo sin que se haya producido la
    reprogramación efectiva, la sesión se considerará realizada a todos los efectos.</strong>
  </p>

  <h2 class="clausula">7. Intervención en contexto educativo</h2>
  <p>
    Con el objetivo de favorecer la generalización de los aprendizajes y la adecuación de la
    intervención al entorno natural del o de la menor, se contempla la posibilidad de realizar
    sesiones puntuales en el contexto educativo, en función de las necesidades del o de la menor y
    de la familia. Esta modalidad será consensuada previamente entre la profesional, la familia y
    el centro educativo, y tendrá lugar en horario lectivo de mañana, dentro del propio centro.
  </p>
  <p>
    A efectos organizativos, <strong>esta intervención sustituye a la sesión semanal habitual en
    horario de tarde y se considera equivalente a una sesión ordinaria</strong>, sin que suponga
    modificación de la cuota mensual ni genere derecho a recuperación adicional. La profesional se
    compromete a trasladar a la familia la información relevante derivada de la intervención
    realizada en el contexto educativo.
  </p>
  <p>
    Asimismo, en aquellos días en que no haya actividad lectiva en el centro educativo del o de la
    menor, podrá acordarse la realización de la sesión en horario de mañana, siempre que exista
    disponibilidad y acuerdo entre ambas partes, sin que ello suponga modificación de la cuota
    mensual.
  </p>

  <h2 class="clausula">8. Continuidad del proceso y baja del servicio</h2>
  <p>
    La profesional recomienda un <strong>periodo mínimo de tres meses de intervención
    continuada</strong>, dado que los procesos de intervención pedagógica requieren de un
    <strong>tiempo de adaptación, vinculación y desarrollo inicial del trabajo</strong>.
  </p>
  <p>
    La <strong>valoración del proceso de intervención</strong> se realizará a partir de los
    <strong>seis meses</strong>, momento en el cual podrán analizarse de forma más precisa los
    <strong>avances y resultados obtenidos</strong>.
  </p>
  <p>
    La familia podrá solicitar la baja del servicio en cualquier momento, comunicándolo con un
    <strong>preaviso mínimo de quince días naturales</strong>, sin que ello dé derecho a
    <strong>devolución de las cuotas ya abonadas</strong>.
  </p>

  <h2 class="clausula">9. Resolución del contrato</h2>
  <p>
    Cualquiera de las partes podrá dar por finalizado el presente contrato, respetando en todo caso
    el preaviso establecido en la cláusula anterior. <strong>La finalización del contrato no dará
    derecho a devolución de las cuotas ya abonadas.</strong> La profesional podrá asimismo dar por
    finalizado el servicio de forma anticipada cuando concurran causas justificadas relacionadas
    con la falta de colaboración de la familia o con la inviabilidad del proceso de intervención,
    comunicándolo con una antelación mínima de treinta días naturales.
  </p>

  <h2 class="clausula">10. Protección de datos</h2>
  <p>
    El tratamiento de los datos personales del o de la menor y de la familia se realiza conforme a
    lo establecido en el Reglamento General de Protección de Datos y en la Ley Orgánica 3/2018, de
    Protección de Datos Personales y garantía de los derechos digitales. La base legal para el
    tratamiento de los datos necesarios para la prestación del servicio es la ejecución del
    presente contrato, conforme al artículo 6.1.b) del Reglamento General de Protección de Datos.
    Para el tratamiento de datos relativos a la salud del o de la menor que resulten necesarios en
    el marco de la intervención, dicho tratamiento se fundamenta en el consentimiento explícito de
    la familia, conforme al artículo 9.2.a) del citado Reglamento.
  </p>
  <p>
    Las condiciones específicas del tratamiento de datos, los derechos de las personas interesadas
    y el detalle de los flujos de información con centros educativos y otros profesionales se
    recogen en el documento de consentimiento informado y protección de datos, que se firma de
    forma independiente al presente contrato y forma parte integrante de la relación contractual.
  </p>

  <h2 class="clausula">11. Seguro de responsabilidad civil</h2>
  <p>
    La profesional dispone de un seguro de responsabilidad civil profesional en vigor que cubre la
    actividad objeto del presente contrato${p.numeroPoliza ? `, póliza n.º <strong>${esc(p.numeroPoliza)}</strong>` : ''}.
    La acreditación de dicho seguro se facilitará a la familia si así lo solicita.
  </p>

  <h2 class="clausula">12. Jurisdicción</h2>
  <p>
    Para cualquier controversia derivada del presente contrato que no pueda resolverse de mutuo
    acuerdo, las partes se someten a los juzgados y tribunales que resulten competentes conforme a
    la normativa vigente en materia de protección de consumidores y usuarios.
  </p>

  <h2 class="clausula">13. Aceptación</h2>
  <p>
    <strong>La firma del presente documento implica la aceptación de todas las condiciones
    descritas</strong>, así como del documento de consentimiento informado y protección de datos
    que lo acompaña.
  </p>
  <p>
    <strong>El presente contrato se firma por duplicado ejemplar y a un solo efecto, quedando cada
    una de las partes en posesión de un ejemplar.</strong>
  </p>

  ${lugarYFecha(d.ciudadFirma)}
  ${bloqueFirmas(p.nombreCompleto)}
  ${notas}
  `;

  return documento('Contrato de prestación de servicios pedagógicos', p, cuerpo);
}
