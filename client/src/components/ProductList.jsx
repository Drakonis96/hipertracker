import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProductRow from './ProductRow';
import ConfirmDialog from './ConfirmDialog';
import { useData } from '../store/useData';
import { toast } from '../store/useToast';

function SortableRow(props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <ProductRow
      {...props}
      innerRef={setNodeRef}
      style={style}
      handleProps={{ ...attributes, ...listeners }}
      isDragging={isDragging}
      draggable
    />
  );
}

export default function ProductList({ items, onEdit, onMove }) {
  const storesById = useData((s) => s.storesById);
  const toggleCheck = useData((s) => s.toggleCheck);
  const reorderItems = useData((s) => s.reorderItems);
  const deleteItem = useData((s) => s.deleteItem);
  const [toDelete, setToDelete] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const pending = useMemo(() => items.filter((i) => !i.checked), [items]);
  const done = useMemo(() => items.filter((i) => i.checked), [items]);

  const handleToggle = async (item) => {
    try {
      await toggleCheck(item);
    } catch (e) {
      toast.error(e.message || 'No se pudo actualizar');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = pending.findIndex((i) => i.id === active.id);
    const newIndex = pending.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const newPending = arrayMove(pending, oldIndex, newIndex);
    const orderedIds = [...newPending.map((i) => i.id), ...done.map((i) => i.id)];
    try {
      await reorderItems(orderedIds);
    } catch (e) {
      toast.error(e.message || 'No se pudo reordenar');
    }
  };

  const rowProps = {
    storesById,
    onToggle: handleToggle,
    onEdit,
    onMove,
    onDelete: (item) => setToDelete(item),
  };

  return (
    <div className="overflow-hidden rounded-card ht-border">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={pending.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="divide-y-[0.5px] divide-zinc-100 dark:divide-zinc-800">
            {pending.map((item) => (
              <SortableRow key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {done.length > 0 && (
        <>
          <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:bg-zinc-800/50">
            Completados · {done.length}
          </div>
          <ul className="divide-y-[0.5px] divide-zinc-100 dark:divide-zinc-800">
            {done.map((item) => (
              <ProductRow key={item.id} item={item} {...rowProps} />
            ))}
          </ul>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          await deleteItem(toDelete.id, toDelete.listId);
          toast.success('Producto eliminado');
        }}
        title="Eliminar producto"
        message={`¿Eliminar “${toDelete?.name}”? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
      />
    </div>
  );
}
