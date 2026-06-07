import { cn } from '../lib/cn';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">
          <Icon size={30} strokeWidth={1.75} />
        </div>
      )}
      <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">{title}</h3>
      {description && <p className="mt-1 max-w-xs text-sm text-zinc-500 dark:text-zinc-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
