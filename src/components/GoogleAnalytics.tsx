import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export default function GoogleAnalytics() {
  const [measurementId, setMeasurementId] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('seo_settings')
        .select('google_analytics_id')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (data && data.google_analytics_id && data.google_analytics_id !== 'G-XXXXXXXXXX') {
        setMeasurementId(data.google_analytics_id);
      }
    } catch {
      console.log('SEO settings not yet configured');
    }
  };

  useEffect(() => {
    if (!measurementId || typeof window === 'undefined') return;

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      page_path: window.location.pathname,
      send_page_view: true,
    });

    gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
    });

    return () => {
      const scripts = document.querySelectorAll(`script[src*="googletagmanager"]`);
      scripts.forEach(script => script.remove());
    };
  }, [measurementId]);

  return null;
}

export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: url,
    });
  }
};

export const trackPurchase = (value: number, currency: string, transactionId: string, items: Array<{item_name: string; price: number; quantity: number}>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value: value,
      currency: currency,
      items: items,
    });
  }
};

export const trackAddToCart = (itemName: string, price: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: price,
      items: [{
        item_name: itemName,
        price: price,
      }],
    });
  }
};

interface CheckoutItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
}

export const trackBeginCheckout = (value: number, items: CheckoutItem[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value: value,
      items: items,
    });
  }
};
