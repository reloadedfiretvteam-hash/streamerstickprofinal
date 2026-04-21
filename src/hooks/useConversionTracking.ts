import { useEffect } from 'react';

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id') || localStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
    localStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export function useConversionTracking() {
  useEffect(() => {
    // Ensure session ID exists on mount
    getSessionId();
  }, []);

  const trackConversion = async (event: string, value?: number) => {
    try {
      const sessionId = getSessionId();
      await fetch('/api/track-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: event,
          event_value: value,
          page_url: window.location.href,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Fail silently in production
    }
  };

  return { trackConversion };
}

export async function trackAddToCart(productId: string, productName: string, price: number) {
  try {
    const sessionId = getSessionId();
    await fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: 'add_to_cart',
        product_id: productId,
        product_name: productName,
        price,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Fail silently
  }
}

export async function trackCheckoutStart(cartTotal: number, itemCount: number) {
  try {
    const sessionId = getSessionId();
    await fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: 'checkout_started',
        cart_total: cartTotal,
        item_count: itemCount,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Fail silently
  }
}

export async function trackPurchase(orderId: string, total: number, items: any[]) {
  try {
    const sessionId = getSessionId();
    await fetch('/api/track-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: 'purchase',
        order_id: orderId,
        total_amount: total,
        items,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch {
    // Fail silently
  }
}

export async function trackPageView() {
  try {
    const sessionId = getSessionId();
    await fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        page: window.location.pathname,
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      }),
    });
  } catch {
    // Fail silently
  }
}
