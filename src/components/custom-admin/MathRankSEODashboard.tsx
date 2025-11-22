import { useState, useEffect } from 'react';
import { TrendingUp, Target, Award, AlertCircle, CheckCircle, BarChart2, Link } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SEOAudit {
  page_url: string;
  overall_score: number;
  title_score: number;
  meta_description_score: number;
  heading_score: number;
  content_score: number;
  image_score: number;
  link_score: number;
  mobile_score: number;
  speed_score: number;
  issues: any[];
  recommendations: any[];
}

export default function MathRankSEODashboard() {
  const [, setAudits] = useState<SEOAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [, ] = useState<SEOAudit | null>(null);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      const { data, error } = await supabase
        .from('seo_audit_results')
        .select('*')
        .order('audit_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error('Error loading audits:', error);
    } finally {
      setLoading(false);
    }
  };

  const runNewAudit = async () => {
    try {
      // Simulate SEO audit for homepage
      const auditData = {
        page_url: '/',
        overall_score: 87,
        title_score: 95,
        meta_description_score: 90,
        heading_score: 85,
        content_score: 88,
        image_score: 80,
        link_score: 85,
        mobile_score: 95,
        speed_score: 78,
        issues: [
          { type: 'warning', message: 'Some images missing alt tags' },
          { type: 'info', message: 'Page speed could be improved' }
        ],
        recommendations: [
          { priority: 'medium', message: 'Add alt tags to all images' },
          { priority: 'low', message: 'Optimize image file sizes' },
          { priority: 'low', message: 'Enable browser caching' }
        ]
      };

      const { error } = await supabase
        .from('seo_audit_results')
        .insert([auditData]);

      if (error) throw error;

      alert('SEO Audit completed successfully!');
      loadAudits();
    } catch (error) {
      console.error('Error running audit:', error);
      alert('Error running audit');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return <div className="p-6 text-white">Loading SEO dashboard...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Math Rank Style SEO Dashboard
        </h2>
        <button
          onClick={runNewAudit}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg flex items-center gap-2"
        >
          <BarChart2 className="w-5 h-5" />
          Run SEO Audit
        </button>
      </div>

      {/* Overall SEO Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8" />
            <div className="text-4xl font-bold">87</div>
          </div>
          <div className="text-sm opacity-90">Overall SEO Score</div>
          <div className="text-xs opacity-75 mt-1">Grade: A-</div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8" />
            <div className="text-4xl font-bold">92</div>
          </div>
          <div className="text-sm opacity-90">Keywords Ranked</div>
          <div className="text-xs opacity-75 mt-1">+15 this month</div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8" />
            <div className="text-4xl font-bold">2.4K</div>
          </div>
          <div className="text-sm opacity-90">Organic Traffic</div>
          <div className="text-xs opacity-75 mt-1">+32% vs last month</div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Link className="w-8 h-8" />
            <div className="text-4xl font-bold">156</div>
          </div>
          <div className="text-sm opacity-90">Backlinks</div>
          <div className="text-xs opacity-75 mt-1">+8 this week</div>
        </div>
      </div>

      {/* SEO Metrics Breakdown */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">SEO Metrics Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Title Optimization', score: 95, icon: CheckCircle },
            { label: 'Meta Descriptions', score: 90, icon: CheckCircle },
            { label: 'Heading Structure', score: 85, icon: CheckCircle },
            { label: 'Content Quality', score: 88, icon: CheckCircle },
            { label: 'Image Optimization', score: 80, icon: AlertCircle },
            { label: 'Internal Linking', score: 85, icon: CheckCircle },
            { label: 'Mobile Friendly', score: 95, icon: CheckCircle },
            { label: 'Page Speed', score: 78, icon: AlertCircle }
          ].map((metric, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <metric.icon className={`w-5 h-5 ${getScoreColor(metric.score)}`} />
                  <span className="text-white font-semibold">{metric.label}</span>
                </div>
                <span className={`text-lg font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metric.score >= 90 ? 'bg-green-500' :
                    metric.score >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keyword Rankings */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Top Keyword Rankings</h3>

        <div className="space-y-3">
          {[
            { keyword: 'IPTV streaming', position: 3, change: '+2', searches: 8100 },
            { keyword: 'Fire Stick IPTV', position: 5, change: '+1', searches: 5400 },
            { keyword: 'cut cable save money', position: 7, change: '+3', searches: 2900 },
            { keyword: 'best IPTV service', position: 12, change: '+5', searches: 6600 },
            { keyword: '4K IPTV streaming', position: 8, change: '0', searches: 1900 },
            { keyword: 'jailbroken Fire Stick', position: 4, change: '+1', searches: 4800 }
          ].map((keyword, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">{keyword.keyword}</div>
                <div className="text-sm text-gray-400">{keyword.searches.toLocaleString()} monthly searches</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">#{keyword.position}</div>
                  <div className="text-xs text-gray-400">Position</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  keyword.change.startsWith('+') ? 'bg-green-900 text-green-400' :
                  keyword.change === '0' ? 'bg-gray-600 text-gray-300' :
                  'bg-red-900 text-red-400'
                }`}>
                  {keyword.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Issues */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            SEO Issues Found
          </h3>

          <div className="space-y-3">
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400 mt-1" />
                <div>
                  <div className="text-white font-semibold text-sm">Missing Alt Tags</div>
                  <div className="text-gray-300 text-xs">8 images don't have alt attributes</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-1" />
                <div>
                  <div className="text-white font-semibold text-sm">Page Speed</div>
                  <div className="text-gray-300 text-xs">Load time is 3.2s, aim for under 2s</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 mt-1" />
                <div>
                  <div className="text-white font-semibold text-sm">Internal Links</div>
                  <div className="text-gray-300 text-xs">Add more internal links between blog posts</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Recommendations
          </h3>

          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                <div>
                  <div className="text-white font-semibold text-sm">Add Schema Markup</div>
                  <div className="text-gray-300 text-xs">Implement Product and Review schema</div>
                  <div className="text-green-400 text-xs mt-1">High Impact</div>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                <div>
                  <div className="text-white font-semibold text-sm">Create More Content</div>
                  <div className="text-gray-300 text-xs">Target long-tail keywords with new posts</div>
                  <div className="text-yellow-400 text-xs mt-1">Medium Impact</div>
                </div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-500 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-1" />
                <div>
                  <div className="text-white font-semibold text-sm">Optimize Images</div>
                  <div className="text-gray-300 text-xs">Compress images to reduce page size</div>
                  <div className="text-blue-400 text-xs mt-1">Low Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Performance */}
      <div className="bg-gray-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Top Performing Content</h3>

        <div className="space-y-3">
          {[
            { title: 'Ultimate IPTV Guide 2025', views: 1247, score: 95, traffic: '+45%' },
            { title: 'Sports Streaming Complete Guide', views: 892, score: 96, traffic: '+38%' },
            { title: 'Save $1,200 Cutting Cable', views: 756, score: 94, traffic: '+52%' },
            { title: 'Fire Stick 4K Review', views: 634, score: 93, traffic: '+29%' },
            { title: 'Complete IPTV Setup Guide', views: 589, score: 97, traffic: '+41%' }
          ].map((content, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="text-white font-semibold">{content.title}</div>
                <div className="text-sm text-gray-400">{content.views} views • SEO Score: {content.score}/100</div>
              </div>
              <div className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-sm font-semibold">
                {content.traffic}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Quick SEO Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-3 text-sm font-semibold transition">
            Analyze Competitors
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-3 text-sm font-semibold transition">
            Find Keywords
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-3 text-sm font-semibold transition">
            Check Backlinks
          </button>
          <button className="bg-white/20 hover:bg-white/30 text-white rounded-lg p-3 text-sm font-semibold transition">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
