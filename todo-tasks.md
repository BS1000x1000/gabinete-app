# TODO — Tareas pendientes antes del primer deploy

Tareas derivadas del análisis de arquitectura (2026-03-23).
Ejecutar en orden. Cada tarea es independiente salvo que se indique dependencia.

---

## BLOQUE 1 — Performance: Índices en schema.prisma (CRÍTICO)

Sin índices, todas las búsquedas por `clienteId`, `trabajadorId`, `fechaHoraInicio`
hacen full table scan. Con 10.000 sesiones una query de agenda puede tardar segundos.

### Tarea 1.1 — Añadir @@index() en model Sesion

```prisma
model Sesion {
  // ... campos existentes ...

  @@index([clienteId])
  @@index([trabajadorId])
  @@index([fechaHoraInicio])
  @@index([trabajadorId, fechaHoraInicio])  // query más frecuente de agenda
  @@map("sesiones")
}
```

### Tarea 1.2 — Añadir @@index() en model RegistroDiario

```prisma
model RegistroDiario {
  // ... campos existentes ...

  @@index([clienteId])
  @@index([trabajadorId])
  @@index([fechaRegistro])
  @@map("registros_diarios")
}
```

### Tarea 1.3 — Añadir @@index() en model Informe

```prisma
model Informe {
  // ... campos existentes ...

  @@index([clienteId])
  @@index([trabajadorId])
  @@index([createdAt])
  @@map("informes")
}
```

### Tarea 1.4 — Añadir @@index() en model Notificacion

```prisma
model Notificacion {
  // ... campos existentes ...

  @@index([trabajadorId])
  @@index([leida])
  @@map("notificaciones")
}
```

### Tarea 1.5 — Añadir @@index() en model Bono

```prisma
model Bono {
  // ... campos existentes ...

  @@index([clienteId])
  @@index([estado])
  @@map("bonos")
}
```

### Tarea 1.6 — Generar migración

Después de añadir todos los índices:
```bash
cd backend
npx prisma migrate dev --name add_performance_indexes
```

---

## BLOQUE 2 — Performance: Paginación consistente (CRÍTICO)

`findAll()` en clientes, informes, bonos devuelve TODOS los registros sin límite.
Ya existe `PaginationDto` pero solo se usa en un endpoint. Hay que extenderlo al resto.

### Tarea 2.1 — Auditar endpoints sin paginación

Revisar los siguientes servicios y añadir paginación donde falte:
- `backend/src/clientes/clientes.service.ts` → `findAll()`
- `backend/src/informes/informes.service.ts` → `findAll()`
- `backend/src/bonos/bonos.service.ts` → `findAll()`
- `backend/src/sesiones/sesiones.service.ts` → `findAll()`
- `backend/src/notificaciones/notificaciones.service.ts` → `findAll()`

### Tarea 2.2 — Aplicar PaginationDto a clientes

Añadir `?page=&limit=` al endpoint `GET /clientes`.
Devolver `{ data: Cliente[], total: number, page: number, limit: number }`.
Actualizar el frontend para consumir la respuesta paginada.

### Tarea 2.3 — Aplicar paginación a informes

Mismo patrón que 2.2 para `GET /informes`.

### Tarea 2.4 — Aplicar paginación a bonos

Mismo patrón que 2.2 para `GET /bonos`.

### Tarea 2.5 — Aplicar paginación a sesiones (tab sesiones del cliente)

El endpoint de sesiones por cliente ya puede devolver muchas rows con el tiempo.
Añadir paginación o al menos un límite por defecto de 50 con posibilidad de cargar más.

### Tarea 2.6 — Actualizar frontend para paginación

Para cada endpoint que se migre: actualizar el service Angular correspondiente
y el componente que lista los datos (infinite scroll o paginación clásica con botones).

---

## BLOQUE 3 — Infraestructura: docker-compose.prod.yml con n8n + PostgreSQL

### Tarea 3.1 — Crear docker-compose.prod.yml

Crear `/docker-compose.prod.yml` con:
- Backend NestJS (imagen Docker desde Dockerfile.backend)
- Frontend Nginx (imagen Docker desde Dockerfile.frontend)
- n8n configurado con PostgreSQL (NO SQLite)
- Variables de entorno separadas (referencia a `.env.prod`)
- Sin base de datos local — PostgreSQL en Neon (external)

