import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/useAuth';
import { useData } from './store/useData';
import Toaster from './components/Toaster';
import Spinner from './components/Spinner';
import ProfileSelect from './pages/ProfileSelect';
import MainList from './pages/MainList';
import ManageProducts from './pages/ManageProducts';
import Settings from './pages/Settings';

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
        await useData.getState().loadLists();
        await useData.getState().loadItems();
      } catch {
        /* ignore */
      }
    })();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<MainList />} />
      <Route path="/productos" element={<ManageProducts />} />
      <Route path="/ajustes" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const status = useAuth((s) => s.status);
  const profile = useAuth((s) => s.profile);

  useEffect(() => {
    useAuth.getState().init();
    useData.getState().loadStores().catch(() => {});
  }, []);

  return (
    <>
      <Toaster />
      {status === 'loading' ? (
        <Splash />
      ) : profile ? (
        <AuthedApp />
      ) : (
        <Routes>
          <Route path="*" element={<ProfileSelect />} />
        </Routes>
      )}
    </>
  );
}
