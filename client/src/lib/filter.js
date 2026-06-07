export const NO_STORE = '__none__';

// Aplica búsqueda + filtro de tiendas + estado a una lista de productos.
export function filterItems(items, filters) {
  const q = (filters.q || '').trim().toLowerCase();
  const stores = filters.stores || [];
  const wantNone = stores.includes(NO_STORE);
  const realStores = stores.filter((s) => s !== NO_STORE);
  const status = filters.status || 'all';

  return items.filter((item) => {
    if (q && !item.name.toLowerCase().includes(q)) return false;
    if (stores.length) {
      const matchStore = realStores.length && item.stores.some((s) => realStores.includes(s));
      const matchNone = wantNone && item.stores.length === 0;
      if (!matchStore && !matchNone) return false;
    }
    if (status === 'pending' && item.checked) return false;
    if (status === 'done' && !item.checked) return false;
    return true;
  });
}

export function hasActiveFilters(filters) {
  return !!(filters.q || (filters.stores && filters.stores.length) || filters.status !== 'all');
}
