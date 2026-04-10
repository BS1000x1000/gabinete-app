# Rediseño UX — Decisiones y principios

Completado: 2026-03-05 (6 fases)

---

## Principios rectores

- La app tiene DOS PILARES IGUALES: **Agenda** (operativo) y **Clientes** (clínico)
- La sesión es el evento central del día; el registro diario es la acción más frecuente post-sesión
- Sidebar slim siempre visible: 3 ítems nav + 3 acciones rápidas al pie + perfil/logout
- Drawer lateral = patrón para acceso a Registro Diario (desde sesión completada o sidebar)
- **Siempre invocar `/frontend-design` antes de generar código de UI**

---

## Las 6 fases

### Fase 1 — Sidebar y navegación base ✅
Nuevo `SidebarComponent`: 3 ítems principales + acciones rápidas al pie + perfil/logout. Sin submenús ni colapsable. Siempre visible ~220px.

### Fase 2 — Agenda (vista operativa principal) ✅
Eliminar mock-turnos. Dos paneles: lista sesiones del día + calendario semanal angular-calendar. Al completar → abre Drawer Registro.

### Fase 3 — Drawer de Registro Diario ✅
`DrawerRegistroComponent` reutilizable. Se abre desde: sesión completada, sidebar, búsqueda global. Overlay semitransparente. 55% ancho desktop, 90% tablet.

### Fase 4 — Ficha de cliente: de 10 tabs a 5+1 ✅

| Tab nueva | Tabs antiguas absorbidas |
|---|---|
| perfil | cliente · familiar · sanitario · colegio |
| sesiones | sesiones |
| bonos | bonos |
| progreso | registro · objetivos (GAS) |
| informes | informes |
| terapeutas | (nueva — asignación y disponibilidad) |

> Componentes eliminados — NO recrear: `cliente-tab`, `colegio-tab`, `contactos-tab`, `sanitario-tab`, `registro-tab`, `objetivos-tab`

### Fase 5 — Listado de clientes ✅
Modal edición rápida, filtros activos, RGPD badge. Eliminado botón exportar CSV.

### Fase 6 — Polish y coherencia global ✅
Estados vacíos · spinners/skeletons · toasts · confirm modals · responsive tablet · 404.

---

## Decisiones de diseño fijas

| Elemento | Decisión |
|---|---|
| Sidebar | Siempre visible, no colapsable, ~220px |
| Drawer | 55% ancho desktop, 90% tablet, overlay semitransparente |
| Calendar | Vista semanal por defecto, toggle a mensual |
| Color primario | `#7c6fd6` (lila) |
| Color secundario | `#5a9de8` (azul) |
| Iconografía | Bootstrap Icons `bi-*` — no cambiar |
| Estilos | **Nunca en component.scss** — siempre en `frontend/src/sass/` |
| Fuente | Plus Jakarta Sans |

---

## Estructura SASS

```
sass/
├── abstracts/   _variables.scss · _mixins.scss · _functions.scss
├── base/        _root.scss · _reset.scss · _typography.scss · _utilities.scss
├── components/  uno por componente
├── layout/      _sidebar.scss · _header.scss · _tab-contents.scss
└── pages/       _login.scss · _home.scss
```

Variables clave:
```scss
$primary: #7c6fd6;
$secondary: #5a9de8;
$primary-ultra-light: #f5f3fc;
$primary-light: #e8e4f8;
$success: #10b981;
$danger: #ef4444;
$warning: #f59e0b;
$shadow-card: 0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,111,214,0.05);
$border-radius-lg: 0.75rem;
```
