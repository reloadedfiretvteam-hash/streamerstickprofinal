import { useState, useEffect } from 'react';
import { Search, TrendingUp, Target, Code, BarChart3, CheckCircle, AlertCircle, Zap, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SEOConfig {
  id?: string;
  page_type: string;
  page_id?: string;
  focus_keyword: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  schema_markup: any;
  robots_meta: string;
  breadcrumbs: any;
  readability_score: number;
  keyword_density: number;
  internal_links: number;
  external_links: number;
  seo_score: number;
}

export default function RankMathProSEO() {
  const [configs, setConfigs] = useState<SEOConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<Partial<SEOConfig> | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced' | 'schema'>('basic');

  const emptyConfig: Partial<SEOConfig> = {
    page_type: 'page',
    focus_keyword: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: [],
    canonical_url: '',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    robots_meta: 'index, follow',
    readability_score: 0,
    keyword_density: 0,
    internal_links: 0,
    external_links: 0,
    seo_score: 0,
    schema_markup: {},
    breadcrumbs: []
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_configuration')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error loading SEO configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSEO = () => {
    if (!editingConfig) return;

    setAnalyzing(true);
    setTimeout(() => {
      let score = 0;

      // Title optimization (20 points)
      if (editingConfig.seo_title && editingConfig.seo_title.length >= 50 && editingConfig.seo_title.length <= 60) {
        score += 20;
      } else if (editingConfig.seo_title && editingConfig.seo_title.length > 0) {
        score += 10;
      }

      // Description optimization (20 points)
      if (editingConfig.seo_description && editingConfig.seo_description.length >= 150 && editingConfig.seo_description.length <= 160) {
        score += 20;
      } else if (editingConfig.seo_description && editingConfig.seo_description.length > 0) {
        score += 10;
      }

      // Focus keyword (15 points)
      if (editingConfig.focus_keyword) {
        score += 15;
        if (editingConfig.seo_title?.toLowerCase().includes(editingConfig.focus_keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Keywords (10 points)
      if (editingConfig.seo_keywords && editingConfig.seo_keywords.length >= 3) {
        score += 10;
      }

      // Social media (10 points)
      if (editingConfig.og_title && editingConfig.og_description && editingConfig.og_image) {
        score += 10;
      }

      // Canonical URL (5 points)
      if (editingConfig.canonical_url) {
        score += 5;
      }

      // Schema markup (10 points)
      if (editingConfig.schema_markup && Object.keys(editingConfig.schema_markup).length > 0) {
        score += 10;
      }

      // Calculate keyword density
      const titleWords = editingConfig.seo_title?.split(' ').length || 0;
      const focusKeyword = editingConfig.focus_keyword?.toLowerCase() || '';
      const titleLower = editingConfig.seo_title?.toLowerCase() || '';
      const keywordInTitle = focusKeyword && titleLower ? (titleLower.split(focusKeyword).length - 1 || 0) : 0;
      const density = titleWords > 0 ? (keywordInTitle / titleWords) * 100 : 0;

      setEditingConfig({
        ...editingConfig,
        seo_score: Math.min(score, 100),
        keyword_density: parseFloat(density.toFixed(2)),
        readability_score: 75 // Placeholder
      });

      setAnalyzing(false);
    }, 1000);
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    try {
      const configData = {
        ...editingConfig,
        updated_at: new Date().toISOString()
      };

      if (editingConfig.id) {
        const { error } = await supabase
          .from('seo_configuration')
          .update(configData)
          .eq('id', editingConfig.id);

        if (error) throw error;
        alert('SEO configuration updated!');
      } else {
        const { error } = await supabase
          .from('seo_configuration')
          .insert([{ ...configData, created_at: new Date().toISOString() }]);

        if (error) throw error;
        alert('SEO configuration created!');
      }

      setEditingConfig(null);
      loadConfigs();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save SEO configuration');
    }
  };

  const generateSchema = () => {
    if (!editingConfig) return;

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": editingConfig.seo_title || '',
      "description": editingConfig.seo_description || '',
      "image": editingConfig.og_image || '',
      "brand": {
        "@type": "Brand",
        "name": "StreamUnlimited"
      },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "USD",
        "price": "79.99",
        "availability": "https://schema.org/InStock"
      }
    };

    setEditingConfig({
      ...editingConfig,
      schema_markup: schema
    });

    alert('Schema markup generated!');
  };

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSEOScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-400" />
            Rank Math Pro SEO Manager
          </h1>
          <p className="text-gray-400">Professional SEO optimization with real-time analysis</p>
        </div>
        <button
          onClick={() => setEditingConfig(emptyConfig)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center gap-2"
        >
          <Target className="w-5 h-5" />
          New SEO Config
        </button>
      </div>

      {editingConfig ? (
        <div className="bg-gray-800 rounded-xl p-6 border-2 border-green-500 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">SEO Configuration Editor</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getSEOScoreColor(editingConfig.seo_score || 0)}`}>
                  {editingConfig.seo_score || 0}
                </div>
                <div className="text-sm text-gray-400">{getSEOScoreLabel(editingConfig.seo_score || 0)}</div>
              </div>
              <button
                onClick={analyzeSEO}
                disabled={analyzing}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {analyzing ? 'Analyzing...' : 'Analyze SEO'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-700">
            {[
              { key: 'basic', label: 'Basic SEO', icon: Search },
              { key: 'social', label: 'Social Media', icon: Globe },
              { key: 'advanced', label: 'Advanced', icon: BarChart3 },
              { key: 'schema', label: 'Schema', icon: Code }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Page Type
                  </label>
                  <select
                    value={editingConfig.page_type}
                    onChange={(e) => setEditingConfig({ ...editingConfig, page_type: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="page">Page</option>
                    <option value="product">Product</option>
                    <option value="post">Blog Post</option>
                    <option value="home">Homepage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Focus Keyword
                  </label>
                  <input
                    type="text"
                    value={editingConfig.focus_keyword}
                    onChange={(e) => setEditingConfig({ ...editingConfig, focus_keyword: e.target.value })}
                    placeholder="e.g., jailbroken fire stick"
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  SEO Title ({editingConfig.seo_title?.length || 0}/60 characters)
                  {editingConfig.seo_title && editingConfig.seo_title.length >= 50 && editingConfig.seo_title.length <= 60 && (
                    <CheckCircle className="inline w-4 h-4 text-green-400 ml-2" />
                  )}
                </label>
                <input
                  type="text"
                  value={editingConfig.seo_title}
                  onChange={(e) => setEditingConfig({ ...editingConfig, seo_title: e.target.value })}
                  placeholder="Optimized title for search engines"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editingConfig.seo_title && editingConfig.seo_title.length < 50 && 'Too short - aim for 50-60 characters'}
                  {editingConfig.seo_title && editingConfig.seo_title.length > 60 && 'Too long - Google may truncate'}
                  {editingConfig.seo_title && editingConfig.seo_title.length >= 50 && editingConfig.seo_title.length <= 60 && 'Perfect length!'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Meta Description ({editingConfig.seo_description?.length || 0}/160 characters)
                  {editingConfig.seo_description && editingConfig.seo_description.length >= 150 && editingConfig.seo_description.length <= 160 && (
                    <CheckCircle className="inline w-4 h-4 text-green-400 ml-2" />
                  )}
                </label>
                <textarea
                  value={editingConfig.seo_description}
                  onChange={(e) => setEditingConfig({ ...editingConfig, seo_description: e.target.value })}
                  rows={3}
                  placeholder="Compelling description for search results"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {editingConfig.seo_description && editingConfig.seo_description.length < 150 && 'Too short - aim for 150-160 characters'}
                  {editingConfig.seo_description && editingConfig.seo_description.length > 160 && 'Too long - Google may truncate'}
                  {editingConfig.seo_description && editingConfig.seo_description.length >= 150 && editingConfig.seo_description.length <= 160 && 'Perfect length!'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  SEO Keywords (comma separated)
                </label>
                <input
                  type="text"
                  value={editingConfig.seo_keywords?.join(', ')}
                  onChange={(e) => setEditingConfig({ ...editingConfig, seo_keywords: e.target.value.split(',').map(k => k.trim()) })}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Canonical URL
                  </label>
                  <input
                    type="text"
                    value={editingConfig.canonical_url}
                    onChange={(e) => setEditingConfig({ ...editingConfig, canonical_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Robots Meta
                  </label>
                  <select
                    value={editingConfig.robots_meta}
                    onChange={(e) => setEditingConfig({ ...editingConfig, robots_meta: e.target.value })}
                    className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="index, follow">Index, Follow (Default)</option>
                    <option value="noindex, follow">No Index, Follow</option>
                    <option value="index, nofollow">Index, No Follow</option>
                    <option value="noindex, nofollow">No Index, No Follow</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Open Graph (Facebook, LinkedIn)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">OG Title</label>
                    <input
                      type="text"
                      value={editingConfig.og_title}
                      onChange={(e) => setEditingConfig({ ...editingConfig, og_title: e.target.value })}
                      placeholder="Social media title"
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">OG Description</label>
                    <textarea
                      value={editingConfig.og_description}
                      onChange={(e) => setEditingConfig({ ...editingConfig, og_description: e.target.value })}
                      rows={2}
                      placeholder="Social media description"
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">OG Image URL</label>
                    <input
                      type="text"
                      value={editingConfig.og_image}
                      onChange={(e) => setEditingConfig({ ...editingConfig, og_image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Twitter Card
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Twitter Title</label>
                    <input
                      type="text"
                      value={editingConfig.twitter_title}
                      onChange={(e) => setEditingConfig({ ...editingConfig, twitter_title: e.target.value })}
                      placeholder="Twitter title"
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Twitter Description</label>
                    <textarea
                      value={editingConfig.twitter_description}
                      onChange={(e) => setEditingConfig({ ...editingConfig, twitter_description: e.target.value })}
                      rows={2}
                      placeholder="Twitter description"
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Twitter Image URL</label>
                    <input
                      type="text"
                      value={editingConfig.twitter_image}
                      onChange={(e) => setEditingConfig({ ...editingConfig, twitter_image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg border border-gray-500 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-400">{editingConfig.keyword_density?.toFixed(2) || 0}%</div>
                  <div className="text-sm text-gray-400 mt-1">Keyword Density</div>
                  <p className="text-xs text-gray-500 mt-2">Ideal: 1-3%</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400">{editingConfig.readability_score || 0}</div>
                  <div className="text-sm text-gray-400 mt-1">Readability Score</div>
                  <p className="text-xs text-gray-500 mt-2">Higher is better</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {editingConfig.internal_links || 0}/{editingConfig.external_links || 0}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Internal/External Links</div>
                  <p className="text-xs text-gray-500 mt-2">Balance is key</p>
                </div>
              </div>

              <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">SEO Analysis</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {editingConfig.seo_title && editingConfig.seo_title.length >= 50 && editingConfig.seo_title.length <= 60 ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-white font-semibold">Title Length</p>
                      <p className="text-gray-400 text-sm">
                        {editingConfig.seo_title && editingConfig.seo_title.length >= 50 && editingConfig.seo_title.length <= 60
                          ? 'Perfect! Your title is the ideal length.'
                          : 'Optimize your title to 50-60 characters for best results.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {editingConfig.focus_keyword && editingConfig.seo_title?.toLowerCase().includes(editingConfig.focus_keyword.toLowerCase()) ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-white font-semibold">Focus Keyword in Title</p>
                      <p className="text-gray-400 text-sm">
                        {editingConfig.focus_keyword && editingConfig.seo_title?.toLowerCase().includes(editingConfig.focus_keyword.toLowerCase())
                          ? 'Great! Your focus keyword appears in the title.'
                          : 'Include your focus keyword in the title for better rankings.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {editingConfig.seo_keywords && editingConfig.seo_keywords.length >= 3 ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-white font-semibold">Keywords</p>
                      <p className="text-gray-400 text-sm">
                        {editingConfig.seo_keywords && editingConfig.seo_keywords.length >= 3
                          ? 'Good keyword coverage!'
                          : 'Add at least 3-5 relevant keywords.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    {editingConfig.og_title && editingConfig.og_description && editingConfig.og_image ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-white font-semibold">Social Media Optimization</p>
                      <p className="text-gray-400 text-sm">
                        {editingConfig.og_title && editingConfig.og_description && editingConfig.og_image
                          ? 'Your content is optimized for social sharing!'
                          : 'Complete Open Graph tags for better social media presence.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Schema Markup (JSON-LD)</h3>
                  <p className="text-gray-400 text-sm">Structured data for search engines</p>
                </div>
                <button
                  onClick={generateSchema}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Generate Schema
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Schema Markup JSON
                </label>
                <textarea
                  value={JSON.stringify(editingConfig.schema_markup || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      setEditingConfig({ ...editingConfig, schema_markup: JSON.parse(e.target.value) });
                    } catch (_err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={12}
                  className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none font-mono text-sm"
                  placeholder='{"@context": "https://schema.org", "@type": "Product", ...}'
                />
              </div>

              <div className="bg-purple-500/20 border-2 border-purple-500 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">Schema Types Available:</h4>
                <div className="grid md:grid-cols-3 gap-2 text-sm">
                  <div className="text-gray-300">• Product</div>
                  <div className="text-gray-300">• Article</div>
                  <div className="text-gray-300">• Organization</div>
                  <div className="text-gray-300">• WebPage</div>
                  <div className="text-gray-300">• FAQ</div>
                  <div className="text-gray-300">• Breadcrumb</div>
                  <div className="text-gray-300">• Review</div>
                  <div className="text-gray-300">• VideoObject</div>
                  <div className="text-gray-300">• LocalBusiness</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Save SEO Configuration
            </button>
            <button
              onClick={() => setEditingConfig(null)}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {loading ? (
            <p className="text-gray-400">Loading SEO configurations...</p>
          ) : configs.length === 0 ? (
            <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
              <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No SEO configurations yet</p>
              <button
                onClick={() => setEditingConfig(emptyConfig)}
                className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Create Your First SEO Config
              </button>
            </div>
          ) : (
            configs.map((config) => (
              <div
                key={config.id}
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{config.seo_title || 'Untitled'}</h3>
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm capitalize">
                        {config.page_type}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{config.seo_description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Keyword: {config.focus_keyword || 'None'}</span>
                      <span className={getSEOScoreColor(config.seo_score)}>
                        Score: {config.seo_score}/100
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingConfig(config)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
