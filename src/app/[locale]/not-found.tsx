import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface NotFoundProps {
  params?: Promise<{ locale: string }> | { locale: string };
}

export default async function NotFound({ params }: NotFoundProps) {
  const locale = params ? (await params as any)?.locale ?? "fr" : "fr";
  const t = await getTranslations({ locale, namespace: "Common" }).catch(() => null);

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #D4A84F, transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl" style={{ background: "radial-gradient(circle, #0E5A6B, transparent)" }} />
      </div>

      <div className="relative z-10 max-w-lg flex flex-col items-center gap-6">
        {/* 404 Number */}
        <div
          className="font-display font-black text-[9rem] leading-none tracking-tight"
          style={{
            background: "linear-gradient(135deg, #D4A84F, #F0D89A, #D4A84F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-accent-500/10 flex items-center justify-center text-3xl">
          ☕
        </div>

        {/* Text */}
        <div className="flex flex-col gap-3">
          <h1 className="font-display font-black text-2xl md:text-3xl text-text-primary tracking-tight">
            {locale === "ar" ? "الصفحة غير موجودة" : locale === "en" ? "Page Not Found" : "Page introuvable"}
          </h1>
          <p className="font-body text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
            {locale === "ar"
              ? "عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها."
              : locale === "en"
              ? "Sorry, the page you are looking for doesn't exist or has been moved."
              : "Désolé, la page que vous recherchez n'existe pas ou a été déplacée."}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 w-40">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,79,0.5))" }} />
          <span className="text-accent-400 text-xs">✦</span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(212,168,79,0.5), transparent)" }} />
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/"
            className="px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-widest text-white transition-all duration-300 hover:opacity-90 hover:-translate-y-0.5 text-center"
            style={{ background: "linear-gradient(135deg,#D4A84F,#c4963f)", boxShadow: "0 8px 24px rgba(212,168,79,0.35)" }}
          >
            {locale === "ar" ? "العودة إلى الرئيسية" : locale === "en" ? "Back to Home" : "Retourner à l'accueil"}
          </Link>
          <Link
            href="/discover"
            className="px-8 py-4 rounded-full font-display font-bold text-xs uppercase tracking-widest text-primary-700 border border-primary-200 hover:border-primary-400 bg-white transition-all text-center"
          >
            {locale === "ar" ? "تصفح المنتجات" : locale === "en" ? "Browse Products" : "Découvrir les produits"}
          </Link>
        </div>

        {/* Brand tag */}
        <p className="font-display text-[10px] uppercase tracking-widest text-text-tertiary mt-4">
          © Human Unity — Depuis 2010
        </p>
      </div>
    </div>
  );
}
