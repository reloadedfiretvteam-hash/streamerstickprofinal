import { useEffect } from 'react';

export default function VisitorTracker() {
  useEffect(() => {
    trackVisitor();
  }, []);

  const trackVisitor = async () => {
    try {
      const sessionId = getOrCreateSessionId();
      const pageUrl = window.location.href;
      const referrer = document.referrer || null;
      const userAgent = navigator.userAgent;

      // Call the API endpoint instead of inserting directly to Supabase
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          pageUrl,
          referrer,
          userAgent
        })
      });
    } catch (error) {
      // Silently fail - visitor tracking shouldn't break the site
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

  return null;
}
