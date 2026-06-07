import { useMemo, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import StoreLogo from './StoreLogo';
import { cn } from '../lib/cn';

export default function StoreSelector({ stores, value = [], onChange }) {
  const [q, setQ] = useState('');

  const selectedStores = useMemo(
    () => value.map((id) => stores.find((s) => s.id === id)).filter(Boolean),
    [value, stores],
  );

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = stores.filter((s) => !needle || s.name.toLowerCase().includes(needle));
    const byCat = {};
    for (const s of filtered) {
      (byCat[s.categoryLabel] ||= []).push(s);
    }
    return Object.entries(byCat);
  }, [stores, q]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  return (
    <div className="flex flex-col gap-2">
      {selectedStores.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedStores.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 py-1 pl-1 pr-2 text-xs font-medium dark:bg-zinc-800"
            >
              <StoreLogo store={s} size={18} />
              {s.name}
              <button type="button" onClick={() => toggle(s.id)} aria-label={`Quitar ${s.name}`}>
                <X size={13} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar tienda…"
          className="ht-input pl-9"
        />
      </div>

      <div className="max-h-56 overflow-y-auto rounded-el ht-border">
        {groups.map(([label, list]) => (
          <div key={label}>
            <div className="sticky top-0 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:bg-zinc-800/80">
              {label}
            </div>
            {list.map((s) => {
              const checked = value.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggle(s.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                >
                  <StoreLogo store={s} size={26} />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-[5px] border-[0.5px] transition',
                      checked ? 'border-accent bg-accent text-accent-fg' : 'border-zinc-300 dark:border-zinc-600',
                    )}
                  >
                    {checked && <Check size={14} />}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
        {groups.length === 0 && <p className="px-3 py-6 text-center text-sm text-zinc-400">Sin resultados</p>}
      </div>
    </div>
  );
}
