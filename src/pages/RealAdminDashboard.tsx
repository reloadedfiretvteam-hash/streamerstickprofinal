import { useState, useEffect } from 'react';
import {
  Home, Package, FileText, Users, ShoppingCart, BarChart3,
  Settings, Eye, Layout, LogOut, Mail, Tag, TrendingUp, Globe, Video, Zap, Github, Shield, Activity
} from 'lucide-react';

// Import real managers that connect to database
import RealProductManager from '../components/custom-admin/RealProductManager';
import RealBlogManager from '../components/custom-admin/RealBlogManager';
import FrontendVisualEditor from '../components/custom-admin/FrontendVisualEditor';
import CompleteSEOManager from '../components/custom-admin/CompleteSEOManager';
import RankMathProSEOManager from '../components/custom-admin/RankMathProSEOManager';
// StripeProductManager removed - we use real_products table with cloaked_name column, not separate stripe_products table
// import StripeProductManager from '../components/custom-admin/StripeProductManager';
import RealAIVideoGenerator from '../components/custom-admin/RealAIVideoGenerator';
import AmazonFireStickAutomation from '../components/custom-admin/AmazonFireStickAutomation';
import SuperAICopilot from '../components/custom-admin/SuperAICopilot';
import GitHubCloudflareConfig from '../components/custom-admin/GitHubCloudflareConfig';
import OrdersCustomersManager from '../components/custom-admin/OrdersCustomersManager';
import AdvancedAnalytics from '../components/custom-admin/AdvancedAnalytics';
import CategoryManager from '../components/custom-admin/CategoryManager';
import BulkEmailManager from '../components/custom-admin/BulkEmailManager';
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import ProductMappingManager from '../components/custom-admin/ProductMappingManager';
import SystemHealthCheck from '../components/custom-admin/SystemHealthCheck';
import LiveVisitorStatistics from '../components/custom-admin/LiveVisitorStatistics';

