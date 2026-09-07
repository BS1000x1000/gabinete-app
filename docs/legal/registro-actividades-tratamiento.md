# Registro de Actividades de Tratamiento
## Art. 30 Reglamento (UE) 2016/679 — RGPD

> **Responsable del tratamiento**: [NOMBRE O RAZÓN SOCIAL DEL GABINETE]  
> **NIF/CIF**: [NIF/CIF]  
> **Dirección**: [DIRECCIÓN COMPLETA]  
> **Teléfono**: [TELÉFONO]  
> **Email de contacto**: [EMAIL]  
> **Fecha de creación**: Abril 2026  
> **Fecha de última revisión**: 7 de septiembre de 2026  
>
> **Nota de alcance**: el gabinete lo atiende una **única profesional autónoma**, que es a la vez la
> responsable del tratamiento y la única usuaria de la aplicación. No hay personal por cuenta ajena
> ni otros profesionales con acceso. La incorporación de una segunda persona obligaría a revisar
> este registro (aparecería el tratamiento 2 y habría que valorar la corresponsabilidad).
>
> **Revisión de septiembre de 2026**: se corrigen los encargados del tratamiento
> —declaraban el stack de marzo de 2026 (Neon Tech, Cloudflare R2), descartado en
> junio a favor de Scaleway— y se añaden los tratamientos 4 (facturación, con la
> gestoría como encargada) y 5 (automatización, previsto). Detalle técnico y
> evidencias en `docs/legal/informe-tecnico-rgpd.md`.

---

## 1. Gestión clínica y terapéutica de menores

### 1.1 Descripción del tratamiento

Gestión integral de la historia clínica de los menores atendidos en el gabinete, incluyendo la programación y seguimiento de sesiones terapéuticas, la definición y evaluación de objetivos de intervención, la elaboración de informes de evolución y la coordinación con el centro escolar y con los profesionales externos que atienden al menor, cuando la familia lo autoriza.

### 1.2 Base jurídica

- Consentimiento explícito del tutor legal para el tratamiento de datos de salud (Art. 9.2.a RGPD, Art. 7 LOPD-GDD).
- Ejecución del contrato de prestación de servicios terapéuticos (Art. 6.1.b RGPD).
- Obligación legal de conservación de documentación clínica (Ley 41/2002, Art. 6.1.c RGPD).

### 1.3 Categorías de interesados

- Menores de edad (pacientes).
- Padres, madres y tutores legales.

### 1.4 Categorías de datos tratados

| Categoría | Detalle |
|-----------|---------|
| Datos identificativos | Nombre, apellidos, fecha de nacimiento, DNI/NIE, domicilio |
| **Datos de salud (Art. 9 RGPD — especiales)** | Diagnósticos, tratamientos, medicación, alergias, adaptaciones curriculares, notas clínicas, informes terapéuticos |
| Datos del contexto escolar | Centro, curso, aula |
| Datos de tutores legales | Nombre, apellidos, DNI, teléfono, correo electrónico, parentesco |
| Datos de sesiones | Fecha/hora, tipo de terapia, estado, notas de sesión, objetivos trabajados |
| Datos de consentimiento | Fecha, versión del texto aceptado, familiar que consiente, trabajador que lo recoge |

### 1.5 Destinatarios

- **La profesional responsable**: única persona con acceso. La aplicación implementa además control
  por roles con acotación por cliente asignado, previsto para una eventual incorporación, pero hoy no
  separa a nadie porque existe una sola cuenta.
- **Scaleway SAS (Encargado)**: base de datos PostgreSQL gestionada, almacenamiento de documentos
  (Object Storage) y ejecución de la aplicación (Serverless Container). Región `fr-par` (París,
  Francia). DPA validado.
- **Autoridades competentes**: cuando sea requerido legalmente (autoridades sanitarias, judiciales o administrativas).

> **Transferencias internacionales**: ninguna para este tratamiento. Scaleway es una empresa
> establecida en la UE y todos los recursos están en la región `fr-par`, lo que evita la exposición
> al CLOUD Act que tendría un proveedor estadounidense aunque ofreciera región europea.
> El único flujo hacia fuera del EEE es el envío de correo electrónico, que se declara en el
> tratamiento 3 y **no transporta datos de salud**.

### 1.6 Plazos de supresión

- **Durante la relación**: datos disponibles para los profesionales asignados.
- **Tras el alta del menor**: conservación mínima de **5 años** conforme a la Ley 41/2002 (historial clínico).
- **Transcurridos 5 años**: anonimización de datos identificativos y de salud. Los registros estadísticos anonimizados pueden conservarse indefinidamente.
- Los datos del consentimiento se conservan el mismo período que la historia clínica.

