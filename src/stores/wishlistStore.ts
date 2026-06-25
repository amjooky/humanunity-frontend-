import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface WishlistState {
  items: string[]; // List of product IDs
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      fetchWishlist: async () => {
        set({ loading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const { data, error } = await supabase
            .from('wishlists')
            .select('product_id')
            .eq('user_id', user.id);
          
          if (error) throw error;
          set({ items: data.map((item) => item.product_id) });
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          set({ loading: false });
        }
      },
      toggle: async (productId: string) => {
        const { items } = get();
        const exists = items.includes(productId);
        
        // Optimistic UI update
        const updatedItems = exists
          ? items.filter((id) => id !== productId)
          : [...items, productId];
        
        set({ items: updatedItems });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return; // Keep local changes only if not logged in

          if (exists) {
            await supabase
              .from('wishlists')
              .delete()
              .eq('user_id', user.id)
              .eq('product_id', productId);
          } else {
            await supabase
              .from('wishlists')
              .insert({ user_id: user.id, product_id: productId });
          }
        } catch (error) {
          console.error('Error syncing wishlist with Supabase:', error);
          // Rollback on error
          set({ items });
        }
      },
      isWishlisted: (productId: string) => {
        return get().items.includes(productId);
      },
    }),
    {
      name: 'cf-distribution-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
