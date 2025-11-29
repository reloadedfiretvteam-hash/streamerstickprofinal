import { useState, useEffect } from 'react';
import { Save, CreditCard, DollarSign, Banknote, Bitcoin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SimplePaymentSettings() {
  const [settings, setSettings] = useState({
    stripe_publishable_key: '',
    stripe_secret_key: '',
    cashapp_tag: '$starstreem1',
    wise_email: 'reloadedfiretvteam@gmail.com',
    bitcoin_address: 'bc1q448jm49ypzwsrrk75c974uqla28k0kmnx6w95r'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .in('setting_key', ['stripe_publishable_key', 'stripe_secret_key', 'cashapp_tag', 'wise_email', 'bitcoin_address']);

    if (data) {
      const settingsObj: any = {};
      data.forEach(item => {
        settingsObj[item.setting_key] = item.setting_value;
      });
      setSettings(prev => ({ ...prev, ...settingsObj }));
    }
  };

  const handleSave = async () => {
    for (const [key, value] of Object.entries(settings)) {
      // Use upsert to create if doesn't exist, update if exists
      await supabase
        .from('site_settings')
        .upsert(
          { setting_key: key, setting_value: value },
          { onConflict: 'setting_key' }
        );
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Payment Settings</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
            saved
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Stripe (Credit Cards)</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Publishable Key</label>
              <input
                type="text"
                value={settings.stripe_publishable_key}
                onChange={(e) => setSettings({ ...settings, stripe_publishable_key: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="pk_test_..."
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">Secret Key</label>
              <input
                type="password"
                value={settings.stripe_secret_key}
                onChange={(e) => setSettings({ ...settings, stripe_secret_key: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
                placeholder="sk_test_..."
              />
            </div>
            <p className="text-sm text-gray-400">
              Get your keys from <a href="https://dashboard.stripe.com/apikeys" target="_blank" className="text-blue-400 hover:underline">Stripe Dashboard</a>
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Cash App</h3>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Your Cash App Tag</label>
            <input
              type="text"
              value={settings.cashapp_tag}
              onChange={(e) => setSettings({ ...settings, cashapp_tag: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-bold focus:border-green-500 focus:outline-none"
              placeholder="$YourCashTag"
            />
            <p className="text-sm text-gray-400 mt-2">
              Customers will see: "Send payment to {settings.cashapp_tag}"
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Banknote className="w-8 h-8 text-purple-400" />
            <h3 className="text-2xl font-bold text-white">Wise Transfer</h3>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Your Wise Email</label>
            <input
              type="email"
              value={settings.wise_email}
              onChange={(e) => setSettings({ ...settings, wise_email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-purple-500 focus:outline-none"
              placeholder="your@email.com"
            />
            <p className="text-sm text-gray-400 mt-2">
              Customers will send transfers to this email
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bitcoin className="w-8 h-8 text-yellow-400" />
            <h3 className="text-2xl font-bold text-white">Bitcoin</h3>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Your Bitcoin Address</label>
            <input
              type="text"
              value={settings.bitcoin_address}
              onChange={(e) => setSettings({ ...settings, bitcoin_address: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500 focus:outline-none font-mono text-sm"
              placeholder="bc1q..."
            />
            <p className="text-sm text-gray-400 mt-2">
              Your BTC wallet address for receiving payments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
