"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/Input";
import { useProductStore } from "@/stores/productStore";
import { formatPrice, PRODUCT_PLACEHOLDER } from "@/lib/utils";

export function SearchModal() {
  const t = useTranslations("Common");
  const locale = useLocale();
  const searchOpen = useUIStore((state) => state.searchOpen);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { products } = useProductStore();

  const searchResults = React.useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return products.filter((p) => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.description.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }, [query, products]);

  // Focus input on open
  React.useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setSearchOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      router.push(`/discover?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-primary-950/40 backdrop-blur-md z-modal"
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
            className="fixed top-0 left-0 w-full bg-surface-50 border-b border-border-default z-modal shadow-lg"
          >
            <div className="max-w-(--container-md) mx-auto px-6 py-8 md:py-12">
              <form onSubmit={handleSubmit} className="relative flex items-center">
                <span className="absolute left-4 rtl:right-4 rtl:left-auto text-text-tertiary">
                  <svg className="w-6 h-6 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={t("searchPlaceholder") || "Rechercher..."}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-14 pr-14 rtl:pr-14 rtl:pl-14 py-4 md:py-5 bg-surface-100 border border-border-default rounded-2xl font-body text-base md:text-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 rtl:left-4 rtl:right-auto p-1 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                  aria-label="Close search"
                >
                  <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </form>

              {/* Suggestions */}
              <div className="mt-6 md:mt-8 text-left rtl:text-right">
                {query.trim() ? (
                  <>
                    <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-text-tertiary mb-3">
                      {locale === "ar" ? "نتائج البحث" : "Résultats de recherche"}
                    </h4>
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            onClick={() => {
                              setSearchOpen(false);
                              router.push(`/product/${product.id}`);
                            }}
                            className="flex items-center gap-4 p-3 bg-surface-50 hover:bg-surface-100 border border-border-default rounded-xl cursor-pointer transition-colors"
                          >
                            <img
                              src={product.images?.[0]?.url || product.mainImage || PRODUCT_PLACEHOLDER}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER;
                              }}
                            />
                            <div className="flex-1">
                              <h5 className="font-display font-semibold text-sm text-text-primary">
                                {product.name}
                              </h5>
                              <span className="font-body text-xs text-text-secondary">
                                {formatPrice(product.price, locale)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-body text-sm text-text-secondary">
                        {locale === "ar" ? "لا توجد نتائج" : "Aucun résultat trouvé"}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-text-tertiary mb-3">
                      {locale === "ar" ? "اقتراحات البحث" : "Recherches suggérées"}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["T-Shirt", "Hoodie", "Outerwear", "Coton Biologique"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setQuery(tag);
                            router.push(`/discover?search=${encodeURIComponent(tag)}`);
                            setSearchOpen(false);
                          }}
                          className="px-4 py-2 bg-surface-100 hover:bg-surface-200 border border-border-default rounded-none font-display font-medium text-xs uppercase tracking-wider text-text-secondary hover:text-text-primary hover:border-black transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
