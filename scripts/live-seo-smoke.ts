/**
 * Live SEO smoke test (production): sample sitemap URLs and verify:
 * - HTTP status is 200
 * - canonical tag exists and matches the URL (no contradictions)
 * - title and meta description exist and are reasonable lengths
 *
 * Usage:
 *   npx tsx scripts/live-seo-smoke.ts
 *   SITE_URL=https://streamstickpro.com SAMPLE=200 npx tsx scripts/live-seo-smoke.ts
 */
const SITE_URL = (process.env.SITE_URL || 'https://streamstickpro.com').replace(/\/$/, '');
const SAMPLE = Math.max(10, Math.min(1000, Number(process.env.SAMPLE || '200')));
const TIMEOUT_MS = Math.max(5000, Math.min(30000, Number(process.env.TIMEOUT_MS || '15000')));
const UA = process.env.USER_AGENT || 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';

type Issue = {
  type: 'http' | 'canonical' | 'meta' | 'title';
  url: string;
  status?: number | 'ERR';
  detail: string;
};

function pickSample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr.slice();
  // Deterministic-ish sample: stride through the list so we cover the whole range.
  const out: T[] = [];
  const step = Math.max(1, Math.floor(arr.length / n));
  for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i]);
  // If still short (due to rounding), fill from end.
  for (let i = arr.length - 1; i >= 0 && out.length < n; i--) out.push(arr[i]);
  return out.slice(0, n);
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') && url !== `${SITE_URL}/` ? url.replace(/\/+$/, '') : url;
}

function extractTag(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractCanonical(html: string): string | null {
  return extractTag(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
}

function extractTitle(html: string): string | null {
  return extractTag(html, /<title>([^<]{1,300})<\/title>/i);
}

function extractMetaDescription(html: string): string | null {
  return extractTag(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
}

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': UA, 'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
      redirect: 'follow',
      signal: ac.signal,
    });
    const text = await res.text();
    return { status: res.status, text };
  } finally {
    clearTimeout(t);
  }
}

async function getSitemapUrls(): Promise<string[]> {
  const indexUrl = `${SITE_URL}/sitemap-index.xml`;
  const res = await fetchText(indexUrl);
  if (res.status !== 200) {
    // fallback to sitemap.xml
    const fallback = await fetchText(`${SITE_URL}/sitemap.xml`);
    const locs = Array.from(fallback.text.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    return locs.filter((u) => u.startsWith(SITE_URL));
  }

  const sitemapLocs = Array.from(res.text.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
  const pageUrls: string[] = [];
  for (const sm of sitemapLocs) {
    if (!sm.startsWith(SITE_URL)) continue;
    const child = await fetchText(sm);
    if (child.status !== 200) continue;
    const locs = Array.from(child.text.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    for (const u of locs) if (u.startsWith(SITE_URL)) pageUrls.push(u);
  }
  // De-dupe while preserving order
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of pageUrls) {
    const norm = stripTrailingSlash(u);
    if (seen.has(norm)) continue;
    seen.add(norm);
    out.push(norm);
  }
  return out;
}

function mdTable(issues: Issue[], limit = 25): string {
  const rows = issues.slice(0, limit).map((i) => `| ${i.type} | ${i.status ?? ''} | ${i.url} | ${i.detail.replace(/\|/g, '\\|')} |`);
  return [
    '| type | status | url | detail |',
    '|------|--------|-----|--------|',
    ...rows,
  ].join('\n');
}

async function main() {
  console.log(`[live-seo-smoke] site=${SITE_URL} sample=${SAMPLE} timeout_ms=${TIMEOUT_MS}`);
  const urls = await getSitemapUrls();
  console.log(`[live-seo-smoke] sitemap urls=${urls.length}`);

  const sample = pickSample(urls, SAMPLE);
  const issues: Issue[] = [];
  let ok = 0;

  for (const url of sample) {
    try {
      const { status, text } = await fetchText(url);
      if (status !== 200) {
        issues.push({ type: 'http', url, status, detail: 'Non-200 response' });
        continue;
      }

      const canonical = extractCanonical(text);
      if (!canonical) {
        issues.push({ type: 'canonical', url, status, detail: 'Missing canonical tag' });
      } else {
        const normCanon = stripTrailingSlash(canonical);
        const normUrl = stripTrailingSlash(url);
        if (normCanon !== normUrl) {
          issues.push({ type: 'canonical', url, status, detail: `Canonical mismatch → ${normCanon}` });
        }
      }

      const title = extractTitle(text);
      if (!title || title.trim().length < 10) {
        issues.push({ type: 'title', url, status, detail: 'Missing/too short <title>' });
      } else if (title.length > 70) {
        issues.push({ type: 'title', url, status, detail: `Long <title> (${title.length})` });
      }

      const desc = extractMetaDescription(text);
      if (!desc || desc.trim().length < 30) {
        issues.push({ type: 'meta', url, status, detail: 'Missing/too short meta description' });
      } else if (desc.length > 170) {
        issues.push({ type: 'meta', url, status, detail: `Long meta description (${desc.length})` });
      }

      ok++;
    } catch (e: any) {
      issues.push({ type: 'http', url, status: 'ERR', detail: e?.name === 'AbortError' ? 'Timeout' : (e?.message || String(e)) });
    }
  }

  const errorCount = issues.filter((i) => i.type === 'http' || (i.type === 'canonical' && i.detail.startsWith('Missing'))).length;
  console.log(`[live-seo-smoke] ok=${ok}/${sample.length} issues=${issues.length} error_like=${errorCount}`);

  if (issues.length) {
    console.log('\n[live-seo-smoke] Top issues:\n');
    console.log(mdTable(issues, 40));
    console.log('');
  }

  // Exit non-zero only when we see real breakage (timeouts/500s/missing canonicals).
  if (errorCount > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[live-seo-smoke] fatal', err);
  process.exitCode = 1;
});

