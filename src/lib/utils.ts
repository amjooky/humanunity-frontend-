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
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgMzAwIDMwMCI+CiAgPHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNGQUY4RjQiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjQ1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIGZvbnQtc2l6ZT0iMjIiIGZpbGw9IiMwRTVBNkIiPkNGIERJU1RSSUJVVElPTjwvdGV4dD4KICA8dGV4dCB4PSI1MCUiIHk9IjU1JSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzg4ODg4OCI+SW1hZ2UgYmllbnTDtHQgZGlzcG9uaWJsZTwvdGV4dD4KPC9zdmc+";

