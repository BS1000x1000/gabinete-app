# Hitos de Seguridad — Gabinete App

Auditoría realizada: 2026-04-07
Estado: Todos los hitos completados ✅

---

## Fase 1 — Pre-producción obligatoria

### [x] S-01: Trust proxy — Rate limiting real en producción ✅
- **Archivo:** `backend/src/main.ts`
- **Fix aplicado:** `app.getHttpAdapter().getInstance().set('trust proxy', 1);` tras `NestFactory.create()`

### [x] S-02: Validación de variables de entorno al arrancar ✅
- **Archivo:** `backend/src/main.ts`
- **Fix aplicado:** Valida `DATABASE_URL`, `SECRET`, `FRONTEND_URL` al inicio de `bootstrap()` y lanza Error si alguna falta.

### [x] S-03: Crear `backend/.env.example` ✅
- **Archivo creado:** `backend/.env.example`
- **Variables documentadas:** `DATABASE_URL`, `SECRET`, `FRONTEND_URL`, `N8N_WEBHOOK_SECRET`, `PORT`, `NODE_ENV`

### [x] S-04: Reducir expiración JWT de 8h a 2h ✅
- **Archivo:** `backend/src/auth/auth.module.ts`
- **Fix aplicado:** `signOptions: { expiresIn: '2h' }`

### [x] S-05: Verificar usuario activo en JwtStrategy ✅
- **Archivo:** `backend/src/auth/strategies/jwt.strategy.ts`
- **Fix aplicado:** Query Prisma en `validate()` — si `!user || !user.activo` → throw UnauthorizedException.

### [x] S-06: Fix IDOR en findOne() — clientes, informes, sesiones ✅
- **Archivos:** `clientes.service.ts`, `informes.service.ts`, `sesiones.service.ts` + sus controllers
- **Fix aplicado:** `findOne(id, user)` con scoping por rol. Clínicos solo acceden a recursos propios. Tests actualizados.

### [x] S-07: Migrar JWT de localStorage a cookie HttpOnly ✅
- **Archivos modificados:**
  - `backend/src/main.ts` (cookie-parser)
  - `backend/src/auth/auth.controller.ts` (Set-Cookie en login/refresh, clearCookie en logout)
  - `backend/src/auth/strategies/jwt.strategy.ts` (extractor: cookie → Bearer)
  - `backend/src/auth/guards/jwt-flex.guard.ts` (lee cookie para SSE → ya no necesita `?token=`)
  - `frontend/src/app/services/auth.service.ts` (sin localStorage para token, logout llama al backend)
  - `frontend/src/app/services/notificaciones.service.ts` (SSE sin token, withCredentials: true)
  - `frontend/src/app/shared/utils/auth-interceptor.ts` (withCredentials: true, sin Bearer)

---

## Fase 2 — Recomendable

### [x] S-08: Hash tokens de reset de contraseña ✅
- **Archivo:** `backend/src/auth/auth.service.ts`
- **Fix aplicado:** HMAC-SHA256 con `process.env.SECRET`. Se guarda el hash en BD, nunca el token en texto plano. `resetPassword` recomputa el hash antes de buscar en BD.

### [x] S-09: DomSanitizer explícito en registro-tab ✅
- **Archivos:** `registro-tab.component.ts` + `.html` línea 182
- **Fix aplicado:** `DomSanitizer.sanitize(SecurityContext.HTML, html)` en método `sanitizeHtml()`. Template usa `[innerHTML]="sanitizeHtml(reg.contenido)"`.

---

## Fase 3 — Post-producción

### [x] S-10: Revocación de tokens al hacer logout ✅
- **Modelo:** `TokenRevocado` en BD con `jti` + `expiresAt`. Migración aplicada.
- **Fix aplicado:** JWT incluye `jti: randomUUID()`. `JwtStrategy.validate()` y `JwtFlexGuard` verifican contra la tabla. Logout extrae `jti` de la cookie y lo inserta en `TokenRevocado`.

### [x] S-11: Audit log de eventos de autenticación (RGPD) ✅
- **Modelo:** `AuditLog` en BD con `evento`, `userId`, `username`, `ip`, `recurso`, `metadata`. Migración aplicada.
- **Servicio:** `AuditService` — nunca bloquea la operación principal (catch interno).
- **Eventos registrados:** `LOGIN_OK`, `LOGOUT`, `PASSWORD_CHANGE` en `AuthController`.

### [x] S-12: CSP headers más estrictos en Helmet ✅
- **Archivo:** `backend/src/main.ts`
- **Fix aplicado:** `helmet({ contentSecurityPolicy: { directives: { defaultSrc, scriptSrc, styleSrc, imgSrc, connectSrc, frameSrc: none, objectSrc: none } } })`. `upgradeInsecureRequests` solo en producción. `crossOriginEmbedderPolicy: false` para Puppeteer.

---

## Lo que ya está bien — No tocar

| Área | Estado |
|---|---|
| SQL injection | ✅ Prisma ORM puro, cero raw queries |
| Validación de entrada | ✅ ValidationPipe + 38 DTOs completos con class-validator |
| XSS en PDF/HTML (Puppeteer) | ✅ escapeHtml() en todos los templates |
| Passwords | ✅ bcrypt 10 rounds |
| Rate limiting en auth | ✅ 5/min login (efectivo tras S-01) |
| HTTP headers | ✅ Helmet activo |
| Secrets | ✅ Todos en .env, ninguno hardcodeado |
| Angular XSS | ✅ Cero bypassSecurityTrust* |
| N8N webhook auth | ✅ API key en env var |
| JWT expiry | ✅ 2h (S-04) |
| Usuario activo en JWT | ✅ Verificado en cada request (S-05) |
| IDOR en findOne | ✅ Scoping por rol en clientes/informes/sesiones (S-06) |
| JWT storage | ✅ Cookie HttpOnly, nunca expuesto a JS (S-07) |
| Reset token storage | ✅ HMAC-SHA256 en BD, nunca en texto plano (S-08) |
| Token revocación | ✅ Tabla TokenRevocado con jti (S-10) |
| Audit log | ✅ LOGIN_OK/LOGOUT/PASSWORD_CHANGE con IP+timestamp (S-11) |
| CSP headers | ✅ Helmet con directivas explícitas (S-12) |
