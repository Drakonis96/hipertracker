import { Check, GripVertical, MoreHorizontal, Pencil, Trash2, FolderInput, StickyNote } from 'lucide-react';
import ProductIcon from './ProductIcon';
import StoreLogo from './StoreLogo';
import Menu from './Menu';
import { cn } from '../lib/cn';

export default function ProductRow({
  item,
  storesById,
  onToggle,
  onEdit,
  onMove,
  onDelete,
  innerRef,
  style,
  handleProps,
  isDragging,
  draggable = false,
}) {
  const stores = (item.stores || []).map((id) => storesById[id]).filter(Boolean);
  const shown = stores.slice(0, 3);
  const extra = stores.length - shown.length;

  return (
    <li
      ref={innerRef}
      style={style}
      className={cn(
        'flex items-center gap-2.5 bg-white px-3 py-2.5 transition-colors dark:bg-zinc-900',
        isDragging && 'relative z-10 rounded-card opacity-90 ht-border shadow-lg',
        item.checked && 'opacity-60',
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={() => onToggle(item)}
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-[1.5px] transition',
          item.checked ? 'border-accent bg-accent text-accent-fg' : 'border-zinc-300 hover:border-accent dark:border-zinc-600',
        )}
        aria-pressed={item.checked}
        aria-label={item.checked ? `Desmarcar ${item.name}` : `Marcar ${item.name} como comprado`}
      >
        {item.checked && <Check size={15} strokeWidth={3} />}
      </button>

      <ProductIcon item={item} size={38} />

      {/* Nombre + notas */}
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-[15px] font-medium', item.checked && 'text-zinc-400 line-through')}>
          {item.name}
        </p>
        {item.notes && (
          <p className="flex items-center gap-1 truncate text-xs text-zinc-400">
            <StickyNote size={11} className="shrink-0" />
            {item.notes}
          </p>
        )}
      </div>

      {/* Logos de tiendas */}
      {shown.length > 0 && (
        <div className="flex shrink-0 items-center -space-x-1">
          {shown.map((s) => (
            <StoreLogo key={s.id} store={s} size={24} className="ring-1 ring-white dark:ring-zinc-900" />
          ))}
          {extra > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] font-semibold text-zinc-500 ring-1 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
              +{extra}
            </span>
          )}
        </div>
      )}

      {/* Menú ··· */}
      <Menu
        trigger={<MoreHorizontal size={20} />}
        items={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(item) },
          { label: 'Mover a otra lista', icon: FolderInput, onClick: () => onMove(item) },
          { label: 'Eliminar', icon: Trash2, danger: true, onClick: () => onDelete(item) },
        ]}
      />

      {/* Handle de arrastre (solo pendientes) */}
      {draggable ? (
        <button
          type="button"
          className="-mr-1 cursor-grab touch-none text-zinc-300 transition hover:text-zinc-500 active:cursor-grabbing dark:text-zinc-600"
          aria-label="Reordenar"
          {...handleProps}
        >
          <GripVertical size={18} />
        </button>
      ) : (
        <span className="w-[18px]" aria-hidden="true" />
      )}
    </li>
  );
}
