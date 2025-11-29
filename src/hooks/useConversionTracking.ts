import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useConversionTracking() {
  useEffect(() => {
    // Initialize conversion tracking
    const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);
  }, []);

  const trackConversion = async (event: string, value?: number) => {
    try {
      const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
      localStorage.setItem('session_id', sessionId);

      await supabase.from('conversions').insert({
        session_id: sessionId,
        event_type: event,
        event_value: value,
        page_url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    } catch (_error) {
      // Fail silently in production
    }
  };

  return { trackConversion };
}

export async function trackAddToCart(productId: string, productName: string, price: number) {
  try {
    const sessionId = localStorage.getItem('session_id');
    await supabase.from('cart_events').insert({
      session_id: sessionId,
      event_type: 'add_to_cart',
      product_id: productId,
      product_name: productName,
      price: price,
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    // Fail silently
  }
}

export async function trackCheckoutStart(cartTotal: number, itemCount: number) {
  try {
    const sessionId = localStorage.getItem('session_id');
    await supabase.from('checkout_events').insert({
      session_id: sessionId,
      event_type: 'checkout_started',
      cart_total: cartTotal,
      item_count: itemCount,
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    // Fail silently
  }
}

export async function trackPurchase(orderId: string, total: number, items: any[]) {
  try {
    const sessionId = localStorage.getItem('session_id');
    await supabase.from('purchase_events').insert({
      session_id: sessionId,
      order_id: orderId,
      total_amount: total,
      items: JSON.stringify(items),
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    // Fail silently
  }
}

export async function trackPageView() {
  try {
    const sessionId = localStorage.getItem('session_id') || crypto.randomUUID();
    localStorage.setItem('session_id', sessionId);

    await supabase.from('page_views').insert({
      session_id: sessionId,
      page_url: window.location.href,
      page_title: document.title,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    // Fail silently
  }
}
