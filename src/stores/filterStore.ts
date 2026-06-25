import { create } from "zustand";
import { ProductSortBy, ProductBadge } from "@cf/shared/types/product";

interface FilterState {
  category: string | null;
  brands: string[];
  badges: ProductBadge[];
  priceRange: [number, number];
  search: string;
  sortBy: ProductSortBy;
  inStockOnly: boolean;

  setCategory: (category: string | null) => void;
  toggleBrand: (brand: string) => void;
  toggleBadge: (badge: ProductBadge) => void;
  setPriceRange: (range: [number, number]) => void;
  setSearch: (search: string) => void;
  setSortBy: (sort: ProductSortBy) => void;
  setInStockOnly: (inStock: boolean) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: null,
  brands: [],
  badges: [],
  priceRange: [0, 200], // default max price TND
  search: "",
  sortBy: "popular",
  inStockOnly: false,

  setCategory: (category) => set({ category }),
  toggleBrand: (brand) =>
    set((state) => ({
      brands: state.brands.includes(brand)
        ? state.brands.filter((b) => b !== brand)
        : [...state.brands, brand],
    })),
  toggleBadge: (badge) =>
    set((state) => ({
      badges: state.badges.includes(badge)
        ? state.badges.filter((b) => b !== badge)
        : [...state.badges, badge],
    })),
  setPriceRange: (priceRange) => set({ priceRange }),
  setSearch: (search) => set({ search }),
  setSortBy: (sortBy) => set({ sortBy }),
  setInStockOnly: (inStockOnly) => set({ inStockOnly }),
  resetFilters: () =>
    set({
      category: null,
      brands: [],
      badges: [],
      priceRange: [0, 200],
      search: "",
      sortBy: "popular",
      inStockOnly: false,
    }),
}));
