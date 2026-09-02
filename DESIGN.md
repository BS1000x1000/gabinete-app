---
name: Gabinete Pedagógico
description: Herramienta de gestión clínica para gabinetes de terapia pediátrica
# FUENTE DE VERDAD: frontend/src/sass/abstracts/_variables.scss. Si los dos
# discrepan, manda el SCSS y hay que corregir esto.
#
# La paleta es CREMA Y VERDE BOSQUE, no gris azulado. Los "neutrales" son
# cálidos a propósito: el fondo de la app es papel (#f0ead8) y los grises
# oscuros son el propio verde de marca. Un slate de Tailwind (#f8fafc,
# #94a3b8, #1e293b) sobre este papel no se lee como un matiz, se lee como una
# isla ajena — es el error que ya se coló una vez.
#
# Los comentarios son ratios de contraste sobre papel, medidos. Respétalos.
colors:
  primary: "#2d4a3e"                 # 8.08  verde bosque — SEÑALA, no rellena
  primary-dark: "#1f2a24"            # 12.34 hover y texto sobre claro
  primary-light: "#d9e8da"           #       fondos de selección
  primary-ultra-light: "#eef4ec"     #       superficies de hover
  secondary: "#3a5c74"               # 5.89  azul pizarra, nunca compite
  secondary-dark: "#2b4557"
  secondary-light: "#dde6ec"
  secondary-ultra-light: "#eef3f6"
  malva: "#6b5a8a"                   # 5.06  quinto color categórico
  malva-dark: "#443859"
  malva-light: "#e8e3ef"
  accent: "#8a6018"                  # 4.64  ocre
  accent-dark: "#6b4a12"
  accent-light: "#f5ecd8"
  success: "#2f6b43"                 # 5.28  más vivo que la marca, para no confundirse
  success-light: "#e4eee2"
  success-dark: "#245536"
  warning: "#8a6018"                 # 4.64
  warning-light: "#f5ecd8"
  warning-dark: "#6b4a12"
  danger: "#96382e"                  # 6.02  arcilla. NUNCA verde: en marca verde
  danger-light: "#f4e3dc"            #       el peligro se confundiría con "todo bien"
  danger-dark: "#7a2c24"
  info: "#345c6b"                    # 6.05
  info-light: "#e2ecef"
  info-dark: "#274854"
  # Grises cálidos. gray-400 es el gris de DESHABILITADO (2.94): no vale para
  # texto. El secundario de texto es gray-500.
  neutral-bg: "#f0ead8"              #       papel — fondo de la app
  neutral-surface: "#ffffff"
  neutral-sunken: "#e5eadf"          #       salvia — filas alternas
  neutral-border: "#c2cdc3"
  neutral-border-strong: "#a5b4a9"
  neutral-text-disabled: "#798d82"   #  2.94 NO usar para texto
  neutral-text-secondary: "#556d62"  #  4.66
  neutral-text-body: "#2d4a3e"       #  8.08
  neutral-text-strong: "#273c32"     #  9.82
  neutral-text-title: "#23322b"      # 11.18
  neutral-text-primary: "#1f2a24"    # 12.34
typography:
  display:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "0"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "40px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.neutral-surface}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text-body}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  chip-default:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text-secondary}"
    rounded: "{rounded.full}"
    padding: "5px 12px"
  chip-active:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "5px 12px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
    padding: "24px"
  input:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text-body}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Gabinete Pedagógico

## 1. Overview

**Creative North Star: "La Consulta Ordenada"**

Gabinete Pedagógico es la herramienta de trabajo de un equipo clínico pediátrico. Su modelo visual toma prestado de la consulta bien organizada: una sala donde todo tiene su lugar, el profesional sabe exactamente dónde mirar, y nada distrae del trabajo con el paciente. No hay ornamento sin función. No hay gesto visual que no reduzca fricción.

