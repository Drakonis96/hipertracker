import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { db } from '../db/index.js';
import { customStores } from '../db/schema.js';

// Nombres legibles para los slugs conocidos. Si falta uno, se genera por defecto.
const NICE_NAMES = {
  ahorramas: 'Ahorramas',
  alcampo: 'Alcampo',
  aldi: 'Aldi',
  carrefour: 'Carrefour',
  dia: 'Dia',
  ecofamilia: 'Ecofamilia',
  elcorteingles: 'El Corte Inglés',
  eroski: 'Eroski',
  hiperusera: 'Hiper Usera',
  ladespensa: 'La Despensa',
  lidl: 'Lidl',
  lupa: 'Lupa',
  mercadona: 'Mercadona',
  merkocash: 'Merko Cash',
  primaprix: 'Primaprix',
  supeco: 'Supeco',
  bershka: 'Bershka',
  'c-a': 'C&A',
  'casa-del-libro': 'Casa del Libro',
  decimas: 'Décimas',
  deichmann: 'Deichmann',
  game: 'GAME',
  ikea: 'IKEA',
  'jack-jones': 'Jack & Jones',
  jd: 'JD Sports',
  joma: 'Joma',
  juguettos: 'Juguettos',
  lefties: 'Lefties',
  leroymerlin: 'Leroy Merlin',
  mediamarkt: 'MediaMarkt',
  merkal: 'Merkal',
  pepco: 'Pepco',
  primark: 'Primark',
  primor: 'Primor',
  'pull-bear': 'Pull & Bear',
  womensecret: "Women'secret",
  zara: 'Zara',
};

// Colores de marca opcionales para tintes en la UI.
const BRAND_COLORS = {
  mercadona: '#00984a',
  lidl: '#0050aa',
  carrefour: '#004e9f',
  aldi: '#001e64',
  dia: '#e2001a',
  eroski: '#e30613',
  alcampo: '#e2001a',
  elcorteingles: '#1d1d1b',
  ikea: '#0058a3',
  zara: '#000000',
  mediamarkt: '#df0000',
  leroymerlin: '#78be20',
  primark: '#00679a',
  bershka: '#000000',
};

const CATEGORY_LABELS = {
  supermercados: 'Supermercado',
  otras: 'Otra tienda',
};

const OK_EXT = new Set(['.svg', '.png', '.jpg', '.jpeg', '.webp']);

function prettify(slug) {
  return slug
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

let cache = null;

// Tiendas personalizadas creadas por el usuario (sin logo de archivo).
export function getCustomStores() {
  return db
    .select()
    .from(customStores)
    .all()
    .map((c) => ({
      id: c.id,
      name: c.name,
      logoUrl: null,
      color: c.color || null,
      category: 'personalizada',
      categoryLabel: 'Personalizada',
      custom: true,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function loadStores() {
  const byId = new Map();
  for (const category of ['supermercados', 'otras']) {
    const dir = path.join(config.paths.logosDir, category);
    let files = [];
    try {
      files = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!OK_EXT.has(ext)) continue;
      const id = path.basename(file, ext);
      if (byId.has(id)) continue; // dedup: gana la primera categoría (supermercados)
      byId.set(id, {
        id,
        name: NICE_NAMES[id] || prettify(id),
        logoUrl: `/logos/${category}/${file}`,
        color: BRAND_COLORS[id] || null,
        category,
        categoryLabel: CATEGORY_LABELS[category],
      });
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

// Tiendas del sistema (logos en disco), cacheadas.
export function getSystemStores() {
  if (!cache) cache = loadStores();
  return cache;
}

// Catálogo completo = tiendas del sistema + personalizadas (BD).
export function getStores() {
  return [...getSystemStores(), ...getCustomStores()];
}

export function getStoreMap() {
  return new Map(getStores().map((s) => [s.id, s]));
}

export function isValidStoreId(id) {
  return getStoreMap().has(id);
}

// Permite recargar tras cambios en disco (logos personalizados).
export function refreshStores() {
  cache = loadStores();
  return cache;
}
