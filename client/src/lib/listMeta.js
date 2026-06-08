import { Lock, Users, UserPlus } from 'lucide-react';

// Icono y etiqueta según el modo de compartir de una lista.
export function listTypeIcon(type) {
  if (type === 'shared') return Users;
  if (type === 'custom') return UserPlus;
  return Lock;
}

export function listTypeLabel(type) {
  if (type === 'shared') return 'Con todos';
  if (type === 'custom') return 'Con algunos';
  return 'Personal';
}