n8n en producción necesita:
```yaml
environment:
  - DB_TYPE=postgresdb
  - DB_POSTGRESDB_HOST=${N8N_DB_HOST}
  - DB_POSTGRESDB_PORT=5432
  - DB_POSTGRESDB_DATABASE=${N8N_DB_NAME}
  - DB_POSTGRESDB_USER=${N8N_DB_USER}
  - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
```

### Tarea 3.2 — Crear Dockerfile.backend

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/main"]
```

Ubicación: `backend/Dockerfile`

### Tarea 3.3 — Crear Dockerfile.frontend

Nginx para servir el build de Angular con `ng build --configuration=production`.
Necesita `nginx.conf` con `try_files $uri /index.html` para routing SPA.

Ubicación: `frontend/Dockerfile`

### Tarea 3.4 — Crear .env.prod.example

Template con todas las variables necesarias en producción:
- `DATABASE_URL` (Neon connection string con pooling)
- `SECRET` (JWT secret, largo y aleatorio)
- `N8N_DB_HOST`, `N8N_DB_NAME`, `N8N_DB_USER`, `N8N_DB_PASSWORD`
- `CORS_ORIGIN` (dominio de producción)
- `RESEND_API_KEY`

---

## BLOQUE 4 — Seguridad: Hardening previo al deploy

### Tarea 4.1 — Rate limiting en /auth/login

Confirmar que `@nestjs/throttler` está activo y configurado correctamente.
Si no: instalar e inyectar en `AuthModule` con límite de 5 req/minuto en el endpoint de login.

### Tarea 4.2 — CORS bloqueado al dominio de producción

En `main.ts`, cambiar `origin: '*'` a `origin: process.env.CORS_ORIGIN`.
Añadir `CORS_ORIGIN` a `.env.prod.example`.

### Tarea 4.3 — Helmet.js confirmado activo

Verificar que `app.use(helmet())` está en `main.ts`.
Si no está: `npm install helmet` y añadirlo.

### Tarea 4.4 — Variables de entorno validadas al arrancar

Añadir validación de variables de entorno obligatorias al arranque de NestJS
usando `@nestjs/config` + `Joi` o validación manual en `main.ts`.
App debe fallar rápido si falta `DATABASE_URL` o `SECRET`.

---

## BLOQUE 5 — Deuda técnica menor (no bloqueante)

### Tarea 5.1 — Corregir navegación legacy en ClientesComponent

En `frontend/src/app/features/clientes/clientes.component.ts`, líneas 131 y 198:
cambiar navegación a `/cliente` (legacy) por `/perfil` directamente.

### Tarea 5.2 — Corregir error TypeScript en rbac.e2e-spec.ts

Error de tipo en la propiedad `username` — tests pasan pero hay que resolverlo
para que el proyecto compile con `strict: true` sin warnings.

---

## Estado

| Tarea | Estado |
|---|---|
| 1.1 Índice Sesion | ✅ Hecho |
| 1.2 Índice RegistroDiario | ✅ Hecho |
| 1.3 Índice Informe | ✅ Hecho |
| 1.4 Índice Notificacion | ✅ Hecho |
| 1.5 Índice Bono | ✅ Hecho |
| 1.6 Migración índices | ✅ Hecho |
| 2.1 Auditar endpoints sin paginación | ✅ Hecho |
| 2.2 Paginación clientes | ✅ Hecho |
| 2.3 Paginación informes | ✅ Hecho |
| 2.4 Paginación bonos | ✅ Hecho |
| 2.5 Paginación sesiones | ✅ Hecho |
| 2.6 Frontend para paginación | ✅ Hecho (2026-03-26: corregido limit en getAll clientes/informes → ?limit=500; sesiones.findByCliente default 100→500) |
| 3.1 docker-compose.prod.yml | ⬜ Pendiente |
| 3.2 Dockerfile backend | ⬜ Pendiente |
| 3.3 Dockerfile frontend | ⬜ Pendiente |
| 3.4 .env.prod.example | ⬜ Pendiente |
| 4.1 Rate limiting login | ⬜ Pendiente |
| 4.2 CORS producción | ⬜ Pendiente |
| 4.3 Helmet confirmado | ⬜ Pendiente |
| 4.4 Validación env vars arranque | ⬜ Pendiente |
| 5.1 Navegación legacy clientes | ⬜ Pendiente |
| 5.2 Error TypeScript rbac spec | ⬜ Pendiente |
