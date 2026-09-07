# Informe técnico de protección de datos

**Aplicación de gestión del Gabinete Pedagógico**
Documento de apoyo para la consultoría externa de protección de datos

| | |
|---|---|
| **Destinatario** | Empresa externa responsable del cumplimiento RGPD |
| **Emite** | Responsable técnico del desarrollo (*tech leader*) |
| **Fecha** | 7 de septiembre de 2026 |
| **Estado del sistema** | Pre-producción. **No hay ningún dato real cargado** |
| **Rama verificada** | `develop` |

---

## 0. Propósito, alcance y cómo leer este documento

Este informe describe **qué hace la aplicación con los datos**, con qué medidas técnicas y sobre qué
infraestructura, para que la consultoría pueda evaluarla antes de que se cargue el primer dato real
de un menor. Acompaña a los tres documentos que la propia aplicación genera y que la familia firma
—contrato, consentimiento informado y consentimiento para el tratamiento de datos—, entregados por
separado en PDF.

**Alcance.** Cubre la aplicación y su infraestructura. **No** cubre los procedimientos organizativos
del gabinete fuera de la aplicación (archivo en papel, llamadas, mensajería del profesional), que
deben evaluarse aparte.

**Cómo leer los marcadores.** Se distinguen tres cosas que en un documento así es fácil confundir:

| Marcador | Significado |
|---|---|
| *(implementado)* | Está en el código y funcionando. Es lo que se puede auditar hoy |
| *(previsto)* | Decidido pero **no construido**. No ofrece ninguna garantía todavía |
| `[PENDIENTE]` | Dato que debe aportar la titular del gabinete, no el equipo técnico |
| `[A DICTAMINAR]` | Decisión jurídica que corresponde a la consultoría, no al desarrollo |

**Sobre las referencias al código.** Cada afirmación técnica cita el fichero y el símbolo concreto
—por ejemplo `documentos.service.ts` → `create()`—, de modo que sea comprobable en el repositorio.
No se citan números de línea porque se desplazan con cada cambio y envejecen mal.

**Un aviso de método.** Este informe se ha escrito verificando el código, no la documentación previa
del proyecto. La distinción importa: **la documentación anterior estaba desactualizada** y declaraba
proveedores que ya no se usan. Ese hallazgo y su corrección se detallan en §9.

---

## 1. Qué es la aplicación

Herramienta de gestión interna de un gabinete pedagógico infantil. No hay portal para familias, ni
acceso de terceros, ni registro público. Un menor **nunca** accede a la aplicación.

Cubre el ciclo completo de la intervención: alta del expediente, contrato y consentimientos, agenda
y sesiones, registro diario de lo trabajado, objetivos y su evaluación, informes clínicos y la
facturación de la profesional.

### 1.0 Quién usa la aplicación — dato de partida para todo el análisis

> **Hay una sola usuaria: la profesional titular, autónoma, que la utiliza en solitario.** No hay más
> personas con acceso, ni está previsto que las haya a corto ni a medio plazo.
>
> Es el dato que más condiciona la evaluación, así que va al principio y no enterrado en un anexo.
> Sus consecuencias:
>
> - **Un único responsable del tratamiento.** No hay corresponsabilidad del Art. 26 que analizar.
> - **No hay tratamiento de datos de personal por cuenta ajena.** La única cuenta de la aplicación es
>   la de la propia responsable.
> - **La escala es la de una consulta individual**: unos cientos de expedientes. No es un tratamiento
>   a gran escala en el sentido del Art. 35.3.b, aunque sí trata datos del Art. 9 de menores de forma
>   sistemática, que es el criterio que sigue pesando.
> - **El riesgo de acceso indebido por personal interno es hoy inexistente**, sencillamente porque no
>   hay personal interno. El riesgo relevante es el acceso externo no autorizado y la pérdida de
>   datos.
>
> **Si en el futuro entra una segunda persona a usar la aplicación, esto deja de ser cierto y el
> análisis debe rehacerse**: aparecen tratamiento de datos de personal, posible corresponsabilidad, y
> el control de acceso entre profesionales pasa de ser una previsión a ser una medida en uso. Se
> señala aquí para que quede escrito de antemano y no se descubra después.

El sistema **sí implementa** control de acceso por roles y separación de datos entre profesionales,
descrito en §1.2. Hoy ese mecanismo no separa a nadie —hay una sola cuenta—, y se documenta por dos
motivos: porque es lo que hay construido y auditable, y porque es la condición que haría viable la
incorporación de una segunda persona sin rehacer el sistema.

### 1.1 Responsable del tratamiento

- **Responsable:** `[PENDIENTE: nombre y apellidos]` — profesional autónoma, ejerciendo de forma
  individual. Es también la **única usuaria** del sistema (§1.0).
- **NIF y domicilio profesional:** `[PENDIENTE]`
- **Contacto para el ejercicio de derechos:** `[PENDIENTE]`

> **Cuestión para ustedes, ahora más concreta:** siendo profesional individual, ¿aplica la excepción
> del **art. 34 LOPDGDD** (exención de designar delegado de protección de datos) y en qué términos?
> Y siendo pedagoga y no profesional sanitaria de las que enumera la Ley 44/2003, ¿qué régimen de
> conservación documental le corresponde exactamente? Este segundo punto condiciona los plazos de
> §4.5 y no lo damos por resuelto. `[A DICTAMINAR]`
>
> *Nota:* el modelo de facturación está construido para **autónomos independientes**, cada uno con su
> NIF y su numeración correlativa. Es una previsión de diseño, no una situación actual: hoy hay una
> sola profesional emitiendo.

