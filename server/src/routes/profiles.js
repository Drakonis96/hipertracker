import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { profiles } from '../db/schema.js';
import { ensureAuth, requireAuth } from '../middleware/auth.js';
import { publicProfile, serializeProfile } from '../lib/serializers.js';
import { asyncHandler, badRequest, forbidden, notFound, conflict } from '../lib/http.js';
import { newId, now } from '../lib/ids.js';

export const profilesRouter = Router();

const PIN_RE = /^\d{4,6}$/;

function validatePin(pin) {
  if (!PIN_RE.test(String(pin))) {
    throw badRequest('El PIN debe tener entre 4 y 6 dígitos numéricos');
  }
}

/**
 * @openapi
 * /profiles:
 *   get:
 *     tags: [Perfiles]
 *     summary: Lista los perfiles (datos públicos para la pantalla de selección)
 *     responses:
 *       200: { description: Lista de perfiles }
 */
profilesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = db.select().from(profiles).orderBy(profiles.createdAt).all();
    res.json(rows.map(publicProfile));
  }),
);

/**
 * @openapi
 * /profiles:
 *   post:
 *     tags: [Perfiles]
 *     summary: Crea un perfil (el primero se crea sin auth y es administrador)
 *     responses:
 *       201: { description: Perfil creado }
 */
profilesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const existing = db.select().from(profiles).all();
    const isBootstrap = existing.length === 0;
    if (!isBootstrap) await ensureAuth(req, res);

    const { name, avatar, color, pin, accentColor, theme } = req.body || {};
    if (!name || !String(name).trim()) throw badRequest('El nombre es obligatorio');

    let pinHash = null;
    if (pin != null && pin !== '') {
      validatePin(pin);
      pinHash = await bcrypt.hash(String(pin), 10);
    }

    const ts = now();
    const row = {
      id: newId(),
      name: String(name).trim(),
      avatar: avatar || null,
      color: color || '#10b981',
      pinHash,
      isAdmin: isBootstrap,
      accentColor: accentColor || '#10b981',
      theme: theme || 'system',
      createdAt: ts,
      updatedAt: ts,
    };
    db.insert(profiles).values(row).run();
    res.status(201).json(serializeProfile(row));
  }),
);

/**
 * @openapi
 * /profiles/{id}:
 *   patch:
 *     tags: [Perfiles]
 *     summary: Actualiza un perfil (nombre, avatar, color, apariencia, PIN)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Perfil actualizado }
 */
profilesRouter.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const target = db.select().from(profiles).where(eq(profiles.id, req.params.id)).get();
    if (!target) throw notFound('Perfil no encontrado');

    const isSelf = target.id === req.profile.id;
    const isAdmin = !!req.profile.isAdmin;
    if (!isSelf && !isAdmin) throw forbidden('Solo puedes editar tu propio perfil');

    const { name, avatar, color, accentColor, theme, pin } = req.body || {};
    const updates = { updatedAt: now() };

    if (name !== undefined) {
      if (!String(name).trim()) throw badRequest('El nombre no puede estar vacío');
      updates.name = String(name).trim();
    }
    if (avatar !== undefined) updates.avatar = avatar || null;
    if (color !== undefined) updates.color = color;
    if (accentColor !== undefined) updates.accentColor = accentColor;
    if (theme !== undefined) {
      if (!['light', 'dark', 'system'].includes(theme)) throw badRequest('Tema no válido');
      updates.theme = theme;
    }

    // PIN: poner/cambiar/eliminar. Cambiar el de otro requiere admin.
    if (pin !== undefined) {
      if (!isSelf && !isAdmin) throw forbidden('Solo un administrador puede cambiar el PIN de otro perfil');
      if (pin === null || pin === '') {
        updates.pinHash = null;
      } else {
        validatePin(pin);
        updates.pinHash = await bcrypt.hash(String(pin), 10);
      }
    }

    db.update(profiles).set(updates).where(eq(profiles.id, target.id)).run();
    const fresh = db.select().from(profiles).where(eq(profiles.id, target.id)).get();
    res.json(serializeProfile(fresh));
  }),
);

/**
 * @openapi
 * /profiles/{id}:
 *   delete:
 *     tags: [Perfiles]
 *     summary: Elimina un perfil (solo administrador; no se puede eliminar al administrador)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Perfil eliminado }
 */
profilesRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.profile.isAdmin) throw forbidden('Se requieren permisos de administrador');
    const target = db.select().from(profiles).where(eq(profiles.id, req.params.id)).get();
    if (!target) throw notFound('Perfil no encontrado');
    if (target.isAdmin) throw conflict('No se puede eliminar el perfil de administrador');

    const total = db.select().from(profiles).all().length;
    if (total <= 1) throw conflict('No se puede eliminar el único perfil');

    db.delete(profiles).where(eq(profiles.id, target.id)).run();
    res.status(204).end();
  }),
);
