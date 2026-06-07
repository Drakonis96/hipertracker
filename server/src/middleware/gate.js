import { config } from '../config.js';
import { verifyToken } from '../lib/jwt.js';
import { ApiError } from '../lib/http.js';

export const GATE_COOKIE = 'ht_gate';

export function gateEnabled() {
  return config.appAuth.enabled;
}

// Lee el token del portero de la cookie httpOnly (navegador).
export function getGateCookie(req) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    if (k === GATE_COOKIE) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

// ¿La petición trae un token de acceso válido? La app nativa usa la cabecera
// X-App-Auth; el navegador usa la cookie httpOnly ht_gate.
export function hasValidGate(req) {
  if (!gateEnabled()) return true;
  const token = req.headers['x-app-auth'] || getGateCookie(req);
  if (!token) return false;
  try {
    return verifyToken(token).type === 'gate';
  } catch {
    return false;
  }
}

export function requireGate(req, res, next) {
  if (!gateEnabled()) return next();
  if (hasValidGate(req)) return next();
  return next(new ApiError(401, 'Acceso restringido: inicia sesión en la app', 'gate_required'));
}
