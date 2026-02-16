import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity, Clock, TrendingUp, Globe, Monitor, Smartphone, Tablet, Bot, MapPin, Eye } from 'lucide-react';

interface VisitorData {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  yesterdayVisitors: number;
  onlineNow: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; bot: number };
  countryBreakdown: Array<{ name: string; count: number }>;
  liveVisitors: Array<{
    id: string;
    pageUrl: string;
    country: string | null;
    city: string | null;
    state: string | null;
    userAgent: string;
    lastVisit: string | null;
    createdAt: string;
    pagesViewed: string[];
    isBot: boolean;
  }>;
}

function deviceIcon(ua: string) {
  const l = (ua || '').toLowerCase();
  if (/bot|crawl|spider/i.test(l)) return <Bot className="h-4 w-4 text-gray-400" />;
  if (/ipad|tablet|kindle|playbook|silk/i.test(l)) return <Tablet className="h-4 w-4 text-purple-500" />;
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(l)) return <Smartphone className="h-4 w-4 text-blue-500" />;
  return <Monitor className="h-4 w-4 text-green-500" />;
}

function deviceLabel(ua: string) {
  const l = (ua || '').toLowerCase();
  if (/bot|crawl|spider/i.test(l)) return 'Bot';
  if (/ipad|tablet|kindle|playbook|silk/i.test(l)) return 'Tablet';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(l)) return 'Mobile';
  return 'Desktop';
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function locationStr(v: { city?: string | null; state?: string | null; country?: string | null }): string {
  const parts: string[] = [];
  if (v.city) parts.push(v.city);
  if (v.state && v.state !== v.city) parts.push(v.state);
  if (v.country) parts.push(v.country);
  return parts.join(', ') || 'Unknown';
}

export default function ModernLiveVisitors() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchVisitorData = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch('/api/admin/visitors/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try { errorData = JSON.parse(errorText); } catch { errorData = { error: errorText }; }
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      const v = result.data || result;

      if (v && typeof v === 'object') {
        setData({
          totalVisitors: v.totalVisitors || 0,
          todayVisitors: v.todayVisitors || 0,
          yesterdayVisitors: v.yesterdayVisitors || 0,
          weekVisitors: v.weekVisitors || 0,
          monthVisitors: v.monthVisitors || 0,
          onlineNow: v.onlineNow || 0,
          deviceBreakdown: v.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
          countryBreakdown: v.countryBreakdown || v.topCountries || [],
          liveVisitors: v.liveVisitors || v.recentVisitors || [],
        });
        setLastUpdate(new Date());
      } else {
        setData({
          totalVisitors: 0, todayVisitors: 0, yesterdayVisitors: 0,
          weekVisitors: 0, monthVisitors: 0, onlineNow: 0,
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
          countryBreakdown: [], liveVisitors: [],
        });
      }
    } catch (err: any) {
      console.error('Error fetching visitor data:', err);
      setError(err.message || 'Failed to load visitor data.');
      setData({
        totalVisitors: 0, todayVisitors: 0, yesterdayVisitors: 0,
        weekVisitors: 0, monthVisitors: 0, onlineNow: 0,
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
        countryBreakdown: [], liveVisitors: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorData();
    if (autoRefresh) {
      const interval = setInterval(fetchVisitorData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Visitor Analytics</h2>
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `Last updated: ${lastUpdate.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchVisitorData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check browser console for details.
            </p>
          </CardContent>
        </Card>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Online Now</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.onlineNow}</div>
                <p className="text-[10px] text-muted-foreground">last 5 min</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Today</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.todayVisitors}</div>
                <p className="text-[10px] text-muted-foreground">yesterday: {data.yesterdayVisitors}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.weekVisitors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.monthVisitors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">All Time</CardTitle>
                <Globe className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalVisitors}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium">Pages / Visitor</CardTitle>
                <Eye className="h-4 w-4 text-cyan-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.liveVisitors.length > 0
                    ? (data.liveVisitors.reduce((s, v) => s + ((v.pagesViewed || []).length || 1), 0) / data.liveVisitors.length).toFixed(1)
                    : '-'}
                </div>
                <p className="text-[10px] text-muted-foreground">avg recent</p>
              </CardContent>
            </Card>
          </div>

          {/* Device + Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Devices</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { icon: <Monitor className="h-4 w-4" />, label: 'Desktop', val: data.deviceBreakdown.desktop },
                    { icon: <Smartphone className="h-4 w-4" />, label: 'Mobile', val: data.deviceBreakdown.mobile },
                    { icon: <Tablet className="h-4 w-4" />, label: 'Tablet', val: data.deviceBreakdown.tablet },
                    { icon: <Bot className="h-4 w-4" />, label: 'Bot', val: data.deviceBreakdown.bot },
                  ].map((d) => {
                    const total = data.deviceBreakdown.desktop + data.deviceBreakdown.mobile + data.deviceBreakdown.tablet + data.deviceBreakdown.bot || 1;
                    const pct = Math.round((d.val / total) * 100);
                    return (
                      <div key={d.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">{d.icon}<span>{d.label}</span></div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                            <div className="h-full bg-blue-500 rounded" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="font-bold text-sm w-10 text-right">{d.val}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Top Countries</CardTitle></CardHeader>
              <CardContent>
                {data.countryBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {data.countryBreakdown.slice(0, 8).map((country, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{country.name || 'Unknown'}</span>
                        <span className="font-bold">{country.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No country data yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent visitors table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Visitors (unique, non-bot)</CardTitle>
            </CardHeader>
            <CardContent>
              {data.liveVisitors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="pb-2 pr-2">Device</th>
                        <th className="pb-2 pr-2">Page</th>
                        <th className="pb-2 pr-2">Location</th>
                        <th className="pb-2 pr-2">Pages</th>
                        <th className="pb-2">Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.liveVisitors.slice(0, 25).map((v) => (
                        <tr key={v.id} className="border-b border-muted/30 hover:bg-muted/10">
                          <td className="py-2 pr-2">
                            <span className="flex items-center gap-1" title={v.userAgent}>
                              {deviceIcon(v.userAgent)}
                              <span className="text-xs text-muted-foreground">{deviceLabel(v.userAgent)}</span>
                            </span>
                          </td>
                          <td className="py-2 pr-2 max-w-[200px] truncate font-medium" title={v.pageUrl}>
                            {(v.pageUrl || '/').replace(/^https?:\/\/[^/]+/, '')}
                          </td>
                          <td className="py-2 pr-2 text-muted-foreground">
                            {locationStr(v)}
                          </td>
                          <td className="py-2 pr-2 text-center">{(v.pagesViewed || []).length || 1}</td>
                          <td className="py-2 text-muted-foreground whitespace-nowrap">{timeAgo(v.lastVisit || v.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  No visitor data yet. Visitors will appear here as they browse your site.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No visitor data available.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
