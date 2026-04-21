import { useEffect } from 'react';

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  useEffect(() => {
    const trackPageView = async () => {
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
    };

    trackPageView();

    const startTime = Date.now();
    const handleUnload = () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const sessionId = getSessionId();
      navigator.sendBeacon(
        '/api/track-duration',
        JSON.stringify({ session_id: sessionId, duration })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
};

export const trackEmailCapture = async (email: string, source: string) => {
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        source,
        metadata: {
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          device_type: getDeviceType(),
          timestamp: new Date().toISOString(),
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
};

export const trackCartAbandonment = async (email: string, planId: string, amount: number) => {
  try {
    const sessionId = getSessionId();
    await fetch('/api/track-cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        cartItems: [{ productId: planId, quantity: 1 }],
        totalAmount: amount,
        session_id: sessionId,
      }),
    });
    return true;
  } catch {
    return false;
  }
};
