import { Router } from 'express';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { signGateToken } from '../lib/jwt.js';
import { gateEnabled } from '../middleware/gate.js';
import { asyncHandler, unauthorized } from '../lib/http.js';

export const gateRouter = Router();

// Comparación en tiempo constante (evita filtrar info por timing).
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/**
 * @openapi
 * /gate:
 *   get:
 *     tags: [Acceso]
 *     summary: Indica si el login de la app está activado
 *     responses:
 *       200: { description: "{ enabled: boolean }" }
 */
gateRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json({ enabled: gateEnabled() });
  }),
);

/**
 * @openapi
 * /gate/login:
 *   post:
 *     tags: [Acceso]
 *     summary: Inicia sesión en la app (usuario + contraseña del servidor)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Token de acceso (X-App-Auth) }
 *       401: { description: Credenciales incorrectas }
 */
gateRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    if (!gateEnabled()) {
      res.json({ enabled: false, token: null });
      return;
    }
    const { username, password } = req.body || {};
    const okUser = safeEqual(username ?? '', config.appAuth.user);
    const okPass = safeEqual(password ?? '', config.appAuth.password);
    if (!(okUser && okPass)) throw unauthorized('Usuario o contraseña incorrectos');
    res.json({ enabled: true, token: signGateToken() });
  }),
);
