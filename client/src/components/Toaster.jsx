import { Check, Info, X } from 'lucide-react';
import { useToast } from '../store/useToast';
import { cn } from '../lib/cn';

const ICONS = { success: Check, error: X, info: Info };
const STYLES = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-zinc-900 text-white dark:bg-zinc-700',
};

export default function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex flex-col items-center gap-2 px-4 pb-safe">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              'pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-el px-4 py-2.5 text-sm font-medium shadow-lg animate-fade-in-down',
              STYLES[t.type] || STYLES.info,
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
