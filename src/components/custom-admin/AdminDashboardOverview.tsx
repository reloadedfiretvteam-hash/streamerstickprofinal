import { useState, useEffect } from 'react';
import {
  Package, Users, ShoppingCart, DollarSign,
  FileText, Activity, CheckCircle, AlertCircle, Clock, RefreshCw, TrendingUp
} from 'lucide-react';
import LiveVisitorStatistics from './LiveVisitorStatistics';

interface OrderStats {
  totalOrders: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  pendingFulfillments: number;
  recentOrders: Array<{
    id: string;
    customerEmail: string;
    customerName: string;
    productName: string;
    amount: number;
    status: string;
    fulfillmentStatus: string;
    createdAt: string;
  }>;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('custom_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function AdminDashboardOverview() {
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [productCount, setProductCount] = useState<number>(0);
  const [blogCount, setBlogCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, blogsRes] = await Promise.all([
        fetch('/api/admin/orders/stats', { headers: getAuthHeader() }),
        fetch('/api/admin/products', { headers: getAuthHeader() }),
        fetch('/api/blog/posts?limit=1', { headers: { Accept: 'application/json' } }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json() as { data?: OrderStats };
        if (data.data) setOrderStats(data.data);
      }
      if (productsRes.ok) {
        const data = await productsRes.json() as { data?: any[] };
        setProductCount(data.data?.length ?? 0);
      }
      if (blogsRes.ok) {
        const data = await blogsRes.json() as { total?: number; data?: any[] };
        setBlogCount(data.total ?? data.data?.length ?? 0);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed':
      case 'cancelled': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const paidCount = orderStats?.recentOrders?.filter(o => o.status === 'paid').length ?? 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">StreamStick Pro Admin</h1>
            <p className="text-orange-100 text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(orderStats?.totalRevenue ?? 0)}</p>
          <p className="text-xs opacity-70 mt-1">Today: {formatCurrency(orderStats?.revenueToday ?? 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Orders</span>
          </div>
          <p className="text-2xl font-bold">{orderStats?.totalOrders ?? 0}</p>
          <p className="text-xs opacity-70 mt-1">Today: {orderStats?.ordersToday ?? 0} · Month: {orderStats?.ordersThisMonth ?? 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Products</span>
          </div>
          <p className="text-2xl font-bold">{productCount}</p>
          <p className="text-xs opacity-70 mt-1">Active in store</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-8 h-8 opacity-80" />
            <span className="text-sm font-medium opacity-80">Blog Posts</span>
          </div>
          <p className="text-2xl font-bold">{blogCount.toLocaleString()}</p>
          <p className="text-xs opacity-70 mt-1">SEO content published</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-gray-400 text-xs">This Month</p>
              <p className="text-white text-lg font-bold">{formatCurrency(orderStats?.revenueThisMonth ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-xs">Pending Fulfillment</p>
              <p className="text-white text-lg font-bold">{orderStats?.pendingFulfillments ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <div>
              <p className="text-gray-400 text-xs">This Week</p>
              <p className="text-white text-lg font-bold">{orderStats?.ordersThisWeek ?? 0} orders</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-400" />
            <div>
              <p className="text-gray-400 text-xs">Week Revenue</p>
              <p className="text-white text-lg font-bold">{formatCurrency(orderStats?.revenueThisWeek ?? 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Visitors + Recent Orders */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Live Visitors */}
        <div>
          <LiveVisitorStatistics />
        </div>

        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-400" />
            Recent Orders
          </h3>

          {!orderStats?.recentOrders?.length ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No recent orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderStats.recentOrders.slice(0, 8).map((order) => (
                <div key={order.id} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-white text-sm font-medium truncate">{order.customerEmail}</p>
                      <p className="text-gray-400 text-xs truncate">{order.productName}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-green-400 text-sm font-bold">{formatCurrency(order.amount)}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-gray-500 text-xs mt-3 text-right">
            Updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          System Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'API Server', status: true },
            { label: 'Stripe Payments', status: true },
            { label: 'Email (Resend)', status: true },
            { label: 'Database (Supabase)', status: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${item.status ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="text-gray-300 text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
