import { useState, useEffect } from 'react';
import { DollarSign, Check, Copy, ExternalLink, AlertCircle, Key, Bitcoin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentConfig {
  cash_app_tag: string;
  cash_app_note: string;
  cash_app_active: boolean;
  bitcoin_address: string;
  bitcoin_network: string;
  bitcoin_active: boolean;
  venmo_username: string;
  venmo_active: boolean;
  zelle_email: string;
  zelle_active: boolean;
  paypal_email: string;
  paypal_active: boolean;
}

export default function RealTimePaymentConfig() {
  const [config, setConfig] = useState<PaymentConfig>({
    cash_app_tag: '',
    cash_app_note: '',
    cash_app_active: false,
    bitcoin_address: '',
    bitcoin_network: 'mainnet',
    bitcoin_active: false,
    venmo_username: '',
    venmo_active: false,
    zelle_email: '',
    zelle_active: false,
    paypal_email: '',
    paypal_active: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateway_config')
        .select('*')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await createDefaultConfig();
        } else {
          throw error;
        }
      } else {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateway_config')
        .insert([{
          cash_app_tag: '$starstreem1',
          cash_app_note: 'Payment for IPTV Service',
          cash_app_active: true,
          bitcoin_address: '',
          bitcoin_network: 'mainnet',
          bitcoin_active: false,
          venmo_username: '@starevan11',
          venmo_active: true,
          zelle_email: 'reloadedfiretvteam@gmail.com',
          zelle_active: true,
          paypal_email: 'reloadedfiretvteam@gmail.com',
          paypal_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (error) {
      console.error('Error creating config:', error);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payment_gateway_config')
        .upsert([config]);

      if (error) throw error;
      alert('Payment configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateCashAppLink = () => {
    const tag = config.cash_app_tag.replace('$', '');
    return `https://cash.app/$${tag}`;
  };

  const generateBitcoinLink = () => {
    return `bitcoin:${config.bitcoin_address}`;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Real-Time Payment Configuration</h1>
        <p className="text-gray-400">Configure payment methods that customers see on your website</p>
      </div>

      <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">⚡ Real-Time Integration</h3>
            <p className="text-gray-300 mb-3">
              All changes here are INSTANTLY reflected on your live website. No coding required!
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Toggle payment methods on/off in real-time</li>
              <li>✓ Update addresses and emails instantly</li>
              <li>✓ Generate payment links automatically</li>
              <li>✓ Copy integration codes with one click</li>
            </ul>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading configuration...</p>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Cash App</h2>
                  <p className="text-sm text-gray-400">Instant mobile payments</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.cash_app_active}
                  onChange={(e) => setConfig({ ...config, cash_app_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Cash App Tag ($username)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.cash_app_tag}
                    onChange={(e) => setConfig({ ...config, cash_app_tag: e.target.value })}
                    placeholder="$starevan11"
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(config.cash_app_tag, 'cash_app')}
                    className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    {copiedField === 'cash_app' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Payment Note (Optional)
                </label>
                <input
                  type="text"
                  value={config.cash_app_note}
                  onChange={(e) => setConfig({ ...config, cash_app_note: e.target.value })}
                  placeholder="IPTV Service Payment"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">Payment Link:</span>
                  <button
                    onClick={() => copyToClipboard(generateCashAppLink(), 'cash_app_link')}
                    className="text-orange-400 hover:text-orange-300 transition text-sm flex items-center gap-1"
                  >
                    {copiedField === 'cash_app_link' ? 'Copied!' : 'Copy Link'}
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <a
                  href={generateCashAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm break-all flex items-center gap-2"
                >
                  {generateCashAppLink()}
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Bitcoin className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bitcoin</h2>
                  <p className="text-sm text-gray-400">Cryptocurrency payments</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bitcoin_active}
                  onChange={(e) => setConfig({ ...config, bitcoin_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Bitcoin Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={config.bitcoin_address}
                    onChange={(e) => setConfig({ ...config, bitcoin_address: e.target.value })}
                    placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                    className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(config.bitcoin_address, 'bitcoin')}
                    className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    {copiedField === 'bitcoin' ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Network
                </label>
                <select
                  value={config.bitcoin_network}
                  onChange={(e) => setConfig({ ...config, bitcoin_network: e.target.value })}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  <option value="mainnet">Bitcoin Mainnet</option>
                  <option value="lightning">Lightning Network</option>
                  <option value="testnet">Testnet (Testing)</option>
                </select>
              </div>

              {config.bitcoin_address && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">Bitcoin URI:</span>
                    <button
                      onClick={() => copyToClipboard(generateBitcoinLink(), 'bitcoin_uri')}
                      className="text-orange-400 hover:text-orange-300 transition text-sm flex items-center gap-1"
                    >
                      {copiedField === 'bitcoin_uri' ? 'Copied!' : 'Copy URI'}
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-blue-400 text-sm font-mono break-all">
                    {generateBitcoinLink()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Venmo</h3>
                  <p className="text-xs text-gray-400">@username</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.venmo_active}
                    onChange={(e) => setConfig({ ...config, venmo_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              <input
                type="text"
                value={config.venmo_username}
                onChange={(e) => setConfig({ ...config, venmo_username: e.target.value })}
                placeholder="@starevan11"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Zelle</h3>
                  <p className="text-xs text-gray-400">Email or phone</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.zelle_active}
                    onChange={(e) => setConfig({ ...config, zelle_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>
              <input
                type="email"
                value={config.zelle_email}
                onChange={(e) => setConfig({ ...config, zelle_email: e.target.value })}
                placeholder="email@example.com"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
              />
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">PayPal</h3>
                  <p className="text-xs text-gray-400">Email address</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.paypal_active}
                    onChange={(e) => setConfig({ ...config, paypal_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <input
                type="email"
                value={config.paypal_email}
                onChange={(e) => setConfig({ ...config, paypal_email: e.target.value })}
                placeholder="paypal@example.com"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 flex items-center justify-center gap-3"
            >
              <Key className="w-6 h-6" />
              {saving ? 'Saving...' : 'Save Configuration (Updates Live Site Instantly)'}
            </button>
          </div>

          <div className="bg-blue-500/20 border-2 border-blue-500 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">🚀 How This Works</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>✓ <strong>Real-Time Updates:</strong> Changes save instantly to your live website</p>
              <p>✓ <strong>No Coding:</strong> Just enter your payment details and toggle on/off</p>
              <p>✓ <strong>Automatic Display:</strong> Active payment methods show on checkout automatically</p>
              <p>✓ <strong>Copy Links:</strong> One-click copy for sharing with customers</p>
              <p>✓ <strong>Secure:</strong> All payment info stored securely in your database</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
