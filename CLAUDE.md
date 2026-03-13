# CLAUDE.md

Guidance for Claude Code when working with this repository.

## Project Overview

**Gabinete Pedagógico** — management app for a multi-therapist pediatric therapy practice. Manages clients (children), therapists (trabajadores), sessions, vouchers (bonos), GAS goals, daily records, reports, smart notifications, and advanced statistics.

Stack: **Angular 19** (frontend) + **NestJS 11** (backend) + **Prisma 5** + **PostgreSQL** + **n8n** (Docker, port 5678, not yet registered in AppModule).

**Current state (2026-03-13)**: ~99% complete. Multi-user RBAC (Hito I), advanced statistics with Chart.js (Hito H), and all core clinical features are implemented. Remaining: n8n integration, formal billing module, mobile polish.

---

## Commands

### Backend (`/backend`)

```bash
npm run start:dev        # Dev server with watch (port 3000)
npm run build            # Production build
npm run lint             # ESLint with auto-fix
npm test                 # Jest unit tests (220 passing)
npm run test:e2e         # E2E tests (supertest)
npm run test:cov         # Coverage report
npx jest src/foo/foo.spec.ts   # Single spec file
```

Prisma:
```bash
npx prisma migrate dev --name <nombre>   # New migration
npx prisma db push                        # Push schema without migration
npx prisma studio                         # DB GUI
npx prisma generate                       # Regenerate client after schema change
```

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
| `auth` | JWT + Passport local. Token 8h. `JwtAuthGuard` on all routes. `JwtFlexGuard` for SSE (also accepts `?token=` query param). |
| `trabajador` | Therapist CRUD + profile + password change. |
| `clientes` | Client CRUD, family contacts, health data, RGPD consent. |
| `sesiones` | Session generation from availability, state machine (`PROGRAMADA → COMPLETADA/CANCELADA_*`). Integrates with bonos. |
| `bonos` | Voucher lifecycle (`ACTIVO → CONSUMIDO`). Payment tracking. |
| `disponibilidad` | Weekly schedule slots per client-therapist pair. |
| `objetivos-generales` | Catalogue of goals grouped by `AreaDesarrollo`. |
| `gas` | GAS system — `ClienteObjetivo` → `EvaluacionGAS`. Levels -2..+2. |
| `notificaciones` | 10-rule notification engine (`motor-reglas.service.ts`). SSE real-time push via `NotificacionesSseService`. |
| `dashboard` | `getMiDia` (operational today view) + `getResumenCompleto` + `getEstadisticasAvanzadas` (advanced stats with date range + role-scoped data). |
| `informes` | Structured reports (`INICIAL` / `SEGUIMIENTO`) + PDF via Puppeteer. Role-scoped: RECEP only sees FINALIZADO. |
| `export` | PDF/Excel exports (sesiones, bonos). Puppeteer + ExcelJS. |
| `fichaje` | Daily record CRUD + objective linking. ROLES_CLINICOS only. |
| `gas` | GAS evaluation. ROLES_CLINICOS only for mutations. |
| `roles` | Role CRUD. |
| `health` | Health check endpoint. |

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
│   │           ├── informes-tab
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
- Ajustes → all roles

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

### Environment

`backend/.env`:
```
DATABASE_URL=postgresql://...
SECRET=<jwt-secret>
```

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

### SSE — Server-Sent Events

`EventSource` cannot send custom headers. JWT travels as `?token=` query param. `JwtFlexGuard` accepts both Bearer header and query param. Frontend connects in `AuthService` login and reconnects in `HomeComponent.ngOnInit()`.

### Drawer pattern (Registro Diario)

Global `RegistroDrawerService` with `open(clienteId, sesionId?)`. Drawer component subscribes to the service signal. Overlay semitransparent on body.

### ClienteDrawerComponent pattern (Perfil tab)

Complex form sections use a shared `ClienteDrawerComponent` with sections: `personal | sanitario | contactos | colegio`. Simple boolean fields use inline toggle directly in `perfil-tab.component.ts`.

---

## Testing

### Backend — current state
- **Unit**: 220 tests, 17 suites — all green. Jest + @nestjs/testing.
- **E2E**: supertest + Jest. `test/helpers/create-app.ts` + `test/helpers/prisma-mock.ts`.

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
19 E2E tests covering: RECEP → 403 on clinical endpoints, 200 on allowed. ADMIN → 200 global stats. PEDAGOGO → 403 on ROLES_GESTION endpoints. Without token → 401.

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

- `ClientesComponent` still navigates to `/cliente` (legacy) in lines 131 and 198 — works via redirect
- `n8n` module exists but is NOT registered in `AppModule`
- rbac.e2e-spec.ts has a minor TypeScript strict error (`username` property type) — runtime behavior correct, tests pass
