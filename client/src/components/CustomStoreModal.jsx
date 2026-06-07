import { useEffect, useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import { cn } from '../lib/cn';
import { ACCENT_PALETTE, initial, badgeColor } from '../lib/colors';
import { useData } from '../store/useData';
import { toast } from '../store/useToast';

export default function CustomStoreModal({ open, onClose, onSaved }) {
  const createStore = useData((s) => s.createStore);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#e11d48');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setColor('#e11d48');
    }
  }, [open]);

  const save = async () => {
    if (!name.trim()) {
      toast.error('El nombre de la tienda es obligatorio');
      return;
    }
    setSaving(true);
    try {
      await createStore({ name: name.trim(), color });
      toast.success('Tienda añadida');
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message || 'No se pudo crear la tienda');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title="Nueva tienda personalizada"
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="ht-btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="ht-btn-primary" onClick={save} disabled={saving}>
            {saving && <Spinner size={16} />}
            Crear
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-el text-xl font-semibold text-white"
            style={{ background: color || badgeColor(name) }}
          >
            {initial(name)}
          </span>
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Frutería del barrio"
              className="ht-input"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Color</label>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PALETTE.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                title={c.name}
                className={cn('h-8 w-8 rounded-full transition', color === c.hex && 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900')}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-400">
          Las tiendas personalizadas no tienen logo: se muestran con la inicial sobre el color elegido.
        </p>
      </div>
    </Modal>
  );
}
