import { useEffect, useState } from 'react';
import { Lock, Users } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import { cn } from '../lib/cn';
import { useData } from '../store/useData';
import { toast } from '../store/useToast';

export default function ListFormModal({ open, onClose, list = null, onSaved }) {
  const createList = useData((s) => s.createList);
  const updateList = useData((s) => s.updateList);
  const setActiveList = useData((s) => s.setActiveList);
  const editing = !!list;

  const [name, setName] = useState('');
  const [type, setType] = useState('personal');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(list?.name || '');
    setType(list?.type || 'personal');
  }, [open, list]);

  const save = async () => {
    if (!name.trim()) {
      toast.error('El nombre de la lista es obligatorio');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateList(list.id, { name: name.trim(), type });
        toast.success('Lista actualizada');
      } else {
        const created = await createList({ name: name.trim(), type });
        await setActiveList(created.id);
        toast.success('Lista creada');
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message || 'No se pudo guardar la lista');
    } finally {
      setSaving(false);
    }
  };

  const TypeOption = ({ id, icon: Icon, title, desc }) => (
    <button
      type="button"
      onClick={() => setType(id)}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 rounded-el px-3 py-3 text-center transition ht-border',
        type === id ? 'border-accent bg-accent/10 text-accent' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800',
      )}
    >
      <Icon size={20} />
      <span className="text-sm font-medium">{title}</span>
      <span className="text-[11px] leading-tight text-zinc-400">{desc}</span>
    </button>
  );

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={editing ? 'Editar lista' : 'Nueva lista'}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="ht-btn-ghost" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="button" className="ht-btn-primary" onClick={save} disabled={saving}>
            {saving && <Spinner size={16} />}
            {editing ? 'Guardar' : 'Crear'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Compra semanal"
            className="ht-input"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && save()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Tipo de lista</label>
          <div className="flex gap-2">
            <TypeOption id="personal" icon={Lock} title="Personal" desc="Solo para ti" />
            <TypeOption id="shared" icon={Users} title="Compartida" desc="Todos los perfiles" />
          </div>
        </div>
      </div>
    </Modal>
  );
}
