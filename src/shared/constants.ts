// ═══════════════════════════════════════════════════════════
// Human Unity — Shared Constants
// ═══════════════════════════════════════════════════════════

// ─── Locales ───
export const LOCALES = ['fr', 'en', 'ar'] as const;
export const DEFAULT_LOCALE = 'fr' as const;
export const RTL_LOCALES = ['ar'] as const;

// ─── Currency ───
export const CURRENCY = 'TND' as const;
export const CURRENCY_SYMBOL = 'DT' as const;
export const CURRENCY_LOCALE = 'fr-TN' as const;

// ─── Shipping ───
export const FREE_SHIPPING_THRESHOLD = 150; // TND
export const DEFAULT_SHIPPING_COST = 7; // TND
export const EXPRESS_SHIPPING_COST = 15; // TND

// ─── Pagination ───
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

// ─── Cart ───
export const MAX_CART_QUANTITY = 99;
export const MIN_CART_QUANTITY = 1;

// ─── Wholesale ───
export const WHOLESALE_MIN_ORDER = 500; // TND
export const PRICING_TIER_DISCOUNTS = {
  standard: 0,
  silver: 5,
  gold: 10,
  platinum: 15,
} as const;

// ─── Order Number ───
export const ORDER_PREFIX = 'HU';
export const ORDER_YEAR = new Date().getFullYear();

// ─── Categories ───
export const MAIN_CATEGORIES = [
  { slug: 't-shirts', nameFr: 'T-Shirts', nameEn: 'T-Shirts', nameAr: 'تي شيرت' },
  { slug: 'hoodies', nameFr: 'Hoodies', nameEn: 'Hoodies & Sweatshirts', nameAr: 'هوديز' },
  { slug: 'bottoms', nameFr: 'Pantalons & Shorts', nameEn: 'Bottoms', nameAr: 'بناطيل' },
  { slug: 'outerwear', nameFr: 'Vestes & Manteaux', nameEn: 'Outerwear', nameAr: 'ملابس خارجية' },
] as const;

// ─── Payment Methods ───
export const PAYMENT_METHODS = [
  { id: 'flouci', nameFr: 'Carte bancaire (Flouci)', nameEn: 'Bank Card (Flouci)', nameAr: 'بطاقة بنكية (فلوسي)', icon: 'credit-card' },
  { id: 'konnect', nameFr: 'Paiement en ligne (Konnect)', nameEn: 'Online Payment (Konnect)', nameAr: 'دفع إلكتروني (كونكت)', icon: 'globe' },
  { id: 'd17', nameFr: 'Paiement mobile (D17)', nameEn: 'Mobile Payment (D17)', nameAr: 'دفع عبر الهاتف (D17)', icon: 'smartphone' },
  { id: 'cod', nameFr: 'Paiement à la livraison', nameEn: 'Cash on Delivery', nameAr: 'الدفع عند الاستلام', icon: 'banknote' },
] as const;

// ─── Social Links ───
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/humanunity',
  instagram: 'https://instagram.com/humanunity',
  linkedin: 'https://linkedin.com/company/humanunity',
  whatsapp: 'https://wa.me/21658409210',
} as const;

// ─── SEO ───
export const SITE_NAME = 'Human Unity';
export const SITE_DESCRIPTION_FR = 'Marque de streetwear contemporaine axée sur la connexion humaine au-delà des frontières.';
export const SITE_DESCRIPTION_EN = 'Contemporary streetwear brand focused on human connection beyond borders.';
export const SITE_DESCRIPTION_AR = 'علامة تجارية عصرية لملابس الشارع تركز على التواصل الإنساني العابر للحدود.';
export const SITE_URL = 'https://humanunity.tn';
