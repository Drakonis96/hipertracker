import { Router } from 'express';
import { eq, or, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { lists, items, itemStores, customStores } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { getStoreMap } from '../lib/stores.js';
import { asyncHandler, badRequest } from '../lib/http.js';
import { newId, now } from '../lib/ids.js';

export const dataRouter = Router();
dataRouter.use(requireAuth);

/**
 * @openapi
 * /data/export:
 *   get:
 *     tags: [Datos]
 *     summary: Exporta una copia completa (listas + productos + tiendas personalizadas)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Copia de seguridad en JSON }
 */
dataRouter.get(
  '/export',
  asyncHandler(async (req, res) => {
    const accessibleLists = db
      .select()
      .from(lists)
      .where(or(eq(lists.type, 'shared'), eq(lists.ownerId, req.profile.id)))
      .orderBy(lists.createdAt)
      .all();

    const listIds = accessibleLists.map((l) => l.id);
    const allItems = listIds.length
      ? db.select().from(items).where(inArray(items.listId, listIds)).orderBy(items.position).all()
      : [];
    const itemIds = allItems.map((i) => i.id);
    const links = itemIds.length
      ? db.select().from(itemStores).where(inArray(itemStores.itemId, itemIds)).all()
      : [];
    const storesByItem = new Map();
    for (const l of links) {
      if (!storesByItem.has(l.itemId)) storesByItem.set(l.itemId, []);
      storesByItem.get(l.itemId).push(l.storeId);
    }

    const customs = db.select().from(customStores).all();

    const payload = {
      app: 'HiperTracker',
      version: '0.1.10',
      exportedAt: now(),
      customStores: customs.map((c) => ({ id: c.id, name: c.name, color: c.color })),
      lists: accessibleLists.map((l) => ({
        name: l.name,
        type: l.type,
        items: allItems
          .filter((i) => i.listId === l.id)
          .map((i) => ({
            name: i.name,
            icon: i.icon,
            iconType: i.iconType,
            notes: i.notes,
            checked: !!i.checked,
            stores: storesByItem.get(i.id) || [],
          })),
      })),
    };

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="hipertracker-backup.json"');
    res.send(JSON.stringify(payload, null, 2));
  }),
);

/**
 * @openapi
 * /data/import:
 *   post:
 *     tags: [Datos]
 *     summary: Importa una copia completa (crea listas, productos y tiendas personalizadas)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Resumen de la importación }
 */
dataRouter.post(
  '/import',
  asyncHandler(async (req, res) => {
    const data = req.body || {};
    if (!Array.isArray(data.lists)) throw badRequest('El formato de la copia no es válido');

    const ts = now();
    const storeMap = getStoreMap(); // ids válidos del sistema + personalizados existentes
    const existingCustomByName = new Map(
      db
        .select()
        .from(customStores)
        .all()
        .map((c) => [c.name.toLowerCase(), c.id]),
    );
    const idRemap = new Map(); // id antiguo de la copia -> id válido actual

    // Reconstruir tiendas personalizadas
    for (const cs of data.customStores || []) {
      if (!cs?.name) continue;
      const key = String(cs.name).toLowerCase();
      let newIdValue = existingCustomByName.get(key);
      if (!newIdValue) {
        newIdValue = `custom-${newId()}`;
        db.insert(customStores)
          .values({ id: newIdValue, name: String(cs.name).trim(), color: cs.color || null, createdAt: ts, updatedAt: ts })
          .run();
        existingCustomByName.set(key, newIdValue);
      }
      if (cs.id) idRemap.set(cs.id, newIdValue);
    }

    const remapStore = (sid) => {
      if (idRemap.has(sid)) return idRemap.get(sid);
      if (storeMap.has(sid)) return sid; // tienda del sistema o personalizada existente
      return null;
    };

    let listCount = 0;
    let itemCount = 0;

    for (const l of data.lists) {
      if (!l?.name) continue;
      const listId = newId();
      db.insert(lists)
        .values({
          id: listId,
          name: String(l.name).trim(),
          type: l.type === 'shared' ? 'shared' : 'personal',
          ownerId: req.profile.id,
          createdAt: ts,
          updatedAt: ts,
        })
        .run();
      listCount += 1;

      let pos = 0;
      for (const it of l.items || []) {
        if (!it?.name) continue;
        const itemId = newId();
        const iconType = ['emoji', 'icon', 'none'].includes(it.iconType) ? it.iconType : 'none';
        db.insert(items)
          .values({
            id: itemId,
            name: String(it.name).trim(),
            icon: iconType === 'none' ? null : it.icon || null,
            iconType,
            listId,
            checked: !!it.checked,
            position: pos++,
            notes: it.notes || null,
            createdAt: ts,
            updatedAt: ts,
          })
          .run();
        itemCount += 1;

        const sids = [...new Set((it.stores || []).map(remapStore).filter(Boolean))];
        if (sids.length) {
          db.insert(itemStores).values(sids.map((storeId) => ({ itemId, storeId }))).run();
        }
      }
    }

    res.json({ lists: listCount, items: itemCount, customStores: (data.customStores || []).length });
  }),
);