### 1.2 Roles y quién ve qué *(implementado, sin uso efectivo hoy)*

> Recordatorio de §1.0: **hoy existe una única cuenta, con perfil ADMIN.** Lo que sigue describe el
> mecanismo construido, no una separación que esté operando. Es relevante para la evaluación en dos
> sentidos: acota lo que la aplicación permitiría hacer, y es la base sobre la que se podría
> incorporar a otra persona.

Cinco roles, definidos en `roles.constants.ts`:

| Grupo | Roles | Alcance |
|---|---|---|
| `ROLES_CLINICOS` | ADMIN, PEDAGOGO, NEURO, LOGOPEDA | Datos clínicos de **sus** clientes asignados |
| `ROLES_GESTION` | ADMIN, RECEP | Visión global del gabinete, para gestión |

La regla que gobierna el acceso a los datos de un menor es una sola y, desde esta revisión, vive en
**un único sitio**: `common/acceso/acceso-cliente.service.ts` → `assertAcceso()`.

- **ADMIN y RECEP** acceden a cualquier expediente del gabinete.
- **Un terapeuta** accede solo a los menores que tiene **asignados y activos** (tabla
  `ClienteTrabajador`). Si la asignación se da de baja, deja de ver la ficha.
- Un expediente dado de baja queda fuera de todos los caminos de lectura.

Además de ese filtro general hay restricciones por tipo de dato:

| Recurso | RECEP | Terapeuta |
|---|---|---|
| Registros diarios (narrativa clínica) | Sin acceso | Sus clientes asignados |
| Informes clínicos | Solo finalizados o enviados | Solo los que ha redactado él |
| Datos sanitarios y escolares | Lectura; **no** puede modificarlos | Lectura y escritura de sus clientes |
| Facturación | Sin acceso | Solo la suya |
| Portabilidad (Art. 20) | Sin acceso | Sin acceso — solo ADMIN |
| Baja y anonimización del expediente | Sin acceso | Sin acceso — solo ADMIN |

---

## 2. Qué datos se tratan

### 2.1 Del menor — categoría especial (Art. 9)

| Dato | Dónde vive | Naturaleza |
|---|---|---|
| Diagnóstico, tratamientos, centro de salud, especialistas externos, alergias | `Sanitario` | **Art. 9 — salud** |
| Adaptaciones curriculares, apoyos, especialistas del centro | `Escolar` | **Art. 9** — revelan una necesidad derivada de una condición |
| Narrativa de cada sesión | `RegistroDiario.contenido` | **Art. 9** por contenido: texto libre del profesional |
| Notas y objetivos trabajados en sesión | `Sesion` | **Art. 9** por contenido |
| Informes clínicos completos | `Informe` | **Art. 9** por contenido |
| Objetivos y evaluaciones de progreso (escala GAS) | `ClienteObjetivo`, `EvaluacionGAS` | **Art. 9** — documentan la evolución de una condición |
| Informes médicos y escolares aportados por la familia | `DocumentoCliente` + fichero en Object Storage | **Art. 9** |
| Tipo de terapia de cada sesión y contrato | `Sesion.tipoSesion`, `ContratoServicio` | **Art. 9 indirecto**: el valor por sí solo revela la necesidad abordada |

### 2.2 Del menor — identificativos

Nombre, apellidos, fecha de nacimiento, DNI/NIE (opcional), domicilio, provincia, ciudad y curso
escolar (`Cliente`), más la rutina semanal de asistencia (`ContratoSlot`, `DisponibilidadCliente`).

### 2.3 De terceros

- **Progenitores y tutores** (`Familiar`): nombre, apellidos, DNI, teléfono, correo, parentesco, y
  los indicadores de contacto principal, responsable de pago y tutor legal.
- **Persona pagadora de la factura** (campos propios en `Cliente`): nombre, NIF, domicilio fiscal y
  correo de facturación. Es un campo aparte a propósito, porque puede no ser ninguno de los
  familiares registrados —un abuelo, una empresa—.
- **Contactos del centro escolar** (`Colegio`): nombre, teléfono y correo de hasta dos personas.

### 2.4 De la profesional

Hoy son **los datos de la propia responsable del tratamiento**, que es la única usuaria (§1.0): datos
identificativos y profesionales (número de colegiado, especialidad), credenciales de acceso
(`passwordHash`, nunca la contraseña en claro) y datos fiscales de autónoma (NIF, domicilio, IBAN y
número de póliza), que son los que se imprimen en las facturas.

No hay, por tanto, tratamiento de datos de personal por cuenta ajena. El modelo de datos admitiría
más profesionales, pero mientras no los haya esta categoría no genera un tratamiento con interesados
distintos del responsable.

### 2.5 Datos técnicos

`AuditLog` guarda usuario, IP y momento de cada acción registrada. `ConsentimientoRgpd` guarda la IP
desde la que se registró el consentimiento, como elemento de prueba.

---

## 3. Flujos de datos

### 3.1 Alta del expediente *(implementado)*

El profesional crea la ficha desde el formulario web. En el mismo alta pueden entrar ya los datos
sanitarios y escolares.

**El alta no otorga consentimiento.** El expediente nace con el consentimiento pendiente y el motor
de avisos lo señala hasta que se firma. Es deliberado: el consentimiento tiene un único camino de
escritura, descrito en §3.3.

### 3.2 Expediente inicial: contrato y consentimientos *(implementado)*

A partir del contrato, la aplicación genera **tres PDF** (`expediente.service.ts` →
`DOCUMENTOS_EXPEDIENTE`):

1. Contrato de prestación de servicios pedagógicos
2. Consentimiento informado para la intervención
3. Consentimiento para el tratamiento de datos personales

