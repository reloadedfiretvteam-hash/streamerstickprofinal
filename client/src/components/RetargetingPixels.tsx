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
      // Meta Pixel Base Code (v2.0)
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
      
      console.log('✅ Google Ads pixel initialized:', googleAdsId);
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
