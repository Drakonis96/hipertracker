import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../lib/cn';

export default function Modal({ open, onClose, title, children, footer, size = 'md', closeLabel = 'Cerrar' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          'relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-modal bg-white animate-sheet-up dark:bg-zinc-900',
          'ht-border sm:max-h-[88vh] sm:rounded-modal sm:animate-pop-in pb-safe',
          sizes[size],
        )}
      >
        {title !== undefined && (
          <div className="flex items-center justify-between gap-3 border-b-[0.5px] border-zinc-200 px-4 py-3.5 dark:border-zinc-800">
            <h2 className="truncate text-base font-semibold">{title}</h2>
            <button type="button" onClick={onClose} className="ht-icon-btn -mr-1" aria-label={closeLabel}>
              <X size={20} />
            </button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="border-t-[0.5px] border-zinc-200 px-4 py-3 dark:border-zinc-800">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
