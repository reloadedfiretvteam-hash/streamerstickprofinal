export const HD_ID = "android-onn-4k";
export const K4_ID = "android-onn-pro";
export const HD_IMG = "/images/google-hd-package.webp";
export const K4_IMG = "/images/google-4k-package.webp";
export const IPTV_IMG =
  "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges/iptv-subscription.jpg";

const ART: Record<string, string> = {
  "android-onn-4k": HD_IMG,
  "onn-google-hd": HD_IMG,
  "onn-google-tv-hd": HD_IMG,
  "android-onn-pro": K4_IMG,
  "onn-google-4k": K4_IMG,
  "onn-google-tv-4k": K4_IMG,
};

export function packageImage(id?: string | null, fallback?: string | null) {
  const key = String(id || "");
  if (ART[key]) return ART[key];
  if (fallback) return fallback;
  if (key.startsWith("iptv-")) return IPTV_IMG;
  return HD_IMG;
}

export function dollarsFromCatalog(price: unknown) {
  const n = Number(price || 0);
  return n >= 1000 ? n / 100 : n;
}
