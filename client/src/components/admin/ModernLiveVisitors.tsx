import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiCall } from '@/lib/api';
import { 
  Eye, 
  Globe, 
  MapPin, 
  Monitor, 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  TrendingUp,
  Clock,
  ExternalLink,
  Activity
} from 'lucide-react';

interface VisitorData {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  onlineNow: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; bot: number };
  countryBreakdown: Array<{ name: string; count: number }>;
  regionBreakdown: Array<{ name: string; count: number }>;
  cityBreakdown: Array<{ name: string; count: number }>;
  pageBreakdown: Array<{ name: string; count: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  liveVisitors: Array<{
    id: string;
    pageUrl: string;
    country: string | null;
    city: string | null;
    region: string | null;
    userAgent: string;
    createdAt: string;
    referrer: string | null;
  }>;
}

export default function ModernLiveVisitors() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchVisitorData = async () => {
    try {
      setLoading(true);
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:52',message:'Starting to fetch visitor data',data:{endpoint:'/api/admin/visitors/stats'},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'A'})}).catch(()=>{});
      }
      // #endregion
      
      const token = localStorage.getItem('custom_admin_token');
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:59',message:'Token retrieved',data:{hasToken:!!token},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await apiCall('/api/admin/visitors/stats', {
        headers,
      });
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:71',message:'API response received',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        // #region agent log
        console.error('[MODERN_VISITORS] API response error:', { status: response.status, error: errorData });
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:78',message:'API response error',data:{status:response.status,error:errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
        console.error('Failed to fetch visitor stats:', response.status, errorData);
        // Set error state instead of null
        setData({
          totalVisitors: 0,
          todayVisitors: 0,
          weekVisitors: 0,
          onlineNow: 0,
          liveVisitors: [],
          countryBreakdown: [],
          regionBreakdown: [],
          cityBreakdown: [],
          pageBreakdown: [],
          deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
          hourlyDistribution: [],
          monthVisitors: 0,
          error: errorData.error || errorText,
          errorCode: errorData.errorCode,
          errorHint: errorData.errorHint,
        });
        return;
      }
      
      const result = await response.json();
      
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:88',message:'JSON parsed',data:{hasData:!!result.data,hasError:!!result.error,keys:Object.keys(result)},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'E'})}).catch(()=>{});
      }
      // #endregion
      
      if (result.data) {
        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:93',message:'Setting visitor data',data:{totalVisitors:result.data.totalVisitors,todayVisitors:result.data.todayVisitors,onlineNow:result.data.onlineNow},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'F'})}).catch(()=>{});
        }
        // #endregion
        setData(result.data);
        setLastUpdate(new Date());
      } else {
        // #region agent log
        if (typeof fetch !== 'undefined') {
          fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:99',message:'No data in response',data:{result},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'G'})}).catch(()=>{});
        }
        // #endregion
        console.warn('No data in visitor stats response:', result);
      }
    } catch (error: any) {
      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/3ee3ce10-6522-4415-a7f3-6907cd27670d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ModernLiveVisitors.tsx:106',message:'Exception caught',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'visitor-debug',hypothesisId:'H'})}).catch(()=>{});
      }
      // #endregion
      console.error('Error fetching visitor data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitorData();
    
    if (autoRefresh) {
      const interval = setInterval(fetchVisitorData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8 text-muted-foreground">No visitor data available</div>;
  }

  const deviceTotal = data.deviceBreakdown.desktop + data.deviceBreakdown.mobile + data.deviceBreakdown.tablet;
  const devicePercentages = {
    desktop: deviceTotal > 0 ? (data.deviceBreakdown.desktop / deviceTotal * 100).toFixed(1) : '0',
    mobile: deviceTotal > 0 ? (data.deviceBreakdown.mobile / deviceTotal * 100).toFixed(1) : '0',
    tablet: deviceTotal > 0 ? (data.deviceBreakdown.tablet / deviceTotal * 100).toFixed(1) : '0',
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Visitor Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
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
          <Button variant="outline" size="sm" onClick={fetchVisitorData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
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
            <p className="text-xs text-muted-foreground">+{((data.todayVisitors / data.weekVisitors) * 100).toFixed(0)}% vs weekly avg</p>
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
            <div className="text-2xl font-bold">{data.totalVisitors.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live">Live Visitors</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="hours">Hourly Activity</TabsTrigger>
        </TabsList>

        {/* Live Visitors */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live Visitors ({data.liveVisitors.length})</CardTitle>
              <CardDescription>Visitors active in the last 5 minutes</CardDescription>
            </CardHeader>
            <CardContent>
              {data.liveVisitors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active visitors at the moment
                </div>
              ) : (
                <div className="space-y-3">
                  {data.liveVisitors.map((visitor) => (
                    <div
                      key={visitor.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        <div>
                          <div className="font-medium text-sm">
                            {visitor.city || visitor.region || visitor.country || 'Unknown Location'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[300px]">
                            {visitor.pageUrl}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {new Date(visitor.createdAt).toLocaleTimeString()}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Devices */}
        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Desktop
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.deviceBreakdown.desktop}</div>
                <div className="text-sm text-muted-foreground">{devicePercentages.desktop}% of traffic</div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${devicePercentages.desktop}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Mobile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.deviceBreakdown.mobile}</div>
                <div className="text-sm text-muted-foreground">{devicePercentages.mobile}% of traffic</div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${devicePercentages.mobile}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tablet className="h-5 w-5" />
                  Tablet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data.deviceBreakdown.tablet}</div>
                <div className="text-sm text-muted-foreground">{devicePercentages.tablet}% of traffic</div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${devicePercentages.tablet}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Locations */}
        <TabsContent value="locations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Top Countries
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.countryBreakdown.slice(0, 10).map((country, idx) => (
                    <div key={country.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm">{country.name}</span>
                      </div>
                      <span className="text-sm font-medium">{country.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Regions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.regionBreakdown.slice(0, 10).map((region, idx) => (
                    <div key={region.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm truncate">{region.name}</span>
                      </div>
                      <span className="text-sm font-medium">{region.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Cities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.cityBreakdown.slice(0, 10).map((city, idx) => (
                    <div key={city.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                          {idx + 1}
                        </Badge>
                        <span className="text-sm truncate">{city.name}</span>
                      </div>
                      <span className="text-sm font-medium">{city.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Visited Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.pageBreakdown.map((page, idx) => (
                  <div key={page.name} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <span className="text-sm font-mono">{page.name}</span>
                    </div>
                    <Badge>{page.count} visits</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hourly Activity */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visitor Activity by Hour (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.hourlyDistribution.map(({ hour, count }) => {
                  const maxCount = Math.max(...data.hourlyDistribution.map(h => h.count));
                  const percentage = maxCount > 0 ? (count / maxCount * 100) : 0;
                  
                  return (
                    <div key={hour} className="flex items-center gap-3">
                      <div className="w-12 text-sm text-muted-foreground">
                        {hour.toString().padStart(2, '0')}:00
                      </div>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{count}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
