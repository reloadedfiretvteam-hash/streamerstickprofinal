#!/usr/bin/env tsx
/**
 * Fetch LIVE sitemap from production and submit all URLs to IndexNow.
 * Run AFTER deploy so Bing/Yandex/Seznam get every URL immediately.
 * Fetches sitemap-index.xml and all child sitemaps (sitemap-pages.xml, sitemap-posts.xml, sitemap.xml).
 * Usage: npx tsx scripts/indexnow-from-live-sitemap.ts
 *        SITE_URL=https://streamstickpro.com npx tsx scripts/indexnow-from-live-sitemap.ts
 */
const SITE_URL = process.env.SITE_URL || 'https://streamstickpro.com';
const SITEMAP_INDEX_URL = `${SITE_URL}/sitemap-index.xml`;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '752d1cf8edc045568943005a03892968';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

function extractUrls(xml: string): string[] {
  const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  return locs.map((m) => m.replace(/<\/?loc>/g, '').trim()).filter(Boolean);
}

async function main() {
  const allUrls = new Set<string>();

  // Fetch sitemap-index.xml to get all sitemap URLs
  console.log('Fetching sitemap index:', SITEMAP_INDEX_URL);
  const indexRes = await fetch(SITEMAP_INDEX_URL);
  if (!indexRes.ok) {
    console.warn('sitemap-index.xml failed, falling back to sitemap.xml:', indexRes.status);
    const fallback = await fetch(`${SITE_URL}/sitemap.xml`);
    if (!fallback.ok) {
      console.error('Failed to fetch sitemap:', fallback.status);
      process.exit(1);
    }
    extractUrls(await fallback.text()).forEach((u) => allUrls.add(u));
  } else {
    const indexXml = await indexRes.text();
    const sitemapUrls = extractUrls(indexXml);
    for (const sitemapUrl of sitemapUrls) {
      console.log('Fetching sitemap:', sitemapUrl);
      const res = await fetch(sitemapUrl);
      if (res.ok) {
        extractUrls(await res.text()).forEach((u) => allUrls.add(u));
      }
    }
  }

  const urls = Array.from(allUrls);
  console.log('URLs found:', urls.length);

  if (urls.length === 0) {
    console.warn('No URLs in sitemap');
    process.exit(0);
  }

  const host = new URL(SITE_URL).hostname;
  const BATCH = 10000;
  let totalSubmitted = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    const body = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList: batch,
    };
    const indexRes = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    if (indexRes.ok || indexRes.status === 200 || indexRes.status === 202) {
      totalSubmitted += batch.length;
      console.log('IndexNow batch OK: submitted', batch.length, 'URLs (total', totalSubmitted, ')');
    } else {
      console.error('IndexNow batch error:', indexRes.status, await indexRes.text());
    }
  }
  console.log('IndexNow done: submitted', totalSubmitted, 'URLs to Bing/Yandex/Seznam');
  process.exit(0);
}

main();
