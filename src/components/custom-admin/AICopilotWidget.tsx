import { useState, useEffect } from 'react';
import {
  Bot,
  X,
  Sparkles,
  Send,
  Maximize2,
  Minimize2,
  TrendingUp,
  FileText,
  Image,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AICopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'suggestions'>('suggestions');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSuggestions();
    const interval = setInterval(loadSuggestions, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadSuggestions = async () => {
    const { data } = await supabase
      .from('ai_copilot_suggestions')
      .select('*')
      .eq('is_applied', false)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setSuggestions(data);
  };

  const applySuggestion = async (suggestionId: string) => {
    await supabase
      .from('ai_copilot_suggestions')
      .update({ is_applied: true, applied_at: new Date().toISOString() })
      .eq('id', suggestionId);

    loadSuggestions();
  };

  const dismissSuggestion = async (suggestionId: string) => {
    await supabase
      .from('ai_copilot_suggestions')
      .delete()
      .eq('id', suggestionId);

    loadSuggestions();
  };

  const generateSuggestions = async () => {
    setLoading(true);

    // Generate AI suggestions based on current content
    const newSuggestions = [
      {
        suggestion_type: 'seo',
        target_element: 'homepage',
        suggestion_title: 'Improve Meta Description',
        suggestion_description: 'Your homepage meta description is only 80 characters. Aim for 150-160 characters to maximize SERP visibility.',
        priority: 'high',
        suggestion_data: {
          current: 'Stream unlimited IPTV channels',
          suggested: 'Stream unlimited IPTV channels with 4K quality. Get access to 10,000+ live channels, movies, and sports. No buffering, instant activation, and 24/7 support.'
        }
      },
      {
        suggestion_type: 'content',
        target_element: 'pricing',
        suggestion_title: 'Add Urgency to Pricing',
        suggestion_description: 'Adding limited-time offers can increase conversions by 30%. Consider adding countdown timers.',
        priority: 'high',
        suggestion_data: {
          action: 'Add "Limited Time: 50% OFF" banner to pricing section'
        }
      },
      {
        suggestion_type: 'design',
        target_element: 'hero',
        suggestion_title: 'Optimize Hero Image',
        suggestion_description: 'Your hero image is 2.4MB. Compress it to under 500KB to improve page load speed.',
        priority: 'medium',
        suggestion_data: {
          currentSize: '2.4MB',
          targetSize: '< 500KB',
          expectedImprovement: '1.2s faster load time'
        }
      },
      {
        suggestion_type: 'marketing',
        target_element: 'products',
        suggestion_title: 'Bundle Products Strategy',
        suggestion_description: 'Create a bundle offer combining your top 3 products. This can increase average order value by 40%.',
        priority: 'medium',
        suggestion_data: {
          suggestedBundle: ['3-Month Plan', 'Fire Stick', 'Premium Support'],
          expectedRevenue: '+$2,400/month'
        }
      },
      {
        suggestion_type: 'seo',
        target_element: 'blog',
        suggestion_title: 'Add Schema Markup to Blog Posts',
        suggestion_description: 'Implement Article schema markup to improve rich snippet appearance in search results.',
        priority: 'medium',
        suggestion_data: {
          schemaType: 'Article',
          expectedBenefit: 'Better SERP visibility and click-through rate'
        }
      }
    ];

    for (const suggestion of newSuggestions) {
      await supabase
        .from('ai_copilot_suggestions')
        .insert([suggestion]);
    }

    setLoading(false);
    loadSuggestions();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'seo': return TrendingUp;
      case 'content': return FileText;
      case 'design': return Image;
      case 'marketing': return DollarSign;
      default: return Sparkles;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 animate-pulse"
      >
        <Bot className="w-8 h-8 text-white" />
        {suggestions.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {suggestions.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 z-50 transition-all ${
        isExpanded ? 'w-[600px] h-[700px]' : 'w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-white" />
          <div>
            <h3 className="text-white font-bold">AI Copilot</h3>
            <p className="text-xs text-white/80">Your intelligent assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-white" /> : <Maximize2 className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('suggestions')}
          className={`flex-1 py-3 font-semibold transition ${
            activeTab === 'suggestions'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Suggestions ({suggestions.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 font-semibold transition ${
            activeTab === 'chat'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Chat
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 180px)' }}>
        {activeTab === 'suggestions' ? (
          <div className="space-y-3">
            {suggestions.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No active suggestions</p>
                <button
                  onClick={generateSuggestions}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Suggestions'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-400">
                    AI-powered recommendations for your site
                  </p>
                  <button
                    onClick={generateSuggestions}
                    disabled={loading}
                    className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition disabled:opacity-50"
                  >
                    Refresh
                  </button>
                </div>

                {suggestions.map(suggestion => {
                  const Icon = getTypeIcon(suggestion.suggestion_type);
                  return (
                    <div
                      key={suggestion.id}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700 hover:border-purple-500 transition"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold text-sm">
                              {suggestion.suggestion_title}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                              {suggestion.priority}
                            </span>
                          </div>
                          <p className="text-gray-400 text-xs mb-2">
                            {suggestion.suggestion_description}
                          </p>
                          <span className="text-xs text-gray-500">
                            {suggestion.suggestion_type.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {suggestion.suggestion_data && (
                        <div className="bg-gray-800 rounded p-2 mb-3 text-xs text-gray-300">
                          <pre className="whitespace-pre-wrap">
                            {JSON.stringify(suggestion.suggestion_data, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => applySuggestion(suggestion.id)}
                          className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Apply
                        </button>
                        <button
                          onClick={() => dismissSuggestion(suggestion.id)}
                          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start gap-3">
                <Bot className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm mb-2">
                    Hello! I'm your AI assistant. I can help you with:
                  </p>
                  <ul className="text-gray-400 text-xs space-y-1">
                    <li>• SEO optimization suggestions</li>
                    <li>• Content improvement ideas</li>
                    <li>• Design and layout recommendations</li>
                    <li>• Marketing strategies</li>
                    <li>• Performance optimizations</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chat feature coming soon!</p>
              <p className="text-xs mt-1">Use suggestions tab for AI recommendations</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {activeTab === 'chat' && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
            <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
