import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and merges Tailwind classes intelligently.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric price into a localized currency string.
 * Default is Tunisian Dinar (TND).
 */
export function formatPrice(
  price: number,
  locale: string = "fr",
  currency: string = "TND"
): string {
  const formatted = new Intl.NumberFormat(locale === "ar" ? "ar-TN" : "fr-TN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(price);

  return formatted;
}

/**
 * Premium SVG fallback image for broken product images.
 */
export const PRODUCT_PLACEHOLDER =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'><rect width='300' height='300' fill='%23F5F5F5'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-weight='bold' font-size='22' fill='%23000000' letter-spacing='0.1em'>HUMAN.UNITY</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui, sans-serif' font-size='11' fill='%23737373'>IMAGE NOT FOUND</text></svg>";

