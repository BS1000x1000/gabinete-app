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

**Current state (2026-06)**: clinical nucleus complete and **tests green** (469 unit + 60 E2E with a real Postgres in CI). Code hardening done: n8n removed, Dockerfile built & image pushed to Scaleway registry, Object Storage persistence for report PDFs implemented, rate limiting + Helmet + CORS-to-FRONTEND_URL in place, CI workflow with Postgres service. **Infra in progress on Scaleway**: account + billing alert + DPA validated + HDS question sent; Container Registry + image; Object Storage bucket (`gabinete-archivos`). **Pending**: create the managed DB + the Serverless Container (≈6 July), then activate the deploy pipeline. No domain yet. See `CONTEXTO_…md` §14 for the live deployment status.

---

## Commands

### Backend (`/backend`)

```bash
npm run start:dev        # Dev server with watch (port 3000)
npm run build            # Production build
npm run lint             # ESLint with auto-fix
npm test                 # Jest unit tests (469 passing)
npm run test:e2e         # E2E tests (supertest) — 60 passing
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
| `fichaje` | Daily record CRUD + objective linking. ROLES_CLINICOS only. **`fechaRegistro` es un DÍA** (12:00 UTC, `diaDesdeIso`), no un instante: cuándo se escribió lo guarda `createdAt`. Ver §Registro diario. |
| `gas` | GAS evaluation. ROLES_CLINICOS only for mutations. |
| `consentimientos` | **Único** escritor del consentimiento RGPD. Histórico inmutable + alcances granulares + caché en `Cliente`. Sin controlador: lo consumen `clientes` y `expediente`. Ver §"Consentimiento RGPD". |
| `festivos` | **Única fuente** del calendario del centro (`delCentro()`). CRUD + importación desde catálogo versionado + `ConfiguracionCentro`. Ver §Calendario del centro. |
| `horarios-laborales` | **Disponibilidad** del terapeuta: cuándo puede coger cliente. Nombre histórico del módulo (ver §Ficha del trabajador). Alimenta el aviso `FUERA_DE_DISPONIBILIDAD` al crear sesión (`evaluarAvisos`); nunca bloquea. Se edita en "Mi semana". |
| `horarios-admin` | Bloques recurrentes de tiempo de administración. Se materializan como eventos virtuales en la agenda (`eventos-agenda.findByPeriodo`). |
| `vacaciones` | Periodos de ausencia por trabajador. Rechaza rangos que incluyan festivos del centro. |
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
- `/home/listado/:id/perfil|sesiones|bonos|progreso|documentacion|contratos|terapeutas`
- `/home/trabajadores/:id/perfil|clientes|semana|vacaciones|facturacion|acceso` — ficha del
  terapeuta, y también **"Mi ficha"** (el enlace del avatar). Ver §Ficha del trabajador
- `/home/administracion/...` — bloque económico del autónomo (ver §Administración)
- `/home/configuracion/festivos` — calendario del centro (ADMIN). Ver §Calendario del centro
- `/home/cuenta` y `/home/ajustes` — redirigen a `/home/trabajadores/:miId/acceso` (`miFichaGuard`)

Los roles de las rutas salen de `frontend/src/app/shared/constants/roles.ts`, espejo de
`backend/src/roles/roles.constants.ts`. No escribas literales de rol sueltos: el sidebar y el guard
tienen que decidir con la misma lista, y antes uno usaba lista negra y el otro lista blanca.

### Calendario del centro — los festivos son del local, no del cliente

Un festivo local cierra **el centro**; no cierra a la familia. El calendario se elige una vez en
`/home/configuracion/festivos` (`ConfiguracionCentro`, fila única) y todo lo demás lee de ahí.

Antes se resolvía contra `Cliente.provincia`: texto libre contra texto libre, con el ámbito `LOCAL`
guardado **por provincia**, así que era imposible distinguir Fuenlabrada de Alcorcón. Un festivo que
no casaba desaparecía en silencio y el contrato salía **con una sesión de más** — un documento que
firma la familia y que fija una cuota mensual.

**`FestivosService.delCentro(anios)` es la única fuente.** Estaba copiada en `contratos.service`,
`contratos-replanificacion.service` y `contratos-pdf.service`; ahora las tres la llaman. Resuelve
`NACIONAL ∪ (AUTONOMICO con la CCAA del centro) ∪ (LOCAL con su municipio)`. El ámbito LOCAL casa
**solo por municipio**, no por municipio + CCAA: la CCAA la fija ya el catálogo, y exigir las dos
reintroduce la clase de fallo que esto viene a quitar.

Reglas que conviene no romper:

- **`ccaa` guarda un CÓDIGO (`"MAD"`), no un nombre.** Sale de la lista cerrada de
  `festivos/data/calendarios.ts`, que alimenta los desplegables. No hay ningún campo de texto libre
  en la pantalla, a propósito.
- **`ccaa` y `municipio` son `NOT NULL DEFAULT ''`**, no nullable. En Postgres varios `NULL` conviven
  en un índice único, así que con columnas nullable el `@@unique([fecha, ccaa, municipio])` no
  impediría el duplicado. Con centinela `''` sí, y `createMany({ skipDuplicates })` por fin sirve
  para algo: se pudo borrar la deduplicación en memoria de la importación.
- **`fecha` se normaliza a las 12:00 UTC** en todos los caminos de escritura. El `@@unique` depende
  de eso: antes la importación guardaba el mediodía local y el alta manual la medianoche UTC, dos
  instantes distintos para el mismo día. Las 12:00 y no las 00:00 para que el día local sea el mismo
  se ejecute el contenedor en UTC o en `Europe/Madrid`.

  > **Convención de todo el proyecto, no solo de festivos.** Los helpers viven en
  > `common/fecha/dia.utils.ts` (`normalizarDia`, `diaDesdeIso`) y los usa **todo campo que
  > represente un DÍA y no un momento**. `diaDesdeIso` recorta a `YYYY-MM-DD` **sin pasar por
  > `new Date(iso)`**, que interpreta una fecha suelta como medianoche UTC y reintroduce el desfase.
  > `festivos.service` reexporta `normalizarDia` porque medio módulo ya lo importaba de allí.
- **Los datos van versionados, sin API externa.** Ninguna API pública gratuita cubre los festivos
  **municipales** españoles, que son la mitad difícil; y esto alimenta un documento contractual, que
  no debe depender de una llamada de terceros en tiempo de ejecución. Mantenimiento: una vez al año,
  en otoño, con el BOCM y los bandos municipales, anotando el año en `ANIOS_VERIFICADOS`.
- **La pantalla confiesa lo que no sabe.** Sin municipio elegido, o con un municipio del catálogo sin
  festivos cargados, sale un aviso en ámbar y la importación lo devuelve en `sinDatos` /
  `sinVerificar`. Es deliberado: un calendario incompleto que parece completo es exactamente el fallo
  que había.
- Los nacionales **se calculan**, no se listan: `FESTIVOS_FIJOS` + `calcularViernesSanto` +
  `trasladarSiDomingo` (art. 37.2 ET). En el curso 2026-2027 son justo los dos traslados los que
  hacen que las familias de lunes pierdan sesión.
- **El traslado del domingo vale para nacionales Y autonómicos, nunca para locales.** El 2 de mayo
  de 2027 cae en domingo y Madrid lo pasa al lunes 3; mientras el traslado solo se aplicó a los
  nacionales, el calendario cerraba el centro un domingo —donde no hay ninguna sesión— y dejaba el
  lunes abierto: una sesión de más en el contrato de toda familia de lunes. Los **locales** quedan
  fuera a propósito: sus dos días los elige el ayuntamiento cada año y a veces escoge fin de semana
  queriendo (Fuenlabrada, 26 de diciembre de 2026, sábado). Trasladarlos sería inventar un festivo.
- **Un festivo local puede ser móvil.** `CalendarioLocal` tiene `fijos` y `moviles`, igual que
  `CalendarioAutonomico`: Alcorcón celebra Santo Domingo y San Dominguín el **Lunes de Pascua**
  (`offsetPascua: 1`), que cambia de fecha cada año. Cuando solo admitía fechas fijas, ese municipio
  no era representable y se quedaba declarado pero sin datos. "Sin datos" lo decide
  `contarDiasLocales()`, compartido por la importación y por `/festivos/catalogo`, para que el aviso
  de la pantalla y el `sinDatos` no puedan discrepar.

**Sesión en día festivo: avisa, no bloquea.** `evaluarAvisos` emite el tipo `'FESTIVO'`, que llevaba
declarado en `AvisoSesion` desde el principio y **no se emitía nunca**. Es la filosofía que el propio
módulo declara —"avisar es útil; bloquear sería estorbar"— y el contrato prevé expresamente sesiones
de recuperación excepcionales. El alta de **vacaciones** sí rechaza un rango con festivos: esa
validación solo existía en `vac-picker`, es decir, solo en el navegador.

> Los avisos de `POST /sesiones` (solape, fuera de disponibilidad, vacaciones, festivo) los devolvía el
> backend desde el principio y **ningún componente los leía**. Se pintan en el modal de Nueva sesión,
> que ya no se autocierra cuando hay algo que leer.

### Ficha del trabajador — "Mi ficha" y "Equipo" son la misma pantalla

Las seis pestañas están bien ubicadas; lo que fallaba eran los nombres y que el espacio personal
estaba partido en tres sitios.

```
/home/trabajadores/:id      ← "Equipo" (ADMIN+RECEP) y "Mi ficha" (avatar) llevan aquí
├── perfil                  identidad profesional
├── clientes                cartera asignada
├── semana                  ROLES_CLINICOS — disponibilidad + clientes + tiempo de administración
├── vacaciones              ROLES_CLINICOS
├── facturacion             ROLES_CLINICOS — "Datos fiscales" (mismo componente que Administración)
└── acceso                  contraseña (propia o reset de ADMIN) + rol y baja (solo ADMIN sobre otro)
```

- **"Mi semana" es disponibilidad, no jornada.** Aquí nadie tiene jornada contratada: son
  autónomos. Lo que se declara es **cuándo se puede coger cliente** ("los lunes de 16:00 a 20:00"),
  que además cambia según lo que vaya saliendo — puede aparecer un sábado o no aparecer ninguno.
  El modelo Prisma sigue llamándose `HorarioLaboral` **a propósito**: `Disponibilidad` ya está
  cogido dos veces (`DisponibilidadCliente`, `DisponibilidadClienteTrabajador`, más el módulo
  `disponibilidad`) y un tercero sería peor que el desajuste de nombre. El aviso se llama
  `FUERA_DE_DISPONIBILIDAD`. Razonamiento completo en el doc-comment del modelo en `schema.prisma`.
- **Es una línea de tiempo, no una lista.** Siete filas contra un **eje de horas compartido**: la
  disponibilidad es una banda, los clientes van sólidos encima, la administración discontinua, y
  **el hueco libre es el trozo de banda que queda vacío**. Se ve, no se lee. El eje común es lo que
  permite comparar las 17:00 del lunes con las 17:00 del miércoles, que es justo lo que se hace al
  colocar un cliente semanal; antes esto era texto (`Libre: 16:00–17:00 · 19:00–20:00`) y había que
  situarlo mentalmente. Los **siete días salen siempre**, aunque estén vacíos: el día vacío es
  justo donde puede caer el cliente nuevo. Esta pestaña es el *planificador*; el *contador* es
  Estadísticas → Registro de jornada.
- **Se reutiliza la semántica de la agenda, no su layout.** Sólido = cita real, discontinuo =
  generado, color de categoría desde `TIPO_COLOR`, posiciones en `%` y rango horario deducido de
  los datos con ventana mínima de 6 h (`rangoHorario` en `shared/utils/semana.utils.ts`, calcado de
  `agenda.component.ts`). El layout es horizontal a propósito: `ag-week-grid` necesita la altura de
  un shell a pantalla completa y esta pestaña vive en un panel ancho y bajo — y así una fila por
  día aguanta el móvil mucho mejor que siete columnas estrujadas.
- **Solapar avisa, no bloquea**, igual que los avisos de sesión: declarar una franja sobre otra, o
  administración encima de un cliente, sale advertido en el formulario y se guarda igual.
- **Los clientes de la rejilla salen de `ContratoSlot`** (`GET /contratos/carga-semanal`), no de las
  sesiones: el patrón recurrente es estable, y la semana concreta varía con cancelaciones, festivos
  y vacaciones. El filtro es `estado ACTIVO` **+ vigencia por fechas hoy**. Ojo: la regla de
  facturación —un `FINALIZADO` cuya ventana cubre el periodo sí factura— **no aplica aquí** y
  "corregirlo" llenaría la rejilla de clientes que ya no vienen.
- **Se declara un día cada vez, con SUS horas.** Antes el alta era un selector de varios días con
  **una sola franja** que se abanicaba en N peticiones idénticas: lunes 10:00-12:00 y miércoles
  16:00-18:00 obligaba a abrir el formulario dos veces. El backend siempre lo soportó (una fila por
  día); era el formulario el que no. El `forkJoin` que lo mandaba tampoco era transaccional.
- **La disponibilidad la escribe solo su dueño, ni siquiera un ADMIN** — el mismo criterio que ya
  imponía `HorariosAdminService.create` y que la UI daba por hecho con `puedeEditar`. Leerla sí
  puede el ADMIN, en solo lectura.
- **Los horarios de la pestaña Clientes son otra cosa** y usan otra convención de día
  (`DisponibilidadClienteTrabajador`, **0=Dom..6=Sáb**, no la ISO 1..7 de contratos y horarios).
  Desde 2026-08-31 ya no mandan sobre las sesiones, así que pueden estar desfasados: la foto fiable
  es "Mi semana".
- **`PATCH /trabajadores/me` toma `UpdateMeDto`, nunca `UpdateTrabajadorDto`.** Ese incluye `rolId` y
  `activo`: cualquier usuario autenticado podía ascenderse a ADMIN con una sola petición, y
  `GET /roles` —abierto a todo autenticado— le daba el id. Si añades un campo a
  `UpdateTrabajadorDto`, decide a mano si entra en `UpdateMeDto`: la lista blanca se mantiene a
  propósito, para que no arrastre lo que venga.
- **El tab Perfil usa `PATCH /me` en la ficha propia** y `PATCH /:id` (ADMIN-only) en la ajena. Antes
  siempre el segundo, así que un clínico veía "Editar" en su propia ficha y se comía un 403.
- **"Facturación" significaba dos cosas**: datos fiscales en la ficha y facturas emitidas en
  Administración. En la ficha se llama ya **Datos fiscales**. No hay duplicación de código:
  `/home/administracion/datos-fiscales` carga *el mismo componente*.
- **RECEP no ve "Mi semana", "Vacaciones" ni "Datos fiscales"**: sus backends son `ROLES_CLINICOS`.
  Antes se mostraban y devolvían un 403 que en Vacaciones ni se veía —el `subscribe` no tenía handler
  de error—, así que la lista salía vacía sin explicación.
- **`horarios-admin.findAll` lanza 403** al pedir las de otro sin ser ADMIN. Antes devolvía las tuyas
  en silencio, o sea: enseñaba unos datos afirmando que eran de otra persona.
- **Asignar y desasignar clientes exige el mismo permiso que leer la lista** (gestión, o uno sobre sí
  mismo). No tenían ninguna comprobación.

### Administración — el bloque económico del autónomo

El gabinete es un **colectivo de autónomos independientes** (`docs/hito-r-suscripciones-facturacion.md`):
cada terapeuta tiene su NIF, su numeración correlativa y sus facturas a las familias. Eso manda sobre
todo lo que hay aquí.

```
/home/administracion        roleGuard(ROLES_ADMINISTRACION)  ← RECEP fuera, a propósito
├── mis-contratos           tabla densa + cuota mensual comprometida + enlace a la ficha
├── facturacion             Listado | Análisis | Gestoría — una sola carga de datos
├── datos-fiscales          NIF · IBAN · IRPF · email + gestoría (mismo componente que la ficha)
└── supervision             ADMIN — vista global + generación de cualquier mes

