import { useState, useEffect } from 'react';
import {
  Home, Package, FileText, ShoppingCart, Settings, LogOut,
  TrendingUp, HelpCircle, Image, DollarSign, CreditCard, Flame, Search, ImageIcon
} from 'lucide-react';

import RealProductManager from '../components/custom-admin/RealProductManager';
import EnhancedBlogManager from '../components/custom-admin/EnhancedBlogManager';
import OrdersCustomersManager from '../components/custom-admin/OrdersCustomersManager';
import EnhancedPromotionsManager from '../components/custom-admin/EnhancedPromotionsManager';
import MathRankSEODashboard from '../components/custom-admin/MathRankSEODashboard';
import EnhancedMediaLibrary from '../components/custom-admin/EnhancedMediaLibrary';
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import BitcoinOrdersManager from '../components/custom-admin/BitcoinOrdersManager';
import FAQManager from '../components/custom-admin/FAQManager';
import CarouselManager from '../components/custom-admin/CarouselManager';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalBlogPosts: number;
  recentOrders: { id: string; order_number: string; total: number; created_at: string }[];
  bitcoinOrders: number;
}

export default function StreamlinedAdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [adminUser, setAdminUser] = useState<{email: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalBlogPosts: 0,
    recentOrders: [],
    bitcoinOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');

    if (!token || token !== 'authenticated') {
      window.location.href = '/admin';
      return;
    }

    if (user) {
      setAdminUser(JSON.parse(user));
    }

    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get products count
      const { count: productsCount } = await supabase
        .from('real_products')
        .select('*', { count: 'exact', head: true });

      // Get blog posts count
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      // Get orders count and total
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, customer_email')
        .order('created_at', { ascending: false })
        .limit(5);

      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      // Get bitcoin orders count
      const { count: bitcoinCount } = await supabase
        .from('bitcoin_orders')
        .select('*', { count: 'exact', head: true });

      // Calculate total revenue
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total_amount');

      const totalRevenue = allOrders?.reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || '0');
      }, 0) || 0;

      setStats({
        totalOrders: ordersCount || 0,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalBlogPosts: blogCount || 0,
        recentOrders: orders || [],
        bitcoinOrders: bitcoinCount || 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'blue' },
    { id: 'products', label: 'Products', icon: Package, color: 'green', badge: stats.totalProducts },
    { id: 'blog', label: 'Blog Posts', icon: FileText, color: 'purple', badge: stats.totalBlogPosts },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'orange', badge: stats.totalOrders },
    { id: 'bitcoin-orders', label: 'Bitcoin Orders', icon: CreditCard, color: 'yellow', badge: stats.bitcoinOrders },
    { id: 'carousel', label: 'Carousel', icon: ImageIcon, color: 'teal' },
    { id: 'promotions', label: 'Promotions', icon: DollarSign, color: 'red' },
    { id: 'seo', label: 'SEO Manager', icon: TrendingUp, color: 'cyan' },
    { id: 'media', label: 'Media Library', icon: Image, color: 'pink' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, color: 'indigo' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'gray' },
  ];

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {adminUser?.email}!</h1>
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalOrders}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalProducts}</span>
            </div>
            <p className="text-gray-600 text-sm">Products</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.totalBlogPosts}</span>
            </div>
            <p className="text-gray-600 text-sm">Blog Posts</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          {stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{order.id.substring(0, 8)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{order.customer_email}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">${parseFloat(order.total_amount).toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <button
            onClick={() => setActiveView('products')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-left hover:shadow-lg transition-all"
          >
            <Package className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Manage Products</h3>
            <p className="text-blue-100 text-sm">Add, edit, or remove products</p>
          </button>

          <button
            onClick={() => setActiveView('blog')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 text-left hover:shadow-lg transition-all"
          >
            <FileText className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">Manage Blog</h3>
            <p className="text-purple-100 text-sm">View and edit {stats.totalBlogPosts} posts</p>
          </button>

          <button
            onClick={() => setActiveView('orders')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 text-left hover:shadow-lg transition-all"
          >
            <ShoppingCart className="w-8 h-8 mb-3" />
            <h3 className="text-lg font-semibold mb-1">View Orders</h3>
            <p className="text-orange-100 text-sm">Manage customer orders</p>
          </button>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return <RealProductManager />;
      case 'blog':
        return <EnhancedBlogManager />;
      case 'orders':
        return <OrdersCustomersManager />;
      case 'bitcoin-orders':
        return <BitcoinOrdersManager />;
      case 'promotions':
        return <EnhancedPromotionsManager />;
      case 'seo':
        return <MathRankSEODashboard />;
      case 'media':
        return <EnhancedMediaLibrary />;
      case 'carousel':
        return <CarouselManager />;
      case 'faq':
        return <FAQManager />;
      case 'settings':
        return <SiteSettingsManager />;
      default:
        return renderDashboard();
    }
  };

  const filteredMenuItems = searchQuery
    ? menuItems.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-10 h-10 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">Stream Stick Pro</h1>
              <p className="text-xs text-gray-400">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {adminUser && (
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="font-semibold text-sm truncate">{adminUser.email}</p>
          </div>
        )}

        {/* Search */}
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-6 py-3 transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 text-left font-medium">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white text-orange-500' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {renderView()}
      </div>
    </div>
  );
}
