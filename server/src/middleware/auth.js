import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles } from '../db/schema.js';
import { verifyToken } from '../lib/jwt.js';
import { unauthorized, forbidden } from '../lib/http.js';

// Carga el perfil autenticado a partir del token JWT.
// Se admite en cabecera `X-Auth-Token` (para convivir con el Basic Auth de un
// reverse proxy, que ocupa la cabecera Authorization) o como `Authorization: Bearer`.
export function requireAuth(req, res, next) {
  let token = req.headers['x-auth-token'] || '';
  if (!token) {
    const header = req.headers.authorization || '';
    const [scheme, value] = header.split(' ');
    if (scheme === 'Bearer' && value) token = value;
  }
  if (!token) {
    return next(unauthorized('Falta el token de acceso'));
  }
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(unauthorized('Token inválido o caducado'));
  }
  if (payload.type !== 'access') {
    return next(unauthorized('Tipo de token incorrecto'));
  }
  const profile = db.select().from(profiles).where(eq(profiles.id, payload.sub)).get();
  if (!profile) {
    return next(unauthorized('El perfil ya no existe'));
  }
  req.profile = profile;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.profile?.isAdmin) {
    return next(forbidden('Se requieren permisos de administrador'));
  }
  next();
}

// Versión promisificada para autenticación condicional (p. ej. bootstrap del primer perfil).
export function ensureAuth(req, res) {
  return new Promise((resolve, reject) => {
    requireAuth(req, res, (err) => (err ? reject(err) : resolve(req.profile)));
  });
}
