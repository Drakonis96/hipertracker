import { Router } from 'express';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { items, itemStores } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeItem, serializeItems } from '../lib/serializers.js';
import { loadAccessibleList } from '../lib/access.js';
import { isValidStoreId } from '../lib/stores.js';
import { asyncHandler, badRequest, notFound } from '../lib/http.js';
import { newId, now } from '../lib/ids.js';

// mergeParams para acceder a :listId del router padre.
export const itemsRouter = Router({ mergeParams: true });
itemsRouter.use(requireAuth);

const ICON_TYPES = new Set(['emoji', 'icon', 'none']);

function normalizeStores(input) {
  if (!Array.isArray(input)) return [];
  return [...new Set(input.map(String).filter((id) => isValidStoreId(id)))];
}

function setItemStores(itemId, storeIds) {
  db.delete(itemStores).where(eq(itemStores.itemId, itemId)).run();
  if (storeIds.length) {
    db.insert(itemStores)
      .values(storeIds.map((storeId) => ({ itemId, storeId })))
      .run();
  }
}

function getItemOr404(itemId, listId) {
  const item = db
    .select()
    .from(items)
    .where(and(eq(items.id, itemId), eq(items.listId, listId)))
    .get();
  if (!item) throw notFound('Producto no encontrado');
  return item;
}

/**
 * @openapi
 * /lists/{listId}/items:
 *   get:
 *     tags: [Productos]
 *     summary: Lista los productos de una lista (con filtros opcionales)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: listId, required: true, schema: { type: string } }
 *       - { in: query, name: q, schema: { type: string }, description: Buscar por nombre }
 *       - { in: query, name: store, schema: { type: string }, description: Filtra por ID de tienda }
 *       - { in: query, name: status, schema: { type: string, enum: [all, pending, done] } }
 *     responses:
 *       200: { description: Productos de la lista }
 */
itemsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    loadAccessibleList(req.params.listId, req.profile);
    let rows = db
      .select()
      .from(items)
      .where(eq(items.listId, req.params.listId))
      .orderBy(items.checked, items.position)
      .all();

    let result = serializeItems(rows);

    const { q, store, status } = req.query;
    if (q) {
      const needle = String(q).toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(needle));
    }
    if (store) {
      const wanted = String(store).split(',').filter(Boolean);
      result = result.filter((i) => i.stores.some((s) => wanted.includes(s)));
    }
    if (status === 'pending') result = result.filter((i) => !i.checked);
    if (status === 'done') result = result.filter((i) => i.checked);

    res.json(result);
  }),
);

/**
 * @openapi
 * /lists/{listId}/items:
 *   post:
 *     tags: [Productos]
 *     summary: Crea un producto en la lista
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: listId, required: true, schema: { type: string } }
 *     responses:
 *       201: { description: Producto creado }
 */
itemsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    loadAccessibleList(req.params.listId, req.profile);
    const { name, icon, iconType, notes, stores } = req.body || {};
    if (!name || !String(name).trim()) throw badRequest('El nombre del producto es obligatorio');

    const type = ICON_TYPES.has(iconType) ? iconType : 'none';
    const maxPos =
      db
        .select({ m: sql`COALESCE(MAX(${items.position}), -1)` })
        .from(items)
        .where(eq(items.listId, req.params.listId))
        .get()?.m ?? -1;

    const ts = now();
    const row = {
      id: newId(),
      name: String(name).trim(),
      icon: type === 'none' ? null : icon || null,
      iconType: type,
      listId: req.params.listId,
      checked: false,
      position: Number(maxPos) + 1,
      notes: notes || null,
      createdAt: ts,
      updatedAt: ts,
    };
    db.insert(items).values(row).run();
    const storeIds = normalizeStores(stores);
    setItemStores(row.id, storeIds);
    res.status(201).json(serializeItem(row, storeIds));
  }),
);

/**
 * @openapi
 * /lists/{listId}/items/reorder:
 *   patch:
 *     tags: [Productos]
 *     summary: Reordena productos (drag & drop)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: listId, required: true, schema: { type: string } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderedIds: { type: array, items: { type: string } }
 *     responses:
 *       200: { description: Productos reordenados }
 */
