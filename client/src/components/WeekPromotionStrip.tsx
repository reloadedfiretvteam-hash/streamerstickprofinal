import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSitePromotionPublic } from "@/hooks/useSitePromotionPublic";
import type { PublicPromotion } from "@/types/site-promotion";
import type { Product } from "@/lib/store";

type Props =
  | {
      variant: "live";
      catalogProducts: Product[];
      onClaim: (promo: PublicPromotion, product: Product) => void;
    }
  | {
      variant: "shadow";
      onClaim: (promo: PublicPromotion) => void;
    };

export function WeekPromotionStrip(props: Props) {
  const promo = useSitePromotionPublic();
  if (!promo) return null;

  if (props.variant === "shadow") {
    const headline = promo.shadowHeadline;
    const sub = promo.shadowSubheadline;
    const img = promo.imageUrl || undefined;
    return (
      <div className="container mx-auto px-4 pt-6">
        <div
          className="max-w-4xl mx-auto rounded-2xl border border-primary/35 bg-card/95 p-4 sm:p-5 shadow-lg"
          data-testid="week-promotion-strip-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 text-primary shrink-0">
              <Tag className="w-5 h-5" aria-hidden />
              <span className="text-xs font-black uppercase tracking-widest">This Week&apos;s Promotion</span>
            </div>
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {img ? (
                <img
                  src={img}
                  alt=""
                  className="w-full sm:w-20 h-36 sm:h-20 object-cover rounded-xl border border-border shrink-0"
                  loading="lazy"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">{headline}</h3>
                {sub ? <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sub}</p> : null}
                <p className="text-2xl font-black text-primary mt-1">${promo.displayPriceDollars.toFixed(2)}</p>
              </div>
              <Button
                type="button"
                className="w-full sm:w-auto shrink-0 font-bold px-6"
                onClick={() => props.onClaim(promo)}
              >
                {promo.ctaLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const liveProduct = props.catalogProducts.find((p) => p.id === promo.realProductId);
  const img =
    liveProduct?.image && liveProduct.image.trim() !== ""
      ? liveProduct.image
      : promo.imageUrl || undefined;
  const disabled = !liveProduct;

  return (
    <div
      className="max-w-4xl mx-auto mb-8 rounded-2xl border border-orange-500/45 bg-gradient-to-r from-orange-950/90 via-gray-950/95 to-red-950/85 p-4 sm:p-5 shadow-[0_0_32px_rgba(234,88,12,0.2)]"
      data-testid="week-promotion-strip"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2 text-orange-200/95 shrink-0">
          <Tag className="w-5 h-5" aria-hidden />
          <span className="text-xs font-black uppercase tracking-widest">This Week&apos;s Promotion</span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          {img ? (
            <img
              src={img}
              alt=""
              className="w-full sm:w-20 h-36 sm:h-20 object-cover rounded-xl border border-white/10 shrink-0"
              loading="lazy"
            />
          ) : null}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">{promo.headline}</h3>
            {promo.subheadline ? (
              <p className="text-sm text-gray-300 mt-1 line-clamp-2">{promo.subheadline}</p>
            ) : null}
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-200 mt-1">
              ${promo.displayPriceDollars.toFixed(2)}
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2 sm:items-end">
            <Button
              type="button"
              onClick={() => {
                if (!liveProduct) return;
                props.onClaim(promo, liveProduct);
              }}
              disabled={disabled}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 font-bold px-6"
            >
              {promo.ctaLabel}
            </Button>
            {disabled ? (
              <p className="text-[11px] text-gray-400 sm:text-right max-w-[220px]">
                This offer is tied to a catalog SKU that isn&apos;t on this page yet—check the homepage or refresh.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
