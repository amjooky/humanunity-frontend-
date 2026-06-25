"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Grid } from "@/components/layout/Grid";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useProductStore } from "@/stores/productStore";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { formatPrice, PRODUCT_PLACEHOLDER } from "@/lib/utils";
import { OrderStatus } from "@cf/shared/types/order";
import { Product } from "@cf/shared/types/product";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-distribution.onrender.com";

// ─── Helpers ─────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "warning", confirmed: "info", processing: "info",
    shipped: "info", delivered: "success", cancelled: "error", refunded: "secondary",
  };
  return <Badge variant={(map[status] || "secondary") as any} size="sm">{status}</Badge>;
}

// ─── Analytics Chart Component ────────────────────────────────
function SalesChart({ data, locale, period }: { data: { label: string; revenue: number; orders: number }[]; locale: string; period: string }) {
  const [hoveredItem, setHoveredItem] = React.useState<typeof data[0] | null>(null);

  const formatChartLabel = (label: string, per: string) => {
    if (!label) return "";
    try {
      if (per === "day") {
        const parts = label.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
      } else if (per === "week") {
        const parts = label.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
      } else if (per === "month") {
        const parts = label.split("-");
        if (parts.length === 2) {
          const months = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
          const mIdx = parseInt(parts[1], 10) - 1;
          return `${months[mIdx] || parts[1]} ${parts[0].slice(-2)}`;
        }
      } else if (per === "year") {
        return label;
      }
    } catch (e) {
      console.error(e);
    }
    return label;
  };

  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-text-tertiary font-body text-xs">
        Aucune donnée disponible pour cette période
      </div>
    );
  }
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic Detail Panel (Top) — prevents absolute tooltips clipping on overflow container */}
      <div className="flex items-center justify-between border-b border-border-default pb-3.5 min-h-[3rem]">
        <span className="font-display text-xs text-text-secondary">
          {hoveredItem ? `Période: ${formatChartLabel(hoveredItem.label, period)}` : "Survolez une barre pour voir les détails"}
        </span>
        {hoveredItem && (
          <div className="flex items-center gap-2.5 animate-fadeIn">
            <span className="px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 font-mono font-bold text-xs">
              {formatPrice(hoveredItem.revenue, locale)}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-accent-50 text-accent-700 font-display font-bold text-xs">
              {hoveredItem.orders} cmd
            </span>
          </div>
        )}
      </div>

      {/* Chart bars area */}
      <div className="flex items-end gap-2 h-44 overflow-x-auto pb-4 pt-2 scrollbar-thin">
        {data.map((item, idx) => {
          const pct = Math.max((item.revenue / maxRevenue) * 100, 3);
          const isHovered = hoveredItem === item;
          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
              style={{ minWidth: "2.75rem" }}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="h-32 w-full flex items-end justify-center">
                <div
                  style={{ height: `${pct}%` }}
                  className={`w-7 rounded-t-lg transition-all duration-300 ${
                    isHovered
                       ? "bg-gradient-to-t from-accent-500 to-accent-300 shadow-md scale-x-105"
                       : "bg-gradient-to-t from-primary-500 to-primary-300"
                  }`}
                />
              </div>
              <span className={`font-display text-[10px] transition-colors duration-300 ${isHovered ? "text-accent-500 font-bold" : "text-text-tertiary"}`}>
                {formatChartLabel(item.label, period)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stock Alert Badge ────────────────────────────────────────
function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <Badge variant="error" size="sm">Rupture</Badge>;
  if (qty <= 5) return <Badge variant="error" size="sm">Critique: {qty}</Badge>;
  return <Badge variant="warning" size="sm">Faible: {qty}</Badge>;
}

export default function AdminPage() {
  const locale = useLocale();
  const router = useRouter();

  // ─── Store ───────────────────────────────────────────────────
  const {
    products, categories, promotions, orders,
    addProduct, updateProduct, deleteProduct,
    addCategory, deleteCategory,
    addPromotion, togglePromotion, deletePromotion,
    updateOrderStatus, fetchStoreData,
  } = useProductStore();

  // ─── Hydration guard ─────────────────────────────────────────
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); fetchStoreData(); }, [fetchStoreData]);

  // ─── Auth Gate ───────────────────────────────────────────────
  const [passcode, setPasscode] = React.useState("");
  const [isAuthorized, setIsAuthorized] = React.useState(false);
  const [authError, setAuthError] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined" && (window.sessionStorage.getItem("cf_admin_auth") === "true" || window.localStorage.getItem("cf_admin_auth") === "true")) {
      setIsAuthorized(true);
    }
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProductFormOpen(false);
        setIsCategoryFormOpen(false);
        setIsPromoFormOpen(false);
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === "admin123") {
      setIsAuthorized(true); setAuthError("");
      window.sessionStorage?.setItem("cf_admin_auth", "true");
      window.localStorage?.setItem("cf_admin_auth", "true");
    } else {
      setAuthError(locale === "ar" ? "رمز المرور غير صحيح" : "Mot de passe incorrect");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    window.sessionStorage?.removeItem("cf_admin_auth");
    window.localStorage?.removeItem("cf_admin_auth");
    router.push("/profile");
  };

  // ─── Active Tab ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<"overview" | "analytics" | "products" | "stock" | "categories" | "promotions" | "orders">("overview");

  // ─── Live Stock Alert Counts (from store) ─────────────────────────────
  const liveAlertCount = React.useMemo(
    () => products.filter((p) => p.stockQuantity <= 10).length,
    [products]
  );
  const liveOutOfStockCount = React.useMemo(
    () => products.filter((p) => p.stockQuantity === 0).length,
    [products]
  );
  // Inline stock editing
  const [editingStockId, setEditingStockId] = React.useState<string | null>(null);
  const [editingStockQty, setEditingStockQty] = React.useState<number>(0);
  const [stockUpdateLoading, setStockUpdateLoading] = React.useState(false);

  const handleQuickUpdateStock = async (prod: Product) => {
    setStockUpdateLoading(true);
    try {
      await updateProduct({ ...prod, stockQuantity: editingStockQty });
    } catch (e) { console.error("Stock update error:", e); }
    finally { setStockUpdateLoading(false); setEditingStockId(null); }
  };

  // ─── Analytics State ─────────────────────────────────────────
  const [analyticsPeriod, setAnalyticsPeriod] = React.useState<"day" | "week" | "month" | "year">("month");
  const [salesData, setSalesData] = React.useState<{ label: string; revenue: number; orders: number }[]>([]);
  const [bestSellers, setBestSellers] = React.useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = React.useState<any[]>([]);
  const [analyticsOverview, setAnalyticsOverview] = React.useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = React.useState(false);

  const fetchAnalytics = React.useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const [overviewRes, salesRes, sellersRes, stockRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/analytics/overview`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/analytics/sales-by-period?period=${analyticsPeriod}`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/analytics/best-sellers?limit=5`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/analytics/stock-alerts?threshold=10`).then(r => r.json()),
      ]);
      if (overviewRes.success) setAnalyticsOverview(overviewRes.data);
      if (salesRes.success) setSalesData(salesRes.data);
      if (sellersRes.success) setBestSellers(sellersRes.data);
      if (stockRes.success) setStockAlerts(stockRes.data);
    } catch (e) { console.error("Analytics fetch error:", e); }
    finally { setAnalyticsLoading(false); }
  }, [analyticsPeriod]);

  React.useEffect(() => {
    if (isAuthorized && (activeTab === "analytics" || activeTab === "overview")) {
      fetchAnalytics();
    }
  }, [isAuthorized, activeTab, analyticsPeriod, fetchAnalytics]);

  // ─── Search & Filter for Products ────────────────────────────
  const [productSearch, setProductSearch] = React.useState("");
  const [selectedProductCategory, setSelectedProductCategory] = React.useState("all");

  // ─── Product Form State ───────────────────────────────────────
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = React.useState(false);
  const [productFormData, setProductFormData] = React.useState({
    name: "", nameEn: "", nameAr: "", slug: "", shortDescription: "", description: "",
    price: 0, comparePrice: 0, sku: "", categorySlug: "t-shirts", brand: "", badge: "" as any,
    stockQuantity: 10, isActive: true, isWholesale: false, tagsString: "",
    mainImage: PRODUCT_PLACEHOLDER,
    metaWeight: "", metaFabric: "", metaFit: "",
  });

  // ─── Image Upload State ───────────────────────────────────────
  const [imageUploading, setImageUploading] = React.useState(false);
  const [imageUploadError, setImageUploadError] = React.useState("");
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  const CSV_COLUMNS = ["name","nameEn","nameAr","slug","sku","price","comparePrice","stockQuantity","categorySlug","brand","badge","shortDescription","description","mainImage","tags","isActive","isWholesale","metaWeight","metaFabric","metaFit"];

  const handleDownloadCsvTemplate = () => {
    const header = CSV_COLUMNS.join(",");
    const example = [
      "T-Shirt Com.unity - Noir","Com.unity T-Shirt - Black","تي شيرت Com.unity أسود","comunity-tshirt-black","HU-TSH-001","85.000","95.000","100","t-shirts","HUMAN.UNITY","new","T-shirt oversized premium fabriqué en coton lourd 240 GSM.","Un t-shirt oversized haut de gamme arborant le logo Com.unity brodé au centre.","https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800","Oversized;Coton Lourd;Noir","true","false","240 GSM","100% Coton","Oversized"
    ].join(",");
    const csv = header + "\n" + example;
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "modele-import-produits.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].match(/(".*?"|[^,]*)/g)?.map(v => v.trim().replace(/^"|"$/g, "")) || [];
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
        if (!row.name || !row.price) continue;
        const catSlug = row.categorySlug || "t-shirts";
        const cat = categories.find(c => c.slug === catSlug) || { id: "cat_" + catSlug, slug: catSlug, name: catSlug, order: 9 };
        const tags = (row.tags || "").split(";").map(t => t.trim()).filter(t => t);
        const meta: Record<string, string> = {};
        if (row.metaWeight) meta.weight = row.metaWeight;
        if (row.metaFabric) meta.fabric = row.metaFabric;
        if (row.metaFit) meta.fit = row.metaFit;
        // Fallbacks for coffee headers
        if (row.metaIntensity) meta.weight = row.metaIntensity;
        if (row.metaOrigin) meta.fabric = row.metaOrigin;
        if (row.metaRoast) meta.fit = row.metaRoast;
        addProduct({
          id: `prod_csv_${Date.now()}_${i}`,
          sanityId: `csv_${Date.now()}_${i}`,
          slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: row.name, nameEn: row.nameEn || undefined, nameAr: row.nameAr || undefined,
          shortDescription: row.shortDescription || row.description?.slice(0, 100) || row.name,
          description: row.description || row.name,
          price: Number(row.price) || 0, comparePrice: row.comparePrice ? Number(row.comparePrice) : undefined,
          sku: row.sku || `CF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          category: cat, brand: row.brand || undefined, badge: (row.badge || undefined) as any,
          mainImage: row.mainImage || PRODUCT_PLACEHOLDER,
          images: [{ url: row.mainImage || PRODUCT_PLACEHOLDER, alt: row.name, width: 800, height: 800 }],
          variants: [{ id: `opt_csv_${i}`, name: "Standard", optionType: "size" as const, priceModifier: 0, stockQuantity: Number(row.stockQuantity) || 10 }],
          stockQuantity: Number(row.stockQuantity) || 10,
          isActive: row.isActive !== "false", isWholesale: row.isWholesale === "true",
          tags, metadata: meta,
        });
        imported++;
      }
      alert(`${imported} produit(s) importé(s) avec succès !`);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    setImageUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${BACKEND_URL}/api/upload/product-image`, { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        setProductFormData((prev) => ({ ...prev, mainImage: data.data.url }));
      } else {
        setImageUploadError(data.error?.message || "Erreur lors de l'upload");
      }
    } catch (e: any) {
      setImageUploadError("Erreur réseau lors de l'upload");
    } finally {
      setImageUploading(false);
    }
  };

  // ─── Category Form State ──────────────────────────────────────
  const [isCategoryFormOpen, setIsCategoryFormOpen] = React.useState(false);
  const [categoryFormData, setCategoryFormData] = React.useState({
    name: "", nameEn: "", nameAr: "", slug: "", description: "", order: 1,
  });

  // ─── Promo Form State ─────────────────────────────────────────
  const [isPromoFormOpen, setIsPromoFormOpen] = React.useState(false);
  const [promoFormData, setPromoFormData] = React.useState({
    code: "", discountType: "percentage" as "percentage" | "fixed",
    discountValue: 10, minOrderAmount: 0, isActive: true,
  });

  // ─── Order Detail State ───────────────────────────────────────
  const [selectedOrder, setSelectedOrder] = React.useState<any | null>(null);
  const [orderTrackingNum, setOrderTrackingNum] = React.useState("");
  const [whatsappSending, setWhatsappSending] = React.useState(false);
  const [whatsappResult, setWhatsappResult] = React.useState<"sent" | "error" | null>(null);

  const handleSendWhatsApp = async (order: any, status: string) => {
    setWhatsappSending(true); setWhatsappResult(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/whatsapp/send-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: order.shippingAddress.phone,
          orderNumber: order.orderNumber,
          customerName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
          status,
          trackingNumber: orderTrackingNum || order.trackingNumber,
          total: order.total,
        }),
      });
      const data = await res.json();
      setWhatsappResult(data.success ? "sent" : "error");
    } catch { setWhatsappResult("error"); }
    finally { setWhatsappSending(false); setTimeout(() => setWhatsappResult(null), 4000); }
  };

  // ─── Dashboard KPIs ──────────────────────────────────────────
  const analytics = React.useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== "cancelled");
    const totalSales = validOrders.reduce((sum, o) => sum + o.total, 0);
    const averageBasket = validOrders.length > 0 ? totalSales / validOrders.length : 0;
    const activeCouponsCount = promotions.filter((p) => p.isActive).length;
    const cityRevenueMap: Record<string, number> = {};
    validOrders.forEach((o) => {
      let city = (o.shippingAddress?.city || "Autre").trim();
      city = city.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      cityRevenueMap[city] = (cityRevenueMap[city] || 0) + o.total;
    });
    const cityChartData = Object.entries(cityRevenueMap).map(([city, revenue]) => ({ city, revenue }));
    return { totalSales, totalOrdersCount: orders.length, averageBasket, activeCouponsCount, cityChartData };
  }, [orders, promotions]);

  // ─── Product CRUD ─────────────────────────────────────────────
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      name: "", nameEn: "", nameAr: "", slug: "", shortDescription: "", description: "",
      price: 0, comparePrice: 0, sku: "", categorySlug: categories[0]?.slug || "t-shirts",
      brand: "", badge: "" as any, stockQuantity: 10, isActive: true, isWholesale: false,
      tagsString: "", mainImage: PRODUCT_PLACEHOLDER,
      metaWeight: "", metaFabric: "", metaFit: "",
    });
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormData({
      name: prod.name, nameEn: prod.nameEn || "", nameAr: prod.nameAr || "",
      slug: prod.slug, shortDescription: prod.shortDescription, description: prod.description,
      price: prod.price, comparePrice: prod.comparePrice || 0, sku: prod.sku,
      categorySlug: prod.category.slug, brand: prod.brand || "", badge: prod.badge || ("" as any),
      stockQuantity: prod.stockQuantity, isActive: prod.isActive, isWholesale: prod.isWholesale,
      tagsString: prod.tags.join(", "), mainImage: prod.mainImage,
      metaWeight: prod.metadata.weight || prod.metadata.intensity || "",
      metaFabric: prod.metadata.fabric || prod.metadata.origin || "",
      metaFit: prod.metadata.fit || prod.metadata.roast || "",
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.slug === productFormData.categorySlug) || {
      id: "cat_custom", slug: productFormData.categorySlug, name: productFormData.categorySlug, order: 9,
    };
    const tags = productFormData.tagsString.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
    const meta: Record<string, string> = {};
    if (productFormData.metaWeight) {
      meta.weight = productFormData.metaWeight;
      meta.intensity = productFormData.metaWeight;
    }
    if (productFormData.metaFabric) {
      meta.fabric = productFormData.metaFabric;
      meta.origin = productFormData.metaFabric;
    }
    if (productFormData.metaFit) {
      meta.fit = productFormData.metaFit;
      meta.roast = productFormData.metaFit;
    }
    const baseProductData = {
      slug: productFormData.slug || productFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: productFormData.name, nameEn: productFormData.nameEn || undefined, nameAr: productFormData.nameAr || undefined,
      shortDescription: productFormData.shortDescription, description: productFormData.description,
      price: Number(productFormData.price), comparePrice: productFormData.comparePrice ? Number(productFormData.comparePrice) : undefined,
      sku: productFormData.sku || `CF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      category: cat, brand: productFormData.brand || undefined, badge: productFormData.badge || undefined,
      mainImage: productFormData.mainImage,
      images: [{ url: productFormData.mainImage, alt: productFormData.name, width: 800, height: 800 }],
      variants: [{
        id: `opt_${Math.random().toString(36).substring(2, 7)}`, name: "Standard",
        optionType: "size" as const, priceModifier: 0, stockQuantity: Number(productFormData.stockQuantity),
      }],
      stockQuantity: Number(productFormData.stockQuantity), isActive: productFormData.isActive,
      isWholesale: productFormData.isWholesale, tags, metadata: meta,
      sanityId: editingProduct?.sanityId || `custom_${Math.random().toString(36).substring(2, 7)}`,
    };
    if (editingProduct) {
      updateProduct({ ...editingProduct, ...baseProductData, id: editingProduct.id });
    } else {
      addProduct({ ...baseProductData, id: `prod_${Math.random().toString(36).substring(2, 9)}` });
    }
    setIsProductFormOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Confirmez-vous la suppression de ce produit ?")) deleteProduct(id);
  };

  // ─── Category CRUD ────────────────────────────────────────────
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = categoryFormData.slug || categoryFormData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    addCategory({ slug, name: categoryFormData.name, nameEn: categoryFormData.nameEn || undefined, nameAr: categoryFormData.nameAr || undefined, description: categoryFormData.description || undefined, order: Number(categoryFormData.order) });
    setCategoryFormData({ name: "", nameEn: "", nameAr: "", slug: "", description: "", order: 1 });
    setIsCategoryFormOpen(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm("Confirmez-vous la suppression de cette catégorie ?")) deleteCategory(id);
  };

  // ─── Promo CRUD ───────────────────────────────────────────────
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    addPromotion({ code: promoFormData.code.toUpperCase(), discountType: promoFormData.discountType, discountValue: Number(promoFormData.discountValue), minOrderAmount: Number(promoFormData.minOrderAmount), validFrom: new Date().toISOString(), isActive: promoFormData.isActive });
    setPromoFormData({ code: "", discountType: "percentage", discountValue: 10, minOrderAmount: 0, isActive: true });
    setIsPromoFormOpen(false);
  };

  // ─── Filtered Products ────────────────────────────────────────
  const displayedProducts = React.useMemo(() => products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.sku.toLowerCase().includes(productSearch.toLowerCase()) || (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase()));
    const matchCat = selectedProductCategory === "all" || p.category.slug === selectedProductCategory;
    return matchSearch && matchCat;
  }), [products, productSearch, selectedProductCategory]);

  // ─── Loading Guard ────────────────────────────────────────────
  if (!isMounted) return (
    <div className="min-h-[70vh] flex items-center justify-center bg-cream">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-accent-400 border-t-transparent rounded-full animate-spin" />
        <span className="font-display font-medium text-sm text-text-secondary">Chargement...</span>
      </div>
    </div>
  );

  // ─── Auth Gate ────────────────────────────────────────────────
  if (!isAuthorized) return (
    <Section padding="luxury" background="cream" className="flex-1 min-h-[80vh] flex items-center justify-center">
      <Container className="max-w-md">
        <Card className="p-8 md:p-10 border border-border-default shadow-elevated bg-white rounded-3xl text-center">
          <div className="w-16 h-16 rounded-full bg-accent-500/10 text-accent-500 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1v-3a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
            </svg>
          </div>
          <h1 className="font-display font-bold text-2xl text-text-primary mb-2">Portail Admin</h1>
          <p className="font-body text-xs text-text-secondary mb-6">Veuillez saisir le code d'accès de sécurité pour gérer le site.</p>
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            <Input type="password" placeholder="Code d'accès administrateur" value={passcode} onChange={(e) => setPasscode(e.target.value)} error={authError} autoFocus />
            <Button type="submit" variant="primary" className="w-full rounded-xl">Déverrouiller</Button>
          </form>
        </Card>
      </Container>
    </Section>
  );

  // ─── Main Admin UI ────────────────────────────────────────────
  return (
    <Section padding="lg" background="cream" className="flex-1 min-h-[85vh]">
      <Container>
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-default pb-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
                {locale === "ar" ? "لوحة الإدارة الفاخرة" : "Espace Admin & Inventaire"}
              </h1>
              <Badge variant="gold" size="sm">Live State</Badge>
            </div>
            <p className="font-body text-xs text-text-secondary mt-1">Gérez les stocks, ajoutez des produits et suivez les commandes en temps réel.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl flex items-center gap-2">
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            {locale === "ar" ? "تسجيل الخروج" : "Déconnexion"}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-1 gap-2 mb-6 border-b border-border-default scrollbar-none">
          {[
            { id: "overview", label: "Vue d'ensemble", icon: "📊" },
            { id: "analytics", label: "Analytique", icon: "📈" },
            { id: "products", label: "Produits", icon: "📦" },
            { id: "stock", label: "Gestion de Stock", icon: "⚠️", badge: liveAlertCount },
            { id: "categories", label: "Catégories", icon: "📁" },
            { id: "promotions", label: "Codes Promo", icon: "🏷️" },
            { id: "orders", label: "Commandes", icon: "🛒", badge: orders.filter((o) => o.status === "pending").length },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-t-xl font-display font-medium text-xs md:text-sm transition-all flex items-center gap-2 whitespace-nowrap border-b-2 -mb-0.5 ${activeTab === tab.id ? "border-accent-500 text-accent-500 bg-white/50" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
              <span>{tab.icon}</span><span>{tab.label}</span>
              {(tab as any).badge > 0 && <span className="bg-accent-500 text-white font-display text-[9px] font-bold px-1.5 py-0.5 rounded-full">{(tab as any).badge}</span>}
            </button>
          ))}
        </div>

        {/* ═══ OVERVIEW TAB ═══ */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            {/* KPI Cards */}
            <Grid cols={1} colsSm={2} colsLg={4} gap="md">
              {[
                { title: "Chiffre d'Affaires", value: formatPrice(analytics.totalSales, locale), desc: "Commandes non-annulées", color: "border-l-4 border-accent-400" },
                { title: "Nombre de Commandes", value: analytics.totalOrdersCount, desc: "Volume global", color: "border-l-4 border-emerald-400" },
                { title: "Panier Moyen", value: formatPrice(analytics.averageBasket, locale), desc: "Par commande confirmée", color: "border-l-4 border-blue-400" },
                { title: "Coupons Actifs", value: analytics.activeCouponsCount, desc: "Offres promotionnelles", color: "border-l-4 border-purple-400" },
              ].map((stat, i) => (
                <Card key={i} className={`p-6 border border-border-default rounded-2xl bg-white ${stat.color}`}>
                  <span className="font-display font-medium text-xs uppercase tracking-wider text-text-secondary">{stat.title}</span>
                  <span className="font-display font-bold text-2xl text-text-primary block mt-2 tracking-tight">{stat.value}</span>
                  <span className="font-body text-[10px] text-text-tertiary mt-1 block">{stat.desc}</span>
                </Card>
              ))}
            </Grid>

            {/* Stock Alerts Banner */}
            {stockAlerts.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <h3 className="font-display font-bold text-sm text-orange-800">Alertes de Stock</h3>
                    <p className="font-body text-xs text-orange-600">{stockAlerts.length} produit(s) nécessitent un réapprovisionnement</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {stockAlerts.slice(0, 6).map((p: any) => (
                    <div key={p.id} className="bg-white border border-orange-200 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-display font-semibold text-xs text-text-primary truncate max-w-[140px]">{p.name}</p>
                        <p className="font-body text-[10px] text-text-tertiary">{p.sku}</p>
                      </div>
                      <StockBadge qty={p.stock_quantity} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts Row */}
            <Grid cols={1} colsLg={3} gap="lg">
              <Card className="lg:col-span-2 p-6 bg-white border border-border-default rounded-3xl">
                <CardHeader className="p-0 mb-6">
                  <CardTitle>Ventes par Ville / Gouvernorat</CardTitle>
                  <CardDescription>Répartition géographique du chiffre d'affaires</CardDescription>
                </CardHeader>
                <div className="pt-2">
                  {analytics.cityChartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center text-text-tertiary font-body text-xs">Aucune donnée de vente disponible</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                      {/* Left: Progress list of cities sorted by revenue descending */}
                      <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                        {analytics.cityChartData
                          .sort((a, b) => b.revenue - a.revenue)
                          .map((item, idx) => {
                            const totalRevenue = analytics.totalSales || 1;
                            const pctOfTotal = (item.revenue / totalRevenue) * 100;
                            return (
                              <div key={idx} className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-surface-50 border border-border-default/40 hover:border-accent-400/40 transition-all duration-300">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="font-display font-bold text-text-primary capitalize">{item.city}</span>
                                  <span className="font-mono font-bold text-accent-600">{formatPrice(item.revenue, locale)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 bg-surface-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className="bg-gradient-to-r from-primary-500 to-accent-400 h-full rounded-full transition-all duration-1000"
                                      style={{ width: `${pctOfTotal}%` }}
                                    />
                                  </div>
                                  <span className="font-display text-[10px] font-bold text-text-secondary w-10 text-right">
                                    {pctOfTotal.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Right: Premium summary card */}
                      <div className="flex flex-col gap-5 p-6 rounded-3xl bg-primary-950 text-white relative overflow-hidden shadow-elevated">
                        <div className="grain-overlay opacity-5" />
                        <div
                          className="absolute -top-16 -right-16 w-36 h-36 rounded-full opacity-10 blur-2xl"
                          style={{ background: "radial-gradient(circle, #D4A84F, transparent)" }}
                        />
                        <h4 className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-accent-400">
                          Aperçu Géographique
                        </h4>
                        <p className="font-body text-xs text-white/70 leading-relaxed">
                          Le gouvernorat leader pour vos ventes est <strong className="text-white capitalize font-display">
                            {analytics.cityChartData.sort((a, b) => b.revenue - a.revenue)[0]?.city || "N/A"}
                          </strong>, représentant un volume de <strong className="text-accent-300">
                            {((analytics.cityChartData.sort((a, b) => b.revenue - a.revenue)[0]?.revenue || 0) / (analytics.totalSales || 1) * 100).toFixed(1)}%
                          </strong> du chiffre d'affaires total non annulé.
                        </p>
                        <div className="h-px bg-white/10 my-2" />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="font-body text-[9px] text-white/50 uppercase tracking-wider block">Régions Actives</span>
                            <span className="font-display font-bold text-2xl text-white mt-1 block">{analytics.cityChartData.length}</span>
                          </div>
                          <div>
                            <span className="font-body text-[9px] text-white/50 uppercase tracking-wider block">Leader Régional</span>
                            <span className="font-display font-bold text-lg text-accent-300 truncate mt-1 block capitalize">
                              {analytics.cityChartData.sort((a, b) => b.revenue - a.revenue)[0]?.city || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-white border border-border-default rounded-3xl">
                <CardHeader className="p-0 mb-6">
                  <CardTitle>Dernières Commandes</CardTitle>
                  <CardDescription>Aperçu des 5 commandes récentes</CardDescription>
                </CardHeader>
                <div className="flex flex-col gap-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} onClick={() => { setSelectedOrder(order); setOrderTrackingNum(order.trackingNumber || ""); setActiveTab("orders"); }}
                      className="p-3 border border-border-default rounded-xl hover:border-accent-400 hover:bg-surface-50 transition-all cursor-pointer flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-display font-bold text-xs text-text-primary">{order.orderNumber}</span>
                        <span className="font-body text-[10px] text-text-secondary">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <PriceDisplay price={order.total} size="sm" />
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <div className="py-8 text-center font-body text-xs text-text-tertiary">Aucune commande enregistrée.</div>}
                </div>
              </Card>
            </Grid>
          </div>
        )}

        {/* ═══ ANALYTICS TAB ═══ */}
        {activeTab === "analytics" && (
          <div className="flex flex-col gap-8 animate-fadeIn">
            {/* Period Selector */}
            <div className="flex items-center justify-between bg-white p-4 border border-border-default rounded-2xl">
              <h3 className="font-display font-bold text-sm text-text-primary">Tableau de bord analytique</h3>
              <div className="flex gap-2">
                {(["day", "week", "month", "year"] as const).map((p) => (
                  <button key={p} onClick={() => setAnalyticsPeriod(p)}
                    className={`px-4 py-2 rounded-xl font-display font-semibold text-xs transition-all ${analyticsPeriod === p ? "bg-primary-500 text-white" : "bg-surface-100 text-text-secondary hover:bg-surface-200"}`}>
                    {p === "day" ? "Jour" : p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
                  </button>
                ))}
              </div>
            </div>

            {analyticsLoading ? (
              <div className="py-20 flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-body text-sm text-text-secondary">Chargement des données...</span>
              </div>
            ) : (
              <>
                {/* Analytics KPIs */}
                {analyticsOverview && (
                  <Grid cols={2} colsLg={4} gap="md">
                    {[
                      { label: "Revenus Totaux", val: `${analyticsOverview.totalRevenue?.toFixed(3)} DT`, icon: "💰", color: "text-emerald-600 bg-emerald-50" },
                      { label: "Commandes", val: analyticsOverview.totalOrders, icon: "📦", color: "text-blue-600 bg-blue-50" },
                      { label: "Valeur Moyenne", val: `${analyticsOverview.avgOrderValue?.toFixed(3)} DT`, icon: "🛒", color: "text-purple-600 bg-purple-50" },
                      { label: "Avis Publiés", val: analyticsOverview.totalReviews, icon: "⭐", color: "text-amber-600 bg-amber-50" },
                    ].map((kpi, i) => (
                      <Card key={i} className="p-5 bg-white border border-border-default rounded-2xl flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${kpi.color}`}>{kpi.icon}</div>
                        <div>
                          <p className="font-body text-[10px] text-text-tertiary uppercase tracking-wider">{kpi.label}</p>
                          <p className="font-display font-bold text-lg text-text-primary">{kpi.val}</p>
                        </div>
                      </Card>
                    ))}
                  </Grid>
                )}

                {/* Sales Time-Series Chart */}
                <Card className="p-6 bg-white border border-border-default rounded-3xl">
                  <CardHeader className="p-0 mb-6">
                    <CardTitle>Évolution des Ventes</CardTitle>
                    <CardDescription>Chiffre d'affaires par {analyticsPeriod === "day" ? "jour" : analyticsPeriod === "week" ? "semaine" : analyticsPeriod === "month" ? "mois" : "année"}</CardDescription>
                  </CardHeader>
                  <SalesChart data={salesData} locale={locale} period={analyticsPeriod} />
                </Card>

                <Grid cols={1} colsLg={2} gap="lg">
                  {/* Best Sellers */}
                  <Card className="p-6 bg-white border border-border-default rounded-3xl">
                    <CardHeader className="p-0 mb-6">
                      <CardTitle>🏆 Meilleures Ventes</CardTitle>
                      <CardDescription>Produits les plus commandés</CardDescription>
                    </CardHeader>
                    <div className="flex flex-col gap-3">
                      {bestSellers.length === 0 ? (
                        <p className="font-body text-xs text-text-tertiary py-8 text-center">Aucune vente enregistrée</p>
                      ) : bestSellers.map((item, idx) => (
                        <div key={item.product_id} className="flex items-center gap-4 p-3 bg-surface-50 rounded-xl">
                          <span className="font-display font-bold text-lg text-text-tertiary w-6 text-center">{idx + 1}</span>
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg border border-border-default flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-display font-semibold text-xs text-text-primary truncate">{item.product_name}</p>
                            <p className="font-body text-[10px] text-text-tertiary">{item.total_qty} unités vendues</p>
                          </div>
                          <span className="font-display font-bold text-sm text-accent-500 whitespace-nowrap">{item.total_revenue?.toFixed(3)} DT</span>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Stock Alerts Panel */}
                  <Card className="p-6 bg-white border border-border-default rounded-3xl">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>⚠️ Alertes Stock</CardTitle>
                          <CardDescription>Produits nécessitant un réapprovisionnement</CardDescription>
                        </div>
                        {analyticsOverview && (
                          <div className="flex gap-2">
                            {analyticsOverview.outOfStockCount > 0 && <Badge variant="error" size="sm">Rupture: {analyticsOverview.outOfStockCount}</Badge>}
                            {analyticsOverview.lowStockCount > 0 && <Badge variant="warning" size="sm">Faible: {analyticsOverview.lowStockCount}</Badge>}
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <div className="flex flex-col gap-3 max-h-72 overflow-y-auto">
                      {stockAlerts.length === 0 ? (
                        <div className="py-8 text-center flex flex-col items-center gap-2">
                          <span className="text-2xl">✅</span>
                          <p className="font-body text-xs text-text-secondary">Tous les stocks sont suffisants</p>
                        </div>
                      ) : stockAlerts.map((p: any) => (
                        <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border ${p.stock_quantity === 0 ? "bg-red-50 border-red-200" : "bg-orange-50 border-orange-200"}`}>
                          <div>
                            <p className="font-display font-semibold text-xs text-text-primary">{p.name}</p>
                            <p className="font-body text-[10px] text-text-tertiary">{p.sku} · {p.category}</p>
                          </div>
                          <StockBadge qty={p.stock_quantity} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </Grid>
              </>
            )}
          </div>
        )}

        {/* ═══ PRODUCTS TAB ═══ */}
        {activeTab === "products" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 border border-border-default rounded-2xl shadow-sm">
              <div className="flex flex-1 flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input type="text" placeholder="Rechercher par nom, SKU ou marque..."
                    value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-border-default rounded-xl font-body text-xs focus:outline-none focus:border-border-focus" />
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-text-tertiary">🔍</div>
                </div>
                <select value={selectedProductCategory} onChange={(e) => setSelectedProductCategory(e.target.value)}
                  className="px-4 py-2.5 bg-surface-50 border border-border-default rounded-xl font-display text-xs cursor-pointer focus:outline-none">
                  <option value="all">Toutes les catégories</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{locale === "ar" ? c.nameAr || c.name : locale === "en" ? c.nameEn || c.name : c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="md" onClick={() => csvInputRef.current?.click()} className="rounded-xl flex items-center gap-2 text-xs">
                  <span>📥</span><span>Importer CSV</span>
                </Button>
                <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvImport} />
                <a href="/csv-template-products.csv" download className="hidden" id="csv-dl" />
                <Button variant="outline" size="md" onClick={handleDownloadCsvTemplate} className="rounded-xl flex items-center gap-2 text-xs">
                  <span>📄</span><span>Modèle CSV</span>
                </Button>
                <Button variant="primary" size="md" onClick={handleOpenAddProduct} className="rounded-xl flex items-center gap-2 text-xs">
                  <span>➕</span><span>Ajouter un produit</span>
                </Button>
              </div>
            </div>

            {/* Table */}
            <Card className="bg-white border border-border-default rounded-3xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border-default bg-surface-100 font-display text-xs text-text-secondary">
                    <th className="py-4 px-6 font-semibold">Produit</th>
                    <th className="py-4 px-6 font-semibold">SKU</th>
                    <th className="py-4 px-6 font-semibold">Catégorie</th>
                    <th className="py-4 px-6 font-semibold">Prix</th>
                    <th className="py-4 px-6 font-semibold text-center">Stock</th>
                    <th className="py-4 px-6 font-semibold text-center">Visibilité</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default font-body text-xs text-text-primary">
                  {displayedProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-surface-50 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-surface-100 border border-border-default rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                          <img src={prod.mainImage} alt={prod.name} onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-display font-bold text-xs text-text-primary block">{prod.name}</span>
                          <span className="font-body text-[10px] text-text-tertiary block mt-0.5">{prod.brand || "HUMAN.UNITY"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-text-secondary">{prod.sku}</td>
                      <td className="py-4 px-6 text-text-secondary">{locale === "ar" ? prod.category.nameAr || prod.category.name : locale === "en" ? prod.category.nameEn || prod.category.name : prod.category.name}</td>
                      <td className="py-4 px-6">
                        <PriceDisplay price={prod.price} size="sm" />
                        {prod.comparePrice && <span className="text-[10px] text-text-tertiary line-through ml-1.5 block">{formatPrice(prod.comparePrice, locale)}</span>}
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        <span className={prod.stockQuantity <= 5 ? "text-error" : prod.stockQuantity <= 20 ? "text-warning" : "text-success"}>{prod.stockQuantity}</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={prod.isActive ? "success" : "secondary"} size="sm">{prod.isActive ? "Actif" : "Brouillon"}</Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => handleOpenEditProduct(prod)} className="p-1.5 hover:bg-surface-200 rounded-lg text-text-secondary hover:text-text-primary transition-all" title="Modifier">✏️</button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-error hover:text-red-700 transition-all" title="Supprimer">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayedProducts.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-text-tertiary font-body">Aucun produit trouvé correspondant aux filtres.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>

            {/* Product Form Modal */}
            {isProductFormOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <Card className="w-full max-w-3xl bg-white border border-border-default shadow-elevated rounded-3xl max-h-[90vh] overflow-y-auto animate-scaleUp">
                  <CardHeader className="border-b border-border-default p-6 flex flex-row justify-between items-center">
                    <div>
                      <CardTitle>{editingProduct ? "Modifier le produit" : "Ajouter un produit"}</CardTitle>
                      <CardDescription>Remplissez les détails ci-dessous pour modifier la boutique.</CardDescription>
                    </div>
                    <button onClick={() => setIsProductFormOpen(false)} className="text-xl text-text-tertiary hover:text-text-primary p-2">✖</button>
                  </CardHeader>
                  <form onSubmit={handleSaveProduct}>
                    <CardContent className="p-6 flex flex-col gap-5">
                      {/* Names */}
                      <Grid cols={1} colsSm={3} gap="md">
                        <Input label="Nom (Français)" required value={productFormData.name} onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })} />
                        <Input label="Nom (English)" value={productFormData.nameEn} onChange={(e) => setProductFormData({ ...productFormData, nameEn: e.target.value })} />
                        <Input label="Nom (العربية)" value={productFormData.nameAr} onChange={(e) => setProductFormData({ ...productFormData, nameAr: e.target.value })} />
                      </Grid>
                      {/* Slug + SKU */}
                      <Grid cols={1} colsSm={2} gap="md">
                        <Input label="Slug (URL unique)" placeholder="ex: shark-energy-drink" value={productFormData.slug} onChange={(e) => setProductFormData({ ...productFormData, slug: e.target.value })} />
                        <Input label="SKU" placeholder="ex: CF-BEV-SHARK" value={productFormData.sku} onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })} />
                      </Grid>
                      {/* Pricing */}
                      <Grid cols={1} colsSm={3} gap="md">
                        <Input label="Prix (DT)" type="number" step="0.001" required value={productFormData.price || ""} onChange={(e) => setProductFormData({ ...productFormData, price: Number(e.target.value) })} />
                        <Input label="Prix Barré (DT, optionnel)" type="number" step="0.001" value={productFormData.comparePrice || ""} onChange={(e) => setProductFormData({ ...productFormData, comparePrice: Number(e.target.value) })} />
                        <Input label="Quantité en Stock" type="number" required value={productFormData.stockQuantity || ""} onChange={(e) => setProductFormData({ ...productFormData, stockQuantity: Number(e.target.value) })} />
                      </Grid>
                      {/* Category + brand + badge */}
                      <Grid cols={1} colsSm={3} gap="md">
                        <Select label="Catégorie" value={productFormData.categorySlug} onChange={(e) => setProductFormData({ ...productFormData, categorySlug: e.target.value })} options={categories.map((c) => ({ value: c.slug, label: c.name }))} />
                        <Input label="Marque" placeholder="ex: Shark, Kyufi, Red Bull..." value={productFormData.brand} onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })} />
                        <Select label="Badge" value={productFormData.badge} onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value as any })} options={[{ value: "", label: "Aucun badge" }, { value: "new", label: "Nouveau (NEW)" }, { value: "bestseller", label: "Best Seller" }, { value: "sale", label: "Promo (SALE)" }, { value: "limited", label: "Édition Limitée" }, { value: "organic", label: "Bio / Naturel" }]} />
                      </Grid>
                      {/* Descriptions */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-display font-medium uppercase tracking-wider text-text-secondary">Description Courte</label>
                        <textarea required rows={2} value={productFormData.shortDescription} onChange={(e) => setProductFormData({ ...productFormData, shortDescription: e.target.value })} className="w-full px-5 py-3.5 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary focus:outline-none focus:border-border-focus" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-display font-medium uppercase tracking-wider text-text-secondary">Description Détaillée</label>
                        <textarea required rows={4} value={productFormData.description} onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })} className="w-full px-5 py-3.5 bg-surface-50 border border-border-default rounded-xl font-body text-sm text-text-primary focus:outline-none focus:border-border-focus" />
                      </div>

                      {/* Image Section — URL-first */}
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-display font-medium uppercase tracking-wider text-text-secondary">Image Principale</label>
                        <div className="flex gap-4 items-start">
                          {/* Preview */}
                          <div className="w-24 h-24 flex-shrink-0 bg-surface-100 border border-border-default rounded-xl overflow-hidden flex items-center justify-center">
                            {productFormData.mainImage ? (
                              <img src={productFormData.mainImage} alt="Preview" className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }} />
                            ) : (
                              <svg className="w-8 h-8 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                            )}
                          </div>
                          <div className="flex-1 flex flex-col gap-2">
                            {/* URL Input — primary method */}
                            <Input label="URL de l'image (méthode recommandée)" placeholder="https://example.com/image.jpg" value={productFormData.mainImage} onChange={(e) => setProductFormData({ ...productFormData, mainImage: e.target.value })} helperText="Collez une URL directe d'image (HTTPS)" />
                            {/* Upload fallback */}
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-text-tertiary font-display uppercase tracking-wider">Ou</span>
                              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                                onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); }} />
                              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={imageUploading}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 border border-border-default text-text-secondary rounded-lg font-display font-semibold text-[10px] hover:bg-surface-200 transition-colors disabled:opacity-60">
                                {imageUploading ? (
                                  <><div className="w-3 h-3 border-2 border-text-tertiary border-t-transparent rounded-full animate-spin" />Upload...</>
                                ) : (
                                  <>📤 Uploader un fichier</>
                                )}
                              </button>
                            </div>
                            {imageUploadError && <p className="text-xs text-error font-body">{imageUploadError}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <Input label="Mots clés / Tags (séparés par des virgules)" placeholder="ex: Oversized, Noir, Coton Lourd" value={productFormData.tagsString} onChange={(e) => setProductFormData({ ...productFormData, tagsString: e.target.value })} />
                      {/* Metadata */}
                      <h4 className="font-display font-semibold text-xs text-accent-500 uppercase tracking-widest mt-2">Fiche Technique (Métadonnées)</h4>
                      <Grid cols={1} colsSm={3} gap="md">
                        <Input label="Grammage / Poids (ex: 240 GSM)" placeholder="ex: 240 GSM" value={productFormData.metaWeight} onChange={(e) => setProductFormData({ ...productFormData, metaWeight: e.target.value })} />
                        <Input label="Matière / Tissu (ex: 100% Coton)" placeholder="ex: 100% Coton" value={productFormData.metaFabric} onChange={(e) => setProductFormData({ ...productFormData, metaFabric: e.target.value })} />
                        <Input label="Coupe / Ajustement (ex: Oversized)" placeholder="ex: Oversized" value={productFormData.metaFit} onChange={(e) => setProductFormData({ ...productFormData, metaFit: e.target.value })} />
                      </Grid>
                      {/* Switches */}
                      <div className="flex gap-6 mt-2 border-t border-border-default pt-4">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={productFormData.isActive} onChange={(e) => setProductFormData({ ...productFormData, isActive: e.target.checked })} className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4" />
                          <span className="font-display font-semibold text-xs text-text-primary uppercase tracking-wider">Produit Actif / Visible</span>
                        </label>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input type="checkbox" checked={productFormData.isWholesale} onChange={(e) => setProductFormData({ ...productFormData, isWholesale: e.target.checked })} className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4" />
                          <span className="font-display font-semibold text-xs text-text-primary uppercase tracking-wider">Réservé Grossistes</span>
                        </label>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t border-border-default bg-surface-100 flex justify-end gap-3">
                      <Button variant="outline" size="md" onClick={() => setIsProductFormOpen(false)} className="rounded-xl">Annuler</Button>
                      <Button type="submit" variant="primary" size="md" className="rounded-xl">Enregistrer le produit</Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ═══ STOCK MANAGEMENT TAB ═══ */}
        {activeTab === "stock" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Stock KPI Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Produits", value: products.length, icon: "📦", color: "border-l-4 border-primary-400" },
                { label: "En Rupture", value: liveOutOfStockCount, icon: "🔴", color: `border-l-4 ${liveOutOfStockCount > 0 ? "border-red-500" : "border-green-400"}` },
                { label: "Stock Faible (≤10)", value: liveAlertCount, icon: "⚠️", color: `border-l-4 ${liveAlertCount > 0 ? "border-orange-400" : "border-green-400"}` },
                { label: "Stocks OK", value: products.filter(p => p.stockQuantity > 10).length, icon: "✅", color: "border-l-4 border-green-400" },
              ].map((s, i) => (
                <div key={i} className={`bg-white rounded-2xl p-5 border border-border-default shadow-sm ${s.color}`}>
                  <div className="text-xl mb-2">{s.icon}</div>
                  <div className="font-display font-bold text-2xl text-text-primary">{s.value}</div>
                  <div className="font-display text-[10px] uppercase tracking-wider text-text-secondary mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Critical alerts */}
            {liveOutOfStockCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">🔴</span>
                <div>
                  <h3 className="font-display font-bold text-sm text-red-800">{liveOutOfStockCount} produit(s) en rupture totale</h3>
                  <p className="font-body text-xs text-red-600">Ces produits ne sont plus disponibles à la vente. Réapprovisionnez immédiatement.</p>
                </div>
              </div>
            )}
            {liveAlertCount > 0 && liveOutOfStockCount === 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-display font-bold text-sm text-orange-800">{liveAlertCount} produit(s) à réapprovisionner</h3>
                  <p className="font-body text-xs text-orange-600">Stock faible détecté — pensez à passer commande bientôt.</p>
                </div>
              </div>
            )}
            {liveAlertCount === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-display font-bold text-sm text-green-800">Tous les stocks sont suffisants</h3>
                  <p className="font-body text-xs text-green-600">Aucun produit ne nécessite de réapprovisionnement immédiat.</p>
                </div>
              </div>
            )}

            {/* Full Stock Table */}
            <div className="bg-white border border-border-default rounded-3xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-border-default flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-text-primary">📦 Inventaire Complet</h3>
                <span className="font-body text-xs text-text-tertiary">{products.length} référence(s) en catalogue</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-border-default bg-surface-100 font-display text-xs text-text-secondary">
                      <th className="py-3 px-5 font-semibold">Produit</th>
                      <th className="py-3 px-5 font-semibold">SKU</th>
                      <th className="py-3 px-5 font-semibold">Catégorie</th>
                      <th className="py-3 px-5 font-semibold text-center">Statut Stock</th>
                      <th className="py-3 px-5 font-semibold text-center">Quantité</th>
                      <th className="py-3 px-5 font-semibold text-center">Action Rapide</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-default font-body text-xs">
                    {[...products]
                      .sort((a, b) => a.stockQuantity - b.stockQuantity)
                      .map((prod) => {
                        const isOut = prod.stockQuantity === 0;
                        const isLow = prod.stockQuantity > 0 && prod.stockQuantity <= 10;
                        const isEditing = editingStockId === prod.id;
                        return (
                          <tr key={prod.id}
                            className={`transition-colors ${
                              isOut ? "bg-red-50 hover:bg-red-100" :
                              isLow ? "bg-orange-50 hover:bg-orange-100" :
                              "hover:bg-surface-50"
                            }`}
                          >
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <img
                                  src={prod.mainImage} alt={prod.name}
                                  className="w-9 h-9 rounded-lg border border-border-default object-cover flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }}
                                />
                                <div>
                                  <span className="font-display font-bold text-xs text-text-primary block">{prod.name}</span>
                                  {prod.brand && <span className="font-body text-[10px] text-text-tertiary">{prod.brand}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-5 font-mono text-[10px] text-text-secondary">{prod.sku}</td>
                            <td className="py-3 px-5 text-text-secondary">{prod.category.name}</td>
                            <td className="py-3 px-5 text-center">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-display font-bold text-[10px] uppercase">
                                  🔴 Rupture
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full font-display font-bold text-[10px] uppercase">
                                  ⚠️ Faible
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-display font-bold text-[10px] uppercase">
                                  ✅ OK
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-5 text-center">
                              <span className={`font-display font-black text-sm ${
                                isOut ? "text-red-600" : isLow ? "text-orange-600" : "text-green-600"
                              }`}>
                                {prod.stockQuantity}
                              </span>
                            </td>
                            <td className="py-3 px-5 text-center">
                              {isEditing ? (
                                <div className="flex items-center gap-2 justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={editingStockQty}
                                    onChange={(e) => setEditingStockQty(Number(e.target.value))}
                                    className="w-20 px-2 py-1.5 bg-white border-2 border-primary-400 rounded-lg font-display font-bold text-sm text-center focus:outline-none"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleQuickUpdateStock(prod)}
                                    disabled={stockUpdateLoading}
                                    className="px-3 py-1.5 bg-primary-500 text-white rounded-lg font-display font-bold text-[10px] hover:bg-primary-600 transition-all disabled:opacity-60"
                                  >
                                    {stockUpdateLoading ? "⏳" : "✓ OK"}
                                  </button>
                                  <button
                                    onClick={() => setEditingStockId(null)}
                                    className="px-2 py-1.5 bg-surface-200 text-text-secondary rounded-lg font-display font-bold text-[10px] hover:bg-surface-300 transition-all"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setEditingStockId(prod.id); setEditingStockQty(prod.stockQuantity); }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-100 hover:bg-primary-50 text-text-secondary hover:text-primary-600 border border-border-default hover:border-primary-300 rounded-lg font-display font-semibold text-[10px] transition-all"
                                >
                                  ✏️ Modifier
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CATEGORIES TAB ═══ */}
        {activeTab === "categories" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 border border-border-default rounded-2xl shadow-sm">
              <h3 className="font-display font-bold text-sm text-text-primary">Gestion des Catégories</h3>
              <Button variant="primary" size="sm" onClick={() => setIsCategoryFormOpen(true)} className="rounded-xl text-xs flex items-center gap-2">
                <span>➕</span><span>Nouvelle catégorie</span>
              </Button>
            </div>
            {categories.length === 0 ? (
              <Card className="p-8 text-center border border-dashed border-border-default rounded-2xl bg-white flex flex-col items-center gap-3">
                <span className="text-2xl">📁</span>
                <span className="font-display font-semibold text-sm text-text-secondary">Aucune catégorie enregistrée</span>
                <p className="font-body text-xs text-text-tertiary max-w-xs">Commencez par ajouter une nouvelle catégorie en cliquant sur le bouton ci-dessus.</p>
              </Card>
            ) : (
              <Grid cols={1} colsSm={2} colsLg={3} gap="md">
                {categories.map((c) => (
                  <Card key={c.id} className="p-6 bg-white border border-border-default rounded-2xl flex flex-col justify-between h-44 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="gold" size="sm">Ordre: {c.order}</Badge>
                        <button onClick={() => handleDeleteCategory(c.id)} className="p-1 text-text-tertiary hover:text-error transition-all" title="Supprimer">🗑️</button>
                      </div>
                      <span className="font-display font-bold text-base text-text-primary block mt-3">{c.name}</span>
                      <span className="font-body text-[10px] text-text-secondary mt-1 block">Slug URL: <code className="bg-surface-100 px-1 py-0.5 rounded font-mono text-[9px]">{c.slug}</code></span>
                      {c.description && <p className="font-body text-[10px] text-text-tertiary mt-2 line-clamp-2 leading-relaxed">{c.description}</p>}
                    </div>
                    <div className="border-t border-border-default pt-2 mt-2 flex gap-4 text-[9px] font-display font-bold text-text-tertiary uppercase tracking-wider">
                      <span>EN: {c.nameEn || "—"}</span><span>AR: {c.nameAr || "—"}</span>
                    </div>
                  </Card>
                ))}
              </Grid>
            )}

            {isCategoryFormOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md bg-white border border-border-default shadow-elevated rounded-none animate-scaleUp">
                  <CardHeader className="border-b border-border-default p-6 flex justify-between items-center flex-row">
                    <CardTitle>Nouvelle Catégorie</CardTitle>
                    <button onClick={() => setIsCategoryFormOpen(false)} className="text-text-tertiary hover:text-text-primary p-2">✖</button>
                  </CardHeader>
                  <form onSubmit={handleSaveCategory}>
                    <CardContent className="p-6 flex flex-col gap-4">
                      <Input label="Nom de la Catégorie (Français)" required value={categoryFormData.name} onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })} />
                      <Input label="Nom (English, optionnel)" value={categoryFormData.nameEn} onChange={(e) => setCategoryFormData({ ...categoryFormData, nameEn: e.target.value })} />
                      <Input label="Nom (العربية, optionnel)" value={categoryFormData.nameAr} onChange={(e) => setCategoryFormData({ ...categoryFormData, nameAr: e.target.value })} />
                      <Input label="Slug URL (Optionnel)" placeholder="ex: t-shirts" value={categoryFormData.slug} onChange={(e) => setCategoryFormData({ ...categoryFormData, slug: e.target.value })} />
                      <Input label="Ordre d'affichage (Tri)" type="number" required value={categoryFormData.order} onChange={(e) => setCategoryFormData({ ...categoryFormData, order: Number(e.target.value) })} />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-display font-medium uppercase tracking-wider text-text-secondary">Description (Optionnel)</label>
                        <textarea rows={2} value={categoryFormData.description} onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })} className="w-full px-5 py-3.5 bg-surface-50 border border-border-default rounded-none font-body text-sm text-text-primary focus:outline-none focus:border-border-focus" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 border-t border-border-default bg-surface-100 flex justify-end gap-3">
                      <Button variant="outline" size="md" onClick={() => setIsCategoryFormOpen(false)} className="rounded-xl">Annuler</Button>
                      <Button type="submit" variant="primary" size="md" className="rounded-xl">Créer la catégorie</Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ═══ PROMOTIONS TAB ═══ */}
        {activeTab === "promotions" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-4 border border-border-default rounded-2xl shadow-sm">
              <h3 className="font-display font-bold text-sm text-text-primary">Codes Promotionnels</h3>
              <Button variant="primary" size="sm" onClick={() => setIsPromoFormOpen(true)} className="rounded-xl text-xs flex items-center gap-2">
                <span>➕</span><span>Nouveau Code</span>
              </Button>
            </div>
            {promotions.length === 0 ? (
              <Card className="p-8 text-center border border-dashed border-border-default rounded-2xl bg-white flex flex-col items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <span className="font-display font-semibold text-sm text-text-secondary">Aucun code promo disponible</span>
                <p className="font-body text-xs text-text-tertiary max-w-xs">Créez votre premier code promotionnel pour offrir des remises à vos clients.</p>
              </Card>
            ) : (
              <Grid cols={1} colsSm={2} colsLg={3} gap="md">
                {promotions.map((promo) => (
                  <Card key={promo.id} className="p-6 bg-white border border-border-default rounded-2xl flex flex-col justify-between h-44 shadow-sm">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <span className="font-mono font-bold text-base text-accent-500 uppercase bg-accent-500/10 px-2.5 py-1 rounded-lg">{promo.code}</span>
                        <div className="flex gap-2">
                          <button onClick={() => togglePromotion(promo.id)} className={`px-2.5 py-1 rounded-full font-display text-[9px] font-bold uppercase transition-all ${promo.isActive ? "bg-green-100 text-success hover:bg-green-200" : "bg-surface-200 text-text-secondary hover:bg-surface-300"}`}>
                            {promo.isActive ? "Actif" : "Désactivé"}
                          </button>
                          <button onClick={() => deletePromotion(promo.id)} className="p-1 text-text-tertiary hover:text-error transition-all">🗑️</button>
                        </div>
                      </div>
                      <span className="font-display font-bold text-xl text-text-primary block mt-4">{promo.discountType === "percentage" ? `${promo.discountValue}%` : `${promo.discountValue.toFixed(3)} DT`} OFF</span>
                      <span className="font-body text-[10px] text-text-secondary mt-1.5 block">Minimum: {formatPrice(promo.minOrderAmount, locale)}</span>
                    </div>
                    <div className="border-t border-border-default pt-2 mt-2 flex justify-between text-[9px] font-body text-text-tertiary">
                      <span>Créé le: {new Date(promo.validFrom).toLocaleDateString()}</span>
                      <span>Utilisations: {promo.currentUses}</span>
                    </div>
                  </Card>
                ))}
              </Grid>
            )}

            {isPromoFormOpen && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <Card className="w-full max-w-md bg-white border border-border-default shadow-elevated rounded-3xl animate-scaleUp">
                  <CardHeader className="border-b border-border-default p-6 flex justify-between items-center flex-row">
                    <CardTitle>Nouveau Code Promo</CardTitle>
                    <button onClick={() => setIsPromoFormOpen(false)} className="text-text-tertiary hover:text-text-primary p-2">✖</button>
                  </CardHeader>
                  <form onSubmit={handleSavePromo}>
                    <CardContent className="p-6 flex flex-col gap-4">
                      <Input label="Code Promotionnel (ex: SHARK30)" required placeholder="EX: WELCOME10" value={promoFormData.code} onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value })} />
                      <Select label="Type de Remise" value={promoFormData.discountType} onChange={(e) => setPromoFormData({ ...promoFormData, discountType: e.target.value as any })} options={[{ value: "percentage", label: "Pourcentage (%)" }, { value: "fixed", label: "Montant Fixe (DT)" }]} />
                      <Input label={promoFormData.discountType === "percentage" ? "Valeur du Pourcentage (%)" : "Montant de la Remise (DT)"} type="number" step={promoFormData.discountType === "percentage" ? "1" : "0.1"} required value={promoFormData.discountValue || ""} onChange={(e) => setPromoFormData({ ...promoFormData, discountValue: Number(e.target.value) })} />
                      <Input label="Panier Minimum Requis (DT)" type="number" step="1" required value={promoFormData.minOrderAmount} onChange={(e) => setPromoFormData({ ...promoFormData, minOrderAmount: Number(e.target.value) })} />
                      <label className="flex items-center gap-2.5 cursor-pointer mt-2">
                        <input type="checkbox" checked={promoFormData.isActive} onChange={(e) => setPromoFormData({ ...promoFormData, isActive: e.target.checked })} className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4" />
                        <span className="font-display font-semibold text-xs text-text-primary uppercase tracking-wider">Activer immédiatement</span>
                      </label>
                    </CardContent>
                    <CardFooter className="p-6 border-t border-border-default bg-surface-100 flex justify-end gap-3">
                      <Button variant="outline" size="md" onClick={() => setIsPromoFormOpen(false)} className="rounded-xl">Annuler</Button>
                      <Button type="submit" variant="primary" size="md" className="rounded-xl">Créer le code promo</Button>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ═══ ORDERS TAB ═══ */}
        {activeTab === "orders" && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="bg-white p-4 border border-border-default rounded-2xl shadow-sm flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-text-primary">Registre des Commandes Client</h3>
              <Badge variant="gold" size="sm">Total: {orders.length}</Badge>
            </div>

            <Card className="bg-white border border-border-default rounded-3xl overflow-x-auto shadow-sm">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-border-default bg-surface-100 font-display text-xs text-text-secondary">
                    <th className="py-4 px-6 font-semibold">N° Commande</th>
                    <th className="py-4 px-6 font-semibold">Client</th>
                    <th className="py-4 px-6 font-semibold">Téléphone</th>
                    <th className="py-4 px-6 font-semibold">Date</th>
                    <th className="py-4 px-6 font-semibold">Ville</th>
                    <th className="py-4 px-6 font-semibold">Total</th>
                    <th className="py-4 px-6 font-semibold">Statut</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default font-body text-xs text-text-primary">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-[11px] text-text-primary">{order.orderNumber}</td>
                      <td className="py-4 px-6 text-text-primary">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</td>
                      <td className="py-4 px-6 font-mono text-text-secondary">{order.shippingAddress.phone}</td>
                      <td className="py-4 px-6 text-text-tertiary">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                      <td className="py-4 px-6 text-text-secondary">{order.shippingAddress.city}</td>
                      <td className="py-4 px-6 font-bold"><PriceDisplay price={order.total} size="sm" /></td>
                      <td className="py-4 px-6"><StatusBadge status={order.status} /></td>
                      <td className="py-4 px-6 text-right">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(order); setOrderTrackingNum(order.trackingNumber || ""); }} className="rounded-lg px-3 py-1.5 text-[10px]">Détails</Button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={8} className="py-12 text-center text-text-tertiary font-body">Aucune commande enregistrée pour le moment.</td></tr>
                  )}
                </tbody>
              </table>
            </Card>

            {/* Order Detail Modal */}
            {selectedOrder && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                <Card className="w-full max-w-2xl bg-white border border-border-default shadow-elevated rounded-3xl max-h-[90vh] overflow-y-auto animate-scaleUp">
                  <CardHeader className="border-b border-border-default p-6 flex justify-between items-center flex-row">
                    <div>
                      <CardTitle>Commande {selectedOrder.orderNumber}</CardTitle>
                      <CardDescription>Passée le {new Date(selectedOrder.createdAt).toLocaleDateString()} à {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</CardDescription>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-text-tertiary hover:text-text-primary p-2">✖</button>
                  </CardHeader>
                  <CardContent className="p-6 flex flex-col gap-6">

                    {/* Status Update + WhatsApp */}
                    <div className="bg-surface-100 p-4 border border-border-default rounded-2xl flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                        <div>
                          <span className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wider block">Statut de la commande</span>
                          <span className="font-body text-[10px] text-text-tertiary mt-0.5 block">Modifiez le statut pour mettre à jour la commande.</span>
                        </div>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => {
                            updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus);
                            setSelectedOrder({ ...selectedOrder, status: e.target.value as OrderStatus });
                          }}
                          className="px-4 py-2 bg-white border border-border-default rounded-xl font-display text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500">
                          <option value="pending">En attente (Pending)</option>
                          <option value="confirmed">Confirmé (Confirmed)</option>
                          <option value="processing">Préparation (Processing)</option>
                          <option value="shipped">Expédié (Shipped)</option>
                          <option value="delivered">Livré (Delivered)</option>
                          <option value="cancelled">Annulé (Cancelled)</option>
                          <option value="refunded">Remboursé (Refunded)</option>
                        </select>
                      </div>

                      {/* Tracking number + WhatsApp */}
                      <div className="border-t border-border-default pt-4 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                        <div className="flex-1">
                          <label className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wider block mb-1.5">N° de suivi (optionnel)</label>
                          <input
                            type="text"
                            value={orderTrackingNum}
                            onChange={(e) => setOrderTrackingNum(e.target.value)}
                            placeholder="Ex: AR123456789TN"
                            className="w-full px-4 py-2.5 bg-white border border-border-default rounded-xl font-mono text-xs focus:outline-none focus:border-primary-500"
                          />
                        </div>
                        <button
                          onClick={() => handleSendWhatsApp(selectedOrder, selectedOrder.status)}
                          disabled={whatsappSending}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-xs transition-all flex-shrink-0 ${
                            whatsappResult === "sent" ? "bg-green-500 text-white" :
                            whatsappResult === "error" ? "bg-red-500 text-white" :
                            "bg-green-600 hover:bg-green-700 text-white"
                          } disabled:opacity-60`}
                        >
                          {whatsappSending ? (
                            <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Envoi...</>
                          ) : whatsappResult === "sent" ? (
                            <>✅ Envoyé !</>
                          ) : whatsappResult === "error" ? (
                            <>❌ Erreur</>
                          ) : (
                            <>
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.48-8.45z"/>
                              </svg>
                              Notifier WhatsApp
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-secondary mb-3">Articles commandés</h4>
                      <div className="flex flex-col gap-3 border border-border-default rounded-2xl p-4 bg-surface-50 max-h-48 overflow-y-auto">
                        {selectedOrder.items.map((item: any) => (
                          <div key={item.id} className="flex gap-4 items-center justify-between text-xs font-body">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-surface-200 rounded-lg overflow-hidden border border-border-default flex-shrink-0 flex items-center justify-center">
                                <img src={item.productImage || PRODUCT_PLACEHOLDER} alt={item.productName} onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }} className="object-cover w-full h-full" />
                              </div>
                              <div className="text-left">
                                <span className="font-display font-bold text-xs text-text-primary block">{item.productName}</span>
                                <span className="font-body text-[10px] text-text-secondary block mt-0.5">Option: {item.variantName || "Standard"}</span>
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <span className="text-text-secondary">{formatPrice(item.productPrice, locale)} x {item.quantity}</span>
                              <span className="font-display font-bold text-text-primary block mt-0.5">{formatPrice(item.lineTotal || item.productPrice * item.quantity, locale)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Address + Payment Info */}
                    <Grid cols={1} colsSm={2} gap="md" className="border-t border-border-default pt-5">
                      <div className="text-left">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-secondary mb-3">Adresse de livraison</h4>
                        <div className="font-body text-xs text-text-primary leading-relaxed flex flex-col gap-1">
                          <span><strong>Nom:</strong> {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</span>
                          <span><strong>Adresse:</strong> {selectedOrder.shippingAddress.street}</span>
                          <span><strong>Ville:</strong> {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</span>
                          <span><strong>Pays:</strong> {selectedOrder.shippingAddress.country || "Tunisie"}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <h4 className="font-display font-bold text-xs uppercase tracking-wider text-text-secondary mb-3">Détails Client & Facturation</h4>
                        <div className="font-body text-xs text-text-primary leading-relaxed flex flex-col gap-1">
                          <span><strong>Téléphone:</strong> {selectedOrder.shippingAddress.phone}</span>
                          <span><strong>Mode de Paiement:</strong> <span className="uppercase font-semibold">{selectedOrder.paymentMethod}</span></span>
                          <span><strong>Statut du Paiement:</strong> <span className="uppercase font-semibold text-accent-500">{selectedOrder.paymentStatus || "pending"}</span></span>
                          {selectedOrder.promoCode && <span><strong>Code Promo:</strong> <span className="font-mono text-accent-500 bg-accent-500/10 px-1 py-0.5 rounded text-[10px]">{selectedOrder.promoCode}</span></span>}
                          {(selectedOrder.trackingNumber || orderTrackingNum) && <span><strong>N° Suivi:</strong> <span className="font-mono text-primary-500">{orderTrackingNum || selectedOrder.trackingNumber}</span></span>}
                        </div>
                      </div>
                    </Grid>

                    {/* Totals */}
                    <div className="border-t border-border-default pt-4 flex flex-col gap-2 font-body text-xs text-text-secondary items-end">
                      <div className="flex gap-12 justify-between w-64">
                        <span>Sous-total:</span><PriceDisplay price={selectedOrder.subtotal} size="sm" />
                      </div>
                      {selectedOrder.discountAmount > 0 && (
                        <div className="flex gap-12 justify-between w-64 text-error">
                          <span>Remise Promo:</span><span>-{formatPrice(selectedOrder.discountAmount, locale)}</span>
                        </div>
                      )}
                      <div className="flex gap-12 justify-between w-64">
                        <span>Frais de livraison:</span><span>{selectedOrder.shippingCost === 0 ? "Gratuit" : formatPrice(selectedOrder.shippingCost, locale)}</span>
                      </div>
                      <div className="flex gap-12 justify-between w-64 border-t border-border-default pt-2 font-display font-bold text-sm text-text-primary mt-1">
                        <span>Total de la commande:</span><PriceDisplay price={selectedOrder.total} size="md" />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 border-t border-border-default bg-surface-100 flex justify-end">
                    <Button variant="primary" size="md" onClick={() => setSelectedOrder(null)} className="rounded-xl">Fermer</Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}
