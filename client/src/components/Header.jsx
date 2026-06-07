import { useState } from 'react';
import { Link } from 'react-router-dom';
import ListSwitcher from './ListSwitcher';
import ProfileMenu from './ProfileMenu';
import ListFormModal from './ListFormModal';

export default function Header() {
  const [newListOpen, setNewListOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b-[0.5px] border-zinc-200 bg-white/85 backdrop-blur-md pt-safe dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-3">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img src="/logo/hipertracker.png" alt="HiperTracker" className="h-8 w-8 rounded-el object-contain" />
            <span className="text-[15px] font-semibold tracking-tight">HiperTracker</span>
          </Link>
          <div className="flex items-center gap-1">
            <ListSwitcher onNewList={() => setNewListOpen(true)} />
            <ProfileMenu />
          </div>
        </div>
      </header>
      <ListFormModal open={newListOpen} onClose={() => setNewListOpen(false)} />
    </>
  );
}
