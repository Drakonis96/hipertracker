import { cn } from '../lib/cn';
import { initial } from '../lib/colors';

export default function Avatar({ profile, size = 44, className }) {
  const dims = { width: size, height: size };
  if (profile?.avatar) {
    return (
      <div
        className={cn('flex shrink-0 items-center justify-center rounded-full', className)}
        style={{ ...dims, background: (profile.color || '#10b981') + '22' }}
      >
        <span style={{ fontSize: size * 0.5, lineHeight: 1 }}>{profile.avatar}</span>
      </div>
    );
  }
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', className)}
      style={{ ...dims, background: profile?.color || '#10b981' }}
    >
      <span style={{ fontSize: size * 0.42, lineHeight: 1 }}>{initial(profile?.name)}</span>
    </div>
  );
}
