import { useState, useEffect } from 'react';
import {
  Package, FileText, ShoppingCart, Settings, LogOut,
  TrendingUp, HelpCircle, Image, DollarSign, CreditCard, Flame, X,
  Grid, Eye, Edit3, Users, Shield, Search, BarChart3, Mail, Zap,
  Code, Layout, Globe, Video, Bell, Camera, FileUp, Link2, Sparkles,
  Palette, Monitor, Smartphone, Layers, Building2, Gift, AlertCircle,
  CheckCircle, Database, Server, Activity, MessageSquare, TrendingDown,
  Award, Target, BookOpen, Headphones, Star, Coins, Bot, Rocket, FileCheck,
  Home, Tag, Repeat
} from 'lucide-react';

// Content Management
import EnhancedBlogManager from '../components/custom-admin/EnhancedBlogManager';
import AdvancedBlogManager from '../components/custom-admin/AdvancedBlogManager';
import RealBlogManager from '../components/custom-admin/RealBlogManager';

// Product Management
import RealProductManager from '../components/custom-admin/RealProductManager';
import FullProductManager from '../components/custom-admin/FullProductManager';
import FullFeaturedProductManager from '../components/custom-admin/FullFeaturedProductManager';
import UltraProductManager from '../components/custom-admin/UltraProductManager';
import SimpleProductManager from '../components/custom-admin/SimpleProductManager';
import StripeProductManager from '../components/custom-admin/StripeProductManager';
import CategoryManager from '../components/custom-admin/CategoryManager';

// Orders & Customers
import OrdersCustomersManager from '../components/custom-admin/OrdersCustomersManager';
import ComprehensiveCustomerManager from '../components/custom-admin/ComprehensiveCustomerManager';
import BitcoinOrdersManager from '../components/custom-admin/BitcoinOrdersManager';
import RevenueDashboard from '../components/custom-admin/RevenueDashboard';

// SEO & Analytics
import MathRankSEODashboard from '../components/custom-admin/MathRankSEODashboard';
import RankMathProSEO from '../components/custom-admin/RankMathProSEO';
import RankMathProSEOManager from '../components/custom-admin/RankMathProSEOManager';
import CompleteSEOManager from '../components/custom-admin/CompleteSEOManager';
import SimpleSEOManager from '../components/custom-admin/SimpleSEOManager';
import SearchEngineManager from '../components/custom-admin/SearchEngineManager';
import AdvancedAnalytics from '../components/custom-admin/AdvancedAnalytics';
import GoogleAnalyticsManager from '../components/custom-admin/GoogleAnalyticsManager';

// Media & Images
import EnhancedMediaLibrary from '../components/custom-admin/EnhancedMediaLibrary';
import MediaLibrary from '../components/custom-admin/MediaLibrary';
import SimpleImageManager from '../components/custom-admin/SimpleImageManager';
import FileUploadManager from '../components/custom-admin/FileUploadManager';
import ImageUpload from '../components/ImageUpload';

// Page Building & Design
import VisualPageBuilder from '../components/custom-admin/VisualPageBuilder';
import EnhancedVisualPageBuilder from '../components/custom-admin/EnhancedVisualPageBuilder';
import ElementorStylePageBuilder from '../components/custom-admin/ElementorStylePageBuilder';
import FrontendVisualEditor from '../components/custom-admin/FrontendVisualEditor';
import FrontendControlPanel from '../components/custom-admin/FrontendControlPanel';
import VisualSectionManager from '../components/custom-admin/VisualSectionManager';
import HomepageSectionEditor from '../components/custom-admin/HomepageSectionEditor';
import SimpleContentEditor from '../components/custom-admin/SimpleContentEditor';

// Site Configuration
import SiteSettingsManager from '../components/custom-admin/SiteSettingsManager';
import SiteBrandingManager from '../components/custom-admin/SiteBrandingManager';
import CarouselManager from '../components/custom-admin/CarouselManager';
import FAQManager from '../components/custom-admin/FAQManager';
import ReviewsManager from '../components/custom-admin/ReviewsManager';
import TutorialBoxEditor from '../components/custom-admin/TutorialBoxEditor';