Cada plantilla lleva **versión** (`PLANTILLA_VERSION`) y un interruptor `PLANTILLA_VALIDADA`.

> **Esto es relevante para su dictamen.** Ese interruptor existe precisamente para esta revisión: si
> ustedes objetan el texto de un documento, ponerlo a `false` vuelve a bloquear su envío y estampa
> una franja de BORRADOR en el PDF, sin tocar nada más. Hoy los tres están en `true`. Su dictamen es
> accionable con un cambio de una línea, y queda registrado en la versión de la plantilla, que se
> guarda en cada consentimiento firmado.

Los PDF se generan en memoria y se suben a Object Storage. **Nunca se escriben en el disco del
contenedor**, que es efímero.

### 3.3 Consentimiento: una sola fuente de verdad *(implementado)*

`ConsentimientoRgpd` es la fuente de verdad y es de **solo añadir**: cada fila es un hecho ocurrido
—se otorgó o se revocó— y nunca se edita. El estado actual es la fila más reciente. El indicador que
aparece en la ficha del cliente es una **caché derivada** que solo escribe `ConsentimientosService`.

Dos caminos, y **los dos exigen el documento firmado**:

| Camino | Quién | Qué se exige |
|---|---|---|
| Subir el consentimiento firmado desde el expediente (el normal) | Roles clínicos y RECEP | PDF firmado + identificar a los tutores firmantes |
| Registro manual de un papel firmado fuera de la aplicación | Solo ADMIN | El escaneado es obligatorio: sin evidencia no se registra |

Garantías implementadas:

- **Solo quien es tutor legal puede consentir** (`assertTutoresLegales()`), validado *antes* de subir
  el fichero para no dejar documentos huérfanos en el almacenamiento.
- **Pueden firmar los dos tutores**: `ConsentimientoFirmante` recoge a cada uno. Que firme uno solo
  teniendo dos titulares de la patria potestad es válido (art. 156 CC) y no se bloquea, pero se
  avisa en pantalla.
- **Alcances granulares** guardados por separado, porque son revocables por separado: informes a
  terceros, coordinación con el centro escolar, imágenes, y consentimiento del propio menor mayor de
  14 años.
- Se guarda la **versión exacta del texto** firmado, de modo que se puede acreditar qué documento
  concreto aceptó cada familia.

**Revocación.** Deja una fila nueva arrastrando los mismos firmantes, escribe en `AuditLog` y
notifica a los administradores con prioridad urgente. **No corta el acceso clínico**, porque la Ley
41/2002 obliga a conservar la historia. Ver §7.2, donde esto se plantea como cuestión abierta.

### 3.4 Actividad clínica del día a día *(implementado)*

Sesiones, registros diarios, objetivos y evaluaciones GAS. Todo queda ligado al menor y sujeto al
filtro de acceso de §1.2.

### 3.5 Informes clínicos *(implementado)*

El profesional redacta el informe en la aplicación. **No hay generación automática de texto**: hoy lo
escribe íntegramente una persona. Al finalizarlo se genera el PDF y se archiva en Object Storage.

### 3.6 Facturación y entrega a la asesoría fiscal *(implementado)*

Es el **segundo flujo de datos hacia un tercero** y merece atención específica.

Mensualmente se generan las facturas y se entregan a la gestoría en un paquete con el libro de
facturas emitidas y los PDF correspondientes. Minimización aplicada, verificada en el código:

- Los ficheros se nombran con **la persona pagadora, nunca con el menor**. Si falta ese dato, el
  fichero se llama `sin-destinatario.pdf`: no recurre al nombre del menor como alternativa.
- El **concepto de la factura es un texto fijo** que no menciona el tipo de terapia
  (`CONCEPTO_CUOTA_MENSUAL`). Antes decía «Cuota mensual de \[tipo de terapia\]», lo que revelaba la
  necesidad terapéutica de cada menor en el libro que se manda a la gestoría; se cambió por eso.
- La entrega exige **previsualizar** el contenido antes de enviar, y el paquete enviado se **archiva
  tal cual salió**, para poder acreditar después qué se entregó exactamente.
- Cada entrega queda registrada en `AuditLog`.

> **Pendiente y bloqueante:** la gestoría es **encargada del tratamiento (Art. 28)** y necesita
> contrato de encargo firmado antes de la primera entrega con datos reales. Hoy no consta.

### 3.7 Correo electrónico *(implementado, con salvedad)*

Es el único flujo hacia fuera del EEE. El proveedor es **Resend, Inc. (Estados Unidos)**; ver §8.2.
Se envía:

- La **factura** a la persona pagadora, con su PDF adjunto.
- El **paquete de facturas** a la gestoría.

**El envío de informes clínicos a las familias no está implementado.** Existe una función preparada
para ello, pero no la invoca ningún punto de entrada: hoy la entrega del informe a la familia se hace
por un canal ajeno a la aplicación. Se señala explícitamente porque significa que **esa entrega no
está trazada** y queda fuera de las garantías descritas en este informe.

### 3.8 Lo que NO ocurre

Conviene decirlo, porque suelen ser las primeras preguntas:

- **No hay ninguna llamada a un modelo de lenguaje ni a ningún servicio de IA.** No existe
  dependencia, cliente ni clave de ningún proveedor de IA en el proyecto.
- **No hay integración con Google, Microsoft ni redes sociales.** El campo de videollamada es una URL
  de texto que abre el navegador del profesional; el sistema no envía nada a Google.
- **No hay analítica, publicidad, cookies de terceros ni seguimiento.** La única cookie es la de
  sesión.
