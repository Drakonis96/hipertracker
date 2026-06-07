import { useMemo } from 'react';
import { Search, X, Store as StoreIcon } from 'lucide-react';
import StoreLogo from './StoreLogo';
import { useData } from '../store/useData';
import { hasActiveFilters, NO_STORE } from '../lib/filter';
import { cn } from '../lib/cn';

const STATUS = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'done', label: 'Completados' },
];

export default function FilterBar() {
  const filters = useData((s) => s.filters);
  const setFilter = useData((s) => s.setFilter);
  const toggleStoreFilter = useData((s) => s.toggleStoreFilter);
  const clearFilters = useData((s) => s.clearFilters);
  const storesById = useData((s) => s.storesById);
  const items = useData((s) => s.items);

  // Solo tiendas presentes en la lista actual.
  const { storeChips, hasNone } = useMemo(() => {
    const set = new Set();
    let none = false;
    for (const it of items) {
      if (it.stores.length) it.stores.forEach((s) => set.add(s));
      else none = true;
    }
    const chips = [...set]
      .map((id) => storesById[id])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return { storeChips: chips, hasNone: none };
  }, [items, storesById]);

  const active = hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Búsqueda */}
      <div className="relative">
        <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={filters.q}
          onChange={(e) => setFilter({ q: e.target.value })}
          placeholder="Buscar producto…"
          className="ht-input pl-9 pr-9"
          aria-label="Buscar producto"
        />
        {filters.q && (
          <button
            type="button"
            onClick={() => setFilter({ q: '' })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Borrar búsqueda"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Chips de tiendas */}
      {(storeChips.length > 0 || hasNone) && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          {storeChips.map((s) => {
            const on = filters.stores.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleStoreFilter(s.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-medium transition ht-border',
                  on ? 'border-accent bg-accent/10 text-accent' : 'bg-white dark:bg-zinc-900',
                )}
              >
                <StoreLogo store={s} size={18} />
                {s.name}
              </button>
            );
          })}
          {hasNone && (
            <button
              type="button"
              onClick={() => toggleStoreFilter(NO_STORE)}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition ht-border',
                filters.stores.includes(NO_STORE) ? 'border-accent bg-accent/10 text-accent' : 'bg-white dark:bg-zinc-900',
              )}
            >
              <StoreIcon size={14} className="text-zinc-400" />
              Sin tienda
            </button>
          )}
        </div>
      )}

      {/* Estado + limpiar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 rounded-el bg-zinc-100 p-1 dark:bg-zinc-800">
          {STATUS.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFilter({ status: st.id })}
              className={cn(
                'flex-1 rounded-[6px] py-1.5 text-[13px] font-medium transition',
                filters.status === st.id
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white'
                  : 'text-zinc-500',
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
        {active && (
          <button
            type="button"
            onClick={clearFilters}
            className="shrink-0 whitespace-nowrap rounded-el px-2.5 py-2 text-[13px] font-medium text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
