// Paleta de accent predefinida (>= 12 colores).
export const ACCENT_PALETTE = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Turquesa', hex: '#14b8a6' },
  { name: 'Cian', hex: '#06b6d4' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Fucsia', hex: '#d946ef' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Coral', hex: '#f43f5e' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Ámbar', hex: '#f59e0b' },
  { name: 'Lima', hex: '#84cc16' },
  { name: 'Pizarra', hex: '#64748b' },
  // Segunda fila — tonos intensos / profundos
  { name: 'Carmín', hex: '#b30333' },
  { name: 'Granate', hex: '#9f1239' },
  { name: 'Caoba', hex: '#7c2d12' },
  { name: 'Bronce', hex: '#b45309' },
  { name: 'Mostaza', hex: '#a16207' },
  { name: 'Oliva', hex: '#4d7c0f' },
  { name: 'Bosque', hex: '#047857' },
  { name: 'Petróleo', hex: '#0e7490' },
  { name: 'Azul real', hex: '#1d4ed8' },
  { name: 'Índigo profundo', hex: '#4338ca' },
  { name: 'Berenjena', hex: '#6d28d9' },
  { name: 'Magenta', hex: '#a21caf' },
  { name: 'Vino', hex: '#831843' },
  { name: 'Grafito', hex: '#334155' },
];

export function hexToRgb(hex) {
  let h = (hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (Number.isNaN(n) || h.length !== 6) return { r: 16, g: 185, b: 129 };
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

// Devuelve "255 255 255" o "0 0 0" según el contraste sobre el color dado.
export function contrastRgbString(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '17 17 17' : '255 255 255';
}

// Color de badge determinista a partir de un texto (para "Sin icono").
const BADGE_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
];

export function badgeColor(text) {
  const s = (text || '?').trim();
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  return BADGE_COLORS[hash % BADGE_COLORS.length];
}

export function initial(text) {
  const s = (text || '').trim();
  return s ? s[0].toUpperCase() : '?';
}
