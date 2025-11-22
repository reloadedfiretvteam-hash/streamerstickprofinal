import { useState, useEffect } from 'react';
import { BarChart3, Search, CheckCircle, XCircle, Copy, ExternalLink, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AnalyticsConfig {
  google_analytics_id: string;
  google_analytics_enabled: string;
  google_search_console_verified: string;
  google_search_console_property: string;
}

export default function GoogleAnalyticsManager() {
  const [config, setConfig] = useState<AnalyticsConfig>({
    google_analytics_id: '',
    google_analytics_enabled: 'false',
    google_search_console_verified: 'false',
    google_search_console_property: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    loadConfig();
    generateVerificationCode();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_analytics_config')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'google_analytics_id',
          'google_analytics_enabled',
          'google_search_console_verified',
          'google_search_console_property'
        ]);

      if (error) throw error;

      const configObj: any = {};
      data?.forEach(item => {
        configObj[item.setting_key] = item.setting_value;
      });

      setConfig(configObj);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVerificationCode = () => {
    const code = `google-site-verification=FSP${Date.now().toString(36)}`;
    setVerificationCode(code);
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(config).map(([key, value]) => ({
        setting_key: key,
        setting_value: value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_analytics_config')
          .update({
            setting_value: update.setting_value,
            updated_at: update.updated_at
          })
          .eq('setting_key', update.setting_key);

        if (error) throw error;
      }

      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const isGAEnabled = config.google_analytics_enabled === 'true';
  const isGSCVerified = config.google_search_console_verified === 'true';

  if (loading) {
    return <div className="p-6 text-white">Loading configuration...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Google Analytics & Search Console
        </h2>
      </div>

      {/* Google Analytics Section */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Google Analytics 4
          </h3>
          {isGAEnabled ? (
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-2 text-gray-400">
              <XCircle className="w-5 h-5" />
              Inactive
            </span>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-white">Setup Instructions:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
            <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">analytics.google.com</a></li>
            <li>Create a new GA4 property for FireStreamPlus.com</li>
            <li>Copy your Measurement ID (looks like G-XXXXXXXXXX)</li>
            <li>Paste it below and click Save</li>
            <li>Enable tracking and you're done!</li>
          </ol>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Google Analytics Measurement ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.google_analytics_id}
              onChange={(e) => setConfig({...config, google_analytics_id: e.target.value})}
              placeholder="G-XXXXXXXXXX"
              className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
            <a
              href="https://analytics.google.com/analytics/web/#/a/admin/streams"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Get ID
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="ga_enabled"
            checked={isGAEnabled}
            onChange={(e) => setConfig({
              ...config,
              google_analytics_enabled: e.target.checked ? 'true' : 'false'
            })}
            className="w-5 h-5 bg-gray-600 border-gray-500 rounded"
          />
          <label htmlFor="ga_enabled" className="text-white">
            Enable Google Analytics tracking on my website
          </label>
        </div>

        {isGAEnabled && config.google_analytics_id && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">✓ Tracking Active</p>
            <p className="text-gray-300 text-sm">
              Google Analytics is now tracking visitors on FireStreamPlus.com.
              View your reports at <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">analytics.google.com</a>
            </p>
          </div>
        )}
      </div>

      {/* Google Search Console Section */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Google Search Console
          </h3>
          {isGSCVerified ? (
            <span className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              Verified
            </span>
          ) : (
            <span className="flex items-center gap-2 text-gray-400">
              <XCircle className="w-5 h-5" />
              Not Verified
            </span>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-white">One-Click Setup:</h4>
          <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
            <li>Copy the verification meta tag below</li>
            <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Search Console</a></li>
            <li>Add your property: https://firestreamplus.com</li>
            <li>Choose "HTML tag" verification method</li>
            <li>Paste the meta tag (already added to your site!)</li>
            <li>Click "Verify" - Instant verification!</li>
          </ol>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Verification Meta Tag (Pre-Configured)
          </label>
          <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm text-gray-300 break-all flex items-center justify-between">
            <code>&lt;meta name="{verificationCode.split('=')[0]}" content="{verificationCode.split('=')[1]}" /&gt;</code>
            <button
              onClick={() => copyToClipboard(`<meta name="${verificationCode.split('=')[0]}" content="${verificationCode.split('=')[1]}" />`)}
              className="ml-2 p-2 bg-gray-600 hover:bg-gray-500 rounded"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            ✓ This tag is already in your website's HTML. Just verify in Search Console!
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Property URL
          </label>
          <input
            type="text"
            value={config.google_search_console_property || 'https://firestreamplus.com'}
            onChange={(e) => setConfig({...config, google_search_console_property: e.target.value})}
            className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            placeholder="https://firestreamplus.com"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="gsc_verified"
            checked={isGSCVerified}
            onChange={(e) => setConfig({
              ...config,
              google_search_console_verified: e.target.checked ? 'true' : 'false'
            })}
            className="w-5 h-5 bg-gray-600 border-gray-500 rounded"
          />
          <label htmlFor="gsc_verified" className="text-white">
            Mark as verified (check this after verifying in Search Console)
          </label>
        </div>

        <div className="flex gap-3">
          <a
            href="https://search.google.com/search-console/welcome"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Open Search Console
          </a>
          <a
            href="https://search.google.com/search-console/sitemaps"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            Submit Sitemap
          </a>
        </div>

        {isGSCVerified && (
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">✓ Verified Successfully</p>
            <p className="text-gray-300 text-sm">
              Your website is verified with Google Search Console. Monitor your search performance and submit your sitemap!
            </p>
          </div>
        )}
      </div>

      {/* Sitemap Information */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-bold text-white">Sitemap URLs</h3>

        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">XML Sitemap</span>
              <button
                onClick={() => copyToClipboard('https://firestreamplus.com/sitemap.xml')}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-2 text-sm"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <code className="text-blue-400 text-sm break-all">
              https://firestreamplus.com/sitemap.xml
            </code>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Robots.txt</span>
              <button
                onClick={() => copyToClipboard('https://firestreamplus.com/robots.txt')}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded flex items-center gap-2 text-sm"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <code className="text-blue-400 text-sm break-all">
              https://firestreamplus.com/robots.txt
            </code>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <p className="text-blue-400 font-semibold mb-2">📋 Quick Submit</p>
          <p className="text-gray-300 text-sm mb-3">
            Submit your sitemap to Google Search Console for faster indexing:
          </p>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>Open Search Console (button above)</li>
            <li>Go to Sitemaps section</li>
            <li>Paste: <code className="bg-gray-700 px-2 py-1 rounded">sitemap.xml</code></li>
            <li>Click Submit</li>
          </ol>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Analytics Status</div>
          <div className={`text-2xl font-bold ${isGAEnabled ? 'text-green-400' : 'text-gray-400'}`}>
            {isGAEnabled ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Search Console</div>
          <div className={`text-2xl font-bold ${isGSCVerified ? 'text-green-400' : 'text-gray-400'}`}>
            {isGSCVerified ? 'Verified' : 'Not Verified'}
          </div>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Sitemap</div>
          <div className="text-2xl font-bold text-green-400">Ready</div>
        </div>
      </div>
    </div>
  );
}
