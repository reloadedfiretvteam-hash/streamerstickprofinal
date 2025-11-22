import { useState, useEffect } from 'react';
import {
  Package,
  DollarSign,
  FileText,
  Search,
  LogOut,
  Zap,
  Power,
  Layout,
  Video,
  HelpCircle,
  Database,
  Wallet,
  Mail,
  BarChart3,
  TrendingUp,
  ArrowRight,
  Settings,
  ShoppingCart,
  MessageCircle,
  Repeat,
  Star,
  Activity,
  CreditCard,
  Shield,
  Bot,
  Image,
  Users,
  Tag,
  Upload,
  Monitor,
  Eye,
  Globe,
  Bitcoin
} from 'lucide-react';
// SimpleContentEditor removed - unused
import SimpleProductManager from '../components/custom-admin/SimpleProductManager';
import SimplePricingManager from '../components/custom-admin/SimplePricingManager';
import SimpleSEOManager from '../components/custom-admin/SimpleSEOManager';
import VisualSectionManager from '../components/custom-admin/VisualSectionManager';
import TutorialBoxEditor from '../components/custom-admin/TutorialBoxEditor';
import FAQManager from '../components/custom-admin/FAQManager';
import MediaLibrary from '../components/custom-admin/MediaLibrary';
import PaymentGatewayManager from '../components/custom-admin/PaymentGatewayManager';
import EmailTemplateManager from '../components/custom-admin/EmailTemplateManager';
import AdvancedBlogManager from '../components/custom-admin/AdvancedBlogManager';
import GoogleAnalyticsManager from '../components/custom-admin/GoogleAnalyticsManager';
import MathRankSEODashboard from '../components/custom-admin/MathRankSEODashboard';
import RedirectsManager from '../components/custom-admin/RedirectsManager';
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import OrdersCustomersManager from '../components/custom-admin/OrdersCustomersManager';
import LiveChatManager from '../components/custom-admin/LiveChatManager';
import AffiliateManager from '../components/custom-admin/AffiliateManager';
import ReviewsManager from '../components/custom-admin/ReviewsManager';
import AdvancedAnalytics from '../components/custom-admin/AdvancedAnalytics';
import SubscriptionManager from '../components/custom-admin/SubscriptionManager';
import RealTimePaymentConfig from '../components/custom-admin/RealTimePaymentConfig';
import SecurityManager from '../components/custom-admin/SecurityManager';
import FullProductManager from '../components/custom-admin/FullProductManager';
import EnhancedMediaLibrary from '../components/custom-admin/EnhancedMediaLibrary';
import RankMathProSEO from '../components/custom-admin/RankMathProSEO';
import AICopilot from '../components/custom-admin/AICopilot';
import ComprehensiveCustomerManager from '../components/custom-admin/ComprehensiveCustomerManager';
import RevenueDashboard from '../components/custom-admin/RevenueDashboard';
import EnhancedPromotionsManager from '../components/custom-admin/EnhancedPromotionsManager';
import BulkEmailManager from '../components/custom-admin/BulkEmailManager';
import FullFeaturedProductManager from '../components/custom-admin/FullFeaturedProductManager';
import CategoryManager from '../components/custom-admin/CategoryManager';
import EnhancedVisualPageBuilder from '../components/custom-admin/EnhancedVisualPageBuilder';
import FileUploadManager from '../components/custom-admin/FileUploadManager';
import FrontendControlPanel from '../components/custom-admin/FrontendControlPanel';
import SystemHealthCheck from '../components/custom-admin/SystemHealthCheck';
import CompleteSEOManager from '../components/custom-admin/CompleteSEOManager';
import AdminDashboardOverview from '../components/custom-admin/AdminDashboardOverview';
import ElementorStylePageBuilder from '../components/custom-admin/ElementorStylePageBuilder';
import AICopilotWidget from '../components/custom-admin/AICopilotWidget';
import RankMathProSEOManager from '../components/custom-admin/RankMathProSEOManager';
import AdminModalWrapper from '../components/custom-admin/AdminModalWrapper';
import UltraProductManager from '../components/custom-admin/UltraProductManager';
import MarketingAutomation from '../components/custom-admin/MarketingAutomation';
import AdvancedFormBuilder from '../components/custom-admin/AdvancedFormBuilder';
import PopupBuilder from '../components/custom-admin/PopupBuilder';
import RealProductManager from '../components/custom-admin/RealProductManager';
import FrontendVisualEditor from '../components/custom-admin/FrontendVisualEditor';
import RealBlogManager from '../components/custom-admin/RealBlogManager';
import HomepageSectionEditor from '../components/custom-admin/HomepageSectionEditor';
import SiteBrandingManager from '../components/custom-admin/SiteBrandingManager';
import NOWPaymentsManager from '../components/custom-admin/NOWPaymentsManager';
import BitcoinOrdersManager from '../components/custom-admin/BitcoinOrdersManager';

