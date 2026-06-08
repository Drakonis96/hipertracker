import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/cn';

// Menú desplegable. Se renderiza en un portal con posición fija para que NO lo
// recorte ningún contenedor con overflow-hidden (p. ej. la tarjeta de la lista),
// y se abre hacia arriba si no hay espacio debajo.
// items: [{ label, icon: Comp, onClick, danger }]
export default function Menu({ trigger, items, align = 'right', label = 'Más opciones' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const menuRef = useRef(null);
  const MENU_W = 210;
  const list = items.filter(Boolean);

  const place = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const estH = list.length * 44 + 8;
    const openUp = r.bottom + 4 + estH > vh - 8 && r.top - estH - 4 > 8;
    const top = openUp ? Math.max(8, r.top - estH - 4) : r.bottom + 4;
    let left = align === 'right' ? r.right - MENU_W : r.left;
    left = Math.max(8, Math.min(left, vw - MENU_W - 8));
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (open) place();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    const onMove = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ht-icon-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_W }}
            className="z-[200] overflow-hidden rounded-card bg-white py-1 shadow-lg ht-border animate-pop-in dark:bg-zinc-900"
          >
            {list.map((it, i) => {
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
                    'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[15px] transition',
                    it.danger
                      ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800',
                  )}
                >
                  {Icon && <Icon size={17} className="shrink-0" />}
                  <span className="truncate">{it.label}</span>
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
