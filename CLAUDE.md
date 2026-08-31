# CLAUDE.md

Guidance for Claude Code when working with this repository.

> **Actualizado 2026-06** para reflejar las decisiones de arquitectura y despliegue.
> Contexto y razonamiento completo en **`docs/CONTEXTO_ARQUITECTURA_DESPLIEGUE.md`** (léelo antes de
> cambios estructurales de infraestructura, datos o despliegue). Si los dos documentos se
> contradicen, detente y avísalo en vez de elegir uno por tu cuenta.

---

## ⚠️ Reglas innegociables — leer antes de cualquier cambio

> El proyecto trata **datos de salud de menores (RGPD Art. 9)**. Estas reglas previenen pérdida de
> datos, brechas de seguridad e incumplimiento legal. No romperlas por conveniencia.

1. **Migraciones, NUNCA `db push` en producción.** `npx prisma db push` solo en local/desarrollo.
   En producción, exclusivamente **migraciones versionadas** (`prisma migrate`), revisadas y con
   **backup reciente antes de aplicarlas**. El push de esquema puede destruir historial clínico.
   > **Nota de flujo:** `prisma migrate deploy` se ejecuta automáticamente al arrancar el contenedor
   > (Dockerfile CMD, antes de `node dist/main`). Toda migración debe estar revisada y aprobada
   > **antes de mergear a `main`**. Ante migraciones destructivas (eliminar columnas/tablas con
   > datos reales), hacer un **snapshot manual de la BD** antes del deploy, aunque el PITR esté activo.
2. **Ficheros a Object Storage, NUNCA al disco del contenedor ni a la BD.** Los Serverless
   Containers son efímeros: lo escrito en disco local desaparece en cada redespliegue. Los PDFs
   generados y los documentos subidos van a **Object Storage (S3-compatible)**.
3. **Secretos desde entorno / Scaleway Secret Manager.** Nunca claves, contraseñas o tokens en el
   código ni en el repositorio.
4. **CORS bloqueado al dominio de la app** (`FRONTEND_URL` → `app.dominio.es`). Nunca `*` en producción.
5. **NestJS escucha en `0.0.0.0` y `process.env.PORT`**
   (`app.listen(process.env.PORT ?? 8080, '0.0.0.0')`), o el contenedor no recibe tráfico.
6. **Puppeteer** siempre con `args: ['--no-sandbox', '--disable-dev-shm-usage']` y `executablePath`
   desde env var.

---

## Project Overview

**Gabinete Pedagógico** — management app for a multi-therapist pediatric therapy practice. Manages clients (children), therapists (trabajadores), sessions, vouchers (bonos), GAS goals, daily records, reports, smart notifications, and advanced statistics.

Stack: **Angular 19** (frontend) + **NestJS 11** (backend) + **Prisma 5** + **PostgreSQL**.

> **n8n eliminado** de la arquitectura (2026-06). La automatización (informes periódicos, alertas,
> envío de email) se hace nativamente en NestJS. Ver §"Decisión: sin n8n" y `CONTEXTO_…md` §4.

**Objetivo de despliegue (decidido):** **Scaleway** (Francia, 100% UE) — Managed PostgreSQL +
Serverless Container (backend) + Object Storage (ficheros) + Transactional Email. Frontend Angular
en **Cloudflare Pages**. CI/CD por **GitHub Actions** (push a `main` → build → registry → redeploy).

**Current state (2026-06)**: clinical nucleus complete and **tests green** (250 unit + 51 E2E with a real Postgres in CI). Code hardening done: n8n removed, Dockerfile built & image pushed to Scaleway registry, Object Storage persistence for report PDFs implemented, rate limiting + Helmet + CORS-to-FRONTEND_URL in place, CI workflow with Postgres service. **Infra in progress on Scaleway**: account + billing alert + DPA validated + HDS question sent; Container Registry + image; Object Storage bucket (`gabinete-archivos`). **Pending**: create the managed DB + the Serverless Container (≈6 July), then activate the deploy pipeline. No domain yet. See `CONTEXTO_…md` §14 for the live deployment status.

---

## Commands

### Backend (`/backend`)

