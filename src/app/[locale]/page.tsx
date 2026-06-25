import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { BestsellersGrid } from "@/components/commerce/BestsellersGrid";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

interface HomeProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomeProps) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  const t = await getTranslations({ locale, namespace: "Home" });

  const categories = [
    {
      slug: "t-shirts",
      title: locale === "ar" ? "تي شيرت" : "T-Shirts",
      desc: locale === "ar" ? "قصات واسعة من القطن الثقيل 240 GSM" : "Oversized shapes in heavy 240 GSM cotton.",
      image: "/products/71CA9D12-CCCB-4DCA-BBC4-FA9A4B5C054C.png",
      accent: "#171717",
      icon: "👕",
    },
    {
      slug: "hoodies",
      title: locale === "ar" ? "هوديز" : "Hoodies",
      desc: locale === "ar" ? "قصات بوكسي من مولتون ثقيل 400 GSM" : "Boxy cuts in ultra-heavy 400 GSM fleece.",
      image: "/products/22E54FA2-09E7-4C49-BD58-5B8286BED6CC.png",
      accent: "#262626",
      icon: "🧥",
    },
    {
      slug: "bottoms",
      title: locale === "ar" ? "بناطيل" : "Bottoms",
      desc: locale === "ar" ? "بناطيل رياضية ثقيلة وكارغو تقنية" : "Heavyweight sweatpants and tech cargo pants.",
      image: "/products/card 1.png",
      accent: "#404040",
      icon: "👖",
    },
    {
      slug: "outerwear",
      title: locale === "ar" ? "ملابس خارجية" : "Outerwear",
      desc: locale === "ar" ? "سترات تقنية واقية من الرياح ومقاومة للماء" : "Technical windbreakers and coaches jackets.",
      image: "/products/1517E8D4-72BF-4BA4-B415-C01FA6CE9C93.png",
      accent: "#525252",
      icon: "🧥",
    },
  ];

  const stats = [
    { value: "100%", label: locale === "ar" ? "قطن عضوي" : "Organic Cotton" },
    { value: "400 GSM", label: locale === "ar" ? "مولتون ثقيل" : "Heavyweight Fleece" },
    { value: "LIMITED", label: locale === "ar" ? "إصدارات محدودة" : "Limited Drops" },
    { value: "ETHICAL", label: locale === "ar" ? "تصنيع مسؤول" : "Ethical Craft" },
  ];

  return (
    <div className="flex flex-col gap-0 overflow-hidden w-full -mt-[95px]">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Background Image with parallax hint */}
        <div className="absolute inset-0 z-0">
          <img
            src="/products/8055F17C-A693-4186-A2FD-8B7E347A300E.png"
            alt="HUMAN.UNITY Streetwear Movement"
            className="w-full h-full object-cover opacity-45 grayscale"
            style={{ transform: "scale(1.02)" }}
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/30" />
          {/* Grain texture */}
          <div className="grain-overlay" />
        </div>

        {/* Floating orb decorations - toned down for streetwear */}
        <div
          className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #525252, transparent)" }}
        />
        <div
          className="absolute bottom-1/4 right-[10%] w-80 h-80 rounded-full opacity-5 blur-3xl"
          style={{ background: "radial-gradient(circle, #a3a3a3, transparent)" }}
        />

        {/* Hero content */}
        <Container className="relative z-10 text-center flex flex-col items-center gap-6 max-w-5xl px-4 pt-24 pb-16">
          {/* Eyebrow */}
          <AnimatedSection direction="up" delay={0.05} duration={0.8}>
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-none border border-white/20 bg-white/5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-none bg-white" />
              <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-white">
                {locale === "ar" ? "تواصل وراء الحدود" : "CONNECT BEYOND BORDERS"}
              </span>
              <span className="w-1.5 h-1.5 rounded-none bg-white" />
            </div>
          </AnimatedSection>

          {/* Main headline */}
          <AnimatedSection direction="up" delay={0.15} duration={0.9}>
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.95] text-white uppercase">
              {locale === "ar" ? (
                <>
                  <span>نحن متصلون أكثر</span>
                  <br />
                  <span className="text-white/60 font-light">مما نظن</span>
                </>
              ) : (
                <>
                  WE ARE MORE
                  <br />
                  <span className="text-white/55 font-light">CONNECTED</span>
                  <br />
                  THAN WE THINK.
                </>
              )}
            </h1>
          </AnimatedSection>

          {/* Divider */}
          <AnimatedSection direction="up" delay={0.2} duration={0.8}>
            <div className="flex items-center gap-4 w-full max-w-xs">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-xs">╳</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>
          </AnimatedSection>

          {/* Description */}
          <AnimatedSection direction="up" delay={0.25} duration={0.8}>
            <p className="font-body text-xs md:text-sm text-white/70 leading-relaxed max-w-xl">
              {t("hero.description")}
            </p>
          </AnimatedSection>

          {/* CTAs */}
          <AnimatedSection direction="up" delay={0.35} duration={0.8} className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
            <Link href="/discover" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:min-w-[200px] rounded-none bg-white text-black hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1"
              >
                {t("hero.ctaPrimary")}
              </Button>
            </Link>
            <Link href="/wholesale" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:min-w-[200px] rounded-none border-2 border-white/50 text-white hover:bg-white hover:text-black transition-all hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] hover:-translate-y-1 hover:-translate-x-1 backdrop-blur-sm"
              >
                {t("hero.ctaSecondary")}
              </Button>
            </Link>
          </AnimatedSection>

          {/* Scroll hint */}
          <AnimatedSection direction="up" delay={0.5} duration={0.8} className="mt-8">
            <a
              href="#categories-section"
              className="flex flex-col items-center gap-2 opacity-40 hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-0 no-underline"
              aria-label="Scroll Down"
            >
              <span className="font-display text-[9px] uppercase tracking-widest text-white">COLLECTIONS</span>
              <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </a>
          </AnimatedSection>
        </Container>

        {/* Stats ribbon at bottom */}
        <div className="absolute bottom-0 left-0 w-full z-10 border-t border-white/10 bg-black/75 backdrop-blur-md py-5 px-4">
          <div className="max-w-(--container-xl) mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0">
            {stats.map((stat, i) => (
              <div key={i} className={`flex flex-col items-center text-center ${i > 0 ? "md:border-l md:border-white/10" : ""}`}>
                <span className="font-display font-black text-xl md:text-2xl text-white">
                  {stat.value}
                </span>
                <span className="font-body text-[9px] text-white/50 mt-1 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VIDEO SHOWCASE ─── */}
      <section id="categories-section" className="relative w-full overflow-hidden" style={{ minHeight: "520px" }}>
        {/* Video background */}
        <video
          src="/products/video.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.40) grayscale(0.5)" }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/20" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-28 gap-6 h-full min-h-[520px]">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-none border border-white/20 bg-white/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 bg-white" />
            <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-white">
              HUMAN.UNITY — MOVEMENT
            </span>
            <span className="w-1.5 h-1.5 bg-white" />
          </div>

          {/* Headline */}
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tighter leading-none max-w-4xl uppercase">
            WE ARE ONE
          </h2>

          {/* Divider */}
          <div className="flex items-center gap-4 w-48">
            <div className="flex-1 h-px bg-white/20" />
            <span className="text-white/40 text-xs">╳</span>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* Body */}
          <p className="font-body text-xs md:text-sm text-white/70 leading-relaxed max-w-xl">
            Inspired by youth culture, photography, art, and cinema. Streetwear constructed as a canvas to remind us of our common human essence.
          </p>

          {/* Type chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            {["T-Shirts", "Hoodies", "Pantalons", "Outerwear"].map((type) => (
              <span
                key={type}
                className="px-4 py-1.5 rounded-none backdrop-blur-md font-display font-semibold text-[10px] uppercase tracking-widest text-white/80 border border-white/20 bg-white/5"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category Showcase ─── */}
      <Section padding="luxury" className="bg-neutral-950">
        <Container>
          <AnimatedSection direction="up" className="flex flex-col items-center text-center gap-4 mb-16 max-w-2xl mx-auto">
            <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              {locale === "ar" ? "التشكيلة" : "OUR COLLECTIONS"}
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight uppercase">
              {t("categories.title")}
            </h2>
            <div className="flex items-center gap-4 w-48">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-neutral-600 text-xs">╳</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>
            <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
              {t("categories.subtitle")}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((cat, idx) => {
              return (
                <AnimatedSection
                  key={cat.slug}
                  direction="up"
                  delay={idx * 0.06}
                  className="group relative rounded-none overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2 border border-neutral-800 bg-neutral-900 h-[380px]"
                >
                  <Link href={`/discover?category=${cat.slug}`} className="absolute inset-0 z-10 flex flex-col justify-between p-6">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] ease-luxury group-hover:scale-105 grayscale group-hover:grayscale-0"
                      />
                      {/* Gradient overlays */}
                      <div
                        className="absolute inset-0 transition-all duration-500 group-hover:opacity-85"
                        style={{
                          background: `linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.5) 60%, transparent 100%)`,
                        }}
                      />
                      {/* Grain effect */}
                      <div className="grain-overlay opacity-5" />
                    </div>

                    {/* Top Content */}
                    <div className="relative z-10 flex items-center justify-end w-full">
                      <span className="px-2.5 py-1 rounded-none font-display font-semibold text-[8px] uppercase tracking-widest text-white/80 bg-white/5 border border-white/10 backdrop-blur-sm">
                        {locale === "ar" ? "مجموعة مميزة" : "DROP 01"}
                      </span>
                    </div>

                    {/* Bottom Content */}
                    <div className="relative z-10 flex flex-col gap-2 mt-auto text-white text-left rtl:text-right">
                      {/* Main Title */}
                      <h3 className="font-display font-black text-lg tracking-tight leading-tight uppercase group-hover:text-neutral-300 transition-colors duration-300">
                        {cat.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="font-body text-[11px] text-white/70 leading-relaxed line-clamp-2">
                        {cat.desc}
                      </p>

                      {/* Action trigger */}
                      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/10">
                        <span className="inline-flex items-center gap-1.5 font-display font-bold text-[9px] uppercase tracking-widest text-white">
                          {locale === "ar" ? "اكتشف المجموعة" : "View Drop"}
                        </span>
                        <svg 
                          className="w-3 h-3 text-white transform transition-transform duration-300 group-hover:translate-x-1" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2.5" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ─── EDITORIAL CAMPAIGN SHOWCASE ─── */}
      <Section padding="luxury" className="bg-neutral-950 border-t border-neutral-900">
        <Container>
          {/* Section Header */}
          <AnimatedSection direction="up" className="flex flex-col items-center text-center gap-4 mb-14 max-w-3xl mx-auto">
            <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              EDITORIAL CAMPAIGN
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight uppercase">
              THE ART OF CONNECTION
            </h2>
            <div className="flex items-center gap-4 w-48">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-neutral-600 text-xs">╳</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>
            <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
              Drop 01 captures the quiet, powerful moments of human vulnerability and mutual trust.
            </p>
          </AnimatedSection>

          {/* Block 1: Wide Banner */}
          <AnimatedSection direction="up" delay={0.05} className="relative w-full rounded-none overflow-hidden mb-8 group h-[380px]">
            <img
              src="/products/33BFB687-4A34-4B35-A844-F8C959EBA8DD.png"
              alt="HUMAN.UNITY Drop 01 Vision"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col justify-center h-full px-10 py-16 gap-5 max-w-2xl text-left">
              <h3 className="font-display font-black text-2xl md:text-4xl text-white leading-tight tracking-tight uppercase">
                THE SUNSET CAMPAIGN
              </h3>
              <p className="font-body text-xs md:text-sm text-white/70 leading-relaxed">
                Shot on 35mm film, our campaign reflects the transient beauty of raw human emotion, symbolizing that we all live under the same sky.
              </p>
              <div className="flex gap-2">
                {["Limited Drop", "35mm Editorial", "Organic basics"].map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-none font-display font-semibold text-[9px] uppercase tracking-widest text-white/80 border border-white/20 bg-white/5"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Block 2: 3 Portrait Detail Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

            {/* Card 1 - The Vision */}
            <AnimatedSection direction="up" delay={0.1} className="relative rounded-none overflow-hidden group h-[520px]">
              <img
                src="/products/73DD94C0-FC1F-4508-87A0-08604DE2766B.png"
                alt="The Vision"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103 grayscale"
              />
            </AnimatedSection>

            {/* Card 2 - The Quality */}
            <AnimatedSection direction="up" delay={0.18} className="relative rounded-none overflow-hidden group h-[520px]">
              <img
                src="/products/card 1.png"
                alt="The Quality"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103 grayscale"
              />
            </AnimatedSection>

            {/* Card 3 - The Community */}
            <AnimatedSection direction="up" delay={0.26} className="relative rounded-none overflow-hidden group h-[520px]">
              <img
                src="/products/8055F17C-A693-4186-A2FD-8B7E347A300E.png"
                alt="The Community"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-103 grayscale"
              />
            </AnimatedSection>
          </div>

          {/* Block 3: Wide Technical details Banner */}
          <AnimatedSection direction="up" delay={0.05} className="relative w-full rounded-none overflow-hidden group h-[360px]">
            <img
              src="/products/1517E8D4-72BF-4BA4-B415-C01FA6CE9C93.png"
              alt="Technical Details and Fabric"
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-103 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
            <div className="relative z-10 flex flex-col h-full px-10 py-12 gap-6 justify-between text-left">
              <h3 className="font-display font-black text-xl md:text-3xl text-white leading-tight tracking-tight uppercase text-center">
                AKHIRA TECHNICAL LINE
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
                <div className="flex flex-col gap-2 p-5 rounded-none bg-neutral-900/80 border border-neutral-800">
                  <p className="font-display font-black text-base text-white uppercase tracking-wide">RIPSTOP NYLON</p>
                  <p className="font-display font-semibold text-[9px] text-neutral-400 uppercase tracking-widest">Water Resistant</p>
                  <p className="font-body text-xs text-white/75 leading-relaxed mt-1">
                    Technically structured weave designed to prevent tears while maintaining a lightweight feel.
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-5 rounded-none bg-neutral-900/80 border border-neutral-800">
                  <p className="font-display font-black text-base text-white uppercase tracking-wide">SHERPA FLEECE</p>
                  <p className="font-display font-semibold text-[9px] text-neutral-400 uppercase tracking-widest">Thermal Protection</p>
                  <p className="font-body text-xs text-white/75 leading-relaxed mt-1">
                    Dense high-pile polyester fleece that retains heat in severe weather.
                  </p>
                </div>
              </div>
              <p className="font-display font-bold text-[9px] text-neutral-400 uppercase tracking-widest text-center">
                FUNCTIONAL BASICS DESIGNED FOR THE URBAN ENVIRONMENT.
              </p>
            </div>
          </AnimatedSection>
        </Container>
      </Section>

      {/* ─── Bestsellers Section ─── */}
      <Section padding="luxury" className="bg-neutral-950 border-t border-neutral-900">
        <Container>
          <AnimatedSection direction="up" className="flex flex-col items-center text-center gap-4 mb-16 max-w-2xl mx-auto">
            <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-neutral-400">
              {locale === "ar" ? "الأكثر طلباً" : "DROP 01 CATALOG"}
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight uppercase">
              {t("bestsellers.title")}
            </h2>
            <div className="flex items-center gap-4 w-48">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-neutral-600 text-xs">╳</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>
            <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
              {t("bestsellers.subtitle")}
            </p>
          </AnimatedSection>

          <BestsellersGrid />

          <AnimatedSection direction="up" delay={0.2} className="flex justify-center mt-12">
            <Link href="/discover">
              <Button variant="outline" size="lg" className="rounded-none px-10 border-neutral-850 hover:border-white hover:text-white text-neutral-300">
                {locale === "ar" ? "عرض جميع المنتجات" : "View Full Catalog"}
              </Button>
            </Link>
          </AnimatedSection>
        </Container>
      </Section>

      {/* ─── Brand Legacy Section ─── */}
      <Section padding="luxury" className="bg-neutral-950 border-t border-b border-neutral-900">
        <Container>
          <Grid cols={1} colsMd={2} gap="lg" className="items-center">
            <AnimatedSection direction="right" className="relative aspect-video md:aspect-square rounded-none overflow-hidden border border-neutral-800 group">
              <img
                src="/products/73DD94C0-FC1F-4508-87A0-08604DE2766B.png"
                alt="Human Unity Artistic Vision"
                className="w-full h-full object-cover img-luxury grayscale"
              />
              <div className="absolute bottom-6 right-6 px-5 py-3 rounded-none bg-neutral-900 border border-neutral-800 shadow-lg">
                <span className="font-display font-bold text-xs text-white uppercase tracking-widest block">
                  EST. 2024
                </span>
                <span className="font-body text-[9px] text-neutral-400 uppercase tracking-widest mt-0.5 block">
                  {locale === "ar" ? "حركة فنية" : "CREATIVE MOVEMENT"}
                </span>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="left" className="flex flex-col gap-6 text-left rtl:text-right">
              <span className="font-display font-semibold text-[10px] uppercase tracking-[0.25em] text-neutral-400">
                {t("brandStory.subtitle")}
              </span>
              <h2 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight leading-tight uppercase">
                {t("brandStory.title")}
              </h2>
              <div className="h-px bg-neutral-850" />
              <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
                {t("brandStory.description")}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                {[
                  { icon: "🌍", label: locale === "ar" ? "تواصل إنساني" : "Human Connection" },
                  { icon: "🧵", label: locale === "ar" ? "مواد عضوية" : "Organic Materials" },
                  { icon: "📦", label: locale === "ar" ? "شحن سريع" : "Fast Delivery" },
                  { icon: "🖤", label: locale === "ar" ? "إصدارات محدودة" : "Limited Editions" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-none bg-neutral-900 border border-neutral-800">
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-display font-semibold text-xs text-white uppercase tracking-wide">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Link href="/about">
                  <Button variant="outline" size="md" className="rounded-none px-8 border-neutral-800 text-white hover:bg-neutral-900 hover:border-neutral-700">
                    {t("brandStory.cta")}
                  </Button>
                </Link>
              </div>
            </AnimatedSection>
          </Grid>
        </Container>
      </Section>

      {/* ─── Wholesale CTA (Partnerships) ─── */}
      <Section padding="luxury" className="relative overflow-hidden bg-black">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/products/8055F17C-A693-4186-A2FD-8B7E347A300E.png"
            alt="HUMAN.UNITY Showroom"
            className="w-full h-full object-cover opacity-10 grayscale"
          />
          <div className="absolute inset-0 bg-black/80" />
          <div className="grain-overlay" />
        </div>

        <Container className="relative z-10">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none text-[9px] font-display font-semibold uppercase tracking-widest border border-white/20 bg-white/5 text-white">
              {t("wholesaleCTA.subtitle")}
            </div>
            <h2 className="font-display font-black text-3xl md:text-6xl text-white tracking-tight leading-tight uppercase">
              {t("wholesaleCTA.title")}
            </h2>
            <div className="flex items-center gap-4 w-48">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/40 text-xs">╳</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>
            <p className="font-body text-xs md:text-sm text-white/60 leading-relaxed max-w-xl">
              {t("wholesaleCTA.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-2 w-full sm:w-auto">
              <Link href="/wholesale" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="rounded-none bg-white text-black hover:bg-neutral-200 transition-colors px-10 w-full"
                >
                  {t("wholesaleCTA.cta")}
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-sm px-10 w-full"
                >
                  {locale === "ar" ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
