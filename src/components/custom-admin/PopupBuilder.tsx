import { useState } from 'react';
import {
  Maximize2,
  Plus,
  Eye,
  Copy,
  Trash2,
  Edit,
  Target,
  MousePointer,
  X,
  Save,
  BarChart3
} from 'lucide-react';

export default function PopupBuilder() {
  const [popups, _setPopups] = useState([
    {
      id: '1',
      name: 'Exit Intent Offer',
      type: 'exit-intent',
      status: 'active',
      views: 2847,
      conversions: 342,
      conversionRate: 12
    },
    {
      id: '2',
      name: 'Newsletter Signup',
      type: 'time-delay',
      status: 'active',
      views: 4521,
      conversions: 891,
      conversionRate: 19.7
    },
    {
      id: '3',
      name: 'Limited Time Offer',
      type: 'scroll-trigger',
      status: 'active',
      views: 1834,
      conversions: 267,
      conversionRate: 14.6
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);

  const popupTemplates = [
    { name: 'Newsletter Subscribe', type: 'email-opt-in', conversions: 'High', color: 'blue' },
    { name: 'Special Discount', type: 'promo', conversions: 'Very High', color: 'green' },
    { name: 'Exit Intent', type: 'exit-intent', conversions: 'High', color: 'red' },
    { name: 'Video Popup', type: 'video', conversions: 'Medium', color: 'purple' },
    { name: 'Age Verification', type: 'verification', conversions: 'N/A', color: 'yellow' },
    { name: 'Cookie Consent', type: 'gdpr', conversions: 'N/A', color: 'gray' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Maximize2 className="w-8 h-8 text-purple-400" />
            Popup Builder
          </h2>
          <p className="text-gray-400 mt-1">Create targeted popups with exit intent, scroll triggers, and more</p>
        </div>
        <button
          onClick={() => setShowBuilder(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Popup
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Maximize2 className="w-8 h-8 text-purple-400" />
            <span className="text-3xl font-bold text-purple-400">8</span>
          </div>
          <p className="text-gray-300 font-semibold">Active Popups</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Eye className="w-8 h-8 text-blue-400" />
            <span className="text-3xl font-bold text-blue-400">9,202</span>
          </div>
          <p className="text-gray-300 font-semibold">Total Views (30d)</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <MousePointer className="w-8 h-8 text-green-400" />
            <span className="text-3xl font-bold text-green-400">1,500</span>
          </div>
          <p className="text-gray-300 font-semibold">Conversions</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-orange-400" />
            <span className="text-3xl font-bold text-orange-400">16.3%</span>
          </div>
          <p className="text-gray-300 font-semibold">Avg Conv. Rate</p>
        </div>
      </div>

      {/* Popups List */}
      <div className="bg-gray-800 rounded-xl overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold text-white">Your Popups</h3>
        </div>

        <div className="divide-y divide-gray-700">
          {popups.map(popup => (
            <div key={popup.id} className="p-6 hover:bg-gray-750 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg">{popup.name}</h4>
                    <p className="text-gray-400 text-sm capitalize">{popup.type.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    popup.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {popup.status}
                  </span>
                  <button className="p-2 hover:bg-gray-600 rounded-lg transition">
                    <Eye className="w-5 h-5 text-gray-300" />
                  </button>
                  <button
                    onClick={() => setShowBuilder(true)}
                    className="p-2 hover:bg-gray-600 rounded-lg transition"
                  >
                    <Edit className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-gray-600 rounded-lg transition">
                    <Copy className="w-5 h-5 text-gray-300" />
                  </button>
                  <button className="p-2 hover:bg-red-600 rounded-lg transition">
                    <Trash2 className="w-5 h-5 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{popup.views.toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Views</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{popup.conversions}</div>
                  <div className="text-sm text-gray-400">Conversions</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400">{popup.conversionRate}%</div>
                  <div className="text-sm text-gray-400">Conv. Rate</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-400">${(popup.conversions * 29).toLocaleString()}</div>
                  <div className="text-sm text-gray-400">Revenue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Templates */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Popup Templates</h3>
        <div className="grid grid-cols-3 gap-4">
          {popupTemplates.map((template, index) => (
            <div
              key={index}
              className="bg-gray-900 rounded-lg p-4 hover:bg-gray-750 transition cursor-pointer border border-gray-700 hover:border-purple-500"
            >
              <div className="flex items-center justify-between mb-3">
                <Maximize2 className="w-8 h-8 text-purple-400" />
                <span className={`text-xs px-2 py-1 rounded-full ${
                  template.conversions === 'Very High' ? 'bg-green-500/20 text-green-400' :
                  template.conversions === 'High' ? 'bg-blue-500/20 text-blue-400' :
                  template.conversions === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {template.conversions} Conv.
                </span>
              </div>
              <h4 className="text-white font-semibold mb-1">{template.name}</h4>
              <p className="text-gray-400 text-sm capitalize mb-3">{template.type.replace('-', ' ')}</p>
              <button className="text-sm text-purple-400 hover:text-purple-300 font-semibold">
                Use Template →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Popup Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl">
              {/* Builder Header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-2xl flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Popup Builder</h3>
                <button
                  onClick={() => setShowBuilder(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                {/* Trigger Settings */}
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-4">Trigger Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Popup Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="My Awesome Popup"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Trigger Type
                      </label>
                      <select className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600">
                        <option value="exit-intent">Exit Intent</option>
                        <option value="time-delay">Time Delay</option>
                        <option value="scroll-trigger">Scroll Trigger</option>
                        <option value="click-trigger">Click Trigger</option>
                        <option value="manual">Manual Trigger</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Delay (seconds)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        defaultValue={5}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Scroll Depth (%)
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        defaultValue={50}
                      />
                    </div>
                  </div>
                </div>

                {/* Targeting Rules */}
                <div className="mb-6 bg-gray-900 rounded-lg p-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    Targeting Rules
                  </h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Show on all pages</span>
                    </label>
                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Show to new visitors only</span>
                    </label>
                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Show to returning visitors only</span>
                    </label>
                    <label className="flex items-center gap-2 text-gray-300">
                      <input type="checkbox" className="w-4 h-4" />
                      <span>Hide for mobile devices</span>
                    </label>
                  </div>
                </div>

                {/* Popup Design Preview */}
                <div className="bg-white rounded-lg p-8 border-4 border-purple-500">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Get 50% OFF!</h3>
                    <p className="text-gray-600 mb-6">
                      Subscribe to our newsletter and get exclusive discounts!
                    </p>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-3"
                      placeholder="Enter your email"
                    />
                    <button className="w-full py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition">
                      Get My Discount
                    </button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      We respect your privacy. Unsubscribe anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-700 p-6 flex items-center justify-between">
                <button
                  onClick={() => setShowBuilder(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Preview
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Save & Publish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
