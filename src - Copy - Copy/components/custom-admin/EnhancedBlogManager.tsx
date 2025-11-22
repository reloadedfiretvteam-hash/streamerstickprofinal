import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  Save,
  X,
  Tag,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  Image as ImageIcon,
  Video,
  File,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_name?: string;
  post_status: string;
  categories?: any;
  tags?: any;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  focus_keyword?: string;
  seo_score?: number;
  rank_math_score?: number;
  readability_score?: number;
  previous_seo_score?: number;
  previous_rank_math_score?: number;
  score_updated_at?: string;
  view_count?: number;
  word_count?: number;
  internal_links_count?: number;
  external_links_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function EnhancedBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error loading posts:', error);
    }

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const calculateRankMathScore = (post: BlogPost) => {
    let score = 0;

    // Title optimization (0-15 points)
    if (post.title) {
      const titleLength = post.title.length;
      if (titleLength >= 50 && titleLength <= 60) score += 15;
      else if (titleLength >= 40 && titleLength <= 70) score += 10;
      else if (titleLength > 0) score += 5;
    }

    // Focus keyword in title (0-15 points)
    if (post.focus_keyword && post.title?.toLowerCase().includes(post.focus_keyword.toLowerCase())) {
      score += 15;
    }

    // Meta description (0-10 points)
    if (post.seo_description) {
      const descLength = post.seo_description.length;
      if (descLength >= 150 && descLength <= 160) score += 10;
      else if (descLength >= 120 && descLength <= 180) score += 7;
      else score += 5;
    }

    // Focus keyword in meta description (0-10 points)
    if (post.focus_keyword && post.seo_description?.toLowerCase().includes(post.focus_keyword.toLowerCase())) {
      score += 10;
    }

    // Content length (0-15 points)
    if (post.word_count && post.word_count >= 2500) score += 15;
    else if (post.word_count && post.word_count >= 1500) score += 12;
    else if (post.word_count && post.word_count >= 1000) score += 8;
    else if (post.word_count && post.word_count >= 600) score += 5;

    // Focus keyword in content (0-10 points)
    if (post.focus_keyword && post.content?.toLowerCase().includes(post.focus_keyword.toLowerCase())) {
      score += 10;
    }

    // Featured image (0-5 points)
    if (post.featured_image) score += 5;

    // Internal links (0-10 points)
    if (post.internal_links_count && post.internal_links_count >= 3) score += 10;
    else if (post.internal_links_count && post.internal_links_count >= 1) score += 5;

    // External links (0-5 points)
    if (post.external_links_count && post.external_links_count >= 2) score += 5;
    else if (post.external_links_count && post.external_links_count >= 1) score += 3;

    // Keywords (0-5 points)
    if (post.seo_keywords && post.seo_keywords.split(',').length >= 3) score += 5;

    return Math.min(score, 100);
  };

  const calculateSEOScore = (post: BlogPost) => {
    let score = 0;

    // Title (0-20 points)
    if (post.title) {
      const titleLength = post.title.length;
      if (titleLength >= 50 && titleLength <= 60) score += 20;
      else if (titleLength >= 40 && titleLength <= 70) score += 15;
      else if (titleLength > 0) score += 10;
    }

    // Meta description (0-20 points)
    if (post.seo_description) {
      const descLength = post.seo_description.length;
      if (descLength >= 150 && descLength <= 160) score += 20;
      else if (descLength >= 120 && descLength <= 180) score += 15;
      else score += 10;
    }

    // Focus keyword (0-20 points)
    if (post.focus_keyword && post.focus_keyword.length > 0) score += 20;

    // Content length (0-15 points)
    if (post.word_count && post.word_count >= 1500) score += 15;
    else if (post.word_count && post.word_count >= 1000) score += 10;
    else if (post.word_count && post.word_count >= 500) score += 5;

    // Excerpt (0-10 points)
    if (post.excerpt && post.excerpt.length > 50) score += 10;

    // Featured image (0-10 points)
    if (post.featured_image) score += 10;

    // Category (0-5 points)
    if (post.categories) score += 5;

    return Math.min(score, 100);
  };

  const handleFileUpload = async (file: File, type: 'image' | 'video' | 'file') => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // In production, you would upload to your storage service
      // For now, we'll store metadata in database
      const fileUrl = `/uploads/${Date.now()}-${file.name}`;

      const { data, error } = await supabase
        .from('media_files')
        .insert([{
          filename: file.name,
          file_url: fileUrl,
          file_type: type,
          file_size: file.size,
          mime_type: file.type,
          metadata: {
            originalName: file.name,
            uploadedAt: new Date().toISOString()
          }
        }])
        .select()
        .single();

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      // Update the editing post with the new file URL
      if (editingPost && type === 'image') {
        setEditingPost({ ...editingPost, featured_image: fileUrl });
      }

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

      return fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
      setUploading(false);
      setUploadProgress(0);
      return null;
    }
  };

  const savePost = async () => {
    if (!editingPost) return;

    setSaving(true);

    // Calculate word count
    const wordCount = editingPost.content ? editingPost.content.split(/\s+/).length : 0;

    // Count links
    const internalLinks = (editingPost.content?.match(/href=["'](\/|#)/g) || []).length;
    const externalLinks = (editingPost.content?.match(/href=["']https?:\/\//g) || []).length;

    // Calculate new scores
    const newSeoScore = calculateSEOScore({ ...editingPost, word_count: wordCount });
    const newRankMathScore = calculateRankMathScore({
      ...editingPost,
      word_count: wordCount,
      internal_links_count: internalLinks,
      external_links_count: externalLinks
    });

    const postData: any = {
      ...editingPost,
      word_count: wordCount,
      internal_links_count: internalLinks,
      external_links_count: externalLinks,
      previous_seo_score: editingPost.seo_score || 0,
      previous_rank_math_score: editingPost.rank_math_score || 0,
      seo_score: newSeoScore,
      rank_math_score: newRankMathScore,
      score_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingPost.id) {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);

      if (!error) {
        alert('Blog post updated successfully!');
        loadPosts();
        setEditingPost(null);
      } else {
        alert('Error: ' + error.message);
      }
    } else {
      delete postData.id;
      const { error } = await supabase
        .from('blog_posts')
        .insert([postData]);

      if (!error) {
        alert('Blog post created successfully!');
        loadPosts();
        setEditingPost(null);
      } else {
        alert('Error: ' + error.message);
      }
    }

    setSaving(false);
  };

  const deletePost = async (id: string) => {
    if (!confirm('Delete this blog post permanently?')) return;

    await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    alert('Post deleted!');
    loadPosts();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
    return 'text-red-400 bg-red-500/20 border-red-500/50';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  const getScoreChange = (current: number, previous: number) => {
    const diff = current - previous;
    if (diff > 0) return { icon: ArrowUp, color: 'text-green-400', text: `+${diff}` };
    if (diff < 0) return { icon: ArrowDown, color: 'text-red-400', text: `${diff}` };
    return { icon: Minus, color: 'text-gray-400', text: '0' };
  };

  const filteredPosts = posts.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-400" />
            Blog Posts Manager
          </h2>
          <p className="text-gray-400 mt-1">
            Manage all {posts.length} blog posts with Rank Math Pro SEO scoring
          </p>
        </div>
        <button
          onClick={() => setEditingPost({
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            featured_image: '',
            author_name: 'Admin',
            post_status: 'draft',
            seo_title: '',
            seo_description: '',
            focus_keyword: ''
          })}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Blog Post
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blog posts by title or content..."
            className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          Loading posts...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No blog posts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const rankMathScore = post.rank_math_score || 0;
            const seoScore = post.seo_score || 0;
            const RankMathIcon = getScoreIcon(rankMathScore);
            const SeoIcon = getScoreIcon(seoScore);
            const rankMathChange = getScoreChange(rankMathScore, post.previous_rank_math_score || 0);
            const seoChange = getScoreChange(seoScore, post.previous_seo_score || 0);

            return (
              <div key={post.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{post.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.post_status === 'published' ? 'bg-green-500/20 text-green-400' :
                        post.post_status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {post.post_status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{post.excerpt || 'No excerpt'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author_name || 'Admin'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                      {post.focus_keyword && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {post.focus_keyword}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score Badges */}
                  <div className="flex gap-3">
                    {/* Rank Math Pro Score */}
                    <div className={`text-center px-6 py-3 rounded-xl border-2 ${getScoreColor(rankMathScore)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <RankMathIcon className="w-5 h-5" />
                        <span className="text-3xl font-bold">{rankMathScore}</span>
                      </div>
                      <div className="text-xs font-semibold mb-1">Rank Math</div>
                      {post.previous_rank_math_score !== undefined && post.previous_rank_math_score !== rankMathScore && (
                        <div className={`flex items-center gap-1 text-xs ${rankMathChange.color}`}>
                          <rankMathChange.icon className="w-3 h-3" />
                          {rankMathChange.text}
                        </div>
                      )}
                    </div>

                    {/* SEO Score */}
                    <div className={`text-center px-6 py-3 rounded-xl border-2 ${getScoreColor(seoScore)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <SeoIcon className="w-5 h-5" />
                        <span className="text-3xl font-bold">{seoScore}</span>
                      </div>
                      <div className="text-xs font-semibold mb-1">SEO Score</div>
                      {post.previous_seo_score !== undefined && post.previous_seo_score !== seoScore && (
                        <div className={`flex items-center gap-1 text-xs ${seoChange.color}`}>
                          <seoChange.icon className="w-3 h-3" />
                          {seoChange.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-5 gap-3 mb-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{post.word_count || 0}</div>
                    <div className="text-xs text-gray-400">Words</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{post.view_count || 0}</div>
                    <div className="text-xs text-gray-400">Views</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{post.readability_score || 0}</div>
                    <div className="text-xs text-gray-400">Readability</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{post.internal_links_count || 0}</div>
                    <div className="text-xs text-gray-400">Internal</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{post.external_links_count || 0}</div>
                    <div className="text-xs text-gray-400">External</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => post.id && deletePost(post.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto bg-gray-800 rounded-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingPost.id ? 'Edit Blog Post' : 'New Blog Post'}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-white/90 text-sm">
                    <span>Rank Math: {calculateRankMathScore(editingPost)}/100</span>
                    <span>SEO: {calculateSEOScore(editingPost)}/100</span>
                    <span>Words: {editingPost.content?.split(/\s+/).length || 0}</span>
                  </div>
                </div>
                <button
                  onClick={() => setEditingPost(null)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Post Title * ({editingPost.title?.length || 0} characters)
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="How to Cut the Cord and Save Money with IPTV"
                  />
                  <p className="text-xs text-gray-400 mt-1">Optimal: 50-60 characters for SEO</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      URL Slug *
                    </label>
                    <input
                      type="text"
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="cut-cord-save-money-iptv"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={editingPost.post_status}
                      onChange={(e) => setEditingPost({ ...editingPost, post_status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Featured Image
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={editingPost.featured_image || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                      className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="/path/to/image.jpg"
                    />
                    <label className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition cursor-pointer flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, file.type.startsWith('image/') ? 'image' : 'video');
                        }}
                      />
                    </label>
                  </div>
                  {uploading && (
                    <div className="mt-2">
                      <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-green-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Uploading: {uploadProgress}%</p>
                    </div>
                  )}
                  {editingPost.featured_image && (
                    <div className="mt-2">
                      <img
                        src={editingPost.featured_image}
                        alt="Preview"
                        className="h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Content * ({editingPost.content?.split(/\s+/).length || 0} words)
                  </label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none font-mono text-sm"
                    placeholder="Write your blog post content here... Use HTML or Markdown."
                  />
                  <p className="text-xs text-gray-400 mt-1">Optimal: 1500+ words for best SEO</p>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Excerpt ({editingPost.excerpt?.length || 0} characters)
                  </label>
                  <textarea
                    value={editingPost.excerpt || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    placeholder="Short summary for preview..."
                  />
                </div>

                {/* SEO Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    Rank Math Pro SEO Settings
                  </h4>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Focus Keyword *
                      </label>
                      <input
                        type="text"
                        value={editingPost.focus_keyword || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, focus_keyword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="iptv streaming"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        SEO Keywords (comma separated)
                      </label>
                      <input
                        type="text"
                        value={editingPost.seo_keywords || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, seo_keywords: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        placeholder="iptv, streaming, fire stick"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      SEO Title ({editingPost.seo_title?.length || 0}/60)
                    </label>
                    <input
                      type="text"
                      value={editingPost.seo_title || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, seo_title: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="SEO optimized title for search engines"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Meta Description ({editingPost.seo_description?.length || 0}/160)
                    </label>
                    <textarea
                      value={editingPost.seo_description || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, seo_description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Compelling description for search results (150-160 characters)"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-700 p-6 flex items-center justify-between">
                <button
                  onClick={() => setEditingPost(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={savePost}
                  disabled={saving || !editingPost.title || !editingPost.slug || !editingPost.content}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : editingPost.id ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
