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
  const isTracking = useRef(false);

  useEffect(() => {
    const currentPath = location + window.location.search;
    
    // Skip if we already tracked this path or if tracking is in progress
    if (lastTrackedPath.current === currentPath || isTracking.current) {
      return;
    }
    lastTrackedPath.current = currentPath;

    const trackPageView = async () => {
      // Prevent duplicate tracking
      if (isTracking.current) {
        return;
      }
      isTracking.current = true;

      try {
        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent;
        const fullUrl = window.location.href;

        console.log('[VISITOR_TRACK] Attempting to track page view:', { sessionId, pageUrl: fullUrl.substring(0, 50) });

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
          console.log('[VISITOR_TRACK] ✅ Successfully tracked page view:', result.visitorId);
        } else {
          console.warn('[VISITOR_TRACK] ⚠️ Tracking response missing success flag:', result);
        }
      } catch (error: any) {
        // Log error for debugging but don't interrupt user experience
        console.error('[VISITOR_TRACK] ❌ Failed to track page view:', error.message);
        console.error('[VISITOR_TRACK] Error details:', error);
        // Don't throw - tracking failures shouldn't break the app
      } finally {
        isTracking.current = false;
      }
    };

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      trackPageView();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [location]);
}
