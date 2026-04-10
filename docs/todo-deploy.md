# TODO — Tareas técnicas pre-deploy

Derivadas del análisis de arquitectura (2026-03-23). Actualizado 2026-04-10.  
Los bloques 1 y 2 (índices y paginación) están **completados**. Pendientes: 3, 4 y 5.

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

## BLOQUE 3 — Dockerfiles y docker-compose.prod.yml ⬜ PENDIENTE

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

### Tarea 3.4 — Crear .env.prod.example

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

## BLOQUE 4 — Seguridad ⬜ PENDIENTE

### Tarea 4.1 — Rate limiting en /auth/login ⬜

Instalar si no está: `npm install @nestjs/throttler`

Configurar en `AppModule`:
```typescript
ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])
```
Aplicar `ThrottlerGuard` específicamente en `AuthController.login()`.

### Tarea 4.2 — CORS bloqueado al dominio de producción ⬜

En `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true,
});
```

### Tarea 4.3 — Helmet.js confirmado activo ⬜

Verificar que `app.use(helmet())` está en `main.ts`. Si no:
```bash
npm install helmet
```

### Tarea 4.4 — Validación de variables de entorno al arrancar ⬜

La app debe fallar rápido si faltan variables críticas:
```typescript
// En main.ts, antes de app.listen()
const required = ['DATABASE_URL', 'SECRET', 'CORS_ORIGIN'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}
```

---

## BLOQUE 5 — Deuda técnica menor ⬜ PENDIENTE (no bloqueante)

### Tarea 5.1 — Corregir navegación legacy en ClientesComponent ⬜

`frontend/src/app/features/clientes/clientes.component.ts`, líneas 131 y 198:  
Cambiar `/cliente` → `/perfil` directamente (funciona via redirect pero está sucio).

### Tarea 5.2 — Corregir error TypeScript en rbac.e2e-spec.ts ⬜

Error de tipo en la propiedad `username`. Tests pasan, runtime correcto, pero rompe `strict: true`.

---

## Estado global

| Bloque | Estado |
|---|---|
| 1 — Índices | ✅ Completo |
| 2 — Paginación | ✅ Completo |
| 3 — Dockerfiles | ⬜ Pendiente |
| 4 — Seguridad | ⬜ Pendiente |
| 5 — Deuda técnica | ⬜ Pendiente |
