import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  LogOut,
  Flame,
  Tag,
  TrendingUp,
  BarChart3,
  ArrowRight,
  Wallet,
  Mail,
  Layout,
  Video,
  HelpCircle,
  Database,
  DollarSign,
  Search,
  MessageCircle,
  Repeat,
  Star,
  Activity,
  Edit,
  CreditCard,
  Shield
} from 'lucide-react';
import ProductManagement from './ProductManagement';
import OrderManagement from './OrderManagement';
import BlogManagement from './BlogManagement';
import CustomerManagement from './CustomerManagement';
import PromotionsManagement from './PromotionsManagement';
import MathRankSEODashboard from '../components/custom-admin/MathRankSEODashboard';
import GoogleAnalyticsManager from '../components/custom-admin/GoogleAnalyticsManager';
import RedirectsManager from '../components/custom-admin/RedirectsManager';
import PaymentGatewayManager from '../components/custom-admin/PaymentGatewayManager';
import EmailTemplateManager from '../components/custom-admin/EmailTemplateManager';
import VisualSectionManager from '../components/custom-admin/VisualSectionManager';
import TutorialBoxEditor from '../components/custom-admin/TutorialBoxEditor';
import FAQManager from '../components/custom-admin/FAQManager';
import MediaLibrary from '../components/custom-admin/MediaLibrary';
import SimplePricingManager from '../components/custom-admin/SimplePricingManager';
import SimpleSEOManager from '../components/custom-admin/SimpleSEOManager';
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import LiveChatManager from '../components/custom-admin/LiveChatManager';
import AffiliateManager from '../components/custom-admin/AffiliateManager';
import ReviewsManager from '../components/custom-admin/ReviewsManager';
import AdvancedAnalytics from '../components/custom-admin/AdvancedAnalytics';
import SubscriptionManager from '../components/custom-admin/SubscriptionManager';
import VisualPageBuilder from '../components/custom-admin/VisualPageBuilder';
import RealTimePaymentConfig from '../components/custom-admin/RealTimePaymentConfig';
import SecurityManager from '../components/custom-admin/SecurityManager';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('products');
  const [adminUser] = useState(() => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'visual-builder', label: 'Visual Page Builder', icon: Edit },
    { id: 'payment-config', label: 'Payment Setup', icon: CreditCard },
    { id: 'security', label: 'Security & Protection', icon: Shield },
    { id: 'advanced-analytics', label: 'Real-Time Analytics', icon: Activity },
    { id: 'seo-dashboard', label: 'SEO Dashboard', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics & GSC', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'live-chat', label: 'Live Chat Support', icon: MessageCircle },
    { id: 'reviews', label: 'Customer Reviews', icon: Star },
    { id: 'affiliates', label: 'Affiliate Program', icon: Users },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'redirects', label: 'Redirects', icon: ArrowRight },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'payments', label: 'Payments', icon: Wallet },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'sections', label: 'Website Sections', icon: Layout },
    { id: 'tutorials', label: 'Tutorials', icon: Video },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'media', label: 'Media', icon: Database },
    { id: 'pricing', label: 'Pricing Plans', icon: DollarSign },
    { id: 'site-settings', label: 'Site Settings', icon: Settings },
    { id: 'seo-settings', label: 'SEO Settings', icon: Search }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-white">Inferno TV</h1>
              <p className="text-xs text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Logged in as</div>
            <div className="text-sm font-semibold text-white truncate">
              {adminUser?.email || 'Admin'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {activeSection === 'dashboard' && (
          <div className="p-8">
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-xl p-6 border border-orange-500/30">
                <Package className="w-10 h-10 text-orange-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">-</div>
                <div className="text-gray-400">Total Products</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-md rounded-xl p-6 border border-blue-500/30">
                <ShoppingCart className="w-10 h-10 text-blue-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">-</div>
                <div className="text-gray-400">Total Orders</div>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-xl p-6 border border-green-500/30">
                <Users className="w-10 h-10 text-green-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">-</div>
                <div className="text-gray-400">Customers</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-md rounded-xl p-6 border border-purple-500/30">
                <FileText className="w-10 h-10 text-purple-400 mb-4" />
                <div className="text-3xl font-bold text-white mb-2">-</div>
                <div className="text-gray-400">Blog Posts</div>
              </div>
            </div>

            <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Quick Start Guide</h2>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                  <div>
                    <strong>Add Products:</strong> Go to Products section to add your Fire Sticks and IPTV subscriptions
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                  <div>
                    <strong>Manage Orders:</strong> View and manage customer orders in the Orders section
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                  <div>
                    <strong>Write Content:</strong> Create blog posts and manage SEO in the Blog & SEO section
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'visual-builder' && <VisualPageBuilder />}
        {activeSection === 'payment-config' && <RealTimePaymentConfig />}
        {activeSection === 'security' && <SecurityManager />}
        {activeSection === 'advanced-analytics' && <AdvancedAnalytics />}
        {activeSection === 'seo-dashboard' && <MathRankSEODashboard />}
        {activeSection === 'analytics' && <GoogleAnalyticsManager />}
        {activeSection === 'products' && <ProductManagement />}
        {activeSection === 'orders' && <OrderManagement />}
        {activeSection === 'customers' && <CustomerManagement />}
        {activeSection === 'subscriptions' && <SubscriptionManager />}
        {activeSection === 'live-chat' && <LiveChatManager />}
        {activeSection === 'reviews' && <ReviewsManager />}
        {activeSection === 'affiliates' && <AffiliateManager />}
        {activeSection === 'blog' && <BlogManagement />}
        {activeSection === 'redirects' && <RedirectsManager />}
        {activeSection === 'promotions' && <PromotionsManagement />}
        {activeSection === 'payments' && <PaymentGatewayManager />}
        {activeSection === 'emails' && <EmailTemplateManager />}
        {activeSection === 'sections' && <VisualSectionManager />}
        {activeSection === 'tutorials' && <TutorialBoxEditor />}
        {activeSection === 'faq' && <FAQManager />}
        {activeSection === 'media' && <MediaLibrary />}
        {activeSection === 'pricing' && <SimplePricingManager aiMode={false} />}
        {activeSection === 'site-settings' && <SiteSettingsManager />}
        {activeSection === 'seo-settings' && <SimpleSEOManager aiMode={false} />}

      </div>
    </div>
  );
}
