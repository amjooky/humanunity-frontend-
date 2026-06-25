// ═══════════════════════════════════════════════════════════
// API Types
// ═══════════════════════════════════════════════════════════

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Search
export interface SearchResult {
  products: import('./product').Product[];
  categories: import('./product').Category[];
  totalResults: number;
  query: string;
  suggestions?: string[];
}

// Analytics
export interface AnalyticsEvent {
  eventType: 'page_view' | 'add_to_cart' | 'remove_from_cart' | 'purchase' | 'search' | 'wishlist_add' | 'product_view';
  userId?: string;
  productId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Promo
export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses?: number;
  currentUses: number;
  validFrom: string;
  validUntil?: string;
  isActive: boolean;
}

export interface PromoValidation {
  valid: boolean;
  discount?: number;
  message: string;
}
