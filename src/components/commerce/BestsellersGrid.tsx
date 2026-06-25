"use client";

import * as React from "react";
import { Grid } from "@/components/layout/Grid";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useProductStore } from "@/stores/productStore";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

export function BestsellersGrid() {
  const { products, fetchStoreData } = useProductStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    fetchStoreData();
  }, [fetchStoreData]);

  const bestsellers = React.useMemo(() => {
    // Show active products marked as bestseller
    const filtered = products.filter((p) => p.badge === "bestseller" && p.isActive);
    // If none are specifically marked, default to showing the first 4 active products
    return filtered.length > 0 ? filtered.slice(0, 8) : products.filter(p => p.isActive).slice(0, 4);
  }, [products]);

  if (!isMounted) {
    return (
      <Grid cols={1} colsSm={2} colsLg={4} gap="md">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="aspect-[4/5] rounded-3xl bg-surface-100 animate-pulse border border-border-default" />
        ))}
      </Grid>
    );
  }

  return (
    <Grid cols={1} colsSm={2} colsLg={4} gap="md">
      {bestsellers.map((prod, idx) => (
        <AnimatedSection key={prod.id} direction="up" delay={idx * 0.1}>
          <ProductCard product={prod} />
        </AnimatedSection>
      ))}
    </Grid>
  );
}