### 1.7 Medidas de seguridad técnicas y organizativas

| Medida | Descripción |
|--------|-------------|
| Cifrado en tránsito | TLS/HTTPS en todas las comunicaciones |
| Cifrado en reposo | Base de datos gestionada de Scaleway (cifrado del servicio) y Object Storage con `ServerSideEncryption: AES256` solicitado explícitamente en cada objeto por la aplicación |
| Autenticación | Token de sesión en cookie HttpOnly, SameSite Strict; contraseñas bcrypt (10 rounds) |
| Control de acceso | RBAC por roles (ADMIN, PEDAGOGO, NEURO, LOGOPEDA, RECEP); data scoping por terapeuta |
| Auditoría de accesos | `AuditLog` con usuario, fecha e IP: inicio y cierre de sesión, intentos fallidos, cambio de contraseña, acceso a ficha de cliente, acceso y descarga de documentos e informes clínicos, consentimientos, facturación y entrega a la gestoría |
| Prevención brute-force | Rate limiting: 5 intentos/min en login |
| Revocación de sesión | Lista negra de tokens por `jti`, comprobada en cada petición; purga diaria de los ya caducados |
| Almacenamiento de ficheros | Nunca en disco del contenedor ni en la base de datos. Las claves de los objetos **no contienen el nombre del menor** (identificador aleatorio); la descarga se hace con URL prefirmada de 5 minutos |
| Validación de subidas | Lista blanca de tipos de fichero y límite de 20 MB por documento |
| Copias de seguridad | Backups automáticos y PITR de Scaleway (retención 7 días). **Restauración pendiente de probar y documentar antes del primer dato real** |
| Gestión de incidentes | Protocolo interno de notificación a la AEPD en 72h (Art. 33 RGPD) |

---

## 2. Gestión de profesionales del gabinete *(previsto — hoy no aplica)*

> **Este tratamiento no está activo.** La única cuenta de la aplicación es la de la propia
> responsable del tratamiento, de modo que hoy no se tratan datos de terceros por esta vía. Se
> mantiene declarado porque el sistema lo soportaría y para que, si se incorpora otra profesional,
> el registro ya recoja qué se trataría y con qué base.

### 2.1 Descripción del tratamiento

Gestión de los datos de las profesionales del gabinete para la organización de la agenda, el control de disponibilidad, la asignación de clientes y la gestión de accesos a la aplicación.

### 2.2 Base jurídica

- Ejecución del contrato de prestación de servicios entre profesionales autónomas (Art. 6.1.b RGPD).
  No hay relación laboral por cuenta ajena.

### 2.3 Categorías de datos tratados

| Categoría | Detalle |
|-----------|---------|
| Datos identificativos | Nombre, apellidos, email, teléfono |
| Datos profesionales | Especialidad, número de colegiado, rol en el sistema |
| Datos de acceso | Hash de contraseña, tokens de sesión (nunca en texto plano) |
| Datos de actividad | Registro de auditoría de acciones en el sistema |

### 2.4 Destinatarios

- Únicamente la responsable del tratamiento (perfil ADMIN).
- Proveedores tecnológicos en calidad de encargados (ver sección 1.5).

### 2.5 Plazos de supresión

- Mientras dure la relación profesional.
- Tras la baja: conservación de datos de auditoría durante **5 años** por obligaciones contables y de trazabilidad.

---

## 3. Comunicaciones con familias (envío de correo electrónico)

### 3.1 Descripción del tratamiento

Envío de correos electrónicos a los tutores legales para: notificación de informes de seguimiento, recordatorios de sesiones y comunicaciones relativas al tratamiento del menor.

### 3.2 Base jurídica

- Consentimiento del tutor legal (Art. 6.1.a RGPD).
- Ejecución del contrato (Art. 6.1.b RGPD) para comunicaciones directamente relacionadas con el servicio.

### 3.3 Destinatarios

- **Resend, Inc. (Encargado)**: proveedor de envío de correo electrónico, establecido en **Estados
  Unidos**.

> **Transferencia internacional**: es la única del sistema. Se ampara en las Cláusulas Contractuales
> Tipo. **Pendiente**: verificar el DPA firmado y completar la evaluación de impacto de la
> transferencia. Está decidida la migración a **Scaleway Transactional Email** (europeo, bajo el
> mismo DPA que el resto de la infraestructura), condicionada a disponer de dominio verificado.
>
> Hoy el correo transporta **facturas** (identidad y NIF del pagador, importe y concepto). El
> concepto es un texto fijo que **no menciona el tipo de terapia ni al menor**, precisamente para
> que este flujo no saque datos del Art. 9 fuera del EEE. El envío de informes clínicos a las
> familias **no está implementado**: cuando se implemente, debe ir por el proveedor europeo.

