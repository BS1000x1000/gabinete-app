# ---------- Etapa 1: construcción ----------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Instala TODAS las dependencias (incluidas las de desarrollo) para compilar
COPY package*.json ./
RUN npm ci

# Copia el código y compila TypeScript -> dist/
COPY . .
RUN npm run build

# Quita las dependencias de desarrollo: la imagen final solo necesita producción
RUN npm prune --omit=dev


# ---------- Etapa 2: ejecución ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
# Le decimos a Puppeteer que NO se descargue su propio Chromium:
# usaremos el del sistema, que recibe parches de seguridad vía apt en cada build.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Chromium + fuentes (si no, los PDFs salen con texto roto) + tini como init
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
      tini \
    && rm -rf /var/lib/apt/lists/*

# Copia SOLO lo necesario desde la etapa anterior (imagen final más limpia)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# No ejecutes la app como root: usa el usuario 'node' que ya trae la imagen
USER node

# Scaleway enruta al puerto que declares aquí
ENV PORT=8080
EXPOSE 8080

# tini como PID 1: gestiona señales y limpia los procesos hijos de Chromium
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/main.js"]