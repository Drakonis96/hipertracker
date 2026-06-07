import { getIconComponent } from '../data/icons';
import { badgeColor, initial } from '../lib/colors';
import { cn } from '../lib/cn';

export default function ProductIcon({ item, size = 38, className }) {
  const dims = { width: size, height: size };

  if (item.iconType === 'emoji' && item.icon) {
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center rounded-el bg-zinc-100 dark:bg-zinc-800', className)}
        style={dims}
      >
        <span style={{ fontSize: size * 0.56, lineHeight: 1 }}>{item.icon}</span>
      </div>
    );
  }

  if (item.iconType === 'icon' && item.icon) {
    const Comp = getIconComponent(item.icon);
    if (Comp) {
      return (
        <div
          className={cn('flex shrink-0 items-center justify-center rounded-el bg-accent/10 text-accent', className)}
          style={dims}
        >
          <Comp size={Math.round(size * 0.56)} strokeWidth={2} />
        </div>
      );
    }
  }

  // Sin icono → inicial en badge de color generado.
  const color = badgeColor(item.name);
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-el font-semibold text-white', className)}
      style={{ ...dims, background: color }}
    >
      <span style={{ fontSize: size * 0.42, lineHeight: 1 }}>{initial(item.name)}</span>
    </div>
  );
}
