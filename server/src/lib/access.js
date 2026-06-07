import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { lists } from '../db/schema.js';
import { notFound, forbidden } from './http.js';

export function canAccessList(list, profile) {
  return list.type === 'shared' || list.ownerId === profile.id;
}

// Listas compartidas: cualquiera puede editar contenido.
// Listas personales: solo el propietario.
export function loadAccessibleList(listId, profile) {
  const list = db.select().from(lists).where(eq(lists.id, listId)).get();
  if (!list) throw notFound('Lista no encontrada');
  if (!canAccessList(list, profile)) throw forbidden('No tienes acceso a esta lista');
  return list;
}

// Borrar/renombrar/cambiar tipo de una lista: solo propietario o admin.
export function canManageList(list, profile) {
  return list.ownerId === profile.id || !!profile.isAdmin;
}
