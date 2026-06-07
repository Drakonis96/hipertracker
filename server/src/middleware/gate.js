import { config } from '../config.js';
import { verifyToken } from '../lib/jwt.js';
import { ApiError } from '../lib/http.js';

export function gateEnabled() {
  return config.appAuth.enabled;
}

// Si el login de la app está activado, exige un token de acceso válido en la
// cabecera X-App-Auth. Devuelve el código 'gate_required' para que el cliente
// muestre la pantalla de login (en vez de cerrar la sesión de perfil).
export function requireGate(req, res, next) {
  if (!gateEnabled()) return next();
  const token = req.headers['x-app-auth'];
  if (!token) {
    return next(new ApiError(401, 'Acceso restringido: inicia sesión en la app', 'gate_required'));
  }
  try {
    const payload = verifyToken(token);
    if (payload.type !== 'gate') throw new Error('tipo incorrecto');
    return next();
  } catch {
    return next(new ApiError(401, 'La sesión de acceso ha caducado', 'gate_required'));
  }
}
