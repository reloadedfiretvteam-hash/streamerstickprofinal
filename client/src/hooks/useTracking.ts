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
    
    // Skip if we already tracked this path
    if (lastTrackedPath.current === currentPath) {
      return;
    }
    lastTrackedPath.current = currentPath;

    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent;
        const fullUrl = window.location.href;

        const response = await apiCall('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: fullUrl,
            referrer,
            userAgent,
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
          sessionId: getSessionId()
        });
      }
    };

    trackPageView();
  }, [location]);
}