/home/configuracion         roleGuard(ADMIN)
└── festivos                calendario del centro — ver §Calendario del centro
```

**Generación por periodo.** `POST /facturas/generar-mes` (y su `/preview`) admite cualquier mes ya
cerrado y está acotado por trabajador: cada autónomo recupera los suyos, el ADMIN puede pedir el
gabinete entero desde Supervisión. Tres cosas que hay que respetar:

- **La serie correlativa es la del año de emisión, no la del periodo facturado.** Recuperar 2025-03
  hoy emite un `NN/2026` con `periodoFacturado = 2025-03`. Numerar por el año del periodo producía un
  `47/2025` expedido después del `52/2025`: correlatividad rota.
- **Los contratos `FINALIZADO` también facturan** si su ventana de fechas cubre el periodo. El estado
  se evalúa hoy, así que filtrar solo por `ACTIVO` impedía emitir la factura de marzo de un cliente
  que causó baja en junio.
- **Los periodos futuros se rechazan** con 400: quemarían números de una serie que no ha empezado, y
  los números no se liberan (anular deja el hueco).

**Packs y entrega a la gestoría.**

- `FacturasPackService` arma un ZIP con `resumen-facturas_<periodo>.xlsx` (el libro de facturas
  emitidas, **con las anuladas incluidas** para que no haya huecos sin explicar) y los PDF nombrados
  `0012_2026-07_Tutor-Pagador.pdf`. Los PDF se leen de Object Storage por `Factura.urlPdfR2` —que
  guarda la **clave**, no una URL— y solo se regeneran con Puppeteer los que falten, con tope.
- El **cron de reconciliación** (03:00 diario) rellena los `urlPdfR2 = null`. Es lo que mantiene el
  pack barato y lo que evita que una factura sin PDF quede excluida del envío por email para siempre.
- `EnvioGestoria` + `EnvioGestoriaFactura` registran qué se entregó y cuándo; el ZIP enviado se
  archiva en `gestoria/<trabajadorId>/…`. Por encima de 20 MB se manda el libro adjunto y los PDF por
  enlace prefirmado: `EmailService` se traga los errores devolviendo `false`, así que un adjunto
  pasado de tamaño se perdería en silencio.
- Cron día 5 a las 07:00 para quien tenga `periodicidadGestoria`. Solo periodos cerrados y solo
  facturas que no hayan salido ya, así que ejecutarlo de más no duplica envíos.
- **Regla 12** del motor de notificaciones (`FACTURAS_SIN_ENTREGAR`) va como rama de primer nivel en
  `evaluarReglas`, no dentro de `clientes.map(...)`: no habla de un cliente sino del autónomo. Se
  retira explícitamente al entregar — nada en el motor quita una notificación cuando deja de aplicar.

> **RGPD:** la gestoría es **encargada del tratamiento** (art. 28) y necesita contrato de encargo. El
> concepto de la factura revela el tipo de terapia del menor. Los ficheros se nombran con el tutor
> pagador y no con el menor, pero eso reduce la exposición, no sustituye al contrato.

Reglas que conviene no romper:

- **`soloMias` en todas las pantallas "Mis…".** `GET /facturas` y `GET /contratos` no filtran por
  trabajador cuando el rol es ADMIN, y el ADMIN también es un autónomo: sin el flag, "Mis facturas" le
  enseñaba las de todo el gabinete y "Mis ingresos" graficaba los ingresos de los demás como suyos.
  **Supervisión es la única pantalla que llama sin el flag.**
- **Los contratos se crean y se replanifican en `listado/:id/contratos`**, no aquí. "Mis contratos" es
  la vista transversal del autónomo y enlaza a la ficha para actuar.
- **El contrato dice desde cuándo produce efectos, y no es la fecha de firma.** El preámbulo imprime
  `fechaInicio` en texto largo ("con efectos desde el 1 de septiembre de 2026") y la cláusula 13 aclara
  que eso es independiente de la fecha de firma, que va manuscrita en `lugarYFecha()`. Firmar en
  octubre un contrato vigente desde el 1 de septiembre es lo normal y ahora el papel lo respalda; antes
  la única fecha del documento era la de la firma, mientras la app facturaba el mes entero desde el
  día 1. Al cambiar el texto se subió `PLANTILLA_VERSION` a `contrato-v2-2026-09`, que es lo que queda
  registrado en `DocumentoCliente.plantillaVersion`.
- **Sin retención de IRPF.** `RETENCION_IRPF_PARTICULARES = 0` en `facturas.service.ts`: el receptor es
  el tutor pagador, un particular, y un particular no practica retención. `Trabajador.retencionIrpf` y
  las columnas de `Factura` se conservan para un futuro receptor empresa.
- **La exención de IVA es el 20.Uno.10, no el 20.Uno.3.** `EXENCION_IVA` en `facturas.service.ts`
  imprime *"Factura exenta de I.V.A (Artículo 20. Uno. 10º. Ley 37/1992)"*, confirmado por la gestoría
  el 2026-09-02. El 20.Uno.3 —que es lo que decía antes— exime la asistencia de **profesionales
  sanitarios de la LOPS** (Ley 44/2003), y Belén es pedagoga: no está en esa lista, así que el
  artículo que citaba la factura no la amparaba. Sigue siendo constante global a propósito:
  `exencionIvaTexto` se guarda **por factura**, de modo que cada una congela el texto con el que se
  expidió y cambiar la constante no reescribe el histórico. El día que entre una segunda autónoma con
  otro régimen —una **logopeda sí** es sanitaria de la LOPS y va por el 20.Uno.3— esto pasa a ser un
  campo de `Trabajador` sin migrar nada.
- **La emisión exige datos fiscales de las DOS partes.** `motivoSinDatosFiscales` valida al
  destinatario (nombre + NIF del tutor pagador) y `motivoSinDatosEmisor` a la profesional (NIF +
  domicilio completo), ambos en `facturas.utils.ts` y aplicados en los tres caminos de emisión
  (previsualización, generación por mes y factura puntual). El RD 1619/2012 art. 6 exige los datos del
  expedidor igual que los del destinatario, y antes solo se miraba al destinatario: una ficha fiscal a
  medias emitía igual, con el bloque del emisor en blanco en el PDF, y **quemaba un número de la serie
  correlativa que no se libera** — ni siquiera al anular, que deja el hueco a propósito.
- **Hay DOS puertas de emisión, no una.** La generación por mes
  (`POST /facturas/generar-mes`) y la **factura suelta** (`POST /facturas/puntual`), que existía sin
  interfaz hasta el 2026-09-02 y ahora tiene su modal en Facturación → *"Factura suelta…"*. La cubre
  la cláusula 2 del contrato: los informes de mayor extensión y los documentos para terceros *"no
  quedan incluidos en la tarifa mensual y serán objeto de presupuesto y facturación independiente"*.
  Consume número de serie igual que las mensuales, y el modal lo avisa.
  - El desplegable de clientes sale de `ClientesService.getMisClientes()`, **no** de
    `clientesUnicos()` del propio componente: ese se deriva de las facturas ya emitidas, o sea que
    solo lista a quien ya tiene una — justo los que no hacen falta para emitir una nueva.
  - `crearFacturaPuntual` exige que el cliente esté **asignado al terapeuta que emite**
    (`ClienteTrabajador` con `activo: true`) y devuelve 403 si no. Antes buscaba el cliente por id sin
    comprobar nada: cualquier rol clínico podía facturar por API a un cliente que no atiende. Es el
    mismo criterio que gobierna el acceso a la ficha.
  - Rellenar `contratoId` hace que la generación automática de ese mes **omita ese contrato**, por el
    `@@unique([contratoId, periodoFacturado])`. Útil a propósito para prorratear un mes a mano, trampa
    si se pone sin querer; por eso el modal no lo ofrece.
- **El destinatario fiscal es un campo propio, no un flag de `Familiar`.** Hay cuatro papeles y no
  tienen por qué recaer en la misma persona: `esContactoPrincipal` (a quién se llama primero),
  `esResponsablePago` (quién paga), `esTutorLegal` (quién firma contrato y consentimientos) y el
  **destinatario de la factura**, que vive en `Cliente.nombreTutorPagador` / `nifTutorPagador`. Son
  campos libres a propósito: el pagador puede no ser ninguno de los familiares registrados —un
  abuelo, una empresa— y su NIF puede diferir del DNI de la ficha.
  - Como se teclean a mano, el perfil ofrece **"Usar sus datos"** para copiarlos del familiar marcado
    como responsable de pago. Es un botón y no un relleno automático: nada debe sobrescribir en
    silencio lo que alguien escribió. Escribir la misma persona en dos sitios es como los dos acaban
    divergiendo, y sin nombre y NIF la factura ni siquiera se emite.
  - **Sin `Cliente.emailFacturacion` la factura NO se envía** (`enviarEmailFactura` sale con un warn),
    y **no hay fallback al email del contacto principal** — el formulario prometía uno que no existe.
    Implementarlo sería peor que no tenerlo: la factura lleva el nombre y el NIF del pagador, y
    mandarla al correo de otro progenitor es justo lo que no debe pasar.
- **La gestoría solo recibe periodos CERRADOS.** `pendientesDeEntregar` filtra
  `periodoFacturado < periodoActual`, así que con el mes en curso abierto la pestaña Gestoría no
  ofrece nada y enseña un aviso explicándolo. No es un fallo: mientras el mes sigue abierto puede
  emitirse alguna factura más y el paquete saldría incompleto.
- **El modal de generación enseña el motivo REAL de que no salga nada** (`motivoNadaQueGenerar`).
  Antes daba por hecho que un contrato bloqueado siempre esperaba los datos fiscales del tutor, lo
  cual es falso desde que agosto no se factura: el backend manda el texto bueno en
  `bloqueadas[].motivo` y la pantalla lo tiraba.
- **`anular()` deja hueco en la numeración.** Sigue sin haber factura rectificativa ni campo `serie`;
  pendiente de la gestoría junto con el registro de facturación (RD 1007/2023 / Verifactu). Es lo
  primero a resolver antes de emitir a datos reales.
- **Julio y agosto no son meses normales, porque el contrato dice que no lo son.** La cláusula 3
  promete julio prorrateado "de forma proporcional al número de sesiones efectivamente impartidas" y
  agosto sin facturar, y el generador ignoraba las dos cosas: un contrato indefinido emitía cuota
  entera en ambos, automáticamente y en contra del papel firmado. Ahora:
  **agosto** sale antes de tocar la serie correlativa y explica por qué en `bloqueadas` / `fallidas`;
  **julio** se prorratea con `importeAFacturar()` a `cuota ÷ (sesiones semanales × SESIONES_POR_CUOTA)`
  por sesión impartida. El divisor es 4 —"la cuota cubre cuatro semanas"— y es una **decisión, no un
  dato**: el contrato habla de "tarifa plana mensual" y no fija precio por sesión. Cuentan como
  impartidas `COMPLETADA` y `CANCELADA_SIN_AVISO`, esta última porque la cláusula 5 permite facturar
  como realizada la cancelación con menos de 48 h y la 6 remata que la no recuperada en plazo "se
  considerará realizada a todos los efectos".
- **Julio se factura A MES VENCIDO, y es el único.** Consecuencia de prorratearlo por sesiones
  impartidas: el 1 de julio no se ha dado ninguna, así que emitirlo entonces daría facturas de 0,00 €
  con su número de serie ya quemado. `assertJulioCerrado()` lo rechaza hasta el 1 de agosto, y
  `periodoQueTocaFacturar()` (exportada de `facturas-cron.service.ts` para poder probarla sin esperar
  a agosto) hace que el cron del día 1 **no emita nada en julio** y **emita julio el 1 de agosto**.
  El cron de email de las 09:00 usa la misma función, o mandaría el periodo equivocado.
- **Las facturas se generan y se envían solas** (`facturas-cron.service.ts`: día 1 a las 02:00 genera,
  a las 09:00 envía). El botón de Supervisión es la recuperación manual, no el camino normal — y hoy
  nadie ve si el cron funcionó, solo los logs.
- **El concepto es fijo y no nombra la terapia.** `CONCEPTO_CUOTA_MENSUAL` en `facturas.service.ts`:
  *"Servicios profesionales de reeducación pedagógica y apoyo al aprendizaje adaptado al currículo
  escolar"*, que es el del modelo de factura del gabinete. El anterior era `Cuota mensual de
  ${tipo} — ${mes}`, que describía peor el servicio para el artículo de exención que aplica y, sobre
  todo, **revelaba el tipo de terapia de cada menor en el libro que se manda a la gestoría**. El mes
  viaja en `periodoFacturado`, que es donde debe estar, y la plantilla lo pinta en portada.
- **La plantilla de factura reproduce el modelo del gabinete**: logo (embebido en base64 en
  `common/documentos/logo.ts`, porque `page.setContent()` no resuelve rutas relativas), Nº de
  colegiada, IBAN + SWIFT, forma de pago y fecha de vencimiento (emisión + 9 días = los "diez días
  naturales" de la cláusula 3). **La fila de IVA se pinta siempre, también al 0%**: antes desaparecía
  justo en el único caso real, así que la factura no declaraba en ninguna parte el tipo aplicado, que
  es obligatorio. `scripts/previsualizar-factura.ts` genera un PDF de ejemplo para comparar a ojo.
- **Vocabulario compartido**, no reimplementado: `shared/utils/facturacion.utils.ts` (meses, periodos,
  `esComputable`, totales), `shared/charts/chart-theme.ts` (Chart.js) y los helpers de
  `interface/contrato.interface.ts` (`tipoColor`, `tipoLabel`, `diaLabel`…). Había tres tablas de meses
  con dos convenciones y una copia divergente de los colores por tipo de terapia.

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

**La paleta es CREMA Y VERDE BOSQUE.** No es lila (eso fue una versión anterior y sobrevivió en la
documentación mucho después de morir en el código) y sobre todo **no es la escala slate de Tailwind**.
Los neutros son cálidos a propósito. Fuente de verdad: `frontend/src/sass/abstracts/_variables.scss`.

```scss
$primary: #2d4a3e;           // 8.08  verde bosque — SEÑALA, no rellena
$primary-dark: #1f2a24;      // 12.34 hover y texto sobre claro
$primary-light: #d9e8da;     //       fondos de selección
$primary-ultra-light: #eef4ec;
$secondary: #3a5c74;         // 5.89  azul pizarra — apoyo, nunca compite
$success: #2f6b43;   $warning: #8a6018;   $danger: #96382e;   $info: #345c6b;

