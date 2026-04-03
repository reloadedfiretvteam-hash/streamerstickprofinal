/** Surfshark affiliate — set `VITE_SURFSHARK_AFFILIATE_URL` in Cloudflare Pages / .env (full https URL). */
export function getSurfsharkAffiliateUrl(): string {
  const raw = import.meta.env.VITE_SURFSHARK_AFFILIATE_URL as string | undefined;
  if (raw && /^https?:\/\//i.test(raw.trim())) return raw.trim();
  return "https://surfshark.com/";
}
