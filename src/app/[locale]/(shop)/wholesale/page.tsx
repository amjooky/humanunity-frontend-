"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { useTranslations, useLocale } from "next-intl";

export default function WholesalePage() {
  const t = useTranslations("Wholesale");
  const locale = useLocale();

  const [formSubmitted, setFormSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    taxId: "",
    businessType: "boutique",
    monthlyVolume: "less_50",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone || !formData.contactPerson) return;
    setFormSubmitted(true);
  };

  const handleWhatsAppConfirm = () => {
    const message = encodeURIComponent(
      `Bonjour Human Unity. Je souhaite confirmer ma demande de compte Revendeur.\n\n` +
      `🏢 Entreprise: ${formData.companyName}\n` +
      `👤 Contact: ${formData.contactPerson}\n` +
      `📞 Tél: ${formData.phone}\n` +
      `💼 Activité: ${formData.businessType}\n` +
      `🔢 Matricule Fiscal: ${formData.taxId}`
    );
    window.open(`https://wa.me/21658409210?text=${message}`, "_blank");
  };

  return (
    <Section padding="luxury" background="cream" className="flex-1 min-h-[80vh] flex items-center justify-center">
      <Container className="max-w-xl">
        <AnimatedSection direction="up" delay={0.1}>
          {!formSubmitted ? (
            <Card className="p-8 md:p-10 border border-border-default shadow-elevated bg-surface-50 rounded-3xl">
              <div className="text-center mb-8 flex flex-col gap-2">
                <span className="font-display font-semibold text-[10px] uppercase tracking-widest text-primary-500">
                  {locale === "ar" ? "فضاء المهنيين" : "ESPACE PROFESSIONNEL"}
                </span>
                <h1 className="font-display font-bold text-2xl md:text-3xl text-text-primary tracking-tight">
                  {t("applyTitle")}
                </h1>
                <p className="font-body text-xs text-text-secondary leading-relaxed">
                  {t("applySubtitle")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Input
                  label={t("companyName")}
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                  placeholder={locale === "ar" ? "ش.م.م شركة التوزيع" : "Ex: Heritage Store S.A.R.L"}
                />

                <Input
                  label={locale === "ar" ? "الشخص المسؤول" : "Nom du responsable"}
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Mohamed Ben Ali"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={locale === "ar" ? "الهاتف" : "Téléphone"}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    type="tel"
                    required
                    placeholder="Ex: 50 123 456"
                  />
                  <Input
                    label={locale === "ar" ? "البريد الإلكتروني" : "Adresse Email"}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    placeholder="Ex: contact@entreprise.tn"
                  />
                </div>

                <Input
                  label={t("taxId")}
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="Ex: 1234567/A/M/000"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label={t("businessType")}
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    options={[
                      { value: "boutique", label: locale === "ar" ? "بوتيك / محل أزياء" : "Boutique / Concept Store" },
                      { value: "popup", label: locale === "ar" ? "بوب أب ستور" : "Pop-up Store" },
                      { value: "ecommerce", label: locale === "ar" ? "متجر إلكتروني" : "E-commerce / Marketplace" },
                      { value: "streetwear", label: locale === "ar" ? "محل ملابس شارع" : "Streetwear Shop" },
                      { value: "reseller", label: locale === "ar" ? "موزع مستقل" : "Revendeur Indépendant" },
                    ]}
                  />
                  <Select
                    label={t("monthlyVolume")}
                    name="monthlyVolume"
                    value={formData.monthlyVolume}
                    onChange={handleInputChange}
                    options={[
                      { value: "less_50", label: locale === "ar" ? "أقل من 50 قطعة" : "Moins de 50 pièces / mois" },
                      { value: "50_150", label: locale === "ar" ? "50 - 150 قطعة" : "50 - 150 pièces / mois" },
                      { value: "150_500", label: locale === "ar" ? "150 - 500 قطعة" : "150 - 500 pièces / mois" },
                      { value: "more_500", label: locale === "ar" ? "أكثر من 500 قطعة" : "Plus de 500 pièces / mois" },
                    ]}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full mt-3 rounded-none">
                  {t("submitApplication")}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-8 md:p-10 border border-border-default shadow-elevated bg-surface-50 rounded-none text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <h1 className="font-display font-bold text-2xl text-text-primary tracking-tight">
                  {t("pendingTitle")}
                </h1>
                <p className="font-body text-xs md:text-sm text-text-secondary leading-relaxed max-w-sm">
                  {t("pendingDesc")}
                </p>
              </div>

              <div className="w-full border-t border-border-default pt-6 flex flex-col gap-4">
                <p className="font-body text-xs text-text-tertiary">
                  {locale === "ar"
                    ? "لتسريع عملية التفعيل، يرجى تأكيد طلبك مع فريق المبيعات لدينا عبر الواتساب."
                    : "Pour accélérer l'activation de votre compte, confirmez votre demande directement avec notre équipe commerciale sur WhatsApp."}
                </p>
                <Button
                  onClick={handleWhatsAppConfirm}
                  variant="gold"
                  size="lg"
                  className="w-full rounded-none shadow-md bg-emerald-600 hover:bg-emerald-700 text-white border-none flex items-center justify-center gap-2"
                  leftIcon={
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97-1.863-1.868-4.343-2.898-6.978-2.9-5.442 0-9.866 4.372-9.87 9.802 0 1.73.476 3.42 1.378 4.927l-.994 3.633 3.735-.976zm10.302-6.85c-.276-.138-1.636-.807-1.89-.9-.253-.093-.437-.138-.62.138-.184.277-.713.9-.873 1.084-.159.184-.32.207-.597.069-.276-.138-1.169-.43-2.227-1.374-.823-.733-1.379-1.64-1.54-1.916-.16-.276-.017-.425.121-.563.125-.124.276-.322.415-.483.138-.161.184-.276.276-.46.093-.184.047-.346-.023-.483-.07-.138-.62-1.496-.85-2.05-.223-.538-.448-.465-.62-.474-.159-.009-.344-.01-.53-.01s-.487.07-.74.346c-.253.277-.965.944-.965 2.3 0 1.357.987 2.668 1.125 2.852.138.184 1.942 2.966 4.704 4.158.657.284 1.17.453 1.57.58.66.21 1.26.181 1.734.11.53-.08 1.636-.668 1.867-1.314.23-.647.23-1.2.16-1.314-.069-.115-.253-.184-.53-.322z"/>
                    </svg>
                  }
                >
                  {locale === "ar" ? "تأكيد الطلب عبر واتساب" : "Confirmer via WhatsApp"}
                </Button>
              </div>
            </Card>
          )}
        </AnimatedSection>
      </Container>
    </Section>
  );
}
