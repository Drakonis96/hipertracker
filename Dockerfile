# syntax=docker/dockerfile:1

# ---------- Etapa 1: build ----------
FROM node:20-slim AS build

# Herramientas para compilar dependencias nativas (better-sqlite3) si no hay prebuild.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Frontend: instala deps y compila con Vite
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client ./client
RUN cd client && npm run build

# Backend: instala solo dependencias de producción
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# ---------- Etapa 2: production ----------
FROM node:20-slim AS production

ENV NODE_ENV=production \
    PORT=5794 \
    DB_PATH=/app/data/hipertracker.db

WORKDIR /app

# Código del servidor (sin node_modules — ver .dockerignore) y assets
COPY server ./server
# node_modules compilado en la etapa de build (misma plataforma)
COPY --from=build /app/server/node_modules ./server/node_modules
# Frontend compilado
COPY --from=build /app/client/dist ./client/dist

RUN mkdir -p /app/data

WORKDIR /app/server
EXPOSE 5794

CMD ["node", "src/index.js"]
