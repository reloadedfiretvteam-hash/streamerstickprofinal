import { useState, useEffect } from 'react';
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
  Activity,
  Users
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

export default function LiveVisitorStatistics() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchVisitorData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/visitors/stats');
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        console.error('Failed to fetch visitor stats:', response.status, errorData);
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
        });
        return;
      }
      
      const result = await response.json();
      
      if (result.data) {
        setData(result.data);
        setLastUpdate(new Date());
      } else {
        console.warn('No data in visitor stats response:', result);
      }
    } catch (error: any) {
      console.error('Error fetching visitor data:', error);
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

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8 text-gray-500">No visitor data available</div>;
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
          <h2 className="text-2xl font-bold text-gray-900">Live Visitor Analytics</h2>
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
          <button 
            onClick={fetchVisitorData}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Online Now</h3>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">{data.onlineNow}</div>
          <p className="text-xs text-gray-500 mt-1">Active in last 5 minutes</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Today</h3>
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{data.todayVisitors}</div>
          <p className="text-xs text-gray-500 mt-1">
            {data.weekVisitors > 0 ? `+${((data.todayVisitors / data.weekVisitors) * 100).toFixed(0)}% vs weekly avg` : 'No weekly data'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">This Week</h3>
            <TrendingUp className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">{data.weekVisitors}</div>
          <p className="text-xs text-gray-500 mt-1">{data.monthVisitors} this month</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Total</h3>
            <Globe className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold">{data.totalVisitors.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">All-time visitors</p>
        </div>
      </div>

      {/* Tabs for different views */}
      <div className="space-y-4">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button className="border-b-2 border-orange-500 py-2 px-1 text-sm font-medium text-gray-900">
              Live Visitors
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Devices
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Locations
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Pages
            </button>
          </nav>
        </div>

        {/* Live Visitors */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Visitors ({data.liveVisitors.length})</h3>
          <p className="text-sm text-gray-500 mb-4">Visitors active in the last 5 minutes</p>
          {data.liveVisitors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active visitors at the moment
            </div>
          ) : (
            <div className="space-y-3">
              {data.liveVisitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                    <div>
                      <div className="font-medium text-sm text-gray-900">
                        {visitor.city || visitor.region || visitor.country || 'Unknown Location'}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[300px]">
                        {visitor.pageUrl}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 border border-gray-200 px-2 py-1 rounded">
                      {new Date(visitor.createdAt).toLocaleTimeString()}
                    </span>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Devices */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Desktop
            </h3>
            <div className="text-3xl font-bold">{data.deviceBreakdown.desktop}</div>
            <div className="text-sm text-gray-500 mt-1">{devicePercentages.desktop}% of traffic</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${devicePercentages.desktop}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Mobile
            </h3>
            <div className="text-3xl font-bold">{data.deviceBreakdown.mobile}</div>
            <div className="text-sm text-gray-500 mt-1">{devicePercentages.mobile}% of traffic</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${devicePercentages.mobile}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              Tablet
            </h3>
            <div className="text-3xl font-bold">{data.deviceBreakdown.tablet}</div>
            <div className="text-sm text-gray-500 mt-1">{devicePercentages.tablet}% of traffic</div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${devicePercentages.tablet}%` }}
              />
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </h3>
            <div className="space-y-2">
              {data.countryBreakdown.slice(0, 10).map((country, idx) => (
                <div key={country.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700">{country.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{country.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Regions
            </h3>
            <div className="space-y-2">
              {data.regionBreakdown.slice(0, 10).map((region, idx) => (
                <div key={region.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{region.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{region.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Cities
            </h3>
            <div className="space-y-2">
              {data.cityBreakdown.slice(0, 10).map((city, idx) => (
                <div key={city.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-gray-700 truncate">{city.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{city.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pages */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Visited Pages</h3>
          <div className="space-y-2">
            {data.pageBreakdown.map((page, idx) => (
              <div key={page.name} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="border border-gray-300 px-2 py-1 rounded text-xs">{idx + 1}</span>
                  <span className="text-sm font-mono text-gray-700">{page.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">{page.count} visits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
