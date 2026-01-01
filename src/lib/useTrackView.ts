import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return uuidv4();
  const key = 'analytics_session_id';
  let existing = window.localStorage.getItem(key);
  if (!existing) {
    existing = uuidv4();
    window.localStorage.setItem(key, existing);
  }
  return existing;
}

export function useTrackView(country?: string) {
  useEffect(() => {
    const sessionId = getOrCreateSessionId();
    const path = window.location.pathname;

    async function send(path: string) {
      try {
        await fetch('/api/track-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, sessionId, country })
        });
      } catch (e) {
        // swallow errors for analytics
        console.error('track-view failed', e);
      }
    }

    // initial load
    if (path) {
      send(path);
    }

    // on route change (for client-side routing)
    const handlePopState = () => {
      send(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    
    // Also track on hashchange if using hash routing
    const handleHashChange = () => {
      send(window.location.pathname);
    };
    
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [country]);
}

