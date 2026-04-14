# TODO — Tareas técnicas pre-deploy y post-deploy

Derivadas del análisis de arquitectura (2026-03-23). Actualizado 2026-04-13.  
**Bloques 1-5 completados.** Bloques 6 y 7 (seguridad/legal) pendientes — ver auditoría en `docs/seguridad-legal-audit.md`.

---

## BLOQUE 1 — Índices en schema.prisma ✅ COMPLETADO

Sin índices, todas las búsquedas hacen full table scan. Con 10.000 sesiones una query de agenda puede tardar segundos.

| Tarea | Estado |
|---|---|
| 1.1 @@index en model Sesion (clienteId, trabajadorId, fechaHoraInicio, compuesto) | ✅ Hecho |
| 1.2 @@index en model RegistroDiario | ✅ Hecho |
| 1.3 @@index en model Informe | ✅ Hecho |
| 1.4 @@index en model Notificacion | ✅ Hecho |
| 1.5 @@index en model Bono | ✅ Hecho |
| 1.6 Migración `add_performance_indexes` | ✅ Hecho |

---

## BLOQUE 2 — Paginación consistente ✅ COMPLETADO

`findAll()` sin límite devuelve todos los registros. `PaginationDto` extendido a todos los endpoints críticos.

| Tarea | Estado |
|---|---|
| 2.1 Auditar endpoints sin paginación | ✅ Hecho |
| 2.2 Paginación clientes | ✅ Hecho |
| 2.3 Paginación informes | ✅ Hecho |
| 2.4 Paginación bonos | ✅ Hecho |
| 2.5 Paginación sesiones (limit default 500) | ✅ Hecho |
| 2.6 Frontend actualizado para respuesta paginada | ✅ Hecho (2026-03-26) |

---

## BLOQUE 3 — Dockerfiles y docker-compose.prod.yml ✅ COMPLETADO

### Tarea 3.1 — Crear docker-compose.prod.yml

Crear `/docker-compose.prod.yml` con:
- Backend NestJS (imagen desde `backend/Dockerfile`)
- Frontend Nginx (imagen desde `frontend/Dockerfile`)
- n8n configurado con PostgreSQL (NO SQLite en producción)
- Variables de entorno desde `.env.prod`
- Sin PostgreSQL local — BD en Neon (externo)

n8n en producción necesita:
```yaml
environment:
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=${N8N_DB_HOST}
  - DB_POSTGRESDB_PORT=5432
  - DB_POSTGRESDB_DATABASE=${N8N_DB_NAME}
  - DB_POSTGRESDB_USER=${N8N_DB_USER}
  - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
  - N8N_HOST=${DOMAIN}
  - WEBHOOK_URL=https://${DOMAIN}/
```

### Tarea 3.2 — Crear backend/Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Tarea 3.3 — Crear frontend/Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

`frontend/nginx.conf` mínimo:
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### Tarea 3.4 — Crear .env.prod.example ✅

Template con todas las variables de producción:
```
DATABASE_URL=postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/gabinete?sslmode=require
SECRET=<jwt-secret-largo-y-aleatorio-min-32-chars>
CORS_ORIGIN=https://tudominio.es
RESEND_API_KEY=re_xxx
N8N_WEBHOOK_SECRET=<secret-compartido-nestjs-n8n>
N8N_INFORME_WEBHOOK_URL=https://tudominio.es/n8n/webhook/informe-familia
N8N_DB_HOST=ep-xxx.eu-central-1.aws.neon.tech
N8N_DB_NAME=n8n
N8N_DB_USER=n8n_user
N8N_DB_PASSWORD=<password>
```

---

## BLOQUE 4 — Seguridad ✅ COMPLETADO

### Tarea 4.1 — Rate limiting en /auth/login ✅
`ThrottlerModule.forRoot` en `AppModule`. `AuthController.login()` con `@UseGuards(ThrottlerGuard)` + `@Throttle({ global: { limit: 5, ttl: 60000 } })`. También aplicado en forgot-password y reset-password.

