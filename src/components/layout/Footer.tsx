"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { SOCIAL_LINKS } from "@cf/shared/constants";

export function Footer() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-neutral-950 text-white pt-20 pb-8 mt-auto overflow-hidden border-t border-neutral-900">
      {/* Dark gray top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-neutral-800" />
      {/* Subtle gray glow */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, #525252, transparent)" }} />

      <div className="max-w-(--container-xl) mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-14 border-b border-neutral-900">

          {/* Brand */}
          <div className="flex flex-col gap-5 text-left">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center bg-white text-black font-display font-black text-sm">
                HU
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-bold text-sm tracking-widest text-white uppercase">Human</span>
                <span className="font-display font-semibold text-[9px] tracking-[0.2em] mt-0.5 text-neutral-500 uppercase">Unity</span>
              </div>
            </div>
            <p className="font-body text-xs text-neutral-400 leading-relaxed">
              {locale === "ar"
                ? "علامة تجارية عصرية لملابس الشارع تركز على التواصل الإنساني العابر للحدود."
                : "Marque de streetwear contemporaine axée sur la connexion humaine au-delà des frontières."}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {[
                { href: SOCIAL_LINKS.facebook, icon: "f", label: "Facebook" },
                { href: SOCIAL_LINKS.instagram, icon: "in", label: "Instagram" },
                { href: SOCIAL_LINKS.whatsapp, icon: "w", label: "WhatsApp" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                  className="w-8 h-8 rounded-none border border-neutral-800 flex items-center justify-center font-display font-bold text-[10px] text-neutral-400 hover:border-white hover:text-white transition-all duration-300">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white">
              {locale === "ar" ? "تصفح" : "Navigation"}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {[
                { href: "/", label: t("home") },
                { href: "/discover", label: t("discover") },
                { href: "/wholesale", label: t("wholesale") },
                { href: "/about", label: t("about") },
                { href: "/contact", label: t("contact") },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-xs text-neutral-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-white/0 group-hover:bg-white transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white">
              {locale === "ar" ? "تواصل" : "Contact"}
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { icon: "📞", text: "+216 58 409 210" },
                { icon: "📍", text: locale === "ar" ? "تونس، تونس" : "Tunis, Tunisie" },
                { icon: "⏰", text: locale === "ar" ? "الإثنين - الجمعة: 8ص - 6م" : "Lun–Ven: 8h–18h" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 flex-shrink-0">{item.icon}</span>
                  <span className="font-body text-xs text-neutral-400">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-white">
              Newsletter
            </h4>
            <p className="font-body text-xs text-neutral-400 leading-relaxed">
              {locale === "ar" ? "اشترك لتصلك أخبار التشكيلات الجديدة." : "Abonnez-vous pour recevoir les nouveautés de nos drops."}
            </p>
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input[type="email"]') as HTMLInputElement;
              const emailVal = input?.value?.trim();
              if (!emailVal) return;
              input.value = "";
              const btn = (e.target as HTMLFormElement).querySelector('button') as HTMLButtonElement;
              const original = btn.textContent;
              btn.textContent = locale === "ar" ? "✅ تم الاشتراك" : "✅ Merci ! Inscrit(e).";
              btn.disabled = true;
              setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 4000);
            }} className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 rounded-none text-xs font-body bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:border-white focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-none font-display font-bold text-xs uppercase tracking-wider text-black bg-white hover:bg-neutral-200 transition-all duration-300 cursor-pointer"
              >
                {locale === "ar" ? "اشتراك" : "S'abonner"}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-[11px] text-neutral-500">
            &copy; {currentYear} Human Unity. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            {["Flouci", "Konnect", "D17", "Cash"].map((p) => (
              <span key={p} className="px-3 py-1 rounded-none border border-neutral-800 bg-neutral-900 font-display text-[9px] tracking-wider text-neutral-500 uppercase">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
