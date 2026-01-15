import { useEffect } from 'react';

/**
 * Retargeting Pixels Component
 * Adds Google Ads, Facebook Pixel, and other retargeting pixels
 * to track visitors and show them ads across the internet
 */
export default function RetargetingPixels() {
  useEffect(() => {
    // Google Ads (Google Tag Manager / gtag.js)
    const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
    if (googleAdsId) {
      // Load Google Tag Manager
      const gtmScript = document.createElement('script');
      gtmScript.async = true;
      gtmScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
      document.head.appendChild(gtmScript);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', googleAdsId, {
        send_page_view: true,
      });

      // Track page views
      gtag('event', 'page_view', {
        page_path: window.location.pathname,
        page_title: document.title,
      });
    }

    // Facebook Pixel
    const facebookPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;
    if (facebookPixelId) {
      !(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode?.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      (window as any).fbq('init', facebookPixelId);
      (window as any).fbq('track', 'PageView');
    }

    // Track page views on route changes
    const handleRouteChange = () => {
      if (googleAdsId && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: window.location.pathname,
          page_title: document.title,
        });
      }
      if (facebookPixelId && (window as any).fbq) {
        (window as any).fbq('track', 'PageView');
      }
    };

    // Listen for route changes (for SPA)
    window.addEventListener('popstate', handleRouteChange);
    const originalPushState = history.pushState;
    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(handleRouteChange, 100);
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      history.pushState = originalPushState;
    };
  }, []);

  return null;
}

// Helper function to track conversions (call this on purchase/trial signup)
export function trackConversion(type: 'purchase' | 'trial' | 'signup', value?: number, currency = 'USD') {
  const googleAdsId = import.meta.env.VITE_GOOGLE_ADS_ID;
  const facebookPixelId = import.meta.env.VITE_FACEBOOK_PIXEL_ID;

  // Google Ads conversion
  if (googleAdsId && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: googleAdsId,
      value: value,
      currency: currency,
      transaction_id: `txn_${Date.now()}`,
    });
  }

  // Facebook Pixel conversion
  if (facebookPixelId && (window as any).fbq) {
    if (type === 'purchase') {
      (window as any).fbq('track', 'Purchase', {
        value: value,
        currency: currency,
      });
    } else if (type === 'trial') {
      (window as any).fbq('track', 'CompleteRegistration');
    } else {
      (window as any).fbq('track', 'Lead');
    }
  }
}