// Grises CÁLIDOS. El fondo de la app es papel, no un gris azulado.
$gray-50:  #f0ead8;          //       papel — fondo de la app
$gray-100: #e5eadf;          //       salvia — superficies hundidas, filas alternas
$gray-200: #c2cdc3;          //       bordes
$gray-400: #798d82;          //  2.94 DESHABILITADO — prohibido para texto
$gray-500: #556d62;          //  4.66 texto secundario (el más claro admisible)
$gray-600: #2d4a3e;          //  8.08 texto normal
$gray-800: #23322b;          // 11.18 títulos

$shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba($primary, 0.06);
$border-radius-lg: 0.75rem;
$font-family-base: "Plus Jakarta Sans", ...
```

**Cero hex a mano.** Todo color sale de un token. Los ratios de contraste están medidos y anotados
en `_variables.scss`; un literal se salta esa auditoría. `#f8fafc` sobre papel `#f0ead8` no es un
matiz, es una isla — ya pasó una vez en "Mi semana" y hubo que rehacer la pantalla.

**Usa las primitivas antes de escribir CSS nuevo.** `abstracts/_componentes.scss` define
`.gb-btn` (+ `--primary --ghost --peligro --icon --sm`), `.gb-badge`, `.gb-chip`, `.gb-card`,
`.gb-table` + `.gb-table-wrap` + `.gb-fila`, `.gb-empty`, `.gb-dato`, `.gb-header`, `.gb-segmented`.
Nacieron para matar 14 sistemas de botón y 20 de badge; no añadas el 15º.

