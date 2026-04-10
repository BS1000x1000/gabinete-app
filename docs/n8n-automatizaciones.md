# n8n — Automatizaciones implementadas (Hito N) ✅

Completado: 2026-03-19

---

## Arquitectura

n8n corre en Docker. Para alcanzar NestJS desde dentro del contenedor:
```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```
Variable de entorno n8n: `GABINETE_API_URL=http://host.docker.internal:3000`

## Variables .env backend

```
N8N_WEBHOOK_SECRET=...
N8N_INFORME_WEBHOOK_URL=http://localhost:5678/webhook/informe-familia
```

---

## Automatización 1 — Alerta bono agotado

**Flujo:** n8n cron diario → `GET /api/n8n/bonos-alertas` → email por cada alerta

**Backend:**
- Endpoint: `GET /api/n8n/bonos-alertas` protegido por `N8nApiKeyGuard` (header `x-n8n-key`)
- Retorna `BonoAlertaItem[]` con bonos ACTIVO con ≤1 sesión restante
- Solo bonos cuyo cliente tiene familiar con `esResponsablePago: true` y email

**Workflow n8n:**
1. Schedule Trigger — cada mañana (8:00)
2. HTTP Request — GET `http://host.docker.internal:3000/api/n8n/bonos-alertas`
3. IF — `{{ $json.length > 0 }}`
4. Split In Batches — iterar cada alerta
5. Send Email (Resend) — email a `emailResponsable`

---

## Automatización 2 — Informe de sesiones para familia

**Flujo:** terapeuta genera borrador → revisa/edita → "Enviar a familia" → n8n (GPT-4o-mini + PDF) → Resend

**Backend:**
- `POST /api/n8n/generar-borrador/:clienteId?desde=&hasta=`
  - JWT + ROLES_CLINICOS
  - Crea `Informe` tipo=REGISTROS, estado=BORRADOR
  - Contenido: registros con `compartirConFamilia: true` del período
- `POST /api/n8n/enviar-informe/:informeId`
  - JWT + ROLES_CLINICOS
  - Llama webhook n8n con datos del cliente + contenido
  - Marca informe ENVIADO + setea `enviadoFamiliaAt`
- `POST /api/n8n/pdf-informe` — protegido por `N8nApiKeyGuard`
  - Body: `{ htmlContenido, clienteNombre, clienteApellidos, desde, hasta }`
  - Devuelve PDF binario via `@Res()` (bypasea `ResponseInterceptor`)

**Workflow n8n:**
1. Webhook — POST `/webhook/informe-familia`
2. OpenAI "Message a Model" — gpt-4o-mini, redacta informe en HTML sin tecnicismos
3. HTTP Request "Generar PDF" — POST `/api/n8n/pdf-informe`, respuesta binaria (File)
4. Send New Email (Resend) — adjunta PDF + email al contacto

**Prompt OpenAI:** redacta informe HTML para familia, sin markdown, sin tecnicismos, sin fechas ni nombres de terapeutas.

**Configuración Resend:**
- From: `onboarding@resend.dev` (hasta tener dominio verificado)
- Attachment: Binary Data, property=`data`
- Filename: `informe_{{ nombre }}_{{ apellidos }}_{{ desde.slice(0,7) }}.pdf`

---

## Cambios de schema aplicados

```prisma
// RegistroDiario
compartirConFamilia Boolean @default(true) @map("compartir_con_familia")

// Informe
enviadoFamiliaAt DateTime? @map("enviado_familia_at")

// Enums
enum TipoInforme   { INICIAL SEGUIMIENTO REGISTROS OBJETIVOS_PROGRESO }
enum EstadoInforme { BORRADOR REVISION FINALIZADO ENVIADO }
```

---

## Archivos clave

| Archivo | Descripción |
|---|---|
| `backend/src/n8n/n8n.module.ts` | Registrado en AppModule, importa PdfModule |
| `backend/src/n8n/n8n.service.ts` | Lógica completa + `generarPdfInforme()` + `getObjetivosProgreso()` |
| `backend/src/n8n/n8n.controller.ts` | 5 endpoints |
| `backend/src/n8n/dto/generar-pdf-informe.dto.ts` | DTO con class-validator |
| `backend/src/n8n/guards/n8n-api-key.guard.ts` | Guard API key |
| `backend/src/n8n/interface/n8n-automatizaciones.interface.ts` | BonoAlertaItem, NotaObjetivoItem, etc. |

---

## Endpoint objetivos-progreso (para informe semestral futuro)

```
GET /n8n/objetivos-progreso/:clienteId?desde=YYYY-MM-DD&hasta=YYYY-MM-DD
Header: x-api-key: <N8N_API_KEY>
```

Devuelve por objetivo trabajado en el período: título, área, nivel GAS actual, total sesiones, y array de notas con fecha y terapeuta.
