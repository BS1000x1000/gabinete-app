# TODO: Notas por Objetivo en Registro Diario

## Descripción del cambio
Al marcar un objetivo como trabajado en un registro diario, el terapeuta puede añadir una
nota específica describiendo qué se hizo exactamente con ese objetivo en esa sesión.

Estas notas también alimentarán un endpoint n8n para generar informes semestrales de progreso
por objetivo (análisis IA de la evolución + actualización de niveles GAS).

---

## Tareas

### Fase 1 — Base de datos
- [x] **Tarea 1** — Schema Prisma: añadir `notasRegistro String? @db.Text` a `RegistroDiarioObjetivo` + migración

### Fase 2 — Backend: módulo fichaje
- [x] **Tarea 2** — DTO: crear `ObjetivoTrabajadoDto` + `UpdateRegistroDiarioDto`, cambiar `string[]` → `ObjetivoTrabajadoDto[]`
- [x] **Tarea 3** — Service: actualizar `create()` y `update()` para extraer IDs y pasar `notasRegistro`
- [x] **Tarea 4** — Controller: usar `UpdateRegistroDiarioDto` en el endpoint `PATCH :id`

### Fase 3 — Frontend
- [x] **Tarea 5** — Interface `registro-diario.interface.ts`: añadir `notasRegistro` a `ObjetivoTrabajado`, nueva `ObjetivoTrabajadoInput`, actualizar DTOs
- [x] **Tarea 6** — Component TS `registro-tab`: reemplazar `objetivosSeleccionados: signal<string[]>` con `objetivosNotasMap: signal<Record<string,string>>`
- [x] **Tarea 7** — Template HTML `registro-tab`: textarea opcional por objetivo seleccionado + notas en historial
- [x] **Tarea 8** — SCSS: estilos para `.objetivo-notas-input`, `.objetivo-badge-notas`, `.objetivo-card-wrap`

### Fase 4 — Tests
- [x] **Tarea 9** — Actualizar tests backend (fichaje.service.spec, fichaje.controller.spec) para nuevo formato DTO
- [x] **Tarea 10** — Actualizar tests frontend (registros.service.spec) si usan el DTO antiguo

### Fase 5 — N8n (último)
- [x] **Tarea 11** — Interfaces en `n8n-automatizaciones.interface.ts`: `NotaObjetivoItem`, `ObjetivoProgresoItem`, `ObjetivosProgresoResponse`
- [x] **Tarea 12** — Service n8n: método `getObjetivosProgreso(clienteId, desde, hasta)`
- [x] **Tarea 13** — Controller n8n: ruta `GET /n8n/objetivos-progreso/:clienteId?desde=&hasta=`

---

## Ficheros modificados

| Fichero | Cambio |
|---------|--------|
| `backend/prisma/schema.prisma` | Campo `notasRegistro` en `RegistroDiarioObjetivo` |
| `backend/src/fichaje/dto/create-registro.dto.ts` | Nueva clase `ObjetivoTrabajadoDto` + DTOs actualizados |
| `backend/src/fichaje/fichaje.service.ts` | `create()` y `update()` actualizados |
| `backend/src/fichaje/fichaje.controller.ts` | PATCH usa `UpdateRegistroDiarioDto` |
| `backend/src/n8n/interface/n8n-automatizaciones.interface.ts` | 3 interfaces nuevas |
| `backend/src/n8n/n8n.service.ts` | Método `getObjetivosProgreso` |
| `backend/src/n8n/n8n.controller.ts` | Ruta `GET objetivos-progreso/:clienteId` |
| `frontend/src/app/interface/registro-diario.interface.ts` | `notasRegistro` + `ObjetivoTrabajadoInput` + DTOs |
| `frontend/src/app/features/.../registro-tab/registro-tab.component.ts` | Signal `objetivosNotasMap` + helpers |
| `frontend/src/app/features/.../registro-tab/registro-tab.component.html` | Textarea + notas en historial |
| `frontend/src/sass/components/_registro-tab.scss` | Estilos nuevos |

---

## Endpoint n8n para informe semestral

```
GET /n8n/objetivos-progreso/:clienteId?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
Header: x-api-key: <N8N_API_KEY>
```

Respuesta (por objetivo trabajado en el periodo):
```json
{
  "clienteId": "...",
  "clienteNombre": "María",
  "clienteApellidos": "García López",
  "desde": "2025-09-01",
  "hasta": "2026-03-30",
  "objetivos": [
    {
      "objetivoGeneralId": "...",
      "titulo": "Atención Sostenida",
      "area": "Atención y Concentración",
      "colorArea": "#6c63ff",
      "nivelGASActual": -1,
      "totalSesiones": 14,
      "notas": [
        {
          "fecha": "2025-09-15",
          "notasRegistro": "Hacemos hoja de distractores...",
          "registroId": "...",
          "terapeutaNombre": "Laura Martínez"
        }
      ]
    }
  ]
}
```