La paleta pivota sobre el verde bosque (#2d4a3e) como color de acción, no como decoración. Aparece en acciones, estados activos y elementos que requieren atención; el fondo es **papel**, un crema cálido (#f0ead8), no un gris. Papel y blanco componen el 80% de cualquier pantalla. El verde hace el 15%. El azul pizarra, el ocre y los semánticos cubren el 5% restante — un acento raro vale más que un acento constante.

Este sistema rechaza explícitamente: el azul frío del software hospitalario institucional; los gradientes de SaaS genérico; los radios hiperbólicos y las glass cards; la densidad burocrática de los ERP; y cualquier energía festiva que recuerde una app infantil. Los usuarios son adultos trabajando con concentración: la interfaz se debe a ellos, no al diseñador.

**Key Characteristics:**
- Base cálida: papel (#f0ead8) y blanco predominan. Los neutros **no son grises fríos**
- Verde funcional: señala acciones, no rellena fondos
- Plus Jakarta Sans en un solo peso variable — jerarquía por peso y tamaño, no por familias
- Elevación ambiental suave con tinte verde, no sombras neutras genéricas
- Radios moderados: 8px estándar, 12px en cards, nunca más de 16px en contenedores

## 2. Colors

Papel cálido como base, verde bosque como voz de acción, y colores semánticos estrictos para estado.

> **Los neutros de este sistema son cálidos.** No son la escala slate de Tailwind ni ningún gris azulado. Un #f8fafc o un #94a3b8 sobre papel #f0ead8 no se lee como un matiz: se lee como una isla de otra aplicación. Ya ocurrió una vez, en la pestaña "Mi semana", y hubo que rehacerla.

### Primary
- **Verde Bosque** (#2d4a3e, 8.08): El color de acción del sistema. Botones primarios, estados activos en navegación, foco en inputs, indicadores de progreso. Nunca como fondo de superficie principal.
- **Verde Profundo** (#1f2a24, 12.34): Hover y pressed de acciones primarias. También texto de énfasis sobre fondos verde claro, y la tinta del texto principal.
- **Verde Suave** (#d9e8da): Fondo de estados seleccionados (nav items, chips activos, filas seleccionadas).
- **Verde Ultra Suave** (#eef4ec): Superficies de hover y bloques de contexto.

### Secondary
- **Azul Pizarra** (#3a5c74, 5.89): Acciones secundarias, badges informativos, modalidad online. No intercambiable con el primario; el azul es apoyo, el verde es voz.
- **Azul Oscuro** (#2b4557): Hover de acciones secundarias.
- **Azul Claro** (#dde6ec): Fondos de alertas informativas.

### Tertiary
- **Malva** (#6b5a8a, 5.06): Quinto color categórico. Distingue logopedia y coordinación de equipo. Vive en `TIPO_COLOR`.
- **Ocre** (#8a6018, 4.64): Highlights puntuales y avisos blandos. Usar con parsimonia; su poder está en la rareza.

### Neutral — cálidos, no grises
- **Papel** (#f0ead8): El cuerpo de la aplicación. Crema de marca, no un gris.
- **Superficie Blanca** (#ffffff): Cards, modales, drawers, inputs. La superficie de trabajo.
- **Salvia** (#e5eadf): Superficies hundidas, filas alternas.
- **Borde Estándar** (#c2cdc3) y **Borde Activo** (#a5b4a9).
- **Texto Deshabilitado** (#798d82, 2.94): **Solo deshabilitado. No vale para texto legible.**
- **Texto Secundario** (#556d62, 4.66): Labels, metadatos, descripciones. El más claro admisible para texto.
- **Texto de Cuerpo** (#2d4a3e, 8.08): Contenido principal y valores de formulario.
- **Texto Importante** (#273c32) · **Títulos** (#23322b) · **Texto Principal** (#1f2a24).

### Named Rules

**La Regla del Verde Funcional.** El verde (#2d4a3e) señala, no rellena. Sólo aparece donde hay intención: botón primario, estado activo, foco, badge de acción. Si un elemento verde no corresponde a ninguna de estas categorías, se elimina.

**La Regla del 80-15-5.** En cualquier pantalla: 80% neutros (papel + blanco), 15% verde (acciones + estados), 5% resto (azul, ocre, semánticos). Una pantalla con más del 25% de superficie verde está rota.

**La Regla del Cero Hex.** Todo color sale de un token de `_variables.scss`. Un hex nuevo escrito a mano en un `.scss` de componente es un error, no una excepción: los ratios de contraste están medidos y anotados en las variables, y un literal se salta esa auditoría. Antes de inventar un color, comprueba que no está ya.

**El peligro nunca es verde.** En una marca verde, un "peligro" verde se confundiría con "todo bien". El destructivo es arcilla (#96382e).

## 3. Typography

**Display / Body / Label Font:** Plus Jakarta Sans (con fallback system-ui)

**Character:** Una sola familia humanista que construye jerarquía mediante el contraste de peso (400 → 700), no mediante familias distintas. Voz moderna y legible; ni técnica ni decorativa. La escala es ajustada, no expansiva: los títulos no gritan, los cuerpos no susurran.

### Hierarchy
- **Display** (700, 1.875rem / 30px, 1.25 lh, -0.02em): Encabezados de sección principal. Aparece una vez por vista, máximo dos.
- **Headline** (600, 1.25rem / 20px, 1.35 lh, -0.01em): Títulos de cards, nombres de clientes en ficha, encabezados de panel.
- **Title** (600, 1rem / 16px, 1.4 lh): Subsecciones dentro de un card, labels de grupo en formularios, tabs activos.
- **Body** (400, 0.9375rem / 15px, 1.5 lh): Todo el contenido narrativo y los valores de datos. Máximo 70ch de ancho en bloques de texto.
- **Label** (500, 0.75rem / 12px, 1.33 lh): Metadatos, timestamps, badges de estado, etiquetas de campo en formularios. Sin letter-spacing adicional — el spacing en labels pequeñas apaga la voz.

### Named Rules

**La Regla de la Familia Única.** Una sola familia tipográfica en toda la app. La jerarquía se construye con peso (400/500/600/700) y tamaño. Introducir una segunda familia — aunque sea "para los títulos" — rompe la austeridad que hace que este sistema funcione.

**La Regla del Peso Visible.** La diferencia entre body (400) y headline (600) debe ser perceptible a golpe de vista. Si dos niveles de jerarquía tienen pesos iguales o adyacentes (ej. 400 vs 450), se elige el de mayor contraste (400 vs 600).

## 4. Elevation

Este sistema usa sombra ambiental suave siempre presente, tintada con el color primario, en lugar de sombra neutra genérica. La elevación no aparece ni desaparece en respuesta a hover; es parte de la identidad del card como capa separada del fondo. El hover amplifica la sombra suavemente para confirmar interactividad.

### Shadow Vocabulary

Las sombras se declaran como tokens `$shadow-*` en `_variables.scss` y se tintan con `rgba($primary, …)`. No se escriben a mano.

- **Card en reposo** (`$shadow-card`): Todos los cards y contenedores principales. La doble sombra (drop shadow + ring 1px verde semitransparente) es la firma visual del sistema.
- **Card en hover** (`$shadow-hover`): Elevación de cards interactivos al pasar el cursor.
- **Dropdown / Popover** (`$shadow-lg`): Capas flotantes sobre el contenido.
- **Modal / Drawer** (`$shadow-xl`): La capa más alta del stack.

### Named Rules

**La Regla del Tinte Verde.** Las sombras de este sistema nunca son grises neutras puras. Todas llevan una traza de `rgba($primary, …)` para que la profundidad permanezca dentro del universo cromático de la marca. Una sombra `rgba(0,0,0,0.15)` sin tinte en este sistema es un error.

## 5. Components

### Buttons

Tacto directo y sin ambigüedad. Radios moderados (8px), no píldoras ni bordes rectos. El primario es la única acción enfatizada en cualquier vista.

> **Hay una sola implementación: `.gb-btn` en `abstracts/_componentes.scss`.** Antes había catorce. No escribas un botón nuevo; usa la primitiva y sus modificadores `--primary --ghost --peligro --icon --sm`.

- **Shape:** gently curved (`$border-radius`, 8px), altura 2.15rem (`--sm`: 1.8rem)
- **Base:** fondo blanco, borde `$border-color`, texto `$gray-700`. Hover: fondo `$primary-ultra-light`, borde `$primary-light`, texto `$primary-dark`.
- **Primary** (`--primary`): fondo `$primary`, texto blanco. Hover: `$primary-dark`. **Como mucho uno por vista.**
- **Ghost** (`--ghost`): sin borde ni fondo, texto `$gray-600`. Hover: fondo `$primary-ultra-light`. Para acciones secundarias que no deben competir.
- **Danger** (`--peligro`): en hover pasa a `$danger-light` / `$danger-dark`. Solo para destructivas confirmadas, no para avisos.
- **Icon** (`--icon`): cuadrado. **Exige `aria-label` o `title`.**
- **Focus:** `box-shadow: 0 0 0 3px rgba($primary, 0.25)`. No es opcional: `base/_reset.scss` quita el outline de todo `button` y **no hay `:focus-visible` global** que lo reponga. Un control sin foco declarado es invisible al teclado.

### Chips / Filtros

Componente de filtrado de alta frecuencia (selector de terapeuta en agenda, filtros de estado en listas).

- **Reposo:** fondo blanco, borde 1.5px gris-200, texto gris-600, radio full (9999px), padding 5px 12px.
- **Activo:** fondo `$primary-ultra-light`, borde `$primary`. Sin shadow.
- **Avatar inline:** 18px, fondo `$primary-light`, texto `$primary-dark`, radio 50%.

> Implementación: `.gb-chip` (`_componentes.scss`). Cuando las opciones son muchas o abiertas, se prefiere `.gb-filtro` + `.gb-select`.

### Cards / Contenedores

La unidad visual principal del contenido estructurado.

- **Corner Style:** gently curved (12px radius)
- **Background:** blanco (#ffffff)
- **Shadow Strategy:** sombra ambiental tintada siempre en reposo (ver Elevation). No usar `border: 1px solid` en cards que ya tienen shadow.
- **Border:** solo `0 0 0 1px rgba(124,111,214,0.05)` como parte del shadow compuesto — no `border` independiente.
- **Internal Padding:** 24px estándar, 16px en cards compactos (listas, filas de datos).

### Inputs / Campos de formulario

Estilo de trazo (stroke) con fondo blanco. Sin relleno coloreado.

- **Reposo:** borde 1px gris-200, fondo blanco, radio 8px, padding 8px 12px, texto gris-700.
- **Focus:** borde `$primary`, `box-shadow: 0 0 0 3px rgba($primary, 0.2)`. El focus ring es el único momento donde el verde aparece en un input.
- **Error:** borde `$danger`, `box-shadow: 0 0 0 3px rgba($danger, 0.15)`.
- **Disabled:** fondo gris-100, texto gris-400, borde gris-200. Opacidad 0.5 en el label.
- **Placeholder:** `$gray-500` (#556d62, 4.66). **Nunca `$gray-400`** (#798d82, 2.94): es el gris de deshabilitado y no llega a 4.5:1.

### Navigation (Sidebar)

Navegación principal izquierda, 250px de ancho, sobre **cromo oscuro** (`$bg-sidebar: $gray-900`, #1f2a24). Es la única superficie oscura de la app: separa la navegación del trabajo sin necesitar bordes.

- **Item en reposo:** texto claro sobre el cromo, icono 1.1rem, padding 10px 8px, radio 8px. Sin background.
- **Item activo:** realce con `$verde-realce` (#7fb08a, 5.99 sobre el cromo). Es el único sitio donde se usa ese verde: sobre fondo oscuro el `$primary` no contrasta.
- **Item hover (no activo):** fondo con una traza de blanco. Transición 0.15s.
- **Avatar / Usuario:** al fondo del sidebar, dropdown con "Mi ficha / Cerrar sesión".

### Tabs (Ficha de Cliente)

Navegación secundaria entre secciones de una ficha. Underline style, no pills.

- **Tab activo:** texto `$primary`, font-weight 600, underline `$primary` 2px.
- **Tab inactivo:** texto `$gray-500`, font-weight 500. Hover: texto `$gray-800`.

> Implementación: mixins `subnav-bar` / `subnav-item` (`_mixins.scss:286-342`). Un solo patrón de pestañas para toda la app.
- **Transición:** color 0.15s ease.

### Drawer (Registro Diario)

Panel deslizante desde el lateral derecho. Overlay semitransparente en body.

- **Fondo:** blanco, shadow modal (ver Elevation).
- **Overlay:** `rgba(0,0,0,0.3)` semitransparente sobre el contenido.
- **Ancho:** 480px en desktop, 100% en móvil.
- **Animación:** `transform: translateX(100%)` → `translateX(0)`, 0.25s ease-out.

## 6. Do's and Don'ts

### Do:
- **Do** usar el verde (#2d4a3e) exclusivamente para acciones, estados activos y foco. Si un elemento verde no cae en ninguna de estas categorías, elimínalo.
- **Do** sacar TODO color de un token de `_variables.scss`. Un hex escrito a mano en un componente se salta los ratios de contraste que las variables tienen medidos.
- **Do** verificar contraste 4.5:1 en todo texto de cuerpo, incluidos los placeholders. `$gray-400` (#798d82) da 2.94 y está reservado a deshabilitado; para texto, `$gray-500` (#556d62, 4.66) o más oscuro.
- **Do** aplicar `prefers-reduced-motion: reduce` en todas las transiciones. El crossfade (opacity) es el fallback seguro.
- **Do** usar `0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,111,214,0.05)` como shadow de card estándar — la sombra tintada es la firma del sistema.
- **Do** limitar el ancho de texto narrativo a 70ch máximo. En layouts de una columna amplios, el cuerpo de texto no debe tocar los bordes del contenedor.
- **Do** usar `text-wrap: balance` en h1–h3 para líneas equilibradas.
- **Do** etiquetar acciones con verbo + objeto: "Guardar cambios", "Eliminar contrato", no "OK" ni "Sí".

### Don't:
- **Don't** usar el azul hospitalario (#2563eb o similar) como color primario — pertenece al software médico institucional que este sistema rechaza. El azul pizarra (#3a5c74) es solo de apoyo secundario.
- **Don't** traer la escala slate de Tailwind (#f8fafc, #cbd5e1, #94a3b8, #1e293b). Los neutros aquí son cálidos; un slate sobre papel #f0ead8 se lee como una isla de otra app.
- **Don't** añadir gradientes verde-sobre-verde, glass cards con backdrop-filter, o eyebrows en mayúsculas sobre cada sección — son las marcas del SaaS genérico que el sistema rechaza explícitamente.
- **Don't** superar `border-radius: 16px` en cards o contenedores. Los radios de 24–40px en cards son el defecto visual más frecuente del código generado; aquí el techo es 12px para cards y 16px para modales.
- **Don't** combinar `border: 1px solid` y `box-shadow` con blur mayor de 8px en el mismo elemento — el "ghost card" (borde + sombra blanda) es un pattern decorativo sin función.
- **Don't** usar paletas festivas o iconografía infantil aunque los pacientes sean niños. Los usuarios de esta herramienta son adultos profesionales trabajando con concentración.
- **Don't** crear tablas o listas con densidad de ERP: sin padding interno, sin separación entre filas, sin respiro. Cada fila necesita al menos 12px de padding vertical.
- **Don't** animar propiedades de layout (width, height, margin, padding). Animar solo transform y opacity.
- **Don't** usar `z-index` con valores arbitrarios (999, 9999). La escala semántica del sistema: dropdown 1000, sticky 1020, fixed 1030, modal-backdrop 1040, modal 1050, tooltip 1070, notification 1080.
