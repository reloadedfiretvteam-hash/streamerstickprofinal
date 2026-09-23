import type { Product } from "@/lib/store";
import type { PublicPromotion } from "@/types/site-promotion";

export type { PublicPromotion };

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

/** The on-page promotional banners replace the old popup. */
export function SitePromotionBanner(_props: Props) {
  return null;
}
