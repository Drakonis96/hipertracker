import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/useAuth';
import { useData } from './store/useData';
import Toaster from './components/Toaster';
import Spinner from './components/Spinner';
import GateLogin from './pages/GateLogin';
import ProfileSelect from './pages/ProfileSelect';
import MainList from './pages/MainList';
import ManageProducts from './pages/ManageProducts';
import Settings from './pages/Settings';
import RefreshFab from './components/RefreshFab';

function Splash() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <img src="/logo/hipertracker.png" alt="HiperTracker" className="h-16 w-16 animate-pop-in rounded-modal object-contain" />
      <Spinner size={22} className="text-accent" />
    </div>
  );
}

function AuthedApp() {
  useEffect(() => {
    (async () => {
      try {
        await useData.getState().loadStores(true);
        await useData.getState().loadLists();
        await useData.getState().loadItems();
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<MainList />} />
        <Route path="/productos" element={<ManageProducts />} />
        <Route path="/ajustes" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <RefreshFab />
    </>
  );
}

export default function App() {
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);
  const gateEnabled = useAuth((s) => s.gateEnabled);
  const gateAuthed = useAuth((s) => s.gateAuthed);

  useEffect(() => {
    useAuth.getState().bootstrap();
  }, []);

  let view;
  if (status === 'loading') view = <Splash />;
  else if (gateEnabled && !gateAuthed) view = <GateLogin />;
  else if (profile) view = <AuthedApp />;
  else
    view = (
      <Routes>
        <Route path="*" element={<ProfileSelect />} />
      </Routes>
    );

  return (
    <>
      <Toaster />
      {view}
    </>
  );
}