- **No hay portal de familias ni acceso externo.**
- **No hay perfilado ni decisiones automatizadas** en el sentido del Art. 22.

---

## 4. Ciclo de vida del dato del menor

### 4.1 Recogida

Formulario web usado por el profesional. Toda entrada pasa por validación estricta de esquema, que
descarta cualquier campo no declarado. No existe importación masiva ni ninguna otra vía de entrada.

### 4.2 Almacenamiento

| Tipo de dato | Dónde | Nota |
|---|---|---|
| Datos estructurados e historia clínica | PostgreSQL gestionado (Scaleway, `fr-par`) | Cifrado en reposo del servicio |
| Documentos y PDF | Object Storage (Scaleway, `fr-par`) | Cifrado solicitado por la aplicación en cada objeto |
| Nada | Disco del contenedor | Es efímero; escribir ahí perdería los datos en cada despliegue |

### 4.3 Uso

Acceso restringido según §1.2. La lectura de una ficha, y desde esta revisión también el acceso a
documentos e informes clínicos, quedan registrados en `AuditLog`.

### 4.4 Salida

Solo tres salidas, todas descritas arriba: el correo de facturación, la entrega a la gestoría y las
descargas que hace el propio profesional (PDF y hojas de cálculo). Las descargas están acotadas al
expediente al que el profesional tiene acceso.

### 4.5 Conservación `[A DICTAMINAR]`

**Aquí el sistema no impone nada y hace falta su criterio.** No existe ningún proceso automático que
borre datos al vencer un plazo: la retención es hoy indefinida en la práctica.

Y hay una contradicción heredada en la documentación del proyecto que conviene resolver:

| Fuente | Plazo que declara |
|---|---|
| Registro de actividades de tratamiento | Mínimo **5 años** desde el alta |
| Documentación interna del proyecto | Hasta los **18 años del menor, más 5** |
| Consentimiento que firma la familia | Mínimo **5 años**; 4 años para lo fiscal |

En un menor de ocho años la diferencia entre el primero y el segundo son **diez años de historia
clínica**. Necesitamos un plazo único, y que sea el que aparece en el documento que firma la familia.

Dos consecuencias técnicas, una vez fijado el plazo:

1. Habrá que construir el proceso de supresión periódica; hoy no existe.
2. El registro de auditoría (`AuditLog`) contiene IP y usuario, es decir datos personales, y tampoco
   tiene plazo. Se ha dejado deliberadamente sin purga automática porque el plazo es una decisión
   jurídica, no de mantenimiento. La lista negra de sesiones cerradas sí se purga ya, porque ahí no
   hay decisión que tomar: una sesión caducada no protege de nada.

### 4.6 Supresión *(implementado, con matiz importante)*

Dos pasos, ambos restringidos a ADMIN:

1. **Baja del expediente**: borrado lógico. La ficha desaparece de todas las lecturas.
2. **Anonimización** (`anonimizarCliente()`), que exige la baja previa:
   - **Se borra**: identificativos del menor, datos sanitarios, datos escolares, familiares
     (terceros), historial de consentimientos y los PDF del expediente —contrato y consentimientos—,
     tanto el registro como el fichero en el almacenamiento.
   - **Se conserva a propósito**: informes, registros diarios, sesiones y evaluaciones, porque la Ley
     41/2002 obliga a conservar la historia clínica.

> **Matiz que hay que decir con claridad:** como la historia clínica se conserva ligada al mismo
> identificador interno, esto es **seudonimización, no anonimización** en el sentido del considerando
> 26. Quien conserve una copia de los datos fiscales podría reidentificar. No lo presentamos como
> anonimización irreversible, y **es una de las cuestiones que sometemos a su criterio** (§7.1).
>
> La traza de que hubo consentimiento no se pierde al borrar sus filas: queda en `AuditLog`, con la
> versión del texto y los firmantes.

### 4.7 Portabilidad (Art. 20) *(implementado, incompleto)*

`GET /clientes/:id/export`, solo ADMIN, devuelve un JSON con los datos del expediente y deja traza en
el registro de auditoría.

**Es incompleto y lo declaramos como tal**: no incluye los documentos aportados por la familia ni sus
ficheros, ni el cuerpo de los informes, ni el histórico de consentimientos, ni contratos y facturas.
Para atender una solicitud real de portabilidad hoy habría que completarlo a mano.

---

## 5. Arquitectura y alojamiento

### 5.1 Dónde está cada cosa

Todo el tratamiento se aloja en **Scaleway SAS, región `fr-par` (París)**:

| Pieza | Servicio | Qué contiene |
|---|---|---|
| Base de datos | PostgreSQL gestionado | Toda la historia clínica y los datos estructurados |
| Documentos y PDF | Object Storage (S3-compatible) | Informes médicos aportados, informes generados, contratos, consentimientos, facturas |
| Aplicación | Serverless Container | Procesamiento en memoria |
| Imagen de la aplicación | Container Registry | Código, sin datos personales |

El único componente fuera de esa lista es el **proveedor de correo electrónico (Resend, Inc., Estados
Unidos)**, tratado en §3.7 y §8.2.

**Por qué Scaleway y no un proveedor con región europea.** Con datos del Art. 9 de un menor, lo
determinante no es solo dónde residen los datos, sino **qué jurisdicción puede obligar al proveedor a
entregarlos**. Un proveedor constituido en Estados Unidos, aunque ofrezca región europea, queda bajo
el alcance del CLOUD Act. Un proveedor constituido en la UE elimina esa capa entera de riesgo y de
papeleo. Es una decisión de diseño tomada por este motivo, no por precio.

