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

        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTracking.ts:24',message:'About to track page view',data:{sessionId,pageUrl:currentPath},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'A'})}).catch(()=>{});
        }
        // #endregion

        const response = await apiCall('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            pageUrl: currentPath,
            referrer,
            userAgent,
          }),
        });

        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTracking.ts:40',message:'Track API call completed',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'B'})}).catch(()=>{});
        }
        // #endregion
      } catch (error: any) {
        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useTracking.ts:46',message:'Track API call failed',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-track-debug',hypothesisId:'C'})}).catch(()=>{});
        }
        // #endregion
        console.warn('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location]);
}