```bash
npm run start:dev        # Dev server with watch (port 3000)
npm run build            # Production build
npm run lint             # ESLint with auto-fix
npm test                 # Jest unit tests (250 passing)
npm run test:e2e         # E2E tests (supertest) — 51 passing
npm run test:cov         # Coverage report
npx jest src/foo/foo.spec.ts   # Single spec file
```

Prisma:
```bash
npx prisma migrate dev --name <nombre>   # New migration (DEV) — la forma correcta de cambiar esquema
npx prisma migrate deploy                # Aplicar migraciones en PRODUCCIÓN (con backup previo)
npx prisma db push                        # ⚠️ SOLO local/prototipado — NUNCA contra producción (ver Reglas innegociables)
npx prisma studio                         # DB GUI
npx prisma generate                       # Regenerate client after schema change
```

---

### Frontend (`/frontend`)

```bash
npm start         # Dev server (ng serve, port 4200)
npm run build     # Production build
npm test          # Karma/Jasmine tests (Chrome Headless)
```

---

## Architecture

### Backend — NestJS modules

Standard pattern: `module → controller → service → dto/types`. All DB access through `PrismaService`.

| Module | Responsibility |
|---|---|
| `auth` | JWT + Passport local. Token 2h (cookie HttpOnly). `JwtAuthGuard` on all routes. `JwtFlexGuard` for SSE (also accepts `?token=` query param). |
| `trabajador` | Therapist CRUD + profile + password change. |
| `clientes` | Client CRUD, family contacts, health data, RGPD consent. |
| `sesiones` | Session generation from availability, state machine (`PROGRAMADA → COMPLETADA/CANCELADA_*`). Integrates with bonos. |
| `bonos` | Voucher lifecycle (`ACTIVO → CONSUMIDO`). Payment tracking. |
| `disponibilidad` | Weekly schedule slots per client-therapist pair. |
| `objetivos-generales` | Catalogue of goals grouped by `AreaDesarrollo`. |
| `gas` | GAS system — `ClienteObjetivo` → `EvaluacionGAS`. Levels -2..+2. |
| `notificaciones` | 10-rule notification engine (`motor-reglas.service.ts`). SSE real-time push via `NotificacionesSseService`. |
| `dashboard` | `getMiDia` (operational today view) + `getResumenCompleto` + `getEstadisticasAvanzadas` (advanced stats with date range + role-scoped data). |
| `informes` | Structured reports (`INICIAL` / `SEGUIMIENTO`) + PDF via Puppeteer. Role-scoped: RECEP only sees FINALIZADO. Archives finalized PDF to Object Storage via `StorageService.archivarPdfEnStorage()` (conditional on `SCW_*`). |
| `documentos` | Documentación externa del expediente (`DocumentoCliente`): subida multipart a Object Storage, URL prefirmada de 5 min para descarga, categorías `INFORME_MEDICO` / `INFORME_ESCOLAR` / `ADMINISTRATIVO` / `OTROS`. Falla de forma visible si faltan `SCW_*` — nunca escribe a disco local. Borrado: ADMIN o quien subió el fichero. |
| `export` | PDF/Excel exports (sesiones, bonos). Puppeteer + ExcelJS. |
| `fichaje` | Daily record CRUD + objective linking. ROLES_CLINICOS only. |
| `gas` | GAS evaluation. ROLES_CLINICOS only for mutations. |
| `roles` | Role CRUD. |
| `health` | Health check endpoint. |

> **Object Storage:** `StorageService` (Scaleway S3-compatible) está implementado y el módulo
> `informes` archiva el PDF del informe finalizado (`archivarPdfEnStorage()`), guardando la clave en
> `Informe.urlDocumentoFinal`. El archivado solo ocurre si `SCW_*` está configurado (si no, no-op
> con warn — convertir en fallo duro en prod, ver TODO (a)). La subida de documentos externos por
> los usuarios YA está implementada (módulo `documentos`) y **sí** falla de forma visible sin `SCW_*`.
> **Pendiente:** la generación/envío PROGRAMADO de informes periódicos.

### Orden de las secciones de un informe — fuente de verdad duplicada