**Frontend.** La interfaz es una aplicación que se ejecuta en el navegador y se sirve como ficheros
estáticos; **no almacena datos personales** y todo el tratamiento ocurre contra la API.

### 5.2 Sobre la certificación HDS `[A DICTAMINAR]`

La arquitectura **no** usa servicios con certificación HDS (*Hébergement de Données de Santé*).
Razonamiento seguido: el HDS es una certificación **francesa**, exigible para tratar datos de salud
en Francia bajo la autoridad sanitaria francesa; **en España lo exigible es RGPD + LOPDGDD + contrato
de encargo del Art. 28 + medidas del Art. 32 + evaluación de impacto**.

**Somos transparentes sobre la solidez de esa conclusión**: se apoya en tres fuentes convergentes
pero **ninguna jurídica** (análisis propio y dos canales de soporte del proveedor, uno de los cuales
recomendó explícitamente consultar a un experto legal). **Es una de las razones por las que se les
consulta.** Si su criterio es que hace falta HDS, la arquitectura es reversible: las piezas son
estándar, aunque exigiría autogestionar base de datos y cómputo.

Dato técnico útil para su valoración: el HDS de Scaleway no cubre ni la base de datos gestionada ni
los contenedores serverless, solo instancias, bare metal, almacenamiento por bloques, Object Storage
y VPC. El bucket ya cumple los requisitos de compatibilidad futura.

### 5.3 El flujo de ficheros, en detalle *(implementado)*

Es la parte con más superficie de riesgo, así que va con detalle.

**Cómo se nombran los objetos.** La clave **nunca contiene el nombre del menor** ni el nombre
original del fichero. Se compone del identificador interno del expediente y un identificador
aleatorio:

```
clientes/{idExpediente}/documentos/{uuid}.pdf     documentos del expediente
informes/{idInforme}.pdf                          informes clínicos generados
contratos/{idContrato}/{uuid}.pdf                 contratos firmados
facturas/{idProfesional}/{año}/{número}.pdf       facturas
gestoria/{idProfesional}/{periodo}_{envío}.zip    paquetes entregados a la gestoría
```

Es deliberado y está cubierto por una prueba automática: el nombre que teclea una persona no llega
nunca a la ruta del objeto. Elimina a la vez la fuga de datos por la ruta y cualquier problema de
saneamiento del nombre.

**Cómo se descarga.** Nunca se sirve el fichero desde la aplicación en producción: se genera una
**URL prefirmada de vida corta** y el navegador va directo al almacenamiento.

| Contenido | Vigencia del enlace |
|---|---|
| Documento del expediente (informe médico, escolar) | **5 minutos** |
| Informe clínico | **5 minutos** |
| Contrato firmado | **5 minutos** |
| Paquete de facturas para la gestoría | **48 horas** |

Las 48 horas de la gestoría son la excepción, y es consciente: ese enlace viaja por correo a un
tercero que puede tardar en abrirlo, y solo se usa cuando el paquete no cabe como adjunto. Contiene
datos de facturación, no documentación clínica. Antes eran siete días; se ha reducido en esta
revisión.

**Cifrado.** Cada objeto se sube pidiendo explícitamente cifrado en servidor (`AES256`). El proveedor
cifra por defecto, pero eso es configuración del bucket: si alguien la cambia, el código lo sigue
exigiendo. Ante un auditor, «lo pide el código» se demuestra; «viene por defecto» hay que creérselo.

**Qué pasa si falta la configuración.** En producción, la aplicación **no arranca** si faltan las
credenciales del almacenamiento. Es un cambio de esta revisión: antes arrancaba correctamente y
dejaba de archivar documentos clínicos con un simple aviso en el registro. Un sistema que parece
funcionar y no persiste la documentación es peor que uno que no arranca.

**Validación de lo que se sube.** Lista blanca de tipos de fichero (PDF, imágenes y ofimática) y
límite de 20 MB por documento. Si la subida al almacenamiento tiene éxito pero falla el registro en
base de datos, el objeto se borra: no quedan ficheros huérfanos.

---

## 6. Medidas técnicas y de seguridad (Art. 32)

Estado **verificado sobre el código** a la fecha de este informe.

### 6.1 Identificación y autenticación

| Medida | Estado |
|---|---|
| Contraseñas con `bcrypt`, coste 12 | Implementado |
| Exigencia de mayúscula, minúscula, dígito y 8 caracteres | Implementado |
| Sesión mediante testigo firmado en **cookie `HttpOnly`**, inaccesible a scripts | Implementado |
| `SameSite=Strict` y `Secure` en producción | Implementado |
| Vigencia de la sesión: **2 horas** | Implementado |
| Cierre de sesión con revocación efectiva del testigo | Implementado |
| Comprobación en **cada petición** de que el usuario sigue de alta | Implementado |
| Recuperación de contraseña con testigo aleatorio, guardado **cifrado** y con una hora de validez | Implementado |
| **Segundo factor (MFA)** | **No implementado** — ver §8 |

### 6.2 Control de acceso

> Con una sola cuenta (§1.0), estas medidas **no separan a nadie hoy**. Su valor actual es doble:
> acotan lo que un acceso no autorizado podría alcanzar aunque se hiciera con la sesión, y evitan
> tener que rehacer el sistema el día que entre una segunda persona.

| Medida | Estado |
|---|---|
| Control por roles en todos los puntos de entrada | Implementado |
| Acotación por expediente asignado, en un único punto compartido | Implementado *(reforzado en esta revisión)* |
| Actuaciones sobre la historia clínica (baja, anonimización, portabilidad) restringidas a ADMIN | Implementado *(reforzado en esta revisión)* |
| Modificación de datos sanitarios y escolares, solo perfiles clínicos | Implementado |

