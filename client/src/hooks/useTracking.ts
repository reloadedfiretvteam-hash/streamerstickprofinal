import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";

function getVisitSessionId(): string {
  // 30-minute rolling session id (better analytics; does NOT define "unique visitor")
  const KEY_ID = 'visit_session_id';
  const KEY_TS = 'visit_session_last_ts';
  const now = Date.now();
  const last = Number(localStorage.getItem(KEY_TS) || '0');
  let id = localStorage.getItem(KEY_ID);
  const idleMs = now - last;
  if (!id || !last || idleMs > 30 * 60 * 1000) {
    id = `${now}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(KEY_ID, id);
  }
  localStorage.setItem(KEY_TS, String(now));
  return id;
}

export function useTracking() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const currentPath = location + window.location.search;
    
    // Skip if we already tracked this path
    if (lastTrackedPath.current === currentPath) {
      return;
    }
    lastTrackedPath.current = currentPath;

    const trackPageView = async () => {
      try {
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent;
        const fullUrl = window.location.href;
        const pagePath = window.location.pathname || '/';
        const session_id = getVisitSessionId();

        // Use deduplicated visitor tracking endpoint (server sets a stable visitor cookie)
        const response = await apiCall('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id,
            page: pagePath,
            page_url: fullUrl,
            referrer,
            user_agent: userAgent,
          }),
        });

        if (!response.ok) {
          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = { error: responseText };
          }
          throw new Error(`Tracking failed: ${response.status} ${responseData.error || responseText}`);
        }
        
        // Parse and log success
        try {
          const result = await response.json();
          if (import.meta.env.DEV) {
            console.log('✅ Visitor tracked successfully:', result);
          }
        } catch {
          // Response might be empty, that's okay
        }
      } catch (error: any) {
        // Log errors for debugging but don't interrupt user experience
        console.error('❌ Failed to track page view:', {
          error: error.message,
          url: window.location.href,
          sessionId: getVisitSessionId()
        });
      }
    };

    trackPageView();
  }, [location]);
}
