"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { Product } from "@cf/shared/types/product";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useLocale } from "next-intl";
import { PRODUCT_PLACEHOLDER } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const addToast = useUIStore((state) => state.addToast);
  const { isWishlisted, toggle } = useWishlistStore();

  const [imgSrc, setImgSrc] = React.useState(product.mainImage);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isAdding, setIsAdding] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    setImgSrc(product.mainImage);
  }, [product.mainImage]);

  const wishlisted = isMounted && isWishlisted(product.id);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 320));

    addItem({
      id: `${product.id}_def`,
      productId: product.id,
      name: product.name,
      image: product.mainImage,
      price: product.price,
      maxQuantity: product.variants?.[0]?.stockQuantity || 99,
      variant: product.variants?.[0]
        ? {
            name: product.variants[0].name,
            optionType: product.variants[0].optionType,
          }
        : undefined,
    });

    addToast({
      type: "success",
      title: locale === "ar" ? "تمت الإضافة" : "Ajouté au panier",
      message: `${product.name} a été ajouté à votre panier.`,
    });

    setIsAdding(false);
    setCartOpen(true);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    addToast({
      type: wishlisted ? "info" : "success",
      title: wishlisted
        ? locale === "ar" ? "تمت الإزالة" : "Retiré de la liste"
        : locale === "ar" ? "تمت الإضافة" : "Ajouté à la liste ❤️",
      message: wishlisted
        ? `${product.name} retiré de votre liste de souhaits.`
        : `${product.name} ajouté à votre liste de souhaits.`,
    });
  };

  const isNew = product.tags?.includes("Nouveau");
  const isBestSeller = product.tags?.includes("Best Seller");
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : null;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col h-full bg-white overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 cursor-pointer border border-neutral-200 hover:border-black hover:shadow-[0_8px_30px_rgba(0,0,0,0.10)]"
    >
      {/* ── Badges ── */}
      <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discount && (
          <span className="font-display font-black text-[9px] uppercase tracking-widest px-2.5 py-1 bg-black text-white">
            -{discount}%
          </span>
        )}
        {isNew && !discount && (
          <span className="font-display font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 bg-black text-white">
            New
          </span>
        )}
        {isBestSeller && (
          <span className="font-display font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 border border-black text-black bg-white">
            Best
          </span>
        )}
      </div>

      {/* ── Wishlist ── */}
      <button
        onClick={handleWishlistToggle}
        className={`
          absolute top-3 right-3 rtl:right-auto rtl:left-3 z-10
          w-8 h-8 flex items-center justify-center
          transition-all duration-300
          ${wishlisted
            ? "bg-black text-white"
            : "bg-white text-neutral-400 border border-neutral-200 hover:border-black hover:text-black"
          }
        `}
        title={wishlisted ? "Retirer" : "Ajouter à la liste"}
        aria-label="Wishlist toggle"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* ── Image ── */}
      <div className="relative w-full aspect-square overflow-hidden bg-neutral-50 group-hover:bg-neutral-100 transition-colors duration-500">
        <img
          src={imgSrc || PRODUCT_PLACEHOLDER}
          alt={product.name}
          onError={() => setImgSrc(PRODUCT_PLACEHOLDER)}
          className="object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />

        {/* Hover overlay with quick-add */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-end p-4"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)" }}
        >
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full py-3 px-5 bg-white text-black font-display font-bold text-[10px] uppercase tracking-[0.15em] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 hover:bg-neutral-100 cursor-pointer"
          >
            {isAdding ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black/30 border-t-black animate-spin" />
                {locale === "ar" ? "جاري الإضافة..." : "Ajout..."}
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {locale === "ar" ? "أضف للسلة" : "Ajout Rapide"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Info ── */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex flex-col gap-0.5 text-left rtl:text-right">
          <span className="font-display text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">
            {product.brand || "Human Unity"}
          </span>
          <h4 className="font-display font-black text-sm text-black group-hover:text-neutral-700 transition-colors duration-200 line-clamp-1 leading-snug">
            {product.name}
          </h4>
          <p className="font-body text-[11px] text-neutral-500 line-clamp-2 leading-relaxed mt-0.5">
            {product.description}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-neutral-100">
          <PriceDisplay price={product.price} originalPrice={product.comparePrice} size="sm" />
          {product.rating && (
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 fill-black" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="font-display font-bold text-[10px] text-black">
                {product.rating}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