### 6.3 Protección de las comunicaciones

| Medida | Estado |
|---|---|
| TLS en tránsito, extremo a extremo | Implementado |
| Cifrado exigido en la conexión a la base de datos, comprobado al arrancar | Implementado *(nuevo en esta revisión)* |
| Cabeceras de seguridad y política de contenido restrictiva | Implementado |
| Origen cruzado limitado al dominio de la aplicación, sin comodines | Implementado |
| Limitación de intentos: 200 peticiones/minuto general; **5/minuto en el acceso**; 3/minuto en recuperación de contraseña | Implementado |

### 6.4 Cifrado y almacenamiento

| Medida | Estado |
|---|---|
| Cifrado en reposo de la base de datos | Del servicio gestionado |
| Cifrado en reposo de documentos, pedido por la aplicación en cada objeto | Implementado *(nuevo en esta revisión)* |
| Copias de seguridad y recuperación a un punto en el tiempo | Del servicio gestionado |
| **Restauración probada y documentada** | **Pendiente — bloqueante antes del primer dato real** |
| Cifrado adicional a nivel de campo para los datos de salud | **No implementado** — ver §8 |

### 6.5 Trazabilidad

Registro de auditoría con usuario, IP y momento. Eventos cubiertos:

- Acceso y cierre de sesión, **intentos fallidos** (con IP, nuevo en esta revisión) y cambio de
  contraseña.
- Acceso a la ficha de un menor; **baja del expediente** y anonimización.
- **Acceso, subida, generación de enlace de descarga y borrado de documentos clínicos** *(nuevo)*.
- **Descarga de un informe clínico** *(nuevo)*.
- Otorgamiento y revocación de consentimiento.
- Emisión, anulación y cobro de facturas, y entrega a la gestoría.

El registro de auditoría **nunca bloquea la operación principal**: si falla su escritura, se anota el
error y la operación continúa. Es una decisión consciente sobre disponibilidad, y su contrapartida es
que la pérdida de un registro de auditoría sería silenciosa. `[A DICTAMINAR: si el criterio debe ser
el contrario para ciertos eventos]`

### 6.6 Desarrollo y despliegue

| Medida | Estado |
|---|---|
| Contenedor con usuario sin privilegios y base mínima | Implementado |
| Sin credenciales en el código ni en la imagen; todas por variables de entorno | Implementado |
| Integración continua con la batería completa de pruebas antes de fusionar | Implementado |
| **Auditoría de dependencias en cada ejecución de la integración continua** | Implementado *(nuevo en esta revisión)* |
| Permisos mínimos en los flujos de automatización | Implementado *(nuevo)* |
| Herramienta de despliegue fijada a una versión y **verificada por huella criptográfica** | Implementado *(nuevo)* |
| Análisis estático de seguridad y escaneo de imagen | **No implementado** — ver §8 |

### 6.7 Robustez de la aplicación

Acceso a base de datos exclusivamente mediante consultas parametrizadas, sin construcción de
sentencias por concatenación. Validación estricta de entrada con descarte de campos no declarados.
Escapado de contenido en la generación de PDF y correo. El marco del frontend escapa por defecto y no
se usa ninguna vía de excepción.

---

## 7. Cuestiones que sometemos a su criterio

No son preguntas retóricas: son los puntos donde el desarrollo se ha detenido a propósito porque la
decisión es jurídica.

### 7.1 Qué debe significar «borrar» aquí

La Ley 41/2002 obliga a conservar la historia clínica y el Art. 17 concede el derecho de supresión.
La aplicación resuelve hoy la tensión conservando la historia y borrando los identificativos, lo que
—como decimos en §4.6— es seudonimización, no anonimización.

**Necesitamos que nos digan** si esa solución es correcta, o si al cumplirse el plazo de conservación
debe practicarse una destrucción real y completa. La segunda opción es construible; no la hemos hecho
por nuestra cuenta porque implica destruir historia clínica.

### 7.2 Qué debe dejar de ocurrir al revocar el consentimiento

Hoy la revocación queda registrada y avisa a los administradores, pero **no restringe técnicamente
ningún acceso**, apoyándose en que la conservación de la historia es una obligación legal.

Lo que no está resuelto es la **separación entre finalidades**: las que se amparan en la ejecución del
contrato y en la obligación legal sobreviven a la revocación, y las que se amparan en el
consentimiento deberían cesar. Necesitamos esa lista para poder implementarla. Relacionado: los
alcances granulares (imágenes, coordinación con el centro, informes a terceros) se recogen y se
guardan, pero hoy **no gobiernan ningún flujo automáticamente**; son un control humano.

### 7.3 Plazos de conservación

Ver §4.5. Necesitamos un plazo único por categoría de dato, y que coincida con el que se promete en
el documento que firma la familia.

### 7.4 Confirmación sobre HDS

Ver §5.2.

### 7.5 Consentimiento para imágenes

El documento que firma la familia incluye una casilla de autorización de imágenes y promete su
eliminación al terminar la intervención. **La aplicación no gestiona imágenes**: no hay ningún lugar
donde se almacenen. O bien se retira esa casilla, o bien se documenta dónde viven realmente esas
imágenes, porque hoy la promesa no se puede cumplir ni verificar desde el sistema.

### 7.6 Encargados y transferencias

- **Gestoría**: contrato de encargo del Art. 28, pendiente y bloqueante (§3.6).
- **Proveedor de correo**: ver §8.2.
- Conviene revisar la cadena de subencargados publicada por Scaleway.

