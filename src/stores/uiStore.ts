import { create } from "zustand";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  duration?: number;
}

interface UIStore {
  cartOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  toasts: ToastMessage[];
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  cartOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  toasts: [],
  setCartOpen: (open) => set({ cartOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
