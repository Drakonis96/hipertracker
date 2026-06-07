import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
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

// Secreto para firmar tokens. Si no se define (o se deja el valor de ejemplo),
// se genera uno aleatorio fuerte y se persiste en el volumen de datos, para no
// usar nunca un secreto adivinable.
function resolveJwtSecret() {
  const fromEnv = process.env.JWT_SECRET;
  if (fromEnv && fromEnv !== 'change_me_in_production') return fromEnv;

  const secretFile = path.join(dataDir, '.jwt-secret');
  try {
    const existing = fs.readFileSync(secretFile, 'utf8').trim();
    if (existing) return existing;
  } catch {
    /* no existe todavía */
  }
  const generated = crypto.randomBytes(48).toString('hex');
  try {
    fs.writeFileSync(secretFile, generated, { mode: 0o600 });
    console.warn('[HiperTracker] JWT_SECRET no definido: se generó uno aleatorio en data/.jwt-secret');
  } catch {
    console.warn('[HiperTracker] AVISO: no se pudo persistir el secreto generado; define JWT_SECRET.');
  }
  return generated;
}
const jwtSecret = resolveJwtSecret();

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
