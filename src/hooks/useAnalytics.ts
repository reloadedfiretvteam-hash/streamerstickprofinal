import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

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

const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

export const useAnalytics = () => {
  useEffect(() => {
    const trackPageView = async () => {
      const visitorId = getVisitorId();
      const deviceType = getDeviceType();
      const referrer = document.referrer || null;

      await supabase.from('visitor_analytics').insert({
        visitor_id: visitorId,
        page_view: window.location.pathname,
        referrer,
        device_type: deviceType,
      });
    };

    trackPageView();

    const startTime = Date.now();
    const handleUnload = async () => {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      const visitorId = getVisitorId();

      navigator.sendBeacon(
        '/api/track-duration',
        JSON.stringify({ visitor_id: visitorId, duration })
      );
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);
};

export const trackEmailCapture = async (email: string, source: string) => {
  try {
    await supabase.from('email_subscribers').insert({
      email,
      source,
      metadata: {
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
      },
    });
    return true;
  } catch (error) {
    console.error('Error tracking email:', error);
    return false;
  }
};

export const trackCartAbandonment = async (email: string, planId: string, amount: number) => {
  try {
    await supabase.from('cart_abandonments').insert({
      email,
      plan_id: planId,
      amount,
      metadata: {
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        timestamp: new Date().toISOString(),
      },
    });
    return true;
  } catch (error) {
    console.error('Error tracking cart abandonment:', error);
    return false;
  }
};