itemsRouter.patch(
  '/reorder',
  asyncHandler(async (req, res) => {
    loadAccessibleList(req.params.listId, req.profile);
    const { orderedIds } = req.body || {};
    if (!Array.isArray(orderedIds)) throw badRequest('orderedIds debe ser un array');
    const ts = now();
    const tx = db.transaction((ids) => {
      ids.forEach((id, idx) => {
        db.update(items)
          .set({ position: idx, updatedAt: ts })
          .where(and(eq(items.id, id), eq(items.listId, req.params.listId)))
          .run();
      });
    });
    tx(orderedIds);
    const rows = db
      .select()
      .from(items)
      .where(eq(items.listId, req.params.listId))
      .orderBy(items.checked, items.position)
      .all();
    res.json(serializeItems(rows));
  }),
);

/**
 * @openapi
 * /lists/{listId}/items/{id}:
 *   patch:
 *     tags: [Productos]
 *     summary: Edita un producto (nombre, icono, tiendas, notas, mover de lista)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: listId, required: true, schema: { type: string } }
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Producto actualizado }
 */
itemsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    loadAccessibleList(req.params.listId, req.profile);
    const item = getItemOr404(req.params.id, req.params.listId);

    const { name, icon, iconType, notes, stores, checked, listId: targetListId } = req.body || {};
    const updates = { updatedAt: now() };

    if (name !== undefined) {
      if (!String(name).trim()) throw badRequest('El nombre no puede estar vacío');
      updates.name = String(name).trim();
    }
    if (iconType !== undefined || icon !== undefined) {
      const type = ICON_TYPES.has(iconType) ? iconType : item.iconType;
      updates.iconType = type;
      updates.icon = type === 'none' ? null : (icon !== undefined ? icon : item.icon);
    }
    if (notes !== undefined) updates.notes = notes || null;
    if (checked !== undefined) updates.checked = !!checked;

    // Mover a otra lista (verifica acceso a la lista destino).
    if (targetListId !== undefined && targetListId !== item.listId) {
      loadAccessibleList(targetListId, req.profile);
      updates.listId = targetListId;
      const maxPos =
        db
          .select({ m: sql`COALESCE(MAX(${items.position}), -1)` })
          .from(items)
          .where(eq(items.listId, targetListId))
          .get()?.m ?? -1;
      updates.position = Number(maxPos) + 1;
    }

    db.update(items).set(updates).where(eq(items.id, item.id)).run();
    if (stores !== undefined) setItemStores(item.id, normalizeStores(stores));

    const fresh = db.select().from(items).where(eq(items.id, item.id)).get();
    const links = db.select().from(itemStores).where(eq(itemStores.itemId, item.id)).all();
    res.json(serializeItem(fresh, links.map((l) => l.storeId)));
  }),
);

/**
 * @openapi
 * /lists/{listId}/items/{id}/check:
 *   patch:
 *     tags: [Productos]
 *     summary: Marca o desmarca un producto como comprado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: listId, required: true, schema: { type: string } }
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Estado actualizado }
 */
itemsRouter.patch(
  '/:id/check',
  asyncHandler(async (req, res) => {
    loadAccessibleList(req.params.listId, req.profile);
    const item = getItemOr404(req.params.id, req.params.listId);
    const checked = req.body && req.body.checked !== undefined ? !!req.body.checked : !item.checked;
    db.update(items).set({ checked, updatedAt: now() }).where(eq(items.id, item.id)).run();
    const links = db.select().from(itemStores).where(eq(itemStores.itemId, item.id)).all();
    res.json(serializeItem({ ...item, checked }, links.map((l) => l.storeId)));
  }),
);

/**
 * @openapi
 * /lists/{listId}/items/{id}:
 *   delete:
 *     tags: [Productos]
 *     summary: Elimina un producto
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: listId, required: true, schema: { type: string } }
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       204: { description: Producto eliminado }
 */
itemsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    loadAccessibleList(req.params.listId, req.profile);
    const item = getItemOr404(req.params.id, req.params.listId);
    db.delete(items).where(eq(items.id, item.id)).run();
    res.status(204).end();
  }),
);
