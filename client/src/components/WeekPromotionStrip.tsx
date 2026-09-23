import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSitePromotions } from "@/hooks/useSitePromotionPublic";
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

function dollars(amount: number) {
  return `$${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}`;
}

function liveProductFor(promo: PublicPromotion, catalog: Product[]): Product {
  const found = catalog.find((product) => product.id === promo.realProductId);
  if (found) return found;
  return {
    id: promo.realProductId,
    name: promo.productName || promo.headline,
    price: promo.displayPriceDollars,
    image: promo.imageUrl || "",
    category: promo.realProductId === "promo-hardware-200" ? "firestick" : "iptv",
    description: promo.subheadline || promo.headline,
  };
}

export function WeekPromotionStrip(props: Props) {
  const promos = useSitePromotions();
  const visible = promos.filter((promo) => {
    if (props.variant !== "shadow") return true;
    const leak = /onn|iptv|fire stick|jailbreak|google tv|streaming device|reloaded fire/i;
    return !leak.test(`${promo.shadowHeadline} ${promo.shadowSubheadline || ""}`);
  });
  if (!visible.length) return null;

  return (
    <div className={props.variant === "shadow" ? "container mx-auto px-4 pt-8" : "mx-auto max-w-6xl px-4"}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((promo) => {
          const headline = props.variant === "shadow" ? promo.shadowHeadline : promo.headline;
          const sub = props.variant === "shadow" ? promo.shadowSubheadline : promo.subheadline;
          return (
            <article
              key={promo.id}
              className="rounded-2xl border border-blue-200 bg-white p-5 text-slate-900 shadow-sm"
              data-testid={`promo-banner-${promo.id}`}
            >
              <div className="flex items-center gap-2 text-blue-700">
                <Tag className="h-4 w-4" aria-hidden />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">Promotion</p>
              </div>
              <h3 className="mt-3 text-xl font-semibold leading-snug">{headline}</h3>
              {sub ? <p className="mt-2 text-sm text-slate-600">{sub}</p> : null}
              <p className="mt-4 text-3xl font-semibold text-blue-700">{dollars(promo.displayPriceDollars)}</p>
              <Button
                type="button"
                className="mt-4 w-full bg-blue-700 font-semibold text-white hover:bg-blue-600"
                onClick={() => {
                  if (props.variant === "shadow") {
                    props.onClaim(promo);
                    return;
                  }
                  props.onClaim(promo, liveProductFor(promo, props.catalogProducts));
                }}
              >
                {promo.ctaLabel}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
