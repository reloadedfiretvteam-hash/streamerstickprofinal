import { useState, useEffect } from 'react';
import { Users, Eye, Globe, Clock, TrendingUp, MapPin, Monitor, Smartphone, Tablet, Activity } from 'lucide-react';

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  onlineNow: number;
  topCountries: Array<{ country: string; count: number }>;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  recentVisitors: Array<{
    id: string;
    page_url: string;
    referrer: string | null;
    user_agent: string;
    created_at: string;
  }>;
}

export default function LiveVisitorStatistics() {
  const [stats, setStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    weekVisitors: 0,
    monthVisitors: 0,
    onlineNow: 0,
    topCountries: [],
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    recentVisitors: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadStats();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      loadStats();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Use the original working endpoint - /api/admin/visitors/stats
      // This is the Express server route that was working 6 days ago
      console.log('[LiveVisitorStatistics] Fetching stats from /api/admin/visitors/stats');
      const response = await fetch('/api/admin/visitors/stats');
      
      console.log('[LiveVisitorStatistics] Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[LiveVisitorStatistics] Response error:', response.status, errorText);
        throw new Error(`Failed to fetch visitor stats: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('[LiveVisitorStatistics] Received data:', result);
      
      if (!result.data) {
        console.error('[LiveVisitorStatistics] No data in response:', result);
        throw new Error('No data returned from API');
      }

      const apiData = result.data;
      
      // Calculate device breakdown from recent visitors
      const deviceBreakdown = {
        desktop: (apiData.recentVisitors || []).filter((v: any) => {
          const ua = (v.userAgent || '').toLowerCase();
          return !ua.includes('mobile') && !ua.includes('tablet');
        }).length,
        mobile: (apiData.recentVisitors || []).filter((v: any) => {
          const ua = (v.userAgent || '').toLowerCase();
          return ua.includes('mobile') && !ua.includes('tablet');
        }).length,
        tablet: (apiData.recentVisitors || []).filter((v: any) => {
          const ua = (v.userAgent || '').toLowerCase();
          return ua.includes('tablet');
        }).length
      };

      // Map top countries from API data 
      // Original server/geoLocationService.ts returns {name, count} format
      // Component expects {country, count} format
      const topCountries = (apiData.topCountries || apiData.countryBreakdown || []).map((c: any) => ({
        country: c.country || c.name || 'Unknown',
        count: c.count || 0
      })).slice(0, 5);

      // Map recent visitors from API data
      // Drizzle returns camelCase (pageUrl, userAgent, createdAt)
      // Component expects snake_case (page_url, user_agent, created_at)
      const recentVisitors = (apiData.recentVisitors || []).slice(0, 10).map((v: any) => {
        // Handle createdAt - Drizzle may return Date object or string
        let createdAtStr: string;
        if (v.createdAt) {
          createdAtStr = v.createdAt instanceof Date 
            ? v.createdAt.toISOString() 
            : (typeof v.createdAt === 'string' ? v.createdAt : new Date().toISOString());
        } else if (v.created_at) {
          createdAtStr = typeof v.created_at === 'string' ? v.created_at : new Date().toISOString();
        } else {
          createdAtStr = new Date().toISOString();
        }
        
        return {
          id: v.id || 'unknown',
          page_url: v.pageUrl || v.page_url || '/',
          referrer: v.referrer || null,
          user_agent: v.userAgent || v.user_agent || 'Unknown',
          created_at: createdAtStr
        };
      });

      setStats({
        totalVisitors: apiData.totalVisitors || 0,
        todayVisitors: apiData.todayVisitors || 0,
        weekVisitors: apiData.weekVisitors || 0,
        monthVisitors: apiData.monthVisitors || 0,
        onlineNow: apiData.onlineNow || 0,
        topCountries,
        deviceBreakdown,
        recentVisitors
      });
      console.log('[LiveVisitorStatistics] Stats updated successfully');
    } catch (error: any) {
      console.error('[LiveVisitorStatistics] Error loading visitor statistics:', error);
      console.error('[LiveVisitorStatistics] Error details:', error.message, error.stack);
      // Set empty stats on error instead of keeping old data
      setStats({
        totalVisitors: 0,
        todayVisitors: 0,
        weekVisitors: 0,
        monthVisitors: 0,
        onlineNow: 0,
        topCountries: [],
        deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
        recentVisitors: []
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (ua.includes('tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  if (loading && stats.totalVisitors === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-500" />
            Live Visitor Statistics
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refreshes every 30 seconds
          </p>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh Now
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</span>
          </div>
          <p className="text-blue-100 text-sm">Total Visitors</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.todayVisitors.toLocaleString()}</span>
          </div>
          <p className="text-green-100 text-sm">Today</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.weekVisitors.toLocaleString()}</span>
          </div>
          <p className="text-purple-100 text-sm">This Week</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.onlineNow.toLocaleString()}</span>
          </div>
          <p className="text-orange-100 text-sm">Online Now</p>
        </div>
      </div>

      {/* Device Breakdown & Top Countries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-orange-500" />
            Device Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Desktop</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.deviceBreakdown.desktop}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Mobile</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.deviceBreakdown.mobile}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Tablet</span>
              </div>
              <span className="font-semibold text-gray-900">{stats.deviceBreakdown.tablet}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-500" />
            Top Countries
          </h3>
          <div className="space-y-3">
            {stats.topCountries.length > 0 ? (
              stats.topCountries.map((country, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{country.country}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{country.count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No country data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Visitors */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          Recent Visitors
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Device</th>
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Page</th>
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Referrer</th>
                <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentVisitors.length > 0 ? (
                stats.recentVisitors.map((visitor, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getDeviceIcon(visitor.user_agent)}
                        <span className="text-sm">{visitor.user_agent.substring(0, 30)}...</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-700">{visitor.page_url.substring(0, 40)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">
                        {visitor.referrer ? visitor.referrer.substring(0, 30) : 'Direct'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-500">{formatTime(visitor.created_at)}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No visitors tracked yet. Visitors will appear here as they browse your site.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}





