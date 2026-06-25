// ═══════════════════════════════════════════════════════════
// Product Types
// ═══════════════════════════════════════════════════════════

export interface Product {
  id: string;
  sanityId: string;
  slug: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  shortDescription: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  category: Category;
  brand?: string;
  badge?: ProductBadge;
  rating?: number;
  reviewCount?: number;
  images: ProductImage[];
  mainImage: string;
  variants: ProductVariant[];
  stockQuantity: number;
  isActive: boolean;
  isWholesale: boolean;
  tags: string[];
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  optionType: 'weight' | 'grind' | 'size' | 'flavor' | 'pack';
  priceModifier: number;
  sku?: string;
  stockQuantity: number;
}

export interface ProductImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  products: string[]; // Product IDs
}

export type ProductBadge = 'new' | 'bestseller' | 'sale' | 'limited' | 'organic';

export interface ProductFilter {
  category?: string;
  priceRange?: [number, number];
  brands?: string[];
  badges?: ProductBadge[];
  search?: string;
  inStock?: boolean;
}

export type ProductSortBy = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export interface ProductListParams {
  filter?: ProductFilter;
  sort?: ProductSortBy;
  page?: number;
  limit?: number;
  locale?: string;
}
