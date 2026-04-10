# SSE Notificaciones — Arquitectura (Hito F)

Implementado: 2026-03-10

---

## Tecnología elegida: Server-Sent Events (SSE)

**Por qué:** Unidireccional server→client, nativo en NestJS con `@Sse()`, sin dependencias extras. WebSockets sería overkill para notificaciones push.

---

## Por qué JwtFlexGuard

`EventSource` no permite custom headers — el token JWT no puede ir en `Authorization: Bearer`. La solución es `JwtFlexGuard`, que acepta tanto Bearer header (rutas normales) como query param `?token=xxx` (SSE).

---

## Flujo completo

1. Login → `auth.service` carga notificaciones + `conectarSSE(token)`
2. Recarga → `home.component.ngOnInit()` reconecta via `authSvc.token()` signal
3. Motor de reglas crea notificación → `NotificacionesService.crearSiNoExiste()` emite al SSE stream del trabajador
4. Frontend `EventSource.onmessage` → añade al signal `_notificaciones` (sin duplicados)
5. `onerror`: si `readyState === CLOSED`, nula `_eventSource` para permitir reconexión

---

## Archivos

| Archivo | Descripción |
|---|---|
| `backend/src/notificaciones/notificaciones-sse.service.ts` | `Map<trabajadorId, Subject<MessageEvent>>` |
| `backend/src/auth/guards/jwt-flex.guard.ts` | JWT guard que acepta header O query param |
| `backend/src/notificaciones/notificaciones.controller.ts` | Endpoint `@Sse('stream')` con `JwtFlexGuard` |
| `backend/src/notificaciones/notificaciones.service.ts` | Inyecta SseService, emite en `crearSiNoExiste()` |
| `frontend/src/app/services/notificaciones.service.ts` | Reemplaza polling por `EventSource` |
| `frontend/src/app/services/auth.service.ts` | `conectarSSE()` en login, `desconectarSSE()` en logout |
| `frontend/src/app/features/home/home.component.ts` | Reconecta SSE al recargar |

---

## Endpoint SSE

```
GET /api/notificaciones/stream?token=<JWT>
```

Requiere `JwtFlexGuard`. Devuelve stream `text/event-stream`.
