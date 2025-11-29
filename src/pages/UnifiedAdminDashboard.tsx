import { useState, useEffect } from 'react';
import {
  Package, FileText, ShoppingCart, Settings, LogOut, TrendingUp, HelpCircle, Image,
  DollarSign, CreditCard, Flame, X, Grid, Users, Video, Eye, Edit3, Mail, Tag,
  ArrowRight, Wallet, Repeat, Star, Activity, Shield, Bot, Upload, Monitor, Globe,
  Bitcoin, BarChart3, Layout, Database, Search, MessageCircle, Zap, Power, Lock
} from 'lucide-react';

// Import ALL admin components
import AdminDashboardOverview from '../components/custom-admin/AdminDashboardOverview';
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
import AICopilot from '../components/custom-admin/AICopilot';
import AdvancedAnalytics from '../components/custom-admin/AdvancedAnalytics';
import LiveChatManager from '../components/custom-admin/LiveChatManager';
import AffiliateManager from '../components/custom-admin/AffiliateManager';
import ReviewsManager from '../components/custom-admin/ReviewsManager';
import SubscriptionManager from '../components/custom-admin/SubscriptionManager';
import PaymentGatewayManager from '../components/custom-admin/PaymentGatewayManager';
import EmailTemplateManager from '../components/custom-admin/EmailTemplateManager';
import RedirectsManager from '../components/custom-admin/RedirectsManager';
import TutorialBoxEditor from '../components/custom-admin/TutorialBoxEditor';
import SimplePricingManager from '../components/custom-admin/SimplePricingManager';
import SimpleSEOManager from '../components/custom-admin/SimpleSEOManager';
import VisualSectionManager from '../components/custom-admin/VisualSectionManager';
import GoogleAnalyticsManager from '../components/custom-admin/GoogleAnalyticsManager';
import RealTimePaymentConfig from '../components/custom-admin/RealTimePaymentConfig';
import SecurityManager from '../components/custom-admin/SecurityManager';
import RevenueDashboard from '../components/custom-admin/RevenueDashboard';
import ComprehensiveCustomerManager from '../components/custom-admin/ComprehensiveCustomerManager';
import BulkEmailManager from '../components/custom-admin/BulkEmailManager';
import CategoryManager from '../components/custom-admin/CategoryManager';
import EnhancedVisualPageBuilder from '../components/custom-admin/EnhancedVisualPageBuilder';
import FileUploadManager from '../components/custom-admin/FileUploadManager';
import FrontendControlPanel from '../components/custom-admin/FrontendControlPanel';
import SystemHealthCheck from '../components/custom-admin/SystemHealthCheck';
import CompleteSEOManager from '../components/custom-admin/CompleteSEOManager';
import ElementorStylePageBuilder from '../components/custom-admin/ElementorStylePageBuilder';
import RankMathProSEOManager from '../components/custom-admin/RankMathProSEOManager';
import UltraProductManager from '../components/custom-admin/UltraProductManager';
import MarketingAutomation from '../components/custom-admin/MarketingAutomation';
import AdvancedFormBuilder from '../components/custom-admin/AdvancedFormBuilder';
import PopupBuilder from '../components/custom-admin/PopupBuilder';
import FrontendVisualEditor from '../components/custom-admin/FrontendVisualEditor';
import RealBlogManager from '../components/custom-admin/RealBlogManager';
import HomepageSectionEditor from '../components/custom-admin/HomepageSectionEditor';
import SiteBrandingManager from '../components/custom-admin/SiteBrandingManager';
import NOWPaymentsManager from '../components/custom-admin/NOWPaymentsManager';
import LiveVisitorStatistics from '../components/custom-admin/LiveVisitorStatistics';
import AdvancedBlogManager from '../components/custom-admin/AdvancedBlogManager';
import FullFeaturedProductManager from '../components/custom-admin/FullFeaturedProductManager';
import FullProductManager from '../components/custom-admin/FullProductManager';
import SimpleProductManager from '../components/custom-admin/SimpleProductManager';
import MediaLibrary from '../components/custom-admin/MediaLibrary';
import VisualPageBuilder from '../components/custom-admin/VisualPageBuilder';
import RankMathProSEO from '../components/custom-admin/RankMathProSEO';
import AmazonAIAssistant from '../components/custom-admin/AmazonAIAssistant';
import AmazonFireStickAutomation from '../components/custom-admin/AmazonFireStickAutomation';
import RealAIVideoGenerator from '../components/custom-admin/RealAIVideoGenerator';
import SuperAICopilot from '../components/custom-admin/SuperAICopilot';
import SimpleImageManager from '../components/custom-admin/SimpleImageManager';
import SimpleContentEditor from '../components/custom-admin/SimpleContentEditor';
import SimplePaymentSettings from '../components/custom-admin/SimplePaymentSettings';
import StripeProductManager from '../components/custom-admin/StripeProductManager';
import SearchEngineManager from '../components/custom-admin/SearchEngineManager';
import GitHubCloudflareConfig from '../components/custom-admin/GitHubCloudflareConfig';
import AICopilotWidget from '../components/custom-admin/AICopilotWidget';
import { supabase } from '../lib/supabase';

