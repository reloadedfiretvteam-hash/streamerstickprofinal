import { useState, useEffect } from 'react';
import {
  Shield, LogOut, Package, ShoppingCart, Users, FileText, Image, Settings,
  TrendingUp, BarChart3, Mail, Layout, Palette,
  Globe, Bell, Archive, RefreshCw, Download, Upload, Edit3,
  Columns, DollarSign,
  Tag, MessageCircle, Star, Video, HelpCircle, Clock, GitBranch,
  Search, Home
} from 'lucide-react';

// Import all admin components
import FullFeaturedProductManager from '../components/custom-admin/FullFeaturedProductManager';
import CategoryManager from '../components/custom-admin/CategoryManager';
import FileUploadManager from '../components/custom-admin/FileUploadManager';
import EnhancedMediaLibrary from '../components/custom-admin/EnhancedMediaLibrary';
import RankMathProSEO from '../components/custom-admin/RankMathProSEO';
import ComprehensiveCustomerManager from '../components/custom-admin/ComprehensiveCustomerManager';
import EnhancedPromotionsManager from '../components/custom-admin/EnhancedPromotionsManager';
import BulkEmailManager from '../components/custom-admin/BulkEmailManager';
import EnhancedVisualPageBuilder from '../components/custom-admin/EnhancedVisualPageBuilder';
import AdvancedBlogManager from '../components/custom-admin/AdvancedBlogManager';
import VisualSectionManager from '../components/custom-admin/VisualSectionManager';
import TutorialBoxEditor from '../components/custom-admin/TutorialBoxEditor';
import FAQManager from '../components/custom-admin/FAQManager';
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import LiveChatManager from '../components/custom-admin/LiveChatManager';
import AffiliateManager from '../components/custom-admin/AffiliateManager';
import ReviewsManager from '../components/custom-admin/ReviewsManager';
import AdvancedAnalytics from '../components/custom-admin/AdvancedAnalytics';
import SubscriptionManager from '../components/custom-admin/SubscriptionManager';
import RealTimePaymentConfig from '../components/custom-admin/RealTimePaymentConfig';
import SecurityManager from '../components/custom-admin/SecurityManager';
import RevenueDashboard from '../components/custom-admin/RevenueDashboard';
import OrdersCustomersManager from '../components/custom-admin/OrdersCustomersManager';
import MathRankSEODashboard from '../components/custom-admin/MathRankSEODashboard';
import GoogleAnalyticsManager from '../components/custom-admin/GoogleAnalyticsManager';
import RedirectsManager from '../components/custom-admin/RedirectsManager';
import PaymentGatewayManager from '../components/custom-admin/PaymentGatewayManager';
import EmailTemplateManager from '../components/custom-admin/EmailTemplateManager';
import SimpleContentEditor from '../components/custom-admin/SimpleContentEditor';
import SimplePricingManager from '../components/custom-admin/SimplePricingManager';

