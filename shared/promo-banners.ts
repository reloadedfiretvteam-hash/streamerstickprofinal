/** Fixed promotional banners. Prices stay on these rows so the catalog price does not change. */
export type PromoBannerDefault = {
  id: string;
  realProductId: string;
  promoAmountCents: number;
  headline: string;
  subheadline: string;
  shadowHeadline: string;
  shadowSubheadline: string;
  stripeName: string;
  productName: string;
  productDescription: string;
  imageUrl: string;
};

const IPTV_IMAGE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/4k-live-iptv.jpg";
const DEVICE_IMAGE = "/images/google-hd-package.webp";

export const PROMO_BANNER_DEFAULTS: PromoBannerDefault[] = [
  {
    id: "promo-1yr-50",
    realProductId: "iptv-promo-1yr-1d",
    promoAmountCents: 5000,
    headline: "One year subscription sale",
    subheadline: "One year of live TV for 1 device you already own.",
    shadowHeadline: "Annual website care",
    shadowSubheadline: "One year of website care for one site.",
    stripeName: "Annual website care",
    productName: "1 Year Live TV Sale",
    productDescription: "One year of live TV for one device you already own. Promotional price.",
    imageUrl: IPTV_IMAGE,
  },
  {
    id: "promo-device-1yr-90",
    realProductId: "iptv-promo-device-1yr-1d",
    promoAmountCents: 9000,
    headline: "One year for your device",
    subheadline: "One year of live TV for one device.",
    shadowHeadline: "One-year website care",
    shadowSubheadline: "One year of care for one website.",
    stripeName: "One-year website care",
    productName: "1 Year Live TV for your device",
    productDescription: "One year of live TV tied to one device. Promotional price.",
    imageUrl: IPTV_IMAGE,
  },
  {
    id: "promo-google-200",
    realProductId: "promo-hardware-200",
    promoAmountCents: 20000,
    headline: "Google devices",
    subheadline: "Google device offer with setup help.",
    shadowHeadline: "Studio website package",
    shadowSubheadline: "A website design and build package.",
    stripeName: "Studio website package",
    productName: "Google devices",
    productDescription: "Google device offer with setup help. Promotional price.",
    imageUrl: DEVICE_IMAGE,
  },
];

export function promoBannerById(id: string): PromoBannerDefault | undefined {
  return PROMO_BANNER_DEFAULTS.find((banner) => banner.id === id);
}

/** These rows exist only so a banner can charge its own Stripe price. They stay out of the shop. */
export function isHiddenPromoProduct(product: { id?: string | null; category?: string | null }): boolean {
  const id = String(product.id || "");
  const category = String(product.category || "").toLowerCase();
  return category === "promotion" || id.startsWith("iptv-promo-") || id === "promo-hardware-200";
}