export default function RealAdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('custom_admin_token');
    const user = localStorage.getItem('custom_admin_user');

    if (!token || token !== 'authenticated') {
      window.location.href = '/custom-admin';
      return;
    }

    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('custom_admin_token');
    localStorage.removeItem('custom_admin_user');
    window.location.href = '/custom-admin';
  };

  // Menu items with REAL functionality
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'bg-blue-500' },
    { id: 'system-health', label: '🏥 System Health Check', icon: Activity, color: 'bg-green-600' },
    { id: 'product-mapping', label: '🛡️ Stripe Product Mapping', icon: Shield, color: 'bg-purple-600' },
    { id: 'homepage-editor', label: 'HOMEPAGE EDITOR (Click & Edit)', icon: Layout, color: 'bg-purple-500' },
    { id: 'products', label: 'PRODUCTS (Manage All Products)', icon: Package, color: 'bg-green-500' },
    // 'stripe-products' menu removed - we use real_products table with cloaked_name column
    { id: 'ai-video-generator', label: '🎬 AI VIDEO GENERATOR (TikTok/YouTube)', icon: Video, color: 'bg-pink-600' },
    { id: 'amazon-automation', label: '⚡ Amazon Fire Stick Automation', icon: Zap, color: 'bg-orange-600' },
    { id: 'blog', label: 'BLOG POSTS (With SEO Scores)', icon: FileText, color: 'bg-orange-500' },
    { id: 'seo-settings', label: 'SEO Settings & Google', icon: Globe, color: 'bg-cyan-500' },
    { id: 'seo-manager', label: 'SEO Content Manager', icon: TrendingUp, color: 'bg-teal-500' },
    { id: 'orders', label: 'Orders & Customers', icon: ShoppingCart, color: 'bg-red-500' },
    { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3, color: 'bg-indigo-500' },
    { id: 'categories', label: 'Categories & Tags', icon: Tag, color: 'bg-yellow-500' },
    { id: 'emails', label: 'Email Campaigns', icon: Mail, color: 'bg-pink-500' },
    { id: 'github-cloudflare', label: '🔧 GitHub & Cloudflare Config', icon: Github, color: 'bg-slate-600' },
    { id: 'settings', label: 'Site Settings', icon: Settings, color: 'bg-gray-500' },
  ];

  // Render active view as FULL PAGE
  const renderView = () => {
    switch (activeView) {
      case 'system-health':
        return <SystemHealthCheck />;
      case 'product-mapping':
        return <ProductMappingManager />;
      case 'homepage-editor':
        return <FrontendVisualEditor />;
      case 'products':
        return <RealProductManager />;
      // 'stripe-products' case removed - using real_products with cloaked_name instead
      case 'ai-video-generator':
        return <RealAIVideoGenerator />;
      case 'amazon-automation':
        return <AmazonFireStickAutomation />;
      case 'blog':
        return <RealBlogManager />;
      case 'seo-settings':
        return <CompleteSEOManager />;
      case 'seo-manager':
        return <RankMathProSEOManager />;
      case 'orders':
        return <OrdersCustomersManager />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'categories':
        return <CategoryManager />;
      case 'emails':
        return <BulkEmailManager />;
      case 'github-cloudflare':
        return <GitHubCloudflareConfig />;
      case 'settings':
        return <SiteSettingsManager />;
      default:
        return <DashboardOverview setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Inferno TV</p>
        </div>

        {/* User Info */}
        {adminUser && (
          <div className="px-6 py-4 bg-gray-800 border-b border-gray-700">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="font-semibold">{adminUser.username}</p>
          </div>
        )}

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeView === item.id
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <div className={`p-2 rounded ${activeView === item.id ? item.color : 'bg-gray-700'}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all"
          >
            <Eye className="w-5 h-5" />
            <span className="font-medium">View Website</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content - FULL PAGE VIEW */}
      <div className="flex-1 overflow-auto">
        {renderView()}
      </div>

      {/* Super AI Copilot - Floating Assistant */}
      <SuperAICopilot onNavigate={setActiveView} currentView={activeView} />
    </div>
  );
}

// Dashboard Overview
function DashboardOverview({ setActiveView }: { setActiveView: (view: string) => void }) {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Load real stats from database
    const { supabase } = await import('../lib/supabase');

    const [productsRes, ordersRes] = await Promise.all([
      supabase.from('real_products').select('id', { count: 'exact' }),
      supabase.from('customer_orders').select('total', { count: 'exact' })
    ]);

    const revenue = ordersRes.data?.reduce((sum, order) =>
      sum + parseFloat(order.total || '0'), 0) || 0;

    setStats({
      products: productsRes.count || 0,
      orders: ordersRes.count || 0,
      customers: ordersRes.count || 0, // Approximate
      revenue: revenue
    });
  };

  const quickActions = [
    { label: 'Edit Homepage', view: 'homepage-editor', icon: Layout, color: 'purple' },
    { label: 'Manage Products', view: 'products', icon: Package, color: 'green' },
    { label: 'Write Blog Post', view: 'blog', icon: FileText, color: 'orange' },
    { label: 'View Orders', view: 'orders', icon: ShoppingCart, color: 'red' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.products}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Total Products</h3>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.orders}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Total Orders</h3>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.customers}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Customers</h3>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">${stats.revenue.toFixed(2)}</span>
          </div>
          <h3 className="text-gray-600 font-semibold">Total Revenue</h3>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.view}
                onClick={() => setActiveView(action.view)}
                className={`bg-white hover:shadow-xl transition-all rounded-xl shadow-md p-6 text-left border-2 border-transparent hover:border-${action.color}-500`}
              >
                <div className={`p-3 bg-${action.color}-100 rounded-lg w-fit mb-4`}>
                  <Icon className={`w-6 h-6 text-${action.color}-600`} />
                </div>
                <h3 className="font-bold text-gray-900">{action.label}</h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Visitor Statistics */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Visitor Statistics</h2>
        <LiveVisitorStatistics />
      </div>
    </div>
  );
}
