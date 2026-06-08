import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import { cn } from '../lib/cn';
import { listTypeIcon } from '../lib/listMeta';
import { useData } from '../store/useData';
import { toast } from '../store/useToast';

// Mueve uno o varios productos a otra lista. `items` es un array.
export default function MoveToListModal({ open, onClose, items = [], onMoved }) {
  const lists = useData((s) => s.lists);
  const updateItem = useData((s) => s.updateItem);
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const sourceListId = items[0]?.listId;

  useEffect(() => {
    if (open) setTarget(null);
  }, [open]);

  const move = async () => {
    if (!target) return;
    setSaving(true);
    try {
      for (const it of items) {
        if (it.listId !== target) {
          await updateItem(it.id, { listId: target }, it.listId);
        }
      }
      toast.success(items.length > 1 ? 'Productos movidos' : 'Producto movido');
      onMoved?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message || 'No se pudo mover');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={items.length > 1 ? `Mover ${items.length} productos` : 'Mover a…'}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="ht-btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="ht-btn-primary" onClick={move} disabled={saving || !target}>
            {saving && <Spinner size={16} />}
            Mover
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-1">
        {lists.map((l) => {
          const Icon = listTypeIcon(l.type);
          const isSource = l.id === sourceListId && items.length === 1;
          return (
            <button
              key={l.id}
              type="button"
              disabled={isSource}
              onClick={() => setTarget(l.id)}
              className={cn(
                'flex items-center gap-2.5 rounded-el px-3 py-2.5 text-left text-sm transition ht-border',
                target === l.id ? 'border-accent bg-accent/10' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800',
                isSource && 'cursor-not-allowed opacity-40',
              )}
            >
              <Icon size={16} className="shrink-0 text-zinc-400" />
              <span className="flex-1 truncate">{l.name}</span>
              {isSource && <span className="text-xs text-zinc-400">Actual</span>}
              {target === l.id && <Check size={16} className="text-accent" />}
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
