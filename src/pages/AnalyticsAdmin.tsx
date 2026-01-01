import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type PageView = {
  id: number;
  path: string;
  views: number;
  last_view_at: string;
};

type Visit = {
  id: number;
  session_id: string;
  path: string;
  country: string | null;
  created_at: string;
};

export default function AnalyticsAdmin() {
  const [pages, setPages] = useState<PageView[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      try {
        const { data: pageData, error: pageError } = await supabase
          .from('analytics_page_views')
          .select('*')
          .order('views', { ascending: false })
          .limit(50);

        if (pageError) throw pageError;

        const { data: visitData, error: visitError } = await supabase
          .from('analytics_visits')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (visitError) throw visitError;

        if (pageData) setPages(pageData as PageView[]);
        if (visitData) setVisits(visitData as Visit[]);
        setLoading(false);
      } catch (err: any) {
        console.error('Error loading analytics:', err);
        setError(err.message || 'Failed to load analytics');
        setLoading(false);
      }
    }

    loadInitial();

    // subscribe to page view changes
    const pageChannel = supabase
      .channel('analytics_page_views_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'analytics_page_views' },
        (payload) => {
          setPages((prev) => {
            const newRow = payload.new as PageView;
            const idx = prev.findIndex((p) => p.id === newRow.id);
            if (idx === -1) {
              return [newRow, ...prev].sort((a, b) => b.views - a.views).slice(0, 50);
            }
            const next = [...prev];
            next[idx] = newRow;
            return next.sort((a, b) => b.views - a.views);
          });
        }
      )
      .subscribe();

    // subscribe to individual visit inserts
    const visitChannel = supabase
      .channel('analytics_visits_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analytics_visits' },
        (payload) => {
          const newVisit = payload.new as Visit;
          setVisits((prev) => [newVisit, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(pageChannel);
      supabase.removeChannel(visitChannel);
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Analytics Dashboard</h1>
        <div style={{ background: '#fee', padding: '1rem', borderRadius: '8px', color: '#c33' }}>
          <strong>Error:</strong> {error}
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Make sure Supabase is configured and the analytics tables exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Analytics Dashboard</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Top Pages</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Path</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Views</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Last View</th>
              </tr>
            </thead>
            <tbody>
              {pages.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No page views yet
                  </td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{p.path}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{p.views.toLocaleString()}</td>
                    <td style={{ padding: '12px' }}>{new Date(p.last_view_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1rem' }}>Recent Visits</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Path</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Country</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Session</th>
              </tr>
            </thead>
            <tbody>
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                    No visits yet
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{new Date(v.created_at).toLocaleTimeString()}</td>
                    <td style={{ padding: '12px' }}>{v.path}</td>
                    <td style={{ padding: '12px' }}>{v.country || 'Unknown'}</td>
                    <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {v.session_id.slice(0, 8)}…
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

