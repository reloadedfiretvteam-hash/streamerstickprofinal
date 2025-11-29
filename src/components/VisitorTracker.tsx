import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function VisitorTracker() {
  useEffect(() => {
    trackVisitor();
  }, []);

  const trackVisitor = async () => {
    try {
      const sessionId = getOrCreateSessionId();
      getOrCreateVisitorId();

      const { data, error } = await supabase
        .from('visitors')
        .insert({
          session_id: sessionId,
          page_url: window.location.href,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        sessionStorage.setItem('visitor_tracking_id', data.id);
        trackPageView(data.id, sessionId);
      }

      window.addEventListener('beforeunload', () => {
        updateSessionEnd(data?.id);
      });

    } catch (error) {
      console.error('Visitor tracking error:', error);
    }
  };

  const trackPageView = async () => {
    // Page view tracking is handled by the main trackVisitor function
  };

  const updateSessionEnd = async () => {
    // Session end tracking - stub for future implementation
  };

  const getOrCreateSessionId = (): string => {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  };

  const getOrCreateVisitorId = (): string => {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  };

  return null;
}
