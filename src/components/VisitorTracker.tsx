import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function VisitorTracker() {
  useEffect(() => {
    trackVisitor();
  }, []);

  const trackVisitor = async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const visitorId = getOrCreateVisitorId();

      const visitData = {
        session_id: sessionId,
        visitor_id: visitorId,
        user_agent: navigator.userAgent,
        landing_page: window.location.pathname,
        referrer_url: document.referrer || null,
        referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
        language: navigator.language,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        entry_time: new Date().toISOString(),
        pages_viewed: 1,
        is_bounce: false,
        converted: false
      };

      const { data, error } = await supabase
        .from('visitor_tracking')
        .insert(visitData)
        .select()
        .maybeSingle();

      if (error) {
        console.error('Visitor tracking error:', error);
      } else if (data) {
        sessionStorage.setItem('visitor_tracking_id', data.id);
      }

    } catch (error) {
      console.error('Visitor tracking error:', error);
    }
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
