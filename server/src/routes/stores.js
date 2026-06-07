import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { customStores, itemStores } from '../db/schema.js';
import { getStores } from '../lib/stores.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, badRequest, notFound, conflict } from '../lib/http.js';
import { newId, now } from '../lib/ids.js';

export const storesRouter = Router();

/**
 * @openapi
 * /stores:
 *   get:
 *     tags: [Tiendas]
 *     summary: Lista las tiendas disponibles (sistema + personalizadas)
 *     responses:
 *       200:
 *         description: Listado de tiendas con logoUrl
 */
storesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(getStores());
  }),
);

/**
 * @openapi
 * /stores:
 *   post:
 *     tags: [Tiendas]
 *     summary: Crea una tienda personalizada (sin logo de archivo)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Tienda creada }
 */
storesRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { name, color } = req.body || {};
    if (!name || !String(name).trim()) throw badRequest('El nombre de la tienda es obligatorio');
    const ts = now();
    const row = {
      id: `custom-${newId()}`,
      name: String(name).trim(),
      color: color || null,
      createdAt: ts,
      updatedAt: ts,
    };
    db.insert(customStores).values(row).run();
    res.status(201).json({
      id: row.id,
      name: row.name,
      logoUrl: null,
      color: row.color,
      category: 'personalizada',
      categoryLabel: 'Personalizada',
      custom: true,
    });
  }),
);

/**
 * @openapi
 * /stores/{id}:
 *   delete:
 *     tags: [Tiendas]
 *     summary: Elimina una tienda personalizada
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Tienda eliminada }
 */
storesRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    if (!id.startsWith('custom-')) throw conflict('Solo se pueden eliminar tiendas personalizadas');
    const store = db.select().from(customStores).where(eq(customStores.id, id)).get();
    if (!store) throw notFound('Tienda no encontrada');
    db.delete(itemStores).where(eq(itemStores.storeId, id)).run();
    db.delete(customStores).where(eq(customStores.id, id)).run();
    res.status(204).end();
  }),
);
