# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gabinete Pedagógico** — management app for a therapeutic/pedagogical practice. Manages clients (children), therapists (trabajadores), sessions, session vouchers (bonos), goals (objetivos GAS), daily records, reports, and smart notifications.

Stack: **Angular 19** (frontend) + **NestJS 11** (backend) + **Prisma 5** + **PostgreSQL** + **n8n** (Docker, port 5678).

---

## Commands

### Backend (`/backend`)

```bash
npm run start:dev      # Dev server with watch (port 3000)
npm run build          # Production build
npm run lint           # ESLint with auto-fix
npm test               # Jest unit tests
npm run test:e2e       # End-to-end tests
npm run test:cov       # Coverage report
```

Single test file:
```bash
npx jest src/sesiones/sesiones.service.spec.ts
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
npm start       # Dev server (ng serve, port 4200)
npm run build   # Production build
npm test        # Karma/Jasmine tests
```

### n8n (notifications)

```bash
docker compose up -d   # Start n8n at http://localhost:5678
```

---

## Architecture

### Backend — NestJS modules

Each domain follows the standard NestJS pattern: `module → controller → service → dto/types`. All DB access goes through `PrismaService` (singleton in `PrismaModule`).

Key modules in `backend/src/`:

| Module | Responsibility |
|---|---|
| `auth` | JWT + Passport local strategy. Token valid 8 hrs. Uses `SECRET` env var. |
| `trabajador` | Therapist CRUD and profile management. |
| `clientes` | Client CRUD, family contacts, health data (sanitario). |
| `sesiones` | Session generation from client availability, state machine (`PROGRAMADA → COMPLETADA/CANCELADA`). Integrates with `bonos`. |
| `bonos` | Session voucher lifecycle (`ACTIVO → CONSUMIDO`). Tracks payment and consumption. |
| `disponibilidad` | Client and client-therapist weekly schedule slots. |
| `objetivos-generales` | Catalogue of general goals grouped by `AreaDesarrollo`. |
| `gas` | GAS (Goal Attainment Scaling) system — see data model below. |
| `notificaciones` | Notification engine. `motor-reglas.service.ts` evaluates rules and persists `Notificacion` records. Types: `BONO_AGOTADO`, `BONO_CASI_AGOTADO`, `INFORME_INICIAL_PENDIENTE`, `SIN_SESIONES_RECIENTES`, etc. |
| `dashboard` | Aggregated stats for the operational dashboard. |
| `informes` | Structured reports (`INICIAL` / `SEGUIMIENTO`) with PDF snapshot support. |
| `n8n` | Outbound webhook calls to n8n (not registered in `AppModule` — called from services directly). |
| `common/filters` | Global exception filters and interceptors. |

**Auth flow**: `POST /auth/login` → JWT → all other routes protected by `JwtAuthGuard`.

### Frontend — Angular 19

All components are **standalone** using **signals** for state.

```
frontend/src/app/
├── components/          # One-off components (LoginComponent)
├── features/
│   ├── home/            # Main shell after login
│   │   ├── dashboard/   # Operational dashboard (DashboardHomeComponent)
│   │   ├── agenda/      # FullCalendar-based weekly schedule
│   │   └── listado/     # Client detail with tabs
│   │       └── tabs/    # One subfolder per tab:
│   │           ├── cliente-tab, colegio-tab, contactos-tab
│   │           ├── sesiones-tab, bonos-tab, objetivos-tab
│   │           ├── registro-tab, sanitario-tab, trabajador-tab
│   │           └── informes-tab
│   └── clientes/        # Client list/search
├── services/            # Angular services (one per backend domain)
├── shared/
│   ├── components/      # Reusable UI components
│   ├── guards/          # authGuard
│   ├── pipes/           # Custom pipes
│   └── utils/           # authInterceptor (attaches JWT to all requests)
├── models/              # TypeScript interfaces mirroring Prisma types
└── validators/          # Custom form validators
```

**Routing**: lazy-loaded via `loadChildren`/`loadComponent`. Default route after login is `/home/dashboard`. `authGuard` protects the entire `/home` subtree.

### Styles

**Never put styles in `component.scss`**. All styles live in `frontend/src/sass/` and are imported centrally in `main.scss`.

```
sass/
├── abstracts/   # _variables.scss, _mixins.scss, _functions.scss
├── base/        # _root.scss, _reset.scss, _typography.scss, _utilities.scss
├── components/  # _agenda.scss, _bonos.scss, _sesiones.scss, _notificaciones.scss, etc.
├── layout/      # _header.scss, _sidebar.scss, _footer.scss, _tab-contents.scss
└── pages/       # _login.scss, _home.scss, _clientes.scss, _dashboard.scss
```

- **Icons**: Bootstrap Icons (`bi-*` CSS classes)
- **Primary color**: `#7c6fd6` (lila), **secondary**: `#5a9de8` (blue)
- Bootstrap 5 + ngx-bootstrap for UI components

### Data model highlights

- `Cliente` ↔ `Trabajador` linked via `ClienteTrabajador` (supports multiple therapy types per client).
- `Sesion` belongs to a `ClienteTrabajador` pair and optionally to a `Bono`.
- **GAS system**: `ObjetivoGeneral` (catalogue) → `ClienteObjetivo` (assignment per client with 5-level descriptors at `-2..+2`) → `EvaluacionGAS` (timestamped evaluations). `nivelGASActual` is denormalized on `ClienteObjetivo` for fast reads.
- `RegistroDiario` tracks daily session notes and links to `ObjetivoGeneral` items worked (`RegistroDiarioObjetivo`).
- `Notificacion` stores generated alerts per therapist/client with priority (`URGENTE`, `ALTA`, `MEDIA`, `BAJA`) and read/dismissed state.

### Environment

Backend requires a `.env` file in `backend/`:
```
DATABASE_URL=postgresql://...
SECRET=<jwt-secret>
```
