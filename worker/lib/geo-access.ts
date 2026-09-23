/** Visitor country from Cloudflare. Missing means unknown, not a bypass. */
export function requestCountry(c: { req: { raw: Request; header: (name: string) => string | undefined } }): string {
  const fromCf = (c.req.raw as Request & { cf?: { country?: string } }).cf?.country;
  const fromHeader = c.req.header('CF-IPCountry') || c.req.header('cf-ipcountry');
  return String(fromCf || fromHeader || '').trim().toUpperCase();
}

/** Checkout and paid orders. */
export const PAYMENT_COUNTRIES = new Set(['US', 'CA']);

/**
 * Asia (UN regions) and the Middle East, including Egypt.
 * These visitors get a short unavailable page. Stripe webhooks are exempt.
 */
export const BLOCKED_COUNTRIES = new Set([
  'CN', 'HK', 'MO', 'JP', 'KP', 'KR', 'MN', 'TW',
  'BN', 'KH', 'ID', 'LA', 'MY', 'MM', 'PH', 'SG', 'TH', 'TL', 'VN',
  'AF', 'BD', 'BT', 'IN', 'IR', 'MV', 'NP', 'PK', 'LK',
  'KZ', 'KG', 'TJ', 'TM', 'UZ',
  'AM', 'AZ', 'BH', 'CY', 'GE', 'IQ', 'IL', 'JO', 'KW', 'LB', 'OM', 'PS', 'QA', 'SA', 'SY', 'TR', 'AE', 'YE',
  'EG',
]);

export function isBlockedCountry(country: string): boolean {
  return BLOCKED_COUNTRIES.has(country);
}

export function canPayFromCountry(country: string): boolean {
  return PAYMENT_COUNTRIES.has(country);
}
