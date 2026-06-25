// ═══════════════════════════════════════════════════════════
// Order Types
// ═══════════════════════════════════════════════════════════

export interface Order {
  id: string;
  orderNumber: string; // CF-2026-000001
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  promoCode?: string;
  notes?: string;
  isWholesale: boolean;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImage?: string;
  productPrice: number;
  quantity: number;
  lineTotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'flouci'
  | 'konnect'
  | 'd17'
  | 'cod'
  | 'invoice' // wholesale
  | 'whatsapp'; // WhatsApp order

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface ShippingQuote {
  method: string;
  price: number;
  estimatedDays: number;
  freeShippingThreshold?: number;
}