El orden y la numeración de las secciones de cada tipo de informe viven en **dos** sitios que hay
que mantener alineados a mano:

- Backend (PDF): `backend/src/informes/templates/informe.template.ts` → array `secciones`
- Frontend (editor): `frontend/src/app/interface/informes.interface.ts` → `SECCIONES_*`

En ambos, **el orden del array ES el orden del documento** y los números se calculan al renderizar
(`i + 1`): no escribas el número en el título. La tabla GAS es una sección más (`tipo: 'gas'` en el
backend, `key: 'gas'` en el frontend) y puede ir en cualquier posición.

Orden vigente (2026-08):

| Tipo | Secciones |
|---|---|
| `INICIAL` | Motivo de consulta · Análisis de la información · Evaluación inicial · Objetivos generales · **GAS** |
| `SEGUIMIENTO` | Evaluación del período · Objetivos trabajados · **GAS** · Objetivos para el próximo período · Recomendaciones |
| `ALTA` | Motivo de consulta / razón del alta · Resumen del proceso terapéutico · Estado al cierre del tratamiento · **GAS** · Recomendaciones de continuidad |

> Los campos retirados de un tipo (`motivoConsulta` y `evolucionObservada` en SEGUIMIENTO,
> `objetivosGeneralesTexto` en ALTA) **siguen existiendo en la BD**: el guardado solo escribe las
> claves de la lista, así que los datos históricos se conservan aunque ya no se rendericen.

### RBAC — Roles and guards

```typescript
// backend/src/roles/roles.constants.ts
export const ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'] as const;
export const ROLES_GESTION  = ['ADMIN', 'RECEP'] as const;
```

