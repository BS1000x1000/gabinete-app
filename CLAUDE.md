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
| `notificaciones` | Notification engine. `motor-reglas.service.ts` evaluates 10 rules and persists `Notificacion` records. `NotificacionesSseService` manages per-therapist SSE streams (real-time push). `JwtFlexGuard` (in `auth/guards/`) accepts Bearer header OR `?token=` query param — required for the `GET /notificaciones/stream` SSE endpoint since `EventSource` cannot send custom headers. |
| `dashboard` | Aggregated stats for the operational dashboard. |
| `informes` | Structured reports (`INICIAL` / `SEGUIMIENTO`) with PDF snapshot support. |
| `n8n` | Outbound webhook calls to n8n (not registered in `AppModule` — called from services directly). |
| `common/filters` | Global exception filters and interceptors. |

**Auth flow**: `POST /auth/login` → JWT (8h) → all routes protected by `JwtAuthGuard` (Bearer header). Exception: `GET /notificaciones/stream` uses `JwtFlexGuard` which also accepts `?token=` query param for SSE compatibility.

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
│   │       └── tabs/    # Active tabs only (5):
│   │           ├── perfil-tab       # personal + sanitario + contactos + colegio + RGPD
│   │           ├── sesiones-tab
│   │           ├── bonos-tab
│   │           ├── progreso-tab     # registro + objetivos GAS
│   │           └── informes-tab
│   │           # DELETED: cliente-tab, colegio-tab, contactos-tab, sanitario-tab, registro-tab, objetivos-tab
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

---

## Patrones y lecciones aprendidas

### Bootstrap: overflow horizontal por márgenes negativos de `.row`

Las clases `.row.g-*` de Bootstrap aplican `margin-left` y `margin-right` negativos (`-0.5 * gutter`). Cuando se usan dentro de un contenedor flex/scroll sin `overflow-x: hidden`, generan un scrollbar horizontal no deseado.

**Fix estándar:**
1. Añadir `overflow-x: hidden; min-width: 0;` al contenedor padre (scroll o flex).
2. Dar padding al wrapper que contiene la `.row` para absorber el gutter negativo (ej: `px-3` cuando se usa `g-4`).

```scss
// En el contenedor padre del scroll
.mi-body {
  overflow-y: auto;
  overflow-x: hidden; // ← corta el gutter bleed de Bootstrap
  min-width: 0;       // ← evita que el flex-child ignore su límite
}
```

```html
<!-- En la template, añadir padding al wrapper de la row -->
<div class="container-fluid px-3 py-3">  <!-- NO p-0 -->
  <div class="row g-4">...</div>
</div>
```

### Patrón: descargas de archivos con estado de carga

Los métodos de servicio que generan y descargan archivos (PDF, Excel) **DEBEN** devolver `Observable<void>`, nunca `void`. Esto permite que el componente gestione `isLoading` con `finalize()`.

```typescript
// ❌ Incorrecto — el componente no puede controlar el estado
descargarPdf(id: string): void {
  this.http.get(..., { responseType: 'blob' })
    .subscribe(blob => triggerDownload(blob, 'file.pdf'));
}

// ✅ Correcto
descargarPdf(id: string): Observable<void> {
  return this.http.get(..., { responseType: 'blob' }).pipe(
    tap(blob => triggerDownload(blob, 'file.pdf')),
    map(() => void 0),
  );
}
```

En el componente, gestionar el estado así:

```typescript
descargando = signal(false);

descargar(): void {
  if (this.descargando()) return; // bloquea doble-click
  this.descargando.set(true);
  this.service.descargarPdf(id)
    .pipe(finalize(() => this.descargando.set(false)))
    .subscribe();
}
```

En el template:
```html
<button [disabled]="descargando()" (click)="descargar()">
  <span *ngIf="descargando()" class="spinner-border spinner-border-sm me-1"></span>
  <i *ngIf="!descargando()" class="bi bi-file-earmark-pdf me-1"></i>
  {{ descargando() ? 'Generando...' : 'Descargar PDF' }}
</button>
```

### Convención de tabs dentro de la ficha de cliente

Los sub-componentes de tabs (`registro-tab`, `objetivos-tab`, etc.) deben seguir el sistema de diseño del proyecto (clases propias del SASS, no Bootstrap puro) para mantener consistencia visual. Las tabs que aún usan `card`, `container-fluid`, `btn-group` de Bootstrap directamente son deuda técnica pendiente de migrar.

---

## Testing — Patrones y lecciones

### Infraestructura de tests (estado actual)

- **Backend unit**: Jest 30 + ts-jest + `@nestjs/testing`. ~211 tests en verde.
- **Backend E2E**: Supertest + Jest. 32 tests en verde. Config en `test/jest-e2e.json`.
- **Frontend**: Karma + Jasmine + `@angular/core/testing`. ~374 tests en verde (Chrome Headless).

### Backend — patrón estándar de controller spec

```typescript
const module = await Test.createTestingModule({
  controllers: [XController],
  providers: [{ provide: XService, useValue: serviceMock }],
})
  .overrideGuard(JwtAuthGuard)
  .useValue({ canActivate: () => true })
  .compile();
```

Siempre usar `makeMock()` con `jest.fn()` por cada método del servicio para poder encadenar `.mockResolvedValue(...)`.

### Backend E2E — infraestructura

