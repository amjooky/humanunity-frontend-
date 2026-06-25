"use client";

import * as React from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useUIStore } from "@/stores/uiStore";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { cn } from "@/lib/utils";
import { locales } from "@/i18n/config";

// ─── Admin Header ──────────────────────────────────────────────────────────────
function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const products = useProductStore((s) => s.products);

  // Derive live stock alert count from store (threshold ≤ 10)
  const stockAlertCount = React.useMemo(
    () => products.filter((p) => p.stockQuantity <= 10).length,
    [products]
  );
  const outOfStockCount = React.useMemo(
    () => products.filter((p) => p.stockQuantity === 0).length,
    [products]
  );

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("cf_admin_auth");
      window.localStorage.removeItem("cf_admin_auth");
    }
    router.push("/profile");
  };

  const adminNavLinks = [
    { href: "/admin", label: "Admin Stats", icon: "📊", badge: 0 },
    {
      href: "/admin",
      label: "Gestion de Stock",
      icon: "📦",
      badge: stockAlertCount,
    },
  ];

  return (
    <>
      {/* Admin Announcement Bar */}
      <div className="fixed top-0 left-0 w-full z-[401] bg-black text-white text-center py-2 px-4">
        <div className="flex items-center justify-center gap-3 font-display font-semibold text-[10px] uppercase tracking-widest">
          <span>🔐</span>
          <span>Mode Administration — Human Unity</span>
          {outOfStockCount > 0 && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 ml-2">
              {outOfStockCount} rupture{outOfStockCount > 1 ? "s" : ""}
            </span>
          )}
          {stockAlertCount > 0 && outOfStockCount === 0 && (
            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 ml-2">
              {stockAlertCount} alerte{stockAlertCount > 1 ? "s" : ""} stock
            </span>
          )}
        </div>
      </div>

      {/* Admin Main Header */}
      <header
        className="fixed left-0 w-full z-[400] top-[33px] bg-neutral-950/95 backdrop-blur-2xl border-b border-neutral-800 py-3"
      >
        {/* Subtle white accent line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />

        <div className="max-w-screen-xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Admin Logo */}
          <Link href="/admin" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 flex items-center justify-center bg-white text-black transition-all">
              <span className="font-display font-black text-sm tracking-tight">HU</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-sm tracking-widest text-white uppercase">
                Admin
              </span>
              <span
                className="font-display font-light text-[9px] tracking-[0.25em] uppercase mt-0.5 text-white/50"
              >
                Espace Gestion
              </span>
            </div>
          </Link>

          {/* Admin Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            {adminNavLinks.map((link) => {
              const isActive = pathname.startsWith("/admin");
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2.5 font-display font-semibold text-[11px] uppercase tracking-widest transition-all duration-200",
                    isActive
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                  {link.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white font-display font-black text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg"
                    >
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Stock summary + Logout */}
          <div className="flex items-center gap-3">
            {/* Live Stock Indicator */}
            {products.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  outOfStockCount > 0 ? "bg-red-400 animate-pulse" :
                  stockAlertCount > 0 ? "bg-orange-400 animate-pulse" : "bg-green-400"
                )} />
                <span className="font-display text-[10px] text-white/70">
                  {outOfStockCount > 0
                    ? `${outOfStockCount} en rupture`
                    : stockAlertCount > 0
                    ? `${stockAlertCount} à réapprovisionner`
                    : "Stocks OK"}
                </span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 text-white/70 hover:text-red-400 font-display font-semibold text-[11px] uppercase tracking-widest transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span className="hidden sm:block">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Mobile Admin Nav */}
        <div className="md:hidden flex items-center justify-center gap-3 px-4 pt-3 pb-1">
          {adminNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 font-display font-semibold text-[10px] uppercase tracking-widest"
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
              {link.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {link.badge > 9 ? "9+" : link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </header>
    </>
  );
}

// ─── User Header ───────────────────────────────────────────────────────────────
export function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    setLangOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdmin(
        window.sessionStorage.getItem("cf_admin_auth") === "true" ||
        window.localStorage.getItem("cf_admin_auth") === "true"
      );
    }
  }, [pathname]);

  // Render dedicated Admin Header for admin users
  if (isAdmin) return <AdminHeader />;

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/discover", label: t("discover") },
    { href: "/wholesale", label: t("wholesale") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <>
      {/* Announcement Bar */}
      <div className="fixed top-0 left-0 w-full z-[401] bg-black text-white text-center py-2 px-4 overflow-hidden border-b border-neutral-900">
        <div
          className="flex items-center justify-center gap-8 font-display font-medium text-[9px] uppercase tracking-[0.2em] whitespace-nowrap"
          style={{ animation: "marqueeScroll 35s linear infinite" }}
        >
          <span>╳</span>
          <span>LIVRAISON GRATUITE EN TUNISIE DÈS 150 DT</span>
          <span>╳</span>
          <span>DESIGN PREMIUM & COTON BIOLOGIQUE</span>
          <span>╳</span>
          <span>HUMAN.UNITY Drop 01 OUT NOW</span>
          <span>╳</span>
          <span>LIVRAISON GRATUITE EN TUNISIE DÈS 150 DT</span>
          <span>╳</span>
          <span>DESIGN PREMIUM & COTON BIOLOGIQUE</span>
          <span>╳</span>
          <span>HUMAN.UNITY Drop 01 OUT NOW</span>
        </div>
        <style>{`
          @keyframes marqueeScroll {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "fixed left-0 w-full z-[400] transition-all duration-300",
          "top-[33px]",
          (isScrolled || pathname !== "/")
            ? "bg-white/95 border-b-2 border-black py-3 shadow-[0_4px_0_0_rgba(0,0,0,1)]"
            : "bg-transparent py-5"
        )}
      >
        {/* Stark black/white line at top of header when scrolled */}
        {(isScrolled || pathname !== "/") && (
          <div className="absolute top-0 left-0 w-full h-[1px] bg-black/10" />
        )}

        <div className="max-w-(--container-xl) mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
            {/* Minimalist Square Logo */}
            <div
              className={cn(
                "w-9 h-9 flex items-center justify-center transition-all duration-300",
                "bg-black text-white font-display font-black text-sm tracking-tight"
              )}
            >
              HU
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display font-bold text-sm tracking-widest text-black uppercase">
                Human
              </span>
              <span className="font-display font-semibold text-[9px] tracking-[0.25em] uppercase mt-0.5 text-neutral-500">
                Unity
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-display font-bold text-[10px] uppercase tracking-widest transition-all duration-200 relative py-1 hover-underline-sharp",
                    isActive
                      ? "text-black"
                      : (isScrolled || pathname !== "/")
                        ? "text-neutral-500 hover:text-black"
                        : "text-white/80 hover:text-white"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-black" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "p-2.5 transition-all duration-200 cursor-pointer",
                (isScrolled || pathname !== "/")
                  ? "text-neutral-600 hover:text-black hover:bg-neutral-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-label="Open search"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                id="profile-menu-btn"
                onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
                className={cn(
                  "p-2.5 transition-all duration-200 cursor-pointer",
                  profileOpen
                    ? (isScrolled || pathname !== "/")
                      ? "text-black bg-neutral-100"
                      : "text-white bg-white/20"
                    : (isScrolled || pathname !== "/")
                      ? "text-neutral-600 hover:text-black hover:bg-neutral-100"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                )}
                aria-label="Compte"
                aria-haspopup="true"
                aria-expanded={profileOpen}
              >
                <svg className="w-[18px] h-[18px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </button>

              {profileOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-[450]"
                    onClick={() => setProfileOpen(false)}
                  />
                  {/* Dropdown panel */}
                  <div
                    className="absolute right-0 mt-3 w-64 z-[460] animate-fadeIn shadow-xl"
                  >
                    {/* Arrow */}
                    <div className="absolute -top-2 right-3.5 w-4 h-4 bg-white border-l border-t border-neutral-200 rotate-45 z-10" />
                    <div className="relative bg-white border border-neutral-200 rounded-none overflow-hidden pt-1">
                      {/* Header label */}
                      <div className="px-4 py-3 border-b border-neutral-200">
                        <p className="font-display font-bold text-[9px] uppercase tracking-widest text-neutral-400">Choisissez votre espace</p>
                      </div>

                      {/* Option 1: Client */}
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors group"
                      >
                        <div className="w-9 h-9 bg-neutral-100 text-black flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-200">
                          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M20 21a8 8 0 1 0-16 0" />
                          </svg>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-display font-bold text-xs text-black group-hover:text-black transition-colors uppercase">Espace Client</span>
                          <span className="font-body text-[9px] text-neutral-400 mt-0.5">Mon compte, mes commandes</span>
                        </div>
                      </Link>

                      {/* Option 2: Admin */}
                      <Link
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-4 px-4 py-4 hover:bg-neutral-50 transition-colors group border-t border-neutral-100"
                      >
                        <div className="w-9 h-9 bg-neutral-100 text-black flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all duration-200">
                          <svg className="w-5 h-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                            <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                          </svg>
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-display font-bold text-xs text-black group-hover:text-black transition-colors uppercase">Espace Admin</span>
                          <span className="font-body text-[9px] text-neutral-400 mt-0.5">Gestion & administration</span>
                        </div>
                      </Link>

                      {/* Footer hint */}
                      <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200">
                        <p className="font-body text-[9px] text-neutral-400 text-center">Human Unity · Accès sécurisé</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={cn(
                  "px-3 py-2 flex items-center gap-1.5 font-display font-bold text-[10px] uppercase tracking-widest transition-all duration-200 cursor-pointer",
                  (isScrolled || pathname !== "/")
                    ? "text-neutral-600 hover:text-black hover:bg-neutral-100"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                <svg className="w-3 h-3 fill-none stroke-current opacity-60" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{locale.toUpperCase()}</span>
                <svg
                  className={cn(
                    "w-3 h-3 fill-none stroke-current transition-transform duration-200",
                    langOpen && "rotate-180"
                  )}
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {langOpen && (
                <>
                  <div
                    className="fixed inset-0 z-dropdown"
                    onClick={() => setLangOpen(false)}
                  />
                  <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-36 bg-white border border-neutral-200 rounded-none shadow-xl py-2 z-fixed overflow-hidden">
                    {locales.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => handleLanguageChange(loc)}
                        className={cn(
                          "w-full px-4 py-2.5 text-left rtl:text-right font-display font-bold text-[10px] tracking-wider hover:bg-neutral-50 transition-colors cursor-pointer flex items-center justify-between uppercase",
                          locale === loc ? "text-black" : "text-neutral-500"
                        )}
                      >
                        <span>{loc === "fr" ? "Français" : loc === "en" ? "English" : "العربية"}</span>
                        {locale === loc && (
                          <span className="w-1.5 h-1.5 bg-black" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className={cn(
                "relative p-2.5 transition-all duration-200 cursor-pointer",
                (isScrolled || pathname !== "/")
                  ? "text-neutral-600 hover:text-black hover:bg-neutral-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-label="Open cart"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {itemCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 text-white font-display font-black text-[9px] w-5 h-5 rounded-none flex items-center justify-center bg-black"
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "lg:hidden p-2.5 transition-all duration-200 cursor-pointer",
                (isScrolled || pathname !== "/")
                  ? "text-neutral-600 hover:text-black hover:bg-neutral-100"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-label="Toggle menu"
            >
              <svg className="w-[18px] h-[18px] fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t border-neutral-200 shadow-xl px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "font-display font-bold text-xs uppercase tracking-widest py-3 px-4 transition-all",
                    isActive
                      ? "text-black bg-neutral-100"
                      : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="h-px my-3 bg-neutral-200" />

            {/* Profile options in mobile */}
            <p className="font-display font-bold text-[9px] uppercase tracking-widest text-neutral-400 px-1 mb-2">Votre espace</p>
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-none hover:bg-neutral-50 transition-colors group"
            >
              <div className="w-8 h-8 bg-neutral-100 text-black flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>
              </div>
              <div className="text-left">
                <span className="font-display font-bold text-xs text-black block group-hover:text-black transition-colors uppercase">Espace Client</span>
                <span className="font-body text-[9px] text-neutral-400">Mon compte, mes commandes</span>
              </div>
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-3 px-4 rounded-none hover:bg-neutral-50 transition-colors group"
            >
              <div className="w-8 h-8 bg-neutral-100 text-black flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-all">
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2"><path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v3H9V7zm3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" /></svg>
              </div>
              <div className="text-left">
                <span className="font-display font-bold text-xs text-black block group-hover:text-black transition-colors uppercase">Espace Admin</span>
                <span className="font-body text-[9px] text-neutral-400">Gestion & administration</span>
              </div>
            </Link>

            <div className="h-px my-3 bg-neutral-200" />
            <div className="flex gap-2">
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => { handleLanguageChange(loc); setMobileOpen(false); }}
                  className={cn(
                    "flex-1 py-2.5 font-display text-xs uppercase tracking-wider transition-all cursor-pointer rounded-none",
                    locale === loc
                      ? "bg-black text-white font-bold"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {loc === "fr" ? "FR" : loc === "en" ? "EN" : "ع"}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
