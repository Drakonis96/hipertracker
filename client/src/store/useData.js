import { create } from 'zustand';
import { api, apiDownload } from '../api/client';

const ACTIVE_KEY = 'hipertracker.activeList';

export const useData = create((set, get) => ({
  stores: [],
  storesById: {},
  lists: [],
  activeListId: localStorage.getItem(ACTIVE_KEY) || null,
  items: [],
  loadingItems: false,
  filters: { q: '', stores: [], status: 'all' }, // status: all | pending | done

  reset: () =>
    set({ lists: [], items: [], activeListId: null, filters: { q: '', stores: [], status: 'all' } }),

  // ---------- catálogo de tiendas ----------
  loadStores: async (force = false) => {
    if (!force && get().stores.length) return get().stores;
    const stores = await api('/stores', { auth: false });
    set({ stores, storesById: Object.fromEntries(stores.map((s) => [s.id, s])) });
    return stores;
  },
  createStore: async (payload) => {
    const store = await api('/stores', { method: 'POST', body: payload });
    await get().loadStores(true);
    return store;
  },
  deleteStore: async (id) => {
    await api(`/stores/${id}`, { method: 'DELETE' });
    await get().loadStores(true);
    await get().loadItems();
  },

  // ---------- copia de seguridad completa ----------
  exportAll: () => apiDownload('/data/export'),
  importAll: async (payload) => {
    const summary = await api('/data/import', { method: 'POST', body: payload });
    await get().loadStores(true);
    await get().loadLists();
    await get().loadItems();
    return summary;
  },

  // ---------- listas ----------
  loadLists: async () => {
    const lists = await api('/lists');
    set({ lists });
    let active = get().activeListId;
    if (!active || !lists.some((l) => l.id === active)) {
      active = lists[0]?.id || null;
      set({ activeListId: active });
      if (active) localStorage.setItem(ACTIVE_KEY, active);
      else localStorage.removeItem(ACTIVE_KEY);
    }
    return lists;
  },

  setActiveList: async (id) => {
    set({ activeListId: id });
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
    await get().loadItems(id);
  },

  createList: async (payload) => {
    const list = await api('/lists', { method: 'POST', body: payload });
    await get().loadLists();
    return list;
  },
  updateList: async (id, patch) => {
    const list = await api(`/lists/${id}`, { method: 'PATCH', body: patch });
    await get().loadLists();
    return list;
  },
  deleteList: async (id) => {
    await api(`/lists/${id}`, { method: 'DELETE' });
    if (get().activeListId === id) {
      set({ activeListId: null });
      localStorage.removeItem(ACTIVE_KEY);
    }
    await get().loadLists();
    await get().loadItems();
  },

  // ---------- productos ----------
  loadItems: async (listId = get().activeListId) => {
    if (!listId) {
      set({ items: [] });
      return [];
    }
    set({ loadingItems: true });
    try {
      const items = await api(`/lists/${listId}/items`);
      set({ items });
      return items;
    } finally {
      set({ loadingItems: false });
    }
  },

  createItem: async (payload, listId = get().activeListId) => {
    const item = await api(`/lists/${listId}/items`, { method: 'POST', body: payload });
    await get().loadItems(listId);
    await get().refreshCounts();
    return item;
  },
  updateItem: async (id, patch, listId = get().activeListId) => {
    const item = await api(`/lists/${listId}/items/${id}`, { method: 'PATCH', body: patch });
    await get().loadItems(listId);
    await get().refreshCounts();
    return item;
  },
  deleteItem: async (id, listId = get().activeListId) => {
    await api(`/lists/${listId}/items/${id}`, { method: 'DELETE' });
    await get().loadItems(listId);
    await get().refreshCounts();
  },
  toggleCheck: async (item) => {
    const prev = get().items;
    set({ items: prev.map((i) => (i.id === item.id ? { ...i, checked: !i.checked } : i)) });
    try {
      await api(`/lists/${item.listId}/items/${item.id}/check`, {
        method: 'PATCH',
        body: { checked: !item.checked },
      });
      await get().loadItems(item.listId);
      await get().refreshCounts();
    } catch (e) {
      set({ items: prev });
      throw e;
    }
  },
  duplicateItem: async (item, listId = get().activeListId) => {
    const copy = await api(`/lists/${listId}/items`, {
      method: 'POST',
      body: {
        name: item.name,
        icon: item.icon,
        iconType: item.iconType,
        notes: item.notes,
        stores: item.stores,
      },
    });
    await get().loadItems(listId);
    await get().refreshCounts();
    return copy;
  },
  reorderItems: async (orderedIds, listId = get().activeListId) => {
    const items = await api(`/lists/${listId}/items/reorder`, {
      method: 'PATCH',
      body: { orderedIds },
    });
    set({ items });
    return items;
  },

  refreshCounts: async () => {
    try {
      const lists = await api('/lists');
      set({ lists });
    } catch {
      /* ignore */
    }
  },

  // ---------- filtros ----------
  setFilter: (patch) => set({ filters: { ...get().filters, ...patch } }),
  toggleStoreFilter: (id) => {
    const cur = get().filters.stores;
    set({
      filters: {
        ...get().filters,
        stores: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
      },
    });
  },
  clearFilters: () => set({ filters: { q: '', stores: [], status: 'all' } }),

  // ---------- exportación ----------
  exportList: (listId, format) => apiDownload(`/lists/${listId}/export?format=${format}`),
}));
