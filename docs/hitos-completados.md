# Hitos completados — Historial

Gabinete Pedagógico · Angular 19 + NestJS + Prisma + PostgreSQL  
Última actualización: 2026-04-13

---

## Hitos V1 originales

### Hito 1 — Sistema de Bonos y Control de Sesiones ✅
Bonos por cliente con `tipoSesion TipoSesion` requerido. Descuento automático en transacción atómica al completar sesión. Un solo bono ACTIVO por cliente (409 si ya existe). Frontend: `bonos-tab` con barra de progreso e historial.

**Endpoints**: POST/GET /api/bonos · PATCH /api/bonos/:id/pago · PATCH /api/bonos/:id/cancelar

---

### Hito 2 — Motor de Notificaciones ✅
10 reglas automáticas sin duplicados (clave: reglaOrigen + clienteId + referenciaId). SSE en tiempo real.

**Reglas:**
- `INFORME_INICIAL_PENDIENTE` — >30 días sin informe inicial finalizado
- `INFORME_SEGUIMIENTO_PENDIENTE` — >180 días sin informe finalizado
- `BONO_AGOTADO` — bono con 0 sesiones restantes sin cobrar
- `BONO_CASI_AGOTADO` — 1 sesión restante
- `BONO_PENDIENTE_PAGO` — >7 días sin abonar
- `SIN_SESIONES_RECIENTES` — >21 días sin actividad
- `OBJETIVO_SIN_EVALUAR` — >30 días sin evaluación GAS
- `INFORME_EN_BORRADOR` — >14 días en estado borrador
- `SESION_SIN_BONO` — sesión completada sin bono asociado
- `CONSENTIMIENTO_RGPD_PENDIENTE` — cliente sin consentimiento firmado

---

### Hito 3 — Dashboard Operativo `getMiDia` ✅
`GET /api/dashboard/mi-dia` — todo en 1 llamada: sesiones de hoy, alertas urgentes (top 5), informes en borrador, bonos sin cobrar, objetivos sin evaluar, contadores del mes.

---

### Hito 4 — Historial exportable PDF/Excel ✅
Sesiones y bonos exportables. PDF via Puppeteer, Excel via ExcelJS. `export.service.ts` frontend con `Observable<void>` para gestionar estado de carga (spinner en botón).

---

## Rediseño UX — 6 fases ✅

- **Fase 1** — Sidebar nuevo (slim, siempre visible, acciones rápidas al pie)
- **Fase 2** — Agenda conectada a API real, grid semanal tipo Teams, sin mock-turnos
- **Fase 3** — Drawer Registro Diario global, contextual desde sesión o sidebar. TiptapEditor.
- **Fase 4** — Ficha cliente: 10 tabs colapsadas a 5+1: perfil · sesiones · bonos · progreso · informes · terapeutas
- **Fase 5** — Listado clientes mejorado (filtros, búsqueda, RGPD badge)
- **Fase 6** — Polish global (toasts, confirm modals, estados vacíos, responsive)

---

## Hitos posteriores

### Hito A — Grid semanal tipo Teams ✅
`AgendaComponent` con `angular-calendar` en vista semanal. Horas en columna izquierda, sesiones como eventos coloreados por tipo.

### Hito B — Unificación diseño tabs ✅
`registro-tab` y `objetivos-tab` integrados en `progreso-tab` con diseño consistente.

### Hito C — Persistir filtros sesiones-tab ✅
Filtros por estado/tipo/fecha guardados en señales y sobreviven a la navegación.

### Hito D — Tests reales 100% ✅
- Backend unit: 220 tests · 17 suites · Jest
- Backend E2E: supertest. Helpers `createTestApp` + `createPrismaMock`
- Frontend: Karma + Jasmine + Chrome Headless

### Hito E — RGPD mínimo viable ✅ (2026-03-10)
- `consentimientoRgpd Bool` + `consentimientoFecha DateTime?` en `Cliente`
- `numeroColegiado String?` + `especialidad String?` en `Trabajador`
- Wizard: checkbox RGPD obligatorio antes de finalizar
- `perfil-tab`: card "Autorizaciones y RGPD" con toggle inline
- PDF informe: firma con `numeroColegiado` + texto RGPD Art. 9 LOPDGDD
- Badge RGPD pendiente en listado y header de ficha

### Hito F — Notificaciones SSE tiempo real ✅
`NotificacionesSseService` con streams por trabajador. `JwtFlexGuard`. Frontend reconecta en reload via `HomeComponent.ngOnInit()`. Ver detalle en [sse-notificaciones.md](sse-notificaciones.md).

### Hito G — Búsqueda global Cmd+K ✅
`SearchBarComponent` con Fuse.js. 3 categorías: clientes, informes, sesiones. Navegación por teclado unificada via índice plano `selectedIndex`.

