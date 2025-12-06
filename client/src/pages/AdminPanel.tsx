import { useState, useEffect, ChangeEvent } from "react";
import { useLocation } from "wouter";
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
  Loader2
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
import { supabase, getStorageUrl } from "@/lib/supabase";

interface VisitorStats {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  onlineNow: number;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  recentVisitors: Array<{
    id: string;
    page_url: string;
    referrer: string | null;
    user_agent: string;
    created_at: string;
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

const shadowProductMap: Record<string, string> = {
  "Fire Stick HD": "Web Design Basic",
  "Fire Stick 4K": "Web Design Pro",
  "Fire Stick 4K Max": "Web Design Enterprise",
  "1 Month IPTV": "SEO Basic",
  "3 Month IPTV": "SEO Standard",
  "6 Month IPTV": "SEO Pro",
  "1 Year IPTV": "SEO Enterprise"
};

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [, setLocation] = useLocation();
  
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({
    totalVisitors: 0,
    todayVisitors: 0,
    weekVisitors: 0,
    onlineNow: 0,
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadVisitorStats();
    loadProducts();
    
    const interval = setInterval(() => {
      loadVisitorStats();
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadVisitorStats = async () => {
    try {
      setLoadingStats(true);
      
      const response = await fetch('/api/admin/visitors/stats');
      const result = await response.json();
      
      if (result.data) {
        const { totalVisitors, todayVisitors, weekVisitors, onlineNow, recentVisitors } = result.data;
        
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
          page_url: v.pageUrl || '/',
          referrer: v.referrer || null,
          user_agent: v.userAgent || 'Unknown',
          created_at: v.createdAt || new Date().toISOString()
        }));

        setVisitorStats({
          totalVisitors,
          todayVisitors,
          weekVisitors,
          onlineNow,
          deviceBreakdown,
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
    const { data } = await supabase
      .from('real_products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data) {
      setProducts(data);
    }
    setLoadingProducts(false);
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
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
            <FileText className="w-4 h-4 mr-3" /> Blog Posts
          </Button>
          <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5">
            <Settings className="w-4 h-4 mr-3" /> Settings
          </Button>
        </nav>

        <div className="p-4 border-t border-white/10">
           <Button variant="outline" className="w-full" onClick={() => setLocation("/")} data-testid="button-view-site">
             View Live Site
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-total-visitors">{visitorStats.totalVisitors.toLocaleString()}</span>
                  </div>
                  <p className="text-blue-100 text-sm">Total Visitors</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Eye className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-today-visitors">{visitorStats.todayVisitors.toLocaleString()}</span>
                  </div>
                  <p className="text-green-100 text-sm">Today</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-products-count">{products.length}</span>
                  </div>
                  <p className="text-purple-100 text-sm">Active Products</p>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold" data-testid="text-online-now">{visitorStats.onlineNow.toLocaleString()}</span>
                  </div>
                  <p className="text-orange-100 text-sm">Online Now</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      onClick={loadVisitorStats}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" /> Refresh Stats
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "visitors" && (
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

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-orange-500" />
                    Recent Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-400">Device</TableHead>
                        <TableHead className="text-gray-400">Page</TableHead>
                        <TableHead className="text-gray-400">Referrer</TableHead>
                        <TableHead className="text-gray-400">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorStats.recentVisitors.length > 0 ? (
                        visitorStats.recentVisitors.map((visitor, idx) => (
                          <TableRow key={idx} className="border-gray-700 hover:bg-gray-700/50">
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                {getDeviceIcon(visitor.user_agent)}
                                <span className="text-sm truncate max-w-[150px]">{visitor.user_agent.substring(0, 30)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">{visitor.page_url.substring(0, 40)}</TableCell>
                            <TableCell className="text-gray-400">
                              {visitor.referrer ? visitor.referrer.substring(0, 30) : 'Direct'}
                            </TableCell>
                            <TableCell className="text-gray-400">{formatTime(visitor.created_at)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="py-8 text-center text-gray-400">
                            No visitors tracked yet. Visitors will appear here as they browse your site.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
                                      <img src={product.main_image} alt={product.name} className="w-10 h-10 rounded object-cover" />
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
                                    ${product.sale_price || product.price}
                                  </span>
                                  {product.sale_price && (
                                    <span className="text-gray-500 line-through ml-2">${product.price}</span>
                                  )}
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
                            <div className="text-2xl font-bold text-orange-400 mb-2">${product.sale_price || product.price}</div>
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
                            <div className="text-2xl font-bold text-blue-400 mb-2">${product.sale_price || product.price}</div>
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
        </div>
      </main>

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
                    placeholder="e.g., Fire Stick 4K - Jailbroken"
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
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="bg-gray-700 border-gray-600 text-white"
                      data-testid="input-price"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Sale Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingProduct.sale_price || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: e.target.value ? parseFloat(e.target.value) : null })}
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
    </div>
  );
}
