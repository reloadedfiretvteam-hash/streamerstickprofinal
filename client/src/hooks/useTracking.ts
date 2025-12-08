import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

export function useTracking() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location + window.location.search;
    
    if (lastTrackedPath.current === currentPath) return;
    lastTrackedPath.current = currentPath;

    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent;

        await apiCall('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: currentPath,
            referrer,
            userAgent,
          }),
        });
      } catch (error) {
        console.warn('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location]);
}
