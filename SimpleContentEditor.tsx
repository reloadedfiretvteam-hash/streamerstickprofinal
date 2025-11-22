import { useState, useEffect } from 'react';
import { Save, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SimpleContentEditor({ aiMode }: { aiMode: boolean }) {
  const [settings, setSettings] = useState({
    hero_title: 'Stream Unlimited Entertainment',
    hero_subtitle: 'Premium IPTV Service',
    about_text: 'Your trusted IPTV provider',
    features_title: 'Why Choose Us',
    cta_text: 'Get Started Today'
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .in('category', ['content', 'general']);

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
      await supabase
        .from('site_settings')
        .upsert({ setting_key: key, setting_value: value, category: 'content' }, { onConflict: 'setting_key' });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Text Content</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
            saved
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save Content'}
        </button>
      </div>

      {aiMode && (
        <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 font-semibold">
            💡 AI Tip: Use action words and clear value propositions. Make it easy for customers to understand benefits.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-bold text-white">Homepage Hero Section</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Main Headline</label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-xl font-bold focus:border-orange-500 focus:outline-none"
                placeholder="Your main headline..."
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Subheadline</label>
              <input
                type="text"
                value={settings.hero_subtitle}
                onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-orange-500 focus:outline-none"
                placeholder="Supporting text..."
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">About Section</h3>
          <div>
            <label className="block text-white font-semibold mb-2">About Text</label>
            <textarea
              value={settings.about_text}
              onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
              placeholder="Tell customers about your business..."
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Features Section</h3>
          <div>
            <label className="block text-white font-semibold mb-2">Section Title</label>
            <input
              type="text"
              value={settings.features_title}
              onChange={(e) => setSettings({ ...settings, features_title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-bold focus:border-orange-500 focus:outline-none"
              placeholder="Features headline..."
            />
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Call to Action</h3>
          <div>
            <label className="block text-white font-semibold mb-2">Button Text</label>
            <input
              type="text"
              value={settings.cta_text}
              onChange={(e) => setSettings({ ...settings, cta_text: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-bold focus:border-orange-500 focus:outline-none"
              placeholder="Call to action..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