Los ficheros `test/helpers/prisma-mock.ts` y `test/helpers/create-app.ts` replican la configuración exacta de `main.ts` (prefix `api`, `ResponseInterceptor`, `AllExceptionsFilter`, `ValidationPipe`). **`MotorReglasService` SIEMPRE debe sobreescribirse** porque se activa en el login y hace múltiples llamadas a la BD:

```typescript
moduleFixture
  .overrideProvider(PrismaService).useValue(prismaMock)
  .overrideProvider(MotorReglasService).useValue({ evaluarReglas: jest.fn().mockResolvedValue(undefined) })
```

El `jest-e2e.json` necesita `moduleNameMapper` para resolver imports `src/`:
```json
{ "moduleNameMapper": { "^src/(.*)$": "<rootDir>/../src/$1" } }
```

### Backend E2E — mock state contamination entre tests

Si varios tests del mismo `describe` usan el mismo mock de Prisma sin `beforeEach` reset, el estado de las llamadas anteriores puede contaminar el siguiente test. Solución: encadenar `mockResolvedValueOnce` para llamadas secuenciales dentro de un mismo test:

```typescript
prisma.cliente.findUnique
  .mockResolvedValueOnce(null)        // primera llamada: comprobación DNI
  .mockResolvedValue(clienteNuevo);   // segunda llamada: fetch post-creación
```

### Frontend — patrón estándar de service spec (HttpClient)

```typescript
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
});
service = TestBed.inject(XService);
httpMock = TestBed.inject(HttpTestingController);
// ...
afterEach(() => httpMock.verify());
```

### Frontend — NO usar `spyOn` en named exports de ES modules

`spyOn(downloadUtils, 'triggerDownload')` **FALLA** con `"triggerDownload is not declared writable or has no setter"` porque los named exports de módulos ES son non-writable/non-configurable.

**Solución**: stubear las APIs del navegador que usa la función en lugar de la función en sí:

```typescript
beforeEach(() => {
  spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
  spyOn(URL, 'revokeObjectURL');
});
```

Si el test necesita verificar el nombre del archivo descargado, rediseñar para verificar que el observable completa sin error, en lugar de assertar sobre `triggerDownload`.

### Frontend — tests con signals y efectos de tap/side-effects

Los métodos de servicio que usan `tap()` para actualizar signals necesitan que el observable se suscriba Y que el HttpMock devuelva el flush **después** de suscribir, para que el tap se ejecute:

```typescript
service.getSomething().subscribe();           // 1. suscribir
httpMock.expectOne(url).flush(wrap(data));    // 2. flush → tap se ejecuta
expect(service.signal()).toEqual(data);       // 3. assertar el signal
```

### Frontend — timezone en tests de fechas

Los tests que comparan horas derivadas de fechas UTC (`'2026-03-10T09:00:00.000Z'`) con valores locales FALLARÁN en máquinas con offset UTC+N. Calcular los valores esperados dinámicamente igual que lo hace el servicio:

```typescript
const inicio = new Date(sesion.fechaHoraInicio);
const expectedHora = `${String(inicio.getHours()).padStart(2, '0')}:${String(inicio.getMinutes()).padStart(2, '0')}`;
expect(service.nuevaHoraInicio()).toBe(expectedHora); // ✅ timezone-safe
```

### SSE — Server-Sent Events para notificaciones en tiempo real

`EventSource` del navegador no permite cabeceras personalizadas. El token JWT viaja como query param `?token=`. El `JwtFlexGuard` acepta ambas formas (Bearer header y query param). El frontend conecta en login vía `AuthService` y reconecta en recarga vía `HomeComponent.ngOnInit()` usando `authSvc.token()` — nunca acceder a localStorage directamente.

```typescript
// En NotificacionesService
conectarSSE(token: string) {
  if (this._eventSource) return; // idempotente
  this._eventSource = new EventSource(`${this.api}/stream?token=${encodeURIComponent(token)}`);
  this._eventSource.onmessage = (e) => { /* añade al signal */ };
  this._eventSource.onerror = () => {
    if (this._eventSource?.readyState === EventSource.CLOSED) this._eventSource = null;
  };
}
```

### Búsqueda global (SearchBarComponent)

`SearchBarComponent` usa Fuse.js para búsqueda fuzzy en cliente. Los datos se cargan al init (`cargarClientes()` + `cargarInformes()`). Resultados en 3 categorías con navegación unificada por teclado via `todosResultados = computed(() => [...clientes, ...informes, ...sesiones])`. El índice `selectedIndex` apunta a la lista plana. El listener de teclado se registra en `ngOnInit` y se limpia en `ngOnDestroy`.

### Frontend — interfaces estrictas en mocks de test

Los mocks de test deben incluir todos los campos requeridos de la interfaz. Campos comunes que se olvidan:

- `RegistroDiario`: usa `fechaRegistro` (NO `fecha`)
- `Informe`: requiere `tipoInforme` (NO `tipo`), `estado`, `trabajadorId`, `updatedAt`
- `EstadisticasTrabajador`: estructura anidada `{ clientesAsignados, sesiones: { hoy, esteMes, porEstado: {...} }, registros: { esteMes } }`
- `MiDiaResponse`: requiere `saludo`, `contadores`, `sesionesHoy`, `alertasUrgentes`, `accionesPendientes`, `resumenMes`
