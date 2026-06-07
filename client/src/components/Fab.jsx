import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../lib/cn';

export default function Fab({ onClick, label = 'Añadir producto', icon: Icon = Plus }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 40) setVisible(true);
      else if (y > last + 8) setVisible(false);
      else if (y < last - 8) setVisible(true);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}
      className={cn(
        'fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lg transition-all duration-200 animate-scale-in hover:opacity-90 active:scale-95',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-28 opacity-0',
      )}
    >
      <Icon size={26} />
    </button>
  );
}
