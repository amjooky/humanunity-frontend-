"use client";

import * as React from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Grid } from "@/components/layout/Grid";
import { Button } from "@/components/ui/Button";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ProductCard } from "@/components/commerce/ProductCard";
import { ReviewsSection } from "@/components/commerce/ReviewsSection";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { notFound, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { PRODUCT_PLACEHOLDER } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export default function ProductDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("Product");
  const { products, fetchStoreData, isLoading } = useProductStore();
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore();

  const [isMounted, setIsMounted] = React.useState(false);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    fetchStoreData().then(() => setDataLoaded(true));
  }, [fetchStoreData]);

  const slug = params.slug as string;
  const product = React.useMemo(() => {
    return products.find((p) => decodeURIComponent(p.slug) === decodeURIComponent(slug));
  }, [products, slug]);

  const [quantity, setQuantity] = React.useState(1);
  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<"details" | "reviews">("details");
  const [activeImgIndex, setActiveImgIndex] = React.useState(0);

  React.useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0] || null);
      setActiveImgIndex(0);
    }
  }, [product]);

  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);
  const addToast = useUIStore((s) => s.addToast);
  const wishlisted = isMounted && product ? isWishlisted(product.id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    const finalPrice = product.price + (selectedVariant?.priceModifier || 0);
    addItem({
      id: selectedVariant ? `${product.id}_${selectedVariant.id}` : `${product.id}_def`,
      productId: product.id,
      name: product.name,
      image: product.mainImage,
      price: finalPrice,
      maxQuantity: selectedVariant?.stockQuantity || product.stockQuantity || 99,
      variant: selectedVariant ? { name: selectedVariant.name, optionType: selectedVariant.optionType } : undefined,
      quantity,
    });
    addToast({ type: "success", title: locale === "ar" ? "تمت الإضافة" : "Ajouté au panier", message: `${product.name} (${quantity}) ajouté.` });
    setCartOpen(true);
  };

  const handleWishlist = () => {
    if (!product) return;
    toggleWishlist(product.id);
    addToast({ type: wishlisted ? "info" : "success", title: wishlisted ? "Retiré" : "Ajouté ❤️", message: product.name });
  };

  if (!isMounted || !dataLoaded || isLoading) {
    return (
      <Section padding="lg" background="white" className="flex-1 min-h-[70vh] flex items-center justify-center">
        <Container className="text-center">
          <div className="w-10 h-10 border-4 border-black border-t-transparent mx-auto mb-4 animate-spin" />
          <p className="font-display text-sm text-text-secondary">Chargement du produit...</p>
        </Container>
      </Section>
    );
  }

  if (!product) notFound();

  const activePrice = product.price + (selectedVariant?.priceModifier || 0);
  const originalPrice = product.comparePrice ? product.comparePrice + (selectedVariant?.priceModifier || 0) : undefined;
  const recommendations = products.filter((p) => p.id !== product.id && p.category.slug === product.category.slug).slice(0, 4);

  return (
    <Section padding="lg" background="cream" className="flex-1">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-body text-text-tertiary mb-8">
          <Link href="/" className="hover:text-primary-500 transition-colors">
            {locale === "ar" ? "الرئيسية" : locale === "en" ? "Home" : "Accueil"}
          </Link>
          <span>/</span>
          <Link href={`/discover?category=${product.category.slug}`} className="hover:text-primary-500 transition-colors capitalize">
            {locale === "ar" ? (product.category.nameAr || product.category.name) : locale === "en" ? (product.category.nameEn || product.category.name) : product.category.name}
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* Main Layout */}
        <Grid cols={1} colsMd={2} gap="lg" className="items-start mb-16">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            {/* Main Image */}
            <div className="group relative aspect-square w-full rounded-3xl overflow-hidden border border-border-default shadow-card bg-surface-200">
              {(() => {
                // Build image list: mainImage + up to 4 more from images[]
                const allImgs = [
                  product.mainImage,
                  ...((product.images || []).map((img) => img.url).filter((u) => u && u !== product.mainImage)).slice(0, 4),
                ];
                const src = allImgs[activeImgIndex] || PRODUCT_PLACEHOLDER;
                return (
                  <img
                    src={src}
                    alt={product.name}
                    onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }}
                    className="object-cover w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                );
              })()}
              {/* Badges overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                {product.tags?.includes("Nouveau") && (
                  <span className="font-display font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 bg-black text-white">New</span>
                )}
                {product.tags?.includes("Best Seller") && (
                  <span className="font-display font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 border border-black text-black bg-white">Best</span>
                )}
              </div>
            </div>
            {/* Thumbnails */}
            {(() => {
              const allImgs = [
                product.mainImage,
                ...((product.images || []).map((img) => img.url).filter((u) => u && u !== product.mainImage)).slice(0, 4),
              ];
              if (allImgs.length <= 1) return null;
              return (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {allImgs.map((src, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImgIndex === idx ? "border-primary-500 shadow-md" : "border-border-default hover:border-primary-300"
                      }`}
                    >
                      <img src={src} alt={`${product.name} ${idx + 1}`} className="object-cover w-full h-full" onError={(e) => { (e.target as HTMLImageElement).src = PRODUCT_PLACEHOLDER; }} />
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5 text-left rtl:text-right">
            {/* Brand + Name */}
            <div>
              <span className="font-body text-[10px] text-text-tertiary uppercase tracking-widest font-bold block mb-1">{product.brand}</span>
              <h1 className="font-display font-black text-3xl md:text-4xl text-text-primary tracking-tight leading-tight">{product.name}</h1>
              {/* Stars */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-[#D4A84F]" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <span className="font-body text-xs text-text-secondary">({product.reviewCount || 10} {t("reviews")})</span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-neutral-200" />

            {/* Price */}
            <div>
              <PriceDisplay price={activePrice} originalPrice={originalPrice} size="xl" />
            </div>

            {/* Description */}
            <p className="font-body text-sm text-text-secondary leading-relaxed">{product.description}</p>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="font-display font-bold text-[10px] uppercase tracking-widest text-text-tertiary">Formats / Options</span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 border font-display font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer ${
                        selectedVariant?.id === v.id
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-neutral-200 hover:border-black"
                      }`}
                    >
                      {v.name}{v.priceModifier > 0 && ` (+${v.priceModifier} TND)`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex flex-col gap-3 pt-4 border-t border-border-default">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="font-display font-bold text-[10px] uppercase tracking-widest text-text-tertiary">{t("quantity")}</span>
                  <QuantitySelector quantity={quantity} onChange={setQuantity} />
                </div>
                <div className="flex-1 flex items-end">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-4 bg-black text-white font-display font-bold text-[10px] uppercase tracking-[0.15em] transition-all duration-200 hover:bg-neutral-800 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 active:scale-[0.97]"
                  >
                    <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2">
                      <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    {t("addToCart")}
                  </button>
                </div>
              </div>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className={`w-full py-3 rounded-full border font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  wishlisted ? "bg-red-50 border-red-200 text-red-500" : "border-border-default text-text-secondary hover:border-red-200 hover:text-red-400 hover:bg-red-50"
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlisted ? (locale === "ar" ? "إزالة من المفضلة" : "Retiré des souhaits") : (locale === "ar" ? "أضف للمفضلة" : "Ajouter aux souhaits")}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {[
                { label: locale === "ar" ? "توصيل سريع" : "Livraison rapide", path: "M5 12H3l1-7h16l1 7h-2M5 12v7a1 1 0 001 1h12a1 1 0 001-1v-7M5 12h14" },
                { label: locale === "ar" ? "جودة مضمونة" : "Qualité garantie", path: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
                { label: locale === "ar" ? "دفع آمن" : "Paiement sécurisé", path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-1.5 p-3 border border-neutral-200 bg-neutral-50">
                  <svg className="w-4 h-4 fill-none stroke-black" viewBox="0 0 24 24" strokeWidth="1.5"><path d={b.path} /></svg>
                  <span className="font-display font-bold text-[9px] uppercase tracking-wide text-black">{b.label}</span>
                </div>
              ))}
            </div>

            {/* Metadata */}
            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <div className="p-5 border border-neutral-200 bg-neutral-50">
                <h4 className="font-display font-bold text-[10px] uppercase tracking-widest text-black mb-3">
                  {locale === "ar" ? "التفاصيل والمواصفات" : locale === "en" ? "Details & Specifications" : "Détails & Spécifications"}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.metadata).map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <span className="font-display font-semibold text-[9px] uppercase tracking-wider text-text-tertiary">{key}</span>
                      <span className="font-body text-xs text-text-primary mt-0.5">{val as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Grid>

        {/* Tabs: Details / Reviews */}
        <div className="border-t border-border-default">
          <div className="flex gap-0 border-b border-neutral-200 mb-10">
            {(["details", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-display font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer border-b-2 -mb-px ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-neutral-400 hover:text-black"
                }`}
              >
                {tab === "details" ? (locale === "ar" ? "التفاصيل" : "Détails") : (locale === "ar" ? "التقييمات" : "Avis")}
              </button>
            ))}
          </div>

          {activeTab === "reviews" && <ReviewsSection productId={product.id} productName={product.name} />}
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="border-t border-border-default pt-16 mt-8">
            <div className="flex flex-col items-center text-center gap-3 mb-12">
              <span className="font-display font-bold text-[10px] uppercase tracking-widest text-primary-500">{locale === "ar" ? "قد يعجبك أيضاً" : "Vous aimerez aussi"}</span>
              <h2 className="font-display font-black text-2xl md:text-3xl text-text-primary">{t("relatedProducts")}</h2>
            </div>
            <Grid cols={1} colsSm={2} colsLg={4} gap="md">
              {recommendations.map((prod) => <ProductCard key={prod.id} product={prod} />)}
            </Grid>
          </div>
        )}
      </Container>
    </Section>
  );
}
