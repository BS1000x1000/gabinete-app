# Notas por objetivo en Registro Diario ✅

Completado: ~2026-03-26

---

## Qué se implementó

Al marcar un objetivo como trabajado en un registro diario, el terapeuta puede añadir una nota específica describiendo qué se hizo con ese objetivo en esa sesión.

Estas notas también alimentan el endpoint n8n para futuros informes semestrales de progreso por objetivo.

---

## Cambios de schema

```prisma
model RegistroDiarioObjetivo {
  // ... campos existentes ...
  notasRegistro String? @db.Text @map("notas_registro")
}
```

---

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/prisma/schema.prisma` | Campo `notasRegistro` en `RegistroDiarioObjetivo` |
| `backend/src/fichaje/dto/create-registro.dto.ts` | Nueva clase `ObjetivoTrabajadoDto` + DTOs actualizados |
| `backend/src/fichaje/fichaje.service.ts` | `create()` y `update()` actualizados |
| `backend/src/fichaje/fichaje.controller.ts` | PATCH usa `UpdateRegistroDiarioDto` |
| `backend/src/n8n/interface/n8n-automatizaciones.interface.ts` | `NotaObjetivoItem`, `ObjetivoProgresoItem`, `ObjetivosProgresoResponse` |
| `backend/src/n8n/n8n.service.ts` | Método `getObjetivosProgreso()` |
| `backend/src/n8n/n8n.controller.ts` | Ruta `GET objetivos-progreso/:clienteId` |
| `frontend/src/app/interface/registro-diario.interface.ts` | `notasRegistro` + `ObjetivoTrabajadoInput` + DTOs |
| `frontend/src/app/features/.../registro-tab/registro-tab.component.ts` | Signal `objetivosNotasMap` + helpers |
| `frontend/src/app/features/.../registro-tab/registro-tab.component.html` | Textarea + notas en historial |
| `frontend/src/sass/components/_registro-tab.scss` | Estilos `.objetivo-notas-input`, `.objetivo-badge-notas`, `.objetivo-card-wrap` |

---

## Endpoint n8n objetivos-progreso

```
GET /n8n/objetivos-progreso/:clienteId?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
Header: x-api-key: <N8N_API_KEY>
```

Devuelve por objetivo trabajado en el período: título, área, nivel GAS actual, total sesiones, y array de notas con fecha y nombre de terapeuta.