export default function CustomAdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard-overview');
  const [aiMode, setAiMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);
  const [adminUser] = useState(() => {
    const user = localStorage.getItem('custom_admin_user');
    return user ? JSON.parse(user) : null;
  });

  // Protect dashboard - require authentication
  useEffect(() => {
    const token = localStorage.getItem('custom_admin_token');
    if (!token || token !== 'authenticated') {
      alert('Please log in to access the admin dashboard');
      window.location.href = '/custom-admin';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('custom_admin_token');
    localStorage.removeItem('custom_admin_user');
    window.location.href = '/custom-admin';
  };

  const openInModal = (sectionId: string, content: any) => {
    setModalContent({ sectionId, content });
    setShowModal(true);
  };

  const menuItems = [
    { id: 'dashboard-overview', label: '📊 Dashboard Overview', icon: Activity, color: 'cyan', featured: true },
    { id: 'site-branding', label: '🌐 SITE BRANDING (Change Name/Domain)', icon: Globe, color: 'blue', featured: true },
    { id: 'nowpayments-bitcoin', label: '₿ BITCOIN PAYMENTS (NOWPayments)', icon: Bitcoin, color: 'orange', featured: true },
    { id: 'bitcoin-orders', label: '💰 BITCOIN ORDERS (Track Payments)', icon: Wallet, color: 'amber', featured: true },
    { id: 'homepage-sections', label: '🎨 HOMEPAGE SECTIONS (Visual Map)', icon: Layout, color: 'purple', featured: true },
    { id: 'real-products', label: '🛍️ PRODUCTS (Your Actual Products)', icon: Package, color: 'blue', featured: true },
    { id: 'real-blogs', label: '📝 BLOG POSTS (With SEO Scores)', icon: FileText, color: 'green', featured: true },
    { id: 'website-preview', label: '👁️ Website Preview', icon: Eye, color: 'purple', featured: true },
    { id: 'frontend-visual-editor', label: '🔧 Advanced Frontend Editor', icon: Monitor, color: 'indigo', featured: false },
    { id: 'elementor-builder', label: '🎨 Visual Page Builder (Pro)', icon: Layout, color: 'purple', featured: true },
    { id: 'rankmath-seo', label: '🚀 Rank Math SEO (Pro)', icon: TrendingUp, color: 'orange', featured: true },
    { id: 'complete-seo', label: '🚀 Complete SEO Manager', icon: TrendingUp, color: 'orange', featured: false },
    { id: 'frontend-control', label: '🎛️ Frontend Control', icon: Layout, color: 'cyan', featured: false },
    { id: 'system-health', label: '🏥 System Health', icon: Activity, color: 'green', featured: true },
    { id: 'ai-copilot', label: '🤖 AI Copilot', icon: Bot, color: 'purple', featured: true },
    { id: 'revenue-dashboard', label: '💰 Revenue Dashboard', icon: DollarSign, color: 'green', featured: true },
    { id: 'categories', label: '⭐ Categories', icon: Tag, color: 'cyan', featured: true },
    { id: 'ultra-products', label: '🛍️ Ultra Product Manager (Shopify)', icon: Package, color: 'blue', featured: false },
    { id: 'products-full', label: '⭐ All Products (Full)', icon: Package, color: 'blue', featured: false },
    { id: 'marketing-automation', label: '⚡ Marketing Automation', icon: Zap, color: 'yellow', featured: true },
    { id: 'form-builder', label: '📝 Form Builder Pro', icon: FileText, color: 'blue', featured: true },
    { id: 'popup-builder', label: '🎯 Popup Builder', icon: Star, color: 'purple', featured: true },
    { id: 'full-products', label: '⭐ Product Manager', icon: Package, color: 'blue', featured: true },
    { id: 'file-upload', label: '⭐ File Upload & Download', icon: Upload, color: 'blue', featured: true },
    { id: 'enhanced-media', label: '⭐ Media Library', icon: Image, color: 'green', featured: true },
    { id: 'rank-math-seo', label: '⭐ Rank Math Pro SEO', icon: TrendingUp, color: 'orange', featured: true },
    { id: 'customer-manager', label: '⭐ Customer Manager', icon: Users, color: 'blue', featured: true },
    { id: 'promotions-enhanced', label: '⭐ Promotions & Coupons', icon: Tag, color: 'red', featured: true },
    { id: 'bulk-email', label: '📧 Bulk Email & Campaigns', icon: Mail, color: 'blue', featured: true },
    { id: 'visual-builder', label: '⭐ Visual Page Builder', icon: Layout, color: 'purple', featured: true },
    { id: 'payment-config', label: 'Payment Setup', icon: CreditCard, color: 'green' },
    { id: 'security', label: 'Security & Protection', icon: Shield, color: 'red' },
    { id: 'advanced-analytics', label: 'Real-Time Analytics', icon: Activity, color: 'purple' },
    { id: 'seo-dashboard', label: 'SEO Dashboard', icon: TrendingUp, color: 'cyan' },
    { id: 'analytics', label: 'Analytics & GSC', icon: BarChart3, color: 'emerald' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'pink' },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat, color: 'yellow' },
    { id: 'live-chat', label: 'Live Chat', icon: MessageCircle, color: 'indigo' },
    { id: 'reviews', label: 'Reviews', icon: Star, color: 'red' },
    { id: 'affiliates', label: 'Affiliates', icon: TrendingUp, color: 'blue' },
    { id: 'blogs', label: 'Blog Posts', icon: FileText, color: 'green' },
    { id: 'redirects', label: 'Redirects', icon: ArrowRight, color: 'orange' },
    { id: 'payment-gateways', label: 'Payments', icon: Wallet, color: 'purple' },
    { id: 'emails', label: 'Emails', icon: Mail, color: 'orange' },
    { id: 'sections', label: 'Sections', icon: Layout, color: 'purple' },
    { id: 'tutorials', label: 'Tutorials', icon: Video, color: 'cyan' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, color: 'emerald' },
    { id: 'media', label: 'Media', icon: Database, color: 'pink' },
    { id: 'products', label: 'Products', icon: Package, color: 'yellow' },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'indigo' },
    { id: 'settings', label: 'Site Settings', icon: Settings, color: 'red' },
    { id: 'seo', label: 'SEO Settings', icon: Search, color: 'blue' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Custom Admin Panel</h1>
            <p className="text-sm opacity-90">Simple & Easy Management</p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setAiMode(!aiMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                aiMode
                  ? 'bg-white text-orange-500'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {aiMode ? <Zap className="w-5 h-5" /> : <Power className="w-5 h-5" />}
              {aiMode ? 'AI Mode ON' : 'Manual Mode'}
            </button>

            <div className="text-right">
              <p className="text-sm font-semibold">{adminUser?.username}</p>
              <p className="text-xs opacity-75">{adminUser?.email}</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/20 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`p-4 rounded-xl transition-all transform hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl'
                    : 'bg-gray-800 hover:bg-gray-750 text-gray-300'
                }`}
              >
                <Icon className="w-7 h-7 mx-auto mb-2" />
                <p className="text-xs font-semibold text-center">{item.label}</p>
              </button>
            );
          })}
        </div>

        {aiMode && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">AI Mode Active</h3>
                <p className="text-gray-300 mb-3">
                  AI suggestions are enabled. The system will help you optimize content, pricing, and SEO automatically.
                </p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>✓ Smart product descriptions</li>
                  <li>✓ Automatic SEO optimization</li>
                  <li>✓ Pricing recommendations</li>
                  <li>✓ Content improvements</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'dashboard-overview' ? (
          <AdminDashboardOverview />
        ) : activeSection === 'site-branding' ? (
          <SiteBrandingManager />
        ) : activeSection === 'nowpayments-bitcoin' ? (
          <NOWPaymentsManager />
        ) : activeSection === 'bitcoin-orders' ? (
          <BitcoinOrdersManager />
        ) : activeSection === 'homepage-sections' ? (
          <HomepageSectionEditor />
        ) : activeSection === 'elementor-builder' ? (
          <ElementorStylePageBuilder />
        ) : activeSection === 'rankmath-seo' ? (
          <RankMathProSEOManager />
        ) : activeSection === 'website-preview' ? (
          <div className="bg-gray-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Website Preview</h2>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border-2 border-purple-500/30">
              <p className="text-gray-300 mb-4">
                View your live website in a new tab to see all your changes in action.
              </p>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition"
              >
                <Eye className="w-5 h-5" />
                Open Website
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        ) : activeSection === 'complete-seo' ? (
          <CompleteSEOManager />
        ) : activeSection === 'frontend-control' ? (
          <FrontendControlPanel />
        ) : activeSection === 'system-health' ? (
          <SystemHealthCheck />
        ) : activeSection === 'visual-builder' ? (
          <EnhancedVisualPageBuilder />
        ) : activeSection === 'ai-copilot' ? (
          <AICopilot />
        ) : activeSection === 'revenue-dashboard' ? (
          <RevenueDashboard />
        ) : activeSection === 'customer-manager' ? (
          <ComprehensiveCustomerManager />
        ) : activeSection === 'promotions-enhanced' ? (
          <EnhancedPromotionsManager />
        ) : activeSection === 'bulk-email' ? (
          <BulkEmailManager />
        ) : activeSection === 'ultra-products' ? (
          <UltraProductManager />
        ) : activeSection === 'marketing-automation' ? (
          <MarketingAutomation />
        ) : activeSection === 'form-builder' ? (
          <AdvancedFormBuilder />
        ) : activeSection === 'popup-builder' ? (
          <PopupBuilder />
        ) : activeSection === 'real-products' ? (
          <RealProductManager />
        ) : activeSection === 'frontend-visual-editor' ? (
          <FrontendVisualEditor />
        ) : activeSection === 'real-blogs' ? (
          <RealBlogManager />
        ) : (
          <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
            {activeSection === 'full-products' && <FullProductManager />}
            {activeSection === 'file-upload' && <FileUploadManager />}
            {activeSection === 'enhanced-media' && <EnhancedMediaLibrary />}
            {activeSection === 'rank-math-seo' && <RankMathProSEO />}
            {activeSection === 'payment-config' && <RealTimePaymentConfig />}
            {activeSection === 'security' && <SecurityManager />}
            {activeSection === 'advanced-analytics' && <AdvancedAnalytics />}
            {activeSection === 'seo-dashboard' && <MathRankSEODashboard />}
            {activeSection === 'analytics' && <GoogleAnalyticsManager />}
            {activeSection === 'orders' && <OrdersCustomersManager />}
            {activeSection === 'subscriptions' && <SubscriptionManager />}
            {activeSection === 'live-chat' && <LiveChatManager />}
            {activeSection === 'reviews' && <ReviewsManager />}
            {activeSection === 'affiliates' && <AffiliateManager />}
            {activeSection === 'products-full' && <FullFeaturedProductManager />}
            {activeSection === 'categories' && <CategoryManager />}
            {activeSection === 'blogs' && <AdvancedBlogManager />}
            {activeSection === 'redirects' && <RedirectsManager />}
            {activeSection === 'payment-gateways' && <PaymentGatewayManager />}
            {activeSection === 'emails' && <EmailTemplateManager />}
            {activeSection === 'sections' && <VisualSectionManager />}
            {activeSection === 'tutorials' && <TutorialBoxEditor />}
            {activeSection === 'faq' && <FAQManager />}
            {activeSection === 'media' && <MediaLibrary />}
            {activeSection === 'products' && <SimpleProductManager aiMode={aiMode} />}
            {activeSection === 'pricing' && <SimplePricingManager aiMode={aiMode} />}
            {activeSection === 'settings' && <SiteSettingsManager />}
            {activeSection === 'seo' && <SimpleSEOManager aiMode={aiMode} />}
          </div>
        )}
      </div>

      {/* AI Copilot Widget - Floating Assistant */}
      <AICopilotWidget />
    </div>
  );
}
