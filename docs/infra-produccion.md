# Infraestructura de producción — Stack confirmado

Confirmado: 2026-03-17

---

## Stack

```
Hetzner CX22 (~€4.51/mes)       → servidor: backend NestJS + frontend Angular (Nginx) + n8n futuro
Coolify (gratis, en el VPS)      → gestión de despliegue: web UI, auto-deploy desde GitHub, SSL automático
Neon (gratis · Frankfurt · EU)   → PostgreSQL gestionado: cifrado en reposo, backups automáticos, sin pausa
Cloudflare R2 (gratis ≤10GB)     → archivos: informes PDF, imágenes registros, facturas futuras (signed URLs)
Cloudflare DNS (gratis)          → dominio + SSL
Resend (gratis ≤100 emails/día)  → SMTP para reset de contraseña + notificaciones automatizadas a familias
Dominio .es (~€1.20/mes)         → pendiente de comprar
```

**Coste total estimado: ~€6/mes**

---

## Por qué cada pieza

- **Hetzner**: EU (Alemania), el más barato del mercado europeo, RGPD-compliant, VPS solo para código (no datos sensibles)
- **Coolify**: elimina necesidad de SSH tras instalación inicial. Auto-deploy en git push. No necesita experiencia infra.
- **Neon en lugar de Supabase free**: Supabase free pausa proyectos tras 1 semana sin actividad — inaceptable en producción. Neon no pausa, escala a cero y se reactiva en ms. Supabase Pro ($25/mes) sería alternativa si se quiere todo en un sitio.
- **Cloudflare R2 en lugar de S3**: sin costes de egreso (S3 cobra por descargar archivos), 10GB gratis, API compatible con S3 (migración trivial).
- **Archivos NUNCA en el VPS**: disco del VPS no cifrado por defecto, pérdida si se reconstruye el servidor.
- **BD NUNCA en el VPS**: disco no cifrado por defecto → riesgo RGPD con datos de salud de menores (categoría especial Art. 9).

---

## Por qué NO otras opciones

- **AKS / Kubernetes**: mínimo €70-100/mes solo el control plane. Completamente desproporcionado.
- **AWS (completo)**: más caro y complejo. Valor profesional real pero excesivo para gabinete pequeño.
- **Railway / Render**: más caros para servicios always-on, región EU cara o limitada, n8n no encaja sin coste extra.
- **PostgreSQL en el VPS**: disco no cifrado por defecto → riesgo RGPD categoría especial Art. 9.
- **Archivos en PostgreSQL (BYTEA)**: infla la BD, lento, no es para lo que está diseñado.

---

## Contexto RGPD relevante

- Los datos son "categoría especial" Art. 9 RGPD (salud de menores) → requieren cifrado en reposo y medidas técnicas apropiadas
- Neon Frankfurt + Cloudflare R2 con DPA europeo cubre la parte técnica
- **Pendiente (organizativo, no técnico)**: 
  - Registro de Actividades de Tratamiento (RAT) — documento Word obligatorio
  - DPA firmado con cada proveedor (disponibles en sus webs)
  - Política de retención de datos (Ley 41/2002: menores hasta 18+5 años)
- Signed URLs para archivos: los informes y registros nunca son públicamente accesibles, solo mediante URL temporal generada por el backend autenticado

---

## Arquitectura de archivos (Cloudflare R2)

Los archivos se suben al crear/finalizar, se accede via signed URLs con TTL corto:

```
gabinete-r2-bucket/
├── informes/
│   └── {informeId}/informe_final.pdf
├── registros/
│   └── {registroId}/adjunto.jpg   (futuro)
└── facturas/
    └── {facturaId}/factura.pdf    (Hito R)
```

Flujo de acceso:
1. Frontend pide `GET /informes/:id/pdf-url`
2. Backend genera signed URL con TTL de 5 minutos
3. Frontend abre la URL en nueva pestaña

---

## Fase 0 — Tailscale (antes del deploy, sin coste)

Tailscale en ordenador del developer + ordenador de la pedagoga → acceso inmediato a la app local desde casas distintas. Permite empezar a usar la app con datos reales mientras se monta la infraestructura definitiva.

---

## Preguntas abiertas para el arranque

### Bloque 1 — Dominio y marca
1. ¿El gabinete tiene nombre/marca ya? → determina qué dominio .es comprar
2. ¿Quién gestiona el dominio — el developer o la pedagoga?

### Bloque 2 — Estrategia de deploy
3. ¿Se despliega desde `develop` o se crea una rama `main`/`production` separada?
4. ¿Auto-deploy en cada push o deploy manual con botón?

### Bloque 3 — Base de datos
5. ¿Los 5-6 clientes actuales se migran al inicio o se empieza desde cero?
6. ¿Las nuevas profesionales comparten clientes con la pedagoga o tienen los suyos propios?
7. ¿Cómo se gestionan las migraciones Prisma en producción — manual o automatizado en deploy?

### Bloque 4 — Alcance del primer deploy
8. ¿Se incluye R2 en el primer deploy o se deja para después?
9. ¿n8n entra en el primer servidor o se activa más adelante?
