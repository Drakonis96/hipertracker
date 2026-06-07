import { inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import { itemStores } from '../db/schema.js';

// Perfil para uso autenticado (sin exponer el hash del PIN).
export function serializeProfile(p) {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
    hasPin: !!p.pinHash,
    isAdmin: !!p.isAdmin,
    accentColor: p.accentColor,
    theme: p.theme,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

// Versión pública para la pantalla de selección (antes del login).
export function publicProfile(p) {
  return {
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    color: p.color,
    hasPin: !!p.pinHash,
    isAdmin: !!p.isAdmin,
  };
}

export function serializeList(l, extra = {}) {
  return {
    id: l.id,
    name: l.name,
    type: l.type,
    ownerId: l.ownerId,
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
    ...extra,
  };
}

export function serializeItem(item, storeIds = []) {
  return {
    id: item.id,
    name: item.name,
    icon: item.icon,
    iconType: item.iconType,
    stores: storeIds,
    listId: item.listId,
    checked: !!item.checked,
    order: item.position,
    notes: item.notes,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// Resuelve las tiendas de varios items con una sola consulta.
export function serializeItems(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const links = db.select().from(itemStores).where(inArray(itemStores.itemId, ids)).all();
  const byItem = new Map();
  for (const link of links) {
    if (!byItem.has(link.itemId)) byItem.set(link.itemId, []);
    byItem.get(link.itemId).push(link.storeId);
  }
  return rows.map((r) => serializeItem(r, byItem.get(r.id) || []));
}