**Foco visible: obligatorio y manual.** `base/_reset.scss` quita el `outline` de todo `button` y
**no hay `:focus-visible` global** que lo reponga. Cada control interactivo declara el suyo, con los
patrones canónicos de `_componentes.scss`: botón → `box-shadow: 0 0 0 3px rgba($primary, .25)`;
control pequeño → `outline: 2px solid $primary; outline-offset: 1px`. Lo que hereda de `.gb-btn` ya
lo trae. `prefers-reduced-motion` sí está cubierto globalmente en `base/_utilities.scss`.

**Breakpoints con `@include respond-to('sm'|'md'|…)`** (`_mixins.scss`), no `@media` con píxeles
literales. No son equivalentes: `respond-to` resta `0.02px`.

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
- `Cliente.consentimientoRgpd Bool` + `consentimientoFecha` + `consentimientoTrabajadorId` —
  **caché derivada**, no fuente de verdad (ver §"Consentimiento RGPD")
- `Trabajador.numeroColegiado String?` + `especialidad String?`

### Consentimiento RGPD — una sola fuente de verdad

`ConsentimientoRgpd` es la fuente de verdad y es de **solo añadir**: cada fila es un hecho
ocurrido (se otorgó o se revocó) y nunca se edita. El estado actual es la fila más reciente,
no "la primera aceptada".

