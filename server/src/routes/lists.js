import { Router } from 'express';
import { eq, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { lists, items, listMembers, profiles } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { serializeList, serializeItems } from '../lib/serializers.js';
import { canManageList, canAccessList, loadAccessibleList, listMemberIds } from '../lib/access.js';
import { asyncHandler, badRequest, notFound, forbidden } from '../lib/http.js';
import { newId, now } from '../lib/ids.js';

export const listsRouter = Router();
listsRouter.use(requireAuth);

const LIST_TYPES = ['personal', 'shared', 'custom'];

function countsFor(listIds) {
  const counts = new Map();
  if (listIds.length === 0) return counts;
  const rows = db.select().from(items).where(inArray(items.listId, listIds)).all();
  for (const r of rows) {
    const c = counts.get(r.listId) || { itemCount: 0, checkedCount: 0 };
    c.itemCount += 1;
    if (r.checked) c.checkedCount += 1;
    counts.set(r.listId, c);
  }
  return counts;
}

function membersFor(listIds) {
  const byList = new Map();
  if (listIds.length === 0) return byList;
  const rows = db.select().from(listMembers).where(inArray(listMembers.listId, listIds)).all();
  for (const r of rows) {
    if (!byList.has(r.listId)) byList.set(r.listId, []);
    byList.get(r.listId).push(r.profileId);
  }
  return byList;
}

// Reemplaza los miembros de una lista "custom" por la selección dada,
// descartando ids inexistentes y al propietario (siempre tiene acceso).
function setListMembers(listId, memberIds, ownerId) {
  db.delete(listMembers).where(eq(listMembers.listId, listId)).run();
  const valid = new Set(db.select().from(profiles).all().map((p) => p.id));
  const ids = [...new Set((Array.isArray(memberIds) ? memberIds : []).map(String))].filter(
    (id) => valid.has(id) && id !== ownerId,
  );
  if (ids.length) {
    db.insert(listMembers).values(ids.map((profileId) => ({ listId, profileId }))).run();
  }
}

/**
 * @openapi
 * /lists:
 *   get:
 *     tags: [Listas]
 *     summary: Lista las listas accesibles (propias + compartidas)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Listas con contadores }
 */
listsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    // Accesibles: compartidas con todos, propias, custom donde es miembro y
    // (si es admin) todas. canAccessList resuelve la pertenencia a custom.
    const rows = db
      .select()
      .from(lists)
      .orderBy(lists.createdAt)
      .all()
      .filter((l) => canAccessList(l, req.profile));
    const ids = rows.map((r) => r.id);
    const counts = countsFor(ids);
    const members = membersFor(ids);
    res.json(
      rows.map((l) =>
        serializeList(l, {
          ...(counts.get(l.id) || { itemCount: 0, checkedCount: 0 }),
          memberIds: members.get(l.id) || [],
        }),
      ),
    );
  }),
);

/**
 * @openapi
 * /lists:
 *   post:
 *     tags: [Listas]
 *     summary: Crea una lista (personal o compartida)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Lista creada }
 */
listsRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, type, memberIds } = req.body || {};
    if (!name || !String(name).trim()) throw badRequest('El nombre de la lista es obligatorio');
    const listType = LIST_TYPES.includes(type) ? type : 'personal';
    const ts = now();
    const row = {
      id: newId(),
      name: String(name).trim(),
      type: listType,
      ownerId: req.profile.id,
      createdAt: ts,
      updatedAt: ts,
    };
    db.insert(lists).values(row).run();
    if (listType === 'custom') setListMembers(row.id, memberIds, row.ownerId);
    res.status(201).json(
      serializeList(row, { itemCount: 0, checkedCount: 0, memberIds: listMemberIds(row.id) }),
    );
  }),
);

/**
 * @openapi
 * /lists/{id}:
 *   patch:
 *     tags: [Listas]
 *     summary: Renombra o cambia el tipo de una lista (propietario o admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Lista actualizada }
 */
listsRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const list = db.select().from(lists).where(eq(lists.id, req.params.id)).get();
    if (!list) throw notFound('Lista no encontrada');
    if (!canManageList(list, req.profile)) throw forbidden('Solo el propietario puede modificar esta lista');

    const { name, type, memberIds } = req.body || {};
    const updates = { updatedAt: now() };
    if (name !== undefined) {
      if (!String(name).trim()) throw badRequest('El nombre no puede estar vacío');
      updates.name = String(name).trim();
    }
    if (type !== undefined) {
      if (!LIST_TYPES.includes(type)) throw badRequest('Tipo de lista no válido');
      updates.type = type;
    }
    db.update(lists).set(updates).where(eq(lists.id, list.id)).run();

    const finalType = updates.type ?? list.type;
    if (finalType !== 'custom') {
      // Al dejar de ser "custom" se limpian los miembros.
      db.delete(listMembers).where(eq(listMembers.listId, list.id)).run();
    } else if (memberIds !== undefined) {
      setListMembers(list.id, memberIds, list.ownerId);
    }

    const fresh = db.select().from(lists).where(eq(lists.id, list.id)).get();
    res.json(serializeList(fresh, { memberIds: listMemberIds(list.id) }));
  }),
);

/**
 * @openapi
 * /lists/{id}:
 *   delete:
 *     tags: [Listas]
 *     summary: Elimina una lista y sus productos (propietario o admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: Lista eliminada }
 */
listsRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const list = db.select().from(lists).where(eq(lists.id, req.params.id)).get();
    if (!list) throw notFound('Lista no encontrada');
    if (!canManageList(list, req.profile)) throw forbidden('Solo el propietario puede eliminar esta lista');
    db.delete(lists).where(eq(lists.id, list.id)).run();
    res.status(204).end();
  }),
);

function toCsv(rows) {
  const header = ['nombre', 'icono', 'tipo_icono', 'comprado', 'tiendas', 'notas', 'orden'];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [r.name, r.icon || '', r.iconType, r.checked ? 'sí' : 'no', r.stores.join(';'), r.notes || '', r.order]
        .map(esc)
        .join(','),
    );
  }
  return lines.join('\n');
}

/**
 * @openapi
 * /lists/{id}/export:
 *   get:
 *     tags: [Listas]
 *     summary: Exporta una lista como CSV o JSON
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: query, name: format, schema: { type: string, enum: [csv, json] } }
 *     responses:
 *       200: { description: Archivo exportado }
 */
listsRouter.get(
  '/:id/export',
  asyncHandler(async (req, res) => {
    const list = loadAccessibleList(req.params.id, req.profile);
    const rows = db
      .select()
      .from(items)
      .where(eq(items.listId, list.id))
      .orderBy(items.checked, items.position)
      .all();
    const data = serializeItems(rows);
    const format = req.query.format === 'csv' ? 'csv' : 'json';
    const safeName = list.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'lista';

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
      return res.send('﻿' + toCsv(data));
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}.json"`);
    res.send(
      JSON.stringify(
        { version: '0.1.0', list: serializeList(list), items: data },
        null,
        2,
      ),
    );
  }),
);
