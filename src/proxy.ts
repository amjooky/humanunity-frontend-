import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

// ═══════════════════════════════════════════════════════════
// Human Unity — Internationalization Middleware
// ═══════════════════════════════════════════════════════════
// Handles locale detection, routing and prefix management.
// Auth is handled client-side via Supabase Auth.

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: [
    // Match internationalized pathnames
    "/",
    "/(fr|en|ar)/:path*",
    // Skip Next.js internals and all static files
    "/((?!api|static|.*\\..*|_next).*)",
  ],
};
