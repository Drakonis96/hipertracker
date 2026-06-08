import { useMemo, useState } from 'react';
import { ClipboardList, PackageOpen, SearchX } from 'lucide-react';
import Header from '../components/Header';
import FilterBar from '../components/FilterBar';
import ProductList from '../components/ProductList';
import ProductModal from '../components/ProductModal';
import MoveToListModal from '../components/MoveToListModal';
import ListFormModal from '../components/ListFormModal';
import Fab from '../components/Fab';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { listTypeIcon } from '../lib/listMeta';
import { useData } from '../store/useData';
import { filterItems, hasActiveFilters } from '../lib/filter';

export default function MainList() {
  const lists = useData((s) => s.lists);
  const activeListId = useData((s) => s.activeListId);
  const items = useData((s) => s.items);
  const loadingItems = useData((s) => s.loadingItems);
  const filters = useData((s) => s.filters);
  const clearFilters = useData((s) => s.clearFilters);

  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [moveItem, setMoveItem] = useState(null);
  const [newListOpen, setNewListOpen] = useState(false);

  const activeList = lists.find((l) => l.id === activeListId);
  const ActiveListIcon = listTypeIcon(activeList?.type);
  const filtered = useMemo(() => filterItems(items, filters), [items, filters]);
  const done = items.filter((i) => i.checked).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="min-h-full pb-28">
      <Header />

      {/* Barra de progreso de la lista */}
      {activeList && items.length > 0 && (
        <div className="mx-auto max-w-3xl px-3 pt-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-200">
              <ActiveListIcon size={13} />
              {activeList.name}
            </span>
            <span className="tabular-nums">
              {done}/{items.length} · {pct}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-3 py-3">
        {!activeList ? (
          <EmptyState
            icon={ClipboardList}
            title="No tienes ninguna lista"
            description="Crea tu primera lista de la compra para empezar a añadir productos."
            action={
              <button type="button" className="ht-btn-primary" onClick={() => setNewListOpen(true)}>
                Crear lista
              </button>
            }
          />
        ) : (
          <>
            <FilterBar />
            <div className="mt-3">
              {loadingItems && items.length === 0 ? (
                <div className="flex justify-center py-16">
                  <Spinner size={24} className="text-accent" />
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={PackageOpen}
                  title="Esta lista está vacía"
                  description="Añade tu primer producto a esta lista."
                  action={
                    <button type="button" className="ht-btn-primary" onClick={() => setCreateOpen(true)}>
                      Añadir primer producto
                    </button>
                  }
                />
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={SearchX}
                  title="No hay productos que coincidan con los filtros"
                  description="Prueba a cambiar la búsqueda o las tiendas seleccionadas."
                  action={
                    hasActiveFilters(filters) && (
                      <button type="button" className="ht-btn-ghost" onClick={clearFilters}>
                        Limpiar filtros
                      </button>
                    )
                  }
                />
              ) : (
                <ProductList items={filtered} onEdit={setEditItem} onMove={setMoveItem} />
              )}
            </div>
          </>
        )}
      </div>

      {activeList && <Fab onClick={() => setCreateOpen(true)} />}

      <ProductModal open={createOpen} onClose={() => setCreateOpen(false)} listId={activeListId} />
      <ProductModal open={!!editItem} onClose={() => setEditItem(null)} item={editItem} listId={activeListId} />
      <MoveToListModal open={!!moveItem} onClose={() => setMoveItem(null)} items={moveItem ? [moveItem] : []} />
      <ListFormModal open={newListOpen} onClose={() => setNewListOpen(false)} />
    </div>
  );
}