### 7.7 Registro de facturación

Pendiente de confirmar con la asesoría el encaje del sistema con la normativa de sistemas
informáticos de facturación. Hoy la anulación de una factura deja hueco en la numeración, y no existe
factura rectificativa.

---

## 8. Riesgos conocidos y asumidos

Los declaramos porque un informe que solo enumera lo que funciona no sirve para evaluar nada.

### 8.1 Sin segundo factor de autenticación

El acceso depende de usuario y contraseña. Mitigado con vigencia corta de sesión (2 h), limitación a
5 intentos por minuto, revocación efectiva al cerrar sesión y comprobación de alta en cada petición,
pero **no equivale a un segundo factor**.

Con una sola usuaria (§1.0) el riesgo cambia de forma: no hay abuso interno posible, pero **toda la
historia clínica del gabinete está detrás de una única credencial**. Si esa contraseña se ve
comprometida —reutilización, robo, suplantación—, no hay nada que detenga el acceso. Es la carencia
más relevante del sistema, y precisamente el hecho de que haya una sola cuenta la hace más crítica,
no menos.

**Recomendación: implantarlo antes de cargar datos reales.** `[Fecha a fijar]`

### 8.2 El correo sale por un proveedor estadounidense

El proveedor es **Resend, Inc. (Estados Unidos)**. Es la **única** transferencia internacional del
sistema y está descrita en §3.7. Está decidida la migración a **Scaleway Transactional Email**
—europeo y bajo el mismo contrato de encargo que el resto de la infraestructura—, condicionada a
disponer de dominio verificado.

**Pendiente para ustedes:** verificar el contrato de encargo con Resend y la evaluación de la
transferencia, mientras la migración no se complete.

Atenuante verificado: hoy ese correo transporta facturas cuyo concepto **no nombra al menor ni la
terapia**. El flujo que sí llevaría datos del Art. 9 —el envío de informes a familias— **no está
implementado**, y la recomendación es no implementarlo hasta completar la migración.

### 8.3 Sin análisis antivirus de los ficheros subidos

Se valida el tipo declarado y el tamaño, pero no se analiza el contenido. El riesgo es de
propagación hacia los equipos del gabinete al abrir un documento. Requiere un servicio adicional.

### 8.4 El tipo de fichero se comprueba por lo que declara el navegador

No se inspecciona la firma binaria del contenido. Mitigado porque los ficheros nunca se sirven desde
la aplicación en producción y porque los tipos ejecutables no están en la lista permitida.

### 8.5 Restauración de copias de seguridad sin probar

Existen copias automáticas y recuperación a un punto en el tiempo, pero **no se ha ensayado una
restauración completa**. Bloqueante antes del primer dato real: una copia que nunca se ha restaurado
no es una copia, es una suposición.

### 8.6 Sin proceso automático de retención

Ver §4.5. Depende de §7.3.

### 8.7 Una credencial estuvo versionada en el repositorio

Detectado y corregido en esta revisión: un fichero de configuración con una credencial de base de
datos estaba incluido en el control de versiones. Se ha retirado y se ha impedido su reincorporación.
**La credencial permanece en el historial del repositorio y debe rotarse**; el repositorio es privado
y la credencial corresponde a un entorno de desarrollo sin datos reales.

### 8.8 Permisividad por omisión en el control de roles

El mecanismo de roles está diseñado de modo que un punto de entrada **sin** restricción declarada
queda accesible a cualquier usuario autenticado. Es la causa de fondo de varios de los defectos
corregidos en §9. Se ha optado por **no** invertir ese comportamiento en esta revisión, por el riesgo
de bloquear accesos legítimos a cuatro días de esta entrega; queda como trabajo planificado con su
correspondiente revisión de pruebas.

---

## 9. Qué se ha corregido al preparar este informe

Se auditó el código contra la documentación existente y aparecieron defectos reales. **Ninguno llegó
a afectar a datos reales**, porque el sistema está en pre-producción y no hay ningún dato cargado.
Se han corregido antes de esta entrega, con pruebas automáticas que cubren los casos.

> **Cómo calibrar lo que sigue.** Buena parte de los defectos de §9.2 consistían en que un perfil
> clínico podía leer datos de un menor que no tiene asignado. Con una sola usuaria (§1.0) esa
> exposición era **latente, no efectiva**: no había un segundo profesional que pudiera aprovecharla.
> Se corrigieron igualmente por dos razones: porque son la condición para que entre alguien más, y
> porque **dos de ellos no dependían del número de usuarios en absoluto** — el catálogo clínico
> accesible sin autenticar desde internet, y la descarga de informes sin filtro alguno. Esos dos sí
> eran exposición real desde el momento en que la aplicación estuviera publicada.

### 9.1 La documentación declaraba proveedores que no se usan

El registro de actividades de tratamiento y la política de privacidad publicada declaraban tres
proveedores del diseño de marzo de 2026, descartado en junio a favor de la arquitectura actual.
La política de privacidad, además, afirmaba que no se realizaban transferencias fuera del EEE cuando
el correo sí salía. **Ambos documentos se han corregido**, y la política ahora declara también a la
gestoría como encargada.

### 9.2 Defectos de control de acceso

