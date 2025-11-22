import { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Bitcoin, Save, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentGateway {
  id: string;
  gateway_name: string;
  display_name: string;
  is_active: boolean;
  config: any;
  test_mode: boolean;
  sort_order: number;
}

export default function PaymentGatewayManager() {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGateway, setEditingGateway] = useState<string | null>(null);
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    const { data } = await supabase
      .from('payment_gateways')
      .select('*')
      .order('sort_order');

    if (data) setGateways(data);
    setLoading(false);
  };

  const toggleActive = async (gateway: PaymentGateway) => {
    const { error } = await supabase
      .from('payment_gateways')
      .update({ is_active: !gateway.is_active })
      .eq('id', gateway.id);

    if (!error) {
      loadGateways();
      alert(`${gateway.display_name} ${!gateway.is_active ? 'activated' : 'deactivated'}!`);
    }
  };

  const startEdit = (gateway: PaymentGateway) => {
    setEditingGateway(gateway.id);
    setConfig(gateway.config);
  };

  const saveConfig = async (gatewayId: string) => {
    const { error } = await supabase
      .from('payment_gateways')
      .update({
        config: config,
        updated_at: new Date().toISOString()
      })
      .eq('id', gatewayId);

    if (!error) {
      setEditingGateway(null);
      loadGateways();
      alert('Payment gateway updated successfully!');
    }
  };

  const toggleTestMode = async (gateway: PaymentGateway) => {
    await supabase
      .from('payment_gateways')
      .update({ test_mode: !gateway.test_mode })
      .eq('id', gateway.id);

    loadGateways();
  };

  const renderCashAppConfig = (_gateway: PaymentGateway) => {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to Setup Cash App Payments
          </h4>
          <ol className="text-sm text-blue-100 space-y-2 list-decimal list-inside">
            <li>Open your Cash App mobile app</li>
            <li>Tap your profile icon</li>
            <li>Find your $Cashtag (e.g., $YourUsername)</li>
            <li>Enter it below</li>
            <li>Customers will send payments to this $Cashtag</li>
          </ol>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Your $Cashtag *</label>
          <input
            type="text"
            value={config.cashtag || ''}
            onChange={(e) => setConfig({ ...config, cashtag: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
            placeholder="$YourCashTag"
          />
          <p className="text-sm text-gray-400 mt-1">Example: $JohnDoe123</p>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Payment Note Template</label>
          <input
            type="text"
            value={config.note || ''}
            onChange={(e) => setConfig({ ...config, note: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="Order #{{order_number}}"
          />
          <p className="text-sm text-gray-400 mt-1">Use {'{{order_number}}'} for dynamic order number</p>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Customer Instructions</label>
          <textarea
            value={config.instructions || ''}
            onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="Instructions for customers..."
          />
        </div>

        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
          <p className="text-green-100 text-sm">
            <strong>✓ One-Click Integration:</strong> Once you save, Cash App will appear on your checkout page automatically!
          </p>
        </div>
      </div>
    );
  };

  const renderBitcoinConfig = (_gateway: PaymentGateway) => {
    return (
      <div className="space-y-4">
        <div className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-4">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            How to Setup Bitcoin Payments
          </h4>
          <ol className="text-sm text-orange-100 space-y-2 list-decimal list-inside">
            <li>Create a Bitcoin wallet (Coinbase, Blockchain.com, etc.)</li>
            <li>Get your Bitcoin wallet address</li>
            <li>Enter it below</li>
            <li>Customers will send BTC to this address</li>
            <li>System generates unique QR codes for each order</li>
          </ol>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Your Bitcoin Wallet Address *</label>
          <input
            type="text"
            value={config.wallet_address || ''}
            onChange={(e) => setConfig({ ...config, wallet_address: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-orange-500 focus:outline-none"
            placeholder="bc1q..."
          />
          <p className="text-sm text-gray-400 mt-1">Your main Bitcoin receiving address</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-semibold mb-2">Required Confirmations</label>
            <select
              value={config.confirmation_blocks || 3}
              onChange={(e) => setConfig({ ...config, confirmation_blocks: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="1">1 confirmation (Fast)</option>
              <option value="3">3 confirmations (Recommended)</option>
              <option value="6">6 confirmations (Most Secure)</option>
            </select>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Payment Window (minutes)</label>
            <select
              value={config.payment_window_minutes || 30}
              onChange={(e) => setConfig({ ...config, payment_window_minutes: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white font-semibold mb-2">Customer Instructions</label>
          <textarea
            value={config.instructions || ''}
            onChange={(e) => setConfig({ ...config, instructions: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            placeholder="Instructions for Bitcoin payments..."
          />
        </div>

        <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
          <p className="text-green-100 text-sm">
            <strong>✓ Auto QR Codes:</strong> System automatically generates QR codes for easy Bitcoin payments!
          </p>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-white">Loading payment gateways...</div>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Payment Gateway Manager</h2>
        <p className="text-gray-400">Setup Cash App, Bitcoin, and other payment methods with one click</p>
      </div>

      <div className="grid gap-6">
        {gateways.map((gateway) => {
          const isEditing = editingGateway === gateway.id;
          const Icon = gateway.gateway_name === 'cashapp' ? DollarSign :
                      gateway.gateway_name === 'bitcoin' ? Bitcoin :
                      CreditCard;

          return (
            <div
              key={gateway.id}
              className={`bg-gray-900 rounded-xl overflow-hidden border-2 ${
                isEditing ? 'border-orange-500' : gateway.is_active ? 'border-green-500' : 'border-gray-700'
              }`}
            >
              <div className={`p-6 ${
                gateway.is_active ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20' : 'bg-gray-850'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      gateway.gateway_name === 'cashapp' ? 'bg-green-500' :
                      gateway.gateway_name === 'bitcoin' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{gateway.display_name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          gateway.is_active
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-600 text-gray-300'
                        }`}>
                          {gateway.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        {gateway.test_mode && (
                          <span className="px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                            TEST MODE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleTestMode(gateway)}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-yellow-900 rounded-lg font-semibold transition"
                      title="Toggle Test Mode"
                    >
                      {gateway.test_mode ? 'Go Live' : 'Test Mode'}
                    </button>
                    <button
                      onClick={() => toggleActive(gateway)}
                      className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                        gateway.is_active
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {gateway.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      {gateway.is_active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>

                {!isEditing && !gateway.is_active && (
                  <button
                    onClick={() => startEdit(gateway)}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-lg font-bold text-white transition"
                  >
                    Click to Setup {gateway.display_name}
                  </button>
                )}

                {!isEditing && gateway.is_active && (
                  <button
                    onClick={() => startEdit(gateway)}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-bold text-white transition"
                  >
                    Edit Configuration
                  </button>
                )}
              </div>

              {isEditing && (
                <div className="p-6 border-t-2 border-gray-700">
                  {gateway.gateway_name === 'cashapp' && renderCashAppConfig(gateway)}
                  {gateway.gateway_name === 'bitcoin' && renderBitcoinConfig(gateway)}

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => saveConfig(gateway.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition"
                    >
                      <Save className="w-6 h-6" />
                      Save & Activate
                    </button>
                    <button
                      onClick={() => setEditingGateway(null)}
                      className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!isEditing && gateway.is_active && (
                <div className="p-4 bg-gray-850 border-t-2 border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Integrated on checkout page</span>
                    <span className="text-green-400 font-semibold">✓ Ready to accept payments</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-500/20 border border-blue-400/30 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-3">💡 Quick Start Guide</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-100">
          <div>
            <h4 className="font-semibold mb-2">Cash App Setup (30 seconds):</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Click to Setup Cash App"</li>
              <li>Enter your $Cashtag</li>
              <li>Click "Save & Activate"</li>
              <li>Done! Cash App now appears at checkout</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Bitcoin Setup (1 minute):</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Click to Setup Bitcoin"</li>
              <li>Enter your BTC wallet address</li>
              <li>Configure payment window</li>
              <li>Click "Save & Activate"</li>
              <li>Done! Bitcoin payments enabled</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
