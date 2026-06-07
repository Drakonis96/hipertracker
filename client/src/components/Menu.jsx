import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/cn';

// Menú desplegable ligero. items: [{ label, icon: Comp, onClick, danger }]
export default function Menu({ trigger, items, align = 'right', label = 'Más opciones' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ht-icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-30 mt-1 min-w-[180px] overflow-hidden rounded-card bg-white py-1 ht-border animate-pop-in dark:bg-zinc-900',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {items.filter(Boolean).map((it, i) => {
            const Icon = it.icon;
            return (
              <button
                key={i}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  it.onClick?.();
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[15px] transition hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  it.danger ? 'text-red-600 dark:text-red-400' : 'text-zinc-700 dark:text-zinc-200',
                )}
              >
                {Icon && <Icon size={17} className="shrink-0" />}
                <span className="truncate">{it.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
