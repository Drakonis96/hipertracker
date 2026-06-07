import { useState } from 'react';
import Modal from './Modal';
import Spinner from './Spinner';
import { cn } from '../lib/cn';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = '¿Confirmar?',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm?.();
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" className="ht-btn-ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={cn('ht-btn text-white', danger ? 'bg-red-600 hover:bg-red-700' : 'ht-btn-primary')}
          >
            {loading && <Spinner size={16} />}
            {confirmLabel}
          </button>
        </div>
      }
    >
      {message && <p className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-300">{message}</p>}
    </Modal>
  );
}
