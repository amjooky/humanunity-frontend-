"use client";

import * as React from "react";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "next-intl";

interface PriceDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg" | "xl";
  currency?: string;
}

export function PriceDisplay({
  price,
  originalPrice,
  size = "md",
  currency = "TND",
  className,
  ...props
}: PriceDisplayProps) {
  const locale = useLocale();
  const isDiscounted = originalPrice !== undefined && originalPrice > price;

  const sizes = {
    sm: "text-xs font-semibold",
    md: "text-sm md:text-base font-semibold",
    lg: "text-lg md:text-xl font-bold font-display",
    xl: "text-2xl md:text-3xl font-bold font-display",
  };

  const discountSizes = {
    sm: "text-[10px] line-through",
    md: "text-xs md:text-sm line-through",
    lg: "text-sm md:text-base line-through",
    xl: "text-lg md:text-xl line-through",
  };

  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`} {...props}>
      <span className={`${sizes[size]} text-text-primary`}>
        {formatPrice(price, locale, currency)}
      </span>
      {isDiscounted && (
        <span className={`${discountSizes[size]} text-text-tertiary`}>
          {formatPrice(originalPrice, locale, currency)}
        </span>
      )}
    </span>
  );
}
