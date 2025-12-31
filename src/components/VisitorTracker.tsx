import { useEffect, useRef } from 'react';

export default function VisitorTracker() {
  const hasTrackedInitial = useRef(false);

  useEffect(() => {
    // Track initial page load
    if (!hasTrackedInitial.current) {
      trackVisitor();
      hasTrackedInitial.current = true;
    }

    // Track on route changes (popstate for browser back/forward)
    const handlePopState = () => {
      trackVisitor();
    };

    // Track on hash changes
    const handleHashChange = () => {
      trackVisitor();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Also track when location changes (for SPA navigation)
  useEffect(() => {
    let lastTrackedPath = window.location.pathname + window.location.search + window.location.hash;
    sessionStorage.setItem('last_tracked_path', lastTrackedPath);
    
    const interval = setInterval(() => {
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      
      if (currentPath !== lastTrackedPath) {
        trackVisitor();
        lastTrackedPath = currentPath;
        sessionStorage.setItem('last_tracked_path', currentPath);
      }
    }, 2000); // Check every 2 seconds for path changes (reduced frequency)

    return () => clearInterval(interval);
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
