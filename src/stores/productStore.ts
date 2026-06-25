import { create } from "zustand";
import { Product } from "@cf/shared/types/product";
import { Order, OrderStatus } from "@cf/shared/types/order";
import { Category } from "@cf/shared/types/product";
import { PromoCode } from "@cf/shared/types/api";
import { createClient } from "@/utils/supabase/client";

interface ProductStore {
  products: Product[];
  categories: Category[];
  promotions: PromoCode[];
  orders: Order[];
  isLoading: boolean;

  fetchStoreData: () => Promise<void>;

  // Product Actions
  addProduct: (product: Omit<Product, "createdAt" | "updatedAt">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Category Actions
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Promotion Actions
  addPromotion: (promo: Omit<PromoCode, "id" | "currentUses">) => Promise<void>;
  togglePromotion: (id: string) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;

  // Order Actions
  addOrder: (order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt" | "items"> & { items: any[] }) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
}

// ─── DTO Mappings (Snake to Camel) ───
const mapDbCategoryToApp = (c: any): Category => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  nameEn: c.name_en || undefined,
  nameAr: c.name_ar || undefined,
  description: c.description || undefined,
  order: c.order || 0,
});

const mapDbProductToApp = (p: any, variants: any[], category: Category): Product => ({
  id: p.id,
  sanityId: p.sanity_id || "",
  slug: p.slug,
  name: p.name,
  nameEn: p.name_en || undefined,
  nameAr: p.name_ar || undefined,
  shortDescription: p.short_description,
  description: p.description,
  price: Number(p.price),
  comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
  sku: p.sku,
  category,
  brand: p.brand || undefined,
  badge: p.badge || undefined,
  rating: p.rating ? Number(p.rating) : 4.5,
  reviewCount: p.review_count ? Number(p.review_count) : 0,
  mainImage: p.main_image,
  images: Array.isArray(p.images) ? p.images : [],
  variants: variants.map((v) => ({
    id: v.id,
    name: v.name,
    optionType: v.option_type as any,
    priceModifier: Number(v.price_modifier),
    sku: v.sku || undefined,
    stockQuantity: Number(v.stock_quantity),
  })),
  stockQuantity: Number(p.stock_quantity),
  isActive: p.is_active,
  isWholesale: p.is_wholesale,
  tags: Array.isArray(p.tags) ? p.tags : [],
  metadata: p.metadata || {},
  createdAt: p.created_at,
  updatedAt: p.updated_at,
});

const mapDbPromoToApp = (promo: any): PromoCode => ({
  id: promo.id,
  code: promo.code,
  discountType: promo.discount_type as any,
  discountValue: Number(promo.discount_value),
  minOrderAmount: Number(promo.min_order_amount),
  maxUses: promo.max_uses || undefined,
  currentUses: Number(promo.current_uses),
  validFrom: promo.valid_from,
  validUntil: promo.valid_until || undefined,
  isActive: promo.is_active,
});