**Solo `ConsentimientosService` escribe el consentimiento.** Ni el alta, ni el `PATCH` de
cliente, ni el frontend. Antes lo escribían cuatro sitios con criterios distintos y la
pestaña del perfil podía contradecir a los listados.

Los dos únicos caminos, y los dos aportan documento:

| Camino | Quién | Endpoint |
|---|---|---|
| Subir el consentimiento de datos firmado desde el expediente (el normal) | ROLES_CLINICOS + RECEP | `POST /expediente/documento/:id/firmado` |
| Registro manual del papel firmado fuera de la app (excepción) | ADMIN | `POST /clientes/:id/consentimiento` (multipart, exige el escaneado) |

Revocación: `POST /clientes/:id/consentimiento/revocar` con `{ motivo }`. El tutor que revoca
lo resuelve el backend a partir del último consentimiento vigente — **no se acepta del
navegador**. No corta el acceso clínico (Ley 41/2002 obliga a conservar el historial): deja
la fila, escribe en `AuditLog` y notifica a ADMIN con prioridad `URGENTE`.

**Alcances granulares.** El PDF que firma la familia
(`expediente/templates/consentimiento-datos.template.ts`) tiene tres casillas independientes
más el consentimiento del propio menor, y se guardan por separado porque son revocables por
separado: `autorizaInformesTerceros`, `autorizaCoordinacionCentro`, `autorizaImagenes`,
`consentimientoMenor14`. Usa `ConsentimientosService.puedeCoordinarConCentro()` antes de
mandar nada al colegio. **No** derives estos permisos del booleano de `Cliente`.

