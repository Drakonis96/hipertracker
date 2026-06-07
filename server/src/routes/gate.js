import { Router } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { signGateToken } from '../lib/jwt.js';
import { gateEnabled, hasValidGate, GATE_COOKIE } from '../middleware/gate.js';
import { loginLimiter } from '../middleware/rateLimit.js';
import { asyncHandler, unauthorized } from '../lib/http.js';

export const gateRouter = Router();

const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 días

// Comparación en tiempo constante (evita filtrar info por timing).
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function isHttps(req) {
  return req.secure || req.headers['x-forwarded-proto'] === 'https';
}

/**
 * @openapi
 * /gate:
 *   get:
 *     tags: [Acceso]
 *     summary: Estado del login de la app (activado y si la sesión es válida)
 *     responses:
 *       200: { description: "{ enabled, authed }" }
 */
gateRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ enabled: gateEnabled(), authed: hasValidGate(req) });
  }),
);

/**
 * @openapi
 * /gate/login:
 *   post:
 *     tags: [Acceso]
 *     summary: Inicia sesión en la app (usuario + contraseña del servidor)
 *     responses:
 *       200: { description: Token de acceso (X-App-Auth) + cookie httpOnly }
 *       401: { description: Credenciales incorrectas }
 *       429: { description: Demasiados intentos }
 */
gateRouter.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    if (!gateEnabled()) {
      res.json({ enabled: false, token: null });
      return;
    }
    const { username, password } = req.body || {};
    const okUser = safeEqual(username ?? '', config.appAuth.user);
    const okPass = safeEqual(password ?? '', config.appAuth.password);
    if (!(okUser && okPass)) throw unauthorized('Usuario o contraseña incorrectos');

    const token = signGateToken();
    // Cookie httpOnly para el navegador (protege también el cascarón estático).
    res.cookie(GATE_COOKIE, token, {
      httpOnly: true,
      secure: isHttps(req),
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
    res.json({ enabled: true, token });
  }),
);

/**
 * @openapi
 * /gate/logout:
 *   post:
 *     tags: [Acceso]
 *     summary: Cierra la sesión de acceso (borra la cookie)
 *     responses:
 *       204: { description: Sesión cerrada }
 */
gateRouter.post(
  '/logout',
  asyncHandler(async (req, res) => {
    res.clearCookie(GATE_COOKIE, { path: '/' });
    res.status(204).end();
  }),
);
