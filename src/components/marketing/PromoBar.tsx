"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@cf/shared/constants";
import { useLocale } from "next-intl";

export function PromoBar() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-primary-950 text-white text-center font-display font-medium text-xs tracking-wider py-2.5 px-4 relative z-sticky flex items-center justify-center"
      >
        <span>
          {t("freeShippingSuccess") || `Livraison gratuite à partir de ${formatPrice(FREE_SHIPPING_THRESHOLD, locale)}`}
        </span>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 rtl:left-4 rtl:right-auto text-white/70 hover:text-white transition-colors cursor-pointer"
          aria-label="Dismiss banner"
        >
          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
