import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../store/useAuth';
import Spinner from '../components/Spinner';

export default function GateLogin() {
  const gateLogin = useAuth((s) => s.gateLogin);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      await gateLogin(username, password);
    } catch (err) {
      setError(err.message || 'Usuario o contraseña incorrectos');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12 pt-safe">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <img src="/logo/hipertracker.png" alt="HiperTracker" className="h-16 w-16 rounded-modal object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">HiperTracker</h1>
          <p className="flex items-center gap-1.5 text-sm text-zinc-500">
            <Lock size={14} /> Acceso restringido
          </p>
        </div>

        <div className="ht-card flex flex-col gap-3 p-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Usuario</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="username"
              className="ht-input"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-600 dark:text-zinc-300">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="ht-input"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="ht-btn-primary mt-1" disabled={loading || !username || !password}>
            {loading && <Spinner size={16} />}
            Entrar
          </button>
        </div>

        <p className="mt-4 text-center text-xs text-zinc-400">
          Tus credenciales viajan cifradas y no se almacenan en el servidor.
        </p>
      </form>
    </div>
  );
}
