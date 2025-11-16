import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, RefreshCw, Globe, Mail, Phone, MapPin, AlertCircle } from 'lucide-react';

interface BrandingSettings {
  site_name: string;
  site_tagline: string;
  domain: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  twitter_handle: string;
  facebook_page: string;
  instagram_handle: string;
  youtube_channel: string;
}

export default function SiteBrandingManager() {
  const [settings, setSettings] = useState<BrandingSettings>({
    site_name: 'Stream Stick Pro',
    site_tagline: 'Premium IPTV Subscriptions & Jailbroken Fire Stick Shop',
    domain: 'streamstickpro.com',
    contact_email: 'reloadedfiretvteam@gmail.com',
    contact_phone: '+1 (555) 123-4567',
    business_address: 'United States',
    meta_title: 'Stream Stick Pro - Premium IPTV Subscriptions & Jailbroken Fire Stick | 20,000+ Channels',
    meta_description: 'Premium IPTV subscriptions with 20,000+ live channels, movies, sports & PPV. Jailbroken Fire Stick 4K devices. 7-day money-back guarantee. 24/7 support.',
    meta_keywords: 'IPTV, premium IPTV, Fire Stick, jailbroken Fire Stick, live TV streaming, sports IPTV, movie streaming, cord cutting',
    twitter_handle: '@streamstickpro',
    facebook_page: 'streamstickpro',
    instagram_handle: '@streamstickpro',
    youtube_channel: '@streamstickpro'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('setting_key', 'branding')
      .maybeSingle();

    if (data && data.setting_value) {
      setSettings(data.setting_value as BrandingSettings);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        setting_key: 'branding',
        setting_value: settings,
        setting_type: 'branding',
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      });

    if (error) {
      setMessage('Error saving settings. Please try again.');
      console.error(error);
    } else {
      setMessage('✅ Branding settings saved! Reload the website to see changes.');

      // Update page title immediately
      document.title = settings.meta_title;
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Site Branding & Settings</h2>
            <p className="text-sm opacity-90">Change your site name, domain, and all branding from one place</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-yellow-900 mb-2">Important Information</h3>
            <ul className="text-sm text-yellow-800 space-y-2">
              <li><strong>Your Domain:</strong> streamstickpro.com (Cloudflare connected)</li>
              <li><strong>Current Branding:</strong> "Inferno TV" in code (causing confusion)</li>
              <li><strong>What This Does:</strong> Changes site name, meta tags, and SEO settings</li>
              <li><strong>Does NOT Cause Cloudflare Conflicts:</strong> Branding is separate from DNS</li>
              <li><strong>After Saving:</strong> Rebuild and redeploy for changes to appear on live site</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="Stream Stick Pro"
              />
              <p className="text-xs text-gray-500 mt-1">Appears in logo, navigation, and footer</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={settings.domain}
                onChange={(e) => setSettings({ ...settings, domain: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="streamstickpro.com"
              />
              <p className="text-xs text-gray-500 mt-1">Your actual domain (for reference only)</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Site Tagline
            </label>
            <input
              type="text"
              value={settings.site_tagline}
              onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="Premium IPTV Subscriptions & Jailbroken Fire Stick Shop"
            />
            <p className="text-xs text-gray-500 mt-1">Short description of your business</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Business Address
            </label>
            <input
              type="text"
              value={settings.business_address}
              onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">SEO Settings</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Title (SEO)
            </label>
            <input
              type="text"
              value={settings.meta_title}
              onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              maxLength={60}
            />
            <p className="text-xs text-gray-500 mt-1">{settings.meta_title.length}/60 characters (shows in Google search results)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Description (SEO)
            </label>
            <textarea
              value={settings.meta_description}
              onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">{settings.meta_description.length}/160 characters (shows in Google search results)</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Meta Keywords (SEO)
            </label>
            <textarea
              value={settings.meta_keywords}
              onChange={(e) => setSettings({ ...settings, meta_keywords: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              rows={2}
              placeholder="Separate with commas"
            />
            <p className="text-xs text-gray-500 mt-1">Keywords separated by commas</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Social Media</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Twitter Handle
            </label>
            <input
              type="text"
              value={settings.twitter_handle}
              onChange={(e) => setSettings({ ...settings, twitter_handle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="@streamstickpro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Facebook Page
            </label>
            <input
              type="text"
              value={settings.facebook_page}
              onChange={(e) => setSettings({ ...settings, facebook_page: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="streamstickpro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Instagram Handle
            </label>
            <input
              type="text"
              value={settings.instagram_handle}
              onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="@streamstickpro"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              YouTube Channel
            </label>
            <input
              type="text"
              value={settings.youtube_channel}
              onChange={(e) => setSettings({ ...settings, youtube_channel: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="@streamstickpro"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl p-4 ${message.includes('✅') ? 'bg-green-50 border-2 border-green-300 text-green-800' : 'bg-red-50 border-2 border-red-300 text-red-800'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">Ready to Save?</h3>
            <p className="text-sm text-gray-600">Changes will save to database. Rebuild site to apply.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save All Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">Next Steps After Saving:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
          <li>Click "Save All Settings" above</li>
          <li>Run <code className="bg-blue-100 px-2 py-1 rounded">npm run build</code></li>
          <li>Deploy to Cloudflare</li>
          <li>Visit streamstickpro.com to see changes</li>
        </ol>
      </div>
    </div>
  );
}
