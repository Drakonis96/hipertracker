import { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import Modal from './Modal';
import Spinner from './Spinner';
import Avatar from './Avatar';
import PinPad from './PinPad';
import { cn } from '../lib/cn';
import { ACCENT_PALETTE } from '../lib/colors';
import { useAuth } from '../store/useAuth';
import { toast } from '../store/useToast';

const AVATAR_EMOJIS = [
  '🦊', '🐶', '🐱', '🐼', '🐵', '🦁', '🐯', '🐸',
  '🐧', '🐰', '🦄', '🐢', '🐙', '🦉', '🐝', '🦋',
  '🌸', '🌟', '⚡', '🍀', '🍉', '🚀', '🎈', '🎮',
  '⚽', '🎸', '👑', '🤖', '👻', '😎', '🐲', '🦖',
];

export default function ProfileFormModal({ open, onClose, profile = null, onSaved }) {
  const createProfile = useAuth((s) => s.createProfile);
  const updateProfile = useAuth((s) => s.updateProfile);
  const editing = !!profile;

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [color, setColor] = useState('#10b981');
  const [pinMode, setPinMode] = useState('keep'); // keep | set | remove
  const [pin, setPin] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(profile?.name || '');
    setAvatar(profile?.avatar || null);
    setColor(profile?.color || '#10b981');
    setPinMode('keep');
    setPin('');
  }, [open, profile]);

  const save = async () => {
    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (pinMode === 'set' && (pin.length < 4 || pin.length > 6)) {
      toast.error('El PIN debe tener entre 4 y 6 dígitos');
      return;
    }
    setSaving(true);
    try {
      const payload = { name: name.trim(), avatar, color };
      if (pinMode === 'set') payload.pin = pin;
      if (pinMode === 'remove') payload.pin = null;
      if (editing) {
        await updateProfile(profile.id, payload);
        toast.success('Perfil actualizado');
      } else {
        await createProfile(payload);
        toast.success('Perfil creado');
      }
      onSaved?.();
      onClose?.();
    } catch (e) {
      toast.error(e.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const previewProfile = { name: name || '?', avatar, color };

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={editing ? 'Editar perfil' : 'Nuevo perfil'}
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
      <div className="flex flex-col gap-5">
        {/* Vista previa + nombre */}
        <div className="flex items-center gap-3">
          <Avatar profile={previewProfile} size={56} />
          <div className="flex-1">
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="ht-input" autoFocus />
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Avatar</label>
          <div className="grid grid-cols-8 gap-1.5">
            <button
              type="button"
              onClick={() => setAvatar(null)}
              className={cn(
                'flex aspect-square items-center justify-center rounded-el text-xs font-semibold transition ht-border',
                !avatar ? 'border-accent bg-accent/10 text-accent' : 'text-zinc-400',
              )}
              title="Usar inicial"
            >
              Aa
            </button>
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setAvatar(e)}
                className={cn(
                  'flex aspect-square items-center justify-center rounded-el text-xl transition hover:bg-zinc-100 dark:hover:bg-zinc-800',
                  avatar === e && 'ring-2 ring-accent',
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
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

        {/* PIN */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-300">PIN</label>
          {pinMode === 'set' ? (
            <div className="rounded-card p-3 ht-border">
              <p className="mb-3 text-center text-sm text-zinc-500">Introduce un PIN de 4 a 6 dígitos</p>
              <PinPad value={pin} onChange={setPin} onSubmit={() => {}} min={4} max={6} />
              <button
                type="button"
                onClick={() => {
                  setPinMode('keep');
                  setPin('');
                }}
                className="mt-3 w-full text-center text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                Cancelar PIN
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {editing && profile?.hasPin && pinMode !== 'remove' ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10">
                    <ShieldCheck size={14} /> Protegido con PIN
                  </span>
                  <button type="button" className="ht-btn-subtle px-3 py-1.5 text-sm" onClick={() => setPinMode('set')}>
                    <KeyRound size={15} /> Cambiar
                  </button>
                  <button type="button" className="ht-btn-subtle px-3 py-1.5 text-sm" onClick={() => setPinMode('remove')}>
                    <ShieldOff size={15} /> Quitar
                  </button>
                </>
              ) : pinMode === 'remove' ? (
                <span className="inline-flex items-center gap-2 text-sm text-red-500">
                  <ShieldOff size={15} /> Se eliminará el PIN al guardar
                  <button type="button" className="underline" onClick={() => setPinMode('keep')}>
                    Deshacer
                  </button>
                </span>
              ) : (
                <button type="button" className="ht-btn-subtle px-3 py-1.5 text-sm" onClick={() => setPinMode('set')}>
                  <KeyRound size={15} /> Proteger con PIN
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
