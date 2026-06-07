import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  FolderInput,
  MoreHorizontal,
  Pencil,
  PackageOpen,
  SearchX,
  Store as StoreIcon,
  Trash2,
} from 'lucide-react';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import ProductIcon from '../components/ProductIcon';
import StoreLogo from '../components/StoreLogo';
import StoreSelector from '../components/StoreSelector';
import Menu from '../components/Menu';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import ProductModal from '../components/ProductModal';
import MoveToListModal from '../components/MoveToListModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Fab from '../components/Fab';
import { cn } from '../lib/cn';
import { useData } from '../store/useData';
import { filterItems } from '../lib/filter';
import { toast } from '../store/useToast';

function ManageRow({ item, storesById, selected, onSelect, onEdit, onMove, onDelete, onDuplicate, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.name);
  const stores = (item.stores || []).map((id) => storesById[id]).filter(Boolean);

  const commit = async () => {
    setEditing(false);
    if (draft.trim() && draft.trim() !== item.name) await onRename(item, draft.trim());
    else setDraft(item.name);
  };

  return (
    <li className="flex items-center gap-2.5 bg-white px-3 py-2.5 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition',
          selected ? 'border-accent bg-accent text-accent-fg' : 'border-zinc-300 dark:border-zinc-600',
        )}
        aria-label="Seleccionar"
        aria-pressed={selected}
      >
        {selected && <Check size={13} strokeWidth={3} />}
      </button>

      <ProductIcon item={item} size={34} />

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit();
              if (e.key === 'Escape') {
                setDraft(item.name);
                setEditing(false);
              }
            }}
            className="ht-input py-1 text-[15px]"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(item.name);
              setEditing(true);
            }}
            className="block w-full truncate text-left text-[15px] font-medium"
            title="Pulsa para editar el nombre"
          >
            {item.name}
            {item.checked && <span className="ml-2 text-xs font-normal text-zinc-400">comprado</span>}
          </button>
        )}
      </div>

      {stores.length > 0 && (
        <div className="flex shrink-0 items-center -space-x-1">
          {stores.slice(0, 3).map((s) => (
            <StoreLogo key={s.id} store={s} size={28} className="ring-1 ring-white dark:ring-zinc-900" />
          ))}
          {stores.length > 3 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-100 px-1 text-[10px] font-semibold text-zinc-500 ring-1 ring-white dark:bg-zinc-800 dark:ring-zinc-900">
              +{stores.length - 3}
            </span>
          )}
        </div>
      )}

      <Menu
        trigger={<MoreHorizontal size={20} />}
        items={[
          { label: 'Editar', icon: Pencil, onClick: () => onEdit(item) },
          { label: 'Duplicar', icon: Copy, onClick: () => onDuplicate(item) },
          { label: 'Mover a otra lista', icon: FolderInput, onClick: () => onMove(item) },
          { label: 'Eliminar', icon: Trash2, danger: true, onClick: () => onDelete(item) },
        ]}
      />
    </li>
  );
}

