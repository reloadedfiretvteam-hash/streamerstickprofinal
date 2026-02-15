/**
 * SEO helpers: meta description length (50–160 chars for Google), title length (50–60).
 * Use everywhere we set document title or meta description to avoid GSC "too long" / "too short" warnings.
 */

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
  return s || 'StreamStickPro – IPTV, Fire Sticks, 18K+ channels. USA, Canada, UK.';
}

/**
 * Truncate page title to ~60 chars (Google typically shows ~50–60).
 */
export function truncateTitle(title: string | null | undefined, suffix = ' | StreamStick Pro'): string {
  const t = (title || 'StreamStickPro').trim();
  const full = t + suffix;
  if (full.length <= TITLE_MAX) return full;
  return full.slice(0, TITLE_MAX - 3).trim() + '...';
}
