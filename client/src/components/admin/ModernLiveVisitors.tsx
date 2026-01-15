import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiCall } from '@/lib/api';
import { RefreshCw, Activity, Clock, TrendingUp, Globe, Monitor, Smartphone, Tablet } from 'lucide-react';

interface VisitorData {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  onlineNow: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; bot: number };
  countryBreakdown: Array<{ name: string; count: number }>;
  liveVisitors: Array<{
    id: string;
    pageUrl: string;
    country: string | null;
    city: string | null;
    userAgent: string;
    createdAt: string;
  }>;
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
      
      // Try the API endpoint - use fetch directly for better error handling
      const response = await fetch('/api/admin/visitors/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Handle both { data: {...} } and direct data formats
      const visitorData = result.data || result;
      
      if (visitorData && typeof visitorData === 'object') {
        setData({
          totalVisitors: visitorData.totalVisitors || 0,
          todayVisitors: visitorData.todayVisitors || 0,
          weekVisitors: visitorData.weekVisitors || 0,
          monthVisitors: visitorData.monthVisitors || 0,
          onlineNow: visitorData.onlineNow || 0,
          deviceBreakdown: visitorData.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
          countryBreakdown: visitorData.countryBreakdown || visitorData.topCountries || [],
          liveVisitors: visitorData.liveVisitors || visitorData.recentVisitors || [],
        });
        setLastUpdate(new Date());
      } else {
        // If no data, set empty data structure
        setData({
          totalVisitors: 0,
          todayVisitors: 0,
          weekVisitors: 0,
          monthVisitors: 0,
          onlineNow: 0,
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
          countryBreakdown: [],
          liveVisitors: [],
        });
      }
    } catch (err: any) {
      console.error('Error fetching visitor data:', err);
      setError(err.message || 'Failed to load visitor data. Tracking may still be working.');
      // Always set empty data so component still shows
      setData({
        totalVisitors: 0,
        todayVisitors: 0,
        weekVisitors: 0,
        monthVisitors: 0,
        onlineNow: 0,
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
        countryBreakdown: [],
        liveVisitors: [],
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

  // Always show the component, even if loading or no data
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchVisitorData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-500 bg-red-500/10">
          <CardContent className="pt-6">
            <p className="text-red-400">⚠️ {error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Check browser console for details. Visitor tracking may still be working.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Online Now</CardTitle>
                <Activity className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{data.onlineNow}</div>
                <p className="text-xs text-muted-foreground">Active in last 5 minutes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.todayVisitors}</div>
                <p className="text-xs text-muted-foreground">Visitors today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.weekVisitors}</div>
                <p className="text-xs text-muted-foreground">{data.monthVisitors} this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Globe className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalVisitors}</div>
                <p className="text-xs text-muted-foreground">All time visitors</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      <span>Desktop</span>
                    </div>
                    <span className="font-bold">{data.deviceBreakdown.desktop}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile</span>
                    </div>
                    <span className="font-bold">{data.deviceBreakdown.mobile}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4" />
                      <span>Tablet</span>
                    </div>
                    <span className="font-bold">{data.deviceBreakdown.tablet}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Countries</CardTitle>
              </CardHeader>
              <CardContent>
                {data.countryBreakdown.length > 0 ? (
                  <div className="space-y-2">
                    {data.countryBreakdown.slice(0, 5).map((country, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span>{country.name || 'Unknown'}</span>
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

          {data.liveVisitors && data.liveVisitors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Live Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.liveVisitors.slice(0, 10).map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between text-sm border-b pb-2">
                      <div className="flex-1 truncate">
                        <p className="font-medium truncate">{visitor.pageUrl}</p>
                        <p className="text-xs text-muted-foreground">
                          {visitor.country || 'Unknown'} • {new Date(visitor.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No visitor data available. Visitors will appear here as they browse your site.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
