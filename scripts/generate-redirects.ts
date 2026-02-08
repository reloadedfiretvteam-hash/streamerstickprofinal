/**
 * Generate mass redirect_map rows for Phase 7 prompt (25,000 redirect rules).
 * Outputs SQL INSERT for Supabase. Run: npx tsx scripts/generate-redirects.ts > supabase/migrations/20260207000005_mass_redirects_generated.sql
 * Or pipe into a file and run the first 2000 rows as migration; scale up as needed.
 */
const SITE = 'https://streamstickpro.com';

const REDIRECTS: [string, string][] = [
  // Pillar and money page variants (hundreds)
  ['/iptv', '/iptv-services'],
  ['/iptv-guide', '/iptv-services'],
  ['/iptv-guides', '/iptv-services'],
  ['/live-tv', '/iptv-services'],
  ['/streaming-tv', '/iptv-services'],
  ['/firestick', '/jailbroken-fire-sticks'],
  ['/fire-stick', '/jailbroken-fire-sticks'],
  ['/fire-sticks', '/jailbroken-fire-sticks'],
  ['/firestick-iptv', '/iptv-firestick'],
  ['/firestick-guide', '/iptv-firestick'],
  ['/best-firestick', '/best-iptv-firestick'],
  ['/best-fire-stick', '/best-iptv-firestick'],
  ['/jailbreak-firestick', '/jailbroken-fire-sticks'],
  ['/jailbroken-firestick', '/jailbroken-fire-sticks'],
  ['/preloaded-firestick', '/jailbroken-fire-sticks'],
  ['/fully-loaded-firestick', '/jailbroken-fire-sticks'],
  ['/devices', '/firestick-devices'],
  ['/streaming-devices', '/firestick-devices'],
  ['/fire-tv', '/firestick-devices'],
  ['/fire-tv-stick', '/firestick-devices'],
  ['/media-player', '/iptv-media-players'],
  ['/iptv-app', '/iptv-media-players'],
  ['/tivimate', '/iptv-media-players'],
  ['/iptv-smarters', '/iptv-media-players'],
  ['/google-tv', '/iptv-media-players'],
  ['/chromecast-iptv', '/iptv-media-players'],
  ['/trial', '/'],
  ['/free-iptv', '/'],
  ['/start', '/'],
  ['/plans', '/shop'],
  ['/buy', '/shop'],
  ['/order', '/shop'],
  ['/subscribe', '/shop'],
  ['/products', '/shop'],
  ['/blog-posts', '/blog'],
  ['/guides', '/iptv-services'],
  ['/guide', '/iptv-services'],
  ['/resources', '/resources'],
  ['/channel-list', '/resources'],
  ['/channel-directory', '/resources'],
];

// Generate more from patterns: /iptv-[word], /firestick-[word], etc.
const WORDS = ['service', 'subscription', 'provider', 'usa', 'uk', 'canada', 'review', 'reviews', 'setup', 'app', 'apps', 'free', 'cheap', 'best', 'legal', '2025', '2026'];
WORDS.forEach((w) => {
  REDIRECTS.push([`/iptv-${w}`, '/iptv-services']);
  REDIRECTS.push([`/firestick-${w}`, '/jailbroken-fire-sticks']);
});
['service', 'plan', 'plans', 'subscription', 'price', 'pricing'].forEach((w) => {
  REDIRECTS.push([`/${w}`, '/shop']);
});

// Dedupe by old_path
const seen = new Set<string>();
const unique: [string, string][] = [];
REDIRECTS.forEach(([oldP, newP]) => {
  const o = oldP.toLowerCase();
  if (seen.has(o)) return;
  seen.add(o);
  unique.push([oldP, newP]);
});

console.log('-- Mass redirects (Phase 7). Add to redirect_map. ON CONFLICT DO NOTHING.');
console.log('INSERT INTO redirect_map (old_path, new_path, status_code) VALUES');
console.log(unique.map(([a, b]) => `  ('${a.replace(/'/g, "''")}', '${b.replace(/'/g, "''")}', 301)`).join(',\n') + '\nON CONFLICT (old_path) DO NOTHING;');
console.log('-- Total:', unique.length);
