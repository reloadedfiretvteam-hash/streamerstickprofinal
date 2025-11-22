import { useState, useEffect } from 'react';
import { Save, Search, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SimpleSEOManager({ aiMode }: { aiMode: boolean }) {
  const [settings, setSettings] = useState({
    site_meta_title: '',
    site_meta_description: '',
    site_meta_keywords: ''
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('category', 'seo');

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
        .update({ setting_value: value })
        .eq('setting_key', key);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const titleLength = settings.site_meta_title.length;
  const descLength = settings.site_meta_description.length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">SEO Settings</h2>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition ${
            saved
              ? 'bg-green-500'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          <Save className="w-5 h-5" />
          {saved ? 'Saved!' : 'Save SEO'}
        </button>
      </div>

      {aiMode && (
        <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 font-semibold mb-2">
            💡 AI SEO Tips:
          </p>
          <ul className="text-yellow-400 text-sm space-y-1">
            <li>• Title: 50-60 characters for best results</li>
            <li>• Description: 150-160 characters ideal</li>
            <li>• Use your main keywords naturally</li>
            <li>• Make it compelling to click</li>
          </ul>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Page Title (SEO)</h3>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Meta Title
              <span className={`ml-3 text-sm ${
                titleLength > 60 ? 'text-red-400' :
                titleLength > 50 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {titleLength}/60 characters
              </span>
            </label>
            <input
              type="text"
              value={settings.site_meta_title}
              onChange={(e) => setSettings({ ...settings, site_meta_title: e.target.value })}
              maxLength={60}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:border-blue-500 focus:outline-none"
              placeholder="Your Site Name | What You Do"
            />
            <p className="text-sm text-gray-400 mt-2">
              This appears in Google search results and browser tabs
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Meta Description</h3>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">
              Description
              <span className={`ml-3 text-sm ${
                descLength > 160 ? 'text-red-400' :
                descLength > 150 ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {descLength}/160 characters
              </span>
            </label>
            <textarea
              value={settings.site_meta_description}
              onChange={(e) => setSettings({ ...settings, site_meta_description: e.target.value })}
              maxLength={160}
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-green-500 focus:outline-none"
              placeholder="A compelling description of your service that makes people want to click..."
            />
            <p className="text-sm text-gray-400 mt-2">
              This appears under your title in Google search results
            </p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Keywords</h3>

          <div>
            <label className="block text-white font-semibold mb-2">Meta Keywords</label>
            <input
              type="text"
              value={settings.site_meta_keywords}
              onChange={(e) => setSettings({ ...settings, site_meta_keywords: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              placeholder="iptv, streaming, firestick, android tv"
            />
            <p className="text-sm text-gray-400 mt-2">
              Separate keywords with commas
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-500 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-3">SEO Preview</h3>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-blue-400 text-sm mb-1">https://yoursite.com</div>
            <div className="text-purple-400 text-xl font-semibold mb-2">
              {settings.site_meta_title || 'Your Page Title'}
            </div>
            <div className="text-gray-300 text-sm">
              {settings.site_meta_description || 'Your meta description will appear here...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
