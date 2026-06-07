import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  Plus,
  Pencil,
  Trash2,
  Lock,
  Users,
  ShieldCheck,
  Download,
  Upload,
  Eraser,
  FileJson,
  FileSpreadsheet,
  ExternalLink,
  KeyRound,
  DatabaseBackup,
  X,
  Store as StoreIcon,
} from 'lucide-react';
import Avatar from '../components/Avatar';
import StoreLogo from '../components/StoreLogo';
import ProfileFormModal from '../components/ProfileFormModal';
import ListFormModal from '../components/ListFormModal';
import CustomStoreModal from '../components/CustomStoreModal';
import ConfirmDialog from '../components/ConfirmDialog';
import { cn } from '../lib/cn';
import { ACCENT_PALETTE } from '../lib/colors';
import { useAuth } from '../store/useAuth';
import { useData } from '../store/useData';
import { useUI } from '../store/useUI';
import { toast } from '../store/useToast';
import { downloadBlob, parseImport } from '../lib/dataFile';

function Section({ title, description, children, action }) {
  return (
    <section>
      <div className="mb-2 flex items-end justify-between px-1">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
          {description && <p className="text-xs text-zinc-400">{description}</p>}
        </div>
        {action}
      </div>
      <div className="ht-card divide-y-[0.5px] divide-zinc-100 overflow-hidden dark:divide-zinc-800">{children}</div>
    </section>
  );
}

const THEMES = [
  { id: 'light', label: 'Claro', icon: Sun },
  { id: 'dark', label: 'Oscuro', icon: Moon },
  { id: 'system', label: 'Automático (sistema)', icon: Monitor },
];