Pattern in controllers:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
export class XController {
  @Roles(...ROLES_CLINICOS)   // restrict specific endpoints
  @Post()
  create(@Req() req: any) { ... }
}
```

Data scoping pattern in services — all methods that return user-specific data accept `user?: { userId: string; rol: string }`:
```typescript
async findAll(user?: { userId: string; rol: string }) {
  if (!user || user.rol === 'ADMIN' || user.rol === 'RECEP') return this.prisma.cliente.findMany();
  return this.prisma.cliente.findMany({
    where: { trabajadores: { some: { trabajadorId: user.userId, activo: true } } }
  });
}
```

JWT payload shape: `{ sub: string, userId: string, rol: string, nombre: string }`.

### Frontend — Angular 19

All components **standalone** using **signals** for state. No NgModules.

```
frontend/src/app/
├── features/
│   ├── home/
│   │   ├── agenda/           # Weekly calendar (angular-calendar)
│   │   ├── dashboard/        # Operational today view (DashboardHomeComponent)
│   │   ├── estadisticas/     # Advanced stats — EstadisticasComponent (Chart.js)
│   │   └── listado/          # Client detail shell + tabs
│   │       └── tabs/         # 6 active tabs:
│   │           ├── perfil-tab       # personal + sanitario + contactos + colegio + RGPD
│   │           ├── sesiones-tab
│   │           ├── bonos-tab
│   │           ├── progreso-tab     # registro + GAS (ROLES_CLINICOS only — roleGuard)
│   │           ├── informes-tab      # ruta `documentacion` — expediente unificado + editor de informes
│   │           └── terapeutas-tab   # TrabajadorTabComponent — assign therapists
│   ├── clientes/             # Client list/search
│   ├── trabajadores/         # Therapist management (ADMIN + RECEP)
│   └── ajustes/              # Settings
├── services/                 # One service per backend domain
├── shared/
│   ├── components/
│   │   └── layout/sidebar/   # SidebarComponent — nav + quick actions
│   ├── guards/
│   │   ├── auth.guard.ts     # Protects /home subtree
│   │   └── role.guard.ts     # roleGuard(roles[]) factory — used in routes
│   └── utils/                # authInterceptor
└── interface/                # TypeScript interfaces mirroring Prisma types
```

**Sidebar nav items** (computed signal, role-filtered):
- Agenda · Clientes · Estadísticas → all roles
- Equipo → ADMIN + RECEP only

**Frontend role guard usage:**
```typescript
// In route definitions:
{ path: 'progreso', canActivate: [roleGuard(['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'])] }
{ path: 'trabajadores', canActivate: [roleGuard(['ADMIN', 'RECEP'])] }
```

**AuthService role helpers:**
```typescript
this.auth.isAdmin()    // computed() signal → boolean
this.auth.isRecep()    // computed() signal → boolean
this.auth.isAdmin() || this.auth.isRecep()  // in computed context reads both signals
```

### Routing

Default route after login: `/home/agenda`. Lazy-loaded everywhere. `authGuard` protects `/home` subtree.

Key routes:
- `/home/agenda` — operational daily view
- `/home/clientes` — client list
- `/home/estadisticas` — advanced statistics
- `/home/trabajadores` — therapist management (ADMIN + RECEP)
- `/home/listado/:id/perfil|sesiones|bonos|progreso|informes|terapeutas`

### Styles

**Never put styles in `component.scss`**. All styles in `frontend/src/sass/`, imported in `main.scss`.

```
sass/
├── abstracts/   # _variables.scss (full design system), _mixins.scss, _functions.scss
├── base/        # _root.scss, _reset.scss, _typography.scss, _utilities.scss
├── components/  # one file per feature component
├── layout/      # _sidebar.scss, _header.scss, _tab-contents.scss
└── pages/       # _login.scss, _home.scss, etc.
```

Key SCSS variables:
```scss
$primary: #7c6fd6;          // lila — main color
$secondary: #5a9de8;         // azul — secondary
$primary-ultra-light: #f5f3fc;
$primary-light: #e8e4f8;
$success: #10b981;
$danger: #ef4444;
$warning: #f59e0b;
$shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,111,214,0.05);
$border-radius-lg: 0.75rem;
$font-family-base: "Plus Jakarta Sans", ...
```

Icons: Bootstrap Icons (`bi-*`).

### Charts

**Library**: `ng2-charts@8` + `chart.js@4` — chosen for Angular 19 compatibility, smallest bundle (~60-80kB gzip tree-shaken), best TypeScript types, and cleanest upgrade path to Angular 20/21.

Setup in `app.config.ts`:
```typescript
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
providers: [..., provideCharts(withDefaultRegisterables())]
```

Usage in standalone components:
```typescript
import { BaseChartDirective } from 'ng2-charts';
imports: [BaseChartDirective]
// Template:
// <canvas baseChart type="line" [data]="data()" [options]="opts"></canvas>
```

**Why NOT ng-apexcharts**: ships uncompiled TypeScript source (no dist). Angular 19 esbuild builder cannot process it. v2.x line requires Angular 20+.

Chart data driven by signals via `effect()`:
```typescript
effect(() => {
  const d = this.datos();
  if (!d) return;
  this.lineData.set(this.buildLineData(d));
});
```

### Data model highlights

- `Cliente` ↔ `Trabajador` via `ClienteTrabajador` (multiple therapy types per client, `activo` flag)
- `Sesion` → `ClienteTrabajador` pair + optional `Bono` link
- `Bono` → `tipoSesion TipoSesion` field (required — one voucher per therapy type)
- GAS: `ObjetivoGeneral` → `ClienteObjetivo` (with 5-level descriptors -2..+2) → `EvaluacionGAS`
- `RegistroDiario` → `RegistroDiarioObjetivo` (M:N with objectives)
- `Notificacion` per therapist, 10 types, 4 priority levels (URGENTE/ALTA/MEDIA/BAJA)
- `Cliente.consentimientoRgpd Bool` + `consentimientoFecha DateTime?` — RGPD tracking
- `Trabajador.numeroColegiado String?` + `especialidad String?`

> **Nota de modelo (a revisar):** para datos de salud de menores, el consentimiento es más matizado
> que un booleano (consentimiento parental, umbral de los 14 años en España). `consentimientoRgpd
> Bool` puede quedarse corto. No bloquea, pero tenerlo en el radar al evolucionar el modelo.

### Environment

`backend/.env` (local):
```
DATABASE_URL=postgresql://...
SECRET=<jwt-secret>
```

**Producción (variables del contenedor):** ver la **hoja completa en `CONTEXTO_…md` §18**.
Imprescindibles para arrancar: `DATABASE_URL` (`...?sslmode=require`), `SECRET` (generar nueva, no
reutilizar la local), `FRONTEND_URL`. Object Storage: `SCW_ACCESS_KEY`, `SCW_SECRET_KEY`,
`SCW_BUCKET_NAME` (`gabinete-archivos`), `SCW_REGION` (`fr-par`). Email (hoy Resend, a migrar a TEM):
`RESEND_API_KEY`, `EMAIL_FROM`. Puppeteer: `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium`,
`PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true`. `NODE_ENV=production`. `PORT` la inyecta Scaleway.
**Nunca en el repo ni en imágenes Docker** — van en Scaleway Secret Manager / variables del contenedor.

---

## Decisión: sin n8n

n8n se ha eliminado (módulo y servicio Docker borrados, 2026-06). Cada caso de uso que se le había
asignado se cubre con lo que ya existe o con NestJS nativo:

- **Informes automáticos (mensual / semestral / bienvenida):** `@nestjs/schedule` (cron) + el módulo
  `informes` existente + plantillas + envío por email. La bienvenida se dispara desde el alta de
  cliente, no por cron. (Pendiente de implementar.)
- **Resumen mensual "con rol de pedagogo":** era una llamada a un LLM; NestJS la hace igual.
  **Aviso RGPD:** lleva datos del menor (Art. 9) — si el LLM es US, usar modelo UE o anonimizar.
- **Alertas de bono vacío / recordatorios internos:** son **una regla más en el motor existente**
  (`notificaciones/motor-reglas.service.ts`), no un servicio aparte.
- **Recordatorios de sesión por email:** vía el servicio de email desde NestJS (hoy Resend; a migrar
  a Scaleway TEM — ver blocker de email y `CONTEXTO_…md` §17).
- **Recordatorios por WhatsApp (si algún día):** llamada a la API de WhatsApp Business **desde
  NestJS**; integración puntual, no justifica un servicio always-on.
- **Fiabilidad de tareas:** empezar con una tabla `informes_jobs` (estado + reintentos). Diferir
  Redis + BullMQ hasta que el volumen lo exija.

---

## Patterns and lessons learned

### RBAC — applying roles to endpoints

Always use both guards together:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```
`RolesGuard` alone won't work — it relies on `JwtAuthGuard` having run first to populate `req.user`.

