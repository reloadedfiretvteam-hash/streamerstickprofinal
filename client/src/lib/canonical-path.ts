/**
 * Client-side canonical path — keep in sync with worker `canonicalizePath` + `LEGACY_CANONICAL_MAP`
 * so SPA canonical/hreflang matches what Cloudflare injects for crawlers.
 */
const LEGACY_CANONICAL: Record<string, string> = {
  "/homepage": "/",
  "/faq": "/",
  "/iptv-services": "/iptv",
  "/firestick-devices": "/devices",
  "/live-tv": "/iptv",
  "/streaming": "/iptv",
  "/tutorial": "/setup",
  "/tutorials": "/setup",
  "/setup-firestick": "/setup",
  "/setup-onn": "/setup",
  "/trial": "/36hr-trial",
  "/free-trial": "/36hr-trial",
};

export function canonicalPathForClient(pathname: string): string {
  const raw = pathname.split("?")[0].split("#")[0];
  const trimmed = raw.replace(/\/+$/, "") || "/";
  const mapped = LEGACY_CANONICAL[trimmed] ?? trimmed;
  if (mapped === "/") return "/";
  if (/^\/blog(?:\/[a-z0-9][a-z0-9\-]*)?\/?$/i.test(mapped)) {
    return mapped.endsWith("/") ? mapped : `${mapped}/`;
  }
  return mapped.replace(/\/+$/, "") || "/";
}

export function absoluteCanonicalUrl(pathname: string, site = "https://streamstickpro.com"): string {
  const p = canonicalPathForClient(pathname);
  return p === "/" ? `${site}/` : `${site}${p}`;
}