// Promotions & Marketing
import EnhancedPromotionsManager from '../components/custom-admin/EnhancedPromotionsManager';
import SimplePricingManager from '../components/custom-admin/SimplePricingManager';
import MarketingAutomation from '../components/custom-admin/MarketingAutomation';
import BulkEmailManager from '../components/custom-admin/BulkEmailManager';
import EmailTemplateManager from '../components/custom-admin/EmailTemplateManager';
import AffiliateManager from '../components/custom-admin/AffiliateManager';

// Payments
import PaymentGatewayManager from '../components/custom-admin/PaymentGatewayManager';
import SimplePaymentSettings from '../components/custom-admin/SimplePaymentSettings';
import RealTimePaymentConfig from '../components/custom-admin/RealTimePaymentConfig';
import NOWPaymentsManager from '../components/custom-admin/NOWPaymentsManager';
import SubscriptionManager from '../components/custom-admin/SubscriptionManager';

// AI & Automation
import AICopilot from '../components/custom-admin/AICopilot';
import AICopilotWidget from '../components/custom-admin/AICopilotWidget';
import SuperAICopilot from '../components/custom-admin/SuperAICopilot';
import AmazonAIAssistant from '../components/custom-admin/AmazonAIAssistant';
import AmazonFireStickAutomation from '../components/custom-admin/AmazonFireStickAutomation';
import RealAIVideoGenerator from '../components/custom-admin/RealAIVideoGenerator';

// Forms & Popups
import AdvancedFormBuilder from '../components/custom-admin/AdvancedFormBuilder';
import PopupBuilder from '../components/custom-admin/PopupBuilder';

// System & Security
import SecurityManager from '../components/custom-admin/SecurityManager';
import SystemHealthCheck from '../components/custom-admin/SystemHealthCheck';
import RedirectsManager from '../components/custom-admin/RedirectsManager';
import GitHubCloudflareConfig from '../components/custom-admin/GitHubCloudflareConfig';

// Live Features
import LiveVisitorStatistics from '../components/custom-admin/LiveVisitorStatistics';
import LiveChatManager from '../components/custom-admin/LiveChatManager';

