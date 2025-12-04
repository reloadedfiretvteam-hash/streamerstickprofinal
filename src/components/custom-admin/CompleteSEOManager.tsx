import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw, CheckCircle, AlertCircle, TrendingUp, Globe, Share2 } from 'lucide-react';

interface SEOSettings {
  google_analytics_id: string;
  google_search_console_verification: string;
  bing_webmaster_verification: string;
  google_tag_manager_id: string;
  site_name: string;
  site_description: string;
  site_keywords: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url: string;
  og_image_url: string;
  og_image_width: number;
  og_image_height: number;
  twitter_card_type: string;
  twitter_image_url: string;
  aggregate_rating: number;
  review_count: number;
  price_range_low: number;
  price_range_high: number;
}

export default function CompleteSEOManager() {
  const [settings, setSettings] = useState<SEOSettings>({
    google_analytics_id: 'G-XXXXXXXXXX',
    google_search_console_verification: 'YOUR_GOOGLE_VERIFICATION_CODE',
    bing_webmaster_verification: 'YOUR_BING_VERIFICATION_CODE',
    google_tag_manager_id: '',
    site_name: 'Inferno TV',
    site_description: 'Premium IPTV subscriptions with 20,000+ live channels, movies, sports & PPV.',
    site_keywords: 'IPTV, premium IPTV, Fire Stick',
    business_name: 'Inferno TV',
    business_email: 'reloadedfiretvteam@gmail.com',
    business_phone: '',
    business_address: '',
    facebook_url: '',
    twitter_url: '@infernotv',
    instagram_url: '',
    youtube_url: '',
    linkedin_url: '',
    og_image_url: '/og-image.jpg',
    og_image_width: 1200,
    og_image_height: 630,
    twitter_card_type: 'summary_large_image',
    twitter_image_url: '/twitter-card.jpg',
    aggregate_rating: 4.8,
    review_count: 1247,
    price_range_low: 49.99,
    price_range_high: 199.99
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('google');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('seo_settings')
        .update(settings)
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      setMessage('SEO settings saved successfully! Changes will appear on the website.');
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'google', label: 'Google Services', icon: Globe },
    { id: 'site', label: 'Site Information', icon: TrendingUp },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'business', label: 'Business Info', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Complete SEO Manager</h2>
        <p className="text-blue-100">Manage all SEO settings, Google services, and social media links</p>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
        }`}>
          {message.includes('Error') ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Google Services Tab */}
      {activeTab === 'google' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Google Services Configuration</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
              />
              <p className="text-gray-400 text-sm mt-2">
                Get this from Google Analytics → Admin → Data Streams → Measurement ID
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Google Search Console Verification Code
              </label>
              <input
                type="text"
                value={settings.google_search_console_verification}
                onChange={(e) => setSettings({ ...settings, google_search_console_verification: e.target.value })}
                placeholder="YOUR_GOOGLE_VERIFICATION_CODE"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
              />
              <p className="text-gray-400 text-sm mt-2">
                Get this from Search Console → Settings → Ownership verification → HTML tag method
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Bing Webmaster Tools Verification Code
              </label>
              <input
                type="text"
                value={settings.bing_webmaster_verification}
                onChange={(e) => setSettings({ ...settings, bing_webmaster_verification: e.target.value })}
                placeholder="YOUR_BING_VERIFICATION_CODE"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
              />
              <p className="text-gray-400 text-sm mt-2">
                Get this from Bing Webmaster Tools → Site verification → HTML tag method
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Google Tag Manager ID (Optional)
              </label>
              <input
                type="text"
                value={settings.google_tag_manager_id}
                onChange={(e) => setSettings({ ...settings, google_tag_manager_id: e.target.value })}
                placeholder="GTM-XXXXXXX"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none font-mono"
              />
              <p className="text-gray-400 text-sm mt-2">
                Optional: For advanced tracking and tag management
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-bold mb-2">Quick Setup Links:</h4>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li>• <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Google Analytics 4</a></li>
                <li>• <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Google Search Console</a></li>
                <li>• <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Bing Webmaster Tools</a></li>
                <li>• <a href="https://tagmanager.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">Google Tag Manager</a></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Site Information Tab */}
      {activeTab === 'site' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Site Information & Meta Tags</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Site Name</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                Meta Description (160 characters max)
              </label>
              <textarea
                value={settings.site_description}
                onChange={(e) => setSettings({ ...settings, site_description: e.target.value })}
                rows={3}
                maxLength={160}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-gray-400 text-sm mt-1">
                {settings.site_description.length}/160 characters
              </p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">
                SEO Keywords (comma-separated)
              </label>
              <textarea
                value={settings.site_keywords}
                onChange={(e) => setSettings({ ...settings, site_keywords: e.target.value })}
                rows={3}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Aggregate Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={settings.aggregate_rating}
                  onChange={(e) => setSettings({ ...settings, aggregate_rating: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Review Count</label>
                <input
                  type="number"
                  value={settings.review_count}
                  onChange={(e) => setSettings({ ...settings, review_count: parseInt(e.target.value) })}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Price Range Low ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.price_range_low}
                  onChange={(e) => setSettings({ ...settings, price_range_low: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 font-semibold">Price Range High ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.price_range_high}
                  onChange={(e) => setSettings({ ...settings, price_range_high: parseFloat(e.target.value) })}
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Social Media Links</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Facebook URL</label>
              <input
                type="url"
                value={settings.facebook_url}
                onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                placeholder="https://facebook.com/infernotv"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Twitter Handle</label>
              <input
                type="text"
                value={settings.twitter_url}
                onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                placeholder="@infernotv"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Instagram URL</label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                placeholder="https://instagram.com/infernotv"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">YouTube Channel URL</label>
              <input
                type="url"
                value={settings.youtube_url}
                onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                placeholder="https://youtube.com/@infernotv"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">LinkedIn URL</label>
              <input
                type="url"
                value={settings.linkedin_url}
                onChange={(e) => setSettings({ ...settings, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/company/infernotv"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Business Info Tab */}
      {activeTab === 'business' && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Business Information</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Business Name</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Business Email</label>
              <input
                type="email"
                value={settings.business_email}
                onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Business Phone</label>
              <input
                type="tel"
                value={settings.business_phone}
                onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                placeholder="+1-XXX-XXX-XXXX"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2 font-semibold">Business Address</label>
              <textarea
                value={settings.business_address}
                onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                rows={3}
                placeholder="Street, City, State, ZIP, Country"
                className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

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
          onClick={loadSettings}
          className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
        >
          <RefreshCw className="w-5 h-5" />
          Reload Settings
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-100 text-sm">
            <strong>Important:</strong> After saving these settings, they will automatically be used throughout your website. Google Analytics and Search Console verification codes will be embedded in your site's HTML. Make sure to verify your site in Google Search Console after adding the verification code.
          </div>
        </div>
      </div>
    </div>
  );
}
