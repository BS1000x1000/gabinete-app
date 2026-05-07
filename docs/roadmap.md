# Roadmap — Gabinete Pedagógico

Actualizado: 2026-04-10  
Estado: Funcionalidad core completa. Bloqueantes pendientes son ops/infra y un puñado de features de alta prioridad clínica/legal.

> Versión resumida también en `/ROADMAP.md` en la raíz del repo.

---

## FASE PRE-DEPLOY — Obligatorio antes del primer despliegue

### Hito O1 — PDF de informes almacenado en R2
**Motivación:** Legal. Ley 41/2002 obliga a conservar historia clínica hasta 18 años del menor + 5 años adicionales. Un informe enviado a la familia sin copia auditable en el sistema es un riesgo legal real.

**Qué hacer:**
- Al finalizar un informe (`estado → FINALIZADO`): generar PDF con Puppeteer → subir a Cloudflare R2 → guardar URL en `Informe.urlDocumentoFinal`
- El PDF en R2 es inmutable — lo que se envió a la familia es exactamente lo que queda archivado
- En la app: botón "Ver PDF" con signed URL (URL temporal, no pública)
- Al enviar a familia por email: adjuntar ese PDF de R2 (no regenerar en el momento)

**Schema:** `Informe.urlDocumentoFinal String?` ya existe.  
**Stack:** Cloudflare R2 ya está en el stack de producción.  
**Esfuerzo estimado:** ~4-6h

---

### Hito O2 — Cambio de contraseña desde perfil de usuario
**Motivación:** Seguridad básica. Los empleados deben poder rotar su contraseña sin depender del ADMIN ni del flujo de reset por email. Es MÁS seguro que el reset: requiere conocer la contraseña actual.

**Qué hacer:**
- Endpoint `PATCH /trabajador/me/password` — requiere `passwordActual` + `passwordNuevo`
- Módulo `ajustes/` en frontend (carpeta ya existe, vacía) — formulario de perfil
- Validar contraseña actual antes de actualizar

**Esfuerzo estimado:** ~2-3h

---

### Hito O3 — Tipo de informe ALTA ✅ COMPLETADO

`ALTA` ya existe en el enum `TipoInforme` del schema. Frontend: `TIPOS = ['INICIAL', 'SEGUIMIENTO', 'ALTA']`, `SECCIONES_ALTA` importadas y el editor las usa correctamente.

---

### Hito DEPLOY — Infraestructura de producción
**Stack:** Hetzner CX22 + Coolify + Neon (Frankfurt) + Cloudflare R2 + Cloudflare DNS + Resend + dominio .es (~€6/mes)

Ver detalle técnico en [todo-deploy.md](todo-deploy.md) y decisiones en [infra-produccion.md](infra-produccion.md).

