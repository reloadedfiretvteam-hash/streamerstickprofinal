import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api";
import type { PublicPromotion } from "@/types/site-promotion";

let cachedPromos: PublicPromotion[] = [];
let cacheReady = false;
let inflight: Promise<PublicPromotion[]> | null = null;

function mapPromo(raw: any): PublicPromotion | null {
  if (!raw?.realProductId || !raw?.headline) return null;
  const dollars = Number(raw.displayPriceDollars);
  if (!Number.isFinite(dollars) || dollars <= 0) return null;
  return {
    id: String(raw.id || raw.realProductId),
    headline: String(raw.headline),
    subheadline: raw.subheadline != null ? String(raw.subheadline) : null,
    ctaLabel: String(raw.ctaLabel || "Get this offer"),
    realProductId: String(raw.realProductId),
    productName: raw.productName != null ? String(raw.productName) : null,
    imageUrl: raw.imageUrl != null ? String(raw.imageUrl) : null,
    displayPriceDollars: dollars,
    shadowHeadline: String(raw.shadowHeadline || raw.headline),
    shadowSubheadline: raw.shadowSubheadline != null ? String(raw.shadowSubheadline) : null,
    version: String(raw.version || `${raw.id}-${dollars}`),
  };
}

async function fetchSitePromotionsOnce(): Promise<PublicPromotion[]> {
  if (cacheReady) return cachedPromos;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      let res = await apiCall("/api/site-promotion-public");
      if (!res.ok) res = await apiCall("/api/promotion");
      if (!res.ok) return [];
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) return [];
      const json = await res.json();
      const rows = Array.isArray(json?.promotions)
        ? json.promotions
        : json?.promotion
          ? [json.promotion]
          : [];
      cachedPromos = rows.map(mapPromo).filter((row: PublicPromotion | null): row is PublicPromotion => Boolean(row));
      cacheReady = true;
      return cachedPromos;
    } catch {
      return [];
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function useSitePromotions(): PublicPromotion[] {
  const [promos, setPromos] = useState<PublicPromotion[]>(() => (cacheReady ? cachedPromos : []));

  useEffect(() => {
    let cancelled = false;
    fetchSitePromotionsOnce().then((rows) => {
      if (!cancelled) setPromos(rows);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return promos;
}

export function useSitePromotionPublic(): PublicPromotion | null {
  const promos = useSitePromotions();
  return promos[0] || null;
}
