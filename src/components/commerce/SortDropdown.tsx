"use client";

import * as React from "react";
import { useFilterStore } from "@/stores/filterStore";
import { ProductSortBy } from "@cf/shared/types/product";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

export function SortDropdown() {
  const locale = useLocale();
  const sortBy = useFilterStore((state) => state.sortBy);
  const setSortBy = useFilterStore((state) => state.setSortBy);

  const [isOpen, setIsOpen] = React.useState(false);

  const options: { value: ProductSortBy; labelFr: string; labelEn: string; labelAr: string }[] = [
    { value: "popular", labelFr: "Popularité", labelEn: "Popularity", labelAr: "الأكثر شعبية" },
    { value: "newest", labelFr: "Nouveautés", labelEn: "Newest", labelAr: "الأحدث" },
    { value: "price-asc", labelFr: "Prix : croissant", labelEn: "Price: Low to High", labelAr: "السعر: من الأقل للأعلى" },
    { value: "price-desc", labelFr: "Prix : décroissant", labelEn: "Price: High to Low", labelAr: "السعر: من الأعلى للأقل" },
    { value: "rating", labelFr: "Meilleurs avis", labelEn: "Top Rated", labelAr: "التقييم" },
    { value: "name", labelFr: "Nom : A-Z", labelEn: "Name: A-Z", labelAr: "الاسم A-Z" },
  ];

  const currentOption = options.find((opt) => opt.value === sortBy) || options[0];
  const label =
    locale === "ar"
      ? currentOption.labelAr
      : locale === "en"
      ? currentOption.labelEn
      : currentOption.labelFr;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 border border-border-default bg-surface-50 hover:bg-surface-100 rounded-full font-display font-medium text-xs uppercase tracking-widest text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors cursor-pointer select-none"
      >
        <span>
          {locale === "ar" ? "ترتيب حسب: " : "Trier par : "}
          <span className="text-text-primary font-bold">{label}</span>
        </span>
        <svg
          className={cn(
            "w-3.5 h-3.5 fill-none stroke-current transition-transform duration-normal",
            isOpen && "rotate-180"
          )}
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-dropdown" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 bg-surface-50 border border-border-default rounded-2xl shadow-md py-2 z-fixed animate-in fade-in-50 slide-in-from-top-1">
            {options.map((opt) => {
              const optLabel =
                locale === "ar"
                  ? opt.labelAr
                  : locale === "en"
                  ? opt.labelEn
                  : opt.labelFr;
              const isSelected = opt.value === sortBy;

              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSortBy(opt.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-5 py-2.5 text-left rtl:text-right font-display text-xs uppercase tracking-wider transition-colors hover:bg-surface-200 cursor-pointer",
                    isSelected ? "text-primary-500 font-bold" : "text-text-secondary"
                  )}
                >
                  {optLabel}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
