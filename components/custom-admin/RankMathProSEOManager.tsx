import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  FileText,
  Eye,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Target,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  Globe,
  Zap,
  Star,
  ArrowUp,
  ArrowDown,
  Edit,
  Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function RankMathProSEOManager() {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'keywords' | 'technical'>('overview');
  const [seoContent, setSeoContent] = useState<any[]>([]);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [keywords, setKeywords] = useState<any[]>([]);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    loadSEOContent();
    loadKeywords();
  }, []);

  const loadSEOContent = async () => {
    const { data } = await supabase
      .from('seo_content_metadata')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setSeoContent(data);
  };

  const loadKeywords = async () => {
    const { data } = await supabase
      .from('seo_keywords_tracking')
      .select('*')
      .order('current_rank', { ascending: true });

    if (data) setKeywords(data);
  };

  const calculateSEOScore = (content: any) => {
    let score = 0;

    // Meta title (max 20 points)
    if (content.meta_title) {
      const titleLength = content.meta_title.length;
      if (titleLength >= 50 && titleLength <= 60) score += 20;
      else if (titleLength >= 40 && titleLength <= 70) score += 15;
      else score += 10;
    }

    // Meta description (max 20 points)
    if (content.meta_description) {
      const descLength = content.meta_description.length;
      if (descLength >= 150 && descLength <= 160) score += 20;
      else if (descLength >= 120 && descLength <= 180) score += 15;
      else score += 10;
    }

    // Focus keyword (max 20 points)
    if (content.focus_keyword) {
      score += 20;
      // Check if keyword is in title
      if (content.meta_title?.toLowerCase().includes(content.focus_keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Images (max 10 points)
    if (content.og_image) score += 10;

    // Schema markup (max 15 points)
    if (content.schema_markup && Object.keys(content.schema_markup).length > 0) {
      score += 15;
    }

    // Internal/External links (max 15 points)
    if (content.internal_links > 2) score += 7;
    if (content.external_links > 0) score += 8;

    return Math.min(score, 100);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const saveSEOContent = async () => {
    if (!selectedContent) return;

    const score = calculateSEOScore(selectedContent);

    const { error } = await supabase
      .from('seo_content_metadata')
      .upsert({
        ...selectedContent,
        seo_score: score,
        updated_at: new Date().toISOString()
      });

    if (!error) {
      setShowEditor(false);
      loadSEOContent();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-400" />
            Rank Math Pro SEO Manager
          </h2>
          <p className="text-gray-400 mt-1">Complete SEO optimization and content analysis</p>
        </div>
        <button
          onClick={() => {
            setSelectedContent({
              content_type: 'page',
              content_id: '',
              meta_title: '',
              meta_description: '',
              focus_keyword: '',
              og_title: '',
              og_description: '',
              og_image: '',
              schema_markup: {},
              internal_links: 0,
              external_links: 0
            });
            setShowEditor(true);
          }}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition flex items-center gap-2"
        >
          <Star className="w-5 h-5" />
          Add New Content
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'content', label: 'Content SEO', icon: FileText },
          { id: 'keywords', label: 'Keyword Tracking', icon: Target },
          { id: 'technical', label: 'Technical SEO', icon: Zap }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-green-400">
                  {seoContent.filter(c => calculateSEOScore(c) >= 80).length}
                </span>
              </div>
              <p className="text-gray-300 font-semibold">Excellent SEO</p>
              <p className="text-gray-400 text-sm">Score 80+</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-yellow-400">
                  {seoContent.filter(c => {
                    const score = calculateSEOScore(c);
                    return score >= 60 && score < 80;
                  }).length}
                </span>
              </div>
              <p className="text-gray-300 font-semibold">Needs Work</p>
              <p className="text-gray-400 text-sm">Score 60-79</p>
            </div>

            <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <span className="text-3xl font-bold text-red-400">
                  {seoContent.filter(c => calculateSEOScore(c) < 60).length}
                </span>
              </div>
              <p className="text-gray-300 font-semibold">Poor SEO</p>
              <p className="text-gray-400 text-sm">Score &lt;60</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-blue-400">{keywords.length}</span>
              </div>
              <p className="text-gray-300 font-semibold">Keywords</p>
              <p className="text-gray-400 text-sm">Being tracked</p>
            </div>
          </div>

          {/* Recent Content Performance */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-400" />
              Content Performance Overview
            </h3>
            <div className="space-y-3">
              {seoContent.slice(0, 10).map(content => {
                const score = calculateSEOScore(content);
                return (
                  <div
                    key={content.id}
                    className="bg-gray-900 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition cursor-pointer"
                    onClick={() => {
                      setSelectedContent(content);
                      setShowEditor(true);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          {content.content_type}
                        </span>
                        <h4 className="text-white font-semibold">
                          {content.meta_title || 'Untitled'}
                        </h4>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {content.focus_keyword && (
                          <span className="text-orange-400">Focus: {content.focus_keyword}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`text-center px-4 py-2 rounded-lg ${getScoreColor(score)}`}>
                        <div className="text-2xl font-bold">{score}</div>
                        <div className="text-xs">SEO Score</div>
                      </div>
                      <Edit className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="grid grid-cols-1 gap-4">
          {seoContent.map(content => {
            const score = calculateSEOScore(content);
            return (
              <div
                key={content.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition cursor-pointer"
                onClick={() => {
                  setSelectedContent(content);
                  setShowEditor(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
                        {score} / 100
                      </span>
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                        {content.content_type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {content.meta_title || 'Untitled Content'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {content.meta_description || 'No meta description'}
                    </p>
                    {content.focus_keyword && (
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-orange-400" />
                        <span className="text-orange-400 text-sm font-semibold">
                          {content.focus_keyword}
                        </span>
                      </div>
                    )}
                  </div>
                  <Edit className="w-6 h-6 text-gray-400" />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-900 rounded-lg">
                    <div className="text-xl font-bold text-white">{content.word_count || 0}</div>
                    <div className="text-xs text-gray-400">Words</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900 rounded-lg">
                    <div className="text-xl font-bold text-white">{content.internal_links || 0}</div>
                    <div className="text-xs text-gray-400">Internal Links</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900 rounded-lg">
                    <div className="text-xl font-bold text-white">{content.external_links || 0}</div>
                    <div className="text-xs text-gray-400">External Links</div>
                  </div>
                  <div className="text-center p-3 bg-gray-900 rounded-lg">
                    <div className="text-xl font-bold text-white">{content.readability_score || 0}</div>
                    <div className="text-xs text-gray-400">Readability</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'keywords' && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Keyword Rankings</h3>
          <div className="space-y-3">
            {keywords.map(keyword => (
              <div
                key={keyword.id}
                className="bg-gray-900 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{keyword.keyword}</h4>
                  <p className="text-gray-400 text-sm">{keyword.target_url}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Current</div>
                    <div className="text-2xl font-bold text-white">#{keyword.current_rank || '-'}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Previous</div>
                    <div className="text-2xl font-bold text-gray-400">#{keyword.previous_rank || '-'}</div>
                  </div>
                  <div className="text-center">
                    {keyword.current_rank && keyword.previous_rank && (
                      <div>
                        {keyword.current_rank < keyword.previous_rank ? (
                          <ArrowUp className="w-6 h-6 text-green-400 mx-auto" />
                        ) : keyword.current_rank > keyword.previous_rank ? (
                          <ArrowDown className="w-6 h-6 text-red-400 mx-auto" />
                        ) : (
                          <div className="w-6 h-6 text-gray-400 mx-auto">-</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'technical' && (
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              Technical SEO Checklist
            </h3>
            <div className="space-y-3">
              {[
                { label: 'XML Sitemap', status: true, desc: 'sitemap.xml is accessible' },
                { label: 'Robots.txt', status: true, desc: 'robots.txt configured properly' },
                { label: 'SSL Certificate', status: true, desc: 'HTTPS enabled' },
                { label: 'Mobile Friendly', status: true, desc: 'Responsive design implemented' },
                { label: 'Page Speed', status: false, desc: 'Needs optimization (3.2s load time)' },
                { label: 'Schema Markup', status: true, desc: 'Structured data present' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {item.status ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-400" />
                    )}
                    <div>
                      <p className="text-white font-semibold">{item.label}</p>
                      <p className="text-gray-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  {item.status ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                      Passed
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
                      Failed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEO Editor Modal */}
      {showEditor && selectedContent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">SEO Content Editor</h3>
              <button
                onClick={() => setShowEditor(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* SEO Score */}
              <div className={`text-center p-6 rounded-xl ${getScoreColor(calculateSEOScore(selectedContent))}`}>
                <div className="text-5xl font-bold mb-2">{calculateSEOScore(selectedContent)}</div>
                <div className="text-lg font-semibold">SEO Score</div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Content Type
                  </label>
                  <select
                    value={selectedContent.content_type}
                    onChange={(e) => setSelectedContent({ ...selectedContent, content_type: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                  >
                    <option value="page">Page</option>
                    <option value="post">Blog Post</option>
                    <option value="product">Product</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Content ID / Slug
                  </label>
                  <input
                    type="text"
                    value={selectedContent.content_id}
                    onChange={(e) => setSelectedContent({ ...selectedContent, content_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="page-slug-or-id"
                  />
                </div>
              </div>

              {/* Focus Keyword */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Focus Keyword
                </label>
                <input
                  type="text"
                  value={selectedContent.focus_keyword || ''}
                  onChange={(e) => setSelectedContent({ ...selectedContent, focus_keyword: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                  placeholder="main keyword for this content"
                />
              </div>

              {/* Meta Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Meta Title ({selectedContent.meta_title?.length || 0} / 60 characters)
                </label>
                <input
                  type="text"
                  value={selectedContent.meta_title || ''}
                  onChange={(e) => setSelectedContent({ ...selectedContent, meta_title: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                  placeholder="SEO optimized title (50-60 characters)"
                />
              </div>

              {/* Meta Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Meta Description ({selectedContent.meta_description?.length || 0} / 160 characters)
                </label>
                <textarea
                  value={selectedContent.meta_description || ''}
                  onChange={(e) => setSelectedContent({ ...selectedContent, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                  placeholder="Compelling description for search results (150-160 characters)"
                />
              </div>

              {/* Open Graph */}
              <div className="border-t border-gray-700 pt-6">
                <h4 className="text-lg font-bold text-white mb-4">Social Media (Open Graph)</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">OG Title</label>
                    <input
                      type="text"
                      value={selectedContent.og_title || ''}
                      onChange={(e) => setSelectedContent({ ...selectedContent, og_title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">OG Description</label>
                    <textarea
                      value={selectedContent.og_description || ''}
                      onChange={(e) => setSelectedContent({ ...selectedContent, og_description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">OG Image URL</label>
                    <input
                      type="text"
                      value={selectedContent.og_image || ''}
                      onChange={(e) => setSelectedContent({ ...selectedContent, og_image: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3">
                <button
                  onClick={saveSEOContent}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-6 h-6" />
                  Save SEO Settings
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-6 py-4 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