export default function ManageProducts() {
  const lists = useData((s) => s.lists);
  const activeListId = useData((s) => s.activeListId);
  const items = useData((s) => s.items);
  const filters = useData((s) => s.filters);
  const storesById = useData((s) => s.storesById);
  const updateItem = useData((s) => s.updateItem);
  const deleteItem = useData((s) => s.deleteItem);
  const duplicateItem = useData((s) => s.duplicateItem);

  const [selected, setSelected] = useState(new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [moveItems, setMoveItems] = useState(null); // array | null
  const [deleteTarget, setDeleteTarget] = useState(null); // single item
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkStoreOpen, setBulkStoreOpen] = useState(false);
  const [bulkStores, setBulkStores] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);

  const activeList = lists.find((l) => l.id === activeListId);
  const filtered = useMemo(() => filterItems(items, filters), [items, filters]);
  const allSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const selectedItems = items.filter((i) => selected.has(i.id));

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(filtered.map((i) => i.id)));
  };
  const clearSel = () => setSelected(new Set());

  const rename = async (item, name) => {
    try {
      await updateItem(item.id, { name }, item.listId);
    } catch (e) {
      toast.error(e.message || 'No se pudo renombrar');
    }
  };
  const duplicate = async (item) => {
    try {
      await duplicateItem(item, item.listId);
      toast.success('Producto duplicado');
    } catch (e) {
      toast.error(e.message || 'No se pudo duplicar');
    }
  };

  const applyBulkStores = async () => {
    setBulkSaving(true);
    try {
      for (const it of selectedItems) await updateItem(it.id, { stores: bulkStores }, it.listId);
      toast.success('Tiendas actualizadas');
      setBulkStoreOpen(false);
      clearSel();
    } catch (e) {
      toast.error(e.message || 'No se pudo actualizar');
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="min-h-full pb-28">
      <Header />
      <div className="mx-auto max-w-3xl px-3 py-3">
        <div className="mb-3 flex items-center gap-2">
          <Link to="/" className="ht-icon-btn -ml-1" aria-label="Volver">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">Gestionar productos</h1>
            <p className="truncate text-xs text-zinc-500">{activeList?.name || 'Sin lista'}</p>
          </div>
        </div>

        {!activeList ? (
          <EmptyState icon={PackageOpen} title="No hay lista activa" description="Crea o selecciona una lista primero." />
        ) : (
          <>
            <FilterBar />

            {/* Selección */}
            {filtered.length > 0 && (
              <div className="mt-3 flex items-center justify-between px-1">
                <button
                  type="button"
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-300"
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-[5px] border-[1.5px] transition',
                      allSelected ? 'border-accent bg-accent text-accent-fg' : 'border-zinc-300 dark:border-zinc-600',
                    )}
                  >
                    {allSelected && <Check size={13} strokeWidth={3} />}
                  </span>
                  Seleccionar todo
                </button>
                <span className="text-xs text-zinc-400">{filtered.length} productos</span>
              </div>
            )}

            <div className="mt-2">
              {items.length === 0 ? (
                <EmptyState
                  icon={PackageOpen}
                  title="Esta lista está vacía"
                  description="Añade productos para gestionarlos aquí."
                  action={
                    <button type="button" className="ht-btn-primary" onClick={() => setCreateOpen(true)}>
                      Añadir producto
                    </button>
                  }
                />
              ) : filtered.length === 0 ? (
                <EmptyState icon={SearchX} title="Sin resultados" description="No hay productos que coincidan con los filtros." />
              ) : (
                <ul className="divide-y-[0.5px] divide-zinc-100 overflow-hidden rounded-card ht-border dark:divide-zinc-800">
                  {filtered.map((item) => (
                    <ManageRow
                      key={item.id}
                      item={item}
                      storesById={storesById}
                      selected={selected.has(item.id)}
                      onSelect={toggleSelect}
                      onEdit={setEditItem}
                      onMove={(it) => setMoveItems([it])}
                      onDelete={setDeleteTarget}
                      onDuplicate={duplicate}
                      onRename={rename}
                    />
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Barra de acciones en lote */}
      {selected.size > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t-[0.5px] border-zinc-200 bg-white/95 backdrop-blur pb-safe dark:border-zinc-800 dark:bg-zinc-950/95"
          style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
          <div className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2.5">
            <span className="text-sm font-medium">{selected.size} sel.</span>
            <div className="ml-auto flex gap-1.5">
              <button type="button" className="ht-btn-subtle px-3 py-2 text-sm" onClick={() => setMoveItems(selectedItems)}>
                <FolderInput size={16} /> Mover
              </button>
              <button
                type="button"
                className="ht-btn-subtle px-3 py-2 text-sm"
                onClick={() => {
                  setBulkStores([]);
                  setBulkStoreOpen(true);
                }}
              >
                <StoreIcon size={16} /> Tienda
              </button>
              <button
                type="button"
                className="ht-btn px-3 py-2 text-sm bg-red-600 text-white hover:bg-red-700"
                onClick={() => setBulkDeleteOpen(true)}
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {activeList && selected.size === 0 && <Fab onClick={() => setCreateOpen(true)} />}

      {/* Modales */}
      <ProductModal open={createOpen} onClose={() => setCreateOpen(false)} listId={activeListId} />
      <ProductModal open={!!editItem} onClose={() => setEditItem(null)} item={editItem} listId={activeListId} />
      <MoveToListModal
        open={!!moveItems}
        onClose={() => setMoveItems(null)}
        items={moveItems || []}
        onMoved={clearSel}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await deleteItem(deleteTarget.id, deleteTarget.listId);
          toast.success('Producto eliminado');
        }}
        title="Eliminar producto"
        message={`¿Eliminar “${deleteTarget?.name}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={async () => {
          for (const it of selectedItems) await deleteItem(it.id, it.listId);
          toast.success('Productos eliminados');
          clearSel();
        }}
        title="Eliminar productos"
        message={`¿Eliminar ${selected.size} productos seleccionados? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />

      <Modal
        open={bulkStoreOpen}
        onClose={bulkSaving ? undefined : () => setBulkStoreOpen(false)}
        title="Cambiar tienda"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" className="ht-btn-ghost" onClick={() => setBulkStoreOpen(false)} disabled={bulkSaving}>
              Cancelar
            </button>
            <button type="button" className="ht-btn-primary" onClick={applyBulkStores} disabled={bulkSaving}>
              {bulkSaving && <Spinner size={16} />}
              Aplicar a {selected.size}
            </button>
          </div>
        }
      >
        <p className="mb-3 text-sm text-zinc-500">
          Las tiendas seleccionadas reemplazarán las de los {selected.size} productos elegidos.
        </p>
        <StoreSelector stores={useData.getState().stores} value={bulkStores} onChange={setBulkStores} />
      </Modal>
    </div>
  );
}
