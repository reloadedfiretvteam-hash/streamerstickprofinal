import { useEffect } from 'react';

/**
 * Retargeting Pixels Component
 * Adds Meta Pixel (Facebook Pixel), Google Ads, and other retargeting pixels
 * to track visitors and show them ads across the internet
 * 
 * This enables retargeting - showing ads to visitors after they leave your site
 */
export default function RetargetingPixels() {
  useEffect(() => {
    // Meta Pixel (Facebook Pixel) - Primary retargeting pixel
    const metaPixelId = import.meta.env.VITE_META_PIXEL_ID || import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    if (metaPixelId) {
      // Meta Pixel Base Code (v2.0) — void IIFE (no leading `!` on void return)
      void (function loadMetaPixel(
        f: Window & typeof globalThis,
        b: Document,
        e: string,
        v: string
      ) {
        const fw = f as Window & { fbq?: unknown; _fbq?: unknown };
        if (fw.fbq) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Meta fbq stub (expects `arguments`)
        const n: any = function (this: unknown) {
          // eslint-disable-next-line prefer-rest-params, @typescript-eslint/no-explicit-any
          (n as any).callMethod
            ? (n as any).callMethod.apply(n, arguments as any)
            : n.queue.push(arguments);
        };
        fw.fbq = n;
        if (!fw._fbq) fw._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        const t = b.createElement(e);
        (t as HTMLScriptElement).async = !0;
        (t as HTMLScriptElement).src = v;
        const s = b.getElementsByTagName(e)[0];
        s?.parentNode?.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // Initialize Meta Pixel
      (window as any).fbq('init', metaPixelId, {
        autoConfig: true,
        debug: false,
      });
      
      // Track initial page view
      (window as any).fbq('track', 'PageView');
      
      // Track ViewContent for retargeting
      (window as any).fbq('track', 'ViewContent', {
        content_name: document.title,
        content_category: 'Website Visit',
      });
      
      console.log('✅ Meta Pixel initialized:', metaPixelId);
    } else {
      console.warn('⚠️ Meta Pixel ID not found. Set VITE_META_PIXEL_ID or VITE_FACEBOOK_PIXEL_ID in environment variables.');
    }

    // Google Ads (Google Tag Manager / gtag.js)
    const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
    if (googleAdsId) {
      // Reuse existing global gtag from index.html to avoid duplicate tags.
      const w = window as Window & { dataLayer: unknown[] };
      w.dataLayer = w.dataLayer ?? [];
      const gtag = (...args: unknown[]) => {
        w.dataLayer.push(args);
      };
      (window as unknown as { gtag?: typeof gtag }).gtag =
        (window as unknown as { gtag?: typeof gtag }).gtag || gtag;

      const scriptSelector = `script[src*="googletagmanager.com/gtag/js?id=${googleAdsId}"]`;
      const hasGoogleTagScript = !!document.querySelector(scriptSelector);
      if (!hasGoogleTagScript) {
        const gtmScript = document.createElement('script');
        gtmScript.async = true;
        gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
        document.head.appendChild(gtmScript);
      }

      if ((window as any).__awConfigured !== googleAdsId) {
        gtag('js', new Date());
        gtag('consent', 'default', {
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          ad_storage: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500,
        });
        gtag('config', googleAdsId, {
          send_page_view: true,
        });
        (window as any).__awConfigured = googleAdsId;
      }
    }

    // Track page views on route changes
    const handleRouteChange = () => {
      if (googleAdsId && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname,
          page_title: document.title,
        });
      }
      if (metaPixelId && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
        (window as any).fbq('track', 'ViewContent', {
          content_name: document.title,
          content_category: 'Page View',
        });
      }
    };

    // Listen for route changes (for SPA)
    window.addEventListener('popstate', handleRouteChange);
    
    // Store original pushState with proper isolation
    const originalPushState = history.pushState.bind(history);
    let isOverridden = false;
    
    // Only override if not already overridden
    if (!(history.pushState as { __isOverridden?: boolean }).__isOverridden) {
      const wrappedPushState: History["pushState"] = function (data, unused, url) {
        originalPushState(data, unused, url);
        setTimeout(handleRouteChange, 100);
      };
      (wrappedPushState as History["pushState"] & { __isOverridden?: boolean }).__isOverridden =
        true;
      history.pushState = wrappedPushState;
      isOverridden = true;
    }

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      // Only restore if we were the ones who overrode it
      if (isOverridden && (history.pushState as { __isOverridden?: boolean }).__isOverridden) {
        history.pushState = originalPushState;
        delete (history.pushState as { __isOverridden?: boolean }).__isOverridden;
      }
    };
  }, []);

  return null;
}

/**
 * Track conversion events for retargeting
 * Call this when users complete actions (purchase, trial, signup)
 */
export function trackConversion(type: 'purchase' | 'trial' | 'signup' | 'add_to_cart' | 'initiate_checkout', value?: number, currency = 'USD', additionalData?: Record<string, any>) {
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID || import.meta.env.VITE_FACEBOOK_PIXEL_ID;

  // Google Ads conversion
  if (googleAdsId && (window as any).gtag) {
    if (type === 'purchase') {
      (window as any).gtag('event', 'conversion', {
        send_to: googleAdsId,
        value: value,
        currency: currency,
        transaction_id: `txn_${Date.now()}`,
        ...additionalData,
      });
    } else if (type === 'add_to_cart') {
      (window as any).gtag('event', 'add_to_cart', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    } else if (type === 'initiate_checkout') {
      (window as any).gtag('event', 'begin_checkout', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    }
  }

  // Meta Pixel (Facebook Pixel) conversion
  if (metaPixelId && (window as any).fbq) {
    if (type === 'purchase') {
      (window as any).fbq('track', 'Purchase', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    } else if (type === 'trial') {
      (window as any).fbq('track', 'CompleteRegistration', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    } else if (type === 'add_to_cart') {
      (window as any).fbq('track', 'AddToCart', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    } else if (type === 'initiate_checkout') {
      (window as any).fbq('track', 'InitiateCheckout', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    } else {
      (window as any).fbq('track', 'Lead', {
        value: value,
        currency: currency,
        ...additionalData,
      });
    }
  }
}

/**
 * Track custom events for advanced retargeting
 */
export function trackCustomEvent(eventName: string, eventData?: Record<string, any>) {
  const metaPixelId = import.meta.env.VITE_META_PIXEL_ID || import.meta.env.VITE_FACEBOOK_PIXEL_ID;
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;

  if (metaPixelId && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, eventData || {});
  }

  if (googleAdsId && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventData || {});
  }
}
