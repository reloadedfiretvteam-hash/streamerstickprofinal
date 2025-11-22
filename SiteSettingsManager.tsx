import { useState, useEffect } from 'react';
import { Settings, Save, Globe, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* interface SiteSetting {
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description?: string;
} */

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'FireStreamPlus',
    site_domain: 'FireStreamPlus.com',
    company_name: 'FireStreamPlus',
    company_email: 'support@firestreamplus.com',
    company_phone: '',
    company_address: '',
    support_email: 'support@firestreamplus.com',
    sales_email: 'sales@firestreamplus.com',
    contact_email: 'contact@firestreamplus.com',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    youtube_url: '',
    meta_title_suffix: ' | FireStreamPlus',
    meta_description_default: 'Premium IPTV streaming with 22,000+ channels and Fire Stick devices',
    copyright_text: '© 2025 FireStreamPlus. All rights reserved.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsObj: Record<string, string> = {};
      data?.forEach(item => {
        settingsObj[item.setting_key] = item.setting_value;
      });

      setSettings(prev => ({...prev, ...settingsObj}));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('site_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
            setting_type: 'text',
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'setting_key'
          });

        if (error) throw error;
      }

      alert('Settings saved successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({...prev, [key]: value}));
  };

  if (loading) {
    return <div className="p-6 text-white">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Site Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5" />
          General Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => updateSetting('site_name', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Domain
            </label>
            <input
              type="text"
              value={settings.site_domain}
              onChange={(e) => updateSetting('site_domain', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => updateSetting('company_name', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={settings.copyright_text}
              onChange={(e) => updateSetting('copyright_text', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Email
            </label>
            <input
              type="email"
              value={settings.company_email}
              onChange={(e) => updateSetting('company_email', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={settings.support_email}
              onChange={(e) => updateSetting('support_email', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sales Email
            </label>
            <input
              type="email"
              value={settings.sales_email}
              onChange={(e) => updateSetting('sales_email', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => updateSetting('contact_email', e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Phone
            </label>
            <input
              type="tel"
              value={settings.company_phone}
              onChange={(e) => updateSetting('company_phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company Address
            </label>
            <input
              type="text"
              value={settings.company_address}
              onChange={(e) => updateSetting('company_address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">Social Media Links</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Facebook URL
            </label>
            <input
              type="url"
              value={settings.facebook_url}
              onChange={(e) => updateSetting('facebook_url', e.target.value)}
              placeholder="https://facebook.com/yourbusiness"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Twitter/X URL
            </label>
            <input
              type="url"
              value={settings.twitter_url}
              onChange={(e) => updateSetting('twitter_url', e.target.value)}
              placeholder="https://twitter.com/yourbusiness"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.instagram_url}
              onChange={(e) => updateSetting('instagram_url', e.target.value)}
              placeholder="https://instagram.com/yourbusiness"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={settings.youtube_url}
              onChange={(e) => updateSetting('youtube_url', e.target.value)}
              placeholder="https://youtube.com/@yourbusiness"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* SEO Defaults */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">SEO Defaults</h3>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meta Title Suffix
          </label>
          <input
            type="text"
            value={settings.meta_title_suffix}
            onChange={(e) => updateSetting('meta_title_suffix', e.target.value)}
            placeholder=" | Your Brand Name"
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Added to the end of page titles (e.g., "Page Name | FireStreamPlus")
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Default Meta Description
          </label>
          <textarea
            value={settings.meta_description_default}
            onChange={(e) => updateSetting('meta_description_default', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
          />
          <p className="text-xs text-gray-400 mt-1">
            Used when pages don't have a custom meta description
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