### 3.4 Plazos de supresión

- Logs de envío: 12 meses.

---

## 4. Facturación y obligaciones fiscales

### 4.1 Descripción del tratamiento

Emisión de las facturas de los servicios prestados, su cobro y su entrega a la asesoría fiscal para
el cumplimiento de las obligaciones contables y tributarias del profesional autónomo.

### 4.2 Base jurídica

- Ejecución del contrato de prestación de servicios (Art. 6.1.b RGPD).
- Cumplimiento de obligaciones legales fiscales y contables (Art. 6.1.c RGPD): Ley 58/2003 General
  Tributaria y RD 1619/2012 de obligaciones de facturación.

### 4.3 Categorías de interesados y de datos

| Categoría | Detalle |
|-----------|---------|
| Persona pagadora (tutor legal o tercero) | Nombre, NIF, domicilio fiscal, correo electrónico de facturación |
| Profesional emisor | NIF, domicilio profesional, IBAN, número de colegiado |
| Datos económicos | Número y fecha de factura, periodo facturado, concepto, importes |

> El destinatario de la factura **no es necesariamente el menor ni un familiar registrado**: puede
> ser un abuelo o una empresa. Por eso se recoge como dato propio y no derivado de la ficha.

### 4.4 Destinatarios

- **Asesoría fiscal / gestoría (Encargada del tratamiento, Art. 28 RGPD)**: recibe el libro de
  facturas emitidas y los PDF de las facturas del periodo.
  - **Pendiente [BLOQUEANTE]**: contrato de encargo del Art. 28 firmado con la gestoría antes de la
    primera entrega con datos reales.
  - Minimización aplicada: los ficheros se nombran con la persona pagadora, **nunca con el menor**,
    y el concepto de la factura no revela el tipo de terapia.
- **Scaleway SAS (Encargado)**: los PDF se archivan en Object Storage (ver 1.5).
- **Administración tributaria**, en cumplimiento de las obligaciones legales.

### 4.5 Plazos de supresión

- **4 años** desde el fin del plazo de presentación de la declaración correspondiente (art. 66 Ley
  General Tributaria). Se conservan también las facturas anuladas, para que la numeración correlativa
  no presente huecos sin explicación.

### 4.6 Medidas específicas

| Medida | Descripción |
|--------|-------------|
| Trazabilidad | Cada emisión, anulación, marcado de pago y entrega a la gestoría queda en `AuditLog` |
| Entrega a la gestoría | Previsualización obligatoria del contenido antes de enviar; el paquete enviado se archiva tal cual salió |
| Enlaces de descarga | Cuando el paquete no cabe como adjunto se envía un enlace prefirmado con vigencia de 48 horas |

---

## 5. Tratamiento automatizado y asistido por IA *(previsto, no implementado)*

### 5.1 Descripción

Generación automática de un resumen periódico de los registros diarios del menor, redactado con
apoyo de un modelo de lenguaje, y envío del informe resultante a la familia.

> **Estado a fecha de esta revisión: no implementado.** No existe en el código ninguna llamada a un
> modelo de lenguaje ni ningún proveedor de IA contratado. Se declara aquí por anticipado para que
> el análisis de riesgo se haga antes de construirlo, no después.

### 5.2 Base jurídica prevista

- Consentimiento explícito del tutor legal (Art. 9.2.a RGPD), recogido de forma separada del
  consentimiento general.

### 5.3 Garantías previstas

- **Proveedor de modelo europeo o autoalojado**, para no sacar datos del Art. 9 de un menor fuera de
  la infraestructura soberana. Es la condición de diseño, no una preferencia.
- **No hay decisión automatizada** en el sentido del Art. 22: el texto generado es un borrador que
  el profesional revisa, edita y aprueba antes de que salga del sistema.
- Seudonimización del texto enviado al modelo, a validar cuando exista implementación concreta.

---

## 6. Revisión y actualización

Este registro debe revisarse y actualizarse:

- Anualmente como mínimo.
- Ante cualquier cambio sustancial en las finalidades, datos tratados, destinatarios o medidas de seguridad.
- Ante la incorporación de nuevos servicios o proveedores.

---

> **Nota**: este documento es un instrumento de cumplimiento legal y debe custodiarse por el responsable del tratamiento. No debe publicarse de forma pública íntegramente, pero sí ponerse a disposición de la AEPD si lo requiere.
