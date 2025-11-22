import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bitcoin, Key, Save, RefreshCw, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

interface PaymentGateway {
  id: string;
  gateway_name: string;
  api_key: string;
  is_enabled: boolean;
  config: {
    api_url: string;
    currency: string;
    payment_description: string;
    invoice_expires_minutes: number;
    min_amount_usd: number;
    instruction_text: string;
  };
}

export default function NOWPaymentsManager() {
  const [gateway, setGateway] = useState<PaymentGateway | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState('');
  const [btcPrice, setBtcPrice] = useState<number | null>(null);

  useEffect(() => {
    loadGateway();
    fetchBtcPrice();
  }, []);

  const loadGateway = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('gateway_name', 'nowpayments')
      .maybeSingle();

    if (data) {
      setGateway(data);
    }
    setLoading(false);
  };

  const fetchBtcPrice = async () => {
    try {
      const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
      const data = await response.json();
      if (data?.data?.rates?.USD) {
        setBtcPrice(parseFloat(data.data.rates.USD));
      }
    } catch (error) {
      console.error('Error fetching BTC price:', error);
    }
  };

  const handleSave = async () => {
    if (!gateway) return;

    setSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('payment_gateways')
      .update({
        api_key: gateway.api_key,
        is_enabled: gateway.is_enabled,
        config: gateway.config,
        updated_at: new Date().toISOString()
      })
      .eq('gateway_name', 'nowpayments');

    if (error) {
      setMessage('❌ Error saving configuration. Please try again.');
      console.error(error);
    } else {
      setMessage('✅ NOWPayments configuration saved successfully!');
    }

    setSaving(false);
  };

  const testConnection = async () => {
    if (!gateway?.api_key) {
      setMessage('❌ Please enter an API key first.');
      return;
    }

    setTesting(true);
    setMessage('Testing connection to NOWPayments...');

    try {
      const response = await fetch('https://api.nowpayments.io/v1/status', {
        headers: {
          'x-api-key': gateway.api_key
        }
      });

      if (response.ok) {
        setMessage('✅ Connection successful! NOWPayments API is working.');
      } else {
        setMessage('❌ Connection failed. Please check your API key.');
      }
    } catch (error) {
      setMessage('❌ Connection failed. Please check your API key and network.');
    }

    setTesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!gateway) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Gateway configuration not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Bitcoin className="w-10 h-10" />
          <div>
            <h2 className="text-2xl font-bold">NOWPayments Bitcoin Integration</h2>
            <p className="text-sm opacity-90">Accept Bitcoin payments with credit/debit card support</p>
          </div>
        </div>
      </div>

      {/* Current BTC Price */}
      {btcPrice && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Current Bitcoin Price</p>
              <p className="text-3xl font-bold">${btcPrice.toLocaleString()}</p>
            </div>
            <Bitcoin className="w-12 h-12 opacity-50" />
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Setup Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Sign up for a <a href="https://account.nowpayments.io/create-account" target="_blank" rel="noopener noreferrer" className="underline font-semibold">NOWPayments merchant account</a></li>
              <li>Add your Bitcoin wallet address as the payout wallet in NOWPayments dashboard</li>
              <li>Generate an API key from your NOWPayments dashboard</li>
              <li>Paste the API key below and click "Save Configuration"</li>
              <li>Enable Bitcoin payments using the toggle switch</li>
              <li>Test the connection to verify everything works</li>
            </ol>
          </div>
        </div>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Key className="w-6 h-6 text-orange-500" />
          API Configuration
        </h3>

        <div className="space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              NOWPayments API Key *
            </label>
            <input
              type="password"
              value={gateway.api_key || ''}
              onChange={(e) => setGateway({ ...gateway, api_key: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="Enter your NOWPayments API key"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from <a href="https://account.nowpayments.io/settings/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">NOWPayments Dashboard</a>
            </p>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Enable Bitcoin Payments</p>
              <p className="text-sm text-gray-600">Allow customers to pay with Bitcoin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={gateway.is_enabled}
                onChange={(e) => setGateway({ ...gateway, is_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Test Connection Button */}
          <button
            onClick={testConnection}
            disabled={testing || !gateway.api_key}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Testing Connection...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Test Connection
              </>
            )}
          </button>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-500" />
          Payment Settings
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Min Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Minimum Payment Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={gateway.config.min_amount_usd}
                onChange={(e) => setGateway({
                  ...gateway,
                  config: { ...gateway.config, min_amount_usd: parseFloat(e.target.value) }
                })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>

            {/* Invoice Expiration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Invoice Expires After (minutes)
              </label>
              <input
                type="number"
                value={gateway.config.invoice_expires_minutes}
                onChange={(e) => setGateway({
                  ...gateway,
                  config: { ...gateway.config, invoice_expires_minutes: parseInt(e.target.value) }
                })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              />
            </div>
          </div>

          {/* Payment Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Description
            </label>
            <input
              type="text"
              value={gateway.config.payment_description}
              onChange={(e) => setGateway({
                ...gateway,
                config: { ...gateway.config, payment_description: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              placeholder="Stream Stick Pro Order"
            />
          </div>

          {/* Customer Instructions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Customer Instruction Text
            </label>
            <textarea
              value={gateway.config.instruction_text}
              onChange={(e) => setGateway({
                ...gateway,
                config: { ...gateway.config, instruction_text: e.target.value }
              })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
              rows={3}
              placeholder="Complete your purchase with Bitcoin"
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`rounded-xl p-4 ${
          message.includes('✅')
            ? 'bg-green-50 border-2 border-green-300 text-green-800'
            : 'bg-red-50 border-2 border-red-300 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Save Button */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">Ready to Save?</h3>
            <p className="text-sm text-gray-600">Bitcoin payments will be available on checkout</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>

      {/* What Happens Next */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6">
        <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          What Happens After Setup?
        </h3>
        <ul className="space-y-2 text-sm text-gray-800">
          <li>✅ <strong>Bitcoin option appears</strong> on your checkout page</li>
          <li>✅ <strong>Real-time BTC prices</strong> calculated automatically</li>
          <li>✅ <strong>Unique order codes</strong> generated for each transaction</li>
          <li>✅ <strong>Email notifications</strong> sent to customer and admin</li>
          <li>✅ <strong>Payment tracking</strong> available in Bitcoin Orders dashboard</li>
          <li>✅ <strong>Card payments accepted</strong> via NOWPayments for easy Bitcoin purchase</li>
        </ul>
      </div>
    </div>
  );
}
