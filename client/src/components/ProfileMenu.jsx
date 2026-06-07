import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, LogOut, Power, Settings as SettingsIcon } from 'lucide-react';
import Avatar from './Avatar';
import { useAuth } from '../store/useAuth';

export default function ProfileMenu() {
  const profile = useAuth((s) => s.profile);
  const logout = useAuth((s) => s.logout);
  const signOut = useAuth((s) => s.signOut);
  const gateEnabled = useAuth((s) => s.gateEnabled);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const items = [
    { label: 'Gestionar productos', icon: ListChecks, onClick: () => go('/productos') },
    { label: 'Ajustes', icon: SettingsIcon, onClick: () => go('/ajustes') },
    { label: 'Cambiar de perfil', icon: LogOut, onClick: () => { setOpen(false); logout(); navigate('/'); } },
    // Cierre de sesión completo (incluye el login de la app), solo si está activo.
    gateEnabled && { label: 'Cerrar sesión', icon: Power, danger: true, onClick: () => { setOpen(false); signOut(); } },
  ].filter(Boolean);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition focus:outline-none focus:ring-2 focus:ring-accent/40"
        aria-label="Menú de perfil"
        aria-haspopup="menu"
      >
        <Avatar profile={profile} size={34} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-card bg-white py-1 ht-border animate-pop-in dark:bg-zinc-900"
        >
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <Avatar profile={profile} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{profile?.name}</p>
              <p className="text-xs text-zinc-400">{profile?.isAdmin ? 'Administrador' : 'Perfil'}</p>
            </div>
          </div>
          <div className="my-1 border-t-[0.5px] border-zinc-200 dark:border-zinc-800" />
          {items.map((it, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={it.onClick}
              className={
                'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-[15px] transition ' +
                (it.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                  : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800')
              }
            >
              <it.icon size={17} />
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
