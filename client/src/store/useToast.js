import { create } from 'zustand';

let counter = 0;

export const useToast = create((set, get) => ({
  toasts: [],
  show: (message, type = 'info') => {
    const id = ++counter;
    set({ toasts: [...get().toasts, { id, message, type }] });
    setTimeout(() => get().dismiss(id), 2800);
    return id;
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));

export const toast = {
  success: (m) => useToast.getState().show(m, 'success'),
  error: (m) => useToast.getState().show(m, 'error'),
  info: (m) => useToast.getState().show(m, 'info'),
};