**Checklist:**
- [ ] Comprar dominio .es
- [ ] Crear cuentas: Hetzner, Neon, Cloudflare, Resend
- [ ] `backend/Dockerfile` (NestJS multi-stage)
- [ ] `frontend/Dockerfile` (Angular build + Nginx)
- [ ] `docker-compose.prod.yml`
- [ ] Separar variables de entorno (`.env.prod`, `environment.prod.ts`)
- [ ] CORS: bloquear a dominio de producción (quitar `*`)
- [ ] Rate limiting en `/auth/login` (ThrottlerModule NestJS)
- [ ] DPA firmado con Hetzner, Neon, Cloudflare, Resend
- [ ] Redactar Registro de Actividades de Tratamiento (RAT) — documento Word, obligatorio RGPD
- [ ] Instalar Coolify en VPS + conectar GitHub + configurar auto-deploy
- [ ] Neon: crear BD Frankfurt + ejecutar migraciones Prisma
- [ ] Resend: configurar dominio + verificar DNS + probar email reset password
- [ ] SSL automático via Coolify (Let's Encrypt)

**Esfuerzo estimado:** ~1 día de trabajo concentrado

---

## FASE POST-V1 — Corto plazo (1-4 semanas tras deploy)

### Hito K — Vista bonos sin cobrar *(ya planificado)*
Schema `Bono` ya tiene `precio`, `pagado`, `metodoPago`, `fechaPago`.  
Solo falta frontend: vista que muestre bonos con `pagado: false`, filtrable por fecha/cliente, acción para marcar como pagado.  
**Esfuerzo:** ~3-4h

---

### Hito P — Anamnesis estructurada en ficha cliente
Cuando llega un nuevo cliente, la familia completa una anamnesis. Actualmente va a texto libre en el Informe INICIAL, suficiente para V1 pero pierde estructura.

**Qué hacer (MVP):**
- Nuevo modelo `Anamnesis` en Prisma — secciones: datos perinatales, hitos de desarrollo psicomotor, historial escolar, antecedentes familiares, motivo de consulta detallado
- Sección nueva dentro de `perfil-tab` o tab propia
- Solo editable por ROLES_CLINICOS

**Esfuerzo estimado:** ~1 día

---

### Hito Q — Campo "derivación/origen" en ficha cliente
¿El cliente vino derivado del colegio, pediatra, otra familia? Dato valioso para estadísticas de captación y historial clínico.

**Qué hacer:**
- Campo `origenDerivacion` (enum: COLEGIO, PEDIATRA, FAMILIA, PROFESIONAL_EXTERNO, OTRO) en modelo `Cliente`
- Campo `centroDerivacion String?` para nombre del centro/profesional
- Añadir en formulario de alta y en `perfil-tab`

**Esfuerzo:** ~1-2h

---

## FASE MEDIO PLAZO (1-3 meses post-deploy)

### Hito R — Facturación básica (generación de facturas PDF)
Las familias necesitan factura para deducciones fiscales. El gabinete necesita numeración correlativa para su contabilidad.

**Contexto fiscal España:**  
Los servicios de psicología, logopedia y pedagogía terapéutica pueden estar **exentos de IVA** (Art. 20.1.3 LIVA). Verificar con gestor antes de implementar.

**Qué hacer:**
- Modelo `Factura` en Prisma: número correlativo, fecha, clienteId, bonoId, importe, IVA/exención, estado
- Generar PDF (mismo sistema Puppeteer) + subir a R2
- Vista en bonos-tab: "Generar factura" para bonos pagados

**Para V1:** Las facturas se generan manualmente fuera de la app. No bloquea nada.

---

### Hito S — Derecho al olvido (RGPD Art. 17)
Si una familia solicita borrar sus datos hay que poder hacerlo. La solución es **anonimización**, no borrado (tensión con Ley 41/2002 que obliga a conservar historia clínica).

**Qué hacer:**
- Endpoint `POST /clientes/:id/anonimizar` (solo ADMIN)
- Sustituir datos personales (nombre, DNI, teléfono, email) por valores anónimos
- Conservar registros clínicos anonimizados
- Registrar evento en AuditLog

---

### Hito T — Notas de coordinación entre especialidades
Cuando un niño tiene PEDAGOGO + NEURO + LOGOPEDA necesitan coordinarse. Hoy comparten registros del cliente pero no hay canal interno entre profesionales.

**Qué hacer (MVP):**
- Modelo `NotaEquipo`: clienteId, autorId, contenido, fecha
- Sección en ficha cliente visible solo para ROLES_CLINICOS asignados al cliente

---

## FASE LARGO PLAZO (3+ meses)

### Hito U — Portal familias (read-only)
- Login separado para padres/tutores
- Ver sesiones próximas, bonos, informes finalizados y enviados
- Requiere modelo de auth separado + revisión RGPD completa

### Hito V — Lista de espera
- Clientes en estado `ESPERA` antes de ser `ACTIVO`
- Registro de fecha de solicitud, tipo de terapia, profesional preferido

### Hito W — Configuración del gabinete
- Nombre, logo, dirección, NIF/CIF (para cabecera de informes y facturas)
- Actualmente hardcodeado o vacío en los PDFs

### Hito X — Decisión multi-tenant
¿Se convierte en SaaS para varios gabinetes? Arquitectura actual es single-tenant. Decidir antes de que la base de código crezca más.

---

## Resumen visual

```
PRE-DEPLOY
  O1  PDF informes → R2          ~4-6h   🔴 legal
  O2  Cambio contraseña perfil   ~2-3h   🟡 seguridad
  O3  Tipo informe ALTA          ✅ completado
  ─── DEPLOY ──────────────────  ~1 día  🔴 bloqueante

CORTO PLAZO (post-deploy)
  K   Bonos sin cobrar           ~3-4h   🟡 operativo
  P   Anamnesis estructurada     ~1 día  🟡 clínico
  Q   Campo derivación           ~1-2h   🟢 informativo

MEDIO PLAZO
  R   Facturación PDF            ~2 días 🟡 fiscal
  S   Derecho al olvido RGPD     ~4h     🔴 legal
  T   Notas de equipo            ~1 día  🟢 coordinación

LARGO PLAZO
  U   Portal familias
  V   Lista de espera
  W   Config gabinete
  X   Decisión multi-tenant
```

---

## Notas legales clave

1. **Conservación historia clínica** — Ley 41/2002: mínimo 5 años desde el último episodio asistencial. Para menores: hasta los 18 años + 5 años adicionales. Los informes, evaluaciones GAS y registros diarios son historia clínica.

2. **RGPD categoría especial** — Los datos de salud de menores son Art. 9 RGPD. Requieren cifrado en reposo (Neon cifra por defecto ✅), medidas de seguridad reforzadas, y consentimiento de padres/tutores ✅.

3. **DPA con proveedores** — Firmar el Data Processing Agreement con Hetzner, Neon, Cloudflare y Resend. Disponibles en sus webs de forma gratuita.

4. **Registro de Actividades de Tratamiento (RAT)** — Documento Word/PDF interno que describe qué datos se tratan, para qué, durante cuánto tiempo y con qué proveedores. Obligatorio para el responsable del tratamiento. No es un módulo de la app.

5. **IVA en servicios terapéuticos** — Verificar con gestor si los servicios están exentos (Art. 20.1.3 LIVA). Afecta al modelo de facturación del Hito R.
