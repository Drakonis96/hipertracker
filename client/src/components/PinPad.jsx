import { Check, Delete } from 'lucide-react';
import { cn } from '../lib/cn';

// Teclado numérico para introducir/definir PIN.
export default function PinPad({ value, onChange, onSubmit, min = 4, max = 6, error }) {
  const press = (d) => {
    if (value.length < max) onChange(value + d);
  };
  const del = () => onChange(value.slice(0, -1));

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Indicador de dígitos */}
      <div className="flex gap-2.5">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-3 w-3 rounded-full transition',
              i < value.length ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700',
              error && 'animate-pulse',
            )}
          />
        ))}
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}

      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => press(String(n))}
            className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium transition ht-border hover:bg-zinc-100 active:scale-95 dark:hover:bg-zinc-800"
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={del}
          disabled={!value.length}
          className="flex h-16 w-16 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-100 active:scale-95 disabled:opacity-30 dark:hover:bg-zinc-800"
          aria-label="Borrar"
        >
          <Delete size={24} />
        </button>
        <button
          type="button"
          onClick={() => press('0')}
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl font-medium transition ht-border hover:bg-zinc-100 active:scale-95 dark:hover:bg-zinc-800"
        >
          0
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={value.length < min}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-fg transition active:scale-95 disabled:opacity-30"
          aria-label="Confirmar"
        >
          <Check size={26} />
        </button>
      </div>
    </div>
  );
}
