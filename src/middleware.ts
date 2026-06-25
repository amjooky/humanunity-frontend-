import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";
import { createServerClient } from "@supabase/ssr";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://xlnfvrlcqqtgnfuhxyfr.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_gPM_KOw5XLNKV3WMURTy8A_G1tMO1Nj";

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware to get response with locale redirection
  const response = intlMiddleware(request);

  // 2. Refresh Supabase session
  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session if expired
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match internationalized pathnames
    "/",
    "/(fr|en|ar)/:path*",
    // Skip Next.js internals and all static files
    "/((?!api|static|.*\\..*|_next).*)",
  ],
};
