import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { SearchModal } from "@/components/commerce/SearchModal";
import { RegisterSW } from "@/components/layout/RegisterSW";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  // Validate that the incoming locale parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for the locale
  const messages = await getMessages();

  // Determine language direction (RTL for Arabic)
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider messages={messages}>
      <RegisterSW />
      <div dir={dir} className="min-h-full flex flex-col bg-surface-100 text-text-primary">
        {/* Global Luxury Navigation Header */}
        <Header />

        {/* Core Main Page Content */}
        <main className="flex-1 flex flex-col pt-[95px] pb-16 lg:pb-0">
          {children}
        </main>

        {/* Global Brand Footer */}
        <Footer />

        {/* Mobile Quick Navigation Bar */}
        <BottomNav />

        {/* Slide-out Cart Drawer Overlay */}
        <CartDrawer />

        {/* Typeahead Search Modal Overlay */}
        <SearchModal />
      </div>
    </NextIntlClientProvider>
  );
}