### Hito I — Multi-usuario RBAC + Data Scoping ✅ (2026-03-13)
- `ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA']`
- `ROLES_GESTION = ['ADMIN', 'RECEP']`
- `RolesGuard` activo en: informes, dashboard, gas, fichaje, clientes (endpoints clínicos)
- Data scoping en servicios: clientes (asignados vs todos), informes (FINALIZADO para RECEP), dashboard (global vs propio)
- `Bono.tipoSesion` requerido — un bono por tipo de terapia
- `roleGuard(['ADMIN','PEDAGOGO','NEURO','LOGOPEDA'])` en ruta `progreso`
- 19 tests E2E RBAC verificando 403/200/401 por rol

Ver plan técnico completo en [hito-i-rbac.md](hito-i-rbac.md).

### Hito H — Estadísticas avanzadas ✅ (2026-03-13)
- Endpoint: `GET /api/dashboard/estadisticas-avanzadas?desde=&hasta=&trabajadorId=`
- ADMIN/RECEP: pueden ver global o filtrar por trabajador; terapeutas: siempre sus datos
- Frontend `EstadisticasComponent`: 4 mini-cards + line (evolución semanal) + donut (distribución) + barras apiladas (estados) + ranking top clientes
- Chart.js via ng2-charts@8. Plugin custom `DONUT_CENTER_PLUGIN` para total en centro del donut.
- Datos reactivos: signals `lineData/donutData/barData` actualizados via `effect()`

### Hito N — Automatizaciones n8n ✅ (2026-03-19)
1. **Alerta bono agotado**: n8n cron diario → `GET /api/n8n/bonos-alertas` → email a familiar responsable de pago
2. **Informe de sesiones para familia**: terapeuta genera borrador → revisa → "Enviar a familia" → n8n llama GPT-4o-mini → genera PDF → Resend lo envía

Ver detalle completo en [n8n-automatizaciones.md](n8n-automatizaciones.md).

---

---

## Sesión de fixes y hardening (2026-04-13)

### Auth guard — login no redirigía ✅
`authGuard` usaba `localStorage.getItem('access_token')` que nunca se escribe (el JWT es HttpOnly cookie). Corregido: ahora usa `AuthService.isAuthenticated()` (signal respaldado por `current_user` en localStorage).

### Build frontend — 3 errores de compilación ✅
- `home.component.ts`: llamaba `authSvc.token()` (inexistente) y `conectarSSE(token)` — SSE migró a cookie, el método no acepta argumento. Corregido + `AuthService` eliminado del componente.
- `registro-tab.component.ts`: `SecurityContext` ya no se re-exporta desde `@angular/platform-browser` en Angular 19. Movido a `@angular/core`.

### Todo el bloque 4 de seguridad confirmado completo ✅
Rate limiting (ThrottlerModule), CORS por env var (FRONTEND_URL), Helmet.js con CSP explícito, y validación de env vars al arrancar: todo estaba ya implementado — solo la documentación estaba desactualizada.

### Tab Acceso de trabajador — rediseño ✅
- Eliminado formulario de cambio de contraseña (duplicado de Ajustes, y no funcionaba para ADMIN cambiando la pwd de otro — requería contraseña actual ajena).
- Nuevo contenido: credenciales (usuario, email, estado) + selector de rol con guardado + zona peligrosa (desactivar/reactivar cuenta).
- Tab solo visible para ADMIN (`isAdmin()` en lugar de `canVerTodo() || esPropioUsuario`).
- Ruta `/acceso` protegida con `roleGuard(['ADMIN'])` en `trabajador-ficha.routes.ts`.

### Acceso de terapeutas a su propio perfil ✅
- `trabajadores` (lista): `roleGuard(['ADMIN','RECEP'])` ✅
- `trabajadores/:id` (ficha): sin guard — cualquier usuario autenticado puede ver su propio perfil. El sidebar ya tenía el enlace "Mi perfil" apuntando al propio ID.
- Protección en el componente: si no eres ADMIN/RECEP e intentas acceder al perfil de otro → redirige a tu propio perfil.

### CSS ficha-tabs — hueco vacío con 2 tabs ✅
`.ficha-tabs.ficha-tabs-auto` tenía `repeat(3, 1fr)` hardcodeado. Cambiado a `grid-auto-flow: column; grid-auto-columns: 1fr` — las columnas se crean según los tabs reales (2 para terapeutas/RECEP, 3 para ADMIN).

### .env.prod.example creado ✅
Template con todas las variables de producción alineado con `docker-compose.prod.yml`.

### TypeScript strict en rbac.e2e-spec.ts ✅
`mkUser` tipado con interfaz `TestUserOverrides` explícita en lugar de `Record<string, any>`.

---

## Estado de tests (2026-04-13)

| Suite | Tests | Estado |
|---|---|---|
| Backend unit | 220 | ✅ |
| Backend E2E RBAC | 19 | ✅ |
| Frontend Karma | ~60 | ✅ |

**Módulos sin tests unitarios** (funcionales pero sin cobertura formal):
- gas · objetivos-generales · areas-desarrollo · disponibilidad · n8n · roles · informes-pdf
