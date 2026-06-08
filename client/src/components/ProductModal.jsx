import { useEffect, useMemo, useState } from 'react';
import { Pencil } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import ProductIcon from './ProductIcon';
import IconPicker from './IconPicker';
import StoreSelector from './StoreSelector';
import { suggestEmojis } from '../data/emojis';
import { cn } from '../lib/cn';
import { useData } from '../store/useData';
import { toast } from '../store/useToast';

const EMPTY = { name: '', iconType: 'none', icon: null, stores: [], notes: '' };

export default function ProductModal({ open, onClose, item = null, listId, onSaved }) {
  const stores = useData((s) => s.stores);
  const lists = useData((s) => s.lists);
  const createItem = useData((s) => s.createItem);
  const updateItem = useData((s) => s.updateItem);

  const editing = !!item;
  const [form, setForm] = useState(EMPTY);
  const [targetList, setTargetList] = useState(listId);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setForm({
        name: item.name,
        iconType: item.iconType,
        icon: item.icon,
        stores: item.stores || [],
        notes: item.notes || '',
      });
      setTargetList(item.listId);
    } else {
      setForm(EMPTY);
      setTargetList(listId);
    }
  }, [open, item, listId]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  // Sugerencias de emoji según el nombre (en español o inglés).
  const suggestions = useMemo(() => suggestEmojis(form.name, 8), [form.name]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        icon: form.icon,
        iconType: form.iconType,
        notes: form.notes.trim() || null,
        stores: form.stores,
      };
      if (editing) {
        await updateItem(item.id, { ...payload, listId: targetList }, item.listId);
        toast.success('Producto actualizado');
      } else {
        await createItem(payload, targetList);
        toast.success('Producto añadido');
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={saving ? undefined : onClose}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="ht-btn-ghost" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="button" className="ht-btn-primary" onClick={handleSave} disabled={saving}>
              {saving && <Spinner size={16} />}
              {editing ? 'Guardar' : 'Añadir'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Nombre + icono */}
          <div className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="group relative shrink-0"
              aria-label="Elige un icono"
            >
              <ProductIcon item={{ ...form, name: form.name || '?' }} size={56} />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg ht-border">
                <Pencil size={12} />
              </span>
            </button>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Ej. Leche semidesnatada"
                className="ht-input"
                autoFocus={!editing}
              />
            </div>
          </div>

          {/* Sugerencias de emoji según el nombre */}
          {suggestions.length > 0 && (
            <div className="-mt-1 flex flex-wrap items-center gap-1.5">
              <span className="mr-0.5 text-xs text-zinc-400">Sugerencias:</span>
              {suggestions.map((s) => {
                const active = form.iconType === 'emoji' && form.icon === s.emoji;
                return (
                  <button
                    key={s.emoji}
                    type="button"
                    onClick={() => set({ iconType: 'emoji', icon: s.emoji })}
                    title={s.keywords}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg text-xl transition ht-border',
                      active ? 'bg-accent/15 ring-2 ring-accent' : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700',
                    )}
                  >
                    {s.emoji}
                  </button>
                );
              })}
            </div>
          )}

          {/* Tiendas */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">
              Selecciona una o más tiendas
            </label>
            <StoreSelector stores={stores} value={form.stores} onChange={(stores) => set({ stores })} />
          </div>

          {/* Lista destino */}
          {lists.length > 1 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Lista</label>
              <select value={targetList || ''} onChange={(e) => setTargetList(e.target.value)} className="ht-input">
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notas */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Notas (opcional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              placeholder="Marca, cantidad, observaciones…"
              rows={2}
              className="ht-input resize-none"
            />
          </div>
        </div>
      </Modal>

      <IconPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        value={{ iconType: form.iconType, icon: form.icon }}
        productName={form.name}
        onSelect={(sel) => set(sel)}
      />
    </>
  );
}
