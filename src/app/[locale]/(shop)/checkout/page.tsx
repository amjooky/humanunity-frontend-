"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useCartStore } from "@/stores/cartStore";
import { useProductStore } from "@/stores/productStore";
import { useTranslations, useLocale } from "next-intl";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_COST } from "@cf/shared/constants";
import { Link } from "@/i18n/navigation";
import { formatPrice, PRODUCT_PLACEHOLDER } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { PhoneVerification } from "@/components/commerce/PhoneVerification";

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const cartT = useTranslations("Cart");
  const locale = useLocale();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { addOrder } = useProductStore();

  const subtotal = getSubtotal();
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : DEFAULT_SHIPPING_COST;
  const total = subtotal + shippingCost;

  const supabase = createClient();
  const [user, setUser] = React.useState<any>(null);
  const [phoneVerified, setPhoneVerified] = React.useState(false);
  const [orderPlaced, setOrderPlaced] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "Tunis",
    postalCode: "",
    paymentMethod: "cod",
  });

  React.useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFormData(prev => ({ ...prev, email: user.email || "" }));
        
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-distribution.onrender.com";
          const res = await fetch(`${API_URL}/api/profile/${user.id}`);
          const json = await res.json();
          if (json.success && json.data) {
            const profile = json.data;
            const names = (profile.full_name || "").split(" ");
            const firstName = names[0] || "";
            const lastName = names.slice(1).join(" ") || "";
            setFormData(prev => ({
              ...prev,
              firstName: prev.firstName || firstName,
              lastName: prev.lastName || lastName,
              phone: prev.phone || profile.phone || "",
            }));
            if (profile.phone) {
              setPhoneVerified(true);
            }
          }
        } catch (e) {
          console.error("Error loading profile on checkout:", e);
        }
      }
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.email) {
      alert(locale === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!formData.phone) {
      alert(locale === "ar" ? "يرجى إدخال رقم الهاتف والتحقق منه" : "Veuillez saisir et vérifier votre numéro de téléphone.");
      return;
    }

    if (formData.paymentMethod === "cod" && !phoneVerified) {
      alert(locale === "ar" ? "يرجى التحقق من رقم الهاتف أولاً عبر الـ SMS" : "Veuillez vérifier votre numéro de téléphone par SMS d'abord.");
      return;
    }


    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const orderItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.name,
      productImage: item.image,
      productPrice: item.price,
      quantity: item.quantity,
      lineTotal: item.price * item.quantity,
    }));

    addOrder({
      userId: user ? user.id : "user_guest",
      status: "pending",
      items: orderItems,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        street: formData.address,
        city: formData.city,
        state: formData.city,
        postalCode: formData.postalCode || "1000",
        country: "Tunisie",
        phone: formData.phone,
      },
      subtotal,
      shippingCost,
      taxAmount: 0,
      discountAmount: 0,
      total,
      paymentMethod: formData.paymentMethod as any,
      paymentStatus: "pending",
      isWholesale: false,
    });

    setLoading(false);
    clearCart();
    setOrderPlaced(true);
  };


  const handleWhatsAppConfirm = () => {
    const itemsText = items
      .map((item) => `• ${item.name} (${item.variant?.name || "Standard"}) x${item.quantity}`)
      .join("\n");
    const text = encodeURIComponent(
      `Bonjour HUMAN.UNITY. Je confirme ma commande sur le site web.\n\n` +
      `📦 Détails de la commande:\n${itemsText}\n\n` +
      `💵 Total: ${formatPrice(total, locale)}\n` +
      `👤 Client: ${formData.firstName} ${formData.lastName}\n` +
      `✉️ Email: ${formData.email}\n` +
      `📞 Téléphone: ${formData.phone}\n` +
      `📍 Adresse: ${formData.address}, ${formData.city}\n` +
      `💳 Paiement: ${formData.paymentMethod.toUpperCase()}`
    );
    window.open(`https://wa.me/971503989965?text=${text}`, "_blank");
    clearCart();
  };

  // If order is placed successfully, render success screen
  if (orderPlaced) {
    return (
      <Section padding="luxury" background="cream" className="flex-1 min-h-[70vh] flex items-center justify-center">
        <Container className="max-w-md">
          <AnimatedSection direction="up" delay={0.1}>
            <Card className="p-8 md:p-10 border border-border-default shadow-elevated bg-surface-50 rounded-none text-center flex flex-col items-center gap-6">
              <div className="w-16 h-16 rounded-none bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <div className="flex flex-col gap-2">
                <h1 className="font-display font-bold text-2xl text-text-primary tracking-tight">
                  {t("successTitle")}
                </h1>
                <p className="font-body text-xs md:text-sm text-text-secondary leading-relaxed">
                  {t("successSubtitle")}
                </p>
              </div>

              <div className="w-full border-t border-border-default pt-6 flex flex-col gap-4">
                <h4 className="font-display font-bold text-xs uppercase tracking-widest text-emerald-700">
                  {t("whatsappConfirm")}
                </h4>
                <p className="font-body text-xs text-text-tertiary">
                  {t("whatsappConfirmDesc")}
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
                  {locale === "ar" ? "تأكيد عبر واتساب" : "Confirmer via WhatsApp"}
                </Button>
              </div>
            </Card>
          </AnimatedSection>
        </Container>
      </Section>
    );
  }

  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <Section padding="luxury" background="cream" className="flex-1 min-h-[70vh] flex items-center justify-center">
        <Container className="max-w-md text-center flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-surface-200 text-text-tertiary flex items-center justify-center">
            <svg className="w-8 h-8 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.5">
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-text-primary">
            {cartT("empty")}
          </h2>
          <Link href="/discover" className="block">
            <Button variant="primary" size="md" className="rounded-none">
              {locale === "ar" ? "الذهاب إلى المتجر" : "Découvrir la Boutique"}
            </Button>
          </Link>
        </Container>
      </Section>
    );
  }

  return (
    <Section padding="lg" background="cream" className="flex-1">
      <Container>
        <h1 className="font-display font-bold text-2xl md:text-4xl text-text-primary tracking-tight mb-10 text-left rtl:text-right">
          {t("title")}
        </h1>

        <form onSubmit={handleSubmit}>
          <Grid cols={1} colsLg={3} gap="lg" className="items-start">
            {/* Shipping Address and Payment Info */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Card className="p-6 md:p-8 bg-white border border-border-default rounded-none">
                <h3 className="font-display font-bold text-lg text-text-primary mb-6 text-left rtl:text-right">
                  {t("billingDetails")}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("firstName")}
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                  <Input
                    label={t("lastName")}
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mt-4">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: ali@example.com"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wider">
                        {t("phone")}
                      </label>
                      {phoneVerified && (
                        <span className="flex items-center gap-1 font-display font-bold text-[10px] text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                          {locale === "ar" ? "تم التحقق" : "Vérifié"}
                        </span>
                      )}
                    </div>
                    {phoneVerified ? (
                      <div className="flex items-center justify-between px-4 py-3 bg-green-50/50 border border-green-200 rounded-none">
                        <span className="font-mono text-sm font-semibold text-green-800">{formData.phone}</span>
                        <button
                          type="button"
                          onClick={() => setPhoneVerified(false)}
                          className="font-display font-semibold text-[10px] text-text-tertiary hover:text-text-secondary underline"
                        >
                          {locale === "ar" ? "تغيير" : "Modifier"}
                        </button>
                      </div>
                    ) : (
                      <PhoneVerification
                        currentPhone={formData.phone}
                        locale={locale}
                        onVerified={(verifiedPhone) => {
                          setFormData(prev => ({ ...prev, phone: verifiedPhone }));
                          setPhoneVerified(true);
                        }}
                      />
                    )}
                  </div>
                  <Input
                    label={t("postalCode")}
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Ex: 1000"
                  />
                </div>

                <div className="mt-4">
                  <Input
                    label={t("address")}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    placeholder="Numéro, rue, appartement..."
                  />
                </div>
                <div className="mt-4 flex flex-col gap-1.5 text-left rtl:text-right">
                  <label className="font-display font-semibold text-xs text-text-secondary uppercase tracking-wider">
                    {t("city")}
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 text-xs font-body border border-border-default rounded-none bg-surface-50 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-colors"
                  >
                    <option value="Tunis">Tunis</option>
                    <option value="Ariana">Ariana</option>
                    <option value="Ben Arous">Ben Arous</option>
                    <option value="Manouba">Manouba</option>
                    <option value="Nabeul">Nabeul</option>
                    <option value="Zaghouan">Zaghouan</option>
                    <option value="Bizerte">Bizerte</option>
                    <option value="Béja">Béja</option>
                    <option value="Jendouba">Jendouba</option>
                    <option value="Le Kef">Le Kef</option>
                    <option value="Siliana">Siliana</option>
                    <option value="Sousse">Sousse</option>
                    <option value="Monastir">Monastir</option>
                    <option value="Mahdia">Mahdia</option>
                    <option value="Sfax">Sfax</option>
                    <option value="Kairouan">Kairouan</option>
                    <option value="Kasserine">Kasserine</option>
                    <option value="Sidi Bouzid">Sidi Bouzid</option>
                    <option value="Gabès">Gabès</option>
                    <option value="Medenine">Medenine</option>
                    <option value="Tataouine">Tataouine</option>
                    <option value="Gafsa">Gafsa</option>
                    <option value="Tozeur">Tozeur</option>
                    <option value="Kebili">Kebili</option>
                  </select>
                </div>
              </Card>

              {/* Payment Gateways */}
              <Card className="p-6 md:p-8 bg-white border border-border-default rounded-none">
                <h3 className="font-display font-bold text-lg text-text-primary mb-6 text-left rtl:text-right">
                  {t("paymentMethod")}
                </h3>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      id: "cod",
                      label: t("cod"),
                      desc: "Paiement en espèces lors de la livraison",
                      badge: (
                        <span className="flex items-center gap-1 text-accent-500 font-display font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 bg-accent-500/10 rounded-none">
                          Cash
                        </span>
                      )
                    },
                    {
                      id: "flouci",
                      label: t("flouci"),
                      desc: "Portefeuille mobile instantané Flouci App",
                      badge: (
                        <span className="flex items-center gap-1.5 font-display text-[9px] text-text-primary font-bold px-2 py-0.5 bg-emerald-500/10 rounded-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm" />
                          Flouci
                        </span>
                      )
                    },
                    {
                      id: "konnect",
                      label: t("konnect"),
                      desc: "Paiement sécurisé par carte bancaire locale/internationale",
                      badge: (
                        <span className="flex items-center gap-1.5 font-display text-[9px] text-text-primary font-bold px-2 py-0.5 bg-blue-500/10 rounded-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-sm" />
                          Konnect
                        </span>
                      )
                    },
                    {
                      id: "d17",
                      label: t("d17"),
                      desc: "Transfert d'argent via l'application de la Poste Tunisienne",
                      badge: (
                        <span className="flex items-center gap-1.5 font-display text-[9px] text-text-primary font-bold px-2 py-0.5 bg-red-500/10 rounded-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-red-500 shadow-sm" />
                          D17
                        </span>
                      )
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`p-4 border rounded-none flex items-start gap-3 cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? "border-primary-500 bg-primary-500/5 shadow-sm"
                          : "border-border-default hover:border-border-hover"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleInputChange}
                        className="mt-1 text-primary-500 focus:ring-primary-500"
                      />
                      <div className="flex-1 text-left rtl:text-right flex items-start justify-between gap-4">
                        <div>
                          <span className="font-display font-semibold text-xs text-text-primary block">
                            {method.label}
                          </span>
                          <span className="font-body text-[10px] text-text-secondary mt-0.5 block leading-relaxed">
                            {method.desc}
                          </span>
                        </div>
                        <div className="flex-shrink-0 mt-0.5">
                          {method.badge}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </Card>
            </div>

            {/* Sidebar Summary */}
            <div className="flex flex-col gap-6">
              <Card className="p-6 md:p-8 bg-white border border-border-default rounded-none sticky top-28">
                <h3 className="font-display font-bold text-lg text-text-primary mb-6 text-left rtl:text-right">
                  {t("orderSummary")}
                </h3>
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pb-4 border-b border-border-default">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="relative w-12 h-12 bg-surface-100 rounded-none overflow-hidden flex-shrink-0 flex items-center justify-center border border-border-default">
                        <img
                          src={item.image || PRODUCT_PLACEHOLDER}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER;
                          }}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 text-left rtl:text-right">
                        <span className="font-display font-semibold text-xs text-text-primary block line-clamp-1">
                          {item.name}
                        </span>
                        <span className="font-body text-[10px] text-text-secondary block mt-0.5">
                          Qty: {item.quantity} {item.variant && `| ${item.variant.name}`}
                        </span>
                      </div>
                      <PriceDisplay price={item.price * item.quantity} size="sm" />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 mt-6">
                  <div className="flex justify-between font-body text-xs text-text-secondary">
                    <span>{cartT("subtotal")}</span>
                    <PriceDisplay price={subtotal} size="sm" />
                  </div>
                  <div className="flex justify-between font-body text-xs text-text-secondary">
                    <span>{cartT("shipping")}</span>
                    <span>{isFreeShipping ? (locale === "ar" ? "مجاني" : "Gratuit") : <PriceDisplay price={shippingCost} size="sm" />}</span>
                  </div>
                  <div className="flex justify-between font-display font-semibold text-sm text-text-primary border-t border-border-default pt-4 mt-2">
                    <span>{cartT("total")}</span>
                    <PriceDisplay price={total} size="md" />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6 rounded-none"
                  disabled={loading}
                >
                  {loading ? t("processing") : t("placeOrder")}
                </Button>
              </Card>
            </div>
          </Grid>
        </form>
      </Container>
    </Section>
  );
}