### Tarea 4.2 — CORS bloqueado al dominio de producción ✅
`app.enableCors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:4200', credentials: true })` en `main.ts`. Variable `FRONTEND_URL` en `.env.prod.example`.

### Tarea 4.3 — Helmet.js confirmado activo ✅
`app.use(helmet({ contentSecurityPolicy: { directives: {...} }, crossOriginEmbedderPolicy: false }))` en `main.ts`. CSP explícito configurado.

### Tarea 4.4 — Validación de variables de entorno al arrancar ✅
`const REQUIRED_ENV = ['DATABASE_URL', 'SECRET', 'FRONTEND_URL']` validadas al bootstrap. La app falla rápido si faltan.

---

## BLOQUE 5 — Deuda técnica menor ⬜ PENDIENTE (no bloqueante)

### Tarea 5.1 — Corregir navegación legacy en ClientesComponent ⬜

`frontend/src/app/features/clientes/clientes.component.ts`, líneas 131 y 198:  
Cambiar `/cliente` → `/perfil` directamente (funciona via redirect pero está sucio).

### Tarea 5.2 — Corregir error TypeScript en rbac.e2e-spec.ts ✅

Añadida interfaz `TestUserOverrides` tipada explícitamente. `mkUser` ya no usa `Record<string, any>`.

---

---

## BLOQUE 6 — Seguridad y cumplimiento legal — PRE-DEPLOY ⬜ PENDIENTE

Detectado en auditoría 2026-04-13. Todos bloqueantes antes del primer despliegue.  
Ver análisis detallado en `docs/seguridad-legal-audit.md`.

| Tarea | Severidad | Estado |
|---|---|---|
| 6.1 — `POST /auth/register` sin guard (cualquiera puede crear cuentas) | CRÍTICO | ⬜ |
| 6.2 — `GET /informes/:id/pdf` con `@UseGuards()` vacío (sin autenticación) | CRÍTICO | ⬜ |
| 6.3 — `console.log` exponiendo DNI y datos en producción (4 archivos) | ALTO | ⬜ |
| 6.4 — Borrado físico de historias clínicas viola Ley 41/2002 → soft-delete | CRÍTICO LEGAL | ⬜ |
| 6.5 — nginx sin cabeceras de seguridad (CSP, HSTS, X-Frame-Options, etc.) | ALTO | ⬜ |
| 6.6 — npm audit: axios CRITICAL (SSRF), Angular HIGH (XSS), multer HIGH (DoS) | CRÍTICO | ⬜ |
| 6.7 — DPA con n8n sin documentar (RGPD Art. 28, datos de menores) | CRÍTICO LEGAL | ⬜ |

### Detalle por tarea

#### 6.1 — Guard en `/auth/register`
- `backend/src/auth/auth.controller.ts`
- Añadir `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('ADMIN')` al endpoint

#### 6.2 — Guard en `/informes/:id/pdf`
- `backend/src/informes/informes.controller.ts`
- Sustituir `@UseGuards()` vacío por `@UseGuards(JwtAuthGuard)`

#### 6.3 — Eliminar console.log con datos personales
- `frontend/src/app/shared/validators/dni-unico.validator.ts` — líneas 15, 46, 51
- `frontend/src/app/features/clientes/nuevo-cliente-wizard/nuevo-cliente-wizard.component.ts` — línea 329

#### 6.4 — Soft-delete en Cliente (Ley 41/2002)
- `backend/prisma/schema.prisma` — añadir `deletedAt DateTime?` al modelo `Cliente`
- `backend/src/clientes/clientes.service.ts` — `remove()` pasa a marcar `deletedAt`, no `prisma.cliente.delete()`
- `findAll` / `findOne` filtran `where: { deletedAt: null }` por defecto
- Migración: `npx prisma migrate dev --name soft-delete-clientes`

