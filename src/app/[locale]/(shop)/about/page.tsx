"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Grid } from "@/components/layout/Grid";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { useLocale } from "next-intl";

export default function AboutPage() {
  const locale = useLocale();

  const brandValues = [
    {
      title: locale === "ar" ? "الوحدة والمجتمع" : "Unité & Communauté",
      desc: locale === "ar" 
        ? "نحن نؤمن بأن ملابس الشارع هي لوحة فنية تجمع الناس وتثير نقاشات هادفة حول قيمنا المشتركة." 
        : "Nous croyons que le streetwear est un vecteur pour rassembler les gens et susciter des conversations significatives.",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      )
    },
    {
      title: locale === "ar" ? "التعبير الإبداعي" : "Expression Créative",
      desc: locale === "ar"
        ? "ندمج الموضة، الفن، التصوير الفوتوغرافي وصناعة الأفلام لتجاوز الانقسامات الاجتماعية والحدود الثقافية."
        : "Nous fusionnons la mode, la photographie, le cinéma et l'art pour transcender les divisions et les frontières.",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
          <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" />
        </svg>
      )
    },
    {
      title: locale === "ar" ? "الجودة الواعية" : "Qualité Consciente",
      desc: locale === "ar"
        ? "ملابس مصنوعة لتدوم: نستخدم قطناً عضويًا ثقيل الوزن (GSM عالي) وخياطة متينة ومسؤولة أخلاقياً."
        : "Des vêtements conçus pour durer : nous utilisons du coton biologique lourd et des finitions soignées.",
      icon: (
        <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex-1 bg-neutral-900 text-white">
      {/* Hero Banner */}
      <section className="relative h-[55vh] min-h-[400px] w-full flex items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/products/33BFB687-4A34-4B35-A844-F8C959EBA8DD.png"
            alt="Human Unity Brand Story"
            className="w-full h-full object-cover opacity-35 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent" />
        </div>
        <Container className="relative z-10 text-center flex flex-col items-center gap-4">
          <span className="font-display font-semibold text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-400">
            {locale === "ar" ? "من نحن" : "OUR MOVEMENT"}
          </span>
          <h1 className="font-display font-black text-4xl md:text-6xl tracking-tighter uppercase">
            {locale === "ar" ? "حركة هيومن يونيتي" : "HUMAN.UNITY"}
          </h1>
          <div className="w-12 h-px bg-white/20 my-2" />
          <p className="font-body text-xs md:text-sm text-neutral-300 max-w-xl">
            {locale === "ar" 
              ? "حركة ملابس شارع معاصرة مبنية حول فكرة بسيطة: التواصل الإنساني خارج الحدود والثقافات والانقسامات."
              : "A contemporary streetwear brand built around a simple idea: human connection beyond borders, cultures, religions, and backgrounds."}
          </p>
        </Container>
      </section>

      {/* Narrative Section */}
      <Section padding="luxury" className="bg-neutral-950 border-t border-neutral-900">
        <Container>
          <Grid cols={1} colsMd={2} gap="lg" className="items-center">
            <AnimatedSection direction="right" className="flex flex-col gap-6 text-left rtl:text-right">
              <span className="font-display font-semibold text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                {locale === "ar" ? "الرسالة والرؤية" : "THE BRAND STORY"}
              </span>
              <h2 className="font-display font-black text-2xl md:text-4xl text-white tracking-tighter leading-tight uppercase">
                {locale === "ar" 
                  ? "تجاوز الحدود والتواصل عبر الإبداع"
                  : "CONNECTION BEYOND BORDERS"}
              </h2>
              <div className="h-px bg-neutral-850" />
              <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
                {locale === "ar" 
                  ? "تأسست HUMAN.UNITY كاستجابة لعالم مجزأ. نحن نرى الملابس كشكل من أشكال التعبير الفني والإعلامي. كل قطعة في تشكيلتنا تحمل قصة، رسالة، أو رمزا يدعو للتقارب الإنساني والتفاهم المتبادل."
                  : "HUMAN.UNITY was born out of a desire to bridge divides. We look at fashion not just as aesthetic garments, but as a physical medium to spark empathy, curiosity, and cross-cultural dialogue."}
              </p>
              <p className="font-body text-xs md:text-sm text-neutral-400 leading-relaxed">
                {locale === "ar"
                  ? "مجموعاتنا تجمع بين القصات العصرية المريحة والمواد عالية الجودة التي تدوم طويلاً، مما يجعلها درعاً يومياً لمن يعتقدون أن ما يوحدنا كبشر أكبر بكثير مما يفرقنا."
                  : "By combining clean monochrome visuals, premium heavyweight organic fabrics, and artistic editorial statements, we construct daily uniforms for those who believe we are all fundamentally connected."}
              </p>
            </AnimatedSection>
            
            <AnimatedSection direction="left" className="relative aspect-[4/3] rounded-none overflow-hidden border border-neutral-800">
              <img
                src="/products/73DD94C0-FC1F-4508-87A0-08604DE2766B.png"
                alt="Human Unity Artistic Editorial"
                className="w-full h-full object-cover grayscale"
              />
            </AnimatedSection>
          </Grid>
        </Container>
      </Section>

      {/* Values Section */}
      <Section padding="luxury" className="bg-neutral-900 border-t border-neutral-950">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
            <span className="font-display font-semibold text-[10px] uppercase tracking-[0.2em] text-neutral-400">
              {locale === "ar" ? "قيمنا الأساسية" : "OUR VALUES"}
            </span>
            <h2 className="font-display font-black text-2xl md:text-4xl text-white tracking-tight uppercase">
              {locale === "ar" ? "ما نلتزم به" : "WHAT WE STAND FOR"}
            </h2>
            <div className="w-12 h-px bg-white/20 mx-auto my-1" />
          </div>

          <Grid cols={1} colsMd={3} gap="md">
            {brandValues.map((val, idx) => (
              <AnimatedSection
                key={val.title}
                direction="up"
                delay={idx * 0.1}
                className="bg-neutral-950 p-8 rounded-none border border-neutral-850 text-left rtl:text-right flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-none bg-white text-black flex items-center justify-center">
                  {val.icon}
                </div>
                <h3 className="font-display font-black text-base text-white uppercase tracking-tight">
                  {val.title}
                </h3>
                <p className="font-body text-xs text-neutral-400 leading-relaxed">
                  {val.desc}
                </p>
              </AnimatedSection>
            ))}
          </Grid>
        </Container>
      </Section>
    </div>
  );
}