export default function EnterpriseAdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('enterprise_admin_token');
    const user = localStorage.getItem('enterprise_admin_user');

    if (!token || token !== 'authenticated') {
      window.location.href = '/admin-portal';
      return;
    }

    if (user) {
      setAdminUser(JSON.parse(user));
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('enterprise_admin_token');
      localStorage.removeItem('enterprise_admin_user');
      localStorage.removeItem('enterprise_admin_session');
      window.location.href = '/admin-portal';
    }
  };

  const menuSections = [
    {
      title: 'Dashboard',
      items: [
        { id: 'overview', label: 'Overview', icon: Home, color: 'blue' },
        { id: 'revenue', label: 'Revenue Analytics', icon: DollarSign, color: 'green' },
        { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3, color: 'purple' },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { id: 'products', label: 'Products (Full Control)', icon: Package, color: 'blue' },
        { id: 'categories', label: 'Categories', icon: Tag, color: 'cyan' },
        { id: 'blog', label: 'Blog Manager', icon: FileText, color: 'green' },
        { id: 'sections', label: 'Visual Sections', icon: Layout, color: 'orange' },
        { id: 'content-editor', label: 'Content Editor', icon: Edit3, color: 'purple' },
        { id: 'tutorials', label: 'Tutorial Boxes', icon: Video, color: 'red' },
        { id: 'faq', label: 'FAQ Manager', icon: HelpCircle, color: 'yellow' },
      ]
    },
    {
      title: 'Media & Assets',
      items: [
        { id: 'file-upload', label: 'File Upload/Download', icon: Upload, color: 'blue' },
        { id: 'media', label: 'Media Library', icon: Image, color: 'green' },
      ]
    },
    {
      title: 'Sales & Marketing',
      items: [
        { id: 'orders-customers', label: 'Orders & Customers', icon: ShoppingCart, color: 'blue' },
        { id: 'customers', label: 'Customer Management', icon: Users, color: 'cyan' },
        { id: 'promotions', label: 'Promotions & Coupons', icon: Tag, color: 'red' },
        { id: 'pricing', label: 'Pricing Manager', icon: DollarSign, color: 'green' },
        { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, color: 'purple' },
        { id: 'affiliates', label: 'Affiliate Program', icon: Users, color: 'orange' },
        { id: 'reviews', label: 'Reviews Manager', icon: Star, color: 'yellow' },
      ]
    },
    {
      title: 'Communication',
      items: [
        { id: 'bulk-email', label: 'Email Campaigns', icon: Mail, color: 'blue' },
        { id: 'email-templates', label: 'Email Templates', icon: FileText, color: 'cyan' },
        { id: 'live-chat', label: 'Live Chat', icon: MessageCircle, color: 'green' },
      ]
    },
    {
      title: 'SEO & Analytics',
      items: [
        { id: 'seo-rankmath', label: 'Rank Math Pro SEO', icon: TrendingUp, color: 'orange' },
        { id: 'seo-dashboard', label: 'SEO Dashboard', icon: Globe, color: 'blue' },
        { id: 'google-analytics', label: 'Google Analytics', icon: BarChart3, color: 'red' },
        { id: 'redirects', label: 'Redirects Manager', icon: GitBranch, color: 'purple' },
      ]
    },
    {
      title: 'Design & Layout',
      items: [
        { id: 'page-builder', label: 'Visual Page Builder', icon: Layout, color: 'purple' },
        { id: 'site-settings', label: 'Site Settings', icon: Settings, color: 'gray' },
      ]
    },
    {
      title: 'System & Security',
      items: [
        { id: 'payment-gateway', label: 'Payment Gateways', icon: DollarSign, color: 'green' },
        { id: 'payment-config', label: 'Payment Config', icon: Settings, color: 'blue' },
        { id: 'security', label: 'Security Manager', icon: Shield, color: 'red' },
        { id: 'backup', label: 'Backup & Restore', icon: Archive, color: 'orange' },
        { id: 'logs', label: 'Activity Logs', icon: Clock, color: 'gray' },
      ]
    }
  ];

  const filteredSections = searchQuery
    ? menuSections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(section => section.items.length > 0)
    : menuSections;

  const renderContent = () => {
    switch (activeSection) {
      case 'products':
        return <FullFeaturedProductManager />;
      case 'categories':
        return <CategoryManager />;
      case 'file-upload':
        return <FileUploadManager />;
      case 'media':
        return <EnhancedMediaLibrary />;
      case 'seo-rankmath':
        return <RankMathProSEO />;
      case 'customers':
        return <ComprehensiveCustomerManager />;
      case 'promotions':
        return <EnhancedPromotionsManager />;
      case 'bulk-email':
        return <BulkEmailManager />;
      case 'page-builder':
        return <EnhancedVisualPageBuilder />;
      case 'blog':
        return <AdvancedBlogManager />;
      case 'sections':
        return <VisualSectionManager />;
      case 'tutorials':
        return <TutorialBoxEditor />;
      case 'faq':
        return <FAQManager />;
      case 'site-settings':
        return <SiteSettingsManager />;
      case 'live-chat':
        return <LiveChatManager />;
      case 'affiliates':
        return <AffiliateManager />;
      case 'reviews':
        return <ReviewsManager />;
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'payment-config':
        return <RealTimePaymentConfig />;
      case 'security':
        return <SecurityManager />;
      case 'revenue':
        return <RevenueDashboard />;
      case 'orders-customers':
        return <OrdersCustomersManager />;
      case 'seo-dashboard':
        return <MathRankSEODashboard />;
      case 'google-analytics':
        return <GoogleAnalyticsManager />;
      case 'redirects':
        return <RedirectsManager />;
      case 'payment-gateway':
        return <PaymentGatewayManager />;
      case 'email-templates':
        return <EmailTemplateManager />;
      case 'content-editor':
        return <SimpleContentEditor aiMode={false} />;
      case 'pricing':
        return <SimplePricingManager aiMode={false} />;
      case 'overview':
        return <DashboardOverview />;
      case 'backup':
        return <BackupRestorePanel />;
      case 'logs':
        return <ActivityLogsPanel />;
      default:
        return <DashboardOverview />;
    }
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-gray-900/80 backdrop-blur-sm border-r border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm">Enterprise</h2>
                  <p className="text-gray-400 text-xs">Admin Portal</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <Columns className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredSections.map((section, idx) => (
            <div key={idx}>
              {!sidebarCollapsed && (
                <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          {!sidebarCollapsed && (
            <div className="mb-3 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {adminUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{adminUser.username}</p>
                  <p className="text-gray-400 text-xs capitalize">{adminUser.role || 'Administrator'}</p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {filteredSections.flatMap(s => s.items).find(i => i.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-400 text-sm">Enterprise-level control panel</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Enterprise Admin Portal</h2>
        <p className="text-blue-100">You have 110% unrestricted access to all site elements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Full</span>
          </div>
          <p className="text-gray-400 text-sm">Content Control</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Layout className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">100%</span>
          </div>
          <p className="text-gray-400 text-sm">Layout Access</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Palette className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">All</span>
          </div>
          <p className="text-gray-400 text-sm">Design Tools</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8 text-red-400" />
            <span className="text-2xl font-bold text-white">Max</span>
          </div>
          <p className="text-gray-400 text-sm">Security Level</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-white text-lg font-bold mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left">
            <Package className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-white text-sm font-medium">Products</p>
          </button>
          <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left">
            <Users className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-white text-sm font-medium">Customers</p>
          </button>
          <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left">
            <BarChart3 className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-white text-sm font-medium">Analytics</p>
          </button>
          <button className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-left">
            <Settings className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-white text-sm font-medium">Settings</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Backup & Restore Panel
function BackupRestorePanel() {
  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Backup & Restore</h2>
      <div className="space-y-4">
        <button className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Create Full Backup
        </button>
        <button className="w-full p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          Restore from Backup
        </button>
        <button className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2">
          <Clock className="w-5 h-5" />
          Schedule Auto Backup
        </button>
      </div>
    </div>
  );
}

// Activity Logs Panel
function ActivityLogsPanel() {
  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">Activity Logs</h2>
      <p className="text-gray-400">All administrative actions are logged and monitored for security.</p>
    </div>
  );
}
