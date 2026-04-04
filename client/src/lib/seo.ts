/**
 * SEO package: single source of truth for title (50–60 chars), meta description (50–160 chars),
 * canonical/og/twitter. Use setPageMeta() on every page so GSC has no "too long" / "too short" / missing-tag issues.
 */

export const SITE_URL = 'https://streamstickpro.com';

/** Product offer / ItemList URLs — always point at shop + fragment (matches live PDP cards). */
export function shopProductUrl(productId: string): string {
  const id = String(productId || '').trim();
  if (!id) return `${SITE_URL}/shop`;
  return `${SITE_URL}/shop#${encodeURIComponent(id)}`;
}

const META_DESC_MAX = 160;
const META_DESC_MIN = 50;
const TITLE_MAX = 60;

/**
 * Truncate meta description to 50–160 chars. If too short, optionally append brand.
 */
export function truncateMetaDescription(
  text: string | null | undefined,
  options?: { max?: number; min?: number; appendBrand?: string }
): string {
  const max = options?.max ?? META_DESC_MAX;
  const min = options?.min ?? META_DESC_MIN;
  const appendBrand = options?.appendBrand;
  let s = (text || '').trim();
  if (s.length > max) s = s.slice(0, max - 3).trim() + '...';
  if (s.length < min && appendBrand) {
    const extra = ` ${appendBrand}`.slice(0, max - s.length);
    if (extra.length > 0) s = (s + extra).slice(0, max);
  }
  return s || 'StreamStickPro – Reloaded Fire TV, Fire Sticks, 18K+ channels. USA, Canada, UK.';
}

/**
 * Truncate page title to ~60 chars (Google typically shows ~50–60). Pass suffix '' for title-only (e.g. og:title).
 */
export function truncateTitle(title: string | null | undefined, suffix = ' | StreamStick Pro'): string {
  const t = (title || 'StreamStickPro').trim();
  const full = suffix ? t + suffix : t;
  if (full.length <= TITLE_MAX) return full;
  return full.slice(0, TITLE_MAX - 3).trim() + '...';
}

function setMeta(name: string, content: string, isProperty = false): void {
  if (typeof document === 'undefined' || !content) return;
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Set document title + meta description + og + twitter in one call. All lengths enforced (title ≤60, description 50–160).
 * Call this in useEffect on every page. Canonical/og:url are set by CanonicalTag when path matches; pass path here for og:url override.
 */
export function setPageMeta(options: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  /** Optional comma-separated keywords (some engines still read this). */
  keywords?: string;
}): void {
  if (typeof document === 'undefined') return;
  const { title, description, path, noindex, ogImage, type = 'website', publishedTime, modifiedTime, keywords } = options;
  const fullTitle = title.includes('|') ? truncateTitle(title, '') : truncateTitle(title, ' | StreamStick Pro');
  const safeDesc = truncateMetaDescription(description);
  document.title = fullTitle;
  setMeta('description', safeDesc);
  if (keywords) setMeta('keywords', keywords);
  else document.querySelector('meta[name="keywords"]')?.remove();
  const url = path ? `${SITE_URL}${path.startsWith('/') ? path : '/' + path}` : SITE_URL + (window.location.pathname || '/');
  setMeta('og:title', fullTitle, true);
  setMeta('og:description', safeDesc, true);
  setMeta('og:url', url, true);
  setMeta('og:type', type, true);
  setMeta('og:site_name', 'StreamStickPro', true);
  const ogImg = ogImage || `${SITE_URL}/opengraph.jpg`;
  setMeta('og:image', ogImg, true);
  setMeta('og:image:alt', 'StreamStickPro — Reloaded Fire TV, Fire Stick, 18K+ channels', true);
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', fullTitle);
  setMeta('twitter:description', safeDesc);
  setMeta('twitter:image', ogImg);
  setMeta('twitter:image:alt', 'StreamStickPro — Reloaded Fire TV, Fire Stick, 18K+ channels');
  if (publishedTime) setMeta('article:published_time', publishedTime, true);
  if (modifiedTime) setMeta('article:modified_time', modifiedTime, true);
  let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
  if (noindex) {
    if (!robots) { robots = document.createElement('meta'); robots.setAttribute('name', 'robots'); document.head.appendChild(robots); }
    robots.content = 'noindex, nofollow';
  } else if (!robots) {
    robots = document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
    document.head.appendChild(robots);
  } else if (!robots.content || robots.content === 'noindex, nofollow') {
    robots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  }
}
