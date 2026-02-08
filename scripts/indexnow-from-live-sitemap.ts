#!/usr/bin/env tsx
/**
 * Fetch LIVE sitemap from production and submit all URLs to IndexNow.
 * Run AFTER deploy so Bing/Yandex/Seznam get every URL immediately.
 * Usage: npx tsx scripts/indexnow-from-live-sitemap.ts
 *        SITE_URL=https://streamstickpro.com npx tsx scripts/indexnow-from-live-sitemap.ts
 */
const SITE_URL = process.env.SITE_URL || 'https://streamstickpro.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '59748a36d4494392a7d863abcf2d3b52';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

async function main() {
  console.log('Fetching live sitemap:', SITEMAP_URL);
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    console.error('Failed to fetch sitemap:', res.status);
    process.exit(1);
  }
  const xml = await res.text();
  const locs = xml.match(/<loc>([^<]+)<\/loc>/g) || [];
  const urls = locs.map((m) => m.replace(/<\/?loc>/g, '').trim()).filter(Boolean);
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
