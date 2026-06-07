import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Plus } from 'lucide-react';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import PinPad from '../components/PinPad';
import ProfileFormModal from '../components/ProfileFormModal';
import { useAuth } from '../store/useAuth';

export default function ProfileSelect() {
  const profiles = useAuth((s) => s.profiles);
  const profile = useAuth((s) => s.profile);
  const login = useAuth((s) => s.login);
  const navigate = useNavigate();

  const [pinFor, setPinFor] = useState(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const autoTried = useRef(false);

  // Si ya hay sesión, ir a la app.
  useEffect(() => {
    if (profile) navigate('/', { replace: true });
  }, [profile, navigate]);

  // Entrada directa si solo hay un perfil sin PIN.
  useEffect(() => {
    if (autoTried.current || profile) return;
    if (profiles.length === 1 && !profiles[0].hasPin) {
      autoTried.current = true;
      login(profiles[0].id)
        .then(() => navigate('/', { replace: true }))
        .catch(() => {});
    }
  }, [profiles, profile, login, navigate]);

  const select = async (p) => {
    if (p.hasPin) {
      setPin('');
      setPinError('');
      setPinFor(p);
      return;
    }
    try {
      await login(p.id);
      navigate('/', { replace: true });
    } catch (e) {
      setPinError(e.message || 'No se pudo entrar');
    }
  };

  const submitPin = async () => {
    try {
      await login(pinFor.id, pin);
      setPinFor(null);
      navigate('/', { replace: true });
    } catch (e) {
      setPinError(e.message || 'PIN incorrecto, inténtalo de nuevo');
      setPin('');
    }
  };

  const empty = profiles.length === 0;

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 pt-safe">
      <div className="mb-10 flex flex-col items-center gap-3">
        <img src="/logo/hipertracker.png" alt="HiperTracker" className="h-16 w-16 rounded-modal object-contain" />
        <h1 className="text-2xl font-bold tracking-tight">HiperTracker</h1>
        <p className="text-[15px] text-zinc-500">{empty ? 'Crea tu primer perfil para empezar' : 'Elige tu perfil'}</p>
      </div>

      <div className="flex max-w-md flex-wrap items-start justify-center gap-5">
        {profiles.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => select(p)}
            className="group flex w-24 flex-col items-center gap-2.5 transition"
          >
            <div className="relative transition group-hover:scale-105 group-active:scale-95">
              <Avatar profile={p} size={84} />
              {p.hasPin && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-500 ht-border dark:bg-zinc-900">
                  <Lock size={13} />
                </span>
              )}
            </div>
            <span className="w-full truncate text-center text-sm font-medium">{p.name}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex w-24 flex-col items-center gap-2.5 text-zinc-400 transition hover:text-accent"
        >
          <span className="flex h-[84px] w-[84px] items-center justify-center rounded-full border-2 border-dashed border-zinc-300 transition hover:border-accent dark:border-zinc-700">
            <Plus size={32} />
          </span>
          <span className="text-sm font-medium">Añadir perfil</span>
        </button>
      </div>

      {/* PIN */}
      <Modal open={!!pinFor} onClose={() => setPinFor(null)} title={`Hola, ${pinFor?.name || ''}`} size="sm">
        <div className="flex flex-col items-center gap-5 py-2">
          <Avatar profile={pinFor} size={64} />
          <p className="text-sm text-zinc-500">Introduce tu PIN</p>
          <PinPad value={pin} onChange={(v) => { setPin(v); setPinError(''); }} onSubmit={submitPin} min={4} max={6} error={pinError} />
        </div>
      </Modal>

      <ProfileFormModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
