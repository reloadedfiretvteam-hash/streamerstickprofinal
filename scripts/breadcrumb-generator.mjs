#!/usr/bin/env node
/**
 * Breadcrumb generator for StreamStickPro SEO.
 * Outputs BreadcrumbList JSON-LD from path.
 * Usage: node scripts/breadcrumb-generator.mjs /l/usa/iptv/houston
 */

const SITE = 'https://streamstickpro.com';
const LABELS = {
  '': 'Home',
  'l': 'Location',
  'usa': 'USA',
  'ca': 'Canada',
  'uk': 'UK',
  'iptv': 'IPTV',
  'jailbreak': 'Jailbroken Fire Stick',
  'google': 'Google TV',
  'shop': 'Shop',
  'blog': 'Blog',
  'iptv-services': 'IPTV Services',
  'iptv-firestick': 'IPTV Firestick',
  'jailbroken-fire-sticks': 'Jailbroken Fire Sticks',
  'firestick-devices': 'Firestick Devices',
  'best-iptv-firestick': 'Best IPTV Firestick',
  'iptv-media-players': 'IPTV Media Players',
  'free-trial': 'Free Trial',
};

function pathToBreadcrumbs(path) {
  const clean = path.replace(/^\//, '').replace(/\/$/, '') || '';
  const segments = clean ? clean.split('/') : [];
  const items = [{ name: 'Home', url: SITE + '/' }];
  let acc = '';
  for (let i = 0; i < segments.length; i++) {
    acc += (acc ? '/' : '') + segments[i];
    const url = SITE + '/' + acc;
    const label = LABELS[segments[i].toLowerCase()] || segments[i].replace(/-/g, ' ');
    items.push({ name: label, url });
  }
  return items;
}

function toSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

const path = process.argv[2] || '/';
const items = pathToBreadcrumbs(path);
const schema = toSchema(items);
console.log(JSON.stringify(schema, null, 2));
