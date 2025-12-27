import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useLocation } from "wouter";
import { apiCall } from "@/lib/api";
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Settings, 
  Plus, 
  Search,
  MoreHorizontal,
  Users,
  Eye,
  Clock,
  Activity,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  TrendingUp,
  Edit,
  Trash2,
  Save,
  X,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Flame,
  RefreshCw,
  Upload,
  Loader2,
  Palette,
  Type,
  ExternalLink,
  Truck,
  Copy,
  ShoppingCart,
  Lock,
  LogOut,
  Sparkles,
  BookOpen,
  BarChart3,
  Wand2,
  List,
  Hash,
  Target,
  Github,
  GitBranch,
  CloudUpload,
  CheckCheck,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, getStorageUrl, formatPriceDisplay, centsToDollars, dollarsToCents } from "@/lib/supabase";
import SeoToolkit from "@/components/seo/SeoToolkit";
import ModernLiveVisitors from "@/components/admin/ModernLiveVisitors";
import ComprehensiveOrderData from "@/components/admin/ComprehensiveOrderData";

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  onlineNow: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  topCountries: Array<{ name: string; count: number }>;
  topRegions: Array<{ name: string; count: number }>;
  topCities: Array<{ name: string; count: number }>;
  recentVisitors: Array<{
    id: string;
    pageUrl: string;
    referrer: string | null;
    userAgent: string;
    ipAddress: string | null;
    country: string | null;
    countryCode: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
    isProxy: boolean | null;
    createdAt: string;
  }>;
}

interface PageEdit {
  id: string;
  pageId: string;
  sectionId: string;
  elementId: string;
  elementType: string;
  content: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FulfillmentOrder {
  id: string;
  customerEmail: string;
  customerName: string | null;
  realProductName: string | null;
  amount: number;
  status: string | null;
  shippingName: string | null;
  shippingPhone: string | null;
  shippingStreet: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZip: string | null;
  shippingCountry: string | null;
  fulfillmentStatus: string | null;
  amazonOrderId: string | null;
  createdAt: string | null;
}

interface Customer {
  id: string;
  username: string;
  password: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  status: string | null;
  notes: string | null;
  totalOrders: number | null;
  lastOrderAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface CustomerOrder {
  id: string;
  realProductName: string | null;
  amount: number;
  status: string | null;
  createdAt: string | null;
}

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
    customerName: string | null;
    productName: string | null;
    amount: number;
    status: string | null;
    fulfillmentStatus: string | null;
    createdAt: string | null;
  }>;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price: number | null;
  sku: string;
  stock_quantity: number;
  stock_status: string;
  category: string;
  status: string;
  featured: boolean;
  main_image: string;
  cloaked_name: string;
  sort_order?: number;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[] | null;
  readTime: string | null;
  wordCount: number | null;
  headingScore: number | null;
  keywordDensityScore: number | null;
  contentLengthScore: number | null;
  metaScore: number | null;
  structureScore: number | null;
  overallSeoScore: number | null;
  seoAnalysis: string | null;
  featured: boolean | null;
  published: boolean | null;
  publishedAt: string | null;
  linkedProductIds: string[] | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AIGenerationRequest {
  topic: string;
  keywords?: string[];
  tone?: 'professional' | 'casual' | 'educational' | 'persuasive' | 'entertaining';
  length?: 'short' | 'medium' | 'long' | 'comprehensive';
  category?: string;
  targetAudience?: string;
  includeHeadings?: boolean;
  includeLists?: boolean;
  includeFAQ?: boolean;
  productContext?: string;
}

interface GeneratedContent {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  faq?: { question: string; answer: string }[];
}

const shadowProductMap: Record<string, string> = {
  "Fire Stick HD": "Web Design Basic",
  "Fire Stick 4K": "Web Design Pro",
  "Fire Stick 4K Max": "Web Design Enterprise",
  "1 Month IPTV": "SEO Basic",
  "3 Month IPTV": "SEO Standard",
  "6 Month IPTV": "SEO Pro",
  "1 Year IPTV": "SEO Enterprise"
};

const AUTH_TOKEN_KEY = 'admin_auth_token';

function getStoredToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }
  return null;
}

function setStoredToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

function clearStoredToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [, setLocation] = useLocation();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    weekVisitors: 0,
    onlineNow: 0,
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    topCountries: [],
    topRegions: [],
    topCities: [],
    recentVisitors: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [pageEdits, setPageEdits] = useState<PageEdit[]>([]);
  const [loadingEdits, setLoadingEdits] = useState(true);
  const [editingPageEdit, setEditingPageEdit] = useState<Partial<PageEdit> | null>(null);

  const [fulfillmentOrders, setFulfillmentOrders] = useState<FulfillmentOrder[]>([]);
  const [loadingFulfillment, setLoadingFulfillment] = useState(true);
  const [updatingFulfillment, setUpdatingFulfillment] = useState<string | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingCustomerOrders, setLoadingCustomerOrders] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState<Partial<Customer> | null>(null);

  const [orderStats, setOrderStats] = useState<OrderStats>({
    totalOrders: 0,
    ordersToday: 0,
    ordersThisWeek: 0,
    ordersThisMonth: 0,
    totalRevenue: 0,
    revenueToday: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0,
    pendingFulfillments: 0,
    recentOrders: []
  });
  const [loadingOrderStats, setLoadingOrderStats] = useState(true);

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPost> | null>(null);
  const [blogSearchTerm, setBlogSearchTerm] = useState("");
  const [blogView, setBlogView] = useState<'list' | 'create' | 'edit'>('list');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiRequest, setAiRequest] = useState<AIGenerationRequest>({
    topic: '',
    keywords: [],
    tone: 'professional',
    length: 'medium',
    category: 'streaming',
    targetAudience: 'cord-cutters and streaming enthusiasts',
    includeHeadings: true,
    includeLists: true,
    includeFAQ: false
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(null);
  const [savingBlogPost, setSavingBlogPost] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");

  const [githubStatus, setGithubStatus] = useState<{ connected: boolean; username?: string; avatarUrl?: string; error?: string } | null>(null);
  const [githubRepos, setGithubRepos] = useState<Array<{ id: number; name: string; fullName: string; private: boolean; defaultBranch: string; htmlUrl: string }>>([]);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [pushBranch, setPushBranch] = useState("clean main");
  const [pushMessage, setPushMessage] = useState("");
  const [pushing, setPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; commitUrl?: string; filesCount?: number } | null>(null);

  const [envStatus, setEnvStatus] = useState<{
    hasStripeKey?: boolean;
    hasWebhookSecret?: boolean;
    hasResendKey?: boolean;
    hasFromEmail?: boolean;
    hasSupabaseKey?: boolean;
    hasAdminUsername?: boolean;
    hasAdminPassword?: boolean;
    nodeEnv?: string;
    fromEmail?: string;
    supabaseUrl?: string;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = authToken || getStoredToken();
    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return apiCall(url, { ...options, headers });
  }, [authToken]);

  const checkAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    try {
      const response = await apiCall('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      
      if (result.valid) {
        setAuthToken(token);
        setIsAuthenticated(true);
      } else {
        clearStoredToken();
        setAuthToken(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearStoredToken();
      setAuthToken(null);
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const response = await apiCall('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const result = await response.json();

      if (result.success && result.token) {
        setStoredToken(result.token);
        setAuthToken(result.token);
        setIsAuthenticated(true);
        setLoginForm({ username: '', password: '' });
        showToast('Login successful!', 'success');
      } else {
        setLoginError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Connection failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setAuthToken(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully', 'success');
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    loadVisitorStats();
    loadOrderStats();
    loadProducts();
    loadPageEdits();
    loadFulfillmentOrders();
    loadCustomers();
    loadBlogPosts();
    
    // Load environment status
    const loadEnvStatus = async () => {
      try {
        const response = await authFetch('/api/debug');
        const data = await response.json();
        setEnvStatus({
          hasStripeKey: !!data.stripe?.hasSecretKey,
          hasWebhookSecret: !!data.stripe?.hasWebhookSecret,
          hasResendKey: !!data.email?.hasResendKey,
          hasFromEmail: !!data.email?.hasFromEmail,
          hasSupabaseKey: !!data.supabase?.hasServiceKey,
          hasAdminUsername: !!data.auth?.hasAdminUsername,
          hasAdminPassword: !!data.auth?.hasAdminPassword,
          nodeEnv: data.nodeEnv,
          fromEmail: data.email?.fromEmail,
          supabaseUrl: data.supabase?.url
        });
      } catch (error) {
        console.error('Failed to load environment status:', error);
      }
    };
    loadEnvStatus();
    
    const interval = setInterval(() => {
      loadVisitorStats();
      loadOrderStats();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const loadOrderStats = async () => {
    try {
      setLoadingOrderStats(true);
      const response = await authFetch('/api/admin/orders/stats');
      const result = await response.json();
      
      if (result.data) {
        setOrderStats(result.data);
      }
    } catch (error) {
      console.error('Error loading order statistics:', error);
    } finally {
      setLoadingOrderStats(false);
    }
  };

  const loadVisitorStats = async () => {
    try {
      setLoadingStats(true);
      
      const response = await authFetch('/api/admin/visitors/stats');
      const result = await response.json();
      
      if (result.data) {
        const { totalVisitors, todayVisitors, weekVisitors, onlineNow, recentVisitors, topCountries, topRegions, topCities } = result.data;
        
        const deviceBreakdown = {
          desktop: recentVisitors.filter((v: any) => {
            const ua = (v.userAgent || '').toLowerCase();
            return !ua.includes('mobile') && !ua.includes('tablet');
          }).length,
          mobile: recentVisitors.filter((v: any) => {
            const ua = (v.userAgent || '').toLowerCase();
            return ua.includes('mobile') && !ua.includes('tablet');
          }).length,
          tablet: recentVisitors.filter((v: any) => {
            const ua = (v.userAgent || '').toLowerCase();
            return ua.includes('tablet');
          }).length
        };

        const mappedRecentVisitors = recentVisitors.map((v: any) => ({
          id: v.id || 'unknown',
          pageUrl: v.pageUrl || '/',
          referrer: v.referrer || null,
          userAgent: v.userAgent || 'Unknown',
          ipAddress: v.ipAddress || null,
          country: v.country || null,
          countryCode: v.countryCode || null,
          region: v.region || null,
          city: v.city || null,
          timezone: v.timezone || null,
          isProxy: v.isProxy || false,
          createdAt: v.createdAt || new Date().toISOString()
        }));

        setVisitorStats({
          totalVisitors,
          todayVisitors,
          weekVisitors,
          onlineNow,
          deviceBreakdown,
          topCountries: topCountries || [],
          topRegions: topRegions || [],
          topCities: topCities || [],
          recentVisitors: mappedRecentVisitors
        });
      }
    } catch (error) {
      console.error('Error loading visitor statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await authFetch('/api/admin/products');
      const result = await response.json();
      if (result.data) {
        setProducts(result.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          slug: p.id,
          description: p.description || '',
          price: p.price,
          sale_price: null,
          sku: p.id,
          stock_quantity: 100,
          stock_status: 'instock',
          category: p.category === 'firestick' ? 'devices' : 'subscriptions',
          status: 'publish',
          featured: false,
          main_image: p.imageUrl || '',
          cloaked_name: p.shadowProductId || '',
          sort_order: 0
        })));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
    setLoadingProducts(false);
  };

  const loadBlogPosts = async () => {
    setLoadingBlogPosts(true);
    try {
      const response = await authFetch('/api/admin/blog/posts');
      const result = await response.json();
      if (result.data) {
        setBlogPosts(result.data);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoadingBlogPosts(false);
    }
  };

  const generateAIContent = async () => {
    if (!aiRequest.topic.trim()) {
      showToast('Please enter a topic for AI content generation', 'error');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await authFetch('/api/admin/blog/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiRequest)
      });
      const result = await response.json();

      if (result.data) {
        setGeneratedContent(result.data);
        setEditingBlogPost({
          title: result.data.title,
          slug: result.data.slug,
          excerpt: result.data.excerpt,
          content: result.data.content,
          metaTitle: result.data.metaTitle,
          metaDescription: result.data.metaDescription,
          keywords: result.data.keywords,
          category: result.data.category || aiRequest.category || 'streaming',
          featured: false,
          published: false
        });
        showToast('AI content generated successfully!', 'success');
      } else {
        showToast(result.error || 'Failed to generate content', 'error');
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      showToast('Failed to generate AI content', 'error');
    } finally {
      setAiGenerating(false);
    }
  };

  const saveBlogPost = async () => {
    if (!editingBlogPost?.title || !editingBlogPost?.content || !editingBlogPost?.excerpt) {
      showToast('Title, content, and excerpt are required', 'error');
      return;
    }

    setSavingBlogPost(true);
    try {
      const isNew = !editingBlogPost.id;
      const url = isNew ? '/api/admin/blog/posts' : `/api/admin/blog/posts/${editingBlogPost.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const slug = editingBlogPost.slug || editingBlogPost.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);

      const response = await authFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingBlogPost,
          slug
        })
      });

      const result = await response.json();

      if (response.ok) {
        showToast(`Blog post ${isNew ? 'created' : 'updated'} successfully!`, 'success');
        loadBlogPosts();
        setBlogView('list');
        setEditingBlogPost(null);
        setGeneratedContent(null);
        if (result.seoAnalysis) {
          setSeoAnalysis(result.seoAnalysis);
        }
      } else {
        showToast(result.error || 'Failed to save blog post', 'error');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      showToast('Failed to save blog post', 'error');
    } finally {
      setSavingBlogPost(false);
    }
  };

  const deleteBlogPost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This cannot be undone.')) return;

    try {
      const response = await authFetch(`/api/admin/blog/posts/${postId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Blog post deleted successfully!', 'success');
        loadBlogPosts();
      } else {
        showToast('Failed to delete blog post', 'error');
      }
    } catch (error) {
      console.error('Error deleting blog post:', error);
      showToast('Failed to delete blog post', 'error');
    }
  };

  const addKeyword = () => {
    if (keywordInput.trim() && aiRequest.keywords) {
      setAiRequest({
        ...aiRequest,
        keywords: [...aiRequest.keywords, keywordInput.trim()]
      });
      setKeywordInput('');
    }
  };

  const loadGithubStatus = async () => {
    setLoadingGithub(true);
    try {
      const response = await authFetch('/api/admin/github/status');
      const result = await response.json();
      setGithubStatus(result);
      
      if (result.connected) {
        const reposResponse = await authFetch('/api/admin/github/repos');
        const reposResult = await reposResponse.json();
        if (reposResult.data) {
          setGithubRepos(reposResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading GitHub status:', error);
      setGithubStatus({ connected: false, error: 'Failed to connect' });
    } finally {
      setLoadingGithub(false);
    }
  };

  const pushToGithub = async () => {
    if (!selectedRepo) {
      showToast('Please select a repository', 'error');
      return;
    }

    setPushing(true);
    setPushResult(null);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const response = await authFetch('/api/admin/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner,
          repo,
          branch: pushBranch,
          message: pushMessage || undefined
        })
      });
      const result = await response.json();
      
      if (result.success) {
        setPushResult({
          success: true,
          message: result.message,
          commitUrl: result.commitUrl,
          filesCount: result.filesCount
        });
        showToast('Code pushed to GitHub successfully!', 'success');
      } else {
        setPushResult({ success: false, message: result.error });
        showToast(result.error || 'Push failed', 'error');
      }
    } catch (error: any) {
      console.error('GitHub push error:', error);
      setPushResult({ success: false, message: error.message });
      showToast('Failed to push to GitHub', 'error');
    } finally {
      setPushing(false);
    }
  };

  const removeKeyword = (index: number) => {
    if (aiRequest.keywords) {
      setAiRequest({
        ...aiRequest,
        keywords: aiRequest.keywords.filter((_, i) => i !== index)
      });
    }
  };

  const getSeoScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-500';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeoScoreLabel = (score: number | null) => {
    if (!score) return 'Not analyzed';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  const filteredBlogPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
    post.category.toLowerCase().includes(blogSearchTerm.toLowerCase()) ||
    (post.keywords && post.keywords.some(k => k.toLowerCase().includes(blogSearchTerm.toLowerCase())))
  );

  const loadPageEdits = async () => {
    setLoadingEdits(true);
    try {
      const response = await authFetch('/api/admin/page-edits');
      const result = await response.json();
      if (result.data) {
        setPageEdits(result.data);
      }
    } catch (error) {
      console.error('Error loading page edits:', error);
    } finally {
      setLoadingEdits(false);
    }
  };

  const loadFulfillmentOrders = async () => {
    setLoadingFulfillment(true);
    try {
      const response = await authFetch('/api/admin/fulfillment');
      const result = await response.json();
      if (result.data) {
        setFulfillmentOrders(result.data);
      }
    } catch (error) {
      console.error('Error loading fulfillment orders:', error);
    } finally {
      setLoadingFulfillment(false);
    }
  };

  const loadCustomers = async (search?: string) => {
    setLoadingCustomers(true);
    try {
      const url = search ? `/api/admin/customers?search=${encodeURIComponent(search)}` : '/api/admin/customers';
      const response = await authFetch(url);
      const result = await response.json();
      if (result.data) {
        setCustomers(result.data);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    setLoadingCustomerOrders(true);
    try {
      const response = await authFetch(`/api/admin/customers/${customerId}/orders`);
      const result = await response.json();
      if (result.data) {
        setCustomerOrders(result.data);
      }
    } catch (error) {
      console.error('Error loading customer orders:', error);
    } finally {
      setLoadingCustomerOrders(false);
    }
  };

  const selectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    await loadCustomerOrders(customer.id);
  };

  const saveCustomer = async () => {
    if (!editingCustomer) return;
    
    setSavingCustomer(true);
    const wasSelectedCustomer = selectedCustomer?.id === editingCustomer.id;
    
    try {
      const response = await authFetch(`/api/admin/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: editingCustomer.username,
          password: editingCustomer.password,
          email: editingCustomer.email,
          fullName: editingCustomer.fullName ?? null,
          phone: editingCustomer.phone ?? null,
          status: editingCustomer.status ?? 'active',
          notes: editingCustomer.notes ?? null,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        showToast('Customer updated successfully!', 'success');
        loadCustomers(customerSearch);
        setEditingCustomer(null);
        if (wasSelectedCustomer && result.data) {
          setSelectedCustomer(result.data);
        }
      } else {
        showToast(result.error || 'Failed to update customer', 'error');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      showToast('Failed to update customer', 'error');
    } finally {
      setSavingCustomer(false);
    }
  };

  const createNewCustomer = async () => {
    if (!newCustomerForm) return;
    
    if (!newCustomerForm.username || !newCustomerForm.password || !newCustomerForm.email) {
      showToast('Username, password, and email are required', 'error');
      return;
    }

    setSavingCustomer(true);
    try {
      const response = await authFetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomerForm),
      });

      if (response.ok) {
        showToast('Customer created successfully!', 'success');
        loadCustomers(customerSearch);
        setNewCustomerForm(null);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to create customer', 'error');
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast('Failed to create customer', 'error');
    } finally {
      setSavingCustomer(false);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return;

    try {
      const response = await authFetch(`/api/admin/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Customer deleted successfully!', 'success');
        loadCustomers(customerSearch);
        if (selectedCustomer?.id === customerId) {
          setSelectedCustomer(null);
          setCustomerOrders([]);
        }
      } else {
        showToast('Failed to delete customer', 'error');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      showToast('Failed to delete customer', 'error');
    }
  };

  const resetCustomerPassword = async (customerId: string) => {
    if (!confirm('This will reset the customer password and send them an email with new credentials. Continue?')) return;

    try {
      const response = await authFetch(`/api/admin/customers/${customerId}/reset-password`, {
        method: 'POST',
      });

      const result = await response.json();

      if (response.ok) {
        showToast('Password reset email sent to customer!', 'success');
      } else {
        showToast(result.error || 'Failed to reset password', 'error');
      }
    } catch (error) {
      console.error('Error resetting customer password:', error);
      showToast('Failed to reset password', 'error');
    }
  };

  const copyCredentials = async (username: string, password: string) => {
    const text = `Username: ${username}\nPassword: ${password}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Credentials copied to clipboard!', 'success');
      } catch (error) {
        showToast('Failed to copy credentials', 'error');
      }
    } else {
      showToast('Clipboard not available', 'error');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.username.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.fullName && c.fullName.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const updateFulfillmentOrder = async (orderId: string, updates: { fulfillmentStatus?: string; amazonOrderId?: string }) => {
    setUpdatingFulfillment(orderId);
    try {
      const response = await authFetch(`/api/admin/fulfillment/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        showToast('Fulfillment updated successfully!', 'success');
        loadFulfillmentOrders();
      } else {
        showToast('Failed to update fulfillment', 'error');
      }
    } catch (error) {
      console.error('Error updating fulfillment:', error);
      showToast('Failed to update fulfillment', 'error');
    } finally {
      setUpdatingFulfillment(null);
    }
  };

  const copyShippingAddress = async (order: FulfillmentOrder) => {
    const addressParts = [
      order.shippingName,
      order.shippingStreet,
      `${order.shippingCity}, ${order.shippingState} ${order.shippingZip}`,
      order.shippingCountry
    ].filter(Boolean);
    
    const address = addressParts.join('\n');
    
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(address);
        showToast('Address copied to clipboard!', 'success');
      } catch (error) {
        console.error('Failed to copy address:', error);
        showToast('Failed to copy address', 'error');
      }
    } else {
      showToast('Clipboard not available', 'error');
    }
  };

  const openAmazonFireStick = () => {
    if (typeof window !== 'undefined') {
      window.open('https://www.amazon.com/s?k=fire+tv+stick+4k', '_blank');
    }
  };

  const savePageEdit = async () => {
    if (!editingPageEdit) return;

    if (!editingPageEdit.pageId || !editingPageEdit.sectionId || !editingPageEdit.elementId || !editingPageEdit.elementType) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await authFetch('/api/admin/page-edits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPageEdit),
      });

      if (response.ok) {
        showToast('Page edit saved successfully!', 'success');
        loadPageEdits();
        setEditingPageEdit(null);
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save page edit', 'error');
      }
    } catch (error) {
      console.error('Error saving page edit:', error);
      showToast('Failed to save page edit', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deletePageEdit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page edit?')) return;

    try {
      const response = await authFetch(`/api/admin/page-edits/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Page edit deleted successfully!', 'success');
        loadPageEdits();
      } else {
        showToast('Failed to delete page edit', 'error');
      }
    } catch (error) {
      console.error('Error deleting page edit:', error);
      showToast('Failed to delete page edit', 'error');
    }
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    if (!editingProduct.name || editingProduct.name.trim() === '') {
      showToast('Product name is required', 'error');
      return;
    }
    if (!editingProduct.price || editingProduct.price <= 0) {
      showToast('Valid price is required', 'error');
      return;
    }

    setSaving(true);

    const productData = {
      ...editingProduct,
      updated_at: new Date().toISOString()
    };

    if (editingProduct.id) {
      const { error } = await supabase
        .from('real_products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (!error) {
        const synced = await syncToShadowProduct(editingProduct);
        if (synced) {
          showToast('Product updated successfully! Shadow product synced.', 'success');
          
          // Submit shop page to IndexNow after successful update
          try {
            const { submitShopPageToIndexNow } = await import('@/lib/indexnow');
            const result = await submitShopPageToIndexNow();
            if (result.success) {
              console.log('IndexNow: Shop page submitted successfully');
            } else {
              console.warn('IndexNow submission warning:', result.message);
            }
          } catch (err) {
            console.error('IndexNow submission error:', err);
            // Don't fail the save if IndexNow fails
          }
        } else {
          showToast('Product updated but shadow sync failed. Please try again.', 'error');
        }
        loadProducts();
        setEditingProduct(null);
      } else {
        showToast('Error updating product: ' + error.message, 'error');
      }
    } else {
      const { data: newProduct, error } = await supabase
        .from('real_products')
        .insert([productData])
        .select()
        .single();

      if (!error && newProduct) {
        const synced = await syncToShadowProduct({ ...editingProduct, id: newProduct.id });
        if (synced) {
          showToast('Product created successfully! Shadow product synced.', 'success');
          
          // Submit shop page to IndexNow after successful creation
          try {
            const { submitShopPageToIndexNow } = await import('@/lib/indexnow');
            const result = await submitShopPageToIndexNow();
            if (result.success) {
              console.log('IndexNow: Shop page submitted successfully');
            } else {
              console.warn('IndexNow submission warning:', result.message);
            }
          } catch (err) {
            console.error('IndexNow submission error:', err);
            // Don't fail the save if IndexNow fails
          }
        } else {
          showToast('Product created but shadow sync failed. Please try again.', 'error');
        }
        loadProducts();
        setEditingProduct(null);
      } else if (error) {
        showToast('Error creating product: ' + error.message, 'error');
      }
    }

    setSaving(false);
  };

  const syncToShadowProduct = async (product: Product): Promise<boolean> => {
    const shadowName = getShadowName(product.name);
    if (shadowName === "Digital Service") return true;

    try {
      const shadowData = {
        name: shadowName,
        price: product.price,
        sale_price: product.sale_price,
        real_product_id: product.id,
        real_product_name: product.name,
        category: product.category === 'devices' ? 'web-design' : 'seo',
        updated_at: new Date().toISOString()
      };

      const { data: existing } = await supabase
        .from('shadow_products')
        .select('id')
        .eq('real_product_id', product.id)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('shadow_products')
          .update(shadowData)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('shadow_products')
          .insert([{ ...shadowData, id: crypto.randomUUID() }]);
        
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing shadow product:', error);
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const { error } = await supabase
      .from('real_products')
      .delete()
      .eq('id', id);

    if (!error) {
      showToast('Product deleted successfully!', 'success');
      loadProducts();
    } else {
      showToast('Error deleting product: ' + error.message, 'error');
    }
  };

  const uploadImage = async (file: File) => {
    if (!editingProduct) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a valid image (JPEG, PNG, GIF, or WebP)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be less than 5MB', 'error');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `product_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        showToast('Failed to upload image: ' + uploadError.message, 'error');
        return;
      }

      const imageUrl = getStorageUrl('images', filePath);
      
      setEditingProduct({ ...editingProduct, main_image: imageUrl });
      showToast('Image uploaded successfully!', 'success');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast('Failed to upload image: ' + (error.message || 'Unknown error'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
    e.target.value = '';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (ua.includes('tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShadowName = (productName: string) => {
    for (const [key, value] of Object.entries(shadowProductMap)) {
      if (productName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return "Digital Service";
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-white">StreamStickPro</span>
            </div>
            <CardTitle className="text-xl text-white">Admin Login</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm flex items-center gap-2" data-testid="login-error">
                  <AlertCircle className="w-4 h-4" />
                  {loginError}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Username</label>
                <Input
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  data-testid="input-username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Password</label>
                <Input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                  data-testid="input-password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loginLoading}
                data-testid="button-login"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`} data-testid="toast-notification">
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      <aside className="w-64 border-r border-white/10 bg-gray-800 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <h1 className="font-bold text-xl tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">StreamStickPro Management</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Button 
            variant={activeSection === "dashboard" ? "secondary" : "ghost"} 
            className="w-full justify-start"
            onClick={() => setActiveSection("dashboard")}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="w-4 h-4 mr-3" /> Dashboard
          </Button>
          <Button 
            variant={activeSection === "products" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("products")}
            data-testid="nav-products"
          >
            <Package className="w-4 h-4 mr-3" /> Products
          </Button>
          <Button 
            variant={activeSection === "visitors" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("visitors")}
            data-testid="nav-visitors"
          >
            <Users className="w-4 h-4 mr-3" /> Live Visitors
          </Button>
          <Button 
            variant={activeSection === "orders" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("orders")}
            data-testid="nav-orders"
          >
            <ShoppingCart className="w-4 h-4 mr-3" /> Customer Orders
          </Button>
          <Button 
            variant={activeSection === "visual-editor" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("visual-editor")}
            data-testid="nav-visual-editor"
          >
            <Palette className="w-4 h-4 mr-3" /> Visual Editor
          </Button>
          <Button 
            variant={activeSection === "fulfillment" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("fulfillment")}
            data-testid="nav-fulfillment"
          >
            <Truck className="w-4 h-4 mr-3" /> Fulfillment
            {fulfillmentOrders.filter(o => o.fulfillmentStatus === 'pending').length > 0 && (
              <Badge className="ml-auto bg-orange-500 text-white text-xs">
                {fulfillmentOrders.filter(o => o.fulfillmentStatus === 'pending').length}
              </Badge>
            )}
          </Button>
          <Button 
            variant={activeSection === "customers" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("customers")}
            data-testid="nav-customers"
          >
            <ShoppingCart className="w-4 h-4 mr-3" /> Customers
            {customers.length > 0 && (
              <Badge className="ml-auto bg-purple-500 text-white text-xs">
                {customers.length}
              </Badge>
            )}
          </Button>
          <Button 
            variant={activeSection === "blog" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("blog")}
            data-testid="nav-blog"
          >
            <FileText className="w-4 h-4 mr-3" /> Blog Posts
            {blogPosts.length > 0 && (
              <Badge className="ml-auto bg-blue-500 text-white text-xs">
                {blogPosts.length}
              </Badge>
            )}
          </Button>
          <Button 
            variant={activeSection === "github" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => { setActiveSection("github"); loadGithubStatus(); }}
            data-testid="nav-github"
          >
            <Github className="w-4 h-4 mr-3" /> GitHub Deploy
          </Button>
          <Button 
            variant={activeSection === "seo" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("seo")}
            data-testid="nav-seo"
          >
            <Search className="w-4 h-4 mr-3" /> SEO Toolkit
          </Button>
          <Button 
            variant={activeSection === "settings" ? "secondary" : "ghost"} 
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
            onClick={() => setActiveSection("settings")}
            data-testid="nav-settings"
          >
            <Settings className="w-4 h-4 mr-3" /> Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
           <Button variant="outline" className="w-full" onClick={() => setLocation("/")} data-testid="button-view-site">
             View Live Site
           </Button>
           <Button 
             variant="ghost" 
             className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
             onClick={handleLogout}
             data-testid="button-logout"
           >
             <LogOut className="w-4 h-4 mr-2" />
             Logout
           </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-white/10 bg-gray-800 flex items-center justify-between px-8">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder="Search products, orders..." 
              className="pl-10 bg-gray-700 border-gray-600 text-white" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500 flex items-center justify-center text-orange-500 font-bold">
               A
             </div>
          </div>
        </header>

        <div className="p-8">
          {activeSection === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Activity className="w-8 h-8 text-orange-500" />
                  Dashboard Overview
                </h2>
                <p className="text-gray-400">Real-time statistics and quick actions</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  Pending Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card className={`bg-gradient-to-br border ${orderStats.pendingFulfillments > 0 ? 'from-red-500 to-red-600 border-red-400' : 'from-gray-700 to-gray-800 border-gray-700'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${orderStats.pendingFulfillments > 0 ? 'text-red-100' : 'text-gray-300'}`}>Unfulfilled Orders</p>
                          <p className="text-2xl font-bold text-white mt-1">{orderStats.pendingFulfillments}</p>
                        </div>
                        <Truck className={`w-8 h-8 ${orderStats.pendingFulfillments > 0 ? 'text-red-100 opacity-80' : 'text-gray-500 opacity-60'}`} />
                      </div>
                      {orderStats.pendingFulfillments > 0 && (
                        <Button 
                          size="sm" 
                          className="w-full mt-3 bg-white text-red-600 hover:bg-gray-100"
                          onClick={() => setActiveSection("fulfillment")}
                          data-testid="button-quick-fulfill"
                        >
                          Quick Fulfill →
                        </Button>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={`bg-gradient-to-br border ${products.some(p => (p.stock_quantity || 0) < 5) ? 'from-yellow-500 to-yellow-600 border-yellow-400' : 'from-gray-700 to-gray-800 border-gray-700'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${products.some(p => (p.stock_quantity || 0) < 5) ? 'text-yellow-100' : 'text-gray-300'}`}>Low Stock Items</p>
                          <p className="text-2xl font-bold text-white mt-1">{products.filter(p => (p.stock_quantity || 0) < 5).length}</p>
                        </div>
                        <Package className={`w-8 h-8 ${products.some(p => (p.stock_quantity || 0) < 5) ? 'text-yellow-100 opacity-80' : 'text-gray-500 opacity-60'}`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`bg-gradient-to-br border ${blogPosts.filter(p => !p.published).length > 0 ? 'from-blue-500 to-blue-600 border-blue-400' : 'from-gray-700 to-gray-800 border-gray-700'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${blogPosts.filter(p => !p.published).length > 0 ? 'text-blue-100' : 'text-gray-300'}`}>Draft Posts</p>
                          <p className="text-2xl font-bold text-white mt-1">{blogPosts.filter(p => !p.published).length}</p>
                        </div>
                        <FileText className={`w-8 h-8 ${blogPosts.filter(p => !p.published).length > 0 ? 'text-blue-100 opacity-80' : 'text-gray-500 opacity-60'}`} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-300">Conversion Rate</p>
                          <p className="text-2xl font-bold text-white mt-1">{visitorStats.totalVisitors > 0 ? ((orderStats.totalOrders / visitorStats.totalVisitors) * 100).toFixed(2) : '0.00'}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400 opacity-80" />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{orderStats.totalOrders} orders / {visitorStats.totalVisitors} visitors</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Revenue & Orders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-total-revenue">${(orderStats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-emerald-100 text-sm">Total Revenue</p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-revenue-today">${(orderStats.revenueToday / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-teal-100 text-sm">Today's Revenue</p>
                  </div>

                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <ShoppingCart className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-total-orders">{orderStats.totalOrders.toLocaleString()}</span>
                    </div>
                    <p className="text-cyan-100 text-sm">Total Orders</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Truck className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-pending-fulfillments">{orderStats.pendingFulfillments}</span>
                    </div>
                    <p className="text-amber-100 text-sm">Pending Fulfillments</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Visitor Stats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-total-visitors">{visitorStats.totalVisitors.toLocaleString()}</span>
                    </div>
                    <p className="text-blue-100 text-sm">Total Visitors</p>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-today-visitors">{visitorStats.todayVisitors.toLocaleString()}</span>
                    </div>
                    <p className="text-indigo-100 text-sm">Today's Visitors</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Package className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-products-count">{products.length}</span>
                    </div>
                    <p className="text-purple-100 text-sm">Active Products</p>
                  </div>

                  <div className="bg-gradient-to-br from-rose-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-8 h-8 opacity-80" />
                      <span className="text-2xl font-bold" data-testid="text-online-now">{visitorStats.onlineNow.toLocaleString()}</span>
                    </div>
                    <p className="text-rose-100 text-sm">Online Now</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Monitor className="w-5 h-5 text-orange-500" />
                      Device Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Desktop</span>
                      </div>
                      <span className="font-semibold text-white">{visitorStats.deviceBreakdown.desktop}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Mobile</span>
                      </div>
                      <span className="font-semibold text-white">{visitorStats.deviceBreakdown.mobile}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tablet className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">Tablet</span>
                      </div>
                      <span className="font-semibold text-white">{visitorStats.deviceBreakdown.tablet}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <ShoppingCart className="w-5 h-5 text-orange-500" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Orders Today</span>
                      <Badge className="bg-green-500/20 text-green-300">{orderStats.ordersToday}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">This Week</span>
                      <Badge className="bg-blue-500/20 text-blue-300">{orderStats.ordersThisWeek}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">This Month</span>
                      <Badge className="bg-purple-500/20 text-purple-300">{orderStats.ordersThisMonth}</Badge>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                      <span className="text-gray-300">Monthly Revenue</span>
                      <span className="font-semibold text-emerald-400">${(orderStats.revenueThisMonth / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600" 
                      onClick={() => setActiveSection("products")}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add New Product
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setActiveSection("fulfillment")}
                    >
                      <Truck className="w-4 h-4 mr-2" /> View Fulfillments
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => { loadVisitorStats(); loadOrderStats(); }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh Stats
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={async () => {
                        try {
                          const response = await authFetch('/api/reminders/send-reminders', {
                            method: 'POST',
                          });
                          const result = await response.json();
                          if (result.success) {
                            showToast(`Reminders sent! ${result.results?.sent || 0} emails sent.`, 'success');
                          } else {
                            showToast('Failed to send reminders', 'error');
                          }
                        } catch (error: any) {
                          showToast('Error sending reminders: ' + (error.message || 'Unknown error'), 'error');
                        }
                      }}
                    >
                      <Mail className="w-4 h-4 mr-2" /> Send Reminders
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    Recent Orders
                  </CardTitle>
                  <CardDescription className="text-gray-400">Latest 10 orders across all products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-400">Customer</TableHead>
                          <TableHead className="text-gray-400">Product</TableHead>
                          <TableHead className="text-gray-400">Amount</TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                          <TableHead className="text-gray-400">Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orderStats.recentOrders.length > 0 ? (
                          orderStats.recentOrders.map((order) => (
                            <TableRow key={order.id} className="border-gray-700 hover:bg-gray-700/50">
                              <TableCell className="text-gray-300">
                                <div>
                                  <p className="font-medium">{order.customerName || 'N/A'}</p>
                                  <p className="text-xs text-gray-500">{order.customerEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300 max-w-[150px] truncate">{order.productName || 'Unknown'}</TableCell>
                              <TableCell className="text-emerald-400 font-medium">${(order.amount / 100).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={
                                  order.status === 'paid' ? 'bg-green-500/20 text-green-300' :
                                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                  order.status === 'failed' ? 'bg-red-500/20 text-red-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }>
                                  {order.status || 'unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-400 whitespace-nowrap">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                              No orders yet. Orders will appear here as customers make purchases.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "visitors" && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <ModernLiveVisitors />
            </div>
          )}

          {activeSection === "orders" && (
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
              <ComprehensiveOrderData />
            </div>
          )}

          {/* Legacy visitors section (replaced above, keeping for reference) */}
          {false && activeSection === "visitors_old" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Activity className="w-8 h-8 text-orange-500" />
                    Live Visitor Statistics
                  </h2>
                  <p className="text-gray-400 mt-1">
                    Last updated: {lastUpdate.toLocaleTimeString()} - Auto-refreshes every 30 seconds
                  </p>
                </div>
                <Button onClick={loadVisitorStats} className="bg-orange-500 hover:bg-orange-600" data-testid="button-refresh">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh Now
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">{visitorStats.totalVisitors.toLocaleString()}</span>
                  </div>
                  <p className="text-blue-100 text-sm">Total Visitors</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">{visitorStats.todayVisitors.toLocaleString()}</span>
                  </div>
                  <p className="text-green-100 text-sm">Today</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">{visitorStats.weekVisitors.toLocaleString()}</span>
                  </div>
                  <p className="text-purple-100 text-sm">This Week</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">{visitorStats.onlineNow.toLocaleString()}</span>
                  </div>
                  <p className="text-orange-100 text-sm">Online Now</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <Globe className="w-5 h-5 text-blue-400" />
                      Top Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visitorStats.topCountries.length > 0 ? (
                      <div className="space-y-2">
                        {visitorStats.topCountries.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-300">{item.name}</span>
                            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No location data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <MapPin className="w-5 h-5 text-green-400" />
                      Top States/Regions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visitorStats.topRegions.length > 0 ? (
                      <div className="space-y-2">
                        {visitorStats.topRegions.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-300">{item.name}</span>
                            <Badge variant="secondary" className="bg-green-500/20 text-green-300">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No location data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-white text-lg">
                      <MapPin className="w-5 h-5 text-purple-400" />
                      Top Cities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {visitorStats.topCities.length > 0 ? (
                      <div className="space-y-2">
                        {visitorStats.topCities.slice(0, 5).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-gray-300">{item.name}</span>
                            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No location data yet</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-orange-500" />
                    Recent Visitors
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Real-time visitor tracking with location data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-400">Location</TableHead>
                          <TableHead className="text-gray-400">Device</TableHead>
                          <TableHead className="text-gray-400">Page</TableHead>
                          <TableHead className="text-gray-400">Referrer</TableHead>
                          <TableHead className="text-gray-400">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visitorStats.recentVisitors.length > 0 ? (
                          visitorStats.recentVisitors.slice(0, 20).map((visitor, idx) => (
                            <TableRow key={idx} className="border-gray-700 hover:bg-gray-700/50">
                              <TableCell className="text-gray-300">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-blue-400" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {visitor.city || visitor.region || 'Unknown'}
                                      {visitor.region && visitor.city ? `, ${visitor.region}` : ''}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {visitor.country || 'Unknown Country'}
                                      {visitor.isProxy && <Badge variant="destructive" className="ml-2 text-xs py-0">VPN</Badge>}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300">
                                <div className="flex items-center gap-2">
                                  {getDeviceIcon(visitor.userAgent)}
                                  <span className="text-sm truncate max-w-[100px]">
                                    {visitor.userAgent.includes('Mobile') ? 'Mobile' : 
                                     visitor.userAgent.includes('Tablet') ? 'Tablet' : 'Desktop'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-gray-300 max-w-[150px] truncate">{visitor.pageUrl}</TableCell>
                              <TableCell className="text-gray-400 max-w-[120px] truncate">
                                {visitor.referrer ? visitor.referrer.replace(/^https?:\/\//, '').split('/')[0] : 'Direct'}
                              </TableCell>
                              <TableCell className="text-gray-400 whitespace-nowrap">{formatTime(visitor.createdAt)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-8 text-center text-gray-400">
                              No visitors tracked yet. Visitors will appear here as they browse your site.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "products" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Package className="w-8 h-8 text-orange-500" />
                    Products Manager
                  </h2>
                  <p className="text-gray-400">Manage your products and pricing. Changes sync to shadow products automatically.</p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  onClick={() => setEditingProduct({
                    id: '',
                    name: '',
                    slug: '',
                    description: '',
                    price: 0,
                    sale_price: null,
                    sku: '',
                    stock_quantity: 100,
                    stock_status: 'instock',
                    category: 'subscriptions',
                    status: 'publish',
                    featured: false,
                    main_image: '',
                    cloaked_name: 'Digital Entertainment Service'
                  })}
                  data-testid="button-add-product"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </div>

              <Tabs defaultValue="all" className="space-y-6">
                <TabsList className="bg-gray-800 border border-gray-700">
                  <TabsTrigger value="all">All Products ({products.length})</TabsTrigger>
                  <TabsTrigger value="devices">Devices ({products.filter(p => p.category === 'devices').length})</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions ({products.filter(p => p.category === 'subscriptions').length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-0">
                      {loadingProducts ? (
                        <div className="p-8 text-center text-gray-400">Loading products...</div>
                      ) : filteredProducts.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No products found</p>
                          <Button 
                            className="mt-4 bg-orange-500 hover:bg-orange-600"
                            onClick={() => setEditingProduct({
                              id: '',
                              name: '',
                              slug: '',
                              description: '',
                              price: 0,
                              sale_price: null,
                              sku: '',
                              stock_quantity: 100,
                              stock_status: 'instock',
                              category: 'subscriptions',
                              status: 'publish',
                              featured: false,
                              main_image: '',
                              cloaked_name: 'Digital Entertainment Service'
                            })}
                          >
                            Add Your First Product
                          </Button>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700 hover:bg-transparent">
                              <TableHead className="text-gray-400">Name</TableHead>
                              <TableHead className="text-gray-400">Price</TableHead>
                              <TableHead className="text-gray-400">Stock</TableHead>
                              <TableHead className="text-gray-400">Category</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-gray-400">Shadow Product</TableHead>
                              <TableHead className="text-right text-gray-400">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.map((product) => (
                              <TableRow key={product.id} className="border-gray-700 hover:bg-gray-700/50">
                                <TableCell className="font-medium text-white">
                                  <div className="flex items-center gap-3">
                                    {product.main_image ? (
                                      <img src={product.main_image} alt={product.name} className="w-10 h-10 rounded object-cover" loading="lazy" width={40} height={40} />
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                      </div>
                                    )}
                                    <div>
                                      <div>{product.name}</div>
                                      <div className="text-xs text-gray-400">SKU: {product.sku || 'N/A'}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-orange-400 font-bold" data-testid={`text-price-${product.id}`}>
                                    {formatPriceDisplay(product.sale_price || product.price)}
                                  </span>
                                  {product.sale_price && (
                                    <span className="text-gray-500 line-through ml-2">{formatPriceDisplay(product.price)}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    (product.stock_quantity || 0) < 5 ? 'bg-red-500/20 text-red-300' :
                                    (product.stock_quantity || 0) < 20 ? 'bg-yellow-500/20 text-yellow-300' :
                                    'bg-green-500/20 text-green-300'
                                  } data-testid={`text-stock-${product.id}`}>
                                    {product.stock_quantity || 0} units
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="border-gray-600 text-gray-300 capitalize">
                                    {product.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    product.status === 'publish' ? 'bg-green-500/20 text-green-400' :
                                    product.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }>
                                    {product.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400 text-sm">
                                  {getShadowName(product.name)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => setEditingProduct(product)}
                                      data-testid={`button-edit-${product.id}`}
                                    >
                                      <Edit className="w-4 h-4 text-blue-400" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => deleteProduct(product.id)}
                                      data-testid={`button-delete-${product.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="devices">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {products.filter(p => p.category === 'devices').map((product) => (
                          <div key={product.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-white">{product.name}</h4>
                              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-2xl font-bold text-orange-400 mb-2">{formatPriceDisplay(product.sale_price || product.price)}</div>
                            <div className="text-sm text-gray-400">Shadow: {getShadowName(product.name)}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="subscriptions">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {products.filter(p => p.category === 'subscriptions').map((product) => (
                          <div key={product.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-bold text-white text-sm">{product.name}</h4>
                              <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="text-2xl font-bold text-blue-400 mb-2">{formatPriceDisplay(product.sale_price || product.price)}</div>
                            <div className="text-sm text-gray-400">Shadow: {getShadowName(product.name)}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeSection === "visual-editor" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Palette className="w-8 h-8 text-orange-500" />
                    Visual Editor
                  </h2>
                  <p className="text-gray-400">Edit text and images on any page in real-time. Changes are saved to the database.</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => window.open('/?edit=true', '_blank')}
                    data-testid="button-preview-edit-mode"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Open Live Editor
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    onClick={() => setEditingPageEdit({
                      pageId: 'main',
                      sectionId: '',
                      elementId: '',
                      elementType: 'text',
                      content: '',
                      imageUrl: null,
                      isActive: true,
                    })}
                    data-testid="button-add-edit"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Content Edit
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Type className="w-8 h-8 text-white/80" />
                      <span className="text-3xl font-bold text-white">{pageEdits.filter(e => e.elementType !== 'image').length}</span>
                    </div>
                    <p className="text-blue-100">Text Edits</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <ImageIcon className="w-8 h-8 text-white/80" />
                      <span className="text-3xl font-bold text-white">{pageEdits.filter(e => e.elementType === 'image').length}</span>
                    </div>
                    <p className="text-purple-100">Image Edits</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-600 to-green-700 border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <CheckCircle className="w-8 h-8 text-white/80" />
                      <span className="text-3xl font-bold text-white">{pageEdits.filter(e => e.isActive).length}</span>
                    </div>
                    <p className="text-green-100">Active Edits</p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-orange-500" />
                    All Page Edits
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage content overrides for your website. Edits are applied when pages load.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingEdits ? (
                    <div className="p-8 text-center text-gray-400">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      Loading page edits...
                    </div>
                  ) : pageEdits.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No page edits yet</p>
                      <p className="text-sm mb-4">Create your first content edit to customize your site.</p>
                      <Button 
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => setEditingPageEdit({
                          pageId: 'main',
                          sectionId: 'hero',
                          elementId: 'headline',
                          elementType: 'heading',
                          content: '',
                          isActive: true,
                        })}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add First Edit
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-400">Page</TableHead>
                          <TableHead className="text-gray-400">Section</TableHead>
                          <TableHead className="text-gray-400">Element</TableHead>
                          <TableHead className="text-gray-400">Type</TableHead>
                          <TableHead className="text-gray-400">Content</TableHead>
                          <TableHead className="text-gray-400">Status</TableHead>
                          <TableHead className="text-right text-gray-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageEdits.map((edit) => (
                          <TableRow key={edit.id} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell className="font-medium text-white">{edit.pageId}</TableCell>
                            <TableCell className="text-gray-300">{edit.sectionId}</TableCell>
                            <TableCell className="text-gray-300">{edit.elementId}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="border-gray-600 text-gray-300">
                                {edit.elementType === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Type className="w-3 h-3 mr-1" />}
                                {edit.elementType}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 max-w-[200px] truncate">
                              {edit.elementType === 'image' ? (
                                edit.imageUrl ? (
                                  <img src={edit.imageUrl} alt="Preview" className="w-10 h-10 object-cover rounded" />
                                ) : 'No image'
                              ) : (
                                edit.content?.substring(0, 50) || 'No content'
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={edit.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                {edit.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => setEditingPageEdit(edit)}
                                  data-testid={`button-edit-page-${edit.id}`}
                                >
                                  <Edit className="w-4 h-4 text-blue-400" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => deletePageEdit(edit.id)}
                                  data-testid={`button-delete-page-${edit.id}`}
                                >
                                  <Trash2 className="w-4 h-4 text-red-400" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">How to Use Visual Editing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-orange-400 font-bold">1</span>
                      </div>
                      <h4 className="font-semibold text-white mb-2">Create an Edit</h4>
                      <p className="text-sm text-gray-400">Click "Add Content Edit" and specify the page, section, and element you want to modify.</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-orange-400 font-bold">2</span>
                      </div>
                      <h4 className="font-semibold text-white mb-2">Set Content</h4>
                      <p className="text-sm text-gray-400">Enter the new text content or image URL that should replace the original element.</p>
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mb-3">
                        <span className="text-orange-400 font-bold">3</span>
                      </div>
                      <h4 className="font-semibold text-white mb-2">Preview Changes</h4>
                      <p className="text-sm text-gray-400">Open the live site to see your changes applied in real-time.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "fulfillment" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Truck className="w-8 h-8 text-orange-500" />
                    Fire Stick Fulfillment
                  </h2>
                  <p className="text-gray-400">Manage and ship Fire Stick orders to customers</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={loadFulfillmentOrders} 
                    className="bg-gray-700 hover:bg-gray-600"
                    data-testid="button-refresh-fulfillment"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={openAmazonFireStick}
                    className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
                    data-testid="button-order-amazon"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order on Amazon
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-pending-count">
                      {fulfillmentOrders.filter(o => o.fulfillmentStatus === 'pending').length}
                    </span>
                  </div>
                  <p className="text-yellow-100 text-sm">Pending Orders</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingCart className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-ordered-count">
                      {fulfillmentOrders.filter(o => o.fulfillmentStatus === 'ordered').length}
                    </span>
                  </div>
                  <p className="text-blue-100 text-sm">Ordered on Amazon</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-shipped-count">
                      {fulfillmentOrders.filter(o => o.fulfillmentStatus === 'shipped').length}
                    </span>
                  </div>
                  <p className="text-purple-100 text-sm">Shipped</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-delivered-count">
                      {fulfillmentOrders.filter(o => o.fulfillmentStatus === 'delivered').length}
                    </span>
                  </div>
                  <p className="text-green-100 text-sm">Delivered</p>
                </div>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Package className="w-5 h-5 text-orange-500" />
                    Order Queue
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Fire Stick orders requiring fulfillment. Copy addresses and track Amazon orders.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingFulfillment ? (
                    <div className="p-8 text-center text-gray-400">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      Loading fulfillment orders...
                    </div>
                  ) : fulfillmentOrders.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No Fire Stick orders to fulfill</p>
                      <p className="text-sm">Orders with Fire Stick products will appear here once paid.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fulfillmentOrders.map((order) => (
                        <div 
                          key={order.id} 
                          className="bg-gray-700/50 rounded-xl p-5 border border-gray-600"
                          data-testid={`fulfillment-order-${order.id}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="font-bold text-white text-lg">
                                  {order.customerName || order.customerEmail}
                                </h4>
                                <Badge className={
                                  order.fulfillmentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  order.fulfillmentStatus === 'ordered' ? 'bg-blue-500/20 text-blue-400' :
                                  order.fulfillmentStatus === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                                  order.fulfillmentStatus === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }>
                                  {order.fulfillmentStatus || 'pending'}
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                              <p className="text-orange-400 font-semibold mt-1">{order.realProductName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-400">
                                ${(order.amount / 100).toFixed(2)}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                              </p>
                            </div>
                          </div>

                          {order.shippingStreet && (
                            <div className="bg-gray-800 rounded-lg p-4 mb-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm text-gray-400 mb-1">Shipping Address</p>
                                  <p className="text-white font-medium">{order.shippingName}</p>
                                  <p className="text-gray-300">{order.shippingStreet}</p>
                                  <p className="text-gray-300">
                                    {order.shippingCity}, {order.shippingState} {order.shippingZip}
                                  </p>
                                  <p className="text-gray-300">{order.shippingCountry}</p>
                                  {order.shippingPhone && (
                                    <p className="text-gray-400 mt-1">Phone: {order.shippingPhone}</p>
                                  )}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyShippingAddress(order)}
                                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                  data-testid={`button-copy-address-${order.id}`}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Address
                                </Button>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Status</label>
                              <select
                                value={order.fulfillmentStatus || 'pending'}
                                onChange={(e) => updateFulfillmentOrder(order.id, { fulfillmentStatus: e.target.value })}
                                disabled={updatingFulfillment === order.id}
                                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 text-sm"
                                data-testid={`select-status-${order.id}`}
                              >
                                <option value="pending">Pending</option>
                                <option value="ordered">Ordered on Amazon</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs text-gray-400 mb-1">Amazon Order ID</label>
                              <Input
                                placeholder="Enter Amazon order ID..."
                                value={order.amazonOrderId || ''}
                                onChange={(e) => updateFulfillmentOrder(order.id, { amazonOrderId: e.target.value })}
                                disabled={updatingFulfillment === order.id}
                                className="bg-gray-700 border-gray-600 text-white text-sm"
                                data-testid={`input-amazon-id-${order.id}`}
                              />
                            </div>
                            <div className="pt-5">
                              <Button
                                onClick={openAmazonFireStick}
                                className="bg-orange-500 hover:bg-orange-600"
                                size="sm"
                                data-testid={`button-amazon-${order.id}`}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Amazon
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "customers" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <ShoppingCart className="w-8 h-8 text-purple-500" />
                    Customer Management
                  </h2>
                  <p className="text-gray-400">Manage IPTV customers, credentials, and order history</p>
                </div>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => setNewCustomerForm({ username: '', password: '', email: '', fullName: '', phone: '', notes: '' })}
                  data-testid="button-add-customer"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Customer
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">All Customers</CardTitle>
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            placeholder="Search customers..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="pl-10 bg-gray-700 border-gray-600 text-white text-sm"
                            data-testid="input-customer-search"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {loadingCustomers ? (
                        <div className="p-8 text-center text-gray-400">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                          Loading customers...
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">No customers found</p>
                          <p className="text-sm">Customers will appear here after completing checkout.</p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="border-gray-700">
                              <TableHead className="text-gray-400">Username</TableHead>
                              <TableHead className="text-gray-400">Email</TableHead>
                              <TableHead className="text-gray-400">Orders</TableHead>
                              <TableHead className="text-gray-400">Status</TableHead>
                              <TableHead className="text-right text-gray-400">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCustomers.map((customer) => (
                              <TableRow 
                                key={customer.id} 
                                className={`border-gray-700 hover:bg-gray-700/50 cursor-pointer ${selectedCustomer?.id === customer.id ? 'bg-purple-500/10' : ''}`}
                                onClick={() => selectCustomer(customer)}
                                data-testid={`row-customer-${customer.id}`}
                              >
                                <TableCell className="font-medium text-white">
                                  <div>
                                    <div className="font-bold">{customer.username}</div>
                                    {customer.fullName && <div className="text-xs text-gray-400">{customer.fullName}</div>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-gray-300">{customer.email}</TableCell>
                                <TableCell>
                                  <Badge className="bg-purple-500/20 text-purple-400">
                                    {customer.totalOrders || 0} orders
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    customer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                    customer.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }>
                                    {customer.status || 'active'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={(e) => { e.stopPropagation(); copyCredentials(customer.username, customer.password); }}
                                      data-testid={`button-copy-creds-${customer.id}`}
                                    >
                                      <Copy className="w-4 h-4 text-purple-400" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}
                                      data-testid={`button-edit-customer-${customer.id}`}
                                    >
                                      <Edit className="w-4 h-4 text-blue-400" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={(e) => { e.stopPropagation(); deleteCustomer(customer.id); }}
                                      data-testid={`button-delete-customer-${customer.id}`}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-400" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  {selectedCustomer ? (
                    <Card className="bg-gray-800 border-gray-700 sticky top-4">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Eye className="w-5 h-5 text-purple-500" />
                          Customer Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                          <h4 className="text-sm text-gray-400 mb-2">Credentials</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-white font-mono text-sm">User: {selectedCustomer.username}</p>
                              <p className="text-white font-mono text-sm">Pass: {selectedCustomer.password}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyCredentials(selectedCustomer.username, selectedCustomer.password)}
                              className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                              data-testid="button-copy-selected-creds"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Email</span>
                            <span className="text-white">{selectedCustomer.email}</span>
                          </div>
                          {selectedCustomer.fullName && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Name</span>
                              <span className="text-white">{selectedCustomer.fullName}</span>
                            </div>
                          )}
                          {selectedCustomer.phone && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Phone</span>
                              <span className="text-white">{selectedCustomer.phone}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Total Orders</span>
                            <span className="text-purple-400 font-bold">{selectedCustomer.totalOrders || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Status</span>
                            <Badge className={
                              selectedCustomer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              selectedCustomer.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }>
                              {selectedCustomer.status || 'active'}
                            </Badge>
                          </div>
                          {selectedCustomer.createdAt && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Customer Since</span>
                              <span className="text-white">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>

                        {selectedCustomer.notes && (
                          <div className="bg-gray-700/50 rounded-lg p-3">
                            <h4 className="text-sm text-gray-400 mb-1">Notes</h4>
                            <p className="text-white text-sm">{selectedCustomer.notes}</p>
                          </div>
                        )}

                        <div className="border-t border-gray-700 pt-4">
                          <h4 className="text-sm text-gray-400 mb-3">Order History</h4>
                          {loadingCustomerOrders ? (
                            <div className="text-center py-4">
                              <Loader2 className="w-6 h-6 mx-auto animate-spin text-gray-400" />
                            </div>
                          ) : customerOrders.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No orders found</p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {customerOrders.map((order) => (
                                <div key={order.id} className="bg-gray-700/50 rounded-lg p-3 text-sm">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-white font-medium">{order.realProductName || 'Product'}</p>
                                      <p className="text-gray-400 text-xs">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-green-400 font-bold">${((order.amount || 0) / 100).toFixed(2)}</p>
                                      <Badge className={
                                        order.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-gray-500/20 text-gray-400'
                                      } variant="outline">
                                        {order.status || 'pending'}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingCustomer(selectedCustomer)}
                              className="flex-1 border-gray-600 text-gray-300"
                              data-testid="button-edit-selected"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setSelectedCustomer(null); setCustomerOrders([]); }}
                              className="border-gray-600 text-gray-300"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetCustomerPassword(selectedCustomer.id)}
                            className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/20"
                            data-testid="button-reset-customer-password"
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Reset Password & Email Customer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-8 text-center text-gray-400">
                        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Select a customer</p>
                        <p className="text-sm mt-1">Click on a customer to view details and order history</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "blog" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <BookOpen className="w-8 h-8 text-blue-500" />
                    Blog Management
                  </h2>
                  <p className="text-gray-400">Create and manage blog posts with AI assistance</p>
                </div>
                {blogView === 'list' && (
                  <Button
                    onClick={() => {
                      setBlogView('create');
                      setEditingBlogPost({
                        title: '',
                        slug: '',
                        excerpt: '',
                        content: '',
                        category: 'streaming',
                        featured: false,
                        published: false,
                        keywords: []
                      });
                      setGeneratedContent(null);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    data-testid="button-new-blog"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Blog Post
                  </Button>
                )}
                {(blogView === 'create' || blogView === 'edit') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setBlogView('list');
                      setEditingBlogPost(null);
                      setGeneratedContent(null);
                    }}
                    className="border-gray-600 text-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>

              {blogView === 'list' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search blog posts..."
                        value={blogSearchTerm}
                        onChange={(e) => setBlogSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-700 border-gray-600 text-white"
                        data-testid="input-blog-search"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={loadBlogPosts}
                      className="border-gray-600 text-gray-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {loadingBlogPosts ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                  ) : filteredBlogPosts.length === 0 ? (
                    <Card className="bg-gray-800 border-gray-700">
                      <CardContent className="p-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No blog posts yet</h3>
                        <p className="text-gray-500 mb-6">Create your first blog post to get started</p>
                        <Button
                          onClick={() => {
                            setBlogView('create');
                            setEditingBlogPost({
                              title: '',
                              slug: '',
                              excerpt: '',
                              content: '',
                              category: 'streaming',
                              featured: false,
                              published: false,
                              keywords: []
                            });
                          }}
                          className="bg-gradient-to-r from-blue-500 to-purple-500"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Post
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {filteredBlogPosts.map((post) => (
                        <Card key={post.id} className="bg-gray-800 border-gray-700 hover:border-blue-500/50 transition-colors" data-testid={`card-blog-${post.id}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold text-white truncate">{post.title}</h3>
                                  {post.featured && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Featured</Badge>
                                  )}
                                  {post.published ? (
                                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Published</Badge>
                                  ) : (
                                    <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Draft</Badge>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    {post.category}
                                  </span>
                                  {post.wordCount && (
                                    <span className="flex items-center gap-1">
                                      <List className="w-3 h-3" />
                                      {post.wordCount} words
                                    </span>
                                  )}
                                  {post.readTime && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {post.readTime}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-12 h-12 rounded-lg ${getSeoScoreColor(post.overallSeoScore)} flex items-center justify-center`}>
                                    <span className="text-white font-bold text-lg">{post.overallSeoScore || 0}</span>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-400">SEO Score</div>
                                    <div className="text-sm font-medium text-white">{getSeoScoreLabel(post.overallSeoScore)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setEditingBlogPost(post);
                                      setBlogView('edit');
                                    }}
                                    className="border-gray-600 text-gray-300 hover:text-white"
                                    data-testid={`button-edit-blog-${post.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteBlogPost(post.id)}
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    data-testid={`button-delete-blog-${post.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {(blogView === 'create' || blogView === 'edit') && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-500" />
                          AI Content Generator
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Generate blog content using AI. Fill in the topic and preferences below.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Topic *</label>
                          <Input
                            value={aiRequest.topic}
                            onChange={(e) => setAiRequest({ ...aiRequest, topic: e.target.value })}
                            placeholder="e.g., Best Streaming Apps for Fire Stick in 2025"
                            className="bg-gray-700 border-gray-600 text-white"
                            data-testid="input-ai-topic"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tone</label>
                            <select
                              value={aiRequest.tone}
                              onChange={(e) => setAiRequest({ ...aiRequest, tone: e.target.value as any })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                              <option value="professional">Professional</option>
                              <option value="casual">Casual</option>
                              <option value="educational">Educational</option>
                              <option value="persuasive">Persuasive</option>
                              <option value="entertaining">Entertaining</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Length</label>
                            <select
                              value={aiRequest.length}
                              onChange={(e) => setAiRequest({ ...aiRequest, length: e.target.value as any })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                              <option value="short">Short (400-600 words)</option>
                              <option value="medium">Medium (800-1200 words)</option>
                              <option value="long">Long (1500-2000 words)</option>
                              <option value="comprehensive">Comprehensive (2500+ words)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              value={keywordInput}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              placeholder="Add a keyword"
                              className="bg-gray-700 border-gray-600 text-white"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                            />
                            <Button onClick={addKeyword} variant="outline" className="border-gray-600">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {aiRequest.keywords?.map((kw, i) => (
                              <Badge key={i} className="bg-purple-500/20 text-purple-300 border-purple-500/30 cursor-pointer" onClick={() => removeKeyword(i)}>
                                {kw} <X className="w-3 h-3 ml-1" />
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 text-gray-300">
                            <input
                              type="checkbox"
                              checked={aiRequest.includeFAQ}
                              onChange={(e) => setAiRequest({ ...aiRequest, includeFAQ: e.target.checked })}
                              className="rounded"
                            />
                            Include FAQ
                          </label>
                          <label className="flex items-center gap-2 text-gray-300">
                            <input
                              type="checkbox"
                              checked={aiRequest.includeLists}
                              onChange={(e) => setAiRequest({ ...aiRequest, includeLists: e.target.checked })}
                              className="rounded"
                            />
                            Include Lists
                          </label>
                        </div>

                        <Button
                          onClick={generateAIContent}
                          disabled={aiGenerating || !aiRequest.topic.trim()}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          data-testid="button-generate-ai"
                        >
                          {aiGenerating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating Content...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate with AI
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white">Post Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                          <Input
                            value={editingBlogPost?.title || ''}
                            onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Enter blog post title"
                            data-testid="input-blog-title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
                          <Input
                            value={editingBlogPost?.slug || ''}
                            onChange={(e) => setEditingBlogPost({ ...editingBlogPost, slug: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="auto-generated-from-title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Excerpt *</label>
                          <textarea
                            value={editingBlogPost?.excerpt || ''}
                            onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[80px]"
                            placeholder="Brief summary of the post..."
                            data-testid="input-blog-excerpt"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                          <textarea
                            value={editingBlogPost?.content || ''}
                            onChange={(e) => setEditingBlogPost({ ...editingBlogPost, content: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white min-h-[400px] font-mono text-sm"
                            placeholder="Write your blog post content here (HTML supported)..."
                            data-testid="input-blog-content"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                            <select
                              value={editingBlogPost?.category || 'streaming'}
                              onChange={(e) => setEditingBlogPost({ ...editingBlogPost, category: e.target.value })}
                              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                              <option value="streaming">Streaming</option>
                              <option value="firestick">Fire Stick</option>
                              <option value="iptv">IPTV</option>
                              <option value="cord-cutting">Cord Cutting</option>
                              <option value="guides">Guides</option>
                              <option value="reviews">Reviews</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-gray-300 pt-6">
                              <input
                                type="checkbox"
                                checked={editingBlogPost?.featured || false}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, featured: e.target.checked })}
                                className="rounded"
                              />
                              Featured Post
                            </label>
                            <label className="flex items-center gap-2 text-gray-300">
                              <input
                                type="checkbox"
                                checked={editingBlogPost?.published || false}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, published: e.target.checked })}
                                className="rounded"
                              />
                              Published
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-500" />
                          SEO Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
                          <Input
                            value={editingBlogPost?.metaTitle || ''}
                            onChange={(e) => setEditingBlogPost({ ...editingBlogPost, metaTitle: e.target.value })}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="SEO optimized title"
                          />
                          <p className="text-xs text-gray-500 mt-1">{(editingBlogPost?.metaTitle || '').length}/60 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Meta Description</label>
                          <textarea
                            value={editingBlogPost?.metaDescription || ''}
                            onChange={(e) => setEditingBlogPost({ ...editingBlogPost, metaDescription: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white min-h-[80px]"
                            placeholder="Brief SEO description"
                          />
                          <p className="text-xs text-gray-500 mt-1">{(editingBlogPost?.metaDescription || '').length}/160 characters</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Keywords</label>
                          <div className="flex flex-wrap gap-1">
                            {editingBlogPost?.keywords?.map((kw, i) => (
                              <Badge key={i} className="bg-blue-500/20 text-blue-300 text-xs">{kw}</Badge>
                            )) || <span className="text-gray-500 text-sm">No keywords set</span>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-500" />
                          SEO Score Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {editingBlogPost?.overallSeoScore ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center">
                              <div className={`w-20 h-20 rounded-full ${getSeoScoreColor(editingBlogPost.overallSeoScore)} flex items-center justify-center`}>
                                <span className="text-white font-bold text-2xl">{editingBlogPost.overallSeoScore}</span>
                              </div>
                            </div>
                            <p className="text-center text-gray-400">{getSeoScoreLabel(editingBlogPost.overallSeoScore)}</p>
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-4">Score calculated on save</p>
                        )}
                      </CardContent>
                    </Card>

                    <Button
                      onClick={saveBlogPost}
                      disabled={savingBlogPost}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      data-testid="button-save-blog"
                    >
                      {savingBlogPost ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {blogView === 'create' ? 'Create Post' : 'Update Post'}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "github" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Github className="w-8 h-8 text-purple-500" />
                  GitHub Deploy
                </h2>
                <p className="text-gray-400">Push your code to GitHub repositories</p>
              </div>

              {loadingGithub ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <span className="ml-3 text-gray-400">Checking GitHub connection...</span>
                </div>
              ) : !githubStatus?.connected ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">GitHub Not Connected</h3>
                    <p className="text-gray-400 mb-4">
                      {githubStatus?.error || 'Please set up your GitHub integration to push code.'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Make sure your GitHub token is configured in the integrations.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          Connected to GitHub
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          Logged in as <span className="text-white font-semibold">{githubStatus.username}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {githubStatus.avatarUrl && (
                          <img 
                            src={githubStatus.avatarUrl} 
                            alt="GitHub avatar" 
                            className="w-16 h-16 rounded-full border-2 border-purple-500"
                          />
                        )}
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CloudUpload className="w-5 h-5 text-blue-500" />
                          Push to Repository
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Repository</label>
                          <select
                            value={selectedRepo}
                            onChange={(e) => setSelectedRepo(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                            data-testid="select-github-repo"
                          >
                            <option value="">Select a repository...</option>
                            {githubRepos.map(repo => (
                              <option key={repo.id} value={repo.fullName}>
                                {repo.fullName} {repo.private ? '(Private)' : '(Public)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Branch</label>
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-5 h-5 text-gray-400" />
                            <Input
                              value={pushBranch}
                              onChange={(e) => setPushBranch(e.target.value)}
                              className="bg-gray-700 border-gray-600 text-white"
                              placeholder="clean main"
                              data-testid="input-github-branch"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Commit Message (optional)</label>
                          <Input
                            value={pushMessage}
                            onChange={(e) => setPushMessage(e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                            placeholder="Deploy from StreamStickPro Admin"
                            data-testid="input-github-message"
                          />
                        </div>

                        <Button
                          onClick={pushToGithub}
                          disabled={pushing || !selectedRepo}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          data-testid="button-push-github"
                        >
                          {pushing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Pushing to GitHub...
                            </>
                          ) : (
                            <>
                              <CloudUpload className="w-4 h-4 mr-2" />
                              Push Code to GitHub
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">What Gets Pushed</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-400 space-y-2">
                        <p className="flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-green-500" />
                          client/ folder (React frontend)
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-green-500" />
                          server/ folder (Express backend)
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-green-500" />
                          shared/ folder (Types & schemas)
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCheck className="w-4 h-4 text-green-500" />
                          Config files (package.json, etc.)
                        </p>
                        <p className="flex items-center gap-2 text-yellow-500 mt-4">
                          <AlertCircle className="w-4 h-4" />
                          Excludes: node_modules, .git, dist
                        </p>
                      </CardContent>
                    </Card>

                    {pushResult && (
                      <Card className={`border ${pushResult.success ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {pushResult.success ? (
                              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            )}
                            <div>
                              <p className={`font-medium ${pushResult.success ? 'text-green-400' : 'text-red-400'}`}>
                                {pushResult.success ? 'Push Successful!' : 'Push Failed'}
                              </p>
                              <p className="text-sm text-gray-400 mt-1">{pushResult.message}</p>
                              {pushResult.filesCount && (
                                <p className="text-sm text-gray-500 mt-1">{pushResult.filesCount} files pushed</p>
                              )}
                              {pushResult.commitUrl && (
                                <a 
                                  href={pushResult.commitUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-2"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  View Commit on GitHub
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "seo" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Search className="w-8 h-8 text-green-500" />
                  SEO Toolkit
                </h2>
                <p className="text-gray-400">Rank Math Premium-style SEO management</p>
              </div>
              <SeoToolkit authFetch={authFetch} showToast={showToast} />
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Settings className="w-8 h-8 text-blue-500" />
                  System Settings
                </h2>
                <p className="text-gray-400">Manage system configuration and environment variables</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Environment Variables Status */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lock className="w-5 h-5 text-blue-400" />
                      Environment Variables Status
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      These are configured in Cloudflare Workers/Pages dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Stripe Secret Key</p>
                          <p className="text-xs text-gray-400">STRIPE_SECRET_KEY</p>
                        </div>
                        <Badge className={envStatus?.hasStripeKey ? 'bg-green-500' : 'bg-red-500'}>
                          {envStatus?.hasStripeKey ? 'Configured' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Stripe Webhook Secret</p>
                          <p className="text-xs text-gray-400">STRIPE_WEBHOOK_SECRET</p>
                        </div>
                        <Badge className={envStatus?.hasWebhookSecret ? 'bg-green-500' : 'bg-red-500'}>
                          {envStatus?.hasWebhookSecret ? 'Configured' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Resend API Key</p>
                          <p className="text-xs text-gray-400">RESEND_API_KEY</p>
                        </div>
                        <Badge className={envStatus?.hasResendKey ? 'bg-green-500' : 'bg-red-500'}>
                          {envStatus?.hasResendKey ? 'Configured' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Resend From Email</p>
                          <p className="text-xs text-gray-400">RESEND_FROM_EMAIL</p>
                        </div>
                        <Badge className={envStatus?.hasFromEmail ? 'bg-green-500' : 'bg-red-500'}>
                          {envStatus?.hasFromEmail ? 'Configured' : 'Missing'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Supabase Service Key</p>
                          <p className="text-xs text-gray-400">SUPABASE_SERVICE_KEY</p>
                        </div>
                        <Badge className={envStatus?.hasSupabaseKey ? 'bg-green-500' : 'bg-yellow-500'}>
                          {envStatus?.hasSupabaseKey ? 'Configured' : 'Using Anon Key'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">Admin Username</p>
                          <p className="text-xs text-gray-400">ADMIN_USERNAME</p>
                        </div>
                        <Badge className={envStatus?.hasAdminUsername ? 'bg-green-500' : 'bg-yellow-500'}>
                          {envStatus?.hasAdminUsername ? 'Configured' : 'Using Default'}
                        </Badge>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={() => window.open('https://dash.cloudflare.com/', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Cloudflare Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-400" />
                      System Information
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Current system status and configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">Environment</span>
                        <Badge className={envStatus?.nodeEnv === 'production' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {envStatus?.nodeEnv || 'Not Set'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">From Email</span>
                        <span className="text-white font-mono text-sm">{envStatus?.fromEmail || 'Not Set'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-300">Supabase URL</span>
                        <span className="text-white font-mono text-xs truncate max-w-[200px]" title={envStatus?.supabaseUrl}>
                          {envStatus?.supabaseUrl || 'Not Set'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                        onClick={async () => {
                          try {
                            const response = await authFetch('/api/debug');
                            const data = await response.json();
                            setEnvStatus({
                              hasStripeKey: !!data.stripe?.hasSecretKey,
                              hasWebhookSecret: !!data.stripe?.hasWebhookSecret,
                              hasResendKey: !!data.email?.hasResendKey,
                              hasFromEmail: !!data.email?.hasFromEmail,
                              hasSupabaseKey: !!data.supabase?.hasServiceKey,
                              hasAdminUsername: !!data.auth?.hasAdminUsername,
                              hasAdminPassword: !!data.auth?.hasAdminPassword,
                              nodeEnv: data.nodeEnv,
                              fromEmail: data.email?.fromEmail,
                              supabaseUrl: data.supabase?.url
                            });
                            showToast('Environment status refreshed', 'success');
                          } catch (error) {
                            showToast('Failed to refresh status', 'error');
                          }
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 flex flex-col h-auto py-4"
                        onClick={() => setActiveSection("dashboard")}
                      >
                        <Activity className="w-6 h-6 mb-2" />
                        View Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 flex flex-col h-auto py-4"
                        onClick={() => setActiveSection("fulfillment")}
                      >
                        <Truck className="w-6 h-6 mb-2" />
                        Manage Orders
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 flex flex-col h-auto py-4"
                        onClick={() => setActiveSection("customers")}
                      >
                        <Users className="w-6 h-6 mb-2" />
                        Manage Customers
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      {newCustomerForm && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="w-full max-w-lg bg-gray-800 rounded-2xl">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Add New Customer</h3>
                <Button variant="ghost" onClick={() => setNewCustomerForm(null)} className="text-white hover:bg-white/20">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Username *</label>
                  <Input
                    value={newCustomerForm.username || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, username: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., johndoe123"
                    data-testid="input-new-username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Password *</label>
                  <Input
                    value={newCustomerForm.password || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, password: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., SecurePass123"
                    data-testid="input-new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                  <Input
                    type="email"
                    value={newCustomerForm.email || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., john@example.com"
                    data-testid="input-new-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                  <Input
                    value={newCustomerForm.fullName || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, fullName: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                  <Input
                    value={newCustomerForm.phone || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., +1 555-123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={newCustomerForm.notes || ''}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Any notes about this customer..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                <Button variant="outline" onClick={() => setNewCustomerForm(null)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button 
                  onClick={createNewCustomer}
                  disabled={savingCustomer}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-save-new-customer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingCustomer ? 'Creating...' : 'Create Customer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="w-full max-w-lg bg-gray-800 rounded-2xl">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Edit Customer</h3>
                <Button variant="ghost" onClick={() => setEditingCustomer(null)} className="text-white hover:bg-white/20">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Username</label>
                  <Input
                    value={editingCustomer.username}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, username: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-edit-username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                  <Input
                    value={editingCustomer.password}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, password: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-edit-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
                  <Input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    data-testid="input-edit-email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                  <Input
                    value={editingCustomer.fullName || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
                  <Input
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                  <select
                    value={editingCustomer.status || 'active'}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    data-testid="select-edit-status"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={editingCustomer.notes || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Any notes about this customer..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                <Button variant="outline" onClick={() => setEditingCustomer(null)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button 
                  onClick={saveCustomer}
                  disabled={savingCustomer}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  data-testid="button-save-customer"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingCustomer ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {editingProduct.id ? 'Edit Product' : 'Add New Product'}
                </h3>
                <Button variant="ghost" onClick={() => setEditingProduct(null)} className="text-white hover:bg-white/20">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Product Name *</label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., StreamStick 4K Kit"
                    data-testid="input-product-name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">URL Slug</label>
                    <Input
                      value={editingProduct.slug}
                      onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="fire-stick-4k"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">SKU</label>
                    <Input
                      value={editingProduct.sku || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="FS-4K"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Full product description..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Regular Price * ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={centsToDollars(editingProduct.price)}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: dollarsToCents(parseFloat(e.target.value) || 0) })}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-testid="input-price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Sale Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.sale_price ? centsToDollars(editingProduct.sale_price) : ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: e.target.value ? dollarsToCents(parseFloat(e.target.value)) : null })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Stock Quantity</label>
                    <Input
                      type="number"
                      value={editingProduct.stock_quantity}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="subscriptions">Subscriptions</option>
                      <option value="devices">Devices</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
                    <select
                      value={editingProduct.status}
                      onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="publish">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Product Image</label>
                  {editingProduct.main_image && (
                    <div className="relative mb-3">
                      <img 
                        src={editingProduct.main_image} 
                        alt="Product preview" 
                        className="w-full h-40 object-cover rounded-lg border border-gray-600"
                        loading="lazy"
                        width={400}
                        height={160}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => setEditingProduct({ ...editingProduct, main_image: '' })}
                        data-testid="button-remove-image"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        value={editingProduct.main_image || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, main_image: e.target.value })}
                        className="bg-gray-700 border-gray-600 text-white"
                        placeholder="Enter image URL or upload a file..."
                        data-testid="input-image-url"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                        data-testid="input-file-upload"
                      />
                      <Button
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={uploading}
                        data-testid="button-upload-image"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports JPEG, PNG, GIF, WebP. Max size: 5MB
                  </p>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-purple-400" />
                    Stripe Compliance (Shadow Product Name)
                  </h4>
                  <p className="text-sm text-gray-400 mb-4">
                    This is the "cloaked" product name shown to Stripe. It should be generic.
                  </p>
                  <Input
                    value={editingProduct.cloaked_name || 'Digital Entertainment Service'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cloaked_name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Digital Entertainment Service"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Will sync to: {getShadowName(editingProduct.name)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingProduct.featured}
                    onChange={(e) => setEditingProduct({ ...editingProduct, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-gray-300">Featured Product (marked as popular)</label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                <Button variant="outline" onClick={() => setEditingProduct(null)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button 
                  onClick={saveProduct} 
                  disabled={saving}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  data-testid="button-save-product"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Product'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editingPageEdit && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {editingPageEdit.id ? 'Edit Content' : 'Add Content Edit'}
                </h3>
                <Button variant="ghost" onClick={() => setEditingPageEdit(null)} className="text-white hover:bg-white/20">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Page ID *</label>
                    <select
                      value={editingPageEdit.pageId || 'main'}
                      onChange={(e) => setEditingPageEdit({ ...editingPageEdit, pageId: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      data-testid="select-page-id"
                    >
                      <option value="main">Main Store</option>
                      <option value="checkout">Checkout</option>
                      <option value="blog">Blog</option>
                      <option value="success">Success Page</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Section ID *</label>
                    <Input
                      value={editingPageEdit.sectionId || ''}
                      onChange={(e) => setEditingPageEdit({ ...editingPageEdit, sectionId: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., hero, products, faq"
                      data-testid="input-section-id"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Element ID *</label>
                    <Input
                      value={editingPageEdit.elementId || ''}
                      onChange={(e) => setEditingPageEdit({ ...editingPageEdit, elementId: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="e.g., headline, subheadline, image"
                      data-testid="input-element-id"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Element Type *</label>
                    <select
                      value={editingPageEdit.elementType || 'text'}
                      onChange={(e) => setEditingPageEdit({ ...editingPageEdit, elementType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      data-testid="select-element-type"
                    >
                      <option value="text">Text</option>
                      <option value="heading">Heading</option>
                      <option value="paragraph">Paragraph</option>
                      <option value="button">Button</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                </div>

                {editingPageEdit.elementType === 'image' ? (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Image URL</label>
                    <Input
                      value={editingPageEdit.imageUrl || ''}
                      onChange={(e) => setEditingPageEdit({ ...editingPageEdit, imageUrl: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="https://example.com/image.jpg"
                      data-testid="input-image-url-edit"
                    />
                    {editingPageEdit.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={editingPageEdit.imageUrl} 
                          alt="Preview" 
                          className="w-full h-40 object-cover rounded-lg border border-gray-600"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Content</label>
                    <textarea
                      value={editingPageEdit.content || ''}
                      onChange={(e) => setEditingPageEdit({ ...editingPageEdit, content: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 min-h-[120px]"
                      placeholder="Enter the new text content..."
                      data-testid="input-content"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editingPageEdit.isActive !== false}
                    onChange={(e) => setEditingPageEdit({ ...editingPageEdit, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-gray-300">Active (apply this edit to the live site)</label>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Element Identifier</h4>
                  <code className="text-xs text-orange-400 bg-gray-900 px-2 py-1 rounded">
                    data-edit="{editingPageEdit.pageId || 'main'}/{editingPageEdit.sectionId || 'section'}/{editingPageEdit.elementId || 'element'}"
                  </code>
                  <p className="text-xs text-gray-400 mt-2">
                    Add this attribute to any element in your code to make it editable.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                <Button variant="outline" onClick={() => setEditingPageEdit(null)} className="border-gray-600 text-gray-300">
                  Cancel
                </Button>
                <Button 
                  onClick={savePageEdit} 
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="button-save-page-edit"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Edit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