For endpoints that need role-SCOPED data (not 403, but filtered results), pass `req.user` to the service:
```typescript
@Get()
findAll(@Req() req: any) {
  return this.service.findAll(req.user);
}
```

### Bootstrap: overflow horizontal from `.row` negative margins

`.row.g-*` applies negative margins that cause horizontal scroll inside flex containers.

```scss
.parent-scroll { overflow-x: hidden; min-width: 0; }
```
Add `px-3` padding on the wrapper containing the `.row`.

### File downloads with loading state

Service methods returning files MUST return `Observable<void>`:
```typescript
descargarPdf(id: string): Observable<void> {
  return this.http.get(..., { responseType: 'blob' }).pipe(
    tap(blob => triggerDownload(blob, 'file.pdf')),
    map(() => void 0),
  );
}
```
Component uses `descargando = signal(false)` + `finalize(() => this.descargando.set(false))`.

> Nota: este patrón (generar y descargar al vuelo) seguirá existiendo para descargas a demanda.
> Para informes que deben **persistir** (los periódicos, los enviados a familias), el PDF se sube a
> **Object Storage** (`StorageService`) y se guarda su referencia en `Informe.urlDocumentoFinal`.

### SSE — Server-Sent Events

`EventSource` cannot send custom headers. JWT travels as `?token=` query param. `JwtFlexGuard` accepts both Bearer header and query param. Frontend connects in `AuthService` login and reconnects in `HomeComponent.ngOnInit()`.

> Seguridad: el token en query param puede aparecer en logs/proxies. Aceptable como limitación
> conocida de SSE, pero no lo registres en logs de acceso y mantén la expiración del token corta (2h).

