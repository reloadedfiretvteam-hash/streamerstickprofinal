import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Loads Google Ads gtag.js when VITE_GOOGLE_ADS_ID is set (e.g. AW-1234567890).
 * Add that ID in Cloudflare Pages / GitHub Actions build env — no code edits needed.
 */
export function GoogleAdsTag() {
  useEffect(() => {
    const id = (import.meta.env.VITE_GOOGLE_ADS_ID || '').trim();
    if (!id || !id.startsWith('AW-')) return;

    const attr = `data-gtag-ads-${id}`;
    if (document.head.querySelector(`[${attr}]`)) {
      if (typeof window.gtag === 'function') window.gtag('config', id);
      return;
    }

    // Google’s order: define dataLayer + gtag stub first, then load gtag.js async (commands queue until loaded)
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', id);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.setAttribute(attr, '1');
    document.head.appendChild(script);
  }, []);

  return null;
}