// Dashboard Components
import AdminDashboardOverview from '../components/custom-admin/AdminDashboardOverview';
import AdminModalWrapper from '../components/custom-admin/AdminModalWrapper';

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
  const [_loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  const tools: ModalTool[] = [
    // === CONTENT MANAGEMENT ===
    {
      id: 'blog',
      title: 'Blog Posts Manager',
      icon: FileText,
      color: 'from-blue-500 to-purple-600',
      description: 'Manage blog posts with Rank Math Pro SEO scoring, file uploads, and real-time analytics',
      component: EnhancedBlogManager
    },
    {
      id: 'advanced-blog',
      title: 'Advanced Blog Manager',
      icon: BookOpen,
      color: 'from-indigo-500 to-blue-600',
      description: 'Advanced blog management with categories, tags, and scheduling',
      component: AdvancedBlogManager
    },
    {
      id: 'real-blog',
      title: 'Real Blog Manager',
      icon: FileCheck,
      color: 'from-purple-500 to-pink-600',
      description: 'Complete blog management with full editing capabilities',
      component: RealBlogManager
    },

    // === PRODUCT MANAGEMENT ===
    {
      id: 'products',
      title: 'Product Manager',
      icon: Package,
      color: 'from-green-500 to-emerald-600',
      description: 'Add, edit, and delete products with pricing, images, and inventory management',
      component: RealProductManager
    },
    {
      id: 'full-products',
      title: 'Full Product Manager',
      icon: Package,
      color: 'from-emerald-500 to-teal-600',
      description: 'Complete product management with all features and variations',
      component: FullProductManager
    },
    {
      id: 'ultra-products',
      title: 'Ultra Product Manager',
      icon: Package,
      color: 'from-teal-500 to-cyan-600',
      description: 'Advanced product management with bulk operations and advanced settings',
      component: UltraProductManager
    },
    {
      id: 'stripe-products',
      title: 'Stripe Products',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      description: 'Manage Stripe payment products and pricing',
      component: StripeProductManager
    },
    {
      id: 'categories',
      title: 'Category Manager',
      icon: Layers,
      color: 'from-green-600 to-emerald-700',
      description: 'Organize products into categories and subcategories',
      component: CategoryManager
    },

    // === ORDERS & CUSTOMERS ===
    {
      id: 'orders',
      title: 'Orders & Customers',
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-600',
      description: 'View and manage all orders, track payments, and manage customer data',
      component: OrdersCustomersManager
    },
    {
      id: 'customers',
      title: 'Customer Manager',
      icon: Users,
      color: 'from-orange-600 to-red-700',
      description: 'Comprehensive customer management and analytics',
      component: ComprehensiveCustomerManager
    },
    {
      id: 'bitcoin',
      title: 'Bitcoin Payments',
      icon: Coins,
      color: 'from-amber-500 to-yellow-600',
      description: 'Track Bitcoin and cryptocurrency payment orders',
      component: BitcoinOrdersManager
    },
    {
      id: 'revenue',
      title: 'Revenue Dashboard',
      icon: DollarSign,
      color: 'from-green-600 to-emerald-700',
      description: 'Track revenue, sales analytics, and financial reports',
      component: RevenueDashboard
    },

    // === SEO & ANALYTICS ===
    {
      id: 'seo',
      title: 'SEO Manager (Rank Math)',
      icon: TrendingUp,
      color: 'from-cyan-500 to-blue-600',
      description: 'Optimize meta tags, keywords, sitemaps, and search engine visibility',
      component: MathRankSEODashboard
    },
    {
      id: 'rank-math-pro',
      title: 'Rank Math Pro SEO',
      icon: Target,
      color: 'from-blue-500 to-cyan-600',
      description: 'Advanced Rank Math Pro SEO optimization with scoring',
      component: RankMathProSEO
    },
    {
      id: 'rank-math-manager',
      title: 'Rank Math Manager',
      icon: Search,
      color: 'from-cyan-600 to-teal-600',
      description: 'Complete Rank Math SEO management suite',
      component: RankMathProSEOManager
    },
    {
      id: 'complete-seo',
      title: 'Complete SEO Manager',
      icon: Globe,
      color: 'from-indigo-500 to-purple-600',
      description: 'Full SEO management better than Rank Math Pro',
      component: CompleteSEOManager
    },
    {
      id: 'search-engine',
      title: 'Search Engine Manager',
      icon: Search,
      color: 'from-purple-500 to-pink-600',
      description: 'Manage search engine settings and visibility',
      component: SearchEngineManager
    },
    {
      id: 'analytics',
      title: 'Advanced Analytics',
      icon: BarChart3,
      color: 'from-blue-600 to-indigo-700',
      description: 'Advanced website analytics and reporting',
      component: AdvancedAnalytics
    },
    {
      id: 'google-analytics',
      title: 'Google Analytics',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      description: 'Configure and manage Google Analytics tracking',
      component: GoogleAnalyticsManager
    },

    // === MEDIA & IMAGES ===
    {
      id: 'media',
      title: 'Media Library',
      icon: Image,
      color: 'from-pink-500 to-rose-600',
      description: 'Upload, organize, and manage images, videos, and files',
      component: EnhancedMediaLibrary
    },
    {
      id: 'media-simple',
      title: 'Simple Image Manager',
      icon: Camera,
      color: 'from-pink-600 to-rose-700',
      description: 'Quick image upload and management tool',
      component: SimpleImageManager
    },
    {
      id: 'file-upload',
      title: 'File Upload Manager',
      icon: FileUp,
      color: 'from-purple-500 to-pink-600',
      description: 'Manage all file uploads and storage',
      component: FileUploadManager
    },
    {
      id: 'carousel',
      title: 'Homepage Carousel',
      icon: Grid,
      color: 'from-teal-500 to-cyan-600',
      description: 'Manage homepage carousel images and promotional banners',
      component: CarouselManager
    },

    // === PAGE BUILDING & DESIGN ===
    {
      id: 'page-builder',
      title: 'Visual Page Builder',
      icon: Layout,
      color: 'from-purple-500 to-indigo-600',
      description: 'Drag-and-drop page builder like Elementor',
      component: VisualPageBuilder
    },
    {
      id: 'enhanced-page-builder',
      title: 'Enhanced Page Builder',
      icon: Layout,
      color: 'from-indigo-500 to-blue-600',
      description: 'Advanced visual page builder with more features',
      component: EnhancedVisualPageBuilder
    },
    {
      id: 'elementor-style',
      title: 'Elementor-Style Builder',
      icon: Monitor,
      color: 'from-blue-600 to-cyan-700',
      description: 'Professional page builder matching Elementor Pro features',
      component: ElementorStylePageBuilder
    },
    {
      id: 'frontend-editor',
      title: 'Frontend Visual Editor',
      icon: Edit3,
      color: 'from-cyan-500 to-teal-600',
      description: 'Edit pages directly on the frontend with visual preview',
      component: FrontendVisualEditor
    },
    {
      id: 'frontend-control',
      title: 'Frontend Control Panel',
      icon: Settings,
      color: 'from-teal-500 to-green-600',
      description: 'Control panel for frontend editing and customization',
      component: FrontendControlPanel
    },
    {
      id: 'section-manager',
      title: 'Visual Section Manager',
      icon: Layers,
      color: 'from-green-500 to-emerald-600',
      description: 'Manage and edit website sections visually',
      component: VisualSectionManager
    },
    {
      id: 'homepage-editor',
      title: 'Homepage Section Editor',
      icon: Home,
      color: 'from-orange-500 to-red-600',
      description: 'Edit homepage sections, images, and content',
      component: HomepageSectionEditor
    },
    {
      id: 'content-editor',
      title: 'Simple Content Editor',
      icon: FileText,
      color: 'from-gray-500 to-slate-600',
      description: 'Quick content editing tool for pages',
      component: SimpleContentEditor
    },

    // === SITE CONFIGURATION ===
    {
      id: 'settings',
      title: 'Site Settings',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      description: 'Configure site-wide settings, branding, and integrations',
      component: SiteSettingsManager
    },
    {
      id: 'branding',
      title: 'Site Branding',
      icon: Palette,
      color: 'from-pink-500 to-rose-600',
      description: 'Manage logos, colors, fonts, and brand identity',
      component: SiteBrandingManager
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
      id: 'reviews',
      title: 'Reviews Manager',
      icon: Star,
      color: 'from-yellow-500 to-orange-600',
      description: 'Manage customer reviews and testimonials',
      component: ReviewsManager
    },
    {
      id: 'tutorials',
      title: 'Tutorial Box Editor',
      icon: Video,
      color: 'from-red-500 to-pink-600',
      description: 'Create and manage tutorial boxes and help content',
      component: TutorialBoxEditor
    },

    // === PROMOTIONS & MARKETING ===
    {
      id: 'promotions',
      title: 'Promotions & Discounts',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-600',
      description: 'Create and manage discount codes, sales, and promotional campaigns',
      component: EnhancedPromotionsManager
    },
    {
      id: 'pricing',
      title: 'Pricing Manager',
      icon: Tag,
      color: 'from-green-500 to-emerald-600',
      description: 'Manage product pricing and pricing tiers',
      component: SimplePricingManager
    },
    {
      id: 'marketing-automation',
      title: 'Marketing Automation',
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      description: 'Automated marketing campaigns and workflows',
      component: MarketingAutomation
    },
    {
      id: 'bulk-email',
      title: 'Bulk Email Manager',
      icon: Mail,
      color: 'from-blue-500 to-indigo-600',
      description: 'Send bulk emails and manage email campaigns',
      component: BulkEmailManager
    },
    {
      id: 'email-templates',
      title: 'Email Template Manager',
      icon: Mail,
      color: 'from-indigo-500 to-purple-600',
      description: 'Create and manage email templates',
      component: EmailTemplateManager
    },
    {
      id: 'affiliates',
      title: 'Affiliate Manager',
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      description: 'Manage affiliate programs and commissions',
      component: AffiliateManager
    },

    // === PAYMENTS ===
    {
      id: 'payment-gateway',
      title: 'Payment Gateway Manager',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-600',
      description: 'Configure payment gateways (Stripe, Square, etc.)',
      component: PaymentGatewayManager
    },
    {
      id: 'payment-settings',
      title: 'Payment Settings',
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      description: 'Simple payment configuration and settings',
      component: SimplePaymentSettings
    },
    {
      id: 'payment-config',
      title: 'Real-Time Payment Config',
      icon: CreditCard,
      color: 'from-indigo-500 to-purple-600',
      description: 'Real-time payment configuration and testing',
      component: RealTimePaymentConfig
    },
    {
      id: 'nowpayments',
      title: 'NOWPayments Manager',
      icon: Coins,
      color: 'from-orange-500 to-red-600',
      description: 'Manage NOWPayments cryptocurrency payments',
      component: NOWPaymentsManager
    },
    {
      id: 'subscriptions',
      title: 'Subscription Manager',
      icon: Repeat,
      color: 'from-purple-500 to-pink-600',
      description: 'Manage recurring subscriptions and billing',
      component: SubscriptionManager
    },

    // === AI & AUTOMATION ===
    {
      id: 'ai-copilot',
      title: 'AI Copilot',
      icon: Bot,
      color: 'from-purple-500 to-indigo-600',
      description: 'AI assistant for content creation and management',
      component: AICopilot
    },
    {
      id: 'super-ai-copilot',
      title: 'Super AI Copilot',
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-600',
      description: 'Advanced AI copilot with enhanced capabilities',
      component: SuperAICopilot
    },
    {
      id: 'ai-copilot-widget',
      title: 'AI Copilot Widget',
      icon: Bot,
      color: 'from-purple-600 to-pink-700',
      description: 'Embeddable AI copilot widget',
      component: AICopilotWidget
    },
    {
      id: 'amazon-ai',
      title: 'Amazon AI Assistant',
      icon: Bot,
      color: 'from-orange-500 to-red-600',
      description: 'AI assistant for Amazon Fire Stick automation',
      component: AmazonAIAssistant
    },
    {
      id: 'firestick-automation',
      title: 'Fire Stick Automation',
      icon: Zap,
      color: 'from-orange-600 to-red-700',
      description: 'Automate Fire Stick setup and configuration',
      component: AmazonFireStickAutomation
    },
    {
      id: 'ai-video-generator',
      title: 'AI Video Generator',
      icon: Video,
      color: 'from-red-500 to-pink-600',
      description: 'Generate videos using AI technology',
      component: RealAIVideoGenerator
    },

    // === FORMS & POPUPS ===
    {
      id: 'form-builder',
      title: 'Advanced Form Builder',
      icon: FileText,
      color: 'from-blue-500 to-cyan-600',
      description: 'Build custom forms with advanced fields and validation',
      component: AdvancedFormBuilder
    },
    {
      id: 'popup-builder',
      title: 'Popup Builder',
      icon: Bell,
      color: 'from-yellow-500 to-orange-600',
      description: 'Create and manage popup modals and announcements',
      component: PopupBuilder
    },

    // === SYSTEM & SECURITY ===
    {
      id: 'security',
      title: 'Security Manager',
      icon: Shield,
      color: 'from-red-500 to-orange-600',
      description: 'Manage security settings, access control, and monitoring',
      component: SecurityManager
    },
    {
      id: 'system-health',
      title: 'System Health Check',
      icon: Activity,
      color: 'from-green-500 to-emerald-600',
      description: 'Monitor system health, performance, and diagnostics',
      component: SystemHealthCheck
    },
    {
      id: 'redirects',
      title: 'Redirects Manager',
      icon: Link2,
      color: 'from-blue-500 to-indigo-600',
      description: 'Manage URL redirects and rewrites',
      component: RedirectsManager
    },
    {
      id: 'github-cloudflare',
      title: 'GitHub & Cloudflare Config',
      icon: Code,
      color: 'from-gray-500 to-slate-600',
      description: 'Configure GitHub and Cloudflare deployment settings',
      component: GitHubCloudflareConfig
    },

    // === LIVE FEATURES ===
    {
      id: 'live-visitors',
      title: 'Live Visitor Statistics',
      icon: Eye,
      color: 'from-green-500 to-teal-600',
      description: 'Real-time visitor tracking and analytics',
      component: LiveVisitorStatistics
    },
    {
      id: 'live-chat',
      title: 'Live Chat Manager',
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-600',
      description: 'Manage live chat widget and customer support',
      component: LiveChatManager
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

  const categories = [
    { id: null, name: 'All Tools', icon: Grid },
    { id: 'content', name: 'Content', icon: FileText },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders & Customers', icon: ShoppingCart },
    { id: 'seo', name: 'SEO & Analytics', icon: TrendingUp },
    { id: 'media', name: 'Media & Images', icon: Image },
    { id: 'design', name: 'Page Building', icon: Layout },
    { id: 'site', name: 'Site Settings', icon: Settings },
    { id: 'marketing', name: 'Marketing', icon: Zap },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'ai', name: 'AI & Automation', icon: Bot },
    { id: 'system', name: 'System & Security', icon: Shield }
  ];

  const getCategoryForTool = (toolId: string): string => {
    if (toolId.includes('blog')) return 'content';
    if (toolId.includes('product') || toolId === 'categories') return 'products';
    if (toolId.includes('order') || toolId === 'customers' || toolId === 'bitcoin' || toolId === 'revenue') return 'orders';
    if (toolId.includes('seo') || toolId.includes('analytics') || toolId === 'search-engine') return 'seo';
    if (toolId.includes('media') || toolId.includes('image') || toolId === 'carousel' || toolId === 'file-upload') return 'media';
    if (toolId.includes('builder') || toolId.includes('page') || toolId.includes('editor') || toolId.includes('section')) return 'design';
    if (toolId === 'settings' || toolId === 'branding' || toolId === 'faq' || toolId === 'reviews' || toolId === 'tutorials') return 'site';
    if (toolId.includes('promotion') || toolId.includes('pricing') || toolId.includes('marketing') || toolId.includes('email') || toolId === 'affiliates') return 'marketing';
    if (toolId.includes('payment') || toolId.includes('stripe') || toolId === 'nowpayments' || toolId === 'subscriptions') return 'payments';
    if (toolId.includes('ai') || toolId.includes('copilot') || toolId.includes('automation') || toolId.includes('video-generator')) return 'ai';
    if (toolId === 'security' || toolId === 'system-health' || toolId === 'redirects' || toolId === 'github-cloudflare') return 'system';
    if (toolId === 'live-visitors' || toolId === 'live-chat') return 'system';
    return 'site';
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = searchQuery === '' || 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || getCategoryForTool(tool.id) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Admin Tools ({filteredTools.length})</h3>
              <p className="text-gray-400">Click any tool to open it in a full-screen modal window</p>
            </div>
            
            {/* Search Bar */}
            <div className="flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id || 'all'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">No tools found matching your search.</p>
              </div>
            ) : (
              filteredTools.map((tool) => {
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
            })
            )}
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
