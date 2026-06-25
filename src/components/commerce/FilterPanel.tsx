"use client";

import * as React from "react";
import { useFilterStore } from "@/stores/filterStore";
import { useProductStore } from "@/stores/productStore";
import { ProductBadge } from "@cf/shared/types/product";
import { useTranslations, useLocale } from "next-intl";
import { MAIN_CATEGORIES } from "@cf/shared/constants";
import { cn } from "@/lib/utils";

export function FilterPanel() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const filters = useFilterStore();
  const { categories } = useProductStore();

  const brandsList = [
    "Human Unity",
    "Uji Gardens",
    "HU Artisanal",
    "HU Confiserie",
  ];

  const badgesList: { value: ProductBadge; labelFr: string; labelEn: string; labelAr: string }[] = [
    { value: "new", labelFr: "Nouveauté", labelEn: "New", labelAr: "جديد" },
    { value: "bestseller", labelFr: "Best Seller", labelEn: "Best Seller", labelAr: "الأكثر مبيعاً" },
    { value: "sale", labelFr: "En Promotion", labelEn: "On Sale", labelAr: "تخفيضات" },
    { value: "organic", labelFr: "Biologique", labelEn: "Organic", labelAr: "عضوي" },
  ];

  // Dynamic database categories merged with static fallback
  const displayCategories = React.useMemo(() => {
    if (categories && categories.length > 0) {
      return categories.map((cat) => ({
        slug: cat.slug,
        nameFr: cat.name,
        nameEn: cat.nameEn || cat.name,
        nameAr: cat.nameAr || cat.name,
      }));
    }
    return MAIN_CATEGORIES;
  }, [categories]);

  return (
    <div className="flex flex-col gap-8 bg-surface-50 border border-border-default/60 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-fit backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-default/60">
        <h3 className="font-display font-bold text-xs uppercase tracking-[0.2em] text-text-primary">
          {locale === "ar" ? "الفلاتر" : "Filtres"}
        </h3>
        <button
          onClick={filters.resetFilters}
          className="font-display text-[9px] uppercase tracking-widest text-text-tertiary hover:text-accent-400 transition-colors font-bold cursor-pointer"
        >
          {locale === "ar" ? "إعادة ضبط" : "Réinitialiser"}
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        <h4 className="font-display font-semibold text-[10px] uppercase tracking-widest text-accent-500">
          {locale === "ar" ? "الأقسام" : "Catégories"}
        </h4>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => filters.setCategory(null)}
            className={cn(
              "text-left rtl:text-right font-body text-xs py-1.5 px-3 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-between",
              filters.category === null
                ? "bg-accent-400/10 text-accent-400 font-bold border-l-2 border-accent-400"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-100"
            )}
          >
            <span>{locale === "ar" ? "كل المنتجات" : "Tous les produits"}</span>
          </button>
          {displayCategories.map((cat) => {
            const label =
              locale === "ar" ? cat.nameAr : locale === "en" ? cat.nameEn : cat.nameFr;
            const isSelected = filters.category === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => filters.setCategory(cat.slug)}
                className={cn(
                  "text-left rtl:text-right font-body text-xs py-1.5 px-3 rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-between",
                  isSelected
                    ? "bg-accent-400/10 text-accent-400 font-bold border-l-2 border-accent-400"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-100"
                )}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brands */}
      <div className="flex flex-col gap-3">
        <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-text-secondary">
          {locale === "ar" ? "العلامة التجارية" : "Marques"}
        </h4>
        <div className="flex flex-col gap-2">
          {brandsList.map((brand) => {
            const isChecked = filters.brands.includes(brand);
            return (
              <label key={brand} className="flex items-center gap-3 font-body text-xs text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => filters.toggleBrand(brand)}
                  className="rounded border-border-default text-primary-500 focus:ring-primary-500/20"
                />
                <span>{brand}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-col gap-3">
        <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-text-secondary">
          Tags / Labels
        </h4>
        <div className="flex flex-col gap-2">
          {badgesList.map((item) => {
            const isChecked = filters.badges.includes(item.value);
            const label = locale === "ar" ? item.labelAr : locale === "en" ? item.labelEn : item.labelFr;
            return (
              <label key={item.value} className="flex items-center gap-3 font-body text-xs text-text-secondary cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => filters.toggleBadge(item.value)}
                  className="rounded border-border-default text-primary-500 focus:ring-primary-500/20"
                />
                <span>{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border-default">
        <h4 className="font-display font-semibold text-[10px] uppercase tracking-widest text-text-secondary">
          {locale === "ar" ? "نطاق السعر" : "Plage de prix"}
        </h4>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-text-secondary font-semibold">{filters.priceRange[0]} TND</span>
            <span className="font-mono text-xs text-text-secondary font-semibold">{filters.priceRange[1]} TND</span>
          </div>
          <div className="relative h-1.5 w-full">
            {/* Track */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-full bg-surface-300" />
            {/* Active range */}
            <div
              className="absolute top-0 h-1.5 rounded-full bg-primary-500"
              style={{
                left: `${(filters.priceRange[0] / 500) * 100}%`,
                right: `${100 - (filters.priceRange[1] / 500) * 100}%`,
              }}
            />
            {/* Min thumb */}
            <input
              type="range"
              min={0}
              max={500}
              step={5}
              value={filters.priceRange[0]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val < filters.priceRange[1]) filters.setPriceRange([val, filters.priceRange[1]]);
              }}
              className="absolute w-full top-0 -translate-y-1/2 opacity-0 cursor-pointer h-4 pointer-events-auto"
              style={{ zIndex: filters.priceRange[0] > 450 ? 5 : 3 }}
            />
            {/* Max thumb */}
            <input
              type="range"
              min={0}
              max={500}
              step={5}
              value={filters.priceRange[1]}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val > filters.priceRange[0]) filters.setPriceRange([filters.priceRange[0], val]);
              }}
              className="absolute w-full top-0 -translate-y-1/2 opacity-0 cursor-pointer h-4 pointer-events-auto"
              style={{ zIndex: 4 }}
            />
          </div>
        </div>
      </div>

      {/* Stock status */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border-default">
        <label className="flex items-center gap-3 font-body text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => filters.setInStockOnly(e.target.checked)}
            className="rounded border-border-default text-primary-500 focus:ring-primary-500/20"
          />
          <span>{locale === "ar" ? "المنتجات المتوفرة فقط" : "En stock uniquement"}</span>
        </label>
      </div>
    </div>
  );
}
