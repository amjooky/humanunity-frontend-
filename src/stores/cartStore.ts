import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@cf/shared/types/cart";
import { FREE_SHIPPING_THRESHOLD } from "@cf/shared/constants";

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Selectors/getters for derived state
  getSubtotal: () => number;
  getItemCount: () => number;
  getFreeShippingProgress: () => number; // Percentage (0-100)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === newItem.id);

        if (existingItem) {
          const updatedQuantity = Math.min(
            existingItem.quantity + (newItem.quantity || 1),
            newItem.maxQuantity || 99
          );
          set({
            items: items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: updatedQuantity }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              { ...newItem, quantity: newItem.quantity || 1 } as CartItem,
            ],
          });
        }
      },

      removeItem: (id) => {
        const { items } = get();
        set({
          items: items.filter((item) => item.id !== id),
        });
      },

      updateQuantity: (id, quantity) => {
        const { items } = get();
        const item = items.find((i) => i.id === id);
        if (!item) return;

        const validatedQuantity = Math.max(
          1,
          Math.min(quantity, item.maxQuantity || 99)
        );

        set({
          items: items.map((i) =>
            i.id === id ? { ...i, quantity: validatedQuantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getFreeShippingProgress: () => {
        const subtotal = get().getSubtotal();
        if (subtotal >= FREE_SHIPPING_THRESHOLD) return 100;
        return Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      },
    }),
    {
      name: "cf-cart-storage", // name of the item in localStorage
    }
  )
);
