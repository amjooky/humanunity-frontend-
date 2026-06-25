"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from "@cf/shared/constants";
import { formatPrice, PRODUCT_PLACEHOLDER } from "@/lib/utils";

export function CartDrawer() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const cartOpen = useUIStore((state) => state.cartOpen);
  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const router = useRouter();

  const { items, removeItem, updateQuantity, getSubtotal, getFreeShippingProgress } = useCartStore();

  const subtotal = getSubtotal();
  const progress = getFreeShippingProgress();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : DEFAULT_SHIPPING_COST;
  const total = subtotal + shippingCost;

  // Prevent scroll + Escape to close
  React.useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setCartOpen(false); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [cartOpen, setCartOpen]);

  const isRTL = locale === "ar";
  const slideTransition = isRTL
    ? { initial: { x: "-100%" }, animate: { x: 0 }, exit: { x: "-100%" } }
    : { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black z-drawer"
          />

          {/* Drawer Panel */}
          <motion.div
            {...slideTransition}
            transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed top-0 bottom-0 w-full sm:max-w-[480px] bg-surface-50 border-l border-border-default shadow-xl z-drawer flex flex-col ${
              isRTL ? "left-0 border-r border-l-0" : "right-0"
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-border-default flex items-center justify-between">
              <h3 className="font-display font-semibold text-lg text-text-primary tracking-wide">
                {t("title")}
              </h3>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-6">
              {/* Free shipping progress bar */}
              {items.length > 0 && (
                <div className="bg-surface-100 p-4 rounded-2xl border border-border-default flex flex-col gap-3">
                  <span className="font-body text-xs text-text-secondary leading-relaxed">
                    {isFreeShipping ? (
                      <span className="font-semibold text-primary-500">{t("freeShippingSuccess")}</span>
                    ) : (
                      t("freeShippingTarget", { amount: formatPrice(FREE_SHIPPING_THRESHOLD - subtotal, locale) })
                    )}
                  </span>
                  <div className="w-full h-1.5 bg-surface-300 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                </div>
              )}

              {/* Items List */}
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-20">
                  <svg className="w-12 h-12 text-text-tertiary stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  <p className="font-body text-sm text-text-secondary">{t("empty")}</p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="font-display font-medium text-xs uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors py-1 border-b border-primary-500 cursor-pointer"
                  >
                    {locale === "ar" ? "مواصلة التسوق" : "Continuer mes achats"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-3 bg-surface-50 border border-border-default rounded-2xl relative group overflow-hidden"
                    >
                      <div className="relative w-20 h-20 bg-surface-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={item.image || PRODUCT_PLACEHOLDER}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER;
                          }}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <h4 className="font-display font-semibold text-sm text-text-primary leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          {item.variant && (
                            <span className="font-body text-[10px] text-text-tertiary uppercase tracking-wider block mt-0.5">
                              {item.variant.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <QuantitySelector
                            quantity={item.quantity}
                            onChange={(val) => updateQuantity(item.id, val)}
                            max={item.maxQuantity}
                            className="scale-90 transform origin-left rtl:origin-right"
                          />
                          <PriceDisplay price={item.price * item.quantity} size="sm" />
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-3 right-3 rtl:left-3 rtl:right-auto text-text-tertiary hover:text-error transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border-default bg-surface-100 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-body text-xs text-text-secondary">
                    <span>{t("subtotal")}</span>
                    <PriceDisplay price={subtotal} size="sm" />
                  </div>
                  <div className="flex justify-between font-body text-xs text-text-secondary">
                    <span>{t("shipping")}</span>
                    <span>{isFreeShipping ? (locale === "ar" ? "مجاني" : "Gratuit") : <PriceDisplay price={shippingCost} size="sm" />}</span>
                  </div>
                  <div className="flex justify-between font-display font-semibold text-sm text-text-primary border-t border-border-default pt-3 mt-1">
                    <span>{t("total")}</span>
                    <PriceDisplay price={total} size="md" />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    router.push("/checkout");
                  }}
                  className="w-full bg-black hover:bg-neutral-800 text-white font-display font-bold text-[10px] uppercase tracking-[0.15em] text-center py-4 transition-all duration-200 active:scale-[0.97] select-none block hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                >
                  {t("checkout")}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
