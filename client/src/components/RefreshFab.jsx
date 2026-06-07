import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useData } from '../store/useData';
import { useAuth } from '../store/useAuth';
import { toast } from '../store/useToast';
import { cn } from '../lib/cn';

// Botón flotante (esquina inferior izquierda) para forzar una recarga de datos
// desde el servidor por si algo se queda desincronizado. Presente en todas las
// secciones de la app.
export default function RefreshFab() {
  const [spinning, setSpinning] = useState(false);

  const refresh = async () => {
    if (spinning) return;
    setSpinning(true);
    try {
      await useData.getState().loadStores(true);
      await useAuth.getState().loadProfiles();
      await useData.getState().loadLists();
      await useData.getState().loadItems();
      toast.success('Actualizado desde el servidor');
    } catch (e) {
      toast.error(e.message || 'No se pudo actualizar');
    } finally {
      setSpinning(false);
    }
  };

  return (
    <button
      type="button"
      onClick={refresh}
      aria-label="Actualizar desde el servidor"
      title="Actualizar desde el servidor"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      className={cn(
        'fixed left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-600 shadow-lg transition ht-border',
        'hover:bg-zinc-50 active:scale-95 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
      )}
    >
      <RefreshCw size={20} className={spinning ? 'animate-spin' : ''} />
    </button>
  );
}
