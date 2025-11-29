import { useState, useEffect } from 'react';
import {
  Package, FileText, ShoppingCart, Settings, LogOut,
  TrendingUp, HelpCircle, Image, DollarSign, CreditCard, Flame, X,
  Grid, Edit3
} from 'lucide-react';

import EnhancedBlogManager from '../components/custom-admin/EnhancedBlogManager';
import RealProductManager from '../components/custom-admin/RealProductManager';
import OrdersCustomersManager from '../components/custom-admin/OrdersCustomersManager';
import EnhancedPromotionsManager from '../components/custom-admin/EnhancedPromotionsManager';
import MathRankSEODashboard from '../components/custom-admin/MathRankSEODashboard';
import EnhancedMediaLibrary from '../components/custom-admin/EnhancedMediaLibrary';
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import BitcoinOrdersManager from '../components/custom-admin/BitcoinOrdersManager';
import FAQManager from '../components/custom-admin/FAQManager';
import CarouselManager from '../components/custom-admin/CarouselManager';
import { supabase } from '../lib/supabase';

interface ModalTool {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  component: React.ComponentType<any>;
}

export default function ModalAdminDashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{email: string} | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalBlogPosts: 0,
    totalCustomers: 0,
    bitcoinOrders: 0,
    mediaFiles: 0,
    faqItems: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('custom_admin_token');
    const user = localStorage.getItem('custom_admin_user');

    if (!token || token !== 'authenticated') {
      window.location.href = '/';
      return;
    }

    if (user) {
      try {
        setAdminUser(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing admin user:', e);
      }
    }

    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [
        { count: productsCount },
        { count: blogCount },
        { count: ordersCount },
        { count: bitcoinCount },
        { count: mediaCount },
        { data: orders }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('bitcoin_orders').select('*', { count: 'exact', head: true }),
        supabase.from('media_files').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount')
      ]);

      const totalRevenue = orders?.reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || '0');
      }, 0) || 0;

      setStats({
        totalOrders: ordersCount || 0,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalBlogPosts: blogCount || 0,
        totalCustomers: 0,
        bitcoinOrders: bitcoinCount || 0,
        mediaFiles: mediaCount || 0,
        faqItems: 0
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('custom_admin_token');
      localStorage.removeItem('custom_admin_user');
      window.location.href = '/';
    }
  };

  const tools: ModalTool[] = [
    {
      id: 'blog',
      title: 'Blog Posts Manager',
      icon: FileText,
      color: 'from-blue-500 to-purple-600',
      description: 'Manage blog posts with Rank Math Pro SEO scoring, file uploads, and real-time analytics',
      component: EnhancedBlogManager
    },
    {
      id: 'products',
      title: 'Product Manager',
      icon: Package,
      color: 'from-green-500 to-emerald-600',
      description: 'Add, edit, and delete products with pricing, images, and inventory management',
      component: RealProductManager
    },
    {
      id: 'orders',
      title: 'Orders & Customers',
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      description: 'View and manage all orders, track payments, and manage customer data',
      component: OrdersCustomersManager
    },
    {
      id: 'seo',
      title: 'SEO Manager',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      description: 'Optimize meta tags, keywords, sitemaps, and search engine visibility',
      component: MathRankSEODashboard
    },
    {
      id: 'media',
      title: 'Media Library',
      icon: Image,
      color: 'from-pink-500 to-rose-600',
      description: 'Upload, organize, and manage images, videos, and files',
      component: EnhancedMediaLibrary
    },
    {
      id: 'carousel',
      title: 'Homepage Carousel',
      icon: Grid,
      color: 'from-teal-500 to-cyan-600',
      description: 'Manage homepage carousel images and promotional banners',
      component: CarouselManager
    },
    {
      id: 'promotions',
      title: 'Promotions & Discounts',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      description: 'Create and manage discount codes, sales, and promotional campaigns',
      component: EnhancedPromotionsManager
    },
    {
      id: 'bitcoin',
      title: 'Bitcoin Payments',
      icon: CreditCard,
      color: 'from-amber-500 to-yellow-600',
      description: 'Track Bitcoin and cryptocurrency payment orders',
      component: BitcoinOrdersManager
    },
    {
      id: 'faq',
      title: 'FAQ Manager',
      icon: HelpCircle,
      color: 'from-indigo-500 to-purple-600',
      description: 'Add, edit, and organize frequently asked questions',
      component: FAQManager
    },
    {
      id: 'settings',
      title: 'Site Settings',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      description: 'Configure site-wide settings, branding, and integrations',
      component: SiteSettingsManager
    }
  ];

  const getStatForTool = (toolId: string) => {
    switch (toolId) {
      case 'blog': return stats.totalBlogPosts;
      case 'products': return stats.totalProducts;
      case 'orders': return stats.totalOrders;
      case 'bitcoin': return stats.bitcoinOrders;
      case 'media': return stats.mediaFiles;
      case 'faq': return stats.faqItems;
      default: return null;
    }
  };

  const renderModal = () => {
    const tool = tools.find(t => t.id === activeModal);
    if (!tool) return null;

    const Component = tool.component;

    return (
      <div className="fixed inset-0 bg-black/95 z-50 overflow-hidden">
        <div className="h-screen flex flex-col">
          {/* Modal Header */}
          <div className={`bg-gradient-to-r ${tool.color} px-8 py-6 flex items-center justify-between shadow-2xl`}>
            <div className="flex items-center gap-4">
              <tool.icon className="w-10 h-10 text-white" />
              <div>
                <h2 className="text-3xl font-bold text-white">{tool.title}</h2>
                <p className="text-white/90 text-sm mt-1">{tool.description}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white"
            >
              <X className="w-7 h-7" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto bg-gray-900">
            <Component />
          </div>

          {/* Modal Footer */}
          <div className="bg-gray-800 px-8 py-4 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Editing live data - Changes are saved in real-time
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
            >
              Close Tool
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Top Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-10 h-10 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Inferno TV Admin</h1>
                <p className="text-sm text-gray-400">Control Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="text-white font-semibold">{adminUser?.email || 'Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="container mx-auto px-8 py-12">
        {/* Stats Overview */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-gray-400 text-lg">Welcome back! Click any tool below to open it in a modal window.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalBlogPosts}</span>
            </div>
            <p className="text-white/90 font-semibold">Blog Posts</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalProducts}</span>
            </div>
            <p className="text-white/90 font-semibold">Products</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="w-8 h-8" />
              <span className="text-3xl font-bold">{stats.totalOrders}</span>
            </div>
            <p className="text-white/90 font-semibold">Total Orders</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-8 h-8" />
              <span className="text-3xl font-bold">${stats.totalRevenue.toFixed(0)}</span>
            </div>
            <p className="text-white/90 font-semibold">Revenue</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-6">Admin Tools</h3>
          <p className="text-gray-400 mb-8">Click any tool to open it in a full-screen modal window</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const stat = getStatForTool(tool.id);
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveModal(tool.id)}
                  className="group bg-gray-800 hover:bg-gray-750 rounded-2xl p-8 text-left transition-all duration-300 border-2 border-gray-700 hover:border-gray-600 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-white">{tool.title}</h4>
                    {stat !== null && (
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-bold">
                        {stat}
                      </span>
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{tool.description}</p>

                  <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm">
                    <span>Open Tool</span>
                    <Edit3 className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-blue-500/30">
          <h4 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <Eye className="w-7 h-7 text-blue-400" />
            How to Use This Dashboard
          </h4>
          <div className="grid md:grid-cols-2 gap-6 text-gray-300">
            <div>
              <h5 className="font-semibold text-white mb-2">Modal Windows</h5>
              <p className="text-sm">All tools open as full-screen overlay modals. Click any tool card to open it instantly.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Real-Time Editing</h5>
              <p className="text-sm">Changes you make are saved directly to the database in real-time.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">File Uploads</h5>
              <p className="text-sm">Upload images and videos directly in blog posts and media library.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-2">Frontend Integration</h5>
              <p className="text-sm">All changes appear immediately on your live website after saving.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Render Active Modal */}
      {activeModal && renderModal()}
    </div>
  );
}