interface AdminTool {
  id: string;
  title: string;
  icon: any;
  color: string;
  description: string;
  component: React.ComponentType<any>;
  category: string;
  featured?: boolean;
}

export default function UnifiedAdminDashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<{email: string; username?: string} | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
      window.location.href = '/admin';
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
        supabase.from('real_products').select('*', { count: 'exact', head: true }),
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

  // All 60 admin tools organized by category
  const allTools: AdminTool[] = [
    // Dashboard & Overview
    { id: 'dashboard', title: 'Dashboard Overview', icon: Activity, color: 'from-cyan-500 to-blue-600', description: 'Complete business overview with stats and analytics', component: AdminDashboardOverview, category: 'dashboard', featured: true },
    { id: 'revenue', title: 'Revenue Dashboard', icon: DollarSign, color: 'from-green-500 to-emerald-600', description: 'Track revenue, profits, and financial metrics', component: RevenueDashboard, category: 'dashboard', featured: true },
    { id: 'analytics', title: 'Google Analytics', icon: BarChart3, color: 'from-blue-500 to-indigo-600', description: 'View Google Analytics data and reports', component: GoogleAnalyticsManager, category: 'dashboard' },
    { id: 'advanced-analytics', title: 'Advanced Analytics', icon: TrendingUp, color: 'from-purple-500 to-pink-600', description: 'Real-time analytics and performance metrics', component: AdvancedAnalytics, category: 'dashboard' },
    { id: 'live-visitors', title: 'Live Visitor Stats', icon: Eye, color: 'from-green-500 to-teal-600', description: 'See who is on your site right now', component: LiveVisitorStatistics, category: 'dashboard' },
    { id: 'system-health', title: 'System Health Check', icon: Activity, color: 'from-red-500 to-orange-600', description: 'Monitor system status and performance', component: SystemHealthCheck, category: 'dashboard', featured: true },

    // Products
    { id: 'products', title: 'Product Manager', icon: Package, color: 'from-green-500 to-emerald-600', description: 'Manage all your products with full CRUD operations', component: RealProductManager, category: 'products', featured: true },
    { id: 'ultra-products', title: 'Ultra Product Manager', icon: Package, color: 'from-blue-500 to-cyan-600', description: 'Advanced product management with Shopify-like features', component: UltraProductManager, category: 'products' },
    { id: 'categories', title: 'Category Manager', icon: Tag, color: 'from-purple-500 to-pink-600', description: 'Organize products into categories', component: CategoryManager, category: 'products' },
    { id: 'pricing', title: 'Pricing Manager', icon: DollarSign, color: 'from-yellow-500 to-orange-600', description: 'Set and manage product pricing', component: SimplePricingManager, category: 'products' },

    // Orders & Customers
    { id: 'orders', title: 'Orders & Customers', icon: ShoppingCart, color: 'from-orange-500 to-red-600', description: 'View and manage all orders and customer data', component: OrdersCustomersManager, category: 'orders', featured: true },
    { id: 'customers', title: 'Customer Manager', icon: Users, color: 'from-blue-500 to-indigo-600', description: 'Comprehensive customer management system', component: ComprehensiveCustomerManager, category: 'orders' },
    { id: 'bitcoin-orders', title: 'Bitcoin Orders', icon: Bitcoin, color: 'from-amber-500 to-yellow-600', description: 'Track Bitcoin and cryptocurrency payments', component: BitcoinOrdersManager, category: 'orders', featured: true },
    { id: 'subscriptions', title: 'Subscriptions', icon: Repeat, color: 'from-purple-500 to-pink-600', description: 'Manage subscription plans and recurring payments', component: SubscriptionManager, category: 'orders' },

    // Content & Blog
    { id: 'blogs', title: 'Blog Posts Manager', icon: FileText, color: 'from-blue-500 to-purple-600', description: 'Create and manage blog posts with SEO', component: EnhancedBlogManager, category: 'content', featured: true },
    { id: 'real-blogs', title: 'Real Blog Manager', icon: FileText, color: 'from-cyan-500 to-blue-600', description: 'Advanced blog management with SEO scores', component: RealBlogManager, category: 'content' },
    { id: 'faq', title: 'FAQ Manager', icon: HelpCircle, color: 'from-indigo-500 to-purple-600', description: 'Manage frequently asked questions', component: FAQManager, category: 'content' },
    { id: 'tutorials', title: 'Tutorial Editor', icon: Video, color: 'from-red-500 to-pink-600', description: 'Create and edit tutorial content', component: TutorialBoxEditor, category: 'content' },

    // SEO & Marketing
    { id: 'seo-dashboard', title: 'SEO Dashboard', icon: TrendingUp, color: 'from-cyan-500 to-blue-600', description: 'Complete SEO management with Rank Math', component: MathRankSEODashboard, category: 'seo', featured: true },
    { id: 'rankmath-seo', title: 'Rank Math Pro SEO', icon: TrendingUp, color: 'from-orange-500 to-red-600', description: 'Advanced SEO optimization tool', component: RankMathProSEOManager, category: 'seo', featured: true },
    { id: 'complete-seo', title: 'Complete SEO Manager', icon: Search, color: 'from-green-500 to-teal-600', description: 'Full-featured SEO management system', component: CompleteSEOManager, category: 'seo' },
    { id: 'seo-settings', title: 'SEO Settings', icon: Search, color: 'from-purple-500 to-indigo-600', description: 'Configure SEO preferences', component: SimpleSEOManager, category: 'seo' },
    { id: 'redirects', title: 'URL Redirects', icon: ArrowRight, color: 'from-yellow-500 to-orange-600', description: 'Manage URL redirects and rewrites', component: RedirectsManager, category: 'seo' },
    { id: 'marketing', title: 'Marketing Automation', icon: Zap, color: 'from-yellow-500 to-orange-600', description: 'Automated marketing campaigns and workflows', component: MarketingAutomation, category: 'marketing', featured: true },
    { id: 'promotions', title: 'Promotions & Discounts', icon: Tag, color: 'from-red-500 to-pink-600', description: 'Create discount codes and sales', component: EnhancedPromotionsManager, category: 'marketing' },
    { id: 'affiliates', title: 'Affiliate Program', icon: Users, color: 'from-blue-500 to-cyan-600', description: 'Manage affiliate partners and commissions', component: AffiliateManager, category: 'marketing' },
    { id: 'reviews', title: 'Customer Reviews', icon: Star, color: 'from-yellow-500 to-amber-600', description: 'Manage customer reviews and ratings', component: ReviewsManager, category: 'marketing' },

    // Email & Communication
    { id: 'emails', title: 'Email Templates', icon: Mail, color: 'from-blue-500 to-indigo-600', description: 'Create and manage email templates', component: EmailTemplateManager, category: 'communication' },
    { id: 'bulk-email', title: 'Bulk Email Campaigns', icon: Mail, color: 'from-purple-500 to-pink-600', description: 'Send mass emails and campaigns', component: BulkEmailManager, category: 'communication', featured: true },
    { id: 'live-chat', title: 'Live Chat Support', icon: MessageCircle, color: 'from-green-500 to-teal-600', description: 'Manage live chat conversations', component: LiveChatManager, category: 'communication' },

    // Media & Files
    { id: 'media', title: 'Media Library', icon: Image, color: 'from-pink-500 to-rose-600', description: 'Upload and manage images, videos, and files', component: EnhancedMediaLibrary, category: 'media', featured: true },
    { id: 'file-upload', title: 'File Upload Manager', icon: Upload, color: 'from-blue-500 to-cyan-600', description: 'Upload and organize files', component: FileUploadManager, category: 'media' },
    { id: 'carousel', title: 'Homepage Carousel', icon: Grid, color: 'from-teal-500 to-cyan-600', description: 'Manage homepage carousel slides', component: CarouselManager, category: 'media' },

    // Design & Page Building
    { id: 'visual-builder', title: 'Visual Page Builder', icon: Layout, color: 'from-purple-500 to-pink-600', description: 'Drag-and-drop page builder', component: EnhancedVisualPageBuilder, category: 'design', featured: true },
    { id: 'elementor', title: 'Elementor Builder', icon: Edit3, color: 'from-orange-500 to-red-600', description: 'Professional page builder with Elementor-style interface', component: ElementorStylePageBuilder, category: 'design', featured: true },
    { id: 'frontend-editor', title: 'Frontend Visual Editor', icon: Monitor, color: 'from-cyan-500 to-blue-600', description: 'Edit your site visually on the frontend', component: FrontendVisualEditor, category: 'design' },
    { id: 'homepage-sections', title: 'Homepage Sections', icon: Layout, color: 'from-green-500 to-emerald-600', description: 'Edit homepage sections visually', component: HomepageSectionEditor, category: 'design', featured: true },
    { id: 'sections', title: 'Website Sections', icon: Grid, color: 'from-indigo-500 to-purple-600', description: 'Manage website section content', component: VisualSectionManager, category: 'design' },
    { id: 'forms', title: 'Form Builder', icon: FileText, color: 'from-blue-500 to-indigo-600', description: 'Create custom forms with drag-and-drop', component: AdvancedFormBuilder, category: 'design', featured: true },
    { id: 'popups', title: 'Popup Builder', icon: Star, color: 'from-yellow-500 to-orange-600', description: 'Design and manage popup modals', component: PopupBuilder, category: 'design' },

    // Payments
    { id: 'payment-config', title: 'Payment Configuration', icon: CreditCard, color: 'from-green-500 to-emerald-600', description: 'Configure payment gateways', component: RealTimePaymentConfig, category: 'payments', featured: true },
    { id: 'payment-gateways', title: 'Payment Gateways', icon: Wallet, color: 'from-blue-500 to-cyan-600', description: 'Manage payment gateway settings', component: PaymentGatewayManager, category: 'payments' },
    { id: 'nowpayments', title: 'NOWPayments Bitcoin', icon: Bitcoin, color: 'from-amber-500 to-yellow-600', description: 'Configure NOWPayments Bitcoin integration', component: NOWPaymentsManager, category: 'payments', featured: true },

    // Settings & Configuration
    { id: 'site-settings', title: 'Site Settings', icon: Settings, color: 'from-gray-500 to-slate-600', description: 'Configure site-wide settings and preferences', component: SiteSettingsManager, category: 'settings', featured: true },
    { id: 'site-branding', title: 'Site Branding', icon: Globe, color: 'from-blue-500 to-indigo-600', description: 'Change site name, logo, and branding', component: SiteBrandingManager, category: 'settings', featured: true },
    { id: 'security', title: 'Security Manager', icon: Shield, color: 'from-red-500 to-orange-600', description: 'Security settings and protection features', component: SecurityManager, category: 'settings', featured: true },
    { id: 'frontend-control', title: 'Frontend Control Panel', icon: Monitor, color: 'from-cyan-500 to-blue-600', description: 'Control frontend appearance and features', component: FrontendControlPanel, category: 'settings' },

    // AI & Automation
    { id: 'ai-copilot', title: 'AI Copilot Assistant', icon: Bot, color: 'from-purple-500 to-pink-600', description: 'AI-powered assistant for admin tasks', component: AICopilot, category: 'ai', featured: true },
    { id: 'super-ai-copilot', title: 'Super AI Copilot', icon: Bot, color: 'from-pink-500 to-purple-600', description: 'Advanced AI assistant with extended capabilities', component: SuperAICopilot, category: 'ai' },
    { id: 'amazon-ai-assistant', title: 'Amazon AI Assistant', icon: Bot, color: 'from-orange-500 to-yellow-600', description: 'AI assistant for Amazon Fire Stick products', component: AmazonAIAssistant, category: 'ai' },
    { id: 'ai-video-generator', title: 'AI Video Generator', icon: Video, color: 'from-red-500 to-pink-600', description: 'Generate videos using AI technology', component: RealAIVideoGenerator, category: 'ai' },
    { id: 'amazon-automation', title: 'Amazon Fire Stick Automation', icon: Zap, color: 'from-orange-500 to-red-600', description: 'Automate Amazon Fire Stick operations', component: AmazonFireStickAutomation, category: 'ai' },

    // Additional Product Managers
    { id: 'simple-products', title: 'Simple Product Manager', icon: Package, color: 'from-green-500 to-teal-600', description: 'Simple product management interface', component: SimpleProductManager, category: 'products' },
    { id: 'full-products', title: 'Full Product Manager', icon: Package, color: 'from-blue-500 to-indigo-600', description: 'Complete product management with all features', component: FullProductManager, category: 'products' },
    { id: 'full-featured-products', title: 'Full Featured Products', icon: Package, color: 'from-purple-500 to-pink-600', description: 'Premium product management system', component: FullFeaturedProductManager, category: 'products' },
    { id: 'stripe-products', title: 'Stripe Products', icon: Package, color: 'from-indigo-500 to-purple-600', description: 'Manage Stripe payment products', component: StripeProductManager, category: 'products' },

    // Additional Blog & Content
    { id: 'advanced-blogs', title: 'Advanced Blog Manager', icon: FileText, color: 'from-indigo-500 to-purple-600', description: 'Advanced blog management features', component: AdvancedBlogManager, category: 'content' },
    { id: 'simple-content', title: 'Simple Content Editor', icon: Edit3, color: 'from-gray-500 to-slate-600', description: 'Simple content editing interface', component: SimpleContentEditor, category: 'content' },

    // Additional Media
    { id: 'simple-media', title: 'Simple Media Library', icon: Image, color: 'from-blue-500 to-cyan-600', description: 'Basic media library management', component: MediaLibrary, category: 'media' },
    { id: 'simple-images', title: 'Simple Image Manager', icon: Image, color: 'from-pink-500 to-rose-600', description: 'Basic image management tool', component: SimpleImageManager, category: 'media' },

    // Additional Design Tools
    { id: 'visual-page-builder', title: 'Visual Page Builder (Classic)', icon: Layout, color: 'from-blue-500 to-indigo-600', description: 'Classic visual page builder', component: VisualPageBuilder, category: 'design' },

    // Additional SEO
    { id: 'rankmath-pro', title: 'Rank Math Pro', icon: TrendingUp, color: 'from-yellow-500 to-orange-600', description: 'Rank Math Pro SEO optimization', component: RankMathProSEO, category: 'seo' },
    { id: 'search-engine', title: 'Search Engine Manager', icon: Search, color: 'from-cyan-500 to-blue-600', description: 'Manage search engine settings', component: SearchEngineManager, category: 'seo' },

    // Additional Payments
    { id: 'simple-payment', title: 'Simple Payment Settings', icon: CreditCard, color: 'from-green-500 to-emerald-600', description: 'Simple payment configuration', component: SimplePaymentSettings, category: 'payments' },

    // Additional Settings
    { id: 'github-cloudflare', title: 'GitHub & Cloudflare Config', icon: Settings, color: 'from-gray-600 to-slate-700', description: 'Configure GitHub and Cloudflare integration', component: GitHubCloudflareConfig, category: 'settings' },
  ];

  const categories = ['all', 'dashboard', 'products', 'orders', 'content', 'seo', 'marketing', 'communication', 'media', 'design', 'payments', 'settings', 'ai'];

  const filteredTools = allTools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatForTool = (toolId: string) => {
    switch (toolId) {
      case 'blogs': case 'real-blogs': return stats.totalBlogPosts;
      case 'products': case 'ultra-products': return stats.totalProducts;
      case 'orders': return stats.totalOrders;
      case 'bitcoin-orders': return stats.bitcoinOrders;
      case 'media': return stats.mediaFiles;
      case 'faq': return stats.faqItems;
      default: return null;
    }
  };

  const renderModal = () => {
    const tool = allTools.find(t => t.id === activeModal);
    if (!tool) return null;

    const Component = tool.component;

    return (
      <div className="fixed inset-0 bg-black/95 z-50 overflow-hidden">
        <div className="h-screen flex flex-col">
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

          <div className="flex-1 overflow-y-auto bg-gray-900">
            <Component />
          </div>

          <div className="bg-gray-800 px-8 py-4 flex items-center justify-between border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Changes are saved in real-time
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Top Navigation */}
      <nav className="bg-black/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="w-10 h-10 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Inferno TV Admin Panel</h1>
                <p className="text-sm text-gray-400">Complete Website Control Center</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Logged in as</p>
                <p className="text-white font-semibold">{adminUser?.email || adminUser?.username || 'Admin'}</p>
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
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Admin Control Panel</h2>
          <p className="text-gray-400 text-lg">60+ Professional Tools to Manage Your Entire Website</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-2xl">
            <FileText className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold">{stats.totalBlogPosts}</span>
            <p className="text-white/90 font-semibold mt-1">Blog Posts</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl">
            <Package className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold">{stats.totalProducts}</span>
            <p className="text-white/90 font-semibold mt-1">Products</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-2xl">
            <ShoppingCart className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold">{stats.totalOrders}</span>
            <p className="text-white/90 font-semibold mt-1">Orders</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-2xl">
            <DollarSign className="w-8 h-8 mb-2" />
            <span className="text-3xl font-bold">${stats.totalRevenue.toFixed(0)}</span>
            <p className="text-white/90 font-semibold mt-1">Revenue</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Tools */}
        {selectedCategory === 'all' && !searchQuery && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">⭐ Featured Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTools.filter(t => t.featured).map((tool) => {
                const stat = getStatForTool(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveModal(tool.id)}
                    className="group bg-gray-800 hover:bg-gray-750 rounded-2xl p-6 text-left transition-all duration-300 border-2 border-gray-700 hover:border-orange-500 shadow-xl hover:shadow-2xl hover:-translate-y-1"
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
                    <p className="text-gray-400 text-sm">{tool.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* All Tools Grid */}
        <div>
          <h3 className="text-3xl font-bold text-white mb-6">
            {selectedCategory !== 'all' ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) + ' Tools' : 'All Admin Tools'}
            {searchQuery && ` - "${searchQuery}"`}
            <span className="text-orange-500 ml-2">({filteredTools.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const stat = getStatForTool(tool.id);
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveModal(tool.id)}
                  className="group bg-gray-800 hover:bg-gray-750 rounded-2xl p-6 text-left transition-all duration-300 border-2 border-gray-700 hover:border-gray-600 shadow-xl hover:shadow-2xl hover:-translate-y-1"
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
      </div>

      {activeModal && renderModal()}
    </div>
  );
}

