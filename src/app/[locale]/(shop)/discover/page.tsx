"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Grid } from "@/components/layout/Grid";
import { Section } from "@/components/layout/Section";
import { FilterPanel } from "@/components/commerce/FilterPanel";
import { SortDropdown } from "@/components/commerce/SortDropdown";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useFilterStore } from "@/stores/filterStore";
import { useProductStore } from "@/stores/productStore";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const filters = useFilterStore();
  const { products, fetchStoreData } = useProductStore();

  const [isMounted, setIsMounted] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  React.useEffect(() => {
    setIsMounted(true);
    fetchStoreData();
  }, [fetchStoreData]);

  // Sync URL search params with store
  React.useEffect(() => {
    const searchUrl = searchParams.get("search");
    if (searchUrl !== null) {
      filters.setSearch(searchUrl);
    }
    const categoryUrl = searchParams.get("category");
    if (categoryUrl !== null) {
      filters.setCategory(categoryUrl);
    }
  }, [searchParams]);

  // Client-side filtering & sorting logic
  const filteredProducts = React.useMemo(() => {
    if (!isMounted) return [];
    let result = [...products];

    // Filter by Category (using robust fuzzy/multilingual match)
    if (filters.category) {
      const target = filters.category.toLowerCase().trim();
      result = result.filter((p) => {
        if (!p.category) return false;
        const slug = (p.category.slug || "").toLowerCase().trim();
        const name = (p.category.name || "").toLowerCase().trim();
        const nameEn = (p.category.nameEn || "").toLowerCase().trim();
        const nameAr = (p.category.nameAr || "").toLowerCase().trim();

        // 1. Direct match on slug or name
        if (slug === target || name === target || nameEn === target || nameAr === target) {
          return true;
        }

        // 2. Multilingual semantic mappings (e.g. t-shirts, hoodies, bottoms, outerwear)
        if (target === "t-shirts" && (slug.includes("t-shirt") || slug.includes("tee") || name.includes("t-shirt") || nameEn.includes("t-shirt") || nameAr.includes("تي شيرت"))) {
          return true;
        }
        if (target === "hoodies" && (slug.includes("hoodie") || slug.includes("sweat") || name.includes("hoodie") || name.includes("sweat") || nameEn.includes("hoodie") || nameAr.includes("هوديز") || nameAr.includes("سويت"))) {
          return true;
        }
        if (target === "bottoms" && (slug.includes("bottom") || slug.includes("pant") || slug.includes("short") || name.includes("pantalon") || name.includes("short") || nameEn.includes("bottom") || nameAr.includes("بناطيل") || nameAr.includes("شورت"))) {
          return true;
        }
        if (target === "outerwear" && (slug.includes("outer") || slug.includes("vest") || slug.includes("jacket") || name.includes("veste") || name.includes("manteau") || nameEn.includes("outerwear") || nameAr.includes("خارجية") || nameAr.includes("معطف"))) {
          return true;
        }

        return false;
      });
    }

    // Filter by Brands
    if (filters.brands.length > 0) {
      result = result.filter((p) => p.brand && filters.brands.includes(p.brand));
    }

    // Filter by Badges
    if (filters.badges.length > 0) {
      result = result.filter((p) => p.badge && filters.badges.includes(p.badge));
    }

    // Filter by Stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stockQuantity > 0);
    }

    // Filter by Price Range
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);
    }

    // Filter by Search Query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "popular":
        default:
          return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
    });

    return result;
  }, [
    isMounted,
    products,
    filters.category,
    filters.brands,
    filters.badges,
    filters.inStockOnly,
    filters.priceRange,
    filters.search,
    filters.sortBy,
  ]);

  if (!isMounted) {
    return (
      <Section padding="lg" background="white" className="flex-1 min-h-[70vh] flex items-center justify-center">
        <Container className="text-center font-display font-medium text-text-secondary text-sm">
          <div className="w-10 h-10 border-4 border-black border-t-transparent mx-auto mb-3 animate-spin"></div>
          Chargement...
        </Container>
      </Section>
    );
  }

  return (
    <Section padding="lg" background="cream" className="flex-1 min-h-screen pt-28">
      <Container>
        {/* Header Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border-default/60 mb-10 text-left rtl:text-right">
          <div>
            <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-neutral-400 block mb-2">
              {locale === "ar" ? "الكولكشن" : "The Collection"}
            </span>
            <h1 className="font-display font-black text-3xl md:text-5xl text-text-primary tracking-tight">
              {locale === "ar" ? "اكتشف مجموعتنا" : "Découvrir la Collection"}
            </h1>
            <p className="font-body text-xs md:text-sm text-text-secondary mt-2">
              {locale === "ar"
                ? `عرض ${filteredProducts.length} منتج`
                : filteredProducts.length === 1
                  ? `Affichage de 1 produit`
                  : `Affichage de ${filteredProducts.length} produits`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Grid / List Toggle */}
            <div className="flex items-center border border-border-default rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                title="Vue grille"
                className={`p-2.5 transition-colors ${ viewMode === "grid" ? "bg-primary-500 text-white" : "bg-surface-50 text-text-tertiary hover:text-text-primary" }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Vue liste"
                className={`p-2.5 transition-colors ${ viewMode === "list" ? "bg-primary-500 text-white" : "bg-surface-50 text-text-tertiary hover:text-text-primary" }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
              </button>
            </div>
            <SortDropdown />
          </div>
        </div>

        {/* Catalog Layout */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <FilterPanel />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-24 gap-4 bg-surface-50/50 backdrop-blur-md rounded-3xl border border-border-default/60 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <div className="w-16 h-16 rounded-full bg-accent-400/8 flex items-center justify-center mb-2">
                  <svg
                    className="w-8 h-8 text-accent-400 stroke-current fill-none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-base text-text-primary">
                  {locale === "ar" ? "لا توجد نتائج" : "Aucun résultat trouvé"}
                </h3>
                <p className="font-body text-xs text-text-secondary max-w-xs">
                  {locale === "ar"
                    ? "جرّب تعديل خيارات التصفية أو البحث للعثور على ما تبحث عنه."
                    : "Essayez de modifier vos filtres ou termes de recherche pour trouver ce que vous cherchez."}
                </p>
                <button
                  onClick={filters.resetFilters}
                  className="font-display font-bold text-[10px] uppercase tracking-widest text-black border border-black px-5 py-2 hover:bg-black hover:text-white transition-all duration-200 mt-2 cursor-pointer"
                >
                  {locale === "ar" ? "مسح التصفية" : "Effacer les filtres"}
                </button>
              </div>
            ) : viewMode === "list" ? (
              <div className="flex flex-col gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="flex gap-4 bg-white border border-border-default rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="w-28 h-28 flex-shrink-0 bg-surface-100">
                      <img src={product.mainImage || "/placeholder.png"} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between text-left rtl:text-right">
                      <div>
                        <span className="font-display text-[9px] uppercase tracking-widest text-accent-500/80 font-bold">{product.brand}</span>
                        <h4 className="font-display font-black text-sm text-text-primary mt-0.5 line-clamp-1">{product.name}</h4>
                        <p className="font-body text-[11px] text-text-secondary line-clamp-2 mt-1">{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-display font-bold text-base text-primary-700">{product.price.toFixed(3)} TND</span>
                    <a href={`/${locale}/product/${product.slug}`} className="px-4 py-2 bg-black text-white font-display font-bold text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-colors">
                          {locale === "ar" ? "عرض" : "Voir"}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Grid cols={1} colsSm={2} colsLg={3} gap="lg">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Grid>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