| Defecto | Corrección |
|---|---|
| El catálogo clínico de áreas de desarrollo era accesible **sin autenticación**, incluido su borrado | Autenticación obligatoria; modificación restringida a ADMIN |
| Las exportaciones no comprobaban el expediente contra quien las pedía: cualquier usuario podía exportar el historial de cualquier menor | Acotadas al expediente asignado; el listado global es de gestión |
| La descarga del PDF de un informe no aplicaba ningún filtro | Sujeta al mismo filtro que su lectura |
| Los registros diarios se servían filtrando solo por expediente: cualquier perfil clínico leía la narrativa clínica de cualquier menor | Acotados al expediente asignado |
| La baja de un expediente no exigía rol ni dejaba traza | Restringida a ADMIN y auditada |
| Modificación de ficha, familiares, colegio, datos sanitarios y asignaciones sin comprobar el expediente | Todas comprobadas |
| La exportación de portabilidad permitía a RECEP obtener datos clínicos que su rol le niega | Restringida a ADMIN, y ajustada también la interfaz |
| Bonos, disponibilidad, sesiones y evaluaciones de progreso sin acotar | Acotados |
| Las notificaciones podían marcarse o descartarse sin ser del propio usuario | Comprobada la pertenencia |
| Un expediente dado de baja seguía siendo legible por sus vías clínicas | Corregido al unificar la comprobación de acceso |

### 9.3 Un fallo en la supresión

La anonimización **fallaba precisamente en los expedientes con consentimiento firmado**: borraba a
los familiares antes que a los consentimientos que los referencian, y la restricción de integridad de
la base de datos anulaba la operación completa. Dicho de otro modo, el derecho de supresión era
inejecutable justo en el caso normal. Corregido, con una prueba que reproduce el escenario.

Además, la anonimización **no borraba los ficheros del almacenamiento**: los consentimientos firmados
y el contrato quedaban en el bucket bajo una ruta que contiene el identificador del expediente, al
tiempo que se destruía el registro que acreditaba la firma. Ahora se borran ambos.

### 9.4 Otras correcciones

- El testigo de sesión podía enviarse como parámetro de la dirección web, y el sistema registraba las
  direcciones completas en su bitácora: el testigo podía acabar en los registros. Retirada esa vía y
  añadido saneamiento de la bitácora.
- El canal de notificaciones en tiempo real no comprobaba si el usuario seguía de alta.
- Coste de cifrado de contraseñas elevado a 12.
- Enlace de descarga del paquete para la gestoría reducido de 7 días a 48 horas.
- Cifrado de objetos solicitado explícitamente por la aplicación.
- La aplicación ahora rechaza arrancar en producción sin configuración de almacenamiento, sin cifrado
  declarado en la conexión a base de datos o con un secreto de firma débil.
- Registro de auditoría ampliado a documentos e informes clínicos, e IP en los intentos fallidos.
- Purga automática de sesiones cerradas ya caducadas.
- La herramienta de despliegue se descargaba ejecutando un script de la rama principal de un
  repositorio de terceros, en un proceso con acceso a todas las credenciales de infraestructura. Ahora
  se descarga una versión fijada y se verifica su huella criptográfica.
- Añadida auditoría de dependencias a la integración continua.

---

## 10. Estado de las pruebas

| Batería | Resultado |
|---|---|
| Pruebas unitarias del servidor | **551 correctas** |
| Pruebas de integración del servidor | **96 correctas** |
| Pruebas del cliente web | **450 correctas** |

Se han añadido pruebas específicas para cada defecto de §9, de modo que una reaparición futura rompa
la integración continua.

> **Salvedad honesta:** hay **7 pruebas en rojo** en el módulo de replanificación de contratos, y son
> **anteriores** a este trabajo: proceden de cambios de principios de septiembre y no guardan
> relación con protección de datos ni con control de acceso. Se señalan porque afectan al cálculo de
> sesiones de un contrato, que es la base de la facturación, y deben resolverse por su propio mérito.

---

## 11. Documentación que acompaña a este informe

1. **Contrato de prestación de servicios** (PDF de muestra con datos ficticios)
2. **Consentimiento informado para la intervención** (PDF de muestra)
3. **Consentimiento para el tratamiento de datos personales** (PDF de muestra)
4. **Registro de actividades de tratamiento** — `docs/legal/registro-actividades-tratamiento.md`

Los tres PDF se generan con el mismo código que produce los documentos reales, de modo que lo que
ustedes revisan es exactamente lo que firmará una familia.

---

## Anexo — Lista de lo pendiente

### Para la titular del gabinete

1. Nombre, NIF y domicilio profesional para la identificación del responsable (§1.1).
2. Canal de contacto para el ejercicio de derechos, que debe figurar en la política de privacidad.
3. Contrato de encargo con la asesoría fiscal (§3.6).
4. Rotación de la credencial señalada en §8.7.
5. Aclarar dónde se guardan las imágenes que menciona el consentimiento (§7.5).

### Para la consultoría

1. Plazos de conservación por categoría de dato (§4.5, §7.3), teniendo en cuenta que la responsable
   es pedagoga y no profesional sanitaria de la Ley 44/2003.
2. Encaje del art. 34 LOPDGDD para una profesional individual (§1.1).
3. Criterio sobre qué debe significar la supresión (§7.1).
4. Lista de finalidades que deben cesar al revocar el consentimiento (§7.2).
5. Confirmación sobre la exigibilidad del HDS (§5.2).
6. Validación del texto de los tres documentos que firma la familia (§3.2).
7. Evaluación de impacto (Art. 35), si procede a esta escala.

### Para el equipo técnico, una vez haya criterio

1. Segundo factor de autenticación (§8.1).
2. Migración del correo a proveedor europeo (§8.2).
3. Proceso automático de retención (§4.5).
4. Completar la exportación de portabilidad (§4.7).
5. Aplicar los alcances granulares del consentimiento a los flujos de salida (§7.2).
6. Prueba documentada de restauración de copias (§8.5).
7. Invertir la permisividad por omisión del control de roles (§8.8).
