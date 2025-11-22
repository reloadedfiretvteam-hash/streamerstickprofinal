import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Globe,
  Search,
  ExternalLink,
  Copy,
  Download,
  TrendingUp,
  Clock,
  AlertTriangle,
  Check,
  X
} from 'lucide-react';

interface SEOSettings {
  id: string;
  google_search_console_verification: string;
  bing_verification_code: string;
  yahoo_verification_code: string;
  yandex_verification_code: string;
  baidu_verification_code: string;
  sitemap_url: string;
  site_url: string;
  site_name: string;
  auto_generate_sitemap: boolean;
  sitemap_last_generated: string;
}

interface SearchEngineSubmission {
  id: string;
  search_engine: string;
  verification_status: string;
  verification_code: string;
  sitemap_url: string;
  indexed_pages: number;
  crawl_errors: number;
  last_checked: string;
  submission_date: string;
  notes: string;
  submission_url?: string;
}

export default function SearchEngineManager() {
  const [settings, setSettings] = useState<SEOSettings | null>(null);
  const [submissions, setSubmissions] = useState<SearchEngineSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: seoData } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle();

      if (seoData) {
        setSettings(seoData);
      }

      const { data: submissionsData } = await supabase
        .from('search_engine_submissions')
        .select('*')
        .order('submission_date', { ascending: false });

      if (submissionsData) {
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('seo_settings')
        .update({
          google_search_console_verification: settings.google_search_console_verification,
          bing_verification_code: settings.bing_verification_code,
          yahoo_verification_code: settings.yahoo_verification_code,
          yandex_verification_code: settings.yandex_verification_code,
          baidu_verification_code: settings.baidu_verification_code,
          sitemap_url: settings.sitemap_url,
          auto_generate_sitemap: settings.auto_generate_sitemap
        })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      await loadData();
      setMessage('Search engine settings saved successfully!');
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('search_engine_submissions')
        .update({
          verification_status: status,
          last_checked: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      setMessage(`Status updated to: ${status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'failed': return 'text-red-400 bg-red-500/20';
      case 'not_submitted': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'failed': return <X className="w-5 h-5 text-red-400" />;
      case 'not_submitted': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  if (!settings) {
    return (
      <div className="bg-gray-800 rounded-xl p-8">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading search engine settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Globe className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Search Engine Manager</h2>
            <p className="text-gray-400">Bing, Yahoo, Google & More</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error')
            ? 'bg-red-500/20 border border-red-500 text-red-400'
            : 'bg-green-500/20 border border-green-500 text-green-400'
        }`}>
          <div className="flex items-center gap-2">
            {message.includes('Error') ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {message}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-gray-700">
        {['overview', 'verification', 'sitemap', 'instructions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold capitalize transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Search Engine Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-white">{submission.search_engine}</h4>
                    {getStatusIcon(submission.verification_status)}
                  </div>

                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getStatusColor(submission.verification_status)}`}>
                    {submission.verification_status.toUpperCase()}
                  </div>

                  <div className="space-y-2 text-sm">
                    {submission.verification_code && (
                      <div>
                        <span className="text-gray-400">Code:</span>
                        <span className="text-white ml-2 font-mono text-xs">
                          {submission.verification_code.substring(0, 12)}...
                        </span>
                      </div>
                    )}
                    {submission.indexed_pages > 0 && (
                      <div>
                        <span className="text-gray-400">Indexed:</span>
                        <span className="text-green-400 ml-2 font-bold">{submission.indexed_pages} pages</span>
                      </div>
                    )}
                    {submission.crawl_errors > 0 && (
                      <div>
                        <span className="text-gray-400">Errors:</span>
                        <span className="text-red-400 ml-2 font-bold">{submission.crawl_errors}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => updateSubmissionStatus(submission.id, 'verified')}
                      className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition"
                      title="Mark as Verified"
                    >
                      <Check className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => updateSubmissionStatus(submission.id, 'pending')}
                      className="flex-1 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition"
                      title="Mark as Pending"
                    >
                      <Clock className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.bing.com/webmasters/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
              >
                <Search className="w-6 h-6 text-blue-400" />
                <div className="flex-1">
                  <p className="font-bold text-white">Bing Webmaster Tools</p>
                  <p className="text-sm text-gray-400">Submit & verify your site</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>

              <a
                href={settings.sitemap_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
              >
                <Download className="w-6 h-6 text-green-400" />
                <div className="flex-1">
                  <p className="font-bold text-white">View Sitemap</p>
                  <p className="text-sm text-gray-400">Check your sitemap.xml</p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="grid gap-6">
            <div className="bg-gray-900 rounded-lg p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="text-xl font-bold text-white">Google Search Console</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Verification Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.google_search_console_verification}
                      onChange={(e) => setSettings({...settings, google_search_console_verification: e.target.value})}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                      placeholder="c8f0b74f53fde501"
                    />
                    <button
                      onClick={() => copyToClipboard(settings.google_search_console_verification, 'google')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      {copied === 'google' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    File location: /public/googlec8f0b74f53fde501.html
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Bing Webmaster Tools</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Verification Code (XML Format)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.bing_verification_code}
                      onChange={(e) => setSettings({...settings, bing_verification_code: e.target.value})}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                      placeholder="F672EB0BB38ACF36885E6E30A910DDDB"
                    />
                    <button
                      onClick={() => copyToClipboard(settings.bing_verification_code, 'bing')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      {copied === 'bing' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    File location: /public/BingSiteAuth.xml
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-6 border border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Yahoo Site Explorer</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
                  <p className="text-sm text-yellow-300">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Yahoo uses Bing for verification. Use the same code as Bing above.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Verification Code (Same as Bing)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.yahoo_verification_code}
                      onChange={(e) => setSettings({...settings, yahoo_verification_code: e.target.value})}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                      placeholder="F672EB0BB38ACF36885E6E30A910DDDB"
                    />
                    <button
                      onClick={() => copyToClipboard(settings.yahoo_verification_code, 'yahoo')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                    >
                      {copied === 'yahoo' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Verification Settings
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'sitemap' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-lg p-6 border border-green-500/30">
            <h3 className="text-xl font-bold text-white mb-4">Sitemap Configuration</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Sitemap URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.sitemap_url}
                    onChange={(e) => setSettings({...settings, sitemap_url: e.target.value})}
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                  <a
                    href={settings.sitemap_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  id="auto-sitemap"
                  checked={settings.auto_generate_sitemap}
                  onChange={(e) => setSettings({...settings, auto_generate_sitemap: e.target.checked})}
                  className="w-5 h-5"
                />
                <label htmlFor="auto-sitemap" className="text-white font-semibold">
                  Auto-generate sitemap on content updates
                </label>
              </div>

              {settings.sitemap_last_generated && (
                <div className="text-sm text-gray-400">
                  Last generated: {new Date(settings.sitemap_last_generated).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-2 border-green-500 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Submit Sitemap to Search Engines</h3>
            <div className="space-y-3">
              <a
                href={`https://www.google.com/webmasters/tools/sitemap-list?sitemap=${encodeURIComponent(settings.sitemap_url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
              >
                <span className="text-white font-semibold">Google Search Console</span>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="https://www.bing.com/webmasters/home"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
              >
                <span className="text-white font-semibold">Bing Webmaster Tools</span>
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold rounded-lg transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Sitemap Settings
          </button>
        </div>
      )}

      {activeTab === 'instructions' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white mb-4">Setup Instructions</h3>

            <div className="space-y-6">
              <div className="bg-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">1</span>
                  Bing Webmaster Tools Setup
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-8">
                  <li>Go to <a href="https://www.bing.com/webmasters/home" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Bing Webmaster Tools</a></li>
                  <li>Sign in with your Microsoft account</li>
                  <li>Click "Add Site" and enter: <code className="bg-gray-800 px-2 py-1 rounded text-green-400">{settings.site_url}</code></li>
                  <li>Choose "XML file" verification method</li>
                  <li>Your verification file is already created: <code className="bg-gray-800 px-2 py-1 rounded text-green-400">/public/BingSiteAuth.xml</code></li>
                  <li>Click "Verify" in Bing Webmaster Tools</li>
                  <li>Submit your sitemap: <code className="bg-gray-800 px-2 py-1 rounded text-green-400">{settings.sitemap_url}</code></li>
                </ol>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center">2</span>
                  Yahoo Site Explorer (Uses Bing)
                </h4>
                <p className="text-gray-300 mb-3">
                  Yahoo uses Bing for search. Once verified on Bing, you're automatically verified on Yahoo!
                </p>
                <div className="bg-yellow-500/20 border border-yellow-500 rounded p-4">
                  <p className="text-yellow-300 text-sm">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    No separate action needed. Bing verification covers Yahoo.
                  </p>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">3</span>
                  Verify Your Files
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-gray-800 px-4 py-2 rounded text-green-400">
                      {settings.site_url}/BingSiteAuth.xml
                    </code>
                    <a
                      href={`${settings.site_url}/BingSiteAuth.xml`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Test
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 bg-gray-800 px-4 py-2 rounded text-green-400">
                      {settings.sitemap_url}
                    </code>
                    <a
                      href={settings.sitemap_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                    >
                      Test
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                  <span className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center">4</span>
                  Post-Verification Steps
                </h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Submit your sitemap in Bing Webmaster Tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Check back in 24-48 hours for indexing status</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Monitor crawl errors and fix any issues</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Update this dashboard with verification status</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
