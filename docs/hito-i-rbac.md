# Hito I — Multi-usuario RBAC + Data Scoping ✅

Completado: 2026-03-13

---

## Resultado final

**Backend:**
- `ROLES_CLINICOS = ['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA']`
- `ROLES_GESTION = ['ADMIN', 'RECEP']`
- `RolesGuard` activo en: informes, dashboard, gas, fichaje, clientes (endpoints clínicos)
- Data scoping en servicios: clientes (asignados vs todos), informes (FINALIZADO para RECEP, propios para terapeuta), dashboard (global vs propio)
- `Bono.tipoSesion` requerido — un bono por tipo de terapia

**Frontend:**
- `roleGuard(['ADMIN','PEDAGOGO','NEURO','LOGOPEDA'])` en ruta `progreso`
- `roleGuard(['ADMIN','RECEP'])` en ruta `trabajadores`
- Sidebar: Equipo visible para ADMIN + RECEP
- `auth.isAdmin()` y `auth.isRecep()` como computed signals en `AuthService`

**Tests:** 19 tests E2E en `test/rbac.e2e-spec.ts` verificando 403/200/401 por rol.

---

## Tabla de permisos implementada

| Endpoint / Recurso | ADMIN | RECEP | Terapeuta |
|---|---|---|---|
| GET /clientes | ✅ todos | ✅ todos (básico) | ✅ solo asignados |
| POST/PATCH /clientes | ✅ | ✅ | ✅ |
| PATCH /clientes/:id/sanitario | ✅ | ❌ 403 | ✅ |
| GET /sesiones | ✅ todos | ✅ solo lectura | ✅ solo suyas |
| POST /sesiones | ✅ | ❌ 403 | ✅ |
| GET /bonos | ✅ | ✅ | ✅ solo tipo suyo |
| GET /informes/cliente/:id | ✅ todos | ✅ solo FINALIZADO | ✅ solo suyos |
| POST/PATCH/DELETE /informes | ✅ | ❌ 403 | ✅ |
| GET /fichaje/* | ✅ | ❌ 403 | ✅ |
| GET /dashboard/estadisticas-avanzadas | ✅ global | ✅ global | ✅ solo suyas |
| GET/POST/PATCH/DELETE /trabajadores | ✅ | ✅ | ❌ solo GET |

---

## Patrón de implementación

### Backend — guards

```typescript
// Siempre los dos juntos:
@UseGuards(JwtAuthGuard, RolesGuard)
export class XController {
  @Roles(...ROLES_CLINICOS)
  @Post()
  create(@Req() req: any) { ... }
}
```

### Backend — data scoping en servicios

```typescript
async findAll(user?: { userId: string; rol: string }) {
  if (!user || user.rol === 'ADMIN' || user.rol === 'RECEP') {
    return this.prisma.cliente.findMany();
  }
  return this.prisma.cliente.findMany({
    where: { trabajadores: { some: { trabajadorId: user.userId, activo: true } } }
  });
}
```

### Frontend — role guards en rutas

```typescript
{ path: 'progreso', canActivate: [roleGuard(['ADMIN', 'PEDAGOGO', 'NEURO', 'LOGOPEDA'])] }
{ path: 'trabajadores', canActivate: [roleGuard(['ADMIN', 'RECEP'])] }
```

### JWT payload shape

```typescript
{ sub: string, userId: string, rol: string, nombre: string }
```

---

## Tests añadidos

- `informes.service.spec.ts` — 7 tests scoping findByCliente por ADMIN/RECEP/terapeuta/sin-user
- `dashboard.controller.spec.ts` — 3 tests getResumenCompleto (PEDAGOGO/ADMIN/RECEP scope)
- `rbac.e2e-spec.ts` — 19 tests E2E
- Fix `notificaciones.controller.spec.ts` — faltaba mock de `NotificacionesSseService`

---

## Nota sobre test TypeScript

`rbac.e2e-spec.ts` tiene un error de tipo menor en la propiedad `username` — runtime correcto, tests pasan. Pendiente de resolver (Tarea 5.2 en [todo-deploy.md](todo-deploy.md)).
