"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { useLocale, useTranslations } from "next-intl";

export default function ContactPage() {
  const locale = useLocale();
  const t = useTranslations("Contact");
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Bonjour Human Unity. Je vous contacte depuis le site web.\n` +
      `👤 Nom: ${formData.name || "Client"}\n` +
      `📞 Tél: ${formData.phone || "Non spécifié"}\n` +
      `💬 Message: ${formData.message || "Demande de contact"}`
    );
    window.open(`https://wa.me/971503989965?text=${text}`, "_blank");
  };

  return (
    <Section padding="luxury" background="cream" className="flex-1">
      <Container>
        <div className="text-center max-w-xl mx-auto mb-16 flex flex-col gap-3">
          <span className="font-display font-semibold text-[10px] uppercase tracking-widest text-primary-500">
            {t("tag")}
          </span>
          <h1 className="font-display font-bold text-3xl md:text-5xl text-text-primary tracking-tight">
            {t("title")}
          </h1>
          <p className="font-body text-xs md:text-sm text-text-secondary">
            {t("description")}
          </p>
        </div>

        <Grid cols={1} colsMd={2} gap="lg" className="items-start">
          {/* Info Details */}
          <AnimatedSection direction="right" className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 text-left rtl:text-right">
              <h2 className="font-display font-bold text-xl md:text-2xl text-text-primary tracking-tight">
                {t("addressTitle")}
              </h2>
              <p className="font-body text-xs md:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {t("addressDetail")}
              </p>
            </div>

            <div className="flex flex-col gap-4 text-left rtl:text-right">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-xs text-text-primary tracking-wider uppercase">
                    {t("phone")}
                  </h4>
                  <p className="font-body text-xs text-text-secondary mt-0.5">+216 71 123 456 / +216 50 123 456</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-display font-semibold text-xs text-text-primary tracking-wider uppercase">
                    {t("email")}
                  </h4>
                  <p className="font-body text-xs text-text-secondary mt-0.5">contact@humanunity.tn</p>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp Action Card */}
            <Card className="p-6 bg-emerald-600/5 border border-emerald-600/10 rounded-none text-left rtl:text-right flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-sm text-emerald-800 tracking-tight flex items-center gap-2">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.73-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97-1.863-1.868-4.343-2.898-6.978-2.9-5.442 0-9.866 4.372-9.87 9.802 0 1.73.476 3.42 1.378 4.927l-.994 3.633 3.735-.976zm10.302-6.85c-.276-.138-1.636-.807-1.89-.9-.253-.093-.437-.138-.62.138-.184.277-.713.9-.873 1.084-.159.184-.32.207-.597.069-.276-.138-1.169-.43-2.227-1.374-.823-.733-1.379-1.64-1.54-1.916-.16-.276-.017-.425.121-.563.125-.124.276-.322.415-.483.138-.161.184-.276.276-.46.093-.184.047-.346-.023-.483-.07-.138-.62-1.496-.85-2.05-.223-.538-.448-.465-.62-.474-.159-.009-.344-.01-.53-.01s-.487.07-.74.346c-.253.277-.965.944-.965 2.3 0 1.357.987 2.668 1.125 2.852.138.184 1.942 2.966 4.704 4.158.657.284 1.17.453 1.57.58.66.21 1.26.181 1.734.11.53-.08 1.636-.668 1.867-1.314.23-.647.23-1.2.16-1.314-.069-.115-.253-.184-.53-.322z"/>
                  </svg>
                  {t("whatsappTitle")}
                </h3>
                <p className="font-body text-xs text-text-secondary mt-1">
                  {t("whatsappDesc")}
                </p>
              </div>
              <div>
                <Button
                  onClick={handleWhatsAppDirect}
                  variant="gold"
                  size="md"
                  className="rounded-none bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  {t("whatsappBtn")}
                </Button>
              </div>
            </Card>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection direction="left">
            <Card className="p-8 md:p-10 border border-border-default shadow-elevated bg-surface-50 rounded-none">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <Input
                    label={t("formName")}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder={t("formNamePlaceholder")}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t("formEmail")}
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      type="email"
                      required
                      placeholder={t("formEmailPlaceholder")}
                    />
                    <Input
                      label={t("formPhone")}
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      type="tel"
                      placeholder={t("formPhonePlaceholder")}
                    />
                  </div>

                  <Input
                    label={t("formSubject")}
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t("formSubjectPlaceholder")}
                  />

                  <div className="flex flex-col gap-1.5 text-left rtl:text-right">
                    <label className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wider">
                      {t("formMessage")}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-5 py-4 text-xs font-body border border-border-default rounded-none bg-surface-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors resize-none"
                      placeholder={t("formMessagePlaceholder")}
                    />
                  </div>

                  <Button type="submit" variant="primary" size="lg" className="w-full mt-2 rounded-none">
                    {t("formSubmit")}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-10 flex flex-col items-center gap-6">
                  <div className="w-16 h-16 rounded-none bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display font-bold text-xl text-text-primary">
                      {t("successTitle")}
                    </h3>
                    <p className="font-body text-xs text-text-secondary max-w-xs mx-auto leading-relaxed">
                      {t("successDesc")}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </AnimatedSection>
        </Grid>
      </Container>
    </Section>
  );
}