#### 6.5 — Cabeceras de seguridad nginx
- `frontend/nginx.conf` — añadir `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `Content-Security-Policy`

#### 6.6 — npm audit fix
```bash
cd backend && npm audit fix          # axios CRITICAL, multer HIGH, path-to-regexp HIGH
cd frontend && npm update @angular/core @angular/common   # XSS HIGH
# Verificar: npm audit --omit=dev → 0 critical/high en ambos proyectos
```

#### 6.7 — DPA / RAT con n8n
- Si n8n self-hosted en misma instancia → documentar como componente interno en Registro de Actividades de Tratamiento (RAT)
- Si n8n Cloud → firmar DPA con n8n GmbH antes de enviar cualquier dato

---

## BLOQUE 7 — Seguridad y legal — POST-DEPLOY (primeras 2-4 semanas) ⬜ PENDIENTE

No bloquean el despliegue pero deben resolverse antes de tener usuarios reales.

| Tarea | Prioridad | Estado |
|---|---|---|
| 7.1 — Sanitización XSS en editor Tiptap (DOMPurify) | ALTA | ⬜ |
| 7.2 — Reset token no debe exponerse en respuesta `forgot-password` | ALTA | ⬜ |
| 7.3 — `/health` expone info de infraestructura sin auth | MEDIA | ⬜ |
| 7.4 — Redactar Registro de Actividades de Tratamiento (RAT) | ALTA LEGAL | ⬜ |
| 7.5 — Política de retención de datos documentada | ALTA LEGAL | ⬜ |
| 7.6 — Limpiar `console.log` del backend (reemplazar por NestJS Logger) | MEDIA | ⬜ |

### Detalle por tarea

#### 7.1 — DOMPurify en editor Tiptap
- `cd frontend && npm install dompurify @types/dompurify`
- Pasar contenido del editor por `DOMPurify.sanitize(html)` antes de cualquier `[innerHTML]`
- Afecta principalmente a `informes-tab` y al renderizado del editor

#### 7.2 — Reset token en respuesta
- `backend/src/auth/auth.service.ts` — `forgotPassword()`
- Solo devolver `{ message: 'Si el email existe recibirás un enlace' }` (sin confirmar si existe → previene user enumeration)

#### 7.3 — Endpoint /health
- Solo devolver `{ status: 'ok' }` — sin versión, detalles de BD ni hostname
- Alternativa: restringir a IP de Coolify en nginx

#### 7.4 — RAT (Registro de Actividades de Tratamiento)
- Documento interno obligatorio por Art. 30 RGPD para tratamiento de categoría especial
- Tratamientos: historia clínica, objetivos terapéuticos, contactos familiares, sesiones/bonos, informes
- Para cada uno: finalidad, base legal, categorías de datos, destinatarios, plazo de supresión, medidas de seguridad

#### 7.5 — Política de retención
- Definir plazo: 5 años mínimo para historia clínica desde última sesión
- Procedimiento manual anual o cron que liste clientes archivables (sin actividad > plazo)

#### 7.6 — Logger en backend
- Buscar `console.log` en `backend/src/` y reemplazar por `this.logger = new Logger(XService.name)`
- Los logs de producción no deben incluir payloads con datos de pacientes

---

## BLOQUE 8 — Medio plazo (1-3 meses post-deploy) ⬜ PENDIENTE

| Tarea | Estado |
|---|---|
| 8.1 — Portabilidad de datos RGPD Art. 20: `GET /clientes/:id/export` | ⬜ |
| 8.2 — Auditoría de consentimiento RGPD (quién marcó consentimiento, cuándo) | ⬜ |

---

## Estado global

| Bloque | Fase | Estado |
|---|---|---|
| 1 — Índices | Pre-deploy | ✅ Completo |
| 2 — Paginación | Pre-deploy | ✅ Completo |
| 3 — Dockerfiles | Pre-deploy | ✅ Completo |
| 4 — Seguridad (throttling, CORS, Helmet) | Pre-deploy | ✅ Completo |
| 5 — Deuda técnica | Pre-deploy | ✅ Completo |
| 6 — Seguridad y legal (auditoría) | **Pre-deploy** | ⬜ Pendiente |
| 7 — Seguridad y legal post-deploy | **Post-deploy** | ⬜ Pendiente |
| 8 — Cumplimiento RGPD ampliado | Medio plazo | ⬜ Pendiente |
