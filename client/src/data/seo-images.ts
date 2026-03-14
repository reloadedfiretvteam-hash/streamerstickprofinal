/**
 * SEO image config with variety: each slot uses a different image from the group
 * so we don't repeat the same image too often.
 * - Your 12 images: copy to client/public/images/ (see public/images/README.md).
 * - Supabase images: already in imiges bucket.
 */

const BASE = "/images";
const SUPABASE = "https://emlqlmfzqsnqokrqvmcm.supabase.co/storage/v1/object/public/imiges";

export const SITE_URL = "https://streamstickpro.com";
/** Use for og:image / twitter:image so shared links get absolute URL. */
export function fullImageUrl(src: string): string {
  return src.startsWith("http") ? src : SITE_URL + (src.startsWith("/") ? src : "/" + src);
}

type ImageDef = { src: string; alt: string };

/** Single images (for one-off use) */
export const SEO_IMAGES: Record<string, ImageDef> = {
  jailbrokenChain: { src: `${BASE}/jailbroken-fire-stick-chain.png`, alt: "Jailbroken Amazon Fire TV Stick with remote – StreamStickPro IPTV setup and streaming guidance" },
  firestickApk: { src: `${BASE}/firestick-apk-setup.png`, alt: "Amazon Fire Stick with APK setup for IPTV and jailbroken streaming – StreamStickPro" },
  firestickOriginal: { src: `${BASE}/fire-tv-stick-original-budget.png`, alt: "Jailbroken Fire TV Stick Original budget-friendly with Kodi and streaming apps – StreamStickPro" },
  firestick4k: { src: `${BASE}/fire-tv-stick-4k-jailbroken.png`, alt: "Jailbroken Fire TV Stick 4K with Kodi, Cyberflix, Netflix – StreamStickPro" },
  firestick4kMax: { src: `${BASE}/fire-tv-stick-4k-max-jailbroken.png`, alt: "Most popular jailbroken Fire TV Stick 4K Max for IPTV – StreamStickPro" },
  jailbrokenFreedom: { src: `${BASE}/jailbroken-fire-stick-freedom.png`, alt: "Jailbroken Fire Stick breaking free – StreamStickPro streaming freedom" },
  iptvSmartersCatalog: { src: `${BASE}/iptv-smarters-catalog.png`, alt: "IPTV Smarters app showing 60,000+ channels and movies – StreamStickPro catalog" },
  bestUsaIptv: { src: `${BASE}/best-usa-iptv-services.png`, alt: "Best USA IPTV services – StreamStickPro live TV and streaming" },
  smartersVsTivimate: { src: `${BASE}/iptv-smarters-vs-tivimate.png`, alt: "IPTV Smarters Pro vs TiviMate app comparison for StreamStickPro IPTV" },
  iptvAmerica: { src: `${BASE}/iptv-america-canada-uk.png`, alt: "StreamStickPro IPTV for USA, Canada, and UK – live streaming" },
  onnGoogleTvBox: { src: `${BASE}/onn-4k-google-tv-box.png`, alt: "Onn 4K Streaming Device with Google TV – StreamStickPro IPTV setup" },
  onn4kUltraHd: { src: `${BASE}/onn-4k-ultra-hd-android-tv.png`, alt: "Onn 4K Ultra HD Android TV certified device – StreamStickPro" },
};

/** Pool of jailbreak/Fire Stick images – use different one per section (no repeat) */
export const JAILBREAK_IMAGES: ImageDef[] = [
  SEO_IMAGES.jailbrokenChain,
  SEO_IMAGES.jailbrokenFreedom,
  SEO_IMAGES.firestick4kMax,
  SEO_IMAGES.firestickOriginal,
  SEO_IMAGES.firestickApk,
  SEO_IMAGES.firestick4k,
  { src: `${SUPABASE}/OIP_(11)99_1764978938773.jpg`, alt: "Fire Stick HD for IPTV – StreamStickPro" },
  { src: `${SUPABASE}/71+Pvh7WB6L._AC_SL1500__1764978938770.jpg`, alt: "Fire Stick 4K streaming device – StreamStickPro" },
  { src: `${SUPABASE}/71E1te69hZL._AC_SL1500__1764978938773.jpg`, alt: "Fire Stick 4K Max – StreamStickPro" },
];

/** Pool of IPTV / live TV images */
export const IPTV_IMAGES: ImageDef[] = [
  SEO_IMAGES.bestUsaIptv,
  SEO_IMAGES.iptvAmerica,
  SEO_IMAGES.iptvSmartersCatalog,
  { src: `${SUPABASE}/iptv-subscription.jpg`, alt: "IPTV subscription live TV – StreamStickPro" },
  // Add more: /images/iptv-channels-hero.png, /images/live-tv-streaming.png (see docs)
];

/** Pool of Onn / Google TV images */
export const ONN_IMAGES: ImageDef[] = [
  SEO_IMAGES.onnGoogleTvBox,
  SEO_IMAGES.onn4kUltraHd,
  { src: `${SUPABASE}/s-l1600onnbok_1766008738774.webp`, alt: "Onn 4K Google TV streaming device – StreamStickPro" },
  { src: `${SUPABASE}/OIPonnbox4k_1766008832103.webp`, alt: "Onn 4K Pro Android TV – StreamStickPro" },
];

/** Pool for IPTV Smarters / TiviMate app pages */
export const APP_IMAGES: ImageDef[] = [
  SEO_IMAGES.iptvSmartersCatalog,
  SEO_IMAGES.smartersVsTivimate,
  { src: `${SUPABASE}/iptv-subscription.jpg`, alt: "IPTV app setup – StreamStickPro" },
];

/** Hero / homepage variety (one per section) */
export const HERO_AND_DEVICE_IMAGES: ImageDef[] = [
  { src: `${SUPABASE}/hero-firestick-breakout.jpg`, alt: "StreamStickPro Fire Stick and IPTV – 36hr free trial" },
  SEO_IMAGES.iptvAmerica,
  SEO_IMAGES.jailbrokenChain,
  { src: `${SUPABASE}/stock_images/amazon_fire_tv_stick_cc445778.jpg`, alt: "Amazon Fire TV Stick for IPTV – StreamStickPro" },
];

/** Pick one image from the group so each section gets a different one (sectionIndex = 0, 1, 2, …). */
export function getImageForSlot<T extends ImageDef>(group: T[], sectionIndex: number): T {
  return group[sectionIndex % group.length];
}

/** Location pages: one image per page_type so we don’t reuse the same on every city. */
export const LOCATION_PAGE_IMAGES: Record<string, ImageDef> = {
  iptv: SEO_IMAGES.bestUsaIptv,
  jailbreak: SEO_IMAGES.jailbrokenChain,
  google: SEO_IMAGES.onnGoogleTvBox,
  unlocked: SEO_IMAGES.jailbrokenChain,
  onn: SEO_IMAGES.onnGoogleTvBox,
};
