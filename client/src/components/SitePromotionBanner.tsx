import { useState, useCallback } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/store";
import type { PublicPromotion } from "@/types/site-promotion";
import { useSitePromotionPublic } from "@/hooks/useSitePromotionPublic";

export type { PublicPromotion };

const DISMISS_KEY = "ssp-promo-popup-dismissed";

type Props =
  | {
      variant: "live";
      catalogProducts: Product[];
      onClaim: (promo: PublicPromotion, productForCart: Product) => void;
    }
  | {
      variant: "shadow";
      onClaim: (promo: PublicPromotion) => void;
    };

export function SitePromotionBanner(props: Props) {
  const promo = useSitePromotionPublic();
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(() =>
    typeof window !== "undefined" ? window.sessionStorage.getItem(DISMISS_KEY) : null
  );

  const dismiss = useCallback(() => {
    if (!promo?.version) return;
    try {
      window.sessionStorage.setItem(DISMISS_KEY, promo.version);
    } catch {
      /* ignore */
    }
    setDismissedVersion(promo.version);
  }, [promo?.version]);

  if (!promo) return null;
  if (dismissedVersion === promo.version) return null;

  const headline = props.variant === "shadow" ? promo.shadowHeadline : promo.headline;
  const sub = props.variant === "shadow" ? promo.shadowSubheadline : promo.subheadline;

  const liveProduct = props.variant === "live" ? props.catalogProducts.find((p) => p.id === promo.realProductId) : undefined;

  const handleClick = () => {
    if (props.variant === "live") {
      if (!liveProduct) return;
      props.onClaim(promo, liveProduct);
      return;
    }
    props.onClaim(promo);
  };

  const disabledLive = props.variant === "live" && !liveProduct;

  const img =
    props.variant === "live" && liveProduct?.image
      ? liveProduct.image
      : promo.imageUrl || undefined;

  const panelClass =
    props.variant === "live"
      ? "border border-orange-500/50 bg-gradient-to-br from-orange-950/95 via-gray-950/98 to-red-950/90 shadow-[0_0_40px_rgba(234,88,12,0.25)]"
      : "border border-primary/40 bg-background/95 shadow-xl";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 pb-6 sm:items-center sm:pb-4 pointer-events-none"
      aria-live="polite"
    >
      <div
        className={`pointer-events-auto w-full max-w-lg rounded-2xl p-4 md:p-5 animate-in fade-in zoom-in-95 duration-200 ${panelClass}`}
        role="dialog"
        aria-label="Limited time offer"
      >
        <div className="flex justify-end mb-1">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-1.5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Dismiss offer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 -mt-2">
          {img ? (
            <img
              src={img}
              alt=""
              className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg border border-white/10 shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-full sm:w-24 h-24 rounded-lg bg-orange-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-10 h-10 text-orange-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-300/90 mb-1">Limited offer</p>
            <h2 className="text-lg md:text-xl font-bold text-white leading-snug">{headline}</h2>
            {sub ? <p className="text-sm text-gray-300 mt-1">{sub}</p> : null}
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200 mt-2">
              ${promo.displayPriceDollars.toFixed(2)}
            </p>
          </div>
          <div className="shrink-0 flex flex-col justify-center gap-2">
            <Button
              type="button"
              onClick={handleClick}
              disabled={Boolean(disabledLive)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-bold px-6"
            >
              {promo.ctaLabel}
            </Button>
            {disabledLive ? (
              <p className="text-[11px] text-gray-400 max-w-[200px]">Loading product… refresh if this stays disabled.</p>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="text-xs text-gray-500 hover:text-gray-300 underline underline-offset-2"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
