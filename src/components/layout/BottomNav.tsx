"use client";

import * as React from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const pathname = usePathname();

  const setCartOpen = useUIStore((state) => state.setCartOpen);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    {
      href: "/",
      label: t("home"),
      icon: (
        <svg className="w-5.5 h-5.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
    },
    {
      href: "/discover",
      label: t("discover"),
      icon: (
        <svg className="w-5.5 h-5.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      href: "#cart",
      label: t("cart") || "Panier",
      isCartTrigger: true,
      icon: (
        <div className="relative">
          <svg className="w-5.5 h-5.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary-500 text-white font-display font-bold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-surface-50">
              {itemCount}
            </span>
          )}
        </div>
      ),
    },
    {
      href: "/profile",
      label: locale === "ar" ? "حسابي" : "Mon compte",
      icon: (
        <svg className="w-5.5 h-5.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-50/80 backdrop-blur-md border-t border-border-default py-2.5 px-4 z-fixed flex items-center justify-around shadow-lg">
      {navItems.map((item, idx) => {
        if (item.isCartTrigger) {
          return (
            <button
              key={idx}
              onClick={() => setCartOpen(true)}
              className="flex flex-col items-center gap-1 text-text-secondary hover:text-primary-500 transition-colors cursor-pointer"
              aria-label="Open Cart"
            >
              {item.icon}
              <span className="text-[10px] font-display uppercase tracking-widest font-semibold">
                {item.label}
              </span>
            </button>
          );
        }

        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary-500" : "text-text-secondary hover:text-primary-500"
            )}
          >
            {item.icon}
            <span className="text-[10px] font-display uppercase tracking-widest font-semibold">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