**Firman uno o los dos tutores.** `ConsentimientoFirmante` (tabla puente) recoge a cada tutor
legal que suscribe el documento: con dos titulares de la patria potestad lo normal es que
firmen ambos, y el PDF tiene dos bloques de representante legal. `ConsentimientoRgpd` **no**
tiene `familiarId`; se lee `firmantes[]`. Una revocación arrastra los mismos firmantes del
consentimiento que retira. Que firme uno solo teniendo dos tutores es válido (art. 156 CC) y
no se bloquea, pero el panel y el formulario lo avisan.

Reglas que conviene no romper:
- Solo familiares con `esTutorLegal` pueden consentir (LOPDGDD art. 7), y se validan **todos**
  antes de subir el PDF, para no dejar ficheros huérfanos en el bucket.
- `assertTutoresLegales()` devuelve la lista **deduplicada**: la PK de
  `consentimiento_firmantes` es compuesta y un firmante repetido la rompe. Usa su valor de
  retorno, no el array de entrada.
- Los `firmanteIds` viajan por multipart como **campo repetido**; el DTO los normaliza a lista
  (`aLista()`), porque un solo valor llegaría como string.
- `versionTexto` es la `PLANTILLA_VERSION` real del documento firmado. Nunca una constante del
  frontend: el texto que la familia firma es el PDF del backend, y no debe existir una segunda
  copia en `perfil-tab`.
