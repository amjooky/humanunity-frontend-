// ═══════════════════════════════════════════════════════════
// Cart Types
// ═══════════════════════════════════════════════════════════

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  variant?: {
    name: string;
    optionType: string;
  };
  maxQuantity: number; // stock limit
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  freeShippingProgress: number; // 0-100
}

export interface CartAction {
  type: 'add' | 'remove' | 'update' | 'clear';
  productId?: string;
  variantId?: string;
  quantity?: number;
}
