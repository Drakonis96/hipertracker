import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import Modal from './Modal';
import { cn } from '../lib/cn';
import { EMOJI_CATEGORIES, searchEmojis } from '../data/emojis';
import { ICON_CATEGORIES, searchIcons, getIconComponent } from '../data/icons';
import { badgeColor, initial } from '../lib/colors';

const TABS = [
  { id: 'emojis', label: 'Emojis' },
  { id: 'iconos', label: 'Iconos' },
  { id: 'sin', label: 'Sin icono' },
];

function CategoryChips({ categories, value, onChange }) {
  return (
    <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      <button
        type="button"
        onClick={() => onChange('all')}
        className={cn(
          'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition',
          value === 'all' ? 'bg-accent text-accent-fg' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
        )}
      >
        Todos
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          type="button"
          onClick={() => onChange(c.id)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition',
            value === c.id ? 'bg-accent text-accent-fg' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export default function IconPicker({ open, onClose, value, onSelect, productName = '' }) {
  const [tab, setTab] = useState(value?.iconType === 'icon' ? 'iconos' : 'emojis');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');

  const emojiResults = useMemo(() => (tab === 'emojis' ? searchEmojis(q, cat) : []), [tab, q, cat]);
  const iconResults = useMemo(() => (tab === 'iconos' ? searchIcons(q, cat) : []), [tab, q, cat]);

  const switchTab = (t) => {
    setTab(t);
    setQ('');
    setCat('all');
  };

  const pick = (payload) => {
    onSelect?.(payload);
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Elige un icono" size="md">
      <div className="flex flex-col">
        {/* Pestañas */}
        <div className="mb-3 flex rounded-el bg-zinc-100 p-1 dark:bg-zinc-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={cn(
                'flex-1 rounded-[6px] py-1.5 text-sm font-medium transition',
                tab === t.id ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white' : 'text-zinc-500',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== 'sin' && (
          <div className="sticky top-0 z-10 -mx-1 mb-2 bg-white px-1 pb-2 dark:bg-zinc-900">
            <div className="relative mb-2">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tab === 'emojis' ? 'Buscar emoji…' : 'Buscar icono…'}
                className="ht-input pl-9"
                autoFocus
              />
            </div>
            <CategoryChips
              categories={tab === 'emojis' ? EMOJI_CATEGORIES : ICON_CATEGORIES}
              value={cat}
              onChange={setCat}
            />
          </div>
        )}

        {tab === 'emojis' && (
          <div className="grid grid-cols-7 gap-1 sm:grid-cols-8">
            {emojiResults.map((e) => (
              <button
                key={e.emoji}
                type="button"
                title={e.keywords}
                onClick={() => pick({ iconType: 'emoji', icon: e.emoji })}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-el text-2xl transition hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  value?.iconType === 'emoji' && value?.icon === e.emoji && 'ring-2 ring-accent',
                )}
              >
                {e.emoji}
              </button>
            ))}
            {emojiResults.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-zinc-400">Sin resultados</p>
            )}
          </div>
        )}

        {tab === 'iconos' && (
          <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
            {iconResults.map((i) => {
              const Comp = getIconComponent(i.name);
              if (!Comp) return null;
              const selected = value?.iconType === 'icon' && value?.icon === i.name;
              return (
                <button
                  key={i.name}
                  type="button"
                  title={i.keywords}
                  onClick={() => pick({ iconType: 'icon', icon: i.name })}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-el text-zinc-700 transition hover:bg-accent/10 hover:text-accent dark:text-zinc-200',
                    selected && 'bg-accent/10 text-accent ring-2 ring-accent',
                  )}
                >
                  <Comp size={22} />
                </button>
              );
            })}
            {iconResults.length === 0 && (
              <p className="col-span-full py-8 text-center text-sm text-zinc-400">Sin resultados</p>
            )}
          </div>
        )}

        {tab === 'sin' && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-card text-3xl font-semibold text-white"
              style={{ background: badgeColor(productName) }}
            >
              {initial(productName)}
            </div>
            <p className="max-w-xs text-sm text-zinc-500 dark:text-zinc-400">
              Se usará la inicial del nombre del producto en un badge de color generado automáticamente.
            </p>
            <button type="button" className="ht-btn-primary" onClick={() => pick({ iconType: 'none', icon: null })}>
              Usar sin icono
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
