import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { lists, listMembers } from '../db/schema.js';
import { notFound, forbidden } from './http.js';

export function listMemberIds(listId) {
  return db
    .select()
    .from(listMembers)
    .where(eq(listMembers.listId, listId))
    .all()
    .map((m) => m.profileId);
}

function isMember(listId, profileId) {
  return (
    db
      .select()
      .from(listMembers)
      .where(and(eq(listMembers.listId, listId), eq(listMembers.profileId, profileId)))
      .get() != null
  );
}

export function canAccessList(list, profile) {
  if (list.type === 'shared') return true; // compartida con todos
  if (list.ownerId === profile.id) return true; // propietario
  if (profile.isAdmin) return true; // el admin puede ver/gestionar todo
  if (list.type === 'custom') return isMember(list.id, profile.id); // perfiles concretos
  return false;
}

// Listas compartidas/custom: los perfiles con acceso pueden editar el contenido.
// Listas personales: solo el propietario (o admin).
export function loadAccessibleList(listId, profile) {
  const list = db.select().from(lists).where(eq(lists.id, listId)).get();
  if (!list) throw notFound('Lista no encontrada');
  if (!canAccessList(list, profile)) throw forbidden('No tienes acceso a esta lista');
  return list;
}

// Borrar/renombrar/cambiar compartición de una lista: solo propietario o admin.
export function canManageList(list, profile) {
  return list.ownerId === profile.id || !!profile.isAdmin;
}
