#!/usr/bin/env npx tsx
/**
 * Check Cloudflare zone status and settings that could make the site appear "inactive" to Google.
 * Run locally with your token in env; never commit tokens.
 *
 * Usage:
 *   set CLOUDFLARE_API_TOKEN=your_token
 *   set CLOUDFLARE_ZONE_ID=your_zone_id
 *   npx tsx scripts/check-cloudflare-zone.ts
 *
 * Zone ID: Cloudflare Dashboard → streamstickpro.com → Overview → right sidebar "Zone ID"
 * API Token: Dashboard → My Profile → API Tokens → Create Token (Zone: Read, Zone Settings: Read)
 */

const API_BASE = 'https://api.cloudflare.com/client/v4';

async function cfFetch(path: string, token: string, method = 'GET', body?: object) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message || JSON.stringify(data.errors));
  }
  return data;
}

const ZONE_NAME = 'streamstickpro.com';

async function main() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  let zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!token) {
    console.error('Missing CLOUDFLARE_API_TOKEN.');
    process.exit(1);
  }

  try {
    // Resolve zone ID by name if not set
    if (!zoneId) {
      const list = await cfFetch(`/zones?name=${ZONE_NAME}`, token);
      const zones = list.result || [];
      if (zones.length === 0) {
        console.error(`Zone not found for ${ZONE_NAME}. Check token has Zone Read.`);
        process.exit(1);
      }
      zoneId = zones[0].id;
      console.log('Resolved zone ID for', ZONE_NAME, '\n');
    }

    console.log('Checking Cloudflare zone (streamstickpro.com)...\n');

    // Zone details (status, paused, name)
    const zone = await cfFetch(`/zones/${zoneId}`, token);
    const z = zone.result;
    console.log('--- Zone ---');
    console.log('Name:', z.name);
    console.log('Status:', z.status);
    console.log('Paused:', z.paused === true ? 'YES (site is paused!)' : 'No');
    if (z.paused) {
      console.log('\n>>> FIX: Unpause the zone in Cloudflare Dashboard → Overview → pause/develop mode.');
    }
    console.log('');

    // SSL/TLS setting (Full vs Flexible)
    const ssl = await cfFetch(`/zones/${zoneId}/settings/ssl`, token);
    const sslVal = ssl.result?.find((s: { id: string }) => s.id === 'ssl')?.value;
    console.log('--- SSL/TLS ---');
    console.log('SSL mode:', sslVal || 'unknown');
    if (sslVal === 'flexible') {
      console.log('(Flexible is OK but Full or Full (strict) is better for SEO.)');
    }
    console.log('');

    // Security level (off, low, medium, high, under_attack)
    const secLevel = await cfFetch(`/zones/${zoneId}/settings/security_level`, token);
    const level = secLevel.result?.find((s: { id: string }) => s.id === 'security_level')?.value;
    console.log('--- Security Level ---');
    console.log('Level:', level);
    if (level === 'under_attack' || level === 'high') {
      console.log('>>> WARNING: High or "I\'m Under Attack" can block/challenge Googlebot. Consider Medium or Low.');
    }
    console.log('');

    // Bot Fight Mode (on/off) - if available for the plan
    try {
      const botFight = await cfFetch(`/zones/${zoneId}/settings/bot_fight_mode`, token);
      const botVal = botFight.result?.find((s: { id: string }) => s.id === 'bot_fight_mode')?.value;
      console.log('--- Bot Fight Mode ---');
      console.log('Enabled:', botVal === true ? 'YES' : 'No');
      if (botVal === true) {
        console.log('>>> WARNING: Bot Fight Mode can block or challenge crawlers. Turn OFF for SEO.');
      }
      console.log('');
    } catch {
      console.log('--- Bot Fight Mode ---');
      console.log('(Could not read; check in Dashboard → Security → Bots.)\n');
    }

    // DNS records (A/AAAA/CNAME for root and www)
    const dns = await cfFetch(`/zones/${zoneId}/dns_records?per_page=50`, token);
    const root = dns.result?.filter((r: { name: string }) => r.name === 'streamstickpro.com' || r.name === 'www.streamstickpro.com') || [];
    console.log('--- DNS (root / www) ---');
    if (root.length === 0) {
      console.log('No records found for streamstickpro.com or www. Check domain is this zone.');
    } else {
      root.forEach((r: { name: string; type: string; content: string; proxied?: boolean }) => {
        console.log(`${r.name} ${r.type} ${r.content} proxied=${r.proxied ?? false}`);
      });
    }
    console.log('');

    console.log('Done. If status is "active", SSL is Full, Security is not Under Attack, and Bot Fight is off,');
    console.log('Cloudflare is unlikely to be the cause of "inactive." Also check: Redirect Rules, Page Rules,');
    console.log('and Workers & Pages → streamerstickpro-live → last build success and custom domain active.');
  } catch (e: any) {
    console.error('Error:', e?.message || e);
    process.exit(1);
  }
}

main();
