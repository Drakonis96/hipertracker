import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// server/src -> server
const serverRoot = path.resolve(__dirname, '..');
// monorepo root
const repoRoot = path.resolve(serverRoot, '..');

const publicDir = path.join(serverRoot, 'public');
const logosDir = path.join(publicDir, 'logos');
const clientDist = path.join(repoRoot, 'client', 'dist');

const env = process.env.NODE_ENV || 'development';
const isProd = env === 'production';

// Por defecto se guarda en <repo>/data/hipertracker.db (volumen en Docker).
const dbPath = process.env.DB_PATH || path.join(repoRoot, 'data', 'hipertracker.db');
const dataDir = path.dirname(dbPath);
fs.mkdirSync(dataDir, { recursive: true });

const jwtSecret = process.env.JWT_SECRET || 'change_me_in_production';
if (isProd && jwtSecret === 'change_me_in_production') {
  console.warn('[HiperTracker] AVISO: JWT_SECRET usa el valor por defecto en producción. Cámbialo.');
}

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// Login propio de la app (opcional). Se activa cuando hay usuario y contraseña.
// Protege toda la API con un token (cabecera X-App-Auth), sin depender del
// Basic Auth de un reverse proxy.
const appAuthUser = process.env.APP_AUTH_USER || '';
const appAuthPassword = process.env.APP_AUTH_PASSWORD || '';

export const config = {
  env,
  isProd,
  port: Number(process.env.PORT) || 5794,
  dbPath,
  dataDir,
  jwtSecret,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '12h',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '30d',
  gateTokenTtl: process.env.APP_AUTH_TTL || '30d',
  appAuth: {
    user: appAuthUser,
    password: appAuthPassword,
    enabled: !!(appAuthUser && appAuthPassword),
  },
  allowedOrigins,
  paths: {
    serverRoot,
    repoRoot,
    publicDir,
    logosDir,
    clientDist,
  },
};
