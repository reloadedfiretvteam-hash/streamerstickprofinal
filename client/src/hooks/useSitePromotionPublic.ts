import { useEffect, useState } from "react";
import { apiCall } from "@/lib/api";
import type { PublicPromotion } from "@/types/site-promotion";

let cachedPromo: PublicPromotion | null = null;
let cacheReady = false;
let inflight: Promise<PublicPromotion | null> | null = null;

async function fetchSitePromotionOnce(): Promise<PublicPromotion | null> {
  if (cacheReady) return cachedPromo;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      let res = await apiCall("/api/site-promotion-public");
      if (!res.ok) res = await apiCall("/api/promotion");
      if (!res.ok) {
        return null;
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        return null;
      }
      const json = await res.json();
      cacheReady = true;
      if (json?.promotion) {
        const p = json.promotion;
        cachedPromo = {
          ...p,
          version:
            p.version ??
            `${p.realProductId}-${p.displayPriceDollars}-${String(p.headline || "").slice(0, 24)}`,
        };
      } else {
        cachedPromo = null;
      }
      return cachedPromo;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

export function useSitePromotionPublic(): PublicPromotion | null {
  const [promo, setPromo] = useState<PublicPromotion | null>(() => (cacheReady ? cachedPromo : null));

  useEffect(() => {
    let cancelled = false;
    fetchSitePromotionOnce().then((p) => {
      if (!cancelled) setPromo(p);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return promo;
}