### Drawer pattern (Registro Diario)

Global `RegistroDrawerService` with `open(clienteId, sesionId?)`. Drawer component subscribes to the service signal. Overlay semitransparent on body.

### ClienteDrawerComponent pattern (Perfil tab)

Complex form sections use a shared `ClienteDrawerComponent` with sections: `personal | sanitario | contactos | colegio`. Simple boolean fields use inline toggle directly in `perfil-tab.component.ts`.

---

## Testing

### Backend — current state
- **Unit**: 250 tests, 19 suites — all green. Jest + @nestjs/testing.
- **E2E**: 51 tests, 6 suites — all green. supertest + Jest. `test/helpers/create-app.ts` + `test/helpers/prisma-mock.ts`. `ThrottlerGuard` overridden in `create-app.ts`. CI (`ci.yml`) runs a real Postgres service + `prisma migrate deploy` before the suite.

### Controller spec pattern
```typescript
const module = await Test.createTestingModule({
  controllers: [XController],
  providers: [{ provide: XService, useValue: makeMock() }],
})
.overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })
.compile();
```
Always mock `NotificacionesSseService` when testing `NotificacionesController`.

### E2E pattern
`MotorReglasService` MUST be overridden — it fires on login and makes DB calls:
```typescript
.overrideProvider(MotorReglasService).useValue({ evaluarReglas: jest.fn().mockResolvedValue(undefined) })
```

### RBAC test coverage (`test/rbac.e2e-spec.ts`)
E2E tests covering: RECEP → 403 on clinical endpoints, 200 on allowed. ADMIN → 200 global stats. PEDAGOGO → 403 on ROLES_GESTION endpoints. Without token → 401. (`loginAs` reads the HttpOnly cookie from `Set-Cookie`.)

### Frontend — spyOn ESM named exports
```typescript
// ❌ Fails — named exports are non-writable
spyOn(downloadUtils, 'triggerDownload')
// ✅ Stub the browser API instead
spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
```

### Frontend — timezone-safe date tests
```typescript
const inicio = new Date(sesion.fechaHoraInicio);
const expectedHora = `${String(inicio.getHours()).padStart(2,'0')}:...`;
// NOT hardcoded '09:00'
```

### Frontend — signal side-effects order
```typescript
service.getSomething().subscribe();        // 1. subscribe first
httpMock.expectOne(url).flush(wrap(data)); // 2. then flush → tap/signal update fires
expect(service.signal()).toEqual(data);    // 3. then assert
```

> Deuda apuntada: los tests corren con `--forceExit` (algo no cierra limpio — sospecha: pool de
> Prisma). Investigar con `--detectOpenHandles` y cerrar en `afterAll`. No bloquea.

---

## Deleted components (do NOT recreate)

These were removed during the UX redesign (Phase 4). Their content lives in `perfil-tab` + `ClienteDrawerComponent`:
- `cliente-tab` → `perfil-tab`
- `colegio-tab` → `ClienteDrawerComponent section='colegio'`
- `contactos-tab` → `ClienteDrawerComponent section='contactos'`
- `sanitario-tab` → `ClienteDrawerComponent section='sanitario'`
- `registro-tab` → `progreso-tab` (first panel)
- `objetivos-tab` → `progreso-tab` (second panel)

Legacy URL redirects still active in `listado.routes.ts` (e.g. `/cliente → /perfil`).

---

## Known gaps / technical debt

### Minor code debt (not blocking)
- `ClientesComponent` still navigates to `/cliente` (legacy) in lines 131 and 198 — works via redirect but should point to `/perfil` directly
- `rbac.e2e-spec.ts` has a minor TypeScript strict error (`username` property type) — runtime correct, tests pass
- Imagen Docker pesa ~2,28 GB (más de lo esperado) — optimizar después (revisar qué arrastra el runner)
- Cruce de versiones Prisma: cliente/CLI `5.22.0` vs `@prisma/adapter-pg` `^7.4.0` — revisar coherencia
- Tests con `--forceExit` (handle abierto, prob. pool de Prisma) — cerrar en origen

