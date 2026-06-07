import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, Plus, Users } from 'lucide-react';
import { useData } from '../store/useData';
import { cn } from '../lib/cn';

export default function ListSwitcher({ onNewList }) {
  const lists = useData((s) => s.lists);
  const activeListId = useData((s) => s.activeListId);
  const setActiveList = useData((s) => s.setActiveList);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const active = lists.find((l) => l.id === activeListId);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[40vw] items-center gap-1.5 rounded-el px-2.5 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:max-w-[220px]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {active?.type === 'shared' ? <Users size={15} className="shrink-0 text-zinc-400" /> : <Lock size={15} className="shrink-0 text-zinc-400" />}
        <span className="truncate">{active ? active.name : 'Sin listas'}</span>
        <ChevronDown size={16} className={cn('shrink-0 text-zinc-400 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-30 mt-1 max-h-[70vh] w-64 overflow-y-auto rounded-card bg-white py-1 ht-border animate-pop-in dark:bg-zinc-900"
        >
          {lists.map((l) => {
            const isActive = l.id === activeListId;
            const Icon = l.type === 'shared' ? Users : Lock;
            return (
              <button
                key={l.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setActiveList(l.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Icon size={16} className="shrink-0 text-zinc-400" />
                <span className="flex-1 truncate">{l.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-zinc-400">
                  {l.checkedCount}/{l.itemCount}
                </span>
                {isActive && <Check size={16} className="shrink-0 text-accent" />}
              </button>
            );
          })}
          {lists.length === 0 && <p className="px-3 py-3 text-sm text-zinc-400">No hay listas todavía</p>}
          <div className="my-1 border-t-[0.5px] border-zinc-200 dark:border-zinc-800" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onNewList?.();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium text-accent transition hover:bg-accent/10"
          >
            <Plus size={16} /> Nueva lista
          </button>
        </div>
      )}
    </div>
  );
}
