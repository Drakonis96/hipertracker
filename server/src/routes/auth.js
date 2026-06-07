import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles } from '../db/schema.js';
import { signAccessToken, signRefreshToken, verifyToken } from '../lib/jwt.js';
import { serializeProfile } from '../lib/serializers.js';
import { asyncHandler, badRequest, unauthorized } from '../lib/http.js';

export const authRouter = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Inicia sesión con un perfil (y PIN si aplica)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileId]
 *             properties:
 *               profileId: { type: string }
 *               pin: { type: string, description: PIN de 4-6 dígitos (si el perfil lo tiene) }
 *     responses:
 *       200: { description: Token JWT y perfil }
 *       401: { description: Credenciales incorrectas }
 */
authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { profileId, pin } = req.body || {};
    if (!profileId) throw badRequest('Falta el identificador de perfil');

    const profile = db.select().from(profiles).where(eq(profiles.id, profileId)).get();
    if (!profile) throw unauthorized('Perfil no encontrado');

    if (profile.pinHash) {
      if (!pin) throw unauthorized('Introduce tu PIN');
      const ok = await bcrypt.compare(String(pin), profile.pinHash);
      if (!ok) throw unauthorized('PIN incorrecto, inténtalo de nuevo');
    }

    res.json({
      token: signAccessToken(profile),
      refreshToken: signRefreshToken(profile),
      profile: serializeProfile(profile),
    });
  }),
);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renueva el token de acceso con un refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nuevo token de acceso }
 *       401: { description: Refresh token inválido }
 */
authRouter.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body || {};
    if (!refreshToken) throw badRequest('Falta el refresh token');
    let payload;
    try {
      payload = verifyToken(refreshToken);
    } catch {
      throw unauthorized('Refresh token inválido o caducado');
    }
    if (payload.type !== 'refresh') throw unauthorized('Tipo de token incorrecto');
    const profile = db.select().from(profiles).where(eq(profiles.id, payload.sub)).get();
    if (!profile) throw unauthorized('El perfil ya no existe');
    res.json({
      token: signAccessToken(profile),
      refreshToken: signRefreshToken(profile),
      profile: serializeProfile(profile),
    });
  }),
);
