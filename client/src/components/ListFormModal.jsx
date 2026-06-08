import { useEffect, useMemo, useState } from 'react';
import { Lock, Users, UserPlus, Check } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import Avatar from './Avatar';
import { cn } from '../lib/cn';
import { useData } from '../store/useData';
import { useAuth } from '../store/useAuth';
import { toast } from '../store/useToast';

export default function ListFormModal({ open, onClose, list = null, onSaved }) {
  const createList = useData((s) => s.createList);
  const updateList = useData((s) => s.updateList);
  const setActiveList = useData((s) => s.setActiveList);
  const profile = useAuth((s) => s.profile);
  const profiles = useAuth((s) => s.profiles);
  const editing = !!list;

  const [name, setName] = useState('');
  const [type, setType] = useState('personal');
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(list?.name || '');
    setType(list?.type || 'personal');
    setMembers(list?.memberIds || []);
  }, [open, list]);

  // El propietario siempre tiene acceso: no aparece como seleccionable.
  const ownerId = list?.ownerId || profile?.id;
  const selectableProfiles = useMemo(
    () => profiles.filter((p) => p.id !== ownerId),
    [profiles, ownerId],
  );

  const toggleMember = (id) =>
    setMembers((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  const save = async () => {
    if (!name.trim()) {
      toast.error('El nombre de la lista es obligatorio');
      return;
    }
    const payload = {
      name: name.trim(),
      type,
      memberIds: type === 'custom' ? members : [],
    };
    setSaving(true);
    try {
      if (editing) {
        await updateList(list.id, payload);
        toast.success('Lista actualizada');
      } else {
        const created = await createList(payload);
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
        'flex flex-1 flex-col items-center gap-1 rounded-el px-2 py-3 text-center transition ht-border',
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
            onKeyDown={(e) => e.key === 'Enter' && type !== 'custom' && save()}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Compartir</label>
          <div className="flex gap-2">
            <TypeOption id="personal" icon={Lock} title="Personal" desc="Solo para ti" />
            <TypeOption id="shared" icon={Users} title="Con todos" desc="Todos los perfiles" />
            <TypeOption id="custom" icon={UserPlus} title="Concretos" desc="Perfiles que elijas" />
          </div>
        </div>

        {type === 'custom' && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">
              ¿Con qué perfiles la compartes?
            </label>
            {selectableProfiles.length === 0 ? (
              <p className="rounded-el px-3 py-3 text-sm text-zinc-400 ht-border">
                No hay otros perfiles con los que compartir.
              </p>
            ) : (
              <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-el p-1 ht-border">
                {selectableProfiles.map((p) => {
                  const checked = members.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleMember(p.id)}
                      className="flex items-center gap-3 rounded-el px-2 py-1.5 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <Avatar profile={p} size={32} />
                      <span className="flex-1 truncate text-sm">{p.name}</span>
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-[5px] border-[0.5px] transition',
                          checked ? 'border-accent bg-accent text-accent-fg' : 'border-zinc-300 dark:border-zinc-600',
                        )}
                      >
                        {checked && <Check size={14} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
