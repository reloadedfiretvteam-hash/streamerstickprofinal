export type PublicPromotion = {
  headline: string;
  subheadline: string | null;
  ctaLabel: string;
  realProductId: string;
  productName: string | null;
  imageUrl: string | null;
  displayPriceDollars: number;
  shadowHeadline: string;
  shadowSubheadline: string | null;
  /** Changes when admin edits promo — new popup after dismiss. */
  version?: string;
};
