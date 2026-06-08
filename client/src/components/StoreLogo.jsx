import { cn } from '../lib/cn';
import { badgeColor, initial } from '../lib/colors';

export default function StoreLogo({ store, size = 24, className, title }) {
  if (!store) return null;

  // Tiendas personalizadas (sin logo de archivo): badge con inicial.
  if (!store.logoUrl) {
    return (
      <span
        title={title ?? store.name}
        className={cn('flex items-center justify-center rounded font-semibold text-white', className)}
        style={{ width: size, height: size, background: store.color || badgeColor(store.name), fontSize: size * 0.5 }}
      >
        {initial(store.name)}
      </span>
    );
  }

  return (
    <img
      src={store.logoUrl}
      alt={store.name}
      title={title ?? store.name}
      width={size}
      height={size}
      loading="lazy"
      className={cn('rounded bg-white object-contain ht-border', className)}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}
