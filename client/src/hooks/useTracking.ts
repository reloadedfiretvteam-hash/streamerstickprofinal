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
    
    if (lastTrackedPath.current === currentPath) {
      console.log('[FRONTEND_TRACK] Skipping duplicate path:', currentPath);
      return;
    }
    lastTrackedPath.current = currentPath;

    console.log('[FRONTEND_TRACK] Starting tracking for path:', currentPath);

    const trackPageView = async () => {
      try {
        const sessionId = getSessionId();
        const referrer = document.referrer || null;
        const userAgent = navigator.userAgent;
        const fullUrl = window.location.href;

        // #region agent log
        console.log('[FRONTEND_TRACK] About to track page view', { sessionId, currentPath, fullUrl });
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTracking.ts:26',message:'About to track page view',data:{sessionId,pageUrl:currentPath,fullUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion

        const response = await apiCall('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: fullUrl, // Use full URL instead of just path
            referrer,
            userAgent,
          }),
        });

        // #region agent log
        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = { raw: responseText };
        }
        console.log('[FRONTEND_TRACK] Track API response', { status: response.status, ok: response.ok, data: responseData });
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTracking.ts:44',message:'Track API call completed',data:{ok:response.ok,status:response.status,responseData},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion

        if (!response.ok) {
          throw new Error(`Tracking failed: ${response.status} ${responseData.error || responseText}`);
        }
      } catch (error: any) {
        // #region agent log
        console.error('[FRONTEND_TRACK] Track API call failed', error);
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTracking.ts:54',message:'Track API call failed',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
        console.warn('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location]);
}
