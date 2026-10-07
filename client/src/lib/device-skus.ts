export const HD_ID = "android-onn-4k";
export const K4_ID = "android-onn-pro";
export const HD_SLUG = "onn-google-tv-hd";
export const K4_SLUG = "onn-google-tv-4k";

const ALIASES: Record<string, string> = {
  [HD_SLUG]: HD_ID,
  "onn-google-hd": HD_ID,
  [K4_SLUG]: K4_ID,
  "onn-google-4k": K4_ID,
};

export function resolveDeviceSku(input?: string | null) {
  const key = decodeURIComponent(String(input || ""))
    .trim()
    .replace(/^\/devices\//, "")
    .replace(/\/+$/, "");
  return ALIASES[key] || key;
}

export function publicDevicePath(sku: string) {
  const id = resolveDeviceSku(sku);
  if (id === HD_ID) return `/devices/${HD_SLUG}/`;
  if (id === K4_ID) return `/devices/${K4_SLUG}/`;
  return `/devices/${encodeURIComponent(id)}/`;
}