### Done (infra/hardening — 2026-06)
- **n8n eliminado:** módulo `n8n` + `docker-compose.yml` + referencias borrados.
- **Object Storage (informes):** `StorageService` + `archivarPdfEnStorage()` implementados.
- **Dockerfile:** bookworm-slim + Chromium apt + `tini` + USER node + `prisma generate` en builder; imagen subida al registry.
- **CI/CD:** `deploy.yml` (build → registry → `scw container deploy`) y `ci.yml` (Postgres service + migraciones + tests).
- **Config prod:** `main.ts` `listen('0.0.0.0', PORT ?? 8080)`, CORS a `FRONTEND_URL`, Helmet, `trust proxy = 1`.
- **Hardening auth:** ThrottlerGuard (global 200/60s; login 5/60s; forgot 3/60s; reset 5/60s).

### Pending before production
1. **Crear infra Scaleway:** Managed PostgreSQL (DB-DEV-S, PITR, Red Privada) + Serverless Container (paso 8 y 9). *Aquí arranca el coste.*
2. **Activar pipeline:** rellenar secretos en GitHub (`SCW_*`, IDs) + `SCW_CONTAINER_ID`; **proteger `main`** (ruleset que exija el check de `ci.yml`).
3. **Email — migrar de Resend a Scaleway TEM** — `email.service.ts` usa hoy **Resend (EE.UU.)** vía `RESEND_API_KEY`/`EMAIL_FROM`. **Decisión: migrar a TEM** (europeo) por coherencia de soberanía (los informes a familias pueden llevar datos del Art. 9 del menor). Tarea de código, aparte del despliegue; TEM requiere dominio verificado → se hará junto con la automatización del resumen mensual, a la vuelta del viaje. En pruebas, email en modo no-op. Ver `CONTEXTO_…md` §17.
4. **TODO (a) — REQUIRED_ENV gateado a producción:** añadir `SCW_ACCESS_KEY`, `SCW_BUCKET_NAME` y la clave de email al `REQUIRED_ENV` de `main.ts`, gateado a `NODE_ENV === 'production'`, para que el arranque del contenedor falle de forma visible si falta la config de Object Storage o email en prod, sin romper el dev local. Convierte el archivado silencioso (`StorageService` no-op) en un fallo ruidoso.
5. **TODO (b) — job de reconciliación de informes archivados:** cron que busque `Informe` con `estado = FINALIZADO` y `urlDocumentoFinal = null` y reintente `archivarPdfEnStorage()`. Cierra el hueco del archivado fire-and-forget (hoy un error solo se loguea).
6. **MFA** para profesionales (auth hoy es solo JWT 2h + RBAC).
7. **RGPD para datos reales:** resolver HDS con Scaleway + DPIA + restauración de backup probada antes del primer dato real de un menor.

### Medium-term roadmap
- **Hito K** — Billing/cobros module: payment tracking per bono, debt view per family. Currently managed externally (likely spreadsheet)
- **Automatización de informes** — generación programada (`@nestjs/schedule`) + envío por email (resumen mensual con IA incluido), apoyada en el módulo `informes` y en Object Storage. (Sustituye lo que iba a hacer n8n.)
- **Object Storage — documentos subidos** por las familias (médicos/pedagógicos).
- **Mobile/tablet polish** — sidebar collapse, weekly grid density, drawer form on small screens

### Long-term
- **Onboarding panel** — configurable gabinete name/logo, welcome email for new workers, CSV client import
- **Family portal** — read-only view: upcoming sessions, bono status, finalized reports (requires separate auth model + RGPD review)
- **Multi-tenant decision** — current architecture is single-tenant; refactor cost grows with time if SaaS route chosen
- **Web de marketing** — sitio público (`www.dominio.es`) separado de la app, en Cloudflare Pages, sin datos personales. Aísla el alcance RGPD a la app. Ver `CONTEXTO_…md` §8.

---

> Recordatorio: ante cualquier cambio de infraestructura, datos, despliegue o ficheros, consulta
> **`docs/CONTEXTO_ARQUITECTURA_DESPLIEGUE.md`** y respeta las **Reglas innegociables** de la cabecera.