- El alta **no** otorga consentimiento. El cliente nace pendiente y la regla 10 avisa; el
  wizard solo informa de que los documentos se generarán con el contrato.

Frontend: `perfil-tab` es un **panel de evidencia** (estado, tutor, versión, enlace al PDF,
alcances, histórico) más revocar y —solo ADMIN— el registro manual. El paso que pide tutor y
casillas al subir el firmado vive en `informes-tab` (pestaña Documentación).

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

### Registro diario — el día que refiere vs. cuándo se escribió

Son **dos cosas distintas** y la pantalla las separa:

- **`fechaRegistro` = el DÍA de la sesión.** Se guarda a las 12:00 UTC (`diaDesdeIso`) y se pinta
  **sin hora**. Antes se guardaba con `new Date("2026-09-02")`, o sea la medianoche UTC, y la
  tarjeta la pintaba con `dd/MM/yyyy · HH:mm`: **todos los registros salían "hechos a las 02:00 am"**
  (01:00 en invierno). No era la hora de nada, era el desfase de Madrid.
- **`createdAt` = cuándo se tecleó.** Ese sí es un instante real y ya era correcto.

La tarjeta enseña `createdAt` **solo cuando cae en un día distinto** al que refiere el registro
("Escrito el 04/09/2026 · 09:14", en ámbar). Rellenar más tarde es normal y no se trata como error,
pero un registro tardío es justo donde se cuela una errata en el día, así que se dice.

> El día por defecto del formulario se calcula en **local, no en UTC**. `toISOString()` convierte
> antes de recortar, así que en Madrid entre medianoche y las 02:00 devolvía la víspera: escribir el
> registro al llegar a casa a las 00:30 lo fechaba el día anterior. El campo del drawer ya se llama
> "Fecha de sesión", que es lo que es.

### ClienteDrawerComponent pattern (Perfil tab)

Complex form sections use a shared `ClienteDrawerComponent` with sections: `personal | sanitario | contactos | colegio`. Simple boolean fields use inline toggle directly in `perfil-tab.component.ts`.

---

## Testing

### Backend — current state
- **Unit**: 469 tests, 34 suites — all green. Jest + @nestjs/testing.
- **E2E**: 60 tests, 6 suites — all green. supertest + Jest. `test/helpers/create-app.ts` + `test/helpers/prisma-mock.ts`. `ThrottlerGuard` overridden in `create-app.ts`. CI (`ci.yml`) runs a real Postgres service + `prisma migrate deploy` before the suite.

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