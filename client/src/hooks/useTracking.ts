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
          console.error('[VISITOR_TRACK] Tracking failed:', {
            status: response.status,
            statusText: response.statusText,
            error: responseData.error || responseText,
            details: responseData.details,
            code: responseData.code,
            hint: responseData.hint,
            suggestion: responseData.suggestion
          });
          throw new Error(`Tracking failed: ${response.status} ${responseData.error || responseText}`);
        }

        // Verify success response
        const result = await response.json().catch(() => ({}));
        if (result.success) {
          console.log('[VISITOR_TRACK] Successfully tracked page view:', result.visitorId);
        }
      } catch (error: any) {
        // Log error for debugging but don't interrupt user experience
        console.warn('[VISITOR_TRACK] Failed to track page view:', error.message);
        // Don't throw - tracking failures shouldn't break the app
      }
    };

    trackPageView();
  }, [location]);
}
