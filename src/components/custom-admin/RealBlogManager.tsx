import { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  TrendingUp,
  Save,
  X,
  Tag,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function RealBlogManager() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('real_blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPosts(data);
    }
    setLoading(false);
  };

  const calculateSEOScore = (post: any) => {
    let score = 0;

    // Title length (optimal: 50-60 chars)
    if (post.title) {
      const titleLength = post.title.length;
      if (titleLength >= 50 && titleLength <= 60) score += 20;
      else if (titleLength >= 40 && titleLength <= 70) score += 15;
      else if (titleLength > 0) score += 10;
    }

    // Meta description (optimal: 150-160 chars)
    if (post.meta_description) {
      const descLength = post.meta_description.length;
      if (descLength >= 150 && descLength <= 160) score += 20;
      else if (descLength >= 120 && descLength <= 180) score += 15;
      else score += 10;
    }

    // Focus keyword present
    if (post.focus_keyword && post.focus_keyword.length > 0) score += 20;

    // Content length (optimal: 1000+ words)
    if (post.word_count >= 1500) score += 15;
    else if (post.word_count >= 1000) score += 10;
    else if (post.word_count >= 500) score += 5;

    // Has excerpt
    if (post.excerpt && post.excerpt.length > 50) score += 10;

    // Has featured image
    if (post.featured_image) score += 10;

    // Has category
    if (post.category) score += 5;

    return Math.min(score, 100);
  };

  const savePost = async () => {
    if (!editingPost) return;

    setSaving(true);

    // Calculate word count
    const wordCount = editingPost.content ? editingPost.content.split(/\s+/).length : 0;

    // Calculate SEO score
    const seoScore = calculateSEOScore({ ...editingPost, word_count: wordCount });

    const postData = {
      ...editingPost,
      word_count: wordCount,
      seo_score: seoScore,
      updated_at: new Date().toISOString()
    };

    if (editingPost.id) {
      const { error } = await supabase
        .from('real_blog_posts')
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
      const { error } = await supabase
        .from('real_blog_posts')
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
      .from('real_blog_posts')
      .delete()
      .eq('id', id);

    alert('Post deleted!');
    loadPosts();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return CheckCircle;
    if (score >= 60) return AlertCircle;
    return XCircle;
  };

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.content.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-gray-400 mt-1">Manage your blog posts with real-time SEO scoring</p>
        </div>
        <button
          onClick={() => setEditingPost({
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            featured_image: '',
            author: 'Admin',
            category: '',
            tags: [],
            status: 'draft',
            meta_title: '',
            meta_description: '',
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
            placeholder="Search blog posts..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
          />
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading posts...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No blog posts yet</p>
          <button
            onClick={() => setEditingPost({ title: '', content: '', status: 'draft' })}
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            Write Your First Post
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => {
            const seoScore = post.seo_score || calculateSEOScore(post);
            const ScoreIcon = getScoreIcon(seoScore);

            return (
              <div key={post.id} className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition border border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{post.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.status === 'publish' ? 'bg-green-500/20 text-green-400' :
                        post.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3">{post.excerpt || 'No excerpt'}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                      {post.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {post.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* SEO Score Badge */}
                  <div className={`text-center px-6 py-3 rounded-xl ${getScoreColor(seoScore)}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <ScoreIcon className="w-5 h-5" />
                      <span className="text-3xl font-bold">{seoScore}</span>
                    </div>
                    <div className="text-xs font-semibold">SEO Score</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4">
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
                    <div className="text-lg font-bold text-white">{(post.internal_links || 0) + (post.external_links || 0)}</div>
                    <div className="text-xs text-gray-400">Links</div>
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
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* SEO Details */}
                {post.focus_keyword && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-400">Focus Keyword:</span>
                      <span className="text-orange-400 font-semibold">{post.focus_keyword}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
          <div className="min-h-screen p-8">
            <div className="max-w-5xl mx-auto bg-gray-800 rounded-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingPost.id ? 'Edit Blog Post' : 'New Blog Post'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    SEO Score: {calculateSEOScore(editingPost)}/100
                  </p>
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
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="How to Cut the Cord and Save Money"
                  />
                  <p className="text-xs text-gray-400 mt-1">Optimal: 50-60 characters</p>
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
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      placeholder="cut-cord-save-money"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={editingPost.category || ''}
                      onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    >
                      <option value="">Select category</option>
                      <option value="guides">Guides</option>
                      <option value="news">News</option>
                      <option value="tutorials">Tutorials</option>
                      <option value="reviews">Reviews</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Content * ({editingPost.content?.split(/\s+/).length || 0} words)
                  </label>
                  <textarea
                    value={editingPost.content}
                    onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Write your blog post content here..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Optimal: 1000+ words for SEO</p>
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
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="Short summary of the post"
                  />
                </div>

                {/* SEO Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    SEO Optimization
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Focus Keyword
                      </label>
                      <input
                        type="text"
                        value={editingPost.focus_keyword || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, focus_keyword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                        placeholder="main keyword to rank for"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Meta Title ({editingPost.meta_title?.length || 0}/60)
                      </label>
                      <input
                        type="text"
                        value={editingPost.meta_title || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, meta_title: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Meta Description ({editingPost.meta_description?.length || 0}/160)
                      </label>
                      <textarea
                        value={editingPost.meta_description || ''}
                        onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Featured Image URL
                  </label>
                  <input
                    type="text"
                    value={editingPost.featured_image || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, featured_image: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600"
                  >
                    <option value="draft">Draft</option>
                    <option value="publish">Published</option>
                    <option value="private">Private</option>
                  </select>
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
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