const mapDbOrderToApp = (o: any, items: any[]): Order => ({
  id: o.id,
  orderNumber: o.order_number,
  userId: o.user_id,
  status: o.status as any,
  shippingAddress: o.shipping_address as any,
  billingAddress: o.billing_address ? (o.billing_address as any) : undefined,
  subtotal: Number(o.subtotal),
  shippingCost: Number(o.shipping_cost),
  taxAmount: Number(o.tax_amount),
  discountAmount: Number(o.discount_amount),
  total: Number(o.total),
  paymentMethod: o.payment_method as any,
  paymentStatus: o.payment_status as any,
  paymentReference: o.payment_reference || undefined,
  promoCode: o.promo_code || undefined,
  notes: o.notes || undefined,
  isWholesale: o.is_wholesale,
  trackingNumber: o.tracking_number || undefined,
  estimatedDelivery: o.estimated_delivery || undefined,
  createdAt: o.created_at,
  updatedAt: o.updated_at,
  items: items.map((item) => ({
    id: String(item.id),
    productId: item.product_id,
    variantId: item.variant_id || undefined,
    productName: item.product_name,
    productImage: item.product_image || undefined,
    productPrice: Number(item.product_price),
    quantity: Number(item.quantity),
    lineTotal: Number(item.line_total),
  })),
});

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  categories: [],
  promotions: [],
  orders: [],
  isLoading: false,

  fetchStoreData: async () => {
    set({ isLoading: true });
    try {
      const supabase = createClient();

      // 1. Fetch Categories
      const { data: dbCategories, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });
      if (catError) console.error("Categories fetch error:", catError.message);

      // 2. Fetch Products
      const { data: dbProducts, error: prodError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (prodError) console.error("Products fetch error:", prodError.message);

      // 3. Fetch Product Variants
      const { data: dbVariants, error: varError } = await supabase
        .from("product_variants")
        .select("*");
      if (varError) console.error("Variants fetch error:", varError.message);

      // 4. Fetch Promotions
      const { data: dbPromotions, error: promoError } = await supabase
        .from("promo_codes")
        .select("*")
        .order("code", { ascending: true });
      if (promoError) console.error("Promotions fetch error:", promoError.message);

      // 5. Fetch Orders
      const { data: dbOrders, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (orderError) console.error("Orders fetch error:", orderError.message);

      // 6. Fetch Order Items
      const { data: dbOrderItems, error: itemsError } = await supabase
        .from("order_items")
        .select("*");
      if (itemsError) console.error("Order items fetch error:", itemsError.message);

      const categoriesList = (dbCategories || []).map(mapDbCategoryToApp);

      const productsList = (dbProducts || []).map((p) => {
        const pVariants = (dbVariants || []).filter((v) => v.product_id === p.id);
        const productCat = categoriesList.find((c) => c.id === p.category_id) || {
          id: p.category_id || "cat_custom",
          slug: p.category || "custom",
          name: p.category || "Custom",
          order: 9,
        };
        return mapDbProductToApp(p, pVariants, productCat);
      });

      const promotionsList = (dbPromotions || []).map(mapDbPromoToApp);

      const ordersList = (dbOrders || []).map((o) => {
        const oItems = (dbOrderItems || []).filter((item) => item.order_id === o.id);
        return mapDbOrderToApp(o, oItems);
      });

      set({
        categories: categoriesList,
        products: productsList,
        promotions: promotionsList,
        orders: ordersList,
      });
    } catch (err) {
      console.error("Failed to load store data from Supabase:", err);
    } finally {
      set({ isLoading: false });
    }
  },

  addProduct: async (newProduct) => {
    const supabase = createClient();
    const timestamp = new Date().toISOString();
    const categoriesList = get().categories;
    const dbCategoryId = categoriesList.some((c) => c.id === newProduct.category.id) ? newProduct.category.id : null;

    const { error: prodErr } = await supabase.from("products").insert({
      id: newProduct.id,
      sanity_id: newProduct.sanityId,
      slug: newProduct.slug,
      name: newProduct.name,
      name_en: newProduct.nameEn,
      name_ar: newProduct.nameAr,
      short_description: newProduct.shortDescription,
      description: newProduct.description,
      price: newProduct.price,
      compare_price: newProduct.comparePrice,
      sku: newProduct.sku,
      category: newProduct.category.slug,
      category_id: dbCategoryId,
      brand: newProduct.brand,
      badge: newProduct.badge,
      main_image: newProduct.mainImage,
      images: newProduct.images,
      stock_quantity: newProduct.stockQuantity,
      is_active: newProduct.isActive,
      is_wholesale: newProduct.isWholesale,
      tags: newProduct.tags,
      metadata: newProduct.metadata,
      created_at: timestamp,
      updated_at: timestamp,
    });

    if (prodErr) throw new Error(prodErr.message);

    if (newProduct.variants && newProduct.variants.length > 0) {
      const variantsToInsert = newProduct.variants.map((v) => ({
        id: v.id,
        product_id: newProduct.id,
        name: v.name,
        option_type: v.optionType,
        price_modifier: v.priceModifier,
        sku: v.sku,
        stock_quantity: v.stockQuantity,
      }));

      const { error: varErr } = await supabase.from("product_variants").insert(variantsToInsert);
      if (varErr) throw new Error(varErr.message);
    }

    await get().fetchStoreData();
  },

  updateProduct: async (updatedProduct) => {
    const supabase = createClient();
    const timestamp = new Date().toISOString();
    const categoriesList = get().categories;
    const dbCategoryId = categoriesList.some((c) => c.id === updatedProduct.category.id) ? updatedProduct.category.id : null;

    const { error: prodErr } = await supabase
      .from("products")
      .update({
        sanity_id: updatedProduct.sanityId,
        slug: updatedProduct.slug,
        name: updatedProduct.name,
        name_en: updatedProduct.nameEn,
        name_ar: updatedProduct.nameAr,
        short_description: updatedProduct.shortDescription,
        description: updatedProduct.description,
        price: updatedProduct.price,
        compare_price: updatedProduct.comparePrice,
        sku: updatedProduct.sku,
        category: updatedProduct.category.slug,
        category_id: dbCategoryId,
        brand: updatedProduct.brand,
        badge: updatedProduct.badge,
        main_image: updatedProduct.mainImage,
        images: updatedProduct.images,
        stock_quantity: updatedProduct.stockQuantity,
        is_active: updatedProduct.isActive,
        is_wholesale: updatedProduct.isWholesale,
        tags: updatedProduct.tags,
        metadata: updatedProduct.metadata,
        updated_at: timestamp,
      })
      .eq("id", updatedProduct.id);

    if (prodErr) throw new Error(prodErr.message);

    const { error: delErr } = await supabase
      .from("product_variants")
      .delete()
      .eq("product_id", updatedProduct.id);

    if (delErr) throw new Error(delErr.message);

    if (updatedProduct.variants && updatedProduct.variants.length > 0) {
      const variantsToInsert = updatedProduct.variants.map((v) => ({
        id: v.id,
        product_id: updatedProduct.id,
        name: v.name,
        option_type: v.optionType,
        price_modifier: v.priceModifier,
        sku: v.sku,
        stock_quantity: v.stockQuantity,
      }));

      const { error: varErr } = await supabase.from("product_variants").insert(variantsToInsert);
      if (varErr) throw new Error(varErr.message);
    }

    await get().fetchStoreData();
  },

  deleteProduct: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },

  addCategory: async (categoryData) => {
    const supabase = createClient();
    const id = `cat_${Math.random().toString(36).substring(2, 9)}`;

    const { error } = await supabase.from("categories").insert({
      id,
      slug: categoryData.slug,
      name: categoryData.name,
      name_en: categoryData.nameEn,
      name_ar: categoryData.nameAr,
      description: categoryData.description,
      order: categoryData.order,
    });

    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },

  deleteCategory: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },

  addPromotion: async (promoData) => {
    const supabase = createClient();
    const id = `promo_${Math.random().toString(36).substring(2, 9)}`;

    const { error } = await supabase.from("promo_codes").insert({
      id,
      code: promoData.code,
      discount_type: promoData.discountType,
      discount_value: promoData.discountValue,
      min_order_amount: promoData.minOrderAmount,
      valid_from: promoData.validFrom,
      is_active: promoData.isActive,
      current_uses: 0,
    });

    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },

  togglePromotion: async (id) => {
    const supabase = createClient();
    const promo = get().promotions.find((p) => p.id === id);
    if (!promo) return;

    const { error } = await supabase
      .from("promo_codes")
      .update({ is_active: !promo.isActive })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },

  deletePromotion: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },

  addOrder: async (orderData) => {
    const supabase = createClient();
    const id = `ord_${Math.random().toString(36).substring(2, 9)}`;

    const year = new Date().getFullYear();
    const { count } = await supabase.from("orders").select("*", { count: "exact", head: true });
    const orderNumber = `CF-${year}-${String((count || 0) + 1).padStart(6, "0")}`;
    const timestamp = new Date().toISOString();

    const { error: orderErr } = await supabase.from("orders").insert({
      id,
      order_number: orderNumber,
      user_id: orderData.userId,
      status: orderData.status,
      shipping_address: orderData.shippingAddress,
      billing_address: orderData.billingAddress,
      subtotal: orderData.subtotal,
      shipping_cost: orderData.shippingCost,
      tax_amount: orderData.taxAmount,
      discount_amount: orderData.discountAmount,
      total: orderData.total,
      payment_method: orderData.paymentMethod,
      payment_status: orderData.paymentStatus,
      payment_reference: orderData.paymentReference,
      promo_code: orderData.promoCode,
      notes: orderData.notes,
      is_wholesale: orderData.isWholesale,
      tracking_number: orderData.trackingNumber,
      estimated_delivery: orderData.estimatedDelivery,
      created_at: timestamp,
      updated_at: timestamp,
    });

    if (orderErr) throw new Error(orderErr.message);

    if (orderData.items && orderData.items.length > 0) {
      const itemsToInsert = orderData.items.map((item) => ({
        order_id: id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        product_image: item.productImage,
        product_price: item.productPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsErr) throw new Error(itemsErr.message);
    }

    await get().fetchStoreData();

    return {
      ...orderData,
      id,
      orderNumber,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as Order;
  },

  updateOrderStatus: async (id, status) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await get().fetchStoreData();
  },
}));
