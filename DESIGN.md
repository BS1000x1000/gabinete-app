---
name: Gabinete Pedagógico
description: Herramienta de gestión clínica para gabinetes de terapia pediátrica
colors:
  primary: "#7c6fd6"
  primary-dark: "#5a4fa8"
  primary-light: "#e8e4f8"
  primary-ultra-light: "#f5f3fc"
  secondary: "#5a9de8"
  secondary-dark: "#3d7bc4"
  secondary-light: "#d9ebfc"
  secondary-ultra-light: "#f0f7fe"
  accent: "#f9d84a"
  accent-dark: "#d4b63e"
  success: "#10b981"
  success-light: "#d1fae5"
  warning: "#f59e0b"
  warning-light: "#fef3c7"
  danger: "#ef4444"
  danger-light: "#fee2e2"
  info: "#3b82f6"
  neutral-bg: "#f9fafb"
  neutral-surface: "#ffffff"
  neutral-border: "#e5e7eb"
  neutral-border-subtle: "#f3f4f6"
  neutral-text-primary: "#111827"
  neutral-text-body: "#374151"
  neutral-text-secondary: "#6b7280"
  neutral-text-muted: "#9ca3af"
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

La paleta pivota sobre el lila (#7c6fd6) como color de confianza, no como decoración. Aparece en acciones, estados activos y elementos que requieren atención; el fondo permanece neutro y respirado. El blanco (#ffffff) y el gris casi-blanco (#f9fafb) componen el 80% de cualquier pantalla. El lila hace el 15%. El azul, el amarillo y los colores semánticos cubren el 5% restante — un acento raro vale más que un acento constante.

Este sistema rechaza explícitamente: el azul frío del software hospitalario institucional; los gradientes lila-sobre-lila del SaaS genérico 2024; los radios hiperbólicos y las glass cards; la densidad burocrática de los ERP; y cualquier energía festiva que recuerde una app infantil. Los usuarios son adultos trabajando con concentración: la interfaz se debe a ellos, no al diseñador.

**Key Characteristics:**
- Luz casi constante: superficies blancas y gris-50 predominan
- Lila funcional: marca acciones, no fondos
- Plus Jakarta Sans en un solo peso variable — jerarquía por peso y tamaño, no por familias
- Elevación ambiental suave con tinte lila, no sombras neutras genéricas
- Radios moderados: 8px estándar, 12px en cards, never más de 16px en contenedores

## 2. Colors

Un neutro luminoso como base, un lila de confianza como voz de acción, y colores semánticos estrictos para estado.

### Primary
- **Lila de Confianza** (#7c6fd6): El color de acción del sistema. Botones primarios, estados activos en navegación, foco en inputs, indicadores de progreso. Nunca como fondo de superficie principal.
- **Lila Profundo** (#5a4fa8): Estado hover y pressed de acciones primarias. También texto de énfasis sobre fondos lila claro.
- **Lila Suave** (#e8e4f8): Fondo de estados seleccionados (nav items, chips activos, filas de tabla seleccionadas). Suficientemente sutil para no competir con el contenido.
- **Lila Ultra Suave** (#f5f3fc): Fondo del sidebar. Distingue la navegación del contenido principal sin drama.

### Secondary
- **Azul de Apoyo** (#5a9de8): Acciones secundarias, badges informativos, enlaces en contextos donde el lila colisionaría visualmente. No intercambiable con el primario; el azul es apoyo, el lila es voz.
- **Azul Oscuro** (#3d7bc4): Hover de acciones secundarias.
- **Azul Claro** (#d9ebfc): Fondos de alertas informativas, highlighted data en estadísticas.

### Tertiary
- **Amarillo de Atención** (#f9d84a): Highlights puntuales, badges de advertencia blanda, marcadores temporales. Usar con extrema parsimonia; su poder está en la rareza.

### Neutral
- **Fondo de App** (#f9fafb): El cuerpo de la aplicación. Gris muy suave que diferencia el contenedor del card sin contraste agresivo.
- **Superficie Blanca** (#ffffff): Cards, modales, drawers, inputs, sidebar. La superficie de trabajo.
- **Borde Sutil** (#f3f4f6): Separadores internos dentro de un card, divisores de sección.
- **Borde Estándar** (#e5e7eb): Bordes de card, inputs en reposo, separadores entre secciones.
- **Texto Principal** (#111827): Títulos, datos de alta relevancia clínica, encabezados de sección.
- **Texto de Cuerpo** (#374151): Texto narrativo, valores de formulario, contenido principal.
- **Texto Secundario** (#6b7280): Labels, metadatos, descripciones de apoyo.
- **Texto Muted** (#9ca3af): Placeholders, texto deshabilitado, información accesoria.

### Named Rules

**La Regla del Lila Funcional.** El lila (#7c6fd6) no es un color de fondo ni de decoración. Sólo aparece donde hay intención: botón primario, estado activo, foco, badge de acción. Si un elemento lila no corresponde a ninguna de estas categorías, se elimina.

**La Regla del 80-15-5.** En cualquier pantalla: 80% neutros (blanco + gris-50), 15% lila (acciones + estados), 5% resto (azul, amarillo, semánticos). Una pantalla con más del 25% de superficie lila está rota.

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
- **Card en reposo** (`0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,111,214,0.05)`): Todos los cards y contenedores principales. La doble sombra (drop shadow + ring 1px lila semitransparente) es la firma visual del sistema.
- **Card en hover** (`0 4px 12px rgba(124,111,214,0.15)`): Elevación de cards interactivos al pasar el cursor.
- **Dropdown / Popover** (`0 10px 15px -3px rgba(124,111,214,0.1), 0 4px 6px -4px rgba(124,111,214,0.1)`): Capas flotantes sobre el contenido.
- **Modal / Drawer** (`0 20px 25px -5px rgba(124,111,214,0.1), 0 10px 10px -5px rgba(124,111,214,0.1)`): La capa más alta del stack.
- **Sidebar** (`2px 0 12px rgba(124,111,214,0.06)`): Separación lateral suave entre navegación y contenido.

### Named Rules

**La Regla del Tinte Lila.** Las sombras de este sistema nunca son grises neutras puras. Todas llevan una traza de `rgba(124, 111, 214, ...)` para que la profundidad permanezca dentro del universo cromático de la marca. Una sombra `rgba(0,0,0,0.15)` sin tinte en este sistema es un error.

## 5. Components

### Buttons

Tacto directo y sin ambigüedad. Radios moderados (8px), no píldoras ni bordes rectos. El primario es la única acción enfatizada en cualquier vista.

- **Shape:** gently curved (8px radius)
- **Primary:** fondo lila (#7c6fd6), texto blanco, padding 10px 16px. Hover: lila profundo (#5a4fa8), `transform: translateY(-1px)`. Focus: `box-shadow: 0 0 0 3px rgba(124,111,214,0.3)`.
- **Outline / Secondary:** borde 1.5px lila, fondo transparente, texto lila. Hover: fondo lila-ultra-light (#f5f3fc).
- **Ghost:** sin borde, sin fondo en reposo, texto gris-700. Hover: fondo gris-100. Para acciones terciarias y destructivas secundarias.
- **Danger:** fondo #ef4444, texto blanco. Solo para acciones destructivas confirmadas (no para warnings).
- **Transición:** `all 0.15s ease` en todos los estados.

### Chips / Filtros

Componente de filtrado de alta frecuencia (selector de terapeuta en agenda, filtros de estado en listas).

- **Reposo:** fondo blanco, borde 1.5px gris-200, texto gris-600, radio full (9999px), padding 5px 12px.
- **Activo:** fondo lila-suave (#e8e4f8), borde lila, texto lila. Sin shadow.
- **Avatar inline:** 18px, fondo lila-light, texto lila, radio 50%.

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
- **Focus:** borde lila (#7c6fd6), `box-shadow: 0 0 0 3px rgba(124,111,214,0.2)`. El focus ring es el único momento donde el color lila aparece en un input.
- **Error:** borde rojo (#ef4444), `box-shadow: 0 0 0 3px rgba(239,68,68,0.15)`.
- **Disabled:** fondo gris-100, texto gris-400, borde gris-200. Opacidad 0.5 en el label.
- **Placeholder:** gris-400 (#9ca3af). Contraste mínimo 4.5:1 sobre fondo blanco verificado.

### Navigation (Sidebar)

Navegación principal izquierda, 250px de ancho, fondo lila-ultra-light (#f5f3fc) con borde derecho sutil.

- **Item en reposo:** texto gris-600, icono 1.1rem, padding 10px 8px, radio 8px. Sin background.
- **Item activo:** fondo lila-suave (#e8e4f8), texto lila (#7c6fd6), icono lila. Dot indicator 6px lila al extremo derecho.
- **Item hover (no activo):** fondo gris-100, texto gris-800. Transición 0.15s.
- **Brand mark:** icono en gradient-primary (lila a lila-dark), texto gris-800 600 weight.
- **Avatar / Usuario:** al fondo del sidebar, dropdown con "Mi perfil / Mi cuenta / Cerrar sesión".

### Tabs (Ficha de Cliente)

Navegación secundaria entre secciones de una ficha. Underline style, no pills.

- **Tab activo:** texto lila, font-weight 600, underline lila 2px.
- **Tab inactivo:** texto gris-500, font-weight 500. Hover: texto gris-800.
- **Transición:** color 0.15s ease.

### Drawer (Registro Diario)

Panel deslizante desde el lateral derecho. Overlay semitransparente en body.

- **Fondo:** blanco, shadow modal (ver Elevation).
- **Overlay:** `rgba(0,0,0,0.3)` semitransparente sobre el contenido.
- **Ancho:** 480px en desktop, 100% en móvil.
- **Animación:** `transform: translateX(100%)` → `translateX(0)`, 0.25s ease-out.

## 6. Do's and Don'ts

### Do:
- **Do** usar el lila (#7c6fd6) exclusivamente para acciones, estados activos, y foco. Si un elemento lila no cae en ninguna de estas categorías, elimínalo.
- **Do** verificar contraste 4.5:1 en todo texto de cuerpo, incluyendo placeholders (#9ca3af sobre #ffffff = 2.85:1 — usar #6b7280 o más oscuro para texto real).
- **Do** aplicar `prefers-reduced-motion: reduce` en todas las transiciones. El crossfade (opacity) es el fallback seguro.
- **Do** usar `0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(124,111,214,0.05)` como shadow de card estándar — la sombra tintada es la firma del sistema.
- **Do** limitar el ancho de texto narrativo a 70ch máximo. En layouts de una columna amplios, el cuerpo de texto no debe tocar los bordes del contenedor.
- **Do** usar `text-wrap: balance` en h1–h3 para líneas equilibradas.
- **Do** etiquetar acciones con verbo + objeto: "Guardar cambios", "Eliminar contrato", no "OK" ni "Sí".

### Don't:
- **Don't** usar el azul hospitalario (#2563eb o similar) como color primario — pertenece al software médico institucional que este sistema rechaza. El azul (#5a9de8) es solo de apoyo secundario.
- **Don't** añadir gradientes lila-sobre-lila, glass cards con backdrop-filter, o eyebrows en mayúsculas sobre cada sección — son las marcas del SaaS genérico de 2024 que el sistema rechaza explícitamente.
- **Don't** superar `border-radius: 16px` en cards o contenedores. Los radios de 24–40px en cards son el defecto visual más frecuente del código generado; aquí el techo es 12px para cards y 16px para modales.
- **Don't** combinar `border: 1px solid` y `box-shadow` con blur mayor de 8px en el mismo elemento — el "ghost card" (borde + sombra blanda) es un pattern decorativo sin función.
- **Don't** usar paletas festivas o iconografía infantil aunque los pacientes sean niños. Los usuarios de esta herramienta son adultos profesionales trabajando con concentración.
- **Don't** crear tablas o listas con densidad de ERP: sin padding interno, sin separación entre filas, sin respiro. Cada fila necesita al menos 12px de padding vertical.
- **Don't** animar propiedades de layout (width, height, margin, padding). Animar solo transform y opacity.
- **Don't** usar `z-index` con valores arbitrarios (999, 9999). La escala semántica del sistema: dropdown 1000, sticky 1020, fixed 1030, modal-backdrop 1040, modal 1050, tooltip 1070, notification 1080.