export default function Settings() {
  const profile = useAuth((s) => s.profile);
  const profiles = useAuth((s) => s.profiles);
  const deleteProfile = useAuth((s) => s.deleteProfile);

  const lists = useData((s) => s.lists);
  const stores = useData((s) => s.stores);
  const activeListId = useData((s) => s.activeListId);
  const items = useData((s) => s.items);
  const deleteList = useData((s) => s.deleteList);
  const deleteItem = useData((s) => s.deleteItem);
  const createItem = useData((s) => s.createItem);
  const loadItems = useData((s) => s.loadItems);
  const exportList = useData((s) => s.exportList);
  const deleteStore = useData((s) => s.deleteStore);
  const exportAll = useData((s) => s.exportAll);
  const importAll = useData((s) => s.importAll);

  const theme = useUI((s) => s.theme);
  const accent = useUI((s) => s.accent);
  const setTheme = useUI((s) => s.setTheme);
  const setAccent = useUI((s) => s.setAccent);

  const [profileModal, setProfileModal] = useState({ open: false, profile: null });
  const [listModal, setListModal] = useState({ open: false, list: null });
  const [customStoreOpen, setCustomStoreOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importingAll, setImportingAll] = useState(false);
  const fileRef = useRef(null);
  const backupRef = useRef(null);

  const activeList = lists.find((l) => l.id === activeListId);
  const storesByCat = stores.reduce((acc, s) => {
    (acc[s.categoryLabel] ||= []).push(s);
    return acc;
  }, {});

  const doExport = async (format) => {
    if (!activeList) return;
    try {
      const blob = await exportList(activeList.id, format);
      downloadBlob(blob, `${activeList.name.replace(/[^a-z0-9]+/gi, '_').toLowerCase() || 'lista'}.${format}`);
    } catch (e) {
      toast.error(e.message || 'No se pudo exportar');
    }
  };

  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeList) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = parseImport(text, file.name);
      if (!parsed.length) {
        toast.error('No se encontraron productos en el archivo');
        return;
      }
      for (const it of parsed) await createItem(it, activeList.id);
      toast.success(`${parsed.length} productos importados`);
    } catch (err) {
      toast.error(err.message || 'No se pudo importar');
    } finally {
      setImporting(false);
    }
  };

  const doExportAll = async () => {
    try {
      const blob = await exportAll();
      downloadBlob(blob, 'hipertracker-backup.json');
    } catch (e) {
      toast.error(e.message || 'No se pudo exportar la copia');
    }
  };

  const doImportAll = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImportingAll(true);
    try {
      const payload = JSON.parse(await file.text());
      if (!Array.isArray(payload.lists)) {
        toast.error('El archivo no es una copia válida de HiperTracker');
        return;
      }
      const summary = await importAll(payload);
      toast.success(`Importadas ${summary.lists} listas y ${summary.items} productos`);
    } catch (err) {
      toast.error(err.message || 'No se pudo importar la copia');
    } finally {
      setImportingAll(false);
    }
  };

  return (
    <div className="min-h-full pb-12 pt-safe">
      <header className="sticky top-0 z-30 border-b-[0.5px] border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-2 px-3">
          <Link to="/" className="ht-icon-btn -ml-1" aria-label="Volver">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-semibold">Ajustes</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-5">
        {/* Apariencia */}
        <Section title="Apariencia" description="Se guarda en tu perfil">
          <div className="p-3">
            <p className="mb-2 text-sm font-medium">Tema</p>
            <div className="flex flex-col gap-1.5 sm:flex-row">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-el px-3 py-2.5 text-sm font-medium transition ht-border',
                    theme === t.id ? 'border-accent bg-accent/10 text-accent' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800',
                  )}
                >
                  <t.icon size={17} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <p className="mb-2 text-sm font-medium">Color de acento</p>
            <div className="flex flex-wrap items-center gap-2">
              {ACCENT_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAccent(c.hex)}
                  title={c.name}
                  className={cn(
                    'h-8 w-8 rounded-full transition',
                    accent.toLowerCase() === c.hex.toLowerCase() && 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900',
                  )}
                  style={{ background: c.hex }}
                />
              ))}
              <label className="relative h-8 w-8 cursor-pointer overflow-hidden rounded-full ht-border" title="Color personalizado">
                <span
                  className="absolute inset-0"
                  style={{ background: 'conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)' }}
                />
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => setAccent(e.target.value)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label="Color personalizado"
                />
              </label>
            </div>
          </div>
        </Section>

        {/* Perfiles */}
        <Section
          title="Perfiles"
          action={
            <button type="button" className="ht-btn-subtle px-2.5 py-1.5 text-sm" onClick={() => setProfileModal({ open: true, profile: null })}>
              <Plus size={16} /> Nuevo
            </button>
          }
        >
          {profiles.map((p) => {
            const canDelete = profile?.isAdmin && !p.isAdmin;
            return (
              <div key={p.id} className="flex items-center gap-3 p-3">
                <Avatar profile={p} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                    {p.name}
                    {p.id === profile?.id && <span className="text-xs text-zinc-400">(tú)</span>}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-zinc-400">
                    {p.isAdmin && (
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck size={12} /> Admin
                      </span>
                    )}
                    {p.hasPin && (
                      <span className="inline-flex items-center gap-1">
                        <KeyRound size={12} /> PIN
                      </span>
                    )}
                  </p>
                </div>
                <button type="button" className="ht-icon-btn" aria-label="Editar perfil" onClick={() => setProfileModal({ open: true, profile: p })}>
                  <Pencil size={17} />
                </button>
                {canDelete && (
                  <button
                    type="button"
                    className="ht-icon-btn hover:text-red-600"
                    aria-label="Eliminar perfil"
                    onClick={() =>
                      setConfirm({
                        title: 'Eliminar perfil',
                        message: `¿Eliminar el perfil “${p.name}”? Se eliminarán también sus listas personales.`,
                        danger: true,
                        confirmLabel: 'Eliminar',
                        onConfirm: async () => {
                          try {
                            await deleteProfile(p.id);
                            toast.success('Perfil eliminado');
                          } catch (e) {
                            toast.error(e.message || 'No se pudo eliminar');
                          }
                        },
                      })
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            );
          })}
        </Section>

        {/* Listas */}
        <Section
          title="Listas"
          action={
            <button type="button" className="ht-btn-subtle px-2.5 py-1.5 text-sm" onClick={() => setListModal({ open: true, list: null })}>
              <Plus size={16} /> Nueva
            </button>
          }
        >
          {lists.length === 0 && <p className="p-3 text-sm text-zinc-400">No hay listas todavía.</p>}
          {lists.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-el bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
                {l.type === 'shared' ? <Users size={18} /> : <Lock size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.name}</p>
                <p className="text-xs text-zinc-400">
                  {l.type === 'shared' ? 'Compartida' : 'Personal'} · {l.checkedCount}/{l.itemCount} productos
                </p>
              </div>
              <button type="button" className="ht-icon-btn" aria-label="Editar lista" onClick={() => setListModal({ open: true, list: l })}>
                <Pencil size={17} />
              </button>
              <button
                type="button"
                className="ht-icon-btn hover:text-red-600"
                aria-label="Eliminar lista"
                onClick={() =>
                  setConfirm({
                    title: 'Eliminar lista',
                    message: `¿Eliminar la lista “${l.name}” y todos sus productos? Esta acción no se puede deshacer.`,
                    danger: true,
                    confirmLabel: 'Eliminar',
                    onConfirm: async () => {
                      try {
                        await deleteList(l.id);
                        toast.success('Lista eliminada');
                      } catch (e) {
                        toast.error(e.message || 'No se pudo eliminar');
                      }
                    },
                  })
                }
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </Section>

        {/* Tiendas */}
        <Section
          title="Tiendas disponibles"
          description={`${stores.length} tiendas (sistema + personalizadas)`}
          action={
            <button type="button" className="ht-btn-subtle px-2.5 py-1.5 text-sm" onClick={() => setCustomStoreOpen(true)}>
              <Plus size={16} /> Añadir
            </button>
          }
        >
          {Object.entries(storesByCat).map(([label, list]) => (
            <div key={label} className="p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
              <div className="flex flex-wrap gap-2">
                {list.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 py-1 pl-1 pr-2.5 text-xs font-medium dark:bg-zinc-800"
                  >
                    <StoreLogo store={s} size={20} />
                    {s.name}
                    {s.custom && (
                      <button
                        type="button"
                        aria-label={`Eliminar ${s.name}`}
                        onClick={() =>
                          setConfirm({
                            title: 'Eliminar tienda',
                            message: `¿Eliminar la tienda personalizada “${s.name}”? Se quitará de todos los productos.`,
                            danger: true,
                            confirmLabel: 'Eliminar',
                            onConfirm: async () => {
                              try {
                                await deleteStore(s.id);
                                toast.success('Tienda eliminada');
                              } catch (e) {
                                toast.error(e.message || 'No se pudo eliminar');
                              }
                            },
                          })
                        }
                        className="-mr-1 ml-0.5 text-zinc-400 hover:text-red-600"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {!stores.some((s) => s.custom) && (
            <div className="px-3 pb-3 text-xs text-zinc-400">
              Aún no has añadido tiendas personalizadas. Útiles para comercios sin logo en el sistema.
            </div>
          )}
        </Section>

        {/* Datos */}
        <Section title="Datos" description={activeList ? `Lista activa: ${activeList.name}` : 'Sin lista activa'}>
          <div className="flex flex-col gap-2 p-3">
            <p className="flex items-center gap-1.5 text-sm font-medium">
              <DatabaseBackup size={16} /> Copia de seguridad completa
            </p>
            <p className="text-xs text-zinc-400">Todas las listas, productos y tiendas personalizadas.</p>
            <div className="flex gap-2">
              <button type="button" className="ht-btn-ghost flex-1" onClick={doExportAll}>
                <Download size={17} /> Exportar copia
              </button>
              <input ref={backupRef} type="file" accept=".json" className="hidden" onChange={doImportAll} />
              <button type="button" className="ht-btn-ghost flex-1" onClick={() => backupRef.current?.click()} disabled={importingAll}>
                <Upload size={17} /> {importingAll ? 'Importando…' : 'Importar copia'}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <p className="text-sm font-medium">Exportar lista activa</p>
            <div className="flex gap-2">
              <button type="button" className="ht-btn-ghost flex-1" onClick={() => doExport('json')} disabled={!activeList}>
                <FileJson size={17} /> JSON
              </button>
              <button type="button" className="ht-btn-ghost flex-1" onClick={() => doExport('csv')} disabled={!activeList}>
                <FileSpreadsheet size={17} /> CSV
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <p className="text-sm font-medium">Importar a lista activa</p>
            <input ref={fileRef} type="file" accept=".json,.csv" className="hidden" onChange={doImport} />
            <button type="button" className="ht-btn-ghost" onClick={() => fileRef.current?.click()} disabled={!activeList || importing}>
              <Upload size={17} /> {importing ? 'Importando…' : 'Importar CSV / JSON'}
            </button>
          </div>
          <div className="flex flex-col gap-2 p-3">
            <p className="text-sm font-medium">Limpiar datos</p>
            <button
              type="button"
              className="ht-btn ht-border bg-white text-red-600 hover:bg-red-50 dark:bg-zinc-900 dark:hover:bg-red-500/10"
              disabled={!activeList || items.length === 0}
              onClick={() =>
                setConfirm({
                  title: 'Vaciar lista',
                  message: `¿Eliminar los ${items.length} productos de “${activeList?.name}”? Esta acción no se puede deshacer.`,
                  danger: true,
                  confirmLabel: 'Vaciar',
                  onConfirm: async () => {
                    try {
                      for (const it of [...items]) await deleteItem(it.id, it.listId);
                      await loadItems();
                      toast.success('Lista vaciada');
                    } catch (e) {
                      toast.error(e.message || 'No se pudo vaciar');
                    }
                  },
                })
              }
            >
              <Eraser size={17} /> Vaciar lista activa
            </button>
          </div>
        </Section>

        {/* Acerca de */}
        <Section title="Acerca de">
          <div className="flex items-center gap-3 p-3">
            <img src="/logo/hipertracker.png" alt="HiperTracker" className="h-10 w-10 rounded-el object-contain" />
            <div className="flex-1">
              <p className="text-sm font-medium">HiperTracker</p>
              <p className="text-xs text-zinc-400">Versión v0.1.5</p>
            </div>
          </div>
          <a
            href="/api/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-3 text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-el bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
              <ExternalLink size={18} />
            </span>
            <span className="flex-1 font-medium">Documentación de la API</span>
            <ExternalLink size={15} className="text-zinc-400" />
          </a>
        </Section>
      </div>

      <ProfileFormModal
        open={profileModal.open}
        profile={profileModal.profile}
        onClose={() => setProfileModal({ open: false, profile: null })}
      />
      <ListFormModal open={listModal.open} list={listModal.list} onClose={() => setListModal({ open: false, list: null })} />
      <CustomStoreModal open={customStoreOpen} onClose={() => setCustomStoreOpen(false)} />
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={confirm?.onConfirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
      />
    </div>
  );
}
