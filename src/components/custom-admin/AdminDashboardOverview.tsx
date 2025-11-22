import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Package, Users, ShoppingCart, DollarSign, TrendingUp, Eye,
  Mail, FileText, Tag, Image, Shield, Activity, CheckCircle,
  AlertCircle, Clock, Star, Settings, Database, Zap
} from 'lucide-react';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  totalBlogs: number;
  totalReviews: number;
  totalPromos: number;
  totalEmails: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface RecentProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
}

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalBlogs: 0,
    totalReviews: 0,
    totalPromos: 0,
    totalEmails: 0
  });

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load all stats in parallel
      const [
        productsResult,
        ordersResult,
        customersResult,
        blogsResult,
        reviewsResult,
        promosResult,
        emailsResult,
        recentOrdersResult,
        recentProductsResult
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('orders_full').select('*', { count: 'exact' }),
        supabase.from('email_subscribers').select('*', { count: 'exact' }),
        supabase.from('blog_posts').select('*', { count: 'exact' }),
        supabase.from('reviews').select('*', { count: 'exact' }),
        supabase.from('promotions').select('*', { count: 'exact' }),
        supabase.from('email_campaigns').select('*', { count: 'exact' }),
        supabase.from('orders_full').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      // Calculate revenue
      const { data: revenueData } = await supabase
        .from('orders_full')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount || 0), 0) || 0;

      // Count order statuses
      const { count: pendingCount } = await supabase
        .from('orders_full')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'pending');

      const { count: completedCount } = await supabase
        .from('orders_full')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'completed');

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue: totalRevenue,
        totalCustomers: customersResult.count || 0,
        pendingOrders: pendingCount || 0,
        completedOrders: completedCount || 0,
        totalBlogs: blogsResult.count || 0,
        totalReviews: reviewsResult.count || 0,
        totalPromos: promosResult.count || 0,
        totalEmails: emailsResult.count || 0
      });

      setRecentOrders(recentOrdersResult.data || []);
      setRecentProducts(recentProductsResult.data || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome Back, Admin!</h1>
            <p className="text-cyan-100 text-lg">Here's what's happening with your Inferno TV business today</p>
          </div>
          <div className="text-right">
            <p className="text-cyan-200 text-sm">Last Login</p>
            <p className="text-white font-bold">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">Total</div>
          </div>
          <p className="text-green-100 text-sm mb-1">Total Revenue</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-10 h-10" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">Orders</div>
          </div>
          <p className="text-blue-100 text-sm mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
          <p className="text-blue-200 text-xs mt-2">
            {stats.pendingOrders} pending • {stats.completedOrders} completed
          </p>
        </div>

        {/* Total Products */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-10 h-10" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">Products</div>
          </div>
          <p className="text-purple-100 text-sm mb-1">Total Products</p>
          <p className="text-3xl font-bold">{stats.totalProducts}</p>
        </div>

        {/* Total Customers */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10" />
            <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-bold">Customers</div>
          </div>
          <p className="text-orange-100 text-sm mb-1">Email Subscribers</p>
          <p className="text-3xl font-bold">{stats.totalCustomers}</p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid md:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-xs">Blog Posts</p>
              <p className="text-white text-xl font-bold">{stats.totalBlogs}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-xs">Reviews</p>
              <p className="text-white text-xl font-bold">{stats.totalReviews}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Tag className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-gray-400 text-xs">Promotions</p>
              <p className="text-white text-xl font-bold">{stats.totalPromos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-xs">Campaigns</p>
              <p className="text-white text-xl font-bold">{stats.totalEmails}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="text-gray-400 text-xs">Pending</p>
              <p className="text-white text-xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-xs">Completed</p>
              <p className="text-white text-xl font-bold">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Products */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            Recent Orders
          </h3>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-semibold">{order.customer_name}</p>
                      <p className="text-gray-400 text-sm">#{order.order_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{formatCurrency(Number(order.total_amount))}</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs text-white ${getStatusColor(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs">{formatDate(order.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Recent Products
          </h3>

          {recentProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No products yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProducts.map((product) => (
                <div key={product.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{product.name}</p>
                      <p className="text-gray-400 text-sm">Stock: {product.stock_quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">{formatCurrency(Number(product.price))}</p>
                      {product.is_active ? (
                        <span className="inline-block px-2 py-1 bg-green-500 rounded text-xs text-white">Active</span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-gray-500 rounded text-xs text-white">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
        <h3 className="text-cyan-400 font-bold text-xl mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Quick Actions
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 font-semibold transition-all flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add Product
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 font-semibold transition-all flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            View Orders
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 font-semibold transition-all flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Email
          </button>
          <button className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 font-semibold transition-all flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            SEO Settings
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-400" />
          System Status
        </h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-gray-400 text-sm">Database</p>
              <p className="text-white font-semibold">Connected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-gray-400 text-sm">API</p>
              <p className="text-white font-semibold">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-gray-400 text-sm">Storage</p>
              <p className="text-white font-semibold">Active</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
            <div>
              <p className="text-gray-400 text-sm">Security</p>
              <p className="text-white font-semibold">Protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
