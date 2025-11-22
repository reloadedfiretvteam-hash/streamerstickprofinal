import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface FrontendSettings {
  show_urgency_timer: boolean;
  show_trust_badges: boolean;
  show_social_proof: boolean;
  show_comparison_table: boolean;
  show_money_back_guarantee: boolean;
  show_reviews_carousel: boolean;
  show_email_popup: boolean;
  hero_title: string;
  hero_subtitle: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  social_proof_interval: number;
  trust_badge_count: number;
}

export default function FrontendControlPanel() {
  const [settings, setSettings] = useState<FrontendSettings>({
    show_urgency_timer: false,
    show_trust_badges: true,
    show_social_proof: true,
    show_comparison_table: true,
    show_money_back_guarantee: true,
    show_reviews_carousel: true,
    show_email_popup: true,
    hero_title: 'Inferno TV',
    hero_subtitle: 'Premium IPTV Subscriptions & Jailbroken Fire Stick Shop',
    cta_primary_text: 'Shop Now',
    cta_secondary_text: 'Learn More',
    social_proof_interval: 90,
    trust_badge_count: 6
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    emailSubscribers: 0,
    blogPosts: 0
  });

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('frontend_settings')
        .select('*')
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.log('No existing settings, using defaults');
    }
  };

  const loadStats = async () => {
    try {
      // Get total orders
      const { count: ordersCount } = await supabase
        .from('orders_full')
        .select('*', { count: 'exact', head: true });

      // Get pending orders
      const { count: pendingCount } = await supabase
        .from('orders_full')
        .select('*', { count: 'exact', head: true })
        .eq('order_status', 'pending');

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders_full')
        .select('total')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Get active products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get email subscribers
      const { count: emailCount } = await supabase
        .from('email_captures')
        .select('*', { count: 'exact', head: true });

      // Get published blog posts
      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published');

      setStats({
        totalOrders: ordersCount || 0,
        pendingOrders: pendingCount || 0,
        totalRevenue: totalRevenue,
        activeProducts: productsCount || 0,
        emailSubscribers: emailCount || 0,
        blogPosts: blogCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('frontend_settings')
        .upsert(settings, { onConflict: 'id' });

      if (error) throw error;

      setMessage('Settings saved successfully! Changes will appear on the frontend.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof FrontendSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof FrontendSettings]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Frontend Control Panel</h2>
        <p className="text-blue-100">Control all visible elements on your website</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Total Orders</div>
          <div className="text-white text-2xl font-bold">{stats.totalOrders}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-orange-500/50">
          <div className="text-gray-400 text-sm mb-1">Pending Orders</div>
          <div className="text-orange-400 text-2xl font-bold">{stats.pendingOrders}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-green-500/50">
          <div className="text-gray-400 text-sm mb-1">Total Revenue</div>
          <div className="text-green-400 text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Active Products</div>
          <div className="text-white text-2xl font-bold">{stats.activeProducts}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Email Subscribers</div>
          <div className="text-white text-2xl font-bold">{stats.emailSubscribers}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-gray-400 text-sm mb-1">Blog Posts</div>
          <div className="text-white text-2xl font-bold">{stats.blogPosts}</div>
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
        }`}>
          {message.includes('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Visibility Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="w-6 h-6" />
          Frontend Element Visibility
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Urgency Timer</div>
              <div className="text-gray-400 text-sm">Countdown timer at top of page</div>
            </div>
            <button
              onClick={() => toggleSetting('show_urgency_timer')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_urgency_timer ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_urgency_timer ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Trust Badges</div>
              <div className="text-gray-400 text-sm">Security and shipping badges</div>
            </div>
            <button
              onClick={() => toggleSetting('show_trust_badges')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_trust_badges ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_trust_badges ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Social Proof Notifications</div>
              <div className="text-gray-400 text-sm">Recent purchase pop-ups (90s interval)</div>
            </div>
            <button
              onClick={() => toggleSetting('show_social_proof')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_social_proof ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_social_proof ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Comparison Table</div>
              <div className="text-gray-400 text-sm">Compare vs Cable & Streaming</div>
            </div>
            <button
              onClick={() => toggleSetting('show_comparison_table')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_comparison_table ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_comparison_table ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Money-Back Guarantee</div>
              <div className="text-gray-400 text-sm">7-day guarantee section</div>
            </div>
            <button
              onClick={() => toggleSetting('show_money_back_guarantee')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_money_back_guarantee ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_money_back_guarantee ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Reviews Carousel</div>
              <div className="text-gray-400 text-sm">Customer testimonials slider</div>
            </div>
            <button
              onClick={() => toggleSetting('show_reviews_carousel')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_reviews_carousel ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_reviews_carousel ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
            <div>
              <div className="text-white font-semibold">Email Popup</div>
              <div className="text-gray-400 text-sm">Email capture popup (15s delay)</div>
            </div>
            <button
              onClick={() => toggleSetting('show_email_popup')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                settings.show_email_popup ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                settings.show_email_popup ? 'translate-x-6' : ''
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Text Content Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Hero Section Content</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Hero Title</label>
            <input
              type="text"
              value={settings.hero_title}
              onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Hero Subtitle</label>
            <input
              type="text"
              value={settings.hero_subtitle}
              onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Primary CTA Text</label>
              <input
                type="text"
                value={settings.cta_primary_text}
                onChange={(e) => setSettings({ ...settings, cta_primary_text: e.target.value })}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Secondary CTA Text</label>
              <input
                type="text"
                value={settings.cta_secondary_text}
                onChange={(e) => setSettings({ ...settings, cta_secondary_text: e.target.value })}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {loading ? 'Saving...' : 'Save All Changes'}
        </button>

        <button
          onClick={loadStats}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh Stats
        </button>
      </div>

      {/* Quick Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-100 text-sm">
            <strong>Note:</strong> These settings control the visibility and content of frontend elements. Changes are saved to the database and will affect what visitors see on your website. Social proof notifications now appear every 90 seconds (1.5 minutes) and include 17 different customer purchase examples.
          </div>
        </div>
      </div>
    </div>
  );
}
