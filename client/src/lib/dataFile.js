export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const ICON_TYPES = ['emoji', 'icon', 'none'];

function normalize(raw) {
  const iconType = ICON_TYPES.includes(raw.iconType) ? raw.iconType : 'none';
  let stores = [];
  if (Array.isArray(raw.stores)) stores = raw.stores;
  else if (typeof raw.stores === 'string') stores = raw.stores.split(';').map((s) => s.trim());
  return {
    name: (raw.name || '').trim(),
    iconType,
    icon: iconType === 'none' ? null : raw.icon || null,
    notes: raw.notes ? String(raw.notes) : null,
    stores: stores.filter(Boolean),
  };
}

export function parseJsonImport(text) {
  const data = JSON.parse(text);
  const items = Array.isArray(data) ? data : data.items || [];
  return items.map(normalize).filter((i) => i.name);
}

function csvSplit(text) {
  const clean = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQ) {
      if (c === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i++;
        } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function parseCsvImport(text) {
  const rows = csvSplit(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (k) => header.indexOf(k);
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row.length || (row.length === 1 && !row[0].trim())) continue;
    const name = (row[idx('nombre')] || '').trim();
    if (!name) continue;
    out.push(
      normalize({
        name,
        icon: row[idx('icono')],
        iconType: row[idx('tipo_icono')],
        notes: row[idx('notas')],
        stores: row[idx('tiendas')] || '',
      }),
    );
  }
  return out;
}

export function parseImport(text, filename = '') {
  if (filename.toLowerCase().endsWith('.csv')) return parseCsvImport(text);
  try {
    return parseJsonImport(text);
  } catch {
    return parseCsvImport(text);
  }
}